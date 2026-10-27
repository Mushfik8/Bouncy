package com.mushfik8.bouncypocketquest.game.data

import android.content.Context
import android.content.SharedPreferences

class SaveRepository(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("bouncy_pocket_quest_save", Context.MODE_PRIVATE)

    fun getLastUnlockedLevel(): Int {
        return prefs.getInt("unlocked_level", 1)
    }

    fun setLastUnlockedLevel(level: Int) {
        val current = getLastUnlockedLevel()
        if (level > current) {
            prefs.edit().putInt("unlocked_level", level).apply()
        }
    }

    fun getLevelStars(levelId: Int): Int {
        return prefs.getInt("level_stars_$levelId", 0)
    }

    fun recordLevelCompletion(levelId: Int, timeSec: Float, gemsCollected: Int, deaths: Int): Int {
        var stars = 1
        if (gemsCollected >= 3) stars = 2
        if (gemsCollected >= 3 && deaths == 0) stars = 3

        val currentStars = getLevelStars(levelId)
        val bestStars = maxOf(currentStars, stars)
        val bestTime = prefs.getFloat("level_best_time_$levelId", Float.MAX_VALUE)

        prefs.edit()
            .putInt("level_stars_$levelId", bestStars)
            .putFloat("level_best_time_$levelId", minOf(bestTime, timeSec))
            .putInt("level_gems_$levelId", gemsCollected)
            .apply()

        setLastUnlockedLevel(levelId + 1)
        return bestStars
    }

    fun getSfxVolume(): Float = prefs.getFloat("sfx_vol", 0.8f)
    fun setSfxVolume(vol: Float) = prefs.edit().putFloat("sfx_vol", vol).apply()

    fun getMusicVolume(): Float = prefs.getFloat("music_vol", 0.5f)
    fun setMusicVolume(vol: Float) = prefs.edit().putFloat("music_vol", vol).apply()

    fun isVibrationEnabled(): Boolean = prefs.getBoolean("vibration", true)
    fun setVibrationEnabled(enabled: Boolean) = prefs.edit().putBoolean("vibration", enabled).apply()

    fun isLeftHanded(): Boolean = prefs.getBoolean("left_handed", false)
    fun setLeftHanded(enabled: Boolean) = prefs.edit().putBoolean("left_handed", enabled).apply()

    fun getControlSize(): String = prefs.getString("control_size", "normal") ?: "normal"
    fun setControlSize(size: String) = prefs.edit().putString("control_size", size).apply()
}
