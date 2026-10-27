package com.mushfik8.bouncypocketquest.game.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlinx.coroutines.*
import kotlin.math.*

class AudioSynthesizer(context: Context) {
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())
    private val sampleRate = 44100
    private var isMuted = false
    private var sfxVolume = 0.8f
    private var musicVolume = 0.4f

    fun setVolumes(sfx: Float, music: Float) {
        sfxVolume = sfx
        musicVolume = music
    }

    fun setMute(muted: Boolean) {
        isMuted = muted
    }

    fun playJump() {
        if (isMuted || sfxVolume <= 0f) return
        generateTone(startFreq = 240f, endFreq = 480f, durationSec = 0.12f, volume = sfxVolume * 0.4f)
    }

    fun playLand() {
        if (isMuted || sfxVolume <= 0f) return
        generateTone(startFreq = 140f, endFreq = 60f, durationSec = 0.08f, volume = sfxVolume * 0.3f)
    }

    fun playSpring() {
        if (isMuted || sfxVolume <= 0f) return
        generateTone(startFreq = 180f, endFreq = 720f, durationSec = 0.22f, volume = sfxVolume * 0.45f)
    }

    fun playGem(index: Int = 0) {
        if (isMuted || sfxVolume <= 0f) return
        val freqs = floatArrayOf(523.25f, 659.25f, 783.99f, 1046.50f)
        val f = freqs[index % freqs.size]
        generateTone(startFreq = f, endFreq = f * 1.25f, durationSec = 0.18f, volume = sfxVolume * 0.45f)
    }

    fun playCheckpoint() {
        if (isMuted || sfxVolume <= 0f) return
        scope.launch {
            val notes = floatArrayOf(440f, 554.37f, 659.25f)
            for (f in notes) {
                generateTone(f, f, 0.12f, sfxVolume * 0.35f)
                delay(80)
            }
        }
    }

    fun playDie() {
        if (isMuted || sfxVolume <= 0f) return
        generateTone(startFreq = 320f, endFreq = 60f, durationSec = 0.25f, volume = sfxVolume * 0.5f)
    }

    fun playVictory() {
        if (isMuted || sfxVolume <= 0f) return
        scope.launch {
            val fanfares = floatArrayOf(523.25f, 659.25f, 783.99f, 1046.5f)
            for (f in fanfares) {
                generateTone(f, f, 0.15f, sfxVolume * 0.5f)
                delay(120)
            }
        }
    }

    private fun generateTone(startFreq: Float, endFreq: Float, durationSec: Float, volume: Float) {
        scope.launch {
            try {
                val numSamples = (durationSec * sampleRate).toInt()
                val samples = ShortArray(numSamples)
                var currentFreq = startFreq
                val freqStep = (endFreq - startFreq) / numSamples

                var phase = 0.0
                for (i in 0 until numSamples) {
                    val progress = i.toFloat() / numSamples
                    val envelope = 1f - progress // Linear decay
                    val sampleVal = (sin(phase) * envelope * volume * 32767).toInt()
                    samples[i] = sampleVal.coerceIn(-32768, 32767).toShort()

                    phase += 2 * PI * currentFreq / sampleRate
                    currentFreq += freqStep
                }

                val track = AudioTrack.Builder()
                    .setAudioAttributes(
                        AudioAttributes.Builder()
                            .setUsage(AudioAttributes.USAGE_GAME)
                            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                            .build()
                    )
                    .setAudioFormat(
                        AudioFormat.Builder()
                            .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                            .setSampleRate(sampleRate)
                            .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                            .build()
                    )
                    .setBufferSizeInBytes(numSamples * 2)
                    .setTransferMode(AudioTrack.MODE_STATIC)
                    .build()

                track.write(samples, 0, numSamples)
                track.play()

                delay((durationSec * 1000).toLong() + 50)
                track.release()
            } catch (e: Exception) {
                // Ignore audio play errors
            }
        }
    }

    fun release() {
        scope.cancel()
    }
}
