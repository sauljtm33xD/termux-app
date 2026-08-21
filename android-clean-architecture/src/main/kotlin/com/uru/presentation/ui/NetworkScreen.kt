package com.uru.presentation.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.SignalCellularAlt
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.uru.domain.network.AccessPoint
import com.uru.presentation.viewmodel.NetworkViewModel

@Composable
fun NetworkScreen(viewModel: NetworkViewModel) {
    val uiState = viewModel.uiState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.scanAccessPoints()
        viewModel.getConnectedAccessPoint()
        viewModel.checkNetworkAvailability()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Text(
            text = "WiFi Networks",
            style = MaterialTheme.typography.headlineLarge,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        // Network Status
        NetworkStatusCard(
            isAvailable = uiState.value.isNetworkAvailable,
            connectedAccessPoint = uiState.value.connectedAccessPoint
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Scan Button
        Button(
            onClick = { viewModel.scanAccessPoints() },
            modifier = Modifier.fillMaxWidth(),
            enabled = !uiState.value.isScanning
        ) {
            if (uiState.value.isScanning) {
                CircularProgressIndicator(
                    modifier = Modifier
                        .width(20.dp)
                        .height(20.dp),
                    strokeWidth = 2.dp,
                    color = Color.White
                )
                Spacer(modifier = Modifier.width(8.dp))
            } else {
                Icon(Icons.Default.Refresh, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
            }
            Text("Scan Networks")
        }

        // Error Message
        uiState.value.errorMessage?.let { error ->
            Spacer(modifier = Modifier.height(8.dp))
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(MaterialTheme.colorScheme.errorContainer)
            ) {
                Text(
                    text = error,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    modifier = Modifier.padding(12.dp),
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Access Points List
        Text(
            text = "Available Networks (${uiState.value.accessPoints.size})",
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.padding(bottom = 8.dp)
        )

        if (uiState.value.accessPoints.isEmpty() && !uiState.value.isScanning) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "No networks found. Try scanning again.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(modifier = Modifier.fillMaxWidth()) {
                items(uiState.value.accessPoints) { accessPoint ->
                    AccessPointCard(accessPoint)
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
fun NetworkStatusCard(
    isAvailable: Boolean,
    connectedAccessPoint: AccessPoint?
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .width(12.dp)
                        .height(12.dp)
                        .background(
                            if (isAvailable) Color.Green else Color.Red,
                            shape = androidx.compose.foundation.shape.CircleShape
                        )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isAvailable) "Connected to Internet" else "No Internet",
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            if (connectedAccessPoint != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Connected to: ${connectedAccessPoint.ssid}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "Signal: ${connectedAccessPoint.level} dBm",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun AccessPointCard(accessPoint: AccessPoint) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.SignalCellularAlt,
                contentDescription = null,
                tint = getSignalColor(accessPoint.level),
                modifier = Modifier.width(24.dp).height(24.dp)
            )

            Spacer(modifier = Modifier.width(12.dp))

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = accessPoint.ssid,
                    style = MaterialTheme.typography.bodyMedium
                )
                Text(
                    text = "BSSID: ${accessPoint.bssid}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "Frequency: ${accessPoint.frequency} MHz",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "${accessPoint.level} dBm",
                    style = MaterialTheme.typography.bodyMedium,
                    color = getSignalColor(accessPoint.level)
                )
                Text(
                    text = "${getSignalQuality(accessPoint.level)}%",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

private fun getSignalColor(level: Int): Color {
    return when {
        level > -50 -> Color.Green
        level > -60 -> Color(0xFF7CB342)  // Light green
        level > -70 -> Color(0xFFFBC02D)  // Yellow
        level > -80 -> Color(0xFFE65100)  // Orange
        else -> Color.Red
    }
}

private fun getSignalQuality(level: Int): Int {
    return when {
        level > -50 -> 100
        level > -60 -> 80
        level > -70 -> 60
        level > -80 -> 40
        else -> 20
    }
}
