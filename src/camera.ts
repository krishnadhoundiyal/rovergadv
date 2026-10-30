export type CameraState = 'idle' | 'requesting' | 'starting' | 'active' | 'paused' | 'denied' | 'insecure' | 'unavailable' | 'busy' | 'interrupted' | 'error';
export const cameraMessages: Record<CameraState, string> = {
  idle: 'Your view. Your iPad camera.', requesting: 'Waiting for camera permission…',
  starting: 'Preparing the camera preview…', active: 'Local camera preview',
  paused: 'Camera paused while this cockpit is in the background.',
  denied: 'Camera access is blocked. Allow Camera in Safari’s website settings, then retry.',
  insecure: 'The camera needs HTTPS. Open the secure GitHub Pages address in Safari.',
  unavailable: 'No camera is available on this device. You can still explore the local controls.',
  busy: 'The camera is busy. Close other camera apps, then retry.',
  interrupted: 'The camera preview was interrupted. Tap Retry camera to resume.',
  error: 'The preview could not start. Check camera access, then retry.',
};

/** Owns camera tracks and stale requests; has no recording or transport capability. */
export class CameraController {
  state: CameraState = 'idle';
  stream: MediaStream | null = null;
  facing: 'environment' | 'user' = 'environment';
  private revision = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private listeners = new Set<() => void>();
  private video: HTMLVideoElement | null = null;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  snapshot = () => this.state;
  private emit(state: CameraState) { this.state = state; this.listeners.forEach(fn => fn()); }
  private playing = () => {
    if (this.stream?.getVideoTracks().some(t => t.readyState === 'live') && this.video && !this.video.paused && this.video.readyState >= 2) {
      clearTimeout(this.timer); this.emit('active');
    }
  };
  private interrupted = () => { if (this.stream) this.release('interrupted'); };
  private waiting = () => {
    if (this.stream && this.state === 'active') {
      this.emit('starting'); clearTimeout(this.timer);
      this.timer = setTimeout(() => this.release('interrupted'), 12000);
    }
  };
  private play = () => {
    const revision = this.revision;
    const result = this.video?.play();
    result?.then(() => { if (revision === this.revision) this.playing(); }).catch(() => { if (revision === this.revision && this.stream) this.release('interrupted'); });
  };
  attach(video: HTMLVideoElement) {
    this.video = video;
    video.addEventListener('loadedmetadata', this.play);
    video.addEventListener('playing', this.playing);
    video.addEventListener('error', this.interrupted);
    video.addEventListener('pause', this.waiting);
    video.addEventListener('waiting', this.waiting);
    video.addEventListener('stalled', this.waiting);
  }
  detach() {
    this.release('idle');
    this.video?.removeEventListener('loadedmetadata', this.play);
    this.video?.removeEventListener('playing', this.playing);
    this.video?.removeEventListener('error', this.interrupted);
    this.video?.removeEventListener('pause', this.waiting);
    this.video?.removeEventListener('waiting', this.waiting);
    this.video?.removeEventListener('stalled', this.waiting);
    this.video = null;
  }
  release(state: CameraState = 'paused') {
    this.revision++; clearTimeout(this.timer);
    const stream = this.stream; this.stream = null;
    stream?.getTracks().forEach(t => { t.removeEventListener('ended', this.interrupted); t.removeEventListener('mute', this.interrupted); t.stop(); });
    if (this.video) this.video.srcObject = null;
    this.emit(state);
  }
  async start(facing = this.facing) {
    this.release('idle'); this.facing = facing;
    if (!window.isSecureContext) { this.emit('insecure'); return; }
    if (!navigator.mediaDevices?.getUserMedia) { this.emit('unavailable'); return; }
    const revision = this.revision;
    this.emit('requesting');
    // A delayed permission prompt remains user-controlled; cancel/retry invalidates it.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } } });
      if (revision !== this.revision || !this.video) { stream.getTracks().forEach(t => t.stop()); return; }
      this.stream = stream;
      const actual = stream.getVideoTracks()[0]?.getSettings?.().facingMode;
      if (actual === 'user' || actual === 'environment') this.facing = actual;
      stream.getVideoTracks().forEach(t => { t.addEventListener('ended', this.interrupted); t.addEventListener('mute', this.interrupted); });
      this.emit('starting'); this.video.srcObject = stream;
      this.timer = setTimeout(() => this.release('interrupted'), 12000);
      this.play();
    } catch (error) {
      if (revision !== this.revision) return;
      // DOMException can originate in another realm and need not pass instanceof Error.
      const name = typeof error === 'object' && error !== null && 'name' in error && typeof error.name === 'string' ? error.name : '';
      this.emit(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : name === 'NotFoundError' || name === 'OverconstrainedError' ? 'unavailable' : name === 'NotReadableError' || name === 'AbortError' ? 'busy' : 'error');
    }
  }
}
