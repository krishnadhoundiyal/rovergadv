import { test, expect, type Page } from '@playwright/test';

declare global {
  interface Window { cameraTest: { calls: MediaStreamConstraints[]; stops: number; stream?: MediaStream } }
}

async function mockCamera(page: Page, error?: string) {
  await page.addInitScript(({error})=>{
    window.cameraTest={calls:[],stops:0};
    Object.defineProperty(navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async(constraints:MediaStreamConstraints)=>{
      window.cameraTest.calls.push(constraints);
      if(error)throw new DOMException('Test camera response',error);
      const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;
      const ctx=canvas.getContext('2d')!;
      function draw(){
        const g=ctx.createLinearGradient(0,0,0,720);g.addColorStop(0,'#567386');g.addColorStop(.55,'#b0bec0');g.addColorStop(.56,'#66736b');g.addColorStop(1,'#283836');ctx.fillStyle=g;ctx.fillRect(0,0,1280,720);
        ctx.fillStyle='#7d8b83';ctx.beginPath();ctx.moveTo(0,430);ctx.lineTo(290,220);ctx.lineTo(480,410);ctx.lineTo(830,200);ctx.lineTo(1280,420);ctx.fill();
        ctx.strokeStyle='#c0d1c333';for(let x=0;x<1280;x+=80){ctx.beginPath();ctx.moveTo(640,400);ctx.lineTo(x,720);ctx.stroke();}
        ctx.fillStyle='#d9e8ef';ctx.font='20px sans-serif';ctx.fillText('AUTOMATED TEST CAMERA · CANVAS STREAM',340,530);
      }
      draw();const timer=setInterval(draw,60);const stream=canvas.captureStream(15);
      stream.getTracks().forEach(track=>{const stop=track.stop.bind(track);track.stop=()=>{window.cameraTest.stops++;clearInterval(timer);stop();};});
      window.cameraTest.stream=stream;return stream;
    }}});
  },{error});
}
async function enter(page:Page){await page.goto('./');await expect(page.locator('.boot-status')).toHaveCount(0);}

test('production base path, landscape layouts and honest non-live fallback',async({page},info)=>{
  const errors:string[]=[],external:string[]=[],failed:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:4173/'))external.push(r.url());});
  page.on('response',r=>{if(r.status()>=400)failed.push(`${r.status()} ${r.url()}`);});
  await mockCamera(page);await enter(page);
  await expect(page.getByRole('heading',{name:'GADV D4-S',exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'ENABLE CAMERA'})).toBeVisible();
  expect(await page.evaluate(()=>window.cameraTest.calls)).toEqual([]);
  for(const [width,height] of [[1024,768],[1194,834],[1366,1024],[1110,800]]){
    await page.setViewportSize({width,height});
    await expect(page.getByTestId('rotation-joystick')).toBeVisible();
    const bounds=await page.evaluate(()=>{
      const root=document.documentElement;const selectors=['.header','.upper','.lower','.disclosure','.camera-panel','.joystick'];
      return {width:root.scrollWidth,height:root.scrollHeight,panels:selectors.flatMap(s=>Array.from(document.querySelectorAll(s)).map(e=>{const b=e.getBoundingClientRect();return {selector:s,x:b.x,y:b.y,right:b.right,bottom:b.bottom,width:b.width,height:b.height};}))};
    });
    expect(bounds.width).toBe(width);expect(bounds.height).toBe(height);
    for(const panel of bounds.panels){expect(panel.x,JSON.stringify(panel)).toBeGreaterThanOrEqual(0);expect(panel.y).toBeGreaterThanOrEqual(0);expect(panel.right).toBeLessThanOrEqual(width+.5);expect(panel.bottom).toBeLessThanOrEqual(height+.5);}
    await page.screenshot({path:`docs/qa/${info.project.name}-${width}x${height}-fallback.png`});
  }
  expect(external).toEqual([]);expect(errors).toEqual([]);expect(failed).toEqual([]);
});

