/**
 * Rail physics. Pure simulation, no DOM.
 *
 * Each hanger hangs from a hook on the rail. It can:
 *  - face you (face 0 = side-on sliver, 1 = full width) and the neighbours make room
 *  - sway as a pendulum when the rail (or its own slot) accelerates
 *  - knock into its neighbours and settle
 * The rail itself scrolls with momentum and rubber-bands at the ends.
 */
import { clamp, lerp } from "@/lib/utils";

export interface HangerSpec {
  /** Pendulum length in px: longer garments swing slower. */
  length: number;
  /** Damping; slightly different per hanger so they drift out of phase. */
  damping: number;
}

export interface RailConfig {
  garmentWidth: number;
  sliverSlot: number;
  gap: number;
  pad: number;
  viewportWidth: number;
  reducedMotion: boolean;
}

export interface Knock {
  a: number;
  b: number;
  intensity: number;
  /** -1..1 stereo position across the viewport. */
  pan: number;
}

const G = 2600;
const EASE = (t: number) => 1 - Math.pow(1 - t, 3);

export class RailSim {
  n: number;
  x: Float64Array;
  xT: Float64Array;
  face: Float64Array;
  faceT: Float64Array;
  theta: Float64Array;
  omega: Float64Array;
  private prevScreen: Float64Array;
  private prevV: Float64Array;
  private knockCooldown: Float64Array;
  spec: HangerSpec[];

  offset = 0;
  vel = 0;
  offsetTarget: number | null = null;
  dragging = false;
  trackWidth = 0;
  /** True while a Dig fling is running. */
  digging = false;
  digTargetIndex = -1;

  cfg: RailConfig;
  knocks: Knock[] = [];
  private time = 0;

  constructor(spec: HangerSpec[], cfg: RailConfig) {
    this.n = spec.length;
    this.spec = spec;
    this.cfg = cfg;
    this.x = new Float64Array(this.n);
    this.xT = new Float64Array(this.n);
    this.face = new Float64Array(this.n);
    this.faceT = new Float64Array(this.n);
    this.theta = new Float64Array(this.n);
    this.omega = new Float64Array(this.n);
    this.prevScreen = new Float64Array(this.n);
    this.prevV = new Float64Array(this.n);
    this.knockCooldown = new Float64Array(this.n);
    this.layout();
    this.x.set(this.xT);
    for (let i = 0; i < this.n; i++) this.prevScreen[i] = this.offset + this.x[i];
  }

  /** Slot width a hanger occupies for a given facing amount. */
  slot(face: number) {
    return lerp(this.cfg.sliverSlot, this.cfg.garmentWidth + this.cfg.gap, EASE(face));
  }

  private layout() {
    let cursor = this.cfg.pad;
    for (let i = 0; i < this.n; i++) {
      const s = this.slot(this.face[i]);
      this.xT[i] = cursor + s / 2;
      cursor += s + this.cfg.gap;
    }
    this.trackWidth = cursor - this.cfg.gap + this.cfg.pad;
  }

  get minOffset() {
    return Math.min(0, this.cfg.viewportWidth - this.trackWidth);
  }
  get maxOffset() {
    return 0;
  }

  /** Track-space x that centres hanger i in the viewport. */
  centreOffsetFor(i: number) {
    return clamp(this.cfg.viewportWidth / 2 - this.xT[i], this.minOffset, this.maxOffset);
  }

  faceOnly(i: number) {
    for (let k = 0; k < this.n; k++) this.faceT[k] = k === i ? 1 : 0;
  }

  faceNone() {
    this.faceT.fill(0);
  }

  /** Forget previous positions so a jump in offset does not read as acceleration. */
  resetMotion() {
    for (let i = 0; i < this.n; i++) {
      this.prevScreen[i] = this.offset + this.x[i];
      this.prevV[i] = 0;
    }
  }

  /** Give every hanger a nudge, as if the rail was bumped. */
  bump(strength = 1) {
    if (this.cfg.reducedMotion) return;
    for (let i = 0; i < this.n; i++) this.omega[i] += (Math.random() - 0.5) * 2.2 * strength;
  }

