package com.autonomy.engine.data

import com.autonomy.engine.domain.*
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.CopyOnWriteArrayList
import java.util.regex.Pattern

/**
 * Thread-safe hierarchical ContextEngine with memory TTL, deep paths,
 * rollback transactions, and AI context aggregation.
 */
class ContextEngineImpl : ContextEngine {

    private val scopes = ConcurrentHashMap<String, ContextScope>()
    private val watchers = ConcurrentHashMap<String, WatcherEntry>()
    private val diffHistory = CopyOnWriteArrayList<ContextDiff>()
    private val rootScopeId = "global"

    init {
        // Initialize Root Global Scope
        val globalScope = ContextScope(
            id = rootScopeId,
            name = "Global System Scope",
            metadata = ContextScopeMetadata(owner = "system", description = "Root system scope")
        )
        scopes[rootScopeId] = globalScope
    }

    override fun createScope(name: String, parentScopeId: String?, initialData: Map<String, Any?>): ContextScope {
        val parent = parentScopeId ?: rootScopeId
        val newScope = ContextScope(
            name = name,
            parentScopeId = parent,
            metadata = ContextScopeMetadata(description = "Scope for $name")
        )
        initialData.forEach { (k, v) ->
            newScope.variables[k] = v
        }
        scopes[newScope.id] = newScope

        recordDiff(
            ContextDiff(
                scopeId = newScope.id,
                path = "$",
                oldValue = null,
                newValue = initialData,
                operation = ContextOperation.CREATE_SCOPE
            )
        )
        return newScope
    }

    override fun getScope(scopeId: String): ContextScope? = scopes[scopeId]

    override fun getAllScopes(): List<ContextScope> = scopes.values.toList()

    override fun deleteScope(scopeId: String): Boolean {
        if (scopeId == rootScopeId) return false // Cannot delete root
        val removed = scopes.remove(scopeId) != null
        if (removed) {
            recordDiff(
                ContextDiff(
                    scopeId = scopeId,
                    path = "$",
                    oldValue = null,
                    newValue = null,
                    operation = ContextOperation.DELETE_SCOPE
                )
            )
        }
        return removed
    }

    @Suppress("UNCHECKED_CAST")
    override fun <T> get(path: String, scopeId: String?): T? {
        val targetScopeId = scopeId ?: rootScopeId
        val scope = scopes[targetScopeId] ?: return null

        val localValue = getNestedValue(scope.variables, path)
        if (localValue != null) {
            return localValue as? T
        }

        // Inherit recursively from parent scope
        scope.parentScopeId?.let { parentId ->
            return get(path, parentId)
        }

        return null
    }

    override fun <T> set(path: String, value: T, scopeId: String?, sourceEventId: String?) {
        val targetScopeId = scopeId ?: rootScopeId
        val scope = scopes[targetScopeId] ?: return

        val oldValue = getNestedValue(scope.variables, path)
        setNestedValue(scope.variables, path, value)
        scope.metadata = scope.metadata.copy(
            updatedAt = System.currentTimeMillis(),
            version = scope.metadata.version + 1
        )

        val diff = ContextDiff(
            scopeId = targetScopeId,
            path = path,
            oldValue = oldValue,
            newValue = value,
            operation = ContextOperation.SET,
            sourceEventId = sourceEventId
        )
        recordDiff(diff)
        notifyWatchers(diff, scope)
    }

    @Suppress("UNCHECKED_CAST")
    override fun patch(path: String, partialValue: Map<String, Any?>, scopeId: String?, sourceEventId: String?) {
        val targetScopeId = scopeId ?: rootScopeId
        val scope = scopes[targetScopeId] ?: return

        val current = getNestedValue(scope.variables, path) as? Map<String, Any?> ?: emptyMap()
        val merged = current.toMutableMap().apply { putAll(partialValue) }
        setNestedValue(scope.variables, path, merged)

        val diff = ContextDiff(
            scopeId = targetScopeId,
            path = path,
            oldValue = current,
            newValue = merged,
            operation = ContextOperation.PATCH,
            sourceEventId = sourceEventId
        )
        recordDiff(diff)
        notifyWatchers(diff, scope)
    }

