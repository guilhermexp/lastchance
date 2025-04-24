import React from 'react';
import { cn } from '@/lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

/**
 * Componente de imagem com carregamento lazy e fallback
 */
export function LazyImage({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  ...props
}: LazyImageProps) {
  const [error, setError] = React.useState(false);
  
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    if (props.onError) {
      props.onError(e);
    }
  };

  return (
    <img
      src={error ? fallbackSrc : src}
      alt={alt}
      className={cn(className)}
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
}