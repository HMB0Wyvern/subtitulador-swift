import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Clock, Upload, Zap } from 'lucide-react';
import { useVideoStore, UploadProgress } from '@/store/useVideoStore';
import { cn } from '@/lib/utils';

interface ProgressStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const PROGRESS_STEPS: ProgressStep[] = [
  {
    id: 'upload',
    label: 'Uploading',
    icon: <Upload className="w-4 h-4" />,
    description: 'Securing your video file'
  },
  {
    id: 'processing',
    label: 'Processing',
    icon: <Zap className="w-4 h-4" />,
    description: 'Analyzing video content'
  },
  {
    id: 'transcription',
    label: 'Transcribing',
    icon: <Clock className="w-4 h-4" />,
    description: 'Generating intelligent subtitles'
  }
];

export function ProgressIndicator() {
  const { uploadProgress, currentVideo } = useVideoStore();

  if (!uploadProgress || !currentVideo) {
    return null;
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getCurrentStepIndex = (): number => {
    if (uploadProgress.status === 'uploading') return 0;
    if (uploadProgress.status === 'processing') return 1;
    return 2; // transcription or completed
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 space-y-6">
        {/* File Info Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{currentVideo.name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(currentVideo.size)} • Processing...
            </p>
          </div>
          
          {uploadProgress.status === 'completed' && (
            <CheckCircle className="w-6 h-6 text-success" />
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {uploadProgress.message || 'Processing...'}
            </span>
            <span className="font-medium">{Math.round(uploadProgress.progress)}%</span>
          </div>
          
          <Progress 
            value={uploadProgress.progress} 
            className="h-2"
          />
          
          {uploadProgress.estimatedTimeRemaining && (
            <p className="text-xs text-muted-foreground text-right">
              Estimated time remaining: {formatTime(uploadProgress.estimatedTimeRemaining)}
            </p>
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between">
          {PROGRESS_STEPS.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isUpcoming = index > currentStepIndex;

            return (
              <div 
                key={step.id}
                className={cn(
                  "flex flex-col items-center space-y-2 flex-1",
                  "transition-all duration-300"
                )}
              >
                {/* Step Icon */}
                <div className={cn(
                  "relative flex items-center justify-center w-10 h-10 rounded-full border-2",
                  "transition-all duration-300",
                  {
                    "bg-success border-success text-success-foreground": isCompleted,
                    "bg-primary border-primary text-primary-foreground animate-pulse": isCurrent,
                    "bg-muted border-muted-foreground/20 text-muted-foreground": isUpcoming,
                  }
                )}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                  
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                  )}
                </div>

                {/* Step Label */}
                <div className="text-center space-y-1">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    {
                      "text-success": isCompleted,
                      "text-primary": isCurrent,
                      "text-muted-foreground": isUpcoming,
                    }
                  )}>
                    {step.label}
                  </p>
                  
                  <p className="text-xs text-muted-foreground max-w-20">
                    {step.description}
                  </p>
                </div>

                {/* Connection Line */}
                {index < PROGRESS_STEPS.length - 1 && (
                  <div className={cn(
                    "absolute top-5 left-1/2 w-full h-0.5 -translate-y-1/2 translate-x-5",
                    "transition-colors duration-500",
                    {
                      "bg-success": isCompleted,
                      "bg-gradient-to-r from-primary to-muted": isCurrent,
                      "bg-muted": isUpcoming,
                    }
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Additional Status Message */}
        {uploadProgress.status === 'error' && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              Upload failed: {uploadProgress.message || 'Unknown error occurred'}
            </p>
          </div>
        )}
        
        {uploadProgress.status === 'completed' && (
          <div className="p-4 bg-success-light border border-success/20 rounded-lg">
            <p className="text-sm text-success font-medium">
              Video processed successfully! Ready for subtitle editing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}