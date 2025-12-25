package com.mailshield.app.data.api

import com.mailshield.app.data.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("api/auth/android/login")
    suspend fun login(@Body request: AuthRequest): Response<LoginResponse>

    @GET("api/emails/dashboard")
    suspend fun getDashboardStats(): Response<UserStats>

    @GET("api/emails/recent")
    suspend fun getRecentEmails(): Response<List<EmailRecord>>

    @POST("api/emails/scan")
    suspend fun startScan(): Response<Unit>
}
