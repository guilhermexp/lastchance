import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedVideoProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'onError'> {
  src: string;
  poster?: string;
  fallbackSrc?: string;
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  containerClassName?: string;
}

/**
 * Componente de vídeo otimizado com carregamento lazy e fallback
 */
export function OptimizedVideo({
  src,
  poster,
  fallbackSrc,
  onLoadStart,
  onLoadedData,
  onError,
  className,
  containerClassName,
  ...props
}: OptimizedVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Reset states when src changes
    setError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoadStart = () => {
    setIsLoading(true);
    onLoadStart?.();
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    onLoadedData?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setError(true);
    setIsLoading(false);
    if (onError) {
      onError(new Error('Failed to load video'));
    }
    console.error('Video loading error:', e);
  };

  return (
    <div className={cn('relative overflow-hidden', containerClassName)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
      
      {error && fallbackSrc ? (
        <img 
          src={fallbackSrc} 
          alt="Video thumbnail" 
          className={cn('w-full h-auto', className)}
        />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          className={cn('w-full h-auto', isLoading && 'opacity-0', className)}
          onLoadStart={handleLoadStart}
          onLoadedData={handleLoadedData}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
}
