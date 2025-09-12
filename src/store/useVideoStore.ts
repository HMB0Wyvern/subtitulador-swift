import { create } from 'zustand';
import { SubtitleData, SubtitleStyles } from '@/services/api';

export interface VideoFile {
  id: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
  file?: File;
  url?: string;
  jobId?: string; // For tracking backend processing
}

export interface UploadProgress {
  videoId: string;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
  estimatedTimeRemaining?: number;
}

export interface ProcessingStatus {
  videoId: string;
  stage: 'upload' | 'transcription' | 'ready';
  progress: number;
  message: string;
}

type ExportQuality = 'low' | 'medium' | 'high';
interface ExportPreferences {
  autoDownloadOnComplete: boolean;
  formats: { srt: boolean; ass: boolean; json: boolean };
  quality: ExportQuality;
}

interface VideoState {
  // Current video being processed
  currentVideo: VideoFile | null;
  
  // Upload progress tracking
  uploadProgress: UploadProgress | null;
  
  // Processing status from backend
  processingStatus: ProcessingStatus | null;
  
  // Subtitle data
  subtitles: SubtitleData[];
  currentSubtitle: SubtitleData | null;
  
  // UI state
  isUploading: boolean;
  isDragOver: boolean;

  // Export preferences
  exportPreferences: ExportPreferences;

  // Actions
  setCurrentVideo: (video: VideoFile | null) => void;
  setUploadProgress: (progress: UploadProgress | null) => void;
  setProcessingStatus: (status: ProcessingStatus | null) => void;
  setSubtitles: (subtitles: SubtitleData[]) => void;
  setCurrentSubtitle: (subtitle: SubtitleData | null) => void;
  setIsUploading: (uploading: boolean) => void;
  setIsDragOver: (dragOver: boolean) => void;

  setExportPreferences: (prefs: Partial<ExportPreferences>) => void;

  // Subtitle editing actions
  updateSubtitle: (id: string, updates: Partial<SubtitleData>) => void;
  deleteSubtitle: (id: string) => void;
  addSubtitle: (afterId?: string) => void;
  
  // Utility actions
  resetState: () => void;
  updateProgress: (videoId: string, progress: number, status?: UploadProgress['status'], message?: string) => void;
}

export const useVideoStore = create<VideoState>((set, get) => ({
  currentVideo: null,
  uploadProgress: null,
  processingStatus: null,
  subtitles: [],
  currentSubtitle: null,
  isUploading: false,
  isDragOver: false,

  exportPreferences: {
    autoDownloadOnComplete: true,
    formats: { srt: true, ass: false, json: false },
    quality: 'medium',
  },

  setCurrentVideo: (video) => set({ currentVideo: video }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  setProcessingStatus: (status) => set({ processingStatus: status }),
  
  setSubtitles: (subtitles) => set({ subtitles }),
  
  setCurrentSubtitle: (subtitle) => set({ currentSubtitle: subtitle }),
  
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  
  setIsDragOver: (dragOver) => set({ isDragOver: dragOver }),

  setExportPreferences: (prefs) => set((state) => ({
    exportPreferences: {
      ...state.exportPreferences,
      ...prefs,
      formats: { ...state.exportPreferences.formats, ...(prefs.formats || {}) },
    },
  })),

  // Subtitle editing actions
  updateSubtitle: (id, updates) => set((state) => ({
    subtitles: state.subtitles.map(subtitle =>
      subtitle.id === id ? { ...subtitle, ...updates } : subtitle
    )
  })),
  
  deleteSubtitle: (id) => set((state) => ({
    subtitles: state.subtitles.filter(subtitle => subtitle.id !== id)
  })),
  
  addSubtitle: (afterId) => set((state) => {
    const defaultStyles: SubtitleStyles = {
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: 'transparent',
      outline: {
        width: 2,
        color: '#000000'
      },
      shadow: {
        offsetX: 1,
        offsetY: 1,
        blur: 2,
        color: 'rgba(0, 0, 0, 0.8)'
      },
      position: {
        horizontal: 'center',
        vertical: 'bottom',
        marginX: 0,
        marginY: 60
      }
    };

    const makeSub = (start: number, end: number): SubtitleData => ({
      id: `subtitle_${Date.now()}`,
      startTime: Math.max(0, start),
      endTime: Math.max(Math.max(0, start), end),
      text: 'New subtitle',
      styles: defaultStyles
    });

    const subs = state.subtitles;

    // If no reference, append at the end with 0.1s duration
    if (!afterId || subs.length === 0) {
      const lastEnd = subs.length ? subs[subs.length - 1].endTime : 0;
      const start = lastEnd;
      const end = start + 0.1;
      return { subtitles: [...subs, makeSub(start, end)] };
    }

    const index = subs.findIndex((s) => s.id === afterId);
    const prev = subs[index];
    const next = subs[index + 1];

    // Default placement: start at previous end, 0.1s long
    let start = prev.endTime;
    let end = start + 0.1;

    // Validate against next subtitle to prevent overlap
    if (next) {
      // Clamp end to not exceed next.startTime
      if (end > next.startTime) {
        end = Math.max(start, next.startTime);
      }

      // If there's no room between prev.end and next.start, place at the end of the list
      if (end <= start) {
        const last = subs[subs.length - 1];
        start = last.endTime;
        end = start + 0.1;
      }
    }

    const newSubtitle = makeSub(start, end);
    const newSubtitles = [...subs];
    newSubtitles.splice(index + 1, 0, newSubtitle);
    return { subtitles: newSubtitles };
  }),
  
  resetState: () => set({
    currentVideo: null,
    uploadProgress: null,
    processingStatus: null,
    subtitles: [],
    currentSubtitle: null,
    isUploading: false,
    isDragOver: false,
  }),
  
  updateProgress: (videoId, progress, status = 'uploading', message) => {
    const current = get().uploadProgress;
    if (current && current.videoId === videoId) {
      set({
        uploadProgress: {
          ...current,
          progress,
          status,
          message,
        }
      });
    }
  },
}));
