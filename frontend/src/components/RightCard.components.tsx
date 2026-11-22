'use client';

import { DateDisplay } from '@/components/DateDisplay.components';
import { Badge } from '@/components/ui/badge';
import { MEDIA_FILE_TYPES } from '@/constants/index.constants';
import { Link } from 'react-router-dom';
import { FeaturedMedia } from './FeaturedMedia.components';
import { isJustNow } from '@/utils/date.utils';

interface RightCardProps {
  title: string;
  category: string;
  date: Date | null;
  link: string;
  mediaSrc: string;
  thumbnail?: string;
  fileType: MEDIA_FILE_TYPES;
  name?: string;
}

const RightCard: React.FC<RightCardProps> = ({
  title,
  category,
  thumbnail,
  date,
  link,
  mediaSrc,
  name,
  fileType,
}) => (
  <Link
    to={link}
    className="flex w-full flex-row justify-between gap-4 overflow-hidden py-3 group"
  >
    <div className="flex flex-col gap-1 w-2/3 min-w-0">
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge
          variant={'outline'}
          className="w-fit text-slate-500 text-[10px] font-bold uppercase tracking-wider border-slate-200 bg-slate-50"
        >
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
      <h2 className="text-slate-900 line-clamp-3 text-sm font-bold leading-normal group-hover:text-[#e98571] transition-colors">
        {title}
      </h2>
      <DateDisplay date={date} className="whitespace-nowrap text-[11px] text-slate-400 font-medium mt-1" />
    </div>
    <div className="w-1/3 shrink-0 aspect-square rounded-md overflow-hidden bg-zinc-100 shadow-sm group-hover:shadow-md transition-all duration-300 self-center">
      <FeaturedMedia
        className="aspect-square h-full w-full rounded-md object-cover group-hover:scale-105 transition-transform duration-500"
        fileType={fileType}
        playable={false}
        thumbnail={thumbnail}
        name={name}
        url={mediaSrc}
        width={160}
        height={160}
        sizes="(max-width: 768px) 30vw, 160px"
      />
    </div>
  </Link>
);

export default RightCard;
