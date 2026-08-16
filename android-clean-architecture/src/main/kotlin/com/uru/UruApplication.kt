package com.uru

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class UruApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
