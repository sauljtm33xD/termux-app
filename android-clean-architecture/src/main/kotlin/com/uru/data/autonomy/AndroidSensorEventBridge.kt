package com.autonomy.engine.data

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.BatteryManager
import com.autonomy.engine.domain.*
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

/**
 * Bridges Android OS hardware events, system broadcasts, and accessibility signals
 * directly into the EventEngine and ContextEngine.
 */
class AndroidSensorEventBridge(
    private val context: Context,
    private val eventEngine: EventEngine,
    private val contextEngine: ContextEngine,
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Default)
) : SensorEventListener {

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager

    private var accelerometer: Sensor? = null
    private var lightSensor: Sensor? = null
    private var proximitySensor: Sensor? = null

    private var batteryReceiver: BroadcastReceiver? = null

    fun startListening() {
        // 1. Initialize Hardware Sensors
        sensorManager?.let { sm ->
            accelerometer = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            lightSensor = sm.getDefaultSensor(Sensor.TYPE_LIGHT)
            proximitySensor = sm.getDefaultSensor(Sensor.TYPE_PROXIMITY)

            accelerometer?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL) }
            lightSensor?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
            proximitySensor?.let { sm.registerListener(this, it, SensorManager.SENSOR_DELAY_UI) }
        }

        // 2. Register Battery Status Receiver
        batteryReceiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context?, intent: Intent?) {
                if (intent?.action == Intent.ACTION_BATTERY_CHANGED) {
                    val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, -1)
                    val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, -1)
                    val batteryPct = if (level >= 0 && scale > 0) (level * 100) / scale else level
                    val status = intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)
                    val isCharging = status == BatteryManager.BATTERY_STATUS_CHARGING || status == BatteryManager.BATTERY_STATUS_FULL

                    coroutineScope.launch {
                        // Update Context
                        contextEngine.set("device.battery.level", batteryPct)
                        contextEngine.set("device.battery.isCharging", isCharging)

                        // Publish Event
                        eventEngine.publish(
                            topic = "device.battery.changed",
                            payload = mapOf(
                                "level" to batteryPct,
                                "isCharging" to isCharging,
                                "plugged" to intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, 0)
                            ),
                            metadata = EventMetadata(
                                priority = if (batteryPct < 15) EventPriority.HIGH else EventPriority.LOW,
                                source = "android.battery_manager",
                                tags = listOf("hardware", "power")
                            )
                        )
                    }
                }
            }
        }
        context.registerReceiver(batteryReceiver, IntentFilter(Intent.ACTION_BATTERY_CHANGED))

        // 3. Register Network Connectivity Monitor
        connectivityManager?.let { cm ->
            val request = NetworkRequest.Builder()
                .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                .build()

            cm.registerNetworkCallback(request, object : ConnectivityManager.NetworkCallback() {
                override fun onAvailable(network: Network) {
                    coroutineScope.launch {
                        contextEngine.set("device.network.isOnline", true)
                        eventEngine.publish(
                            topic = "device.network.connected",
                            payload = mapOf("online" to true, "networkId" to network.toString()),
                            metadata = EventMetadata(priority = EventPriority.NORMAL, source = "android.connectivity")
                        )
                    }
                }

                override fun onLost(network: Network) {
                    coroutineScope.launch {
                        contextEngine.set("device.network.isOnline", false)
                        eventEngine.publish(
                            topic = "device.network.lost",
                            payload = mapOf("online" to false),
                            metadata = EventMetadata(priority = EventPriority.HIGH, source = "android.connectivity")
                        )
                    }
                }
            })
        }
    }

    fun stopListening() {
        sensorManager?.unregisterListener(this)
        batteryReceiver?.let {
            try {
                context.unregisterReceiver(it)
            } catch (_: Exception) {}
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        coroutineScope.launch {
            when (event.sensor.type) {
                Sensor.TYPE_ACCELEROMETER -> {
                    val x = event.values[0]
                    val y = event.values[1]
                    val z = event.values[2]
                    val magnitude = Math.sqrt((x * x + y * y + z * z).toDouble())

                    // Detect device shake
                    if (magnitude > 15.0) {
                        eventEngine.publish(
                            topic = "sensor.accelerometer.shake",
                            payload = mapOf("x" to x, "y" to y, "z" to z, "magnitude" to magnitude),
                            metadata = EventMetadata(priority = EventPriority.HIGH, tags = listOf("motion", "gesture"))
                        )
                    }
                }

                Sensor.TYPE_LIGHT -> {
                    val lux = event.values[0]
                    contextEngine.set("environment.ambientLightLux", lux)
                    if (lux < 5.0) {
                        eventEngine.publish(
                            topic = "sensor.light.dark_environment",
                            payload = mapOf("lux" to lux),
                            metadata = EventMetadata(priority = EventPriority.LOW)
                        )
                    }
                }

                Sensor.TYPE_PROXIMITY -> {
                    val distance = event.values[0]
                    contextEngine.set("device.proximity.distanceCm", distance)
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