    override fun delete(path: String, scopeId: String?): Boolean {
        val targetScopeId = scopeId ?: rootScopeId
        val scope = scopes[targetScopeId] ?: return false

        val oldValue = getNestedValue(scope.variables, path) ?: return false
        val removed = deleteNestedValue(scope.variables, path)
        if (removed) {
            val diff = ContextDiff(
                scopeId = targetScopeId,
                path = path,
                oldValue = oldValue,
                newValue = null,
                operation = ContextOperation.DELETE
            )
            recordDiff(diff)
            notifyWatchers(diff, scope)
        }
        return removed
    }

    override fun watch(pathPattern: String, scopeId: String?, callback: ContextWatcher): () -> Unit {
        val entry = WatcherEntry(
            id = java.util.UUID.randomUUID().toString(),
            pathPattern = pathPattern,
            scopeId = scopeId,
            callback = callback
        )
        watchers[entry.id] = entry
        return { watchers.remove(entry.id) }
    }

    override fun setMemorySlot(
        key: String,
        value: Any?,
        scopeId: String?,
        importance: Int,
        tags: List<String>,
        ttlMs: Long?,
        summary: String?,
        sourceEventId: String?
    ): MemorySlot {
        val targetScopeId = scopeId ?: rootScopeId
        val scope = scopes[targetScopeId] ?: scopes[rootScopeId]!!

        val expiresAt = ttlMs?.let { System.currentTimeMillis() + it }
        val slot = MemorySlot(
            key = key,
            value = value,
            importance = importance.coerceIn(1, 10),
            tags = tags,
            expiresAt = expiresAt,
            summary = summary,
            sourceEventId = sourceEventId
        )
        scope.memorySlots[key] = slot
        return slot
    }

    override fun getMemorySlots(scopeId: String?, minImportance: Int): List<MemorySlot> {
        val targetScopeId = scopeId ?: rootScopeId
        val scope = scopes[targetScopeId] ?: return emptyList()

        // Clean expired slots
        val now = System.currentTimeMillis()
        val validSlots = mutableListOf<MemorySlot>()
        scope.memorySlots.entries.removeIf { (_, slot) ->
            if (slot.expiresAt != null && slot.expiresAt < now) {
                true
            } else {
                if (slot.importance >= minImportance) {
                    validSlots.add(slot)
                }
                false
            }
        }
        return validSlots.sortedByDescending { it.importance }
    }

    override fun deleteMemorySlot(key: String, scopeId: String?): Boolean {
        val targetScopeId = scopeId ?: rootScopeId
        val scope = scopes[targetScopeId] ?: return false
        return scope.memorySlots.remove(key) != null
    }

    override fun getSnapshot(scopeId: String?): Map<String, Any?> {
        val targetScopeId = scopeId ?: rootScopeId
        val scope = scopes[targetScopeId] ?: return emptyMap()
        return deepCopyMap(scope.variables)
    }

    override fun restoreSnapshot(snapshot: Map<String, Any?>, scopeId: String?) {
        val targetScopeId = scopeId ?: rootScopeId
        val scope = scopes[targetScopeId] ?: return
        scope.variables.clear()
        snapshot.forEach { (k, v) -> scope.variables[k] = v }
    }

    override fun getDiffHistory(limit: Int): List<ContextDiff> {
        return diffHistory.takeLast(limit)
    }

    override fun aggregateContextForAI(config: TokenBudgetConfig, scopeId: String?): AggregatedAIContext {
        val targetScopeId = scopeId ?: rootScopeId
        val hierarchy = mutableListOf<String>()
        var curr: ContextScope? = scopes[targetScopeId]

        val aggregatedVars = mutableMapOf<String, Any?>()
        while (curr != null) {
            hierarchy.add(0, curr.name)
            // Lower scopes override parent vars
            curr.variables.forEach { (k, v) ->
                if (!aggregatedVars.containsKey(k)) {
                    aggregatedVars[k] = v
                }
            }
            curr = curr.parentScopeId?.let { scopes[it] }
        }

        val validMemories = getMemorySlots(targetScopeId, config.minImportanceThreshold)

        val sb = StringBuilder()
        sb.appendLine("### ACTIVE CONTEXT SCOPE HIERARCHY")
        sb.appendLine("Path: ${hierarchy.joinToString(" -> ")}")
        sb.appendLine("\n### CONTEXT VARIABLES:")
        aggregatedVars.forEach { (k, v) ->
            sb.appendLine("- **$k**: $v")
        }

        if (config.includeMemorySlots && validMemories.isNotEmpty()) {
            sb.appendLine("\n### WORKING MEMORY (Prioritized by Importance):")
            validMemories.forEach { mem ->
                sb.appendLine("- [Imp: ${mem.importance}/10] **${mem.key}**: ${mem.value} (Tags: ${mem.tags.joinToString()})")
            }
        }

        val promptAddition = sb.toString()
        val estimatedTokens = (promptAddition.length / 4) + config.reservedSystemTokens

        return AggregatedAIContext(
            systemPromptAddition = promptAddition,
            structuredContext = aggregatedVars,
            relevantMemories = validMemories,
            estimatedTokens = estimatedTokens,
            scopeHierarchy = hierarchy
        )
    }

