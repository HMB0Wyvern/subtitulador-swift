import { create } from 'zustand';
import { SubtitleData } from '@/services/api';

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