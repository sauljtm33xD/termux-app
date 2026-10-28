package com.uru.data.services

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.view.accessibility.AccessibilityEvent
import com.uru.domain.autonomy.EventMetadata
import com.uru.domain.autonomy.EventPriority
import com.uru.domain.autonomy.IContextEngine
import com.uru.domain.autonomy.IEventEngine
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Android Accessibility Service for URU AI Middleware.
 * Hooks system events and sends them into the ARMA C30 EventEngine.
 */
class UruAccessibilityService : AccessibilityService() {

    var eventEngine: IEventEngine? = null
    var contextEngine: IContextEngine? = null
    private val scope = CoroutineScope(Dispatchers.Default)

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val packageName = event.packageName?.toString() ?: "unknown"
        val eventType = event.eventType

        scope.launch {
            contextEngine?.set("system.active_package", packageName)

            eventEngine?.publish(
                topic = "system.accessibility.event",
                payload = mapOf(
                    "packageName" to packageName,
                    "eventType" to eventType,
                    "className" to (event.className?.toString() ?: ""),
                    "timestamp" to System.currentTimeMillis()
                ),
                metadata = EventMetadata(
                    priority = EventPriority.NORMAL,
                    source = "uru.accessibility_service",
                    tags = listOf("android", "accessibility")
                )
            )
        }
    }

    override fun onInterrupt() {
        // Safe interrupt handling
    }
}

/**
 * Android Hardware & Telephony Sensor Bridge.
 */
class AndroidHardwareBridge(
    private val context: Context,
    private val eventEngine: IEventEngine,
    private val contextEngine: IContextEngine,
    private val scope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager

    fun registerSensors() {
        sensorManager?.let { sm ->
            val accel = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            accel?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL) }
        }
    }

    fun unregisterSensors() {
        sensorManager?.unregisterListener(this)
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_ACCELEROMETER) {
            val mag = Math.sqrt((event.values[0] * event.values[0] + event.values[1] * event.values[1] + event.values[2] * event.values[2]).toDouble())
            if (mag > 18.0) {
                scope.launch {
                    eventEngine.publish(
                        topic = "sensor.accelerometer.shake",
                        payload = mapOf("magnitude" to mag),
                        metadata = EventMetadata(priority = EventPriority.HIGH, tags = listOf("gesture", "emergency"))
                    )
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
