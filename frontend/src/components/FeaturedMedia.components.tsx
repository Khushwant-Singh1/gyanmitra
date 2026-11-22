'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
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

const isOptimizable = (url?: string): boolean => {
  if (!url) return false;
  if (url.startsWith('/')) return true;
  try {
    const host = new URL(url).hostname;
    return (
      host === 'gyanmitranews.com' ||
      host === 'www.gyanmitranews.com' ||
      host === 'api.gyanmitranews.com' ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === 'server'
    );
  } catch {
    return false;
  }
};

export const FeaturedMedia: React.FC<{
  fileType: MEDIA_FILE_TYPES;
  url: string;
  name?: string;
  className: string;
  playable?: boolean;
  thumbnail?: string;
  priority?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
}> = ({
  fileType,
  url,
  className,
  name,
  playable = true,
  thumbnail,
  priority = false,
  width = 1200,
  height = 675,
  sizes,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fallbackStage, setFallbackStage] = useState(0);
  const resolvedUrl = normalizeMediaUrl(url);
  const resolvedThumbnail = normalizeMediaUrl(thumbnail);

  useEffect(() => {
    setFallbackStage(0);
  }, [resolvedUrl]);

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

  if (fallbackStage >= 3 || !resolvedUrl) {
    return <ImagePlaceholder name={name} className={className} />;
  }

  const optimizable = isOptimizable(resolvedUrl);

  if (fallbackStage === 1) {
    return (
      <img
        src={
          optimizable
            ? `/_next/image?url=${encodeURIComponent(resolvedUrl)}&w=1200&q=75`
            : resolvedUrl
        }
        className={`${className} skelton`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        alt={name || 'Gyanmitra News Featured Image'}
        title={name || 'Gyanmitra News Featured Image'}
        onError={() => setFallbackStage(2)}
      />
    );
  }

  if (fallbackStage === 2) {
    return (
      <img
        src={resolvedUrl}
        className={`${className} skelton`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width={width}
        height={height}
        alt={name || 'Gyanmitra News Featured Image'}
        title={name || 'Gyanmitra News Featured Image'}
        onError={() => setFallbackStage(3)}
      />
    );
  }

  return (
    <Image
      src={resolvedUrl}
      className={`${className} skelton`}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      fetchPriority={priority ? 'high' : 'low'}
      decoding="async"
      width={width}
      height={height}
      sizes={
        sizes ||
        (width <= 200
          ? '(max-width: 768px) 30vw, 160px'
          : width <= 500
          ? '(max-width: 768px) 35vw, 400px'
          : '(max-width: 768px) 100vw, 800px')
      }
      alt={name || 'Gyanmitra News Featured Image'} 
      title={name || 'Gyanmitra News Featured Image'}
      unoptimized={!optimizable}
      onError={() => {
        // If responsive Next.js image optimization fails (e.g. mobile 404 for w=256/w=640 due to missing upstream key),
        // try the cached master 1200px variant first.
        setFallbackStage(1);
      }}
    />
  );
};