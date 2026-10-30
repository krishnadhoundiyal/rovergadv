import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Joystick } from './Joystick';
import type { Vector } from './simulation';

describe('independent joystick ownership and interruptions',()=>{
  beforeEach(()=>{
    vi.stubGlobal('PointerEvent',MouseEvent);
    Element.prototype.setPointerCapture=vi.fn();Element.prototype.releasePointerCapture=vi.fn();Element.prototype.hasPointerCapture=vi.fn(()=>true);
    vi.spyOn(Element.prototype,'getBoundingClientRect').mockReturnValue({left:0,top:0,width:200,height:200,right:200,bottom:200,x:0,y:0,toJSON:()=>({})});
  });
  afterEach(()=>{cleanup();vi.unstubAllGlobals();});
  function pointer(target:Element,type:string,id:number,x=100,y=100){
    const event=new MouseEvent(type,{bubbles:true,clientX:x,clientY:y});Object.defineProperty(event,'pointerId',{value:id});fireEvent(target,event);
  }
  it('keeps two simultaneous pointers independent and resets on release/cancel',()=>{
    const left=vi.fn<(v:Vector)=>void>(),right=vi.fn<(v:Vector)=>void>();
    render(<><Joystick kind="translation" onChange={left} rate="normal" onRate={()=>{}} value="0" disabled={false} cancelSignal={0}/><Joystick kind="rotation" onChange={right} rate="normal" onRate={()=>{}} value="0" disabled={false} cancelSignal={0}/></>);
    const l=screen.getByTestId('translation-joystick'),r=screen.getByTestId('rotation-joystick');
    pointer(l,'pointerdown',1,130,60);pointer(r,'pointerdown',2,140,100);
    expect(left.mock.lastCall![0].x).toBeGreaterThan(0);expect(left.mock.lastCall![0].y).toBeLessThan(0);expect(right.mock.lastCall![0].x).toBeGreaterThan(0);
    const calls=left.mock.calls.length;pointer(l,'pointermove',2,10,10);expect(left).toHaveBeenCalledTimes(calls);
    pointer(l,'pointerup',1);expect(left).toHaveBeenLastCalledWith({x:0,y:0});expect(right.mock.lastCall![0].x).toBeGreaterThan(0);
    pointer(r,'pointercancel',2);expect(right).toHaveBeenLastCalledWith({x:0,y:0});
  });
  it('cancels on blur, lost capture and mode changes; disabled controls cannot drive',()=>{
    const change=vi.fn();const props={kind:'translation' as const,onChange:change,rate:'normal' as const,onRate:()=>{},value:'0',disabled:false,cancelSignal:0};
    const {rerender}=render(<Joystick {...props}/>);const l=screen.getByTestId('translation-joystick');
    pointer(l,'pointerdown',1,100,50);fireEvent(window,new Event('blur'));expect(change).toHaveBeenLastCalledWith({x:0,y:0});
    pointer(l,'pointerdown',1,100,50);pointer(l,'lostpointercapture',1);expect(change).toHaveBeenLastCalledWith({x:0,y:0});
    pointer(l,'pointerdown',1,100,50);rerender(<Joystick {...props} cancelSignal={1} disabled/>);expect(change).toHaveBeenLastCalledWith({x:0,y:0});
    pointer(l,'pointerdown',1,100,50);expect(change).toHaveBeenLastCalledWith({x:0,y:0});
    act(()=>{fireEvent.keyDown(l,{key:'ArrowUp'});});expect(change).toHaveBeenLastCalledWith({x:0,y:0});
  });
});
