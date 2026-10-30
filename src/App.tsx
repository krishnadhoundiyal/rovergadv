import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { CameraController, cameraMessages } from './camera';
import { Simulation, type Mode, type Rate } from './simulation';
import { Joystick } from './Joystick';
import { Elevation, Hud, Proximity, TerrainMap } from './Instruments';
import { Icon, type IconName } from './Icon';

type Dialog = 'settings' | 'sensors' | 'payload' | 'camera' | 'map' | null;
const formatTime = (seconds: number) => new Date(Math.floor(seconds) * 1000).toISOString().slice(11,19);

export function App() {
  const [sim] = useState(() => new Simulation());
  const [camera] = useState(() => new CameraController());
  const cameraState = useSyncExternalStore(camera.subscribe, camera.snapshot);
  const [data, setData] = useState(() => sim.snapshot());
  const [rate, setRate] = useState<Rate>('normal');
  const [turnRate, setTurnRate] = useState<Rate>('normal');
  const [cancelSignal, cancel] = useState(0);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [boot, setBoot] = useState(true);
  const [lights, setLights] = useState(false);
  const [beacon, setBeacon] = useState(false);
  const [reticle, setReticle] = useState(true);
  const [notice, setNotice] = useState('');
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const trail = useRef('M150 150');
  const points = useRef(['M150 150']);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const live = cameraState === 'active';
  const cameraPending = cameraState === 'requesting' || cameraState === 'starting';
  const stop = () => { sim.stop(); cancel(n => n+1); };

  useEffect(() => {
    camera.attach(video.current!);
    let last = performance.now(), paint = 0, lastTrail = 0, raf = 0;
    const tick = (now: number) => {
      sim.step((now - last) / 1000); last = now;
      const snapshot = sim.snapshot();
      if (frame.current) frame.current.style.transform = `translate(${snapshot.crop.x}%, ${snapshot.crop.y}%) scale(${snapshot.crop.scale})`;
      if (now - paint > 100) { setData(snapshot); paint = now; }
      if (snapshot.speed > .01 && now - lastTrail > 600) {
        points.current.push(`L${(150+Math.tanh(snapshot.x/20)*90).toFixed(1)} ${(150-Math.tanh(snapshot.y/20)*90).toFixed(1)}`);
        if (points.current.length > 160) { points.current.shift(); points.current[0] = points.current[0].replace('L', 'M'); }
        trail.current = points.current.join(' '); lastTrail = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const blur = () => { sim.stop(); cancel(n => n+1); };
    let resume = false;
    const visibility = () => {
      blur();
      if (document.hidden) { resume = camera.state === 'active' || camera.state === 'starting'; camera.release('paused'); }
      else if (resume) { resume = false; void camera.start(); }
    };
    const pagehide = () => { blur(); camera.release('paused'); };
    const resize = () => { if (window.innerHeight > window.innerWidth) blur(); };
    window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pagehide);
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(raf); camera.detach(); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', pagehide); window.removeEventListener('resize', resize); };
  }, [sim, camera]);

  useEffect(() => { if (!live) stop(); }, [live]);
  useEffect(() => { const timer = setTimeout(() => setBoot(false), 2600); return () => clearTimeout(timer); }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(''), 3400); return () => clearTimeout(timer); }, [notice]);
  useEffect(() => {
    if (dialog) { stop(); dialogRef.current?.showModal(); }
    else dialogRef.current?.close();
  }, [dialog]);

  function mode(next: Mode) { sim.setMode(next); cancel(n=>n+1); setData(sim.snapshot()); }
  function reset() {
    sim.reset(); points.current = ['M150 150']; trail.current = 'M150 150';
    setRate('normal'); setTurnRate('normal'); setLights(false); setBeacon(false); setReticle(true);
    cancel(n=>n+1); setData(sim.snapshot()); setDialog(null); setNotice('Demo reset. Ready for your next take.');
  }
  function cameraAction() { if (live) setDialog('camera'); else void camera.start('environment'); }
  const statusRows: { icon: IconName; label: string; value: string; color?: string }[] = [
    { icon: 'battery', label: 'BATTERY · SIM', value: '78%', color: 'green' },
    { icon: 'pulse', label: 'SYSTEM · SIM', value: 'Nominal', color: 'green' },
    { icon: 'temperature', label: 'TEMPERATURE · SIM', value: '24.6 °C' },
    { icon: 'pressure', label: 'PRESSURE · SIM', value: '101.3 kPa' },
    { icon: 'signal', label: 'DATA SOURCE', value: 'Local demo', color: 'cyan' },
  ];
  return <main className={`cockpit ${reducedMotion ? 'reduced-motion' : ''} ${lights ? 'lights-on' : ''} ${beacon ? 'beacon-on' : ''}`}>
    <header className="header">
      <div className="brand"><svg viewBox="0 0 30 36" aria-hidden="true"><path d="m15 3 7 9-7 8-7-8Zm0 17L4 32m11-12 11 12" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg><div><h1>GADV D4-S</h1><span>EXPLORATION ROVER</span></div></div>
      <div className="mission-status"><strong><i className="status-dot"/> DEMO <em>MODE</em></strong><span>SIMULATED CONTROLS · LOCAL ONLY</span></div>
      <div className="header-camera"><Icon name="camera"/><div>IPAD {live && camera.facing === 'user' ? 'FRONT' : 'REAR'} CAMERA<span>{live ? 'LOCAL PREVIEW ACTIVE' : cameraPending ? 'AWAITING PREVIEW' : 'PREVIEW OFF'}</span></div></div>
      <div className="mission-clock"><span>DEMO SESSION</span><strong>{formatTime(data.time)}</strong></div>
      <button className="icon-button settings-button" aria-label="Open settings" onClick={()=>setDialog('settings')}><Icon name="settings"/></button>
    </header>

    <div className="upper">
      <aside className="left-instruments">
        <section className="status-panel panel" aria-label="Simulated rover status"><div className="panel-title">▾ ROVER STATUS <small>SIMULATED</small></div>
          <div className="status-rows">{statusRows.map(row=><button className="status-row" key={row.label} onClick={()=>setDialog('sensors')}><Icon name={row.icon}/><div><span>{row.label}</span>{row.icon === 'battery' && <i className="battery-bar"><i/></i>}</div><strong className={row.color}>{row.value}</strong><span className="chevron">›</span></button>)}</div>
        </section>
        <section className="vehicle panel" aria-label="GADV D4-S vehicle"><div className="panel-title">VEHICLE — GADV D4-S</div><div className="vehicle-inner"><div className="vehicle-image"><img src={`${import.meta.env.BASE_URL}rover-white-green.png`} alt="GADV D4-S: CAD-based white chassis, green suspension, six wheels and twin ultrasonic sensors"/><div className="floor-grid"/></div><div className="vehicle-specs"><span>CHASSIS<strong>6 WHEEL</strong></span><span>SENSORS<strong>SIMULATED</strong></span><span>PAYLOAD<strong>PREVIEW</strong></span><span>CONTROL<strong>LOCAL</strong></span></div></div></section>
      </aside>

      <section className={`camera-panel panel ${live ? 'has-video' : ''}`} aria-label="iPad local camera and simulated HUD" data-mode={data.mode}>
        <div className="video-crop" ref={frame}><video ref={video} autoPlay muted playsInline aria-label="Local iPad camera preview"/></div>
        {!live && <div className="camera-fallback"><div className="fallback-rings"/><Icon name="camera"/><h2>{cameraState === 'idle' ? 'A window into your world.' : cameraState === 'paused' ? 'Preview paused' : cameraPending ? 'Preparing your view' : 'Camera preview unavailable'}</h2><p role="status">{cameraMessages[cameraState]}</p>
          <button className="enable-camera" disabled={cameraPending} onClick={()=>void camera.start('environment')}><Icon name="camera"/>{cameraPending ? 'WAITING FOR CAMERA…' : cameraState === 'idle' ? 'ENABLE CAMERA' : 'RETRY CAMERA'}</button>
          {cameraPending && <button className="text-button" onClick={()=>camera.release('idle')}>Cancel camera request</button>}
          <span className="fallback-note">LOCAL PREVIEW ONLY · NO RECORDING OR UPLOAD</span>
        </div>}
        <Hud data={data} live={live} reticle={reticle}/>
        {lights && <div className="light-overlay"/>}{beacon && <div className="beacon-indicator"><i/> DEMO BEACON</div>}
      </section>

      <aside className="right-instruments"><Proximity data={data}/><TerrainMap data={data} trail={trail.current} onExpand={()=>setDialog('map')}/></aside>
    </div>

    <div className="lower">
      <Joystick kind="translation" rate={rate} onRate={r=>{setRate(r); sim.rate=r;}} onChange={v=>{sim.translation=v;}} cancelSignal={cancelSignal} value={`${data.speed.toFixed(1)} m/s`} disabled={data.mode !== 'drive'}/>
      <div className="center-controls"><Elevation data={data}/><div className="mode-controls">
        <button className={data.mode==='scan'?'selected':''} aria-pressed={data.mode==='scan'} onClick={()=>mode('scan')}><Icon name="scan"/><strong>SCAN</strong><span>TERRAIN & MAPPING</span></button>
        <button className={data.mode==='hold'?'selected':''} aria-pressed={data.mode==='hold'} onClick={()=>mode('hold')}><Icon name="hold"/><strong>HOLD</strong><span>STABILIZE POSITION</span></button>
        <button className={data.mode==='drive'?'selected':''} aria-pressed={data.mode==='drive'} onClick={()=>mode('drive')}><Icon name="drive"/><strong>DRIVE MODE</strong><span>EXPLORATION</span></button>
      </div><nav className="utility-controls" aria-label="Cockpit utilities">
        <button className={live?'selected':''} disabled={cameraPending} aria-pressed={live} onClick={cameraAction}><Icon name="camera"/><span>CAMERA</span></button>
        <button className={lights?'selected':''} aria-pressed={lights} onClick={()=>{setLights(v=>!v); setNotice(`Demo view lighting ${lights?'off':'on'}. Local display effect.`);}}><Icon name="sun"/><span>LIGHTS</span></button>
        <button className={dialog==='sensors'?'selected':''} onClick={()=>setDialog('sensors')}><Icon name="scan"/><span>SENSORS</span></button>
        <button className={beacon?'selected':''} aria-pressed={beacon} onClick={()=>{setBeacon(v=>!v); setNotice(`Demo beacon ${beacon?'off':'on'}. Local indicator only.`);}}><Icon name="beacon"/><span>BEACON</span></button>
        <button onClick={()=>setDialog('payload')}><Icon name="box"/><span>PAYLOAD</span></button>
      </nav></div>
      <Joystick kind="rotation" rate={turnRate} onRate={r=>{setTurnRate(r); sim.turnRate=r;}} onChange={v=>{sim.rotation=v;}} cancelSignal={cancelSignal} value={`${Math.round(data.heading).toString().padStart(3,'0')}°`} disabled={data.mode !== 'drive'}/>
    </div>
    <footer className="disclosure"><span>DEMO · SIMULATED CONTROLS & INSTRUMENTS</span><span>NO ROVER CONNECTION</span><button onClick={reset}><Icon name="reset"/> DEMO RESET</button></footer>
    {boot && <div className="boot-status"><i className="status-dot"/><span>GADV D4-S · INITIALIZING LOCAL COCKPIT</span><button onClick={()=>setBoot(false)}>SKIP INTRO</button></div>}
    {notice && <div className="toast" role="status">{notice}</div>}
    <div className="portrait-hint"><svg viewBox="0 0 100 80" aria-hidden="true"><rect x="15" y="18" width="70" height="46" rx="6" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M35 5Q80-6 93 22m0-13v13H80" fill="none" stroke="currentColor" strokeWidth="2"/></svg><h2>Explore in landscape.</h2><p>Rotate your iPad for the GADV D4-S cockpit.</p><span>LOCAL CAMERA · SIMULATED EXPLORATION</span></div>

    <dialog ref={dialogRef} className={`cockpit-dialog ${dialog==='map'?'map-dialog':''}`} onCancel={()=>setDialog(null)} onClick={e=>{if(e.target===e.currentTarget)setDialog(null);}} aria-labelledby="dialog-title">
      <div className="dialog-heading"><span>GADV D4-S / LOCAL DEMO</span><button className="icon-button" aria-label="Close dialog" onClick={()=>setDialog(null)}><Icon name="close"/></button></div>
      <h2 id="dialog-title">{dialog==='settings'?'Cockpit settings':dialog==='sensors'?'Simulated instruments':dialog==='payload'?'Payload preview':dialog==='camera'?'Local camera': 'Simulated terrain'}</h2>
      {dialog==='settings' && <><p>A camera-led showcase. All motion, headings, distances and instruments are simulated locally. Nothing connects to the rover.</p><label className="toggle"><span>Minimal HUD</span><input type="checkbox" checked={!reticle} onChange={e=>setReticle(!e.target.checked)}/></label><label className="toggle"><span>Reduce decorative motion</span><input type="checkbox" checked={reducedMotion} onChange={e=>setReducedMotion(e.target.checked)}/></label><p className="dialog-small">Touch both joysticks together, or focus a joystick and use arrow keys. HOLD stops motion. SCAN shows a synthetic ultrasonic sweep. Digital crop cannot change the camera’s physical direction.</p><button className="dialog-action" onClick={reset}><Icon name="reset"/> Demo Reset</button></>}
      {dialog==='sensors' && <><p>These values come from a local simulation. No sensor readings are received or transmitted.</p><dl><div><dt>DS18B20 · Temperature</dt><dd>24.6 °C <small>SIM</small></dd></div><div><dt>BMP280 · Pressure</dt><dd>101.3 kPa <small>SIM</small></dd></div><div><dt>BMP280 · Temperature</dt><dd>24.4 °C <small>SIM</small></dd></div><div><dt>HC-SR04+ · Front distance</dt><dd>{data.front.toFixed(1)} m <small>SIM</small></dd></div><div><dt>Virtual position · X / Y</dt><dd>{data.x.toFixed(1)} / {data.y.toFixed(1)} m</dd></div><div><dt>Virtual path length</dt><dd>{data.distance.toFixed(1)} m</dd></div></dl></>}
      {dialog==='payload' && <><div className="payload-illustration"><img src={`${import.meta.env.BASE_URL}rover-white-green.png`} alt="GADV white and green CAD-based rover"/></div><p>The rectangular upper enclosure and suspension follow the supplied GADV CAD reference. White chassis, green structural arms, six wheels.</p><p className="dialog-small">This is a visual payload preview. No physical actuator, payload release or hardware command is available.</p></>}
      {dialog==='camera' && <><p>{cameraMessages[cameraState]} · {camera.facing==='environment'?'Rear-facing preference':'Front-facing fallback'}. Your browser chooses the available camera.</p><p className="dialog-small">Only video is requested. No microphone, recording, media upload or remote camera transport. Camera tracks stop when hidden.</p><div className="dialog-actions"><button className="dialog-action" onClick={()=>{setDialog(null);void camera.start(camera.facing==='environment'?'user':'environment');}}>Switch camera</button><button className="dialog-action" onClick={()=>{camera.release('idle');setDialog(null);}}>Stop camera</button></div></>}
      {dialog==='map' && <><p>Procedural contours and a virtual path. No GPS, location access or camera-based mapping.</p><TerrainMap data={data} trail={trail.current} expanded/></>}
    </dialog>
  </main>;
}
