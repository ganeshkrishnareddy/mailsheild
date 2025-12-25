package com.mailshield.app.data.repository

import com.mailshield.app.data.api.ApiService
import com.mailshield.app.data.models.EmailRecord
import com.mailshield.app.data.models.UserStats
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class MailRepository(private val apiService: ApiService) {
    fun apiService() = apiService

    fun getDashboardStats(): Flow<UserStats?> = flow {
        try {
            val response = apiService.getDashboardStats()
            if (response.isSuccessful) {
                emit(response.body())
            } else {
                emit(null)
            }
        } catch (e: Exception) {
            emit(null)
        }
    }

    fun getRecentEmails(): Flow<List<EmailRecord>> = flow {
        try {
            val response = apiService.getRecentEmails()
            if (response.isSuccessful) {
                emit(response.body() ?: emptyList())
            } else {
                emit(emptyList())
            }
        } catch (e: Exception) {
            emit(emptyList())
        }
    }

    suspend fun startScan(): Boolean {
        return try {
            val response = apiService.startScan()
            response.isSuccessful
        } catch (e: Exception) {
            false
        }
    }
}
