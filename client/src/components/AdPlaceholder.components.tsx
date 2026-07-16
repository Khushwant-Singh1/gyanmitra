import React from 'react';
import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
  className?: string;
  type?: 'leaderboard' | 'rectangle' | 'horizontal';
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ 
  className, 
  type = 'horizontal' 
}) => {
  // Define standard dimensions based on ad type
  const typeStyles = {
    leaderboard: 'w-full max-w-[728px] h-[90px] mx-auto', // Standard header ad
    rectangle: 'w-[300px] h-[250px] mx-auto', // Standard sidebar ad
    horizontal: 'w-full h-[120px]', // In-feed ad
  };

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center bg-slate-100 border border-slate-200 border-dashed rounded text-slate-400 overflow-hidden",
        typeStyles[type],
        className
      )}
    >
      <span className="text-[10px] uppercase tracking-widest font-bold">Advertisement</span>
      <span className="text-[8px] mt-1 opacity-50">Ad Space available</span>
    </div>
  );
};
