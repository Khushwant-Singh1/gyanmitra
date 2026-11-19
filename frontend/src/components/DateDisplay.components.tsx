'use client';

import { DATE_OPTION } from '@/constants/index.constants';
import { faCalendar } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useLocation } from 'react-router-dom'; // Import for route detection

interface DateDisplayProps {
  date: Date | null;
  className?: string;
}

const IST_DATE_OPTION: Intl.DateTimeFormatOptions = {
  ...DATE_OPTION,
  timeZone: 'Asia/Kolkata',
};

export const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  className,
}) => {
  const location = useLocation(); // Get the current route
  const locale = location.pathname.startsWith('/administrator')
    ? 'en-US'
    : 'hi-IN'; // Set locale based on route

  return (
    <div className={className} suppressHydrationWarning>
      <span>
        <FontAwesomeIcon icon={faCalendar} />
        <span className="ml-2 whitespace-nowrap capitalize" suppressHydrationWarning>
          {date
            ? date.toLocaleDateString(locale, IST_DATE_OPTION) // Dynamically apply locale with fixed IST timezone
            : locale === 'hi-IN'
              ? 'दिनांक उपलब्ध नहीं है'
              : 'Date not available'}
        </span>
      </span>
    </div>
  );
};
