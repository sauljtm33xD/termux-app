package com.uru.domain.autonomy

import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.util.*
import kotlin.math.ceil

class ContextEngineImpl(
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default + SupervisorJob())
) : IContextEngine {

    private val scopes = mutableMapOf<String, ContextScope>()
    private val watchers = mutableMapOf<String, Pair<String, ContextWatcher>>()
    private val scopeMutex = Mutex()
    private val watcherMutex = Mutex()

    private var cleanupJob: Job? = null

    override fun createScope(
        name: String,
        parentScopeId: String?,
        initialData: Map<String, Any>?
    ): ContextScope {
        val scope = ContextScope(
            id = "scope_${UUID.randomUUID()}",
            name = name,
            parentScopeId = parentScopeId,
            variables = (initialData ?: emptyMap()).toMutableMap(),
            memorySlots = mutableMapOf(),
            metadata = ScopeMetadata()
        )

        scopes[scope.id] = scope
        startCleanupIfNeeded()
        return scope
    }

    override suspend fun <T> get(path: String, scopeId: String?): T? {
        scopeMutex.withLock {
            val targetScopeId = scopeId ?: scopes.keys.firstOrNull() ?: return null
            val scope = scopes[targetScopeId] ?: return null

            return resolveValue(path, scope)
        }
    }

    override suspend fun set(path: String, value: Any, scopeId: String?) {
        scopeMutex.withLock {
            val targetScopeId = scopeId ?: scopes.keys.firstOrNull() ?: return
            val scope = scopes[targetScopeId] ?: return

            val keys = path.split(".")
            setNestedValue(scope.variables as MutableMap<String, Any>, keys, value)

            notifyWatchers(ContextDiff(targetScopeId, path, null, value))
        }
    }

    override suspend fun patch(path: String, value: Any, scopeId: String?) {
        scopeMutex.withLock {
            val targetScopeId = scopeId ?: scopes.keys.firstOrNull() ?: return
            val scope = scopes[targetScopeId] ?: return

            val oldValue = resolveValue<Any>(path, scope)
            val keys = path.split(".")
            setNestedValue(scope.variables as MutableMap<String, Any>, keys, value)

            notifyWatchers(ContextDiff(targetScopeId, path, oldValue, value))
        }
    }

    override suspend fun delete(path: String, scopeId: String?) {
        scopeMutex.withLock {
            val targetScopeId = scopeId ?: scopes.keys.firstOrNull() ?: return
            val scope = scopes[targetScopeId] ?: return

            val keys = path.split(".")
            deleteNestedValue(scope.variables as MutableMap<String, Any>, keys)

            notifyWatchers(ContextDiff(targetScopeId, path, null, null))
        }
    }

    override suspend fun has(path: String, scopeId: String?): Boolean {
        scopeMutex.withLock {
            val targetScopeId = scopeId ?: scopes.keys.firstOrNull() ?: return false
            val scope = scopes[targetScopeId] ?: return false

            return resolveValue<Any>(path, scope) != null
        }
    }

    override suspend fun storeMemorySlot(slot: MemorySlot, scopeId: String?) {
        scopeMutex.withLock {
            val targetScopeId = scopeId ?: scopes.keys.firstOrNull() ?: return
            val scope = scopes[targetScopeId] ?: return

            scope.memorySlots = (scope.memorySlots as MutableMap<String, MemorySlot>).apply {
                this[slot.key] = slot
            }
        }
    }

    override suspend fun getMemorySlot(key: String, scopeId: String?): MemorySlot? {
        scopeMutex.withLock {
            val targetScopeId = scopeId ?: scopes.keys.firstOrNull() ?: return null
            val scope = scopes[targetScopeId] ?: return null

            val slot = scope.memorySlots[key]
            if (slot != null && slot.ttlMs != null) {
                val elapsed = System.currentTimeMillis() - slot.createdAt
                if (elapsed > slot.ttlMs!!) {
                    (scope.memorySlots as MutableMap<String, MemorySlot>).remove(key)
                    return null
                }
            }

            return slot?.copy(
                lastAccessed = System.currentTimeMillis(),
                accessCount = slot.accessCount + 1
            )?.also {
                (scope.memorySlots as MutableMap<String, MemorySlot>)[key] = it
            }
        }
    }

    override suspend fun aggregateContextForAI(
        scopeId: String?,
        tokenBudget: Int
    ): AggregatedAIContext {
        scopeMutex.withLock {
            val targetScopeIds = if (scopeId != null) {
                listOf(scopeId)
            } else {
                scopes.keys.toList()
            }

            val markdown = StringBuilder()
            val scopeBreakdown = mutableMapOf<String, Int>()

            for (sid in targetScopeIds) {
                val scope = scopes[sid] ?: continue

                markdown.append("## Scope: ${scope.name}\n")
                markdown.append("**ID**: ${scope.id}\n")

                if (!scope.variables.isEmpty()) {
                    markdown.append("\n### Variables\n")
                    scope.variables.forEach { (k, v) ->
                        markdown.append("- `$k`: ${v.toString().take(100)}\n")
                    }
                }

                if (!scope.memorySlots.isEmpty()) {
                    markdown.append("\n### Memory Slots\n")
                    scope.memorySlots.forEach { (k, slot) ->
                        markdown.append("- `${slot.key}` (importance: ${slot.importance}/10, accesses: ${slot.accessCount})\n")
                    }
                }

                markdown.append("\n")

                val content = markdown.toString()
                val estimatedTokens = ceil(content.length / 4.0).toInt()
                scopeBreakdown[sid] = estimatedTokens
            }

            val totalTokens = scopeBreakdown.values.sum()
            val estimatedTokens = if (totalTokens > tokenBudget) {
                tokenBudget
            } else {
                totalTokens
            }

            return AggregatedAIContext(
                markdown = markdown.toString().take(tokenBudget * 4),
                estimatedTokens = estimatedTokens,
                scopeBreakdown = scopeBreakdown
            )
        }
    }

    override suspend fun <T> transaction(
        scopeId: String?,
        block: suspend (tx: IContextEngine) -> T
    ): T {
        scopeMutex.withLock {
            val targetScopeId = scopeId ?: scopes.keys.firstOrNull() ?: throw IllegalStateException("No scope available")
            val originalScope = scopes[targetScopeId] ?: throw IllegalStateException("Scope not found")

            val snapshot = originalScope.copy(
                variables = originalScope.variables.toMutableMap(),
                memorySlots = originalScope.memorySlots.toMutableMap()
            )

            return try {
                block(this)
            } catch (e: Exception) {
                scopes[targetScopeId] = snapshot
                throw e
            }
        }
    }

    override fun watchContext(pattern: String, callback: ContextWatcher): String {
        val watcherId = "watch_${UUID.randomUUID()}"
        watchers[watcherId] = pattern to callback
        return watcherId
    }

    override fun unwatchContext(watcherId: String) {
        watchers.remove(watcherId)
    }

    private suspend fun notifyWatchers(diff: ContextDiff) {
        watcherMutex.withLock {
            watchers.forEach { (_, pair) ->
                val (pattern, callback) = pair
                if (matchesPattern(diff.path, pattern)) {
                    scope.launch {
                        try {
                            callback.onContextChange(diff)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                    }
                }
            }
        }
    }

    private fun matchesPattern(path: String, pattern: String): Boolean {
        if (pattern == "*") return true
        if (pattern == path) return true

        val patternParts = pattern.split(".")
        val pathParts = path.split(".")

        return patternParts.indices.all { i ->
            if (i >= pathParts.size) return@all false
            val part = patternParts[i]
            part == "*" || part == pathParts[i]
        } && patternParts.size == pathParts.size
    }

    @Suppress("UNCHECKED_CAST")
    private fun <T> resolveValue(path: String, scope: ContextScope): T? {
        val keys = path.split(".")
        var current: Any? = scope.variables

        for (key in keys) {
            if (current is Map<*, *>) {
                current = current[key]
            } else {
                return null
            }
        }

        return current as? T
    }

    private fun setNestedValue(map: MutableMap<String, Any>, keys: List<String>, value: Any) {
        if (keys.isEmpty()) return

        var current: Any? = map
        for (i in 0 until keys.size - 1) {
            val key = keys[i]
            val next = (current as? MutableMap<String, Any>)?.getOrPut(key) {
                mutableMapOf<String, Any>()
            }
            current = next
        }

        (current as? MutableMap<String, Any>)?.put(keys.last(), value)
    }

    private fun deleteNestedValue(map: MutableMap<String, Any>, keys: List<String>) {
        if (keys.isEmpty()) return

        var current: Any? = map
        for (i in 0 until keys.size - 1) {
            val key = keys[i]
            current = (current as? Map<String, Any>)?.get(key)
        }

        (current as? MutableMap<String, Any>)?.remove(keys.last())
    }

    private fun startCleanupIfNeeded() {
        if (cleanupJob == null || cleanupJob?.isActive == false) {
            cleanupJob = scope.launch {
                while (isActive) {
                    delay(5000)
                    cleanupExpiredMemorySlots()
                }
            }
        }
    }

    private suspend fun cleanupExpiredMemorySlots() {
        scopeMutex.withLock {
            val now = System.currentTimeMillis()
            scopes.forEach { (_, scope) ->
                val expired = scope.memorySlots.filter { (_, slot) ->
                    slot.ttlMs != null && (now - slot.createdAt) > slot.ttlMs!!
                }
                expired.forEach { (key, _) ->
                    (scope.memorySlots as MutableMap<String, MemorySlot>).remove(key)
                }
            }
        }
    }

    suspend fun shutdown() {
        cleanupJob?.cancel()
        scope.cancel()
    }
}
