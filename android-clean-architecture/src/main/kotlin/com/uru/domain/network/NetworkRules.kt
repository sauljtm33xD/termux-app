package com.uru.domain.network

import com.uru.domain.autonomy.Action
import com.uru.domain.autonomy.ActionType
import com.uru.domain.autonomy.Condition
import com.uru.domain.autonomy.Rule

object NetworkRules {

    fun createAccessPointScanRule(): Rule {
        return Rule(
            id = "rule_scan_accesspoints",
            name = "Scan Available Access Points",
            triggerTopicPattern = "network.scan.request",
            condition = Condition.Simple(com.uru.domain.autonomy.Predicate(
                path = "payload.request_type",
                com.uru.domain.autonomy.ComparisonOperator.EQ,
                "scan_wifi"
            )),
            actions = listOf(
                Action(
                    type = ActionType.EMIT_EVENT,
                    target = "network.scan_accesspoints",
                    payload = mapOf("action" to "scan_accesspoints")
                )
            ),
            priority = 7
        )
    }

    fun createConnectedAccessPointRule(): Rule {
        return Rule(
            id = "rule_get_connected_ap",
            name = "Get Connected Access Point",
            triggerTopicPattern = "network.query.connected",
            condition = Condition.Simple(com.uru.domain.autonomy.Predicate(
                path = "payload.query_type",
                com.uru.domain.autonomy.ComparisonOperator.EQ,
                "connected_ap"
            )),
            actions = listOf(
                Action(
                    type = ActionType.EMIT_EVENT,
                    target = "network.get_connected",
                    payload = mapOf("action" to "get_connected")
                )
            ),
            priority = 7
        )
    }

    fun createNetworkAvailabilityRule(): Rule {
        return Rule(
            id = "rule_check_availability",
            name = "Check Network Availability",
            triggerTopicPattern = "network.check.availability",
            condition = Condition.Simple(com.uru.domain.autonomy.Predicate(
                path = "payload.check_type",
                com.uru.domain.autonomy.ComparisonOperator.EQ,
                "internet"
            )),
            actions = listOf(
                Action(
                    type = ActionType.EMIT_EVENT,
                    target = "network.check_availability",
                    payload = mapOf("action" to "check_availability")
                )
            ),
            priority = 8
        )
    }

    fun createAccessPointQualityCheckRule(): Rule {
        return Rule(
            id = "rule_ap_quality_check",
            name = "Alert on Poor Signal Quality",
            triggerTopicPattern = "network.accesspoint.connected",
            condition = Condition.Simple(com.uru.domain.autonomy.Predicate(
                path = "payload.level",
                com.uru.domain.autonomy.ComparisonOperator.LT,
                -80  // dBm threshold for poor signal
            )),
            actions = listOf(
                Action(
                    type = ActionType.EMIT_EVENT,
                    target = "network.quality.alert",
                    payload = mapOf("severity" to "warning", "message" to "Poor WiFi signal quality")
                )
            ),
            priority = 6
        )
    }
}
