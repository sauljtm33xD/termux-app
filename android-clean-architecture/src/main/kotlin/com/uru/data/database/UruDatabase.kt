package com.uru.data.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

/**
 * URU Data Layer - Room ORM Database (Encrypted SQLite storage).
 */

@Entity(tableName = "messages")
data class MessageDbEntity(
    @PrimaryKey val id: String,
    val sender: String,
    val content: String,
    val timestamp: Long,
    val riskLevel: String,
    val emotionState: String
)

@Dao
interface ChatDao {
    @Query("SELECT * FROM messages ORDER BY timestamp ASC")
    fun getAllMessages(): Flow<List<MessageDbEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: MessageDbEntity)

    @Query("DELETE FROM messages")
    suspend fun clearAll()
}

@Entity(tableName = "audit_records")
data class AuditDbEntity(
    @PrimaryKey val id: String,
    val timestamp: Long,
    val eventId: String,
    val topic: String,
    val action: String,
    val riskLevel: String,
    val decision: String,
    val previousStateHash: String,
    val newStateHash: String,
    val signatureSha256: String
)

@Dao
interface AuditDao {
    @Query("SELECT * FROM audit_records ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentAuditRecords(limit: Int): Flow<List<AuditDbEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAuditRecord(record: AuditDbEntity)

    @Query("SELECT COUNT(*) FROM audit_records")
    suspend fun count(): Long
}

@Database(entities = [MessageDbEntity::class, AuditDbEntity::class], version = 1, exportSchema = false)
abstract class UruDatabase : RoomDatabase() {
    abstract fun chatDao(): ChatDao
    abstract fun auditDao(): AuditDao
}
