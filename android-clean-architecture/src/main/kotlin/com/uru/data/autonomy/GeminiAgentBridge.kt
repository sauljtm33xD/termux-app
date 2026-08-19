package com.autonomy.engine.data

import com.autonomy.engine.domain.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/**
 * Interface with Google Generative AI (Gemini 3.7 / 2.5 Flash) on Android.
 */
class GeminiAgentBridge(
    private val apiKey: String,
    private val eventEngine: EventEngine,
    private val contextEngine: ContextEngine,
    private val modelName: String = "gemini-2.5-flash"
) {

    /**
     * Synthesize realistic event stream for autonomous simulation.
     */
    suspend fun synthesizeEvents(domain: String, count: Int = 5): List<EngineEvent<Map<String, Any?>>> = withContext(Dispatchers.IO) {
        val prompt = """
            You are an autonomous IoT & Cloud event simulator.
            Generate a JSON array of $count realistic domain events for the domain: '$domain'.
            Return ONLY raw JSON with structure:
            [
              {
                "topic": "sensor.temperature.high",
                "priority": "HIGH",
                "payload": { "sensorId": "SN-901", "value": 88.5, "unit": "CELSIUS" },
                "tags": ["telemetry", "alert"]
              }
            ]
        """.trimIndent()

        val responseText = callGeminiApi(prompt)
        val jsonArray = parseJsonArray(responseText)
        val synthesized = mutableListOf<EngineEvent<Map<String, Any?>>>()

        for (i in 0 until jsonArray.length()) {
            val obj = jsonArray.getJSONObject(i)
            val topic = obj.getString("topic")
            val priorityStr = obj.optString("priority", "NORMAL")
            val priority = try { EventPriority.valueOf(priorityStr) } catch (_: Exception) { EventPriority.NORMAL }
            val payloadObj = obj.getJSONObject("payload")
            val payloadMap = jsonObjectToMap(payloadObj)
            val tagsList = mutableListOf<String>()
            val tagsArr = obj.optJSONArray("tags")
            if (tagsArr != null) {
                for (t in 0 until tagsArr.length()) tagsList.add(tagsArr.getString(t))
            }

            val event = EngineEvent(
                topic = topic,
                payload = payloadMap,
                metadata = EventMetadata(
                    priority = priority,
                    source = "gemini.synthesizer",
                    tags = tagsList
                )
            )
            synthesized.add(event)
        }
        synthesized
    }

    /**
     * Translate natural language into a structured reactive rule.
     */
    suspend fun generateRule(naturalLanguagePrompt: String): Rule = withContext(Dispatchers.IO) {
        val systemPrompt = """
            Convert the following natural language automation requirement into a valid Reactive Rule JSON.
            Input: "$naturalLanguagePrompt"
            
            Return JSON only with format:
            {
              "name": "Rule Name",
              "description": "Rule Description",
              "triggerTopicPattern": "order.*",
              "conditionLogic": "AND",
              "conditions": [
                { "field": "payload.amount", "operator": "GT", "value": 1000 }
              ],
              "actions": [
                { "type": "EMIT_EVENT", "targetTopic": "alert.high_value", "payloadTemplate": { "risk": "CRITICAL" } }
              ]
            }
        """.trimIndent()

        val responseText = callGeminiApi(systemPrompt)
        val json = parseJsonObject(responseText)

        val conditions = mutableListOf<RuleCondition>()
        val condsArr = json.optJSONArray("conditions") ?: JSONArray()
        for (i in 0 until condsArr.length()) {
            val c = condsArr.getJSONObject(i)
            val op = try {
                ConditionOperator.valueOf(c.getString("operator").uppercase())
            } catch (_: Exception) {
                ConditionOperator.EQ
            }
            conditions.add(
                RuleCondition(
                    field = c.getString("field"),
                    operator = op,
                    value = c.opt("value")
                )
            )
        }

        val actions = mutableListOf<RuleAction>()
        val actsArr = json.optJSONArray("actions") ?: JSONArray()
        for (i in 0 until actsArr.length()) {
            val a = actsArr.getJSONObject(i)
            val type = try {
                ActionType.valueOf(a.getString("type").uppercase())
            } catch (_: Exception) {
                ActionType.LOG
            }
            actions.add(
                RuleAction(
                    type = type,
                    targetTopic = a.optString("targetTopic").takeIf { it.isNotBlank() },
                    payloadTemplate = a.optJSONObject("payloadTemplate")?.let { jsonObjectToMap(it) },
                    contextPath = a.optString("contextPath").takeIf { it.isNotBlank() },
                    valueTemplate = a.opt("valueTemplate")
                )
            )
        }

        Rule(
            name = json.optString("name", "AI Generated Rule"),
            description = json.optString("description", naturalLanguagePrompt),
            triggerTopicPattern = json.optString("triggerTopicPattern", "*"),
            conditionLogic = if (json.optString("conditionLogic") == "OR") ConditionLogic.OR else ConditionLogic.AND,
            conditions = conditions,
            actions = actions
        )
    }

    /**
     * Autonomous cognitive reasoning loop over active hierarchical context.
     */
    suspend fun agentReason(goalPrompt: String): String = withContext(Dispatchers.IO) {
        val aggregated = contextEngine.aggregateContextForAI(
            TokenBudgetConfig(minImportanceThreshold = 4, maxTokens = 1500)
        )

        val cognitivePrompt = """
            You are an autonomous Android embedded agent.
            Goal: $goalPrompt

            $aggregated.systemPromptAddition

            Analyze the current state and return your reasoning and next planned action.
        """.trimIndent()

        callGeminiApi(cognitivePrompt)
    }

    private fun callGeminiApi(prompt: String): String {
        // In Android with com.google.ai.client.generativeai, we would invoke:
        // val generativeModel = GenerativeModel(modelName = modelName, apiKey = apiKey)
        // return generativeModel.generateContent(prompt).text ?: ""
        return """
            [
              {
                "topic": "security.device.unlocked",
                "priority": "HIGH",
                "payload": { "userId": "usr_99", "method": "BIOMETRIC_FACE", "confidence": 0.99 },
                "tags": ["auth", "security"]
              },
              {
                "topic": "network.connectivity.changed",
                "priority": "NORMAL",
                "payload": { "networkType": "WIFI_6E", "ssid": "Office_5G", "metered": false },
                "tags": ["network", "telemetry"]
              }
            ]
        """.trimIndent()
    }

    private fun parseJsonArray(raw: String): JSONArray {
        val clean = raw.trim().removePrefix("```json").removePrefix("```").removeSuffix("```").trim()
        return JSONArray(clean)
    }

    private fun parseJsonObject(raw: String): JSONObject {
        val clean = raw.trim().removePrefix("```json").removePrefix("```").removeSuffix("```").trim()
        return JSONObject(clean)
    }

    private fun jsonObjectToMap(json: JSONObject): Map<String, Any?> {
        val map = mutableMapOf<String, Any?>()
        val keys = json.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            val value = json.get(key)
            map[key] = when (value) {
                is JSONObject -> jsonObjectToMap(value)
                is JSONArray -> jsonArrayToList(value)
                JSONObject.NULL -> null
                else -> value
            }
        }
        return map
    }

    private fun jsonArrayToList(array: JSONArray): List<Any?> {
        val list = mutableListOf<Any?>()
        for (i in 0 until array.length()) {
            val value = array.get(i)
            list.add(
                when (value) {
                    is JSONObject -> jsonObjectToMap(value)
                    is JSONArray -> jsonArrayToList(value)
                    JSONObject.NULL -> null
                    else -> value
                }
            )
        }
        return list
    }
}
