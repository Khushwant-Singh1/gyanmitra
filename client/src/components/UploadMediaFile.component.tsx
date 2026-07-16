import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';
import {
  ACCEPTED_FILE_TYPES,
  MEDIA_FILE_TYPES,
} from '@/constants/index.constants';
import { Label } from './ui/label';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ReloadIcon } from '@radix-ui/react-icons';
import { SelectMediaFile } from './SelectMediaFile.components';

export const UploadMediaFile: React.FC<{
  allowedFile: MEDIA_FILE_TYPES[];
}> = ({ allowedFile }) => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [name, setName] = useState<string>('');

  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;

    if (selectedFile) {
      if (!ACCEPTED_FILE_TYPES.includes(selectedFile.type)) {
        toast.error('Invalid file type. Only common image formats and MP4 are allowed.');
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const uploadFileMutation = useMutation({
    mutationFn: async ({
      file,
      name,
      thumbnail,
    }: {
      name: string;
      file: File;
      thumbnail: string | null;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);

      if (thumbnail) formData.append('thumbnail', thumbnail);

      const response = await axios.post('/api/media/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });

      toast.success('File uploaded successfully!');
      setFile(null);
      setName('');
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        if (error.response) {
          const errorMessage =
            error.response.data?.message ||
            error.message ||
            'An error occurred';
          toast.error(errorMessage);
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Unknown error occurred');
      }
    },
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="file">File</Label>
          <Input
            type="file"
            accept={(allowedFile || Object.values(MEDIA_FILE_TYPES))
              .map((type) =>
                type === MEDIA_FILE_TYPES.Image
                  ? 'image/*'
                  : type === MEDIA_FILE_TYPES.Video
                    ? 'video/mp4'
                    : ''
              )
              .join(', ')}
            onChange={handleFileChange}
            id="file"
          />
        </div>
        {file?.type.startsWith('video') && (
          <div className="flex-1">
            <Label htmlFor="thumbnailFile">Select Thumbnail</Label>
            <div id="thumbnailFile" className="flex flex-col">
              <SelectMediaFile
                onChange={(file) => {
                  if (file) setThumbnail(file.id);
                }}
                allowedFile={[MEDIA_FILE_TYPES.Image]}
                value={thumbnail ? { id: thumbnail } : undefined}
              />
            </div>
          </div>
        )}
        <div className="flex-1">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            onChange={(e) => setName(e.target.value)}
            value={name}
            placeholder="Enter File Name"
          />
        </div>
      </div>
      <Button
        onClick={() => {
          if (!file) {
            toast.error('Please select a valid file.');
            return;
          }
          console.log('file', file);

          uploadFileMutation.mutate({ file, name, thumbnail });
        }}
        disabled={uploadFileMutation.isPending || !file || !name}
        className="self-end"
      >
        {uploadFileMutation.isPending ? (
          <div className="whitespace-nowrap">
            Uploading File
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
          </div>
        ) : (
          'Upload File'
        )}
      </Button>
    </div>
  );
};
