/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicOscillators: OscillatorNode[] = [];
  private currentBgmWorld: string | null = null;
  private isMuted: boolean = false;

  private sfxVol: number = 0.8;
  private musicVol: number = 0.4;

  private initContext(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
        this.musicGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(sfx: number, music: number): void {
    this.sfxVol = sfx;
    this.musicVol = music;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : sfx, this.ctx.currentTime);
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : music, this.ctx.currentTime);
    }
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    this.setVolumes(this.sfxVol, this.musicVol);
  }

  // --- SOUND EFFECTS ---

  public playJump(): void {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.sfxVol <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playLand(): void {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.sfxVol <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playSpring(): void {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.sfxVol <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(720, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playGem(index: number = 0): void {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.sfxVol <= 0) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const freq = notes[index % notes.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playCheckpoint(): void {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.sfxVol <= 0) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25]; // A major chime

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);

      gain.gain.setValueAtTime(0.2, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.26);
    });
  }

  public playDie(): void {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.sfxVol <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.25);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  public playVictory(): void {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.sfxVol <= 0) return;

    const t = this.ctx.currentTime;
    const fanfare = [
      { f: 523.25, time: 0.00, dur: 0.12 }, // C5
      { f: 659.25, time: 0.12, dur: 0.12 }, // E5
      { f: 783.99, time: 0.24, dur: 0.14 }, // G5
      { f: 1046.50, time: 0.40, dur: 0.45 }, // C6
    ];

    fanfare.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, t + n.time);

      gain.gain.setValueAtTime(0.35, t + n.time);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.time + n.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + n.time);
      osc.stop(t + n.time + n.dur + 0.02);
    });
  }

  public playDoorUnlock(): void {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted || this.sfxVol <= 0) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.23);
  }

  // --- AMBIENT BGM CHORDS ---
  public startWorldBgm(worldId: string): void {
    if (this.currentBgmWorld === worldId) return;
    this.stopBgm();
    this.currentBgmWorld = worldId;
    this.initContext();
    if (!this.ctx || !this.musicGain || this.isMuted || this.musicVol <= 0) return;

    // Soft atmospheric drone chords per world
    const chords: Record<string, number[]> = {
      green_hills: [261.63, 329.63, 392.00], // C major
      crystal_caves: [220.00, 261.63, 329.63, 415.30], // A minor / dim
      frostbound_ruins: [293.66, 349.23, 440.00], // D minor
      gearwork_factory: [196.00, 293.66, 370.00], // G suspended
      ember_depths: [164.81, 207.65, 246.94], // E low
      skybound_frontier: [329.63, 392.00, 493.88], // E minor airy
    };

    const notes = chords[worldId] || [261.63, 329.63, 392.00];

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.musicGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.5, this.ctx.currentTime);

      // Low volume ambient drone
      gain.gain.setValueAtTime(0.03 / (idx + 1), this.ctx.currentTime);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start();
      this.musicOscillators.push(osc);
    });
  }

  public stopBgm(): void {
    for (const osc of this.musicOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // ignore already stopped
      }
    }
    this.musicOscillators = [];
    this.currentBgmWorld = null;
  }
}

export const soundManager = new SoundManager();
