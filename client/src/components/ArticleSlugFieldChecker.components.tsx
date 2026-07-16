import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRotateRight,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { Textarea } from './ui/textarea';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';

interface ArticleSlugFieldCheckerProps {
  initialValue: string;
  filedName: string;
  fieldDescription: string;
  onChange?: (value: string) => void;
  onValidSlug: (isValid: boolean, articleId: string | null) => void;
}

export const ArticleSlugFieldChecker: React.FC<
  ArticleSlugFieldCheckerProps
> = ({ initialValue, onChange, fieldDescription, onValidSlug, filedName }) => {
  const [debouncedSlug, setDebouncedSlug] = useState(initialValue);
  const [slug, setSlug] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (slug.trim().length) setDebouncedSlug(slug.trim());
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [slug]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['articles', 'exists', debouncedSlug],
    queryFn: async () => {
      const response = await axios.get(`/api/articles/exists/${debouncedSlug}`);
      return response.data;
    },
    enabled: !!debouncedSlug,
  });

  useEffect(() => {
    if (data) {
      onValidSlug(
        data.data.articleExists,
        data.data.articleExists ? data.data._id : null
      );
    }
  }, [data, onValidSlug]);

  return (
    <FormItem>
      <FormLabel>{filedName}</FormLabel>
      <FormControl>
        <div className="relative">
          <Textarea
            placeholder="Enter the cover article slug"
            value={slug}
            onChange={(e) => {
              if (onChange) onChange(e.target.value);
              setSlug(e.target.value);
            }}
            className="resize-none pr-10"
          />
          {slug.length > 0 && isLoading && (
            <FontAwesomeIcon
              icon={faRotateRight}
              className="absolute right-3 top-1/3 -translate-y-1/2 transform text-gray-500"
              spin
            />
          )}
          {slug.length > 0 && isError && (
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-red-500"
            />
          )}
          {slug.length > 0 && data && (
            <FontAwesomeIcon
              icon={
                data.data.articleExists ? faCircleCheck : faTriangleExclamation
              }
              className={`absolute right-3 top-1/2 -translate-y-1/2 transform ${
                data.data.articleExists ? 'text-green-500' : 'text-yellow-500'
              }`}
            />
          )}
        </div>
      </FormControl>
      <FormDescription>{fieldDescription}</FormDescription>
      <FormMessage />
    </FormItem>
  );
};
