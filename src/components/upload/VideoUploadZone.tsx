import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Film, AlertCircle } from 'lucide-react';
import { useVideoStore } from '@/store/useVideoStore';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Supported video formats
const ACCEPTED_VIDEO_TYPES = {
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
  'video/x-ms-wmv': ['.wmv'],
};

// Maximum file size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

interface VideoUploadZoneProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

export function VideoUploadZone({ onFileSelect, className }: VideoUploadZoneProps) {
  const { isUploading, isDragOver, setIsDragOver } = useVideoStore();

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setIsDragOver(false);
    
    if (rejectedFiles.length > 0) {
      console.error('Rejected files:', rejectedFiles);
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileSelect(file);
    }
  }, [onFileSelect, setIsDragOver]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_VIDEO_TYPES,
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE,
    disabled: isUploading,
    onDragEnter: () => setIsDragOver(true),
    onDragLeave: () => setIsDragOver(false),
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      <Card 
        {...getRootProps()} 
        className={cn(
          "relative cursor-pointer transition-all duration-300",
          "border-2 border-dashed border-border",
          "hover:border-primary hover:bg-upload-zone-hover",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          {
            "border-primary bg-upload-zone-active": isDragActive || isDragOver,
            "cursor-not-allowed opacity-50": isUploading,
            "border-primary bg-upload-zone": !isDragActive && !isDragOver && !isUploading,
          }
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center p-12 space-y-6">
          {/* Upload Icon */}
          <div className={cn(
            "relative p-6 rounded-full bg-gradient-hero",
            "transition-all duration-300 transform",
            {
              "scale-110": isDragActive || isDragOver,
              "animate-pulse": isUploading,
            }
          )}>
            {isUploading ? (
              <Film className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-white" />
            )}
          </div>

          {/* Main Text */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              {isUploading 
                ? "Processing your video..." 
                : isDragActive 
                  ? "Drop your video here" 
                  : "Upload your video"}
            </h3>
            
            {!isUploading && (
              <p className="text-muted-foreground max-w-md">
                Drag and drop your video file here, or click to browse.
                We'll automatically generate professional subtitles.
              </p>
            )}
          </div>

          {/* Supported Formats Info */}
          {!isUploading && (
            <div className="text-center space-y-3">
              <div className="flex flex-wrap justify-center gap-2">
                {Object.values(ACCEPTED_VIDEO_TYPES).flat().map((ext) => (
                  <span 
                    key={ext} 
                    className="px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md"
                  >
                    {ext.toUpperCase()}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>
          )}
        </div>

        {/* Visual feedback overlay */}
        {(isDragActive || isDragOver) && (
          <div className="absolute inset-0 bg-primary/5 rounded-lg border-2 border-primary border-dashed animate-pulse" />
        )}
      </Card>

      {/* Error Alert - Only shown when there's an error */}
      {/* This will be managed by the parent component */}
    </div>
  );
}