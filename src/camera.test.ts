import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { CameraController } from './camera';

function fakeStream() {
  const track=Object.assign(new EventTarget(), {stop:vi.fn(),readyState:'live',getSettings:()=>({facingMode:'environment'})});
  const stream={getTracks:()=>[track],getVideoTracks:()=>[track]} as unknown as MediaStream;
  return {track,stream};
}
describe('local camera lifecycle',()=>{
  let camera:CameraController;let video:HTMLVideoElement;let getUserMedia:ReturnType<typeof vi.fn>;
  beforeEach(()=>{
    vi.stubGlobal('isSecureContext',true);
    getUserMedia=vi.fn();vi.stubGlobal('navigator',{mediaDevices:{getUserMedia}});
    video=document.createElement('video');
    vi.spyOn(video,'paused','get').mockReturnValue(false);
    vi.spyOn(video,'readyState','get').mockReturnValue(2);
    vi.spyOn(video,'play').mockResolvedValue(undefined);
    camera=new CameraController();camera.attach(video);
  });
  afterEach(()=>{camera.detach();vi.unstubAllGlobals();vi.useRealTimers();});
  it('requests only video with rear preference and only after explicit start, then cleans up',async()=>{
    const {stream,track}=fakeStream();getUserMedia.mockResolvedValue(stream);
    expect(getUserMedia).not.toHaveBeenCalled();await camera.start();
    expect(getUserMedia).toHaveBeenCalledWith({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
    expect(camera.state).toBe('active');expect(video.srcObject).toBe(stream);
    camera.detach();expect(track.stop).toHaveBeenCalledOnce();expect(video.srcObject).toBeNull();
  });
  it.each([['NotAllowedError','denied'],['NotFoundError','unavailable'],['NotReadableError','busy'],['AbortError','busy'],['UnknownError','error']])('handles %s as %s',async(name,state)=>{
    getUserMedia.mockRejectedValue(new DOMException('test',name));await camera.start();expect(camera.state).toBe(state);expect(camera.stream).toBeNull();
  });
  it('handles insecure and missing media APIs without requesting permissions',async()=>{
    vi.stubGlobal('isSecureContext',false);await camera.start();expect(camera.state).toBe('insecure');expect(getUserMedia).not.toHaveBeenCalled();
    vi.stubGlobal('isSecureContext',true);vi.stubGlobal('navigator',{});await camera.start();expect(camera.state).toBe('unavailable');
  });
  it('waits for real playback when metadata is delayed; retries after timeout',async()=>{
    vi.useFakeTimers();const {stream,track}=fakeStream();getUserMedia.mockResolvedValue(stream);
    const ready=vi.spyOn(video,'readyState','get').mockReturnValue(0);
    await camera.start();expect(camera.state).toBe('starting');
    ready.mockReturnValue(2);video.dispatchEvent(new Event('loadedmetadata'));await Promise.resolve();expect(camera.state).toBe('active');
    ready.mockReturnValue(0);await camera.start();vi.advanceTimersByTime(12001);expect(camera.state).toBe('interrupted');expect(track.stop).toHaveBeenCalled();
    ready.mockReturnValue(2);await camera.start();expect(camera.state).toBe('active');
  });
  it('stops requests resolved after cancellation or detach, without a stale active label',async()=>{
    const {stream,track}=fakeStream();let resolve!:(s:MediaStream)=>void;
    getUserMedia.mockReturnValue(new Promise<MediaStream>(r=>{resolve=r;}));
    const pending=camera.start();camera.release('paused');resolve(stream);await pending;
    expect(track.stop).toHaveBeenCalledOnce();expect(camera.state).toBe('paused');expect(camera.stream).toBeNull();
  });
  it('releases on interruption, restarts and stops the old stream on camera switch',async()=>{
    const first=fakeStream(),second=fakeStream();getUserMedia.mockResolvedValueOnce(first.stream).mockResolvedValueOnce(second.stream);
    await camera.start();first.track.dispatchEvent(new Event('ended'));expect(camera.state).toBe('interrupted');expect(first.track.stop).toHaveBeenCalled();
    await camera.start('user');expect(camera.state).toBe('active');expect(getUserMedia.mock.calls[1][0].video.facingMode.ideal).toBe('user');
    camera.release();expect(second.track.stop).toHaveBeenCalledOnce();
  });
  it('handles autoplay rejection without a false active state',async()=>{
    const {stream,track}=fakeStream();getUserMedia.mockResolvedValue(stream);vi.mocked(video.play).mockRejectedValue(new Error('blocked'));
    await camera.start();await Promise.resolve();expect(camera.state).toBe('interrupted');expect(track.stop).toHaveBeenCalled();
  });
  it('withdraws the live label while playback buffers, then resumes or times out',async()=>{
    vi.useFakeTimers();const {stream}=fakeStream();getUserMedia.mockResolvedValue(stream);await camera.start();
    video.dispatchEvent(new Event('waiting'));expect(camera.state).toBe('starting');
    video.dispatchEvent(new Event('playing'));expect(camera.state).toBe('active');
    video.dispatchEvent(new Event('pause'));expect(camera.state).toBe('starting');
    vi.advanceTimersByTime(12001);expect(camera.state).toBe('interrupted');
  });
});
