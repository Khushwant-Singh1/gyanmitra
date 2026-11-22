'use client';

import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MEDIA_FILE_TYPES } from '@/constants/index.constants';
import { DateDisplay } from '@/components/DateDisplay.components';
import { FeaturedMedia } from './FeaturedMedia.components';
import { isJustNow } from '@/utils/date.utils';

interface LeftCardProps {
  title: string;
  category: string;
  date: Date | null;
  link: string;
  mediaSrc: string;
  fileType: MEDIA_FILE_TYPES;
  thumbnail?: string;
  name?: string;
}

const LeftCard: React.FC<LeftCardProps> = ({
  title,
  category,
  date,
  link,
  mediaSrc,
  fileType,
  thumbnail,
  name,
}) => (
  <Link
    to={link}
    className="flex w-full flex-row items-start gap-4 overflow-hidden py-3 group"
  >
    <div className="w-1/3 shrink-0 aspect-video rounded-md overflow-hidden bg-zinc-100 shadow-sm group-hover:shadow-md transition-all duration-300">
      <FeaturedMedia
        className="aspect-video w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        fileType={fileType}
        playable={true}
        name={name || title} 
        thumbnail={thumbnail}
        url={mediaSrc}
        width={400}
        height={225}
        sizes="(max-width: 768px) 35vw, 400px"
      />
    </div>
    <div className="flex flex-col gap-1.5 w-2/3 min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant={'outline'} className="w-fit text-slate-500 text-[10px] font-bold uppercase tracking-wider border-slate-200 bg-slate-50">
          {category}
        </Badge>
        {isJustNow(date) && (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
            </span>
            अभी-अभी
          </span>
        )}
      </div>
      <h2 className="text-slate-900 text-base md:text-lg font-bold leading-normal group-hover:text-[#e98571] transition-colors line-clamp-3">
        {title}
      </h2>
      <DateDisplay date={date} className="text-xs text-slate-400 font-medium mt-0.5" />
    </div>
  </Link>
);

export default LeftCard;