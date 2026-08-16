package com.uru.domain.autonomy

interface MemoryEngine {
    suspend fun storeShortTerm(key: String, value: Any, ttlMillis: Long = 300000) // 5 min default
    suspend fun getShortTerm(key: String): Any?
    suspend fun storeLongTerm(key: String, value: Any)
    suspend fun getLongTerm(key: String): Any?
    suspend fun clearShortTerm()
    suspend fun clearLongTerm()
    suspend fun getShortTermMemory(): Map<String, MemoryEntry>
    suspend fun getLongTermMemory(): Map<String, MemoryEntry>
}

data class MemoryEntry(
    val key: String,
    val value: Any,
    val createdAt: Long = System.currentTimeMillis(),
    val expiresAt: Long? = null,
    val accessCount: Int = 0,
    val lastAccessed: Long = System.currentTimeMillis()
)
