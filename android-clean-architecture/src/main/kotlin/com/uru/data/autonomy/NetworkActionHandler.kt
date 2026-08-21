package com.uru.data.autonomy

import com.uru.data.services.AccessPointScanService
import com.uru.domain.autonomy.Action
import com.uru.domain.autonomy.ActionExecutionContext
import com.uru.domain.autonomy.ActionExecutionResult
import com.uru.domain.autonomy.ActionType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class NetworkActionHandler(
    private val scanService: AccessPointScanService,
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) {

    suspend fun handleNetworkAction(
        action: Action,
        context: ActionExecutionContext
    ): ActionExecutionResult {
        return try {
            val startTime = System.currentTimeMillis()

            when (action.target) {
                "network.scan_accesspoints" -> {
                    scanService.scanAndPublishAccessPoints()
                    ActionExecutionResult(
                        actionId = "${action.hashCode()}",
                        actionType = ActionType.EMIT_EVENT,
                        success = true,
                        executionTimeMs = System.currentTimeMillis() - startTime
                    )
                }

                "network.get_connected" -> {
                    scanService.getConnectedAccessPoint()
                    ActionExecutionResult(
                        actionId = "${action.hashCode()}",
                        actionType = ActionType.EMIT_EVENT,
                        success = true,
                        executionTimeMs = System.currentTimeMillis() - startTime
                    )
                }

                "network.check_availability" -> {
                    scanService.checkNetworkAvailability()
                    ActionExecutionResult(
                        actionId = "${action.hashCode()}",
                        actionType = ActionType.EMIT_EVENT,
                        success = true,
                        executionTimeMs = System.currentTimeMillis() - startTime
                    )
                }

                "network.observe_changes" -> {
                    scanService.observeNetworkChanges()
                    ActionExecutionResult(
                        actionId = "${action.hashCode()}",
                        actionType = ActionType.EMIT_EVENT,
                        success = true,
                        result = "Network change observer started",
                        executionTimeMs = System.currentTimeMillis() - startTime
                    )
                }

                else -> {
                    ActionExecutionResult(
                        actionId = "${action.hashCode()}",
                        actionType = ActionType.EMIT_EVENT,
                        success = false,
                        error = "Unknown network action target: ${action.target}",
                        executionTimeMs = System.currentTimeMillis() - startTime
                    )
                }
            }
        } catch (e: Exception) {
            ActionExecutionResult(
                actionId = "${action.hashCode()}",
                actionType = ActionType.EMIT_EVENT,
                success = false,
                error = "Network action failed: ${e.message}",
                executionTimeMs = System.currentTimeMillis()
            )
        }
    }
}
