export type IconName = 'camera' | 'scan' | 'hold' | 'drive' | 'sun' | 'beacon' | 'box' | 'settings' | 'battery' | 'pulse' | 'temperature' | 'pressure' | 'signal' | 'expand' | 'reset' | 'close';
const paths: Record<IconName, string> = {
  camera: 'M3 7h5l2-3h4l2 3h5v13H3Z M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  scan: 'M12 2a10 10 0 1 1-10 10 M12 6a6 6 0 1 1-6 6 M12 10a2 2 0 1 1-2 2 M12 2v7 M4 4l3 3',
  hold: 'M9 8v8 M15 8v8 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  drive: 'M2 20 8 10l3 4 5-11 6 17-7-9-4 7-3-4Z',
  sun: 'M12 1v2 M12 21v2 M1 12h2 M21 12h2 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0',
  beacon: 'M9 20h6 M12 15v7 M8 15a6 6 0 1 1 8 0 M5 18a10 10 0 1 1 14 0 M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0',
  box: 'M12 2 2 7v11l10 5 10-5V7Z M2 7l10 5 10-5 M12 12v11 M7 4l10 5',
  settings: 'M9 3h6l1 4 4 1 2 5-3 3v5l-5 1-3-3-4 1-4-4 1-4-2-3 3-4 4 1Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  battery: 'M8 2h8v3h3v17H5V5h3Z M8 18h8 M8 14h8 M8 10h8',
  pulse: 'M1 12h5l3-9 4 18 3-9h7',
  temperature: 'M10 14V4a2 2 0 0 1 4 0v10a5 5 0 1 1-4 0 M12 8v10',
  pressure: 'M4 20a10 10 0 1 1 16 0 M12 13l5-6 M5 9l2 1 M12 4v2 M18 11h2',
  signal: 'M3 22v-5h3v5Z M10 22V11h3v11Z M17 22V4h3v18Z',
  expand: 'M3 9V3h6 M15 3h6v6 M21 15v6h-6 M9 21H3v-6 M3 3l6 6 M21 3l-6 6 M21 21l-6-6 M3 21l6-6',
  reset: 'M3 10a9 9 0 1 1 2 8 M3 3v7h7',
  close: 'M5 5l14 14 M19 5 5 19',
};
export function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return <svg className={`icon ${className}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
