import React, { useRef, useState } from 'react';
import { MEDIA_FILE_TYPES } from '@/constants/index.constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { Button } from './ui/button';

const ImagePlaceholder: React.FC<{ name?: string; className?: string }> = ({ name, className }) => {
  return (
    <div className={`${className} flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-[#fbf5f3] to-[#f6e6e3] border border-[#f1dbd6]/50 p-4 select-none rounded-md relative overflow-hidden`}>
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-[#e98571]/5 rounded-full blur-xl" />
      <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-[#e98571]/5 rounded-full blur-xl" />
      
      <div className="bg-[#e98571]/10 p-2.5 rounded-full mb-2.5 text-[#e98571] shadow-sm">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      </div>
      <span className="text-[10px] font-black tracking-widest text-[#e98571] uppercase">Gyanmitra News</span>
      {name && (
        <span className="text-[10px] text-slate-500 font-bold text-center line-clamp-2 mt-1.5 px-3 max-w-[90%] drop-shadow-sm leading-normal">
          {name}
        </span>
      )}
    </div>
  );
};

const normalizeMediaUrl = (url?: string) => {
  if (!url) return '';

  const normalized = url.replace(/\\/g, '/').trim();

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  const uploadsMatch = normalized.match(/(?:^|\/)uploads\/(.+)$/i);
  if (uploadsMatch) {
    return `/uploads/${uploadsMatch[1]}`;
  }

  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

export const FeaturedMedia: React.FC<{
  fileType: MEDIA_FILE_TYPES;
  url: string;
  name?: string;
  className: string;
  playable?: boolean;
  thumbnail?: string;
  priority?: boolean;
}> = ({ fileType, url, className, name, playable = true, thumbnail, priority = false }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const resolvedUrl = normalizeMediaUrl(url);
  const resolvedThumbnail = normalizeMediaUrl(thumbnail);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      videoRef.current.controls = true;
      setIsPlaying(true);
    }
  };

  if (fileType === MEDIA_FILE_TYPES.Video) {
    return (
      <div className={`relative ${className} skelton`}>
        <video
          controls={false}
          className={className}
          poster={resolvedThumbnail}
          ref={videoRef}
          onClick={() => {
            if (!isPlaying && playable) {
              handlePlay();
            }
          }}
          // SEO: Video ke liye bhi title/description helpful hota hai
          title={name || 'Gyanmitra News Video'}
        >
          <source src={resolvedUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {!isPlaying && playable && (
          <Button
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full p-4"
            onClick={handlePlay}
            variant={'secondary'}
          >
            <FontAwesomeIcon icon={faPlay} size="2xl" />
          </Button>
        )}
      </div>
    );
  }

  if (hasError) {
    return <ImagePlaceholder name={name} className={className} />;
  }

  // Fallback for non-video files (Images)
  return (
    <img
      src={resolvedUrl}
      className={`${className} skelton`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      // SEO FIX: Alt aur Title dono ko article/image name se map kiya
      alt={name || 'Gyanmitra News Featured Image'} 
      title={name || 'Gyanmitra News Featured Image'}
      onError={() => setHasError(true)}
    />
  );
};