  /** Index of the hanger nearest the viewport centre. */
  nearestToCentre() {
    const c = this.cfg.viewportWidth / 2 - this.offset;
    let best = 0;
    let bd = Infinity;
    for (let i = 0; i < this.n; i++) {
      const d = Math.abs(this.x[i] - c);
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  }

  /** Is the sim at rest? Used to stop the animation frame loop. */
  settled() {
    if (this.dragging || this.offsetTarget !== null || this.digging) return false;
    if (Math.abs(this.vel) > 0.4) return false;
    if (this.offset > this.maxOffset + 0.5 || this.offset < this.minOffset - 0.5) return false;
    for (let i = 0; i < this.n; i++) {
      if (Math.abs(this.face[i] - this.faceT[i]) > 0.002) return false;
      if (Math.abs(this.x[i] - this.xT[i]) > 0.2) return false;
      if (Math.abs(this.omega[i]) > 0.004 || Math.abs(this.theta[i]) > 0.0015) return false;
    }
    return true;
  }

  step(dt: number) {
    const cfg = this.cfg;
    const rm = cfg.reducedMotion;
    this.time += dt;
    this.knocks.length = 0;

    // ── rail scroll ──
    if (this.digging && this.digTargetIndex >= 0) {
      const target = this.centreOffsetFor(this.digTargetIndex);
      const d = target - this.offset;
      if (Math.abs(d) < 520 || rm) {
        // settle in: critically damped spring
        this.offsetTarget = target;
        this.digging = false;
        this.faceOnly(this.digTargetIndex);
      } else {
        const dir = Math.sign(d);
        this.vel = lerp(this.vel, dir * (rm ? 2000 : 5200), 1 - Math.exp(-dt * 6));
        this.offset += this.vel * dt;
      }
    } else if (this.offsetTarget !== null) {
      const d = this.offsetTarget - this.offset;
      const k = rm ? 18 : 9;
      // spring with velocity so hangers get real acceleration
      this.vel = lerp(this.vel, d * k, 1 - Math.exp(-dt * 14));
      this.offset += this.vel * dt;
      if (Math.abs(d) < 0.5 && Math.abs(this.vel) < 2) {
        this.offset = this.offsetTarget;
        this.offsetTarget = null;
        this.vel = 0;
      }
    } else if (!this.dragging) {
      this.offset += this.vel * dt;
      this.vel *= Math.exp(-dt * (rm ? 14 : 2.6));
      if (Math.abs(this.vel) < 0.3) this.vel = 0;
      // rubber band
      if (this.offset > this.maxOffset) {
        this.offset += (this.maxOffset - this.offset) * (1 - Math.exp(-dt * 12));
        this.vel *= Math.exp(-dt * 20);
      } else if (this.offset < this.minOffset) {
        this.offset += (this.minOffset - this.offset) * (1 - Math.exp(-dt * 12));
        this.vel *= Math.exp(-dt * 20);
      }
    }

    // ── facing + layout ──
    const fk = 1 - Math.exp(-dt * (rm ? 30 : 9));
    let anchor = -1;
    let bestFace = 0.02;
    for (let i = 0; i < this.n; i++) {
      this.face[i] += (this.faceT[i] - this.face[i]) * fk;
      if (this.face[i] > bestFace) {
        bestFace = this.face[i];
        anchor = i;
      }
    }
    const anchorX = anchor >= 0 ? this.xT[anchor] : 0;
    this.layout();
    // keep the faced hanger where it is on screen: the rack parts around it
    if (anchor >= 0 && !this.digging) {
      const shift = anchorX - this.xT[anchor];
      if (shift !== 0 && this.offsetTarget === null) this.offset += shift;
    }
    const xk = 1 - Math.exp(-dt * 13);
    for (let i = 0; i < this.n; i++) this.x[i] += (this.xT[i] - this.x[i]) * xk;

    // ── sway ──
    if (rm) {
      this.theta.fill(0);
      this.omega.fill(0);
    } else {
      for (let i = 0; i < this.n; i++) {
        const screen = this.offset + this.x[i];
        const v = (screen - this.prevScreen[i]) / dt;
        let a = (v - this.prevV[i]) / dt;
        a = clamp(a, -14000, 14000);
        this.prevScreen[i] = screen;
        this.prevV[i] = v;
        const L = this.spec[i].length;
        const th = this.theta[i];
        const acc = -(G * Math.sin(th) + a * 0.3 * Math.cos(th)) / L - this.spec[i].damping * this.omega[i];
        this.omega[i] += acc * dt;
        this.theta[i] += this.omega[i] * dt;
        if (this.theta[i] > 0.48) {
          this.theta[i] = 0.48;
          this.omega[i] *= -0.3;
        } else if (this.theta[i] < -0.48) {
          this.theta[i] = -0.48;
          this.omega[i] *= -0.3;
        }
      }

      // ── knocks between neighbours ──
      for (let i = 0; i < this.n - 1; i++) {
        const j = i + 1;
        this.knockCooldown[i] = Math.max(0, this.knockCooldown[i] - dt);
        const Li = this.spec[i].length;
        const Lj = this.spec[j].length;
        const bi = this.x[i] + Math.sin(this.theta[i]) * Li;
        const bj = this.x[j] + Math.sin(this.theta[j]) * Lj;
        const hwi = lerp(4, cfg.garmentWidth / 2, this.face[i]);
        const hwj = lerp(4, cfg.garmentWidth / 2, this.face[j]);
        const gapNow = bj - bi - (hwi + hwj);
        if (gapNow < 0 && this.knockCooldown[i] <= 0) {
          const vi = Math.cos(this.theta[i]) * Li * this.omega[i];
          const vj = Math.cos(this.theta[j]) * Lj * this.omega[j];
          const rel = vj - vi; // negative = approaching
          if (rel < -8) {
            const e = 0.5;
            const oi = this.omega[i];
            const oj = this.omega[j];
            this.omega[i] = e * oj * (Lj / Li);
            this.omega[j] = e * oi * (Li / Lj);
            this.knockCooldown[i] = 0.14;
            const centre = this.offset + (this.x[i] + this.x[j]) / 2;
            this.knocks.push({
              a: i,
              b: j,
              intensity: clamp(Math.abs(rel) / 420, 0.08, 1),
              pan: clamp((centre / cfg.viewportWidth) * 2 - 1, -1, 1),
            });
          }
        }
      }
    }
  }
}
