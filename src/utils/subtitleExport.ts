import { SubtitleData } from '@/services/api';

export type ExportFormat = 'srt' | 'ass' | 'json';
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

function subtitlesToASS(subs: SubtitleData[], opts?: {
  fontName?: string;
  fontSize?: number;
  primaryColor?: string; // css color
  outlineColor?: string; // css color
  outlineWidth?: number; // px
  shadowColor?: string; // css color
  shadowBlur?: number; // px => ASS Shadow
  alignment?: 1|2|3|4|5|6|7|8|9;
  marginL?: number;
  marginR?: number;
  marginV?: number;
}): string {
  const cssToAssColor = (css: string) => {
    // Convert hex or rgba to ASS &HBBGGRR format (alpha ignored for simplicity)
    const rgba = (() => {
      if (css.startsWith('#')) {
        const hex = css.replace('#', '');
        const r = parseInt(hex.length === 3 ? hex[0]+hex[0] : hex.slice(0,2), 16);
        const g = parseInt(hex.length === 3 ? hex[1]+hex[1] : hex.slice(2,4), 16);
        const b = parseInt(hex.length === 3 ? hex[2]+hex[2] : hex.slice(4,6), 16);
        return { r, g, b };
      }
      const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
      if (m) {
        return { r: parseInt(m[1],10), g: parseInt(m[2],10), b: parseInt(m[3],10) };
      }
      // Fallback white
      return { r: 255, g: 255, b: 255 };
    })();
    const rr = rgba.r.toString(16).padStart(2,'0').toUpperCase();
    const gg = rgba.g.toString(16).padStart(2,'0').toUpperCase();
    const bb = rgba.b.toString(16).padStart(2,'0').toUpperCase();
    return `&H00${bb}${gg}${rr}`; // no alpha
  };

  const alignment = opts?.alignment ?? 2; // bottom-center by default
  const fontName = opts?.fontName ?? 'Arial';
  const fontSize = opts?.fontSize ?? 24;
  const primary = cssToAssColor(opts?.primaryColor ?? '#FFFFFF');
  const outline = cssToAssColor(opts?.outlineColor ?? '#000000');
  const back = cssToAssColor('#000000');
  const outlinePx = Math.max(0, Math.min(10, Math.round((opts?.outlineWidth ?? 2))));
  const shadow = Math.max(0, Math.min(10, Math.round((opts?.shadowBlur ?? 2))));
  const marginL = Math.max(0, Math.min(200, Math.round(opts?.marginL ?? 20)));
  const marginR = Math.max(0, Math.min(200, Math.round(opts?.marginR ?? 20)));
  const marginV = Math.max(0, Math.min(200, Math.round(opts?.marginV ?? 60)));

  const header = `[Script Info]\nScriptType: v4.00+\nCollisions: Normal\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,${fontName},${fontSize},${primary},&H000000FF,${outline},${back},0,0,0,0,100,100,0,0,1,${outlinePx},${shadow},${alignment},${marginL},${marginR},${marginV},0\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;
  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const cs = Math.round((t - Math.floor(t)) * 100); // centiseconds
    const pad = (n: number, z=2) => n.toString().padStart(z, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(cs)}`;
  };
  const events = subs
    .map((s) => `Dialogue: 0,${formatTime(s.startTime)},${formatTime(s.endTime)},Default,,${marginL},${marginR},${marginV},,${s.text.replace(/\n/g, '\\N')}`)
    .join('\n');
  return `${header}\n${events}\n`;
}

export function exportSubtitles(subtitles: SubtitleData[], format: 'srt' | 'vtt' | 'ass'): Blob {
  let content: string;
  let mimeType: string;
  
  switch (format) {
    case 'srt':
      content = subtitlesToSRT(subtitles);
      mimeType = 'text/plain;charset=utf-8';
      break;
    case 'vtt':
      content = subtitlesToVTT(subtitles);
      mimeType = 'text/vtt;charset=utf-8';
      break;
    case 'ass':
      content = subtitlesToASS(subtitles);
      mimeType = 'text/plain;charset=utf-8';
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }
  
  return new Blob([content], { type: mimeType });
}

function subtitlesToVTT(subs: SubtitleData[]): string {
  const formatTime = (t: number) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.floor(t % 60);
    const ms = Math.round((t - Math.floor(t)) * 1000);
    const pad = (n: number, z = 2) => n.toString().padStart(z, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}.${pad(ms, 3)}`;
  };

  const header = 'WEBVTT\n\n';
  const cues = subs
    .map((s, i) => `${i + 1}\n${formatTime(s.startTime)} --> ${formatTime(s.endTime)}\n${s.text}\n`)
    .join('\n');
    
  return header + cues;
}

export { subtitlesToSRT, subtitlesToASS, triggerDownload };
