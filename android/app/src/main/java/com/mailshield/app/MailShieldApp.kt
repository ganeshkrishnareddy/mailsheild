package com.mailshield.app

import android.app.Application

import com.mailshield.app.data.api.RetrofitClient
import com.mailshield.app.data.local.SessionManager
import com.mailshield.app.data.repository.MailRepository

class MailShieldApp : Application() {
    lateinit var sessionManager: SessionManager
    lateinit var repository: MailRepository

    override fun onCreate() {
        super.onCreate()
        sessionManager = SessionManager(this)
        val apiService = RetrofitClient(sessionManager).apiService
        repository = MailRepository(apiService)
    }
}
