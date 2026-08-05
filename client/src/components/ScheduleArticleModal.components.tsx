import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { IApiResponse } from '@/api/client.api';

interface ScheduleArticleModalProps {
  articleId: string;
  headline?: string;
  initialDate?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const formatDateForInput = (dateString?: string) => {
  if (!dateString) {
    // Default to tomorrow at current time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T${pad(tomorrow.getHours())}:${pad(tomorrow.getMinutes())}`;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const pad = (num: number) => String(num).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const ScheduleArticleModal: React.FC<ScheduleArticleModalProps> = ({
  articleId,
  headline,
  initialDate,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setScheduledDate(formatDateForInput(initialDate));
    }
  }, [open, initialDate]);

  const scheduleMutation = useMutation({
    mutationFn: async (dateStr: string) => {
      const res = await axios.put<IApiResponse<any>>(
        `/api/articles/${articleId}/publish`,
        { scheduledPublishDate: new Date(dateStr).toISOString() }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success('Article scheduled successfully!');
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      const msg = isAxiosError(error)
        ? error.response?.data?.message || 'Failed to schedule article'
        : 'Unknown error occurred';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) {
      toast.warning('Please select a valid date and time');
      return;
    }
    const selectedTime = new Date(scheduledDate).getTime();
    if (selectedTime <= Date.now()) {
      toast.warning('Scheduled date must be in the future!');
      return;
    }
    scheduleMutation.mutate(scheduledDate);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Schedule News Article</DialogTitle>
            <DialogDescription>
              {headline ? `"${headline}"` : 'Select a future date and time for automatic publishing.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="publishDate" className="text-right text-xs">
                Publish Date & Time
              </Label>
              <Input
                id="publishDate"
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="col-span-3 text-xs bg-white"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={scheduleMutation.isPending}
            >
              {scheduleMutation.isPending ? 'Scheduling...' : 'Schedule Article'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
