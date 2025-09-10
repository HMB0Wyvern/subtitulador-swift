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
  
  // Actions
  setCurrentVideo: (video: VideoFile | null) => void;
  setUploadProgress: (progress: UploadProgress | null) => void;
  setProcessingStatus: (status: ProcessingStatus | null) => void;
  setSubtitles: (subtitles: SubtitleData[]) => void;
  setCurrentSubtitle: (subtitle: SubtitleData | null) => void;
  setIsUploading: (uploading: boolean) => void;
  setIsDragOver: (dragOver: boolean) => void;
  
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

  setCurrentVideo: (video) => set({ currentVideo: video }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  setProcessingStatus: (status) => set({ processingStatus: status }),
  
  setSubtitles: (subtitles) => set({ subtitles }),
  
  setCurrentSubtitle: (subtitle) => set({ currentSubtitle: subtitle }),
  
  setIsUploading: (uploading) => set({ isUploading: uploading }),
  
  setIsDragOver: (dragOver) => set({ isDragOver: dragOver }),
  
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
    
    const newSubtitle: SubtitleData = {
      id: `subtitle_${Date.now()}`,
      startTime: 0,
      endTime: 5,
      text: 'New subtitle',
      styles: defaultStyles
    };
    
    if (!afterId) {
      return { subtitles: [newSubtitle, ...state.subtitles] };
    }
    
    const index = state.subtitles.findIndex(s => s.id === afterId);
    const newSubtitles = [...state.subtitles];
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