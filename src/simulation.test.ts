import { describe, expect, it } from 'vitest';
import { boundedCrop, normalize, Simulation } from './simulation';

describe('touch vector normalization', () => {
  it.each([[0,-100,0,-1],[100,-100,1,-1],[100,0,1,0],[100,100,1,1],[0,100,0,1],[-100,100,-1,1],[-100,0,-1,0],[-100,-100,-1,-1]])('supports direction (%i, %i)', (x,y,sx,sy) => {
    const v = normalize(x,y,50);
    expect(Math.sign(Math.abs(v.x)<.0001?0:v.x)).toBe(sx);
    expect(Math.sign(Math.abs(v.y)<.0001?0:v.y)).toBe(sy);
    expect(Math.hypot(v.x,v.y)).toBeCloseTo(1);
  });
  it('ignores deadzone and saturates excessive travel', () => {
    expect(normalize(2,2,50)).toEqual({x:0,y:0});
    expect(Math.hypot(...Object.values(normalize(800,900,50)))).toBeCloseTo(1);
    expect(normalize(0,0,0)).toEqual({x:0,y:0});
  });
});

describe('local navigation model', () => {
  it('combines diagonal translation and yaw, persisting heading and position on release', () => {
    const sim = new Simulation();
    sim.translation = normalize(40,-40,50); sim.rotation={x:.7,y:0};
    for(let i=0;i<60;i++) sim.step(1/60);
    expect(sim.x).toBeGreaterThan(0); expect(sim.y).toBeGreaterThan(0); expect(sim.heading).toBeGreaterThan(3);
    const {x,y,heading}=sim.snapshot();
    sim.translation={x:0,y:0}; sim.rotation={x:0,y:0};
    for(let i=0;i<120;i++) sim.step(1/60);
    expect(sim.speed).toBe(0); expect(sim.x).toBe(x); expect(sim.y).toBe(y); expect(sim.heading).toBe(heading);
  });
  it('holds immediately, scans without motion, and resumes drive', () => {
    const sim=new Simulation(); sim.translation={x:0,y:-1};sim.step(.05);
    sim.setMode('hold'); expect(sim.speed).toBe(0);
    const before=sim.snapshot();sim.translation={x:1,y:1};sim.rotation={x:1,y:0};sim.step(.05);
    expect(sim.x).toBe(before.x);expect(sim.y).toBe(before.y);expect(sim.heading).toBe(before.heading);
    sim.setMode('scan');sim.step(.05);expect(sim.speed).toBe(0);
    sim.setMode('drive');sim.translation={x:0,y:-1};sim.step(.05);expect(sim.y).toBeGreaterThan(before.y);
    sim.reset();expect(sim.snapshot()).toMatchObject({x:0,y:0,heading:3,speed:0,distance:0,mode:'drive'});
  });
  it('caps background frame jumps and wraps heading', () => {
    const sim=new Simulation();sim.translation={x:0,y:-1};sim.rotation={x:-1,y:0};sim.step(100);
    expect(Math.hypot(sim.x,sim.y)).toBeLessThanOrEqual(.051);
    for(let i=0;i<1000;i++)sim.step(.05);
    expect(sim.heading).toBeGreaterThanOrEqual(0);expect(sim.heading).toBeLessThan(360);
  });
  it('never exposes outside the video frame over extreme and normal motion', () => {
    for(const x of [-1e9,-100,-1,0,1,100,1e9])for(const y of [-1e9,-3,0,3,1e9])for(let heading=0;heading<360;heading+=9){
      const crop=boundedCrop(x,y,heading,10);
      // A translated scaled frame must cover all four viewport edges.
      expect((crop.scale-1)*50-Math.abs(crop.x)).toBeGreaterThanOrEqual(.99);
      expect((crop.scale-1)*50-Math.abs(crop.y)).toBeGreaterThanOrEqual(.99);
    }
  });
});
