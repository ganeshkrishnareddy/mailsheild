package com.mailshield.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mailshield.app.MailShieldApp
import com.mailshield.app.data.models.EmailRecord
import com.mailshield.app.data.models.UserStats
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onEmailClick: (String) -> Unit,
    onSettingsClick: () -> Unit
) {
    val context = LocalContext.current
    val app = context.applicationContext as MailShieldApp
    val repository = app.repository
    val scope = rememberCoroutineScope()

    var isScanning by remember { mutableStateOf(false) }
    var stats by remember { mutableStateOf<UserStats?>(null) }
    val emails = remember { mutableStateListOf<EmailRecord>() }
    
    LaunchedEffect(Unit) {
        repository.getDashboardStats().collect {
            stats = it
        }
    }

    LaunchedEffect(Unit) {
        repository.getRecentEmails().collect {
            emails.clear()
            emails.addAll(it)
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("MailShield", fontWeight = FontWeight.Bold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF1E293B),
                    titleContentColor = Color.White
                ),
                actions = {
                    IconButton(onClick = onSettingsClick) {
                        Icon(Icons.Default.Settings, "Settings", tint = Color.White)
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { 
                    if (!isScanning) {
                        isScanning = true
                        scope.launch {
                            repository.startScan()
                            repository.getDashboardStats().collect { stats = it }
                            repository.getRecentEmails().collect {
                                emails.clear()
                                emails.addAll(it)
                            }
                            isScanning = false
                        }
                    }
                },
                containerColor = Color(0xFF3B82F6)
            ) {
                if (isScanning) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Icon(Icons.Default.Refresh, "Scan", tint = Color.White)
                }
            }
        },
        containerColor = Color(0xFF0F172A)
    ) { padding ->
        LazyColumn(
            modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Stats Cards
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard("Scanned", (stats?.emailsScanned ?: 0).toString(), Color(0xFF3B82F6), Modifier.weight(1f))
                    StatCard("Threats", (stats?.phishingDetected ?: 0).toString(), Color(0xFFEF4444), Modifier.weight(1f))
                }
            }
            
            item {
                Text("Recent Emails", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp, modifier = Modifier.padding(top = 16.dp))
            }
            
            items(emails) { email ->
                EmailCard(email) { onEmailClick(email.id) }
            }
        }
    }
}

@Composable
fun StatCard(label: String, value: String, color: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(20.dp)) {
            Text(value, fontSize = 32.sp, fontWeight = FontWeight.Bold, color = color)
            Text(label, color = Color(0xFF94A3B8))
        }
    }
}

@Composable
fun EmailCard(email: EmailRecord, onClick: () -> Unit) {
    val riskColor = when (email.riskLevel) {
        "high" -> Color(0xFFEF4444)
        "medium" -> Color(0xFFF59E0B)
        else -> Color(0xFF22C55E)
    }
    
    Card(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier.size(8.dp).clip(RoundedCornerShape(4.dp)).background(riskColor)
            )
            Spacer(Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(email.sender, color = Color.White, fontWeight = FontWeight.Medium, maxLines = 1)
                Text(email.subject, color = Color(0xFF94A3B8), fontSize = 14.sp, maxLines = 1)
                if (!email.reasons.isNullOrEmpty()) {
                    Text(email.reasons.first(), color = Color(0xFF64748B), fontSize = 12.sp, maxLines = 1)
                }
            }
            Text(
                when (email.riskLevel) { "high" -> "🚨" "medium" -> "⚠️" else -> "✅" },
                fontSize = 20.sp
            )
        }
    }
}
