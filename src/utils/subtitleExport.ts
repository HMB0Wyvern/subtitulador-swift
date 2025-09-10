import { SubtitleData } from '@/services/api';

export type ExportFormat = 'srt' | 'ass' | 'json';

export function subtitlesToSRT(subs: SubtitleData[]): string {
  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const ms = Math.round((t - Math.floor(t)) * 1000);
    const pad = (n: number, z=2) => n.toString().padStart(z, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms,3)}`;
  };

  return subs
    .map((s, i) => `${i + 1}\n${formatTime(s.startTime)} --> ${formatTime(s.endTime)}\n${s.text}\n`)
    .join('\n');
}

export function subtitlesToASS(subs: SubtitleData[]): string {
  const header = `[Script Info]\nScriptType: v4.00+\nCollisions: Normal\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,24,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,20,20,60,0\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;
  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const cs = Math.round((t - Math.floor(t)) * 100); // centiseconds
    const pad = (n: number, z=2) => n.toString().padStart(z, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
  };
  const events = subs
    .map((s) => `Dialogue: 0,${formatTime(s.startTime)},${formatTime(s.endTime)},Default,,0,0,0,,${s.text.replace(/\n/g, '\\N')}`)
    .join('\n');
  return `${header}\n${events}\n`;
}

export function triggerDownload(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
