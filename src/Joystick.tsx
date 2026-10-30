import { useEffect, useRef, useState } from 'react';
import { normalize, type Vector, type Rate, ZERO } from './simulation';

type Props = { kind: 'translation' | 'rotation'; onChange: (v: Vector) => void; cancelSignal: number; rate: Rate; onRate: (rate: Rate) => void; value: string; disabled: boolean };
export function Joystick({ kind, onChange, cancelSignal, rate, onRate, value, disabled }: Props) {
  const pad = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLDivElement>(null);
  const pointer = useRef<number | null>(null);
  const callback = useRef(onChange); callback.current = onChange;
  const vector = useRef<Vector>({ ...ZERO });
  const [dragging, setDragging] = useState(false);
  const reset = () => {
    const id = pointer.current; pointer.current = null; vector.current = { ...ZERO };
    if (id !== null && pad.current?.hasPointerCapture(id)) pad.current.releasePointerCapture(id);
    if (knob.current) knob.current.style.transform = 'translate(0px, 0px)';
    setDragging(false); callback.current({ ...ZERO });
  };
  useEffect(() => { reset(); }, [cancelSignal, disabled]); // Stop on mode changes, interruption and reset.
  useEffect(() => {
    window.addEventListener('blur', reset);
    const hidden = () => { if (document.hidden) reset(); };
    document.addEventListener('visibilitychange', hidden);
    return () => { window.removeEventListener('blur', reset); document.removeEventListener('visibilitychange', hidden); callback.current({ ...ZERO }); };
  }, []);
  function move(clientX: number, clientY: number) {
    const box = pad.current!.getBoundingClientRect();
    const radius = box.width * 0.24;
    const v = normalize(clientX - box.left - box.width / 2, clientY - box.top - box.height / 2, radius);
    vector.current = v;
    knob.current!.style.transform = `translate(${v.x * radius}px, ${v.y * radius}px)`;
    callback.current(v);
  }
  return <section className={`joystick-panel panel ${kind}`} aria-label={`${kind} controls`}>
    <div className="joystick-label"><strong>{kind.toUpperCase()}</strong><span>{kind === 'translation' ? 'MOVE ROVER · DEMO' : 'STEER / YAW · DEMO'}</span></div>
    <span className="direction-line" aria-hidden="true">{kind === 'translation' ? '⟶' : '⟷'}</span>
    <div ref={pad} className={`joystick ${dragging ? 'dragging' : ''}`} role="group" aria-label={`${kind} joystick`} data-testid={`${kind}-joystick`} tabIndex={disabled ? -1 : 0} aria-disabled={disabled}
      onPointerDown={e => { if (disabled || pointer.current !== null) return; e.preventDefault(); pointer.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); move(e.clientX, e.clientY); }}
      onPointerMove={e => { if (pointer.current === e.pointerId) { e.preventDefault(); move(e.clientX, e.clientY); } }}
      onPointerUp={e => { if (pointer.current === e.pointerId) reset(); }}
      onPointerCancel={e => { if (pointer.current === e.pointerId) reset(); }}
      onLostPointerCapture={e => { if (pointer.current === e.pointerId) reset(); }}
      onKeyDown={e => {
        if (disabled || !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        const v = { ...vector.current };
        if (e.key === 'ArrowLeft') v.x = -0.75; if (e.key === 'ArrowRight') v.x = 0.75;
        if (e.key === 'ArrowUp') v.y = -0.75; if (e.key === 'ArrowDown') v.y = 0.75;
        const magnitude = Math.max(1, Math.hypot(v.x, v.y)); v.x /= magnitude; v.y /= magnitude;
        vector.current = v; callback.current(v); setDragging(true);
        if (knob.current) knob.current.style.transform = `translate(${v.x * 35}px, ${v.y * 35}px)`;
      }}
      onKeyUp={e => { if (e.key.startsWith('Arrow')) { e.preventDefault(); reset(); } }} onBlur={reset}>
      <div className="outer-ring" /><div className="inner-ring" /><div className="luminous-ring" />
      <i className="arrow north" /><i className="arrow south" /><i className="arrow west" /><i className="arrow east" />
      <div className="knob" ref={knob}><div className="knob-cap" /></div>
    </div>
    <div className="rate-control"><span>{kind === 'translation' ? 'SPEED' : 'TURN RATE'}</span>
      {(['fast', 'normal', 'slow'] as const).map(r => <button key={r} className={rate === r ? 'selected' : ''} aria-pressed={rate === r} onClick={() => onRate(r)} aria-label={`${kind} ${r}`}>{r === 'slow' && kind === 'rotation' ? 'PRECISE' : r.toUpperCase()}</button>)}
    </div>
    <div className="joystick-readout"><strong data-testid={`${kind}-value`}>{value}</strong><span>{kind === 'translation' ? 'VELOCITY · SIM' : 'HEADING · SIM'}</span></div>
  </section>;
}
