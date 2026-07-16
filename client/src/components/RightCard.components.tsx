import { DateDisplay } from '@/components/DateDisplay.components';
import { Badge } from '@/components/ui/badge';
import { MEDIA_FILE_TYPES } from '@/constants/index.constants';
import { Link } from 'react-router-dom';
import { FeaturedMedia } from './FeaturedMedia.components';

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
    <div className="flex flex-col gap-1 w-2/3">
      <Badge
        variant={'outline'}
        className="w-fit text-slate-500 text-[10px] font-bold uppercase tracking-wider border-slate-200 bg-slate-50"
      >
        {category}
      </Badge>
      <h2 className="text-slate-900 line-clamp-3 text-sm font-bold leading-normal group-hover:text-[#e98571] transition-colors">
        {title}
      </h2>
      <DateDisplay date={date} className="whitespace-nowrap text-[11px] text-slate-400 font-medium mt-1" />
    </div>
    <div className="w-1/3 shrink-0 rounded-md overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300 self-center">
      <FeaturedMedia
        className="aspect-square h-[80px] w-full rounded-md object-cover group-hover:scale-105 transition-transform duration-500"
        fileType={fileType}
        playable={false}
        thumbnail={thumbnail}
        name={name}
        url={mediaSrc}
      />
    </div>
  </Link>
);

export default RightCard;
