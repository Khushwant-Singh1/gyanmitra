'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IApiResponse } from '@/api/client.api';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/Spinner.components';

interface IUserOption {
  _id: string;
  name: string;
}

interface CoAuthorSelectProps {
  selectedCoAuthorIds: string[];
  onChange: (selectedIds: string[]) => void;
  currentUserId?: string;
}

export const CoAuthorSelect: React.FC<CoAuthorSelectProps> = ({
  selectedCoAuthorIds,
  onChange,
  currentUserId,
}) => {
  const { data, isLoading } = useQuery<IApiResponse<IUserOption[]>>({
    queryKey: ['users', 'names'],
    queryFn: async () => {
      const res = await axios.get<IApiResponse<IUserOption[]>>('/api/users/name');
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500 py-2">
        <Spinner /> Loading team members...
      </div>
    );
  }

  const teamMembers = (data?.data || []).filter(
    (user) => !currentUserId || user._id !== currentUserId
  );

  if (teamMembers.length === 0) {
    return (
      <p className="text-xs text-zinc-400 py-1">No other team members available.</p>
    );
  }

  const handleToggle = (userId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedCoAuthorIds, userId]);
    } else {
      onChange(selectedCoAuthorIds.filter((id) => id !== userId));
    }
  };

  return (
    <div className="space-y-2 border rounded-md p-3 bg-zinc-50/50">
      <div className="flex flex-wrap gap-3">
        {teamMembers.map((member) => {
          const isChecked = selectedCoAuthorIds.includes(member._id);
          return (
            <div
              key={member._id}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
                isChecked
                  ? 'bg-primary/10 border-primary text-primary font-medium'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
              onClick={() => handleToggle(member._id, !isChecked)}
            >
              <Checkbox
                id={`coauthor-${member._id}`}
                checked={isChecked}
                onCheckedChange={(checked) => handleToggle(member._id, !!checked)}
                onClick={(e) => e.stopPropagation()}
              />
              <Label
                htmlFor={`coauthor-${member._id}`}
                className="cursor-pointer text-xs font-normal"
                onClick={(e) => e.stopPropagation()}
              >
                {member.name}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
};
