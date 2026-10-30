import { useId } from 'react';
import type { Telemetry } from './simulation';
import { Icon } from './Icon';

// A deterministic height field, traced with marching squares. These are simulated
// contours, not a map of the camera image or any real location.
function makeContours() {
  const height = (x: number, y: number) => Math.sin(x / 39 + Math.sin(y / 48)) * 12 + Math.cos(y / 31) * 9 + Math.sin((x + y) / 65) * 13 + Math.cos(Math.hypot(x - 155, y - 140) / 18) * 8;
  const paths: { d: string; major: boolean }[] = [];
  for (let level = -36; level <= 36; level += 2) {
    let d = '';
    for (let y = 0; y < 300; y += 5) for (let x = 0; x < 300; x += 5) {
      const corners = [[x, y], [x + 5, y], [x + 5, y + 5], [x, y + 5]];
      const points: number[][] = [];
      for (let i = 0; i < 4; i++) {
        const a = corners[i], b = corners[(i + 1) % 4];
        const va = height(a[0], a[1]), vb = height(b[0], b[1]);
        if ((va < level) !== (vb < level)) {
          const t = (level - va) / (vb - va);
          points.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
        }
      }
      for (let i = 0; i + 1 < points.length; i += 2) d += `M${points[i][0].toFixed(1)},${points[i][1].toFixed(1)}L${points[i+1][0].toFixed(1)},${points[i+1][1].toFixed(1)}`;
    }
    paths.push({ d, major: level % 8 === 0 });
  }
  return paths;
}
const contours = makeContours();

export function TerrainMap({ data, expanded = false, onExpand, trail }: { data: Telemetry; expanded?: boolean; onExpand?: () => void; trail: string }) {
  const id = useId();
  return <section className={`terrain panel ${data.mode === 'scan' ? 'scanning' : ''} ${expanded ? 'expanded-map' : ''}`} aria-label="Simulated terrain map">
    <div className="panel-title"><span>TERRAIN MAP</span><small className="cyan"><i className="status-dot" />{data.mode === 'scan' ? 'SIM SCAN' : 'SIMULATED'}</small>{onExpand && <button className="icon-button" aria-label="Expand terrain map" onClick={onExpand}><Icon name="expand" /></button>}</div>
    <div className="map-inner"><svg viewBox="0 0 300 300" preserveAspectRatio="none" role="img" aria-label="Local simulated contours and navigation path">
      <defs><radialGradient id={id}><stop stopColor="#055a67" stopOpacity=".65"/><stop offset="1" stopColor="#031014"/></radialGradient></defs>
      <rect width="300" height="300" fill={`url(#${id})`} />
      <g fill="none">{contours.map((p, i) => <path key={i} d={p.d} stroke={p.major ? '#0db6c7' : '#08707c'} strokeWidth={p.major ? '.8' : '.45'} opacity={p.major ? '.7' : '.6'} />)}</g>
      <g className="map-grid" stroke="#4ae4e6" opacity=".1">{[60,120,180,240].map(n => <path key={n} d={`M${n} 0V300 M0 ${n}H300`} />)}</g>
      <path d="M232 284 Q253 238 204 210 T152 151" fill="none" stroke="#ffb346" strokeWidth="2" strokeDasharray="5 5" opacity=".6" />
      <path d={trail} fill="none" stroke="#ffbd5b" strokeWidth="2.3" />
      <g transform={`translate(${150 + Math.tanh(data.x / 20) * 90} ${150 - Math.tanh(data.y / 20) * 90}) rotate(${data.heading})`}><circle r="16" fill="#ffb44b" opacity=".12" /><path d="M0-13 8 9 0 5-8 9Z" fill="#ffb54c" stroke="#ffe2ac" /></g>
      {data.mode === 'scan' && <circle className="map-sweep" cx="150" cy="150" r="90" fill="none" stroke="#1be5eb" opacity=".7" />}
      <g stroke="#74c5cf" fill="none"><path d="M12 273v8h56v-8"/></g><text x="18" y="270" fill="#a7c6d6" fontSize="11">50 m · SIM</text>
    </svg><div className="height-scale"><span>HI<br/>+12 m</span><i/><span>0 m</span><span>−12 m</span></div></div>
  </section>;
}

