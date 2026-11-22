'use client';

import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MEDIA_FILE_TYPES } from '@/constants/index.constants';
import { DateDisplay } from '@/components/DateDisplay.components';
import TimeAgo from '@/components/TimeAgo.components';
import { FeaturedMedia } from './FeaturedMedia.components';
import { isJustNow } from '@/utils/date.utils';

interface CenterCardProps {
  title: string;
  description: string;
  category: string;
  date: Date | null;
  link: string;
  mediaSrc: string;
  fileType: MEDIA_FILE_TYPES;
  thumbnail?: string;
  name: string;
  priority?: boolean;
}

const CenterCard: React.FC<CenterCardProps> = ({
  title,
  description,
  category,
  date,
  link,
  mediaSrc,
  fileType,
  thumbnail,
  name,
  priority = false,
}) => (
  <Link
    to={link}
    className="flex flex-col items-center overflow-hidden px-0 sm:px-3 group"
  >
    <div className="mb-3 aspect-video w-full rounded-md overflow-hidden bg-zinc-100 shadow-sm group-hover:shadow-md transition-all duration-300">
      <FeaturedMedia
        className="aspect-video w-full shrink-0 overflow-hidden object-cover group-hover:scale-105 transition-transform duration-500"
        fileType={fileType}
        playable={true}
        url={mediaSrc}
        thumbnail={thumbnail}
        name={name}
        priority={priority}
        width={1200}
        height={675}
        sizes="(max-width: 768px) 100vw, 800px"
      />
    </div>
    <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
      <Badge variant={'secondary'} className="text-[10px] uppercase tracking-wider font-bold">
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
    <h2 className="text-slate-900 mb-2 text-center text-2xl font-bold leading-normal group-hover:text-[#e98571] transition-colors">
      {title}
    </h2>
    <div className="text-slate-500 flex flex-row gap-3 text-xs font-medium mb-2">
      <DateDisplay date={date} />
      <TimeAgo timestamp={date} />
    </div>
    <p className="text-slate-600 mt-1 text-center leading-relaxed text-sm">
      {description}
    </p>
  </Link>
);

export default CenterCard;
