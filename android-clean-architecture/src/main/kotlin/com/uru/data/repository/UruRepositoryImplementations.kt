package com.uru.data.repository

import com.uru.data.database.AuditDao
import com.uru.data.database.AuditDbEntity
import com.uru.data.database.ChatDao
import com.uru.data.database.MessageDbEntity
import com.uru.domain.autonomy.AuditRecord
import com.uru.domain.autonomy.EngineMetrics
import com.uru.domain.autonomy.IEventEngine
import com.uru.domain.autonomy.RiskLevel
import com.uru.domain.autonomy.UruEmotionState
import com.uru.domain.entity.MessageEntity
import com.uru.domain.entity.MessageSender
import com.uru.domain.entity.SecurityPolicyEntity
import com.uru.domain.repository.AuditRepository
import com.uru.domain.repository.AutonomyRepository
import com.uru.domain.repository.ChatRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * URU Data Layer - Repository Implementations.
 */

class ChatRepositoryImpl(
    private val chatDao: ChatDao
) : ChatRepository {

    override fun getMessagesStream(): Flow<List<MessageEntity>> {
        return chatDao.getAllMessages().map { dbList ->
            dbList.map { db ->
                MessageEntity(
                    id = db.id,
                    sender = try { MessageSender.valueOf(db.sender) } catch (_: Exception) { MessageSender.URU },
                    content = db.content,
                    timestamp = db.timestamp,
                    riskLevel = try { RiskLevel.valueOf(db.riskLevel) } catch (_: Exception) { RiskLevel.MINIMAL },
                    emotionState = try { UruEmotionState.valueOf(db.emotionState) } catch (_: Exception) { UruEmotionState.NORMAL }
                )
            }
        }
    }

    override suspend fun sendMessage(message: MessageEntity) {
        chatDao.insertMessage(
            MessageDbEntity(
                id = message.id,
                sender = message.sender.name,
                content = message.content,
                timestamp = message.timestamp,
                riskLevel = message.riskLevel.name,
                emotionState = message.emotionState.name
            )
        )
    }

    override suspend fun clearHistory() {
        chatDao.clearAll()
    }
}

class AutonomyRepositoryImpl(
    private val eventEngine: IEventEngine
) : AutonomyRepository {

    private val policies = mutableListOf(
        SecurityPolicyEntity(name = "Zero-Cloud Exfiltration", description = "Bloquea cualquier socket que intente enviar telemetría sin permiso"),
        SecurityPolicyEntity(name = "AEGIS Sandbox Boundary", description = "Verifica firmas SHA-256 en cada mutación de contexto")
    )

    override fun observeMetrics(): Flow<EngineMetrics> = eventEngine.metricsFlow

    override suspend fun getActivePolicies(): List<SecurityPolicyEntity> = policies.toList()

    override suspend fun savePolicy(policy: SecurityPolicyEntity) {
        policies.add(policy)
    }
}

class AuditRepositoryImpl(
    private val auditDao: AuditDao
) : AuditRepository {

    override fun observeAuditRecords(): Flow<List<AuditRecord>> {
        return auditDao.getRecentAuditRecords(100).map { list ->
            list.map { db ->
                AuditRecord(
                    id = db.id,
                    timestamp = db.timestamp,
                    eventId = db.eventId,
                    topic = db.topic,
                    action = db.action,
                    riskLevel = try { RiskLevel.valueOf(db.riskLevel) } catch (_: Exception) { RiskLevel.MINIMAL },
                    decision = db.decision,
                    previousStateHash = db.previousStateHash,
                    newStateHash = db.newStateHash,
                    signatureSha256 = db.signatureSha256
                )
            }
        }
    }

    override suspend fun recordAuditEntry(entry: AuditRecord) {
        auditDao.insertAuditRecord(
            AuditDbEntity(
                id = entry.id,
                timestamp = entry.timestamp,
                eventId = entry.eventId,
                topic = entry.topic,
                action = entry.action,
                riskLevel = entry.riskLevel.name,
                decision = entry.decision,
                previousStateHash = entry.previousStateHash,
                newStateHash = entry.newStateHash,
                signatureSha256 = entry.signatureSha256
            )
        )
    }

    override suspend fun getAuditHistory(limit: Int): List<AuditRecord> = emptyList()
}
