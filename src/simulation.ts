export type Vector = { x: number; y: number };
export type Mode = 'drive' | 'hold' | 'scan';
export type Rate = 'slow' | 'normal' | 'fast';
export const ZERO: Vector = { x: 0, y: 0 };
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function normalize(x: number, y: number, radius: number, deadzone = 0.09): Vector {
  const distance = Math.hypot(x, y) / radius;
  if (distance <= deadzone || radius <= 0) return { ...ZERO };
  const magnitude = (Math.min(distance, 1) - deadzone) / (1 - deadzone);
  const angle = Math.atan2(y, x);
  return { x: Math.cos(angle) * magnitude, y: Math.sin(angle) * magnitude };
}

export function boundedCrop(x: number, y: number, yaw: number, speed: number) {
  const scale = 1.22 + Math.min(0.08, Math.abs(speed) * 0.04);
  const limit = (scale - 1) * 50 - 1;
  return {
    x: clamp(Math.tanh(x / 7) * 5 + Math.sin(yaw * Math.PI / 180) * 3, -limit, limit),
    y: clamp(Math.tanh(y / 8) * 4, -limit, limit),
    scale,
  };
}

export class Simulation {
  translation: Vector = { ...ZERO };
  rotation: Vector = { ...ZERO };
  x = 0;
  y = 0;
  heading = 3;
  speed = 0;
  distance = 0;
  time = 0;
  mode: Mode = 'drive';
  rate: Rate = 'normal';
  turnRate: Rate = 'normal';
  reset() {
    this.stop(); this.x = 0; this.y = 0; this.heading = 3;
    this.distance = 0; this.time = 0; this.mode = 'drive';
    this.rate = this.turnRate = 'normal';
  }
  stop() { this.translation = { ...ZERO }; this.rotation = { ...ZERO }; this.speed = 0; }
  setMode(mode: Mode) { this.mode = mode; this.stop(); }
  step(elapsed: number) {
    const dt = clamp(elapsed, 0, 0.05);
    this.time += dt;
    const multiplier = { slow: 0.4, normal: 1, fast: 1.8 }[this.rate];
    const turning = { slow: 0.4, normal: 1, fast: 1.8 }[this.turnRate];
    const driving = this.mode === 'drive';
    const vx = driving ? this.translation.x * multiplier : 0;
    const vy = driving ? -this.translation.y * multiplier : 0;
    const targetSpeed = Math.hypot(vx, vy);
    this.speed += (targetSpeed - this.speed) * (1 - Math.exp(-dt * 14));
    if (this.speed < 0.001) this.speed = 0;
    this.heading = (this.heading + (driving ? this.rotation.x * turning * 32 * dt : 0) + 360) % 360;
    const angle = this.heading * Math.PI / 180;
    this.x += (vx * Math.cos(angle) + vy * Math.sin(angle)) * dt;
    this.y += (vy * Math.cos(angle) - vx * Math.sin(angle)) * dt;
    this.distance += targetSpeed * dt;
  }
  snapshot() {
    return { x: this.x, y: this.y, heading: this.heading, speed: this.speed, distance: this.distance,
      time: this.time, mode: this.mode, crop: boundedCrop(this.x, this.y, this.heading, this.speed),
      front: 1.2 + Math.sin(this.y * 0.35) * 0.3,
      left: 2.8 + Math.sin(this.x * 0.3) * 0.4,
      right: 2.4 - Math.sin(this.x * 0.3) * 0.4,
      rear: 3.6 + Math.sin(this.y * 0.2) * 0.3,
      elevation: 1842 + Math.sin(this.y / 3) * 7,
    };
  }
}
export type Telemetry = ReturnType<Simulation['snapshot']>;
