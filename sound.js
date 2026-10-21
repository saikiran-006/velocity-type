// Web Audio API procedural mechanical switch sound generator

class SoundController {
  constructor() {
    this.ctx = null;
    this.soundProfile = 'thock'; // 'thock', 'clicky', 'creamy', 'off'
    this.volume = 0.5;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setProfile(profile) {
    this.soundProfile = profile;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  playKey(isSpace = false) {
    if (this.soundProfile === 'off') return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.volume, t);
    masterGain.connect(this.ctx.destination);

    if (this.soundProfile === 'thock') {
      this._playThock(t, masterGain, isSpace);
    } else if (this.soundProfile === 'clicky') {
      this._playClicky(t, masterGain, isSpace);
    } else if (this.soundProfile === 'creamy') {
      this._playCreamy(t, masterGain, isSpace);
    }
  }

  _playThock(t, masterGain, isSpace) {
    const baseFreq = isSpace ? 110 : (160 + Math.random() * 25);
    
    // Sub bottom-out boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * 1.5, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, t + 0.05);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    // Noise click
    const bufferSize = this.ctx.sampleRate * 0.03;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isSpace ? 400 : 750, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(masterGain);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.08);
    noise.start(t);
    noise.stop(t + 0.04);
  }

  _playClicky(t, masterGain, isSpace) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = isSpace ? 800 : (1200 + Math.random() * 200);

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.025);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.03);
  }

  _playCreamy(t, masterGain, isSpace) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = isSpace ? 220 : (320 + Math.random() * 40);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.045);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  playError() {
    if (this.soundProfile === 'off') return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(90, t + 0.1);

    gain.gain.setValueAtTime(0.25 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  playCompletion() {
    if (this.soundProfile === 'off') return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.36);
    });
  }
}

export const soundManager = new SoundController();