export function TopRover() {
  return <svg className="top-rover" viewBox="0 0 180 240" role="img" aria-label="Six-wheel GADV rover plan, white chassis and green suspension">
    <defs><linearGradient id="body" x2="1" y2="1"><stop stopColor="#eef2ef"/><stop offset=".5" stopColor="#b9ccc4"/><stop offset="1" stopColor="#7d948b"/></linearGradient><linearGradient id="tyre"><stop stopColor="#11181a"/><stop offset=".5" stopColor="#3a4143"/><stop offset="1" stopColor="#05090b"/></linearGradient></defs>
    {[53,117,177].map(y => <g key={y}>{[24,140].map(x => <g key={x}><rect x={x} y={y} width="20" height="38" rx="8" fill="url(#tyre)" stroke="#52616a"/>{[6,12,18,24,30].map(n=><path key={n} d={`M${x+2} ${y+n}h16`} stroke="#0c1418"/>)}</g>)}<path d={`M37 ${y+20}H64 M118 ${y+20}h28`} stroke="#3eaa70" strokeWidth="8"/><circle cx="44" cy={y+20} r="5" fill="#c0d0c9"/><circle cx="139" cy={y+20} r="5" fill="#c0d0c9"/></g>)}
    <path d="M60 62 42 78l9 58-8 59 18 9 M121 62l18 16-9 58 9 59-18 9" fill="none" stroke="#21814d" strokeWidth="8"/>
    <rect x="59" y="44" width="64" height="162" rx="5" fill="#183b30" stroke="#578274"/><rect x="65" y="57" width="52" height="132" rx="3" fill="url(#body)" stroke="#dce9e4"/>
    {[68,178].map(y => <g key={y}><circle cx="71" cy={y} r="2" fill="#18252a"/><circle cx="111" cy={y} r="2" fill="#18252a"/></g>)}
    <rect x="68" y="37" width="19" height="12" rx="3" fill="#23353d" stroke="#849ba5"/><rect x="94" y="37" width="19" height="12" rx="3" fill="#23353d" stroke="#849ba5"/>
    <path d="M82 122h18 M91 113v18" stroke="#337753" opacity=".6"/>
  </svg>;
}

export function Proximity({ data }: { data: Telemetry }) {
  return <section className={`proximity panel ${data.mode === 'scan' ? 'scanning' : ''}`} aria-label="Simulated ultrasonic distances">
    <div className="panel-title"><span>ULTRASONIC / DISTANCE</span><small>SIM</small></div>
    <div className="proximity-body"><svg className="sonar-arcs" viewBox="0 0 300 240" preserveAspectRatio="none" aria-hidden="true"><path d="M124 38Q150 25 176 38 M119 26Q150 12 181 26 M113 12Q150-3 187 12" stroke="#ffb743" fill="none"/><path d="M125 204Q150 216 175 204 M120 218Q150 234 180 218" stroke="#00e5ee" fill="none"/><path className="sonar-beam" d="M150 100 113 12Q150-3 187 12Z" fill="#ffb54c" opacity=".08"/></svg>
      <TopRover />
      {(['front','left','right','rear'] as const).map(side=><div key={side} className={`distance distance-${side}`}><span>{side.toUpperCase()}</span><strong>{data[side].toFixed(1)} m</strong><i style={{ width: `${Math.min(100, data[side] * 23)}%` }}/></div>)}
    </div>
  </section>;
}

export function Elevation({ data }: { data: Telemetry }) {
  const points = Array.from({length: 70}, (_, i) => `${i * 5},${49 - (Math.sin(i / 8 + data.y / 9) * 15 + Math.cos(i / 4) * 4)}`).join(' ');
  return <section className="elevation panel" aria-label="Simulated elevation profile"><div className="chart"><span>ELEVATION (m) · SIM</span><svg viewBox="0 0 390 100" preserveAspectRatio="none" role="img" aria-label="Synthetic elevation profile"><g stroke="#29434b" strokeWidth=".5">{[12,38,65,92].map(y=><path key={y} d={`M42 ${y}H387`}/>)}{[42,100,160,220,280,340,386].map(x=><path key={x} d={`M${x} 6V94`}/>)}</g><g fill="#92b4c6" fontSize="10"><text x="0" y="20">1,860</text><text x="0" y="48">1,840</text><text x="0" y="77">1,820</text></g><polyline points={points} transform="translate(42 5)" fill="none" stroke="#13dce7" strokeWidth="1.5"/><circle cx="204" cy={54 - (Math.sin(32/8 + data.y/9)*15+Math.cos(8)*4)} r="4" fill="#ffb84d"/></svg></div><div className="slope"><span>SLOPE · SIM</span><strong>{(6 + Math.sin(data.y / 3) * 2).toFixed(0)}°</strong><span>CONTOUR</span><strong className="cyan">LOCAL</strong></div><div className="contour-thumb" aria-hidden="true"><svg viewBox="0 0 300 300">{contours.filter((_,i)=>i%2===0).map((p,i)=><path key={i} d={p.d} fill="none" stroke="#4b8184" strokeWidth="1.5"/>)}</svg><Icon name="box"/></div></section>;
}

