import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

export const ErrorAlert: React.FC<{ message?: string }> = ({
  message = 'No Data Found',
}) => {
  return (
    <Alert
      variant="destructive"
      className="animate-slideDown absolute left-1/2 w-[90%] md:w-[500px]"
    >
      <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2 h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};