    override fun <R> transaction(scopeId: String?, block: (ContextEngine) -> R): R {
        val targetScopeId = scopeId ?: rootScopeId
        val backupSnapshot = getSnapshot(targetScopeId)
        return try {
            block(this)
        } catch (e: Exception) {
            restoreSnapshot(backupSnapshot, targetScopeId)
            throw e
        }
    }

    override fun reset() {
        scopes.clear()
        watchers.clear()
        diffHistory.clear()
        scopes[rootScopeId] = ContextScope(
            id = rootScopeId,
            name = "Global System Scope",
            metadata = ContextScopeMetadata(owner = "system", description = "Root system scope")
        )
    }

    private fun recordDiff(diff: ContextDiff) {
        diffHistory.add(diff)
        if (diffHistory.size > 200) {
            diffHistory.removeAt(0)
        }
    }

    private fun notifyWatchers(diff: ContextDiff, scope: ContextScope) {
        watchers.values.forEach { watcher ->
            if (watcher.scopeId == null || watcher.scopeId == diff.scopeId) {
                if (matchesPathPattern(watcher.pathPattern, diff.path)) {
                    try {
                        watcher.callback(diff, scope)
                    } catch (_: Exception) {}
                }
            }
        }
    }

    private fun matchesPathPattern(pattern: String, path: String): Boolean {
        if (pattern == "*" || pattern == "**" || pattern == path) return true
        val regex = pattern.replace(".", "\\.").replace("*", "[^.]+")
        return Pattern.compile("^$regex$").matcher(path).matches()
    }

    @Suppress("UNCHECKED_CAST")
    private fun getNestedValue(map: Map<String, Any?>, path: String): Any? {
        val parts = path.split(".")
        var current: Any? = map
        for (part in parts) {
            if (current !is Map<*, *>) return null
            current = (current as Map<String, Any?>)[part]
        }
        return current
    }

    @Suppress("UNCHECKED_CAST")
    private fun setNestedValue(map: ConcurrentHashMap<String, Any?>, path: String, value: Any?) {
        val parts = path.split(".")
        if (parts.size == 1) {
            if (value != null) map[parts[0]] = value else map.remove(parts[0])
            return
        }

        var current: MutableMap<String, Any?> = map
        for (i in 0 until parts.size - 1) {
            val part = parts[i]
            val next = current[part]
            if (next !is MutableMap<*, *>) {
                val newMap = ConcurrentHashMap<String, Any?>()
                current[part] = newMap
                current = newMap
            } else {
                current = next as MutableMap<String, Any?>
            }
        }
        val lastPart = parts.last()
        if (value != null) current[lastPart] = value else current.remove(lastPart)
    }

    @Suppress("UNCHECKED_CAST")
    private fun deleteNestedValue(map: MutableMap<String, Any?>, path: String): Boolean {
        val parts = path.split(".")
        if (parts.size == 1) {
            return map.remove(parts[0]) != null
        }
        var current: Any? = map
        for (i in 0 until parts.size - 1) {
            if (current !is Map<*, *>) return false
            current = (current as Map<String, Any?>)[parts[i]]
        }
        return (current as? MutableMap<String, Any?>)?.remove(parts.last()) != null
    }

    @Suppress("UNCHECKED_CAST")
    private fun deepCopyMap(original: Map<String, Any?>): Map<String, Any?> {
        val copy = mutableMapOf<String, Any?>()
        for ((k, v) in original) {
            copy[k] = when (v) {
                is Map<*, *> -> deepCopyMap(v as Map<String, Any?>)
                is List<*> -> v.toList()
                else -> v
            }
        }
        return copy
    }

    private data class WatcherEntry(
        val id: String,
        val pathPattern: String,
        val scopeId: String?,
        val callback: ContextWatcher
    )
}
