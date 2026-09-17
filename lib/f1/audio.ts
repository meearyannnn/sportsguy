/**
 * Low-Frequency Pit-Wall Telemetry Tick Sound Generator
 * 
 * Rules:
 * 1. Opt-in only, muted (OFF) by default.
 * 2. Single, subtle low-frequency mechanical tick (~85Hz decaying to 45Hz, 25ms duration).
 * 3. Synthetic Web Audio API oscillator — zero external audio files.
 * 4. Only fires on live position changes or intervals updates. Never on routine navigation.
 */

const AUDIO_PREF_KEY = 'apex_telemetry_audio_enabled';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(AUDIO_PREF_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAudioEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUDIO_PREF_KEY, enabled ? 'true' : 'false');
  } catch {
    // quota or private mode
  }
}

/**
 * Fires a single, subtle low-frequency mechanical tick.
 * Barely audible, non-gamified, mimicking a telemetry relay pulse.
 */
export function playTelemetryTick(): void {
  if (!isAudioEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const now = ctx.currentTime;

    // Pitch envelope: 90Hz dropping to 45Hz
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.025);

    // Gain envelope: soft attack, 25ms rapid decay
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  } catch {
    // Ignore audio permission or autoplay restrictions
  }
}
