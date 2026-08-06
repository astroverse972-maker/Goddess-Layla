import React, { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  className?: string;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = true,
  className = 'w-full h-full object-contain',
  onEnded
}) => {
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Extract Imgur ID if available
  const imgurMatch = src.match(/imgur\.com\/(?:a\/)?([a-zA-Z0-9]+)/);
  const imgurId = imgurMatch ? imgurMatch[1] : null;

  // Direct MP4 URL format
  const directMp4 = imgurId 
    ? `https://i.imgur.com/${imgurId}.mp4` 
    : src.startsWith('http') ? src : `https://i.imgur.com/${src}.mp4`;

  useEffect(() => {
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (autoPlay) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log('Autoplay handled:', err);
          });
        }
      }
    }
  }, [src, autoPlay]);

  if (hasError && imgurId) {
    return (
      <div className="relative w-full h-full bg-black flex items-center justify-center">
        <iframe
          src={`https://imgur.com/${imgurId}/embed?pub=true&ref=https%3A%2F%2Fimgur.com`}
          className="w-full h-full border-0 min-h-[300px]"
          title="Imgur Video Stream"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      poster={poster}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      controls={controls}
      playsInline
      preload="auto"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      onEnded={onEnded}
      className={className}
    >
      <source src={directMp4} type="video/mp4" referrerPolicy="no-referrer" />
    </video>
  );
};

