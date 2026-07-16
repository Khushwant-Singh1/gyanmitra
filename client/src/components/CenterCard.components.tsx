import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { MEDIA_FILE_TYPES } from '@/constants/index.constants';
import { DateDisplay } from '@/components/DateDisplay.components';
import TimeAgo from '@/components/TimeAgo.components';
import { FeaturedMedia } from './FeaturedMedia.components';

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
    <div className="mb-3 aspect-video w-full rounded-md overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
      <FeaturedMedia
        className="aspect-video w-full shrink-0 overflow-hidden object-cover group-hover:scale-105 transition-transform duration-500"
        fileType={fileType}
        playable={true}
        url={mediaSrc}
        thumbnail={thumbnail}
        name={name}
        priority={priority}
      />
    </div>
    <Badge variant={'secondary'} className="text-[10px] uppercase tracking-wider font-bold mb-2">
      {category}
    </Badge>
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
