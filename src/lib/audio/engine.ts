/**
 * NOMAD audio engine. Everything is synthesised with the Web Audio API:
 * - Needle Drop: a per-band loop (drums, bass, lead) with vinyl crackle
 * - the soft metal clack of hangers touching
 * Nothing here plays until the user has turned sound on.
 */
import type { SoundSignature, Waveform } from "@/lib/data/types";

const A2 = 110;
const semi = (n: number) => A2 * Math.pow(2, n / 12);

function makeFuzzCurve(amount: number) {
  const n = 1024;
  const curve = new Float32Array(n);
  const k = amount * 60;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = amount < 0.02 ? x : ((1 + k) * x) / (1 + k * Math.abs(x));
  }
  return curve;
}

class Loop {
  private timer: number | null = null;
  private nextStep = 0;
  private nextTime = 0;
  private stepDur: number;
  constructor(
    private ctx: AudioContext,
    private sig: SoundSignature,
    private out: GainNode,
    private noise: AudioBuffer,
  ) {
    this.stepDur = 60 / sig.bpm / 4;
  }

  start() {
    this.nextStep = 0;
    this.nextTime = this.ctx.currentTime + 0.06;
    const tick = () => {
      const horizon = this.ctx.currentTime + 0.18;
      while (this.nextTime < horizon) {
        this.schedule(this.nextStep % 32, this.nextTime);
        const swing = this.nextStep % 2 === 1 ? this.sig.swing * this.stepDur * 0.5 : -this.sig.swing * this.stepDur * 0.5;
        this.nextStep++;
        this.nextTime += this.stepDur + swing;
      }
      this.timer = window.setTimeout(tick, 60);
    };
    tick();
  }

  stop() {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
  }

  private schedule(step: number, t: number) {
    const s = this.sig;
    if (s.kick[step] === "x") this.kick(t);
    if (s.snare[step] === "x") this.snare(t, s.timbre.snareTail);
    if (s.hat[step] === "x") this.hat(t, false);
    if (s.hat[step] === "o") this.hat(t, true);
    for (const [st, n, len] of s.bass) if (st === step) this.bass(t, semi(s.root + n), len * this.stepDur);
    for (const [st, notes, len] of s.lead) if (st === step) for (const n of notes) this.lead(t, semi(s.root + 12 * s.timbre.leadOctave + n), len * this.stepDur);
  }