test('camera starts only on gesture, plays a genuine stream, switches and stops',async({page},info)=>{
  await mockCamera(page);await enter(page);
  await page.getByRole('button',{name:'ENABLE CAMERA'}).click();
  await expect(page.locator('.camera-badge')).toContainText('LOCAL LIVE');
  expect(await page.locator('video').evaluate((v:HTMLVideoElement)=>({autoplay:v.autoplay,muted:v.muted,inline:v.playsInline,stream:v.srcObject instanceof MediaStream,playing:!v.paused}))).toEqual({autoplay:true,muted:true,inline:true,stream:true,playing:true});
  expect(await page.evaluate(()=>window.cameraTest.calls[0])).toEqual({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});
  await page.screenshot({path:`docs/qa/${info.project.name}-camera-active.png`});
  await page.getByRole('button',{name:'CAMERA',exact:true}).click();await page.getByRole('button',{name:'Switch camera'}).click();
  await expect(page.locator('.camera-badge')).toContainText('LOCAL LIVE');
  expect(await page.evaluate(()=>window.cameraTest.calls.length)).toBe(2);expect(await page.evaluate(()=>window.cameraTest.stops)).toBe(1);
  await page.getByRole('button',{name:'CAMERA',exact:true}).click();await page.getByRole('button',{name:'Stop camera',exact:true}).click();
  await expect(page.locator('.camera-badge')).toContainText('PREVIEW OFF');expect(await page.evaluate(()=>window.cameraTest.stops)).toBe(2);
});

for(const [error,text] of [['NotAllowedError','Camera access is blocked'],['NotFoundError','No camera is available'],['NotReadableError','The camera is busy']]){
  test(`camera gracefully handles ${error}`,async({page})=>{
    await mockCamera(page,error);await enter(page);await page.getByRole('button',{name:'ENABLE CAMERA'}).click();
    await expect(page.getByRole('status')).toContainText(text);await expect(page.getByRole('button',{name:'RETRY CAMERA'})).toBeVisible();await expect(page.locator('.camera-badge')).toContainText('PREVIEW OFF');
    await page.getByRole('button',{name:'RETRY CAMERA'}).click();expect(await page.evaluate(()=>window.cameraTest.calls.length)).toBe(2);
  });
}

test('camera interruption, background cleanup and foreground restart',async({page})=>{
  await mockCamera(page);await enter(page);await page.getByRole('button',{name:'ENABLE CAMERA'}).click();await expect(page.locator('.camera-badge')).toContainText('LOCAL LIVE');
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('.camera-badge')).toContainText('PREVIEW OFF');expect(await page.evaluate(()=>window.cameraTest.stops)).toBe(1);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
  await expect(page.locator('.camera-badge')).toContainText('LOCAL LIVE');expect(await page.evaluate(()=>window.cameraTest.calls.length)).toBe(2);
  await page.evaluate(()=>window.cameraTest.stream!.getVideoTracks()[0].dispatchEvent(new Event('ended')));
  await expect(page.getByRole('status')).toContainText('interrupted');await expect(page.locator('.camera-badge')).toContainText('PREVIEW OFF');
});

test('drive vectors, captured outside drag, release, persistent yaw, HOLD, SCAN and reset',async({page},info)=>{
  await mockCamera(page);await enter(page);
  const left=page.getByTestId('translation-joystick'),right=page.getByTestId('rotation-joystick');
  const l=(await left.boundingBox())!,r=(await right.boundingBox())!;
  const initial=await page.locator('.video-crop').getAttribute('style');
  await page.mouse.move(l.x+l.width/2,l.y+l.height/2);await page.mouse.down();await page.mouse.move(l.x+l.width*.7,l.y+l.height*.25);await page.waitForTimeout(700);
  await expect(page.getByTestId('translation-value')).not.toHaveText('0.0 m/s');
  await page.mouse.move(l.x-15,l.y-15);await page.waitForTimeout(300);await page.mouse.up();
  await expect(page.getByTestId('translation-value')).toHaveText('0.0 m/s');
  expect(await page.locator('.video-crop').getAttribute('style')).not.toBe(initial);
  await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.mouse.move(r.x+r.width*.8,r.y+r.height/2);await page.waitForTimeout(600);await page.mouse.up();
  await page.waitForTimeout(150);const heading=await page.getByTestId('rotation-value').textContent();expect(heading).not.toBe('003°');await page.waitForTimeout(350);expect(await page.getByTestId('rotation-value').textContent()).toBe(heading);
  await left.focus();await page.keyboard.down('ArrowUp');await page.waitForTimeout(300);await page.keyboard.up('ArrowUp');
  await page.getByRole('button',{name:'HOLD STABILIZE POSITION'}).click();await expect(page.getByTestId('translation-value')).toHaveText('0.0 m/s');await expect(left).toHaveAttribute('aria-disabled','true');
  await page.getByRole('button',{name:'SCAN TERRAIN & MAPPING'}).click();await expect(page.locator('.camera-panel')).toHaveAttribute('data-mode','scan');await expect(page.locator('.map-sweep')).toBeVisible();
  await page.screenshot({path:`docs/qa/${info.project.name}-scan.png`});
  await page.getByRole('button',{name:'DRIVE MODE EXPLORATION'}).click();await expect(left).toHaveAttribute('aria-disabled','false');
  await page.getByRole('button',{name:'DEMO RESET',exact:true}).click();await expect(page.getByTestId('rotation-value')).toHaveText('003°');
  await expect(page.getByTestId('translation-value')).toHaveText('0.0 m/s');
});

