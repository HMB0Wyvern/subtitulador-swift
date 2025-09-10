import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VideoUploadZone } from './VideoUploadZone';
import { ProgressIndicator } from './ProgressIndicator';
import { useVideoStore, VideoFile } from '@/store/useVideoStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { videoApiService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';
import { subtitlesToSRT, subtitlesToASS, triggerDownload } from '@/utils/subtitleExport';

export function VideoUploadContainer() {
  const navigate = useNavigate();
  const {
    currentVideo,
    uploadProgress,
    isUploading,
    setCurrentVideo,
    setUploadProgress,
    setIsUploading,
    resetState,
    updateProgress,
  } = useVideoStore();

  const [error, setError] = useState<string | null>(null);
  const { exportPreferences, setExportPreferences } = useVideoStore();
  const { toast } = useToast();

  // Handle file upload with Spring Boot API integration
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      // Upload to Spring Boot API
      const uploadResponse = await videoApiService.uploadVideo(file);
      
      if (!uploadResponse.success || !uploadResponse.data) {
        throw new Error(uploadResponse.error || 'Upload failed');
      }

      const { jobId, videoId } = uploadResponse.data;

      // Create video file object with job tracking
      const videoFile: VideoFile = {
        id: videoId,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        url: URL.createObjectURL(file),
        jobId,
      };

      setCurrentVideo(videoFile);

      // Initialize progress tracking
      setUploadProgress({
        videoId: videoFile.id,
        progress: 0,
        status: 'uploading',
        message: 'Upload initiated successfully...',
      });

      // Start polling for status updates
      await pollProcessingStatus(jobId, videoFile.id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress({
        videoId: 'error',
        progress: 0,
        status: 'error',
        message: 'Upload failed. Please try again.',
      });
    } finally {
      setIsUploading(false);
    }
  }, [setCurrentVideo, setUploadProgress, setIsUploading]);

  // Poll Spring Boot API for processing status updates
  const pollProcessingStatus = async (jobId: string, videoId: string): Promise<void> => {
    const pollInterval = 2000; // Poll every 2 seconds
    const maxAttempts = 150; // 5 minutes max polling
    let attempts = 0;

    const poll = async (): Promise<void> => {
      if (attempts >= maxAttempts) {
        throw new Error('Processing timeout - please try again');
      }

      attempts++;
      const statusResponse = await videoApiService.getProcessingStatus(jobId);
      
      if (!statusResponse.success || !statusResponse.data) {
        throw new Error(statusResponse.error || 'Status check failed');
      }

      const { status, progress, message } = statusResponse.data;

      updateProgress(videoId, progress, status as any, message);

      if (status === 'completed') {
        // Fetch subtitle data once processing is complete
        const subtitleResponse = await videoApiService.getSubtitles(videoId);
        if (subtitleResponse.success && subtitleResponse.data) {
          // Update store with subtitle data for the video player
          const { setSubtitles, currentVideo: cv } = useVideoStore.getState();
          setSubtitles(subtitleResponse.data);

          // Auto-download exports if enabled
          if (exportPreferences.autoDownloadOnComplete) {
            try {
              const base = (cv?.name?.split('.').slice(0, -1).join('.') || 'subtitles');
              if (exportPreferences.formats.srt) {
                const srt = subtitlesToSRT(subtitleResponse.data);
                triggerDownload(`${base}.srt`, srt, 'text/plain;charset=utf-8');
              }
              if (exportPreferences.formats.ass) {
                const ass = subtitlesToASS(subtitleResponse.data);
                triggerDownload(`${base}.ass`, ass, 'text/plain;charset=utf-8');
              }
              if (exportPreferences.formats.json) {
                const json = JSON.stringify(subtitleResponse.data, null, 2);
                triggerDownload(`${base}.json`, json, 'application/json;charset=utf-8');
              }
              toast({ title: 'Descargas iniciadas', description: 'Subtítulos exportados automáticamente.' });
            } catch (e) {
              toast({ title: 'Error al descargar', description: e instanceof Error ? e.message : 'Fallo exportando archivos' });
            }
          }
        }
        return;
      }

      if (status === 'failed') {
        throw new Error(message || 'Processing failed');
      }

      // Continue polling if still processing
      if (status === 'queued' || status === 'uploading' || status === 'transcribing') {
        setTimeout(poll, pollInterval);
      }
    };

    await poll();
  };

  const handleRetry = () => {
    if (currentVideo?.file) {
      handleFileSelect(currentVideo.file);
    }
  };

  const handleStartOver = () => {
    resetState();
    setError(null);
  };

  // Show progress indicator if we have an upload in progress
  if (currentVideo && uploadProgress) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <ProgressIndicator />

        {/* Export Preferences */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Export Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={exportPreferences.formats.srt} onChange={(e)=>setExportPreferences({ formats: { srt: e.target.checked } as any })} />
                .srt
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={exportPreferences.formats.ass} onChange={(e)=>setExportPreferences({ formats: { ass: e.target.checked } as any })} />
                .ass
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={exportPreferences.formats.json} onChange={(e)=>setExportPreferences({ formats: { json: e.target.checked } as any })} />
                .json
              </label>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span>Auto-descargar al completar</span>
              <input type="checkbox" checked={exportPreferences.autoDownloadOnComplete} onChange={(e)=>setExportPreferences({ autoDownloadOnComplete: e.target.checked })} />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          {uploadProgress.status === 'error' && (
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {uploadProgress.status === 'completed' && (
            <Button onClick={() => navigate('/editor')} size="sm">
              Continue to Editor
            </Button>
          )}
          
          <Button onClick={handleStartOver} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Upload Different Video
          </Button>
        </div>

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show upload zone
  return (
    <div className="w-full max-w-4xl mx-auto">
      <VideoUploadZone onFileSelect={handleFileSelect} />
      
      {error && (
        <Card className="mt-4 border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