export function Hud({ data, live, reticle }: { data: Telemetry; live: boolean; reticle: boolean }) {
  const heading = `${Math.round(data.heading).toString().padStart(3, '0')}°`;
  return <div className={`hud ${reticle ? '' : 'hud-minimal'}`} aria-hidden="true">
    <div className="compass"><div className="compass-ticks">{Array.from({length: 11},(_,i)=><span key={i} style={{left:`${50+(i-5)*16.6667-(data.heading%30)/30*16.6667}%`}}>{((Math.floor(data.heading/30)-5+i)*30+720)%360 === 0 ? 'N' : ((Math.floor(data.heading/30)-5+i)*30+720)%360}</span>)}</div><i/><strong>{heading}</strong></div>
    <div className={`camera-badge ${live ? 'active' : ''}`}>{live ? <><i className="status-dot"/> LOCAL LIVE</> : 'PREVIEW OFF'}<span>IPAD {live ? 'CAMERA' : 'REAR CAMERA'}</span></div>
    <svg className="hud-art" viewBox="0 0 680 540" preserveAspectRatio="none"><defs><linearGradient id="hudFade" x2="0" y2="1"><stop stopColor="#81e8e9" stopOpacity="0"/><stop offset="1" stopColor="#81e8e9" stopOpacity=".5"/></linearGradient></defs><g className="hud-grid" stroke="url(#hudFade)" fill="none" strokeWidth="1">{[-240,-120,0,120,240,360,480,600,720,840,960].map(x=><path key={x} d={`M340 330  ${x} 540`}/>)}{[358,380,410,449,492,539].map(y=><path key={y} d={`M0 ${y}H680`}/>)}</g><g className="hud-reticle" transform={`translate(${data.crop.x * 1.5} ${data.crop.y})`} fill="none" stroke="#66e8ed"><path d="M234 211a135 135 0 0 0 0 151 M446 211a135 135 0 0 1 0 151" strokeWidth="2"/><circle cx="340" cy="287" r="21" stroke="#b6e9ef"/><path d="M340 257v15 M340 302v15 M310 287h15 M355 287h15" stroke="#b6e9ef"/><circle cx="340" cy="287" r="2"/></g><g stroke="#bbdce7" fill="none"><path d="M31 184h9 M31 184v150h9 M31 221h7 M31 259h12 M31 296h7"/></g><g fill="#bbdce7" fontSize="12"><text x="47" y="187">20</text><text x="47" y="225">10</text><text x="47" y="262">0</text><text x="47" y="300">−10</text><text x="47" y="337">−20</text></g><path d="M24 253 38 259 24 265Z" fill="#ffb54c"/>
      {data.mode === 'scan' && <path className="hud-scan" d="M0 0H680V2H0Z" fill="#09e2ea"/>}
    </svg>
    <div className="range"><strong>{data.front.toFixed(1)} m</strong><span>SIM TARGET</span></div>
    <div className="terrain-badge">{data.mode === 'hold' ? 'POSITION HOLD' : data.mode === 'scan' ? 'ULTRASONIC SCAN' : 'TERRAIN: SIMULATED'}<span>SLOPE {(6 + Math.sin(data.y/3)*2).toFixed(0)}° <i/> ELEV {data.elevation.toFixed(0)} m</span></div>
    <span className="camera-disclosure">FIXED CAMERA · DIGITAL CROP ONLY</span>
  </div>;
}
