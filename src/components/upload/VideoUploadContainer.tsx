import React, { useState, useCallback } from 'react';
import { VideoUploadZone } from './VideoUploadZone';
import { ProgressIndicator } from './ProgressIndicator';
import { useVideoStore, VideoFile } from '@/store/useVideoStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export function VideoUploadContainer() {
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

  // Simulate file upload and processing
  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    // Create video file object
    const videoFile: VideoFile = {
      id: Date.now().toString(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      url: URL.createObjectURL(file),
    };

    setCurrentVideo(videoFile);

    // Initialize progress
    setUploadProgress({
      videoId: videoFile.id,
      progress: 0,
      status: 'uploading',
      message: 'Preparing upload...',
    });

    try {
      // Simulate upload progress
      await simulateUploadProgress(videoFile.id);
      
      // Simulate processing
      await simulateProcessing(videoFile.id);
      
      // Mark as completed
      updateProgress(videoFile.id, 100, 'completed', 'Video processed successfully!');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      updateProgress(videoFile.id, 0, 'error', 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [setCurrentVideo, setUploadProgress, setIsUploading, updateProgress]);

  // Simulate upload progress with realistic timing
  const simulateUploadProgress = async (videoId: string): Promise<void> => {
    const steps = [
      { progress: 10, message: 'Validating video file...' },
      { progress: 25, message: 'Uploading to secure storage...' },
      { progress: 50, message: 'Analyzing video properties...' },
      { progress: 75, message: 'Preparing for processing...' },
      { progress: 85, message: 'Upload complete!' },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
      updateProgress(videoId, step.progress, 'uploading', step.message);
    }
  };

  // Simulate backend processing
  const simulateProcessing = async (videoId: string): Promise<void> => {
    const steps = [
      { progress: 90, message: 'Initializing AI transcription...', status: 'processing' as const },
      { progress: 95, message: 'Generating intelligent subtitles...', status: 'processing' as const },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      updateProgress(videoId, step.progress, step.status, step.message);
    }
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
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          {uploadProgress.status === 'error' && (
            <Button onClick={handleRetry} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {uploadProgress.status === 'completed' && (
            <Button onClick={() => console.log('Navigate to editor')} size="sm">
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