test('real simultaneous touch pointers steer and translate independently',async({page,browserName})=>{
  test.skip(browserName!=='chromium','CDP multi-touch injection is Chromium-specific; cross-browser pointer ownership is also unit tested.');
  await mockCamera(page);await enter(page);
  const l=(await page.getByTestId('translation-joystick').boundingBox())!,r=(await page.getByTestId('rotation-joystick').boundingBox())!;
  const cdp=await page.context().newCDPSession(page);
  const left={x:l.x+l.width*.5,y:l.y+l.height*.23,id:1},right={x:r.x+r.width*.78,y:r.y+r.height*.5,id:2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[left,right]});await page.waitForTimeout(600);
  await expect(page.getByTestId('translation-value')).not.toHaveText('0.0 m/s');await expect(page.getByTestId('rotation-value')).not.toHaveText('003°');
  // CDP identifies the ending contact here, rather than the remaining contact.
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[left]});await expect(page.getByTestId('translation-value')).toHaveText('0.0 m/s');
  const heading=await page.getByTestId('rotation-value').textContent();await page.waitForTimeout(250);expect(await page.getByTestId('rotation-value').textContent()).not.toBe(heading);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await page.waitForTimeout(150);const endHeading=await page.getByTestId('rotation-value').textContent();await page.waitForTimeout(300);expect(await page.getByTestId('rotation-value').textContent()).toBe(endHeading);
});

test('all utility, instrument, rate and map controls respond; portrait preserves state',async({page},info)=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await mockCamera(page);await enter(page);
  for(const kind of ['translation','rotation'])for(const rate of ['fast','slow','normal']){const button=page.getByRole('button',{name:`${kind} ${rate}`,exact:true});await button.click();await expect(button).toHaveAttribute('aria-pressed','true');}
  await page.getByRole('button',{name:'LIGHTS',exact:true}).click();await expect(page.locator('.light-overlay')).toBeVisible();
  await page.getByRole('button',{name:'BEACON',exact:true}).click();await expect(page.locator('.beacon-indicator')).toBeVisible();
  for(const name of ['SENSORS','PAYLOAD']){await page.getByRole('button',{name,exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();}
  await page.locator('.status-row').first().click();await expect(page.getByRole('dialog')).toContainText('DS18B20');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Expand terrain map'}).click();await expect(page.locator('.expanded-map')).toBeVisible();await page.getByRole('button',{name:'Close dialog'}).click();
  await page.getByRole('button',{name:'Open settings'}).click();await page.getByLabel('Minimal HUD').check();await page.getByLabel('Reduce decorative motion').check();await page.getByRole('button',{name:'Close dialog'}).click();await expect(page.locator('.hud')).toHaveClass(/hud-minimal/);await expect(page.locator('main')).toHaveClass(/reduced-motion/);
  await page.setViewportSize({width:834,height:1194});await expect(page.getByRole('heading',{name:'Explore in landscape.'})).toBeVisible();await page.screenshot({path:`docs/qa/${info.project.name}-portrait.png`});
  await page.setViewportSize({width:1194,height:834});await expect(page.getByRole('button',{name:'LIGHTS',exact:true})).toHaveAttribute('aria-pressed','true');expect(errors).toEqual([]);
});
