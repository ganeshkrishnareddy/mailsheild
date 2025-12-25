package com.mailshield.app.data.models

import com.google.gson.annotations.SerializedName

data class UserStats(
    @SerializedName("emails_scanned") val emailsScanned: Int,
    @SerializedName("phishing_detected") val phishingDetected: Int,
    @SerializedName("suspicious_detected") val suspiciousDetected: Int,
    @SerializedName("last_scan_at") val lastScanAt: String?
)

data class EmailRecord(
    val id: String,
    val sender: String,
    val subject: String,
    @SerializedName("risk_level") val riskLevel: String,
    @SerializedName("risk_score") val riskScore: Int,
    @SerializedName("detection_reasons") val reasons: List<String>?
)

data class LoginResponse(
    @SerializedName("access_token") val accessToken: String,
    @SerializedName("token_type") val tokenType: String,
    val user: UserData
)

data class UserData(
    val id: Int,
    val email: String,
    val name: String?,
    @SerializedName("picture_url") val pictureUrl: String?
)

data class AuthRequest(
    @SerializedName("id_token") val idToken: String
)
