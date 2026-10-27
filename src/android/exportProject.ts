/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';

export interface AndroidFileEntry {
  path: string;
  content: string;
}

export const ANDROID_FILES: AndroidFileEntry[] = [
  {
    path: 'settings.gradle.kts',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "BouncyPocketQuest"
include(":app")
`,
  },
  {
    path: 'build.gradle.kts',
    content: `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`,
  },
  {
    path: 'gradle/libs.versions.toml',
    content: `[versions]
agp = "8.8.2"
kotlin = "2.1.0"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.10.1"
composeBom = "2025.02.00"
datastore = "1.1.2"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }
`,
  },
  {
    path: 'app/build.gradle.kts',
    content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.mushfik8.bouncypocketquest"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.mushfik8.bouncypocketquest"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.datastore.preferences)
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.VIBRATE" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.BouncyPocketQuest"
        android:appCategory="game">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="sensorLandscape"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@style/Theme.BouncyPocketQuest">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
`,
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    content: `<resources>
    <string name="app_name">Bouncy: Pocket Quest</string>
</resources>
`,
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="game_bg">#090D16</color>
    <color name="bouncy_red">#DC2626</color>
    <color name="bouncy_gold">#FBBF24</color>
    <color name="bouncy_green">#22C55E</color>
</resources>
`,
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="Theme.BouncyPocketQuest" parent="android:Theme.Material.Light.NoActionBar">
        <item name="android:statusBarColor">#090D16</item>
        <item name="android:navigationBarColor">#090D16</item>
        <item name="android:windowFullscreen">true</item>
    </style>
</resources>
`,
  },
  {
    path: 'app/src/main/java/com/mushfik8/bouncypocketquest/MainActivity.kt',
    content: `package com.mushfik8.bouncypocketquest

import android.os.Bundle
import android.view.View
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.mushfik8.bouncypocketquest.game.audio.AudioSynthesizer
import com.mushfik8.bouncypocketquest.game.data.SaveRepository
import com.mushfik8.bouncypocketquest.ui.screens.*

class MainActivity : ComponentActivity() {
    private lateinit var audioSynthesizer: AudioSynthesizer
    private lateinit var saveRepository: SaveRepository

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        )
        audioSynthesizer = AudioSynthesizer(this)
        saveRepository = SaveRepository(this)

        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    MainMenuScreen(
                        onPlay = {},
                        onWorldSelect = {},
                        onSettings = {},
                        onHowToPlay = {},
                        audio = audioSynthesizer,
                        saveRepo = saveRepository
                    )
                }
            }
        }
    }
}
`,
  },
];

export async function generateAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  for (const file of ANDROID_FILES) {
    zip.file(file.path, file.content);
  }
  return await zip.generateAsync({ type: 'blob' });
}
