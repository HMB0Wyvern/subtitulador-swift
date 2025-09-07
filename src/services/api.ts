// Mock API service for Spring Boot backend integration
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface VideoUploadResponse {
  jobId: string;
  videoId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  message: string;
}

export interface ProcessingStatusResponse {
  jobId: string;
  videoId: string;
  status: 'queued' | 'uploading' | 'transcribing' | 'completed' | 'failed';
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export interface SubtitleData {
  id: string;
  text: string;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  styles: SubtitleStyles;
}

export interface SubtitleStyles {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  backgroundColor?: string;
  outline: {
    width: number;
    color: string;
  };
  shadow: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  };
  position: {
    horizontal: 'left' | 'center' | 'right';
    vertical: 'top' | 'center' | 'bottom';
    marginX: number;
    marginY: number;
  };
}

// Base URL for the Spring Boot API (would be environment variable in production)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api.example.com/api'
  : 'http://localhost:8080/api';

class VideoApiService {
  // Upload video and initiate Camunda workflow
  async uploadVideo(file: File): Promise<ApiResponse<VideoUploadResponse>> {
    // Mock implementation - replace with actual FormData upload
    const formData = new FormData();
    formData.append('video', file);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful response
      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const videoId = `video_${Date.now()}`;

      return {
        success: true,
        data: {
          jobId,
          videoId,
          status: 'queued',
          message: 'Video upload initiated successfully'
        }
      };

      // Real implementation would be:
      // const response = await fetch(`${API_BASE_URL}/videos/upload`, {
      //   method: 'POST',
      //   body: formData,
      // });
      // return await response.json();

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // Get processing status from Camunda workflow
  async getProcessingStatus(jobId: string): Promise<ApiResponse<ProcessingStatusResponse>> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock progressive status updates
      const mockStatuses = ['uploading', 'transcribing', 'completed'] as const;
      const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
      const progress = randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 80) + 10;

      return {
        success: true,
        data: {
          jobId,
          videoId: `video_${jobId.split('_')[1]}`,
          status: randomStatus,
          progress,
          message: this.getStatusMessage(randomStatus, progress),
          estimatedTimeRemaining: randomStatus === 'completed' ? 0 : Math.floor(Math.random() * 120) + 30
        }
      };

      // Real implementation would be:
      // const response = await fetch(`${API_BASE_URL}/videos/${jobId}/status`);
      // return await response.json();

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  // Get transcribed subtitles
  async getSubtitles(videoId: string): Promise<ApiResponse<SubtitleData[]>> {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock subtitle data
      const mockSubtitles: SubtitleData[] = [
        {
          id: 'sub_1',
          text: 'Welcome to our video presentation',
          startTime: 0.5,
          endTime: 3.2,
          styles: this.getDefaultStyles()
        },
        {
          id: 'sub_2', 
          text: 'Today we will explore the amazing features',
          startTime: 3.5,
          endTime: 6.8,
          styles: this.getDefaultStyles()
        },
        {
          id: 'sub_3',
          text: 'of our subtitle generation platform',
          startTime: 7.0,
          endTime: 10.3,
          styles: this.getDefaultStyles()
        }
      ];

      return {
        success: true,
        data: mockSubtitles
      };

      // Real implementation would be:
      // const response = await fetch(`${API_BASE_URL}/videos/${videoId}/subtitles`);
      // return await response.json();

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch subtitles'
      };
    }
  }

  private getStatusMessage(status: string, progress: number): string {
    switch (status) {
      case 'uploading': return `Uploading video file... ${progress}%`;
      case 'transcribing': return `AI transcription in progress... ${progress}%`;
      case 'completed': return 'Video processing completed successfully!';
      default: return 'Processing video...';
    }
  }

  private getDefaultStyles(): SubtitleStyles {
    return {
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
  }
}

export const videoApiService = new VideoApiService();