  private kick(t: number) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + 0.3);
  }

  private noiseSource(t: number, dur: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    src.start(t);
    src.stop(t + dur + 0.05);
    return src;
  }

  private snare(t: number, tail: number) {
    const n = this.noiseSource(t, tail);
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1900;
    bp.Q.value = 0.9;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.55, t);
    // gated 80s snares hold then slam shut; short tails decay naturally
    if (tail > 0.2) {
      g.gain.setValueAtTime(0.5, t + tail * 0.8);
      g.gain.linearRampToValueAtTime(0.0001, t + tail);
    } else {
      g.gain.exponentialRampToValueAtTime(0.001, t + tail);
    }
    n.connect(bp).connect(g).connect(this.out);
    const o = this.ctx.createOscillator();
    const og = this.ctx.createGain();
    o.frequency.setValueAtTime(210, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.06);
    og.gain.setValueAtTime(0.35, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    o.connect(og).connect(this.out);
    o.start(t);
    o.stop(t + 0.1);
  }

  private hat(t: number, open: boolean) {
    const dur = open ? 0.22 : 0.045;
    const n = this.noiseSource(t, dur);
    const hp = this.ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7200;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(open ? 0.22 : 0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    n.connect(hp).connect(g).connect(this.out);
  }

  private voice(t: number, freq: number, dur: number, type: Waveform, level: number, cutoff: number, fuzz: number, detune: number, attack: number) {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(level, t + attack);
    g.gain.setValueAtTime(level, t + Math.max(attack, dur - 0.04));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(cutoff, t);
    lp.frequency.exponentialRampToValueAtTime(Math.max(200, cutoff * 0.45), t + dur);
    let chain: AudioNode = lp;
    if (fuzz > 0.05) {
      const ws = this.ctx.createWaveShaper();
      ws.curve = makeFuzzCurve(fuzz);
      ws.oversample = "2x";
      lp.connect(ws);
      chain = ws;
    }
    chain.connect(g).connect(this.out);
    const voices = detune > 0 ? [-detune, detune] : [0];
    for (const d of voices) {
      const o = this.ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = d;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.05);
    }
  }

  private bass(t: number, freq: number, dur: number) {
    const tb = this.sig.timbre;
    this.voice(t, freq, dur, tb.bassOsc, 0.26, Math.min(tb.cutoff, 900), tb.fuzz * 0.6, 0, 0.006);
  }

  private lead(t: number, freq: number, dur: number) {
    const tb = this.sig.timbre;
    const attack = dur > 1 ? 0.35 : 0.01;
    this.voice(t, freq, dur, tb.leadOsc, tb.leadLevel, tb.cutoff, tb.fuzz, tb.detune, attack);
  }
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private bandBus!: GainNode;
  private crackleGain!: GainNode;
  private fxDelay!: DelayNode;
  private fxFeedback!: GainNode;
  private fxDelayMix!: GainNode;
  private chorusDelay!: DelayNode;
  private chorusMix!: GainNode;
  private chorusLfo!: OscillatorNode;
  private chorusDepth!: GainNode;
  private noise!: AudioBuffer;
  private loop: Loop | null = null;
  private crackleTimer: number | null = null;
  private currentBand: string | null = null;

  private ensure() {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);

    // noise buffer (2s)
    const len = ctx.sampleRate * 2;
    this.noise = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;

    // band bus -> dry + delay + chorus
    this.bandBus = ctx.createGain();
    this.bandBus.gain.value = 0;
    this.bandBus.connect(this.master);

    this.fxDelay = ctx.createDelay(1.5);
    this.fxFeedback = ctx.createGain();
    this.fxDelayMix = ctx.createGain();
    const dlp = ctx.createBiquadFilter();
    dlp.type = "lowpass";
    dlp.frequency.value = 2400;
    this.bandBus.connect(this.fxDelay);
    this.fxDelay.connect(dlp).connect(this.fxFeedback).connect(this.fxDelay);
    dlp.connect(this.fxDelayMix).connect(this.master);

    this.chorusDelay = ctx.createDelay(0.1);
    this.chorusDelay.delayTime.value = 0.018;
    this.chorusLfo = ctx.createOscillator();
    this.chorusLfo.frequency.value = 0.6;
    this.chorusDepth = ctx.createGain();
    this.chorusDepth.gain.value = 0.004;
    this.chorusLfo.connect(this.chorusDepth).connect(this.chorusDelay.delayTime);
    this.chorusLfo.start();
    this.chorusMix = ctx.createGain();
    this.bandBus.connect(this.chorusDelay).connect(this.chorusMix).connect(this.master);

    // crackle bed
    this.crackleGain = ctx.createGain();
    this.crackleGain.gain.value = 0;
    const hiss = ctx.createBufferSource();
    hiss.buffer = this.noise;
    hiss.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 2500;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.06;
    hiss.connect(hp).connect(hissGain).connect(this.crackleGain).connect(this.master);
    hiss.start();
    return ctx;
  }

  async resume() {
    const ctx = this.ensure();
    if (ctx.state !== "running") await ctx.resume();
  }

  /** Soft metal clack of two hangers touching. intensity 0..1 */
  clack(intensity = 0.5, pan = 0) {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const amp = 0.12 + intensity * 0.5;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    p.connect(this.master);
    // body: short filtered noise burst
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2600 + Math.random() * 900;
    bp.Q.value = 6;
    const g = ctx.createGain();
    g.gain.setValueAtTime(amp, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    n.connect(bp).connect(g).connect(p);
    n.start(t);
    n.stop(t + 0.1);
    // ring: two metallic partials
    for (const f of [3150 + Math.random() * 400, 5200 + Math.random() * 600]) {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const og = ctx.createGain();
      og.gain.setValueAtTime(amp * 0.25, t);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      o.connect(og).connect(p);
      o.start(t);
      o.stop(t + 0.1);
    }
    // thud
    const o = ctx.createOscillator();
    o.frequency.setValueAtTime(220, t);
    o.frequency.exponentialRampToValueAtTime(90, t + 0.05);
    const og = ctx.createGain();
    og.gain.setValueAtTime(amp * 0.35, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    o.connect(og).connect(p);
    o.start(t);
    o.stop(t + 0.08);
  }

  /** Short hiss + tick when a tag is flipped or a size pass is picked. */
  tick() {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    const n = ctx.createBufferSource();
    n.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 5000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.12, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    n.connect(hp).connect(g).connect(this.master);
    n.start(t);
    n.stop(t + 0.04);
  }

  private startCrackle() {
    const ctx = this.ctx!;
    this.crackleGain.gain.cancelScheduledValues(ctx.currentTime);
    this.crackleGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.6);
    if (this.crackleTimer !== null) return;
    const pop = () => {
      const t = ctx.currentTime + 0.01;
      const n = ctx.createBufferSource();
      n.buffer = this.noise;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 800 + Math.random() * 3000;
      bp.Q.value = 2 + Math.random() * 6;
      const g = ctx.createGain();
      const amp = 0.05 + Math.random() * 0.25;
      g.gain.setValueAtTime(amp, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.012 + Math.random() * 0.03);
      n.connect(bp).connect(g).connect(this.crackleGain);
      n.start(t);
      n.stop(t + 0.06);
      this.crackleTimer = window.setTimeout(pop, 40 + Math.random() * 420);
    };
    pop();
  }

  private stopCrackle() {
    const ctx = this.ctx!;
    this.crackleGain.gain.cancelScheduledValues(ctx.currentTime);
    this.crackleGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
    if (this.crackleTimer !== null) window.clearTimeout(this.crackleTimer);
    this.crackleTimer = null;
  }

  /** Drop the needle on a band. Crossfades from whatever was playing. */
  async play(bandId: string, sig: SoundSignature) {
    const ctx = this.ensure();
    if (ctx.state !== "running") await ctx.resume();
    if (this.currentBand === bandId && this.loop) return;
    const t = ctx.currentTime;
    this.bandBus.gain.cancelScheduledValues(t);
    this.bandBus.gain.setValueAtTime(this.bandBus.gain.value, t);
    this.bandBus.gain.linearRampToValueAtTime(0, t + 0.25);
    const old = this.loop;
    window.setTimeout(() => old?.stop(), 260);

    const stepDur = 60 / sig.bpm / 4;
    this.fxDelay.delayTime.setValueAtTime(stepDur * 3, t);
    this.fxFeedback.gain.setValueAtTime(0.25 + sig.timbre.delay * 0.4, t);
    this.fxDelayMix.gain.setValueAtTime(sig.timbre.delay * 0.6, t);
    this.chorusMix.gain.setValueAtTime(sig.timbre.chorus * 0.7, t);
    this.chorusDepth.gain.setValueAtTime(0.002 + sig.timbre.chorus * 0.004, t);

    const loop = new Loop(ctx, sig, this.bandBus, this.noise);
    this.loop = loop;
    this.currentBand = bandId;
    window.setTimeout(() => {
      if (this.loop !== loop) return;
      loop.start();
      const t2 = ctx.currentTime;
      this.bandBus.gain.cancelScheduledValues(t2);
      this.bandBus.gain.setValueAtTime(0, t2);
      this.bandBus.gain.linearRampToValueAtTime(0.7, t2 + 0.5);
    }, 280);
    this.startCrackle();
  }

  liftNeedle() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.bandBus.gain.cancelScheduledValues(t);
    this.bandBus.gain.setValueAtTime(this.bandBus.gain.value, t);
    this.bandBus.gain.linearRampToValueAtTime(0, t + 0.3);
    const old = this.loop;
    this.loop = null;
    this.currentBand = null;
    window.setTimeout(() => old?.stop(), 320);
    this.stopCrackle();
  }

  suspend() {
    this.liftNeedle();
    this.ctx?.suspend();
  }
}

let engine: AudioEngine | null = null;
export function getAudio() {
  if (!engine) engine = new AudioEngine();
  return engine;
}
