import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { hi, enUS } from 'date-fns/locale'; // Import locales
import { useLocation } from 'react-router-dom'; // For route detection
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';

interface TimeAgoProps {
  timestamp: Date | null;
  className?: string;
  icon?: boolean;
}

const TimeAgo: React.FC<TimeAgoProps> = ({
  timestamp,
  className,
  icon = true,
}) => {
  const location = useLocation(); // Get the current route
  const locale = location.pathname.startsWith('/administrator') ? enUS : hi; // Set locale dynamically

  const validTimestamp =
    timestamp instanceof Date && !isNaN(timestamp.getTime());

  const convertToEnglishNumerals = (text: string) => {
    return text.replace(/[०-९]/g, (match) => {
      const hindiToEnglishMap: { [key: string]: string } = {
        '०': '0',
        '१': '1',
        '२': '2',
        '३': '3',
        '४': '4',
        '५': '5',
        '६': '6',
        '७': '7',
        '८': '8',
        '९': '9',
      };
      return hindiToEnglishMap[match] || match;
    });
  };

  if (validTimestamp) {
    let timeAgo = formatDistanceToNow(timestamp as Date, {
      addSuffix: true,
      locale, // Apply the dynamic locale
    });

    // Remove "about" and convert Hindi numerals if locale is hi
    timeAgo = timeAgo.replace(/^about\s/, ''); // Remove "about" prefix
    if (locale === hi) {
      timeAgo = convertToEnglishNumerals(timeAgo);
    }

    return (
      <span className={className}>
        {icon ? (
          <FontAwesomeIcon
            icon={faClock}
            className={className ? className : `mr-1`}
          />
        ) : null}
        {timeAgo}
      </span>
    );
  } else {
    return <span>समय उपलब्ध नहीं है</span>; // Hindi fallback for invalid timestamps
  }
};

export default TimeAgo;
