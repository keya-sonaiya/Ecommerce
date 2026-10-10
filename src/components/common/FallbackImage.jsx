import React, { useState } from 'react';

/**
 * Editorial Image Component with 4:5 aspect ratio by default,
 * loading state with smooth fade-in, and automatic fallback to /images/placeholder.svg.
 */
export function FallbackImage({
  src,
  alt = 'Atelier Nord fashion garment',
  aspectRatio = '4/5',
  className = '',
  loading = 'lazy',
  style = {},
  productName, // accepted but not passed to the DOM
  ...rest
}) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const finalSrc = hasError || !src ? '/images/placeholder.svg' : src;

  return (
    <div
      className={`fallback-image-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio,
        backgroundColor: '#F3EFEA',
        overflow: 'hidden',
        display: 'block',
        ...style,
      }}
    >
      {/* Subtle skeleton shimmer placeholder before image is loaded */}
      {!isLoaded && !hasError && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#EDE8E1',
            zIndex: 1,
            animation: 'pulse 1.8s ease-in-out infinite',
          }}
        />
      )}

      <img
        src={finalSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.35s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        {...rest}
      />
    </div>
  );
}

export default FallbackImage;
