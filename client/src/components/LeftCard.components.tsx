import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MEDIA_FILE_TYPES } from '@/constants/index.constants';
import { DateDisplay } from '@/components/DateDisplay.components';
import { FeaturedMedia } from './FeaturedMedia.components';

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
    <div className="w-1/3 shrink-0 rounded-md overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
      <FeaturedMedia
        className="aspect-video w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        fileType={fileType}
        playable={true}
        name={name || title} 
        thumbnail={thumbnail}
        url={mediaSrc}
      />
    </div>
    <div className="flex flex-col gap-1 w-2/3">
      <Badge variant={'outline'} className="w-fit text-slate-500 text-[10px] font-bold uppercase tracking-wider border-slate-200 bg-slate-50">
        {category}
      </Badge>
      <h2 className="text-slate-900 text-base md:text-lg font-bold leading-normal group-hover:text-[#e98571] transition-colors line-clamp-3">
        {title}
      </h2>
      <DateDisplay date={date} className="text-xs text-slate-400 font-medium mt-1" />
    </div>
  </Link>
);

export default LeftCard;