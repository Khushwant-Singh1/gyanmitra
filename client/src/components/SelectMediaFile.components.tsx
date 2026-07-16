import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsisV,
  faFileImage,
  faFileVideo,
} from '@fortawesome/free-solid-svg-icons';
import numeral from 'numeral';
import axios, { isAxiosError } from 'axios';
import { IApiResponse, IApiSelectMediaFile } from '@/api/client.api';
import { MEDIA_FILE_TYPES } from '@/constants/index.constants';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Spinner } from './Spinner.components';
import { UploadMediaFile } from './UploadMediaFile.component';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';
export const SelectMediaFile: React.FC<{
  value?: { id: string } | null;
  onChange: (file: { id: string; name: string; url: string } | null) => void;
  allowedFile?: MEDIA_FILE_TYPES[];
  showBtn?: boolean;
}> = ({
  value,
  onChange,
  showBtn,
  allowedFile = [MEDIA_FILE_TYPES.Video, MEDIA_FILE_TYPES.Image],
}) => {
  const [page, setPage] = useState<number>(1);
  const [selectedFile, setSelectedFile] = useState<{
    id: string;
    name: string;
    url: string;
  } | null>(null);

  const fetchFileById = async (id: string) => {
    try {
      const { data } = await axios.get<
        IApiResponse<{
          _id: string;
          name: string;
          fileUrl: string;
          fileType: MEDIA_FILE_TYPES;
          thumbnail?: string;
        }>
      >(`/api/media/${id}`);
      setSelectedFile({
        id: data.data._id,
        name: data.data.name,
        url: data.data.fileUrl,
      });
    } catch {
      setSelectedFile(null);
    }
  };

  const queryClient = useQueryClient();

  const deleteFileMutation = useMutation({
    mutationFn: async ({ _id }: { _id: string }) => {
      const response = await axios.delete('/api/media/' + _id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });

      toast.success('File uploaded successfully!');
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

  // Fetch selected file details if value contains only an id
  useEffect(() => {
    if (value?.id) {
      fetchFileById(value.id);
    }
  }, [value]);

  const {
    data,
    error,
    isFetching,
    refetch: fetchMediaFiles,
  } = useQuery<IApiResponse<IApiSelectMediaFile>>({
    queryKey: ['media', { page, allowedFile }],
    staleTime: Infinity,
    queryFn: async () => {
      const { data } = await axios.get<IApiResponse<IApiSelectMediaFile>>(
        '/api/media/',
        {
          params: { page, file_types: allowedFile },
        }
      );
      return data;
    },
  });

  const handleRowClick = (file: { id: string; name: string; url: string }) => {
    setSelectedFile(file);
  };

  return (
    <Dialog>
      <DialogTrigger asChild hidden={showBtn}>
        <Button
          variant="outline"
          onClick={() => fetchMediaFiles()}
          className="line-clamp-1"
        >
          {value?.id && selectedFile
            ? `Selected File - ${selectedFile.name}`
            : 'Choose File'}
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Media File</DialogTitle>
          <DialogDescription>
            Select a file from the list below or add/delete files as needed.
          </DialogDescription>
        </DialogHeader>

        <UploadMediaFile allowedFile={allowedFile} />

        {isFetching ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex h-40 items-center justify-center text-red-600">
            <span>Error: {error.message}</span>
          </div>
        ) : (
          <div>
            <div className="rounded-md border">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Last Modified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.files?.length ? (
                    data.data.files.map((file) => (
                      <TableRow
                        key={file._id}
                        className={`cursor-pointer hover:bg-gray-100 ${
                          selectedFile?.id === file._id ? 'bg-gray-200' : ''
                        }`}
                        onClick={() =>
                          handleRowClick({
                            id: file._id,
                            name: file.name,
                            url: file.fileUrl,
                          })
                        }
                      >
                        <TableCell className="flex items-center space-x-2">
                          <FontAwesomeIcon
                            icon={
                              file.resourceType === MEDIA_FILE_TYPES.Image
                                ? faFileImage
                                : faFileVideo
                            }
                          />
                          <span>{file.name}</span>
                        </TableCell>
                        <TableCell>
                          {numeral(file.fileSize).format('0.0 b')}
                        </TableCell>
                        <TableCell>
                          {file.resourceType}/{file.format.toUpperCase()}
                        </TableCell>
                        <TableCell>
                          {new Date(file.lastModified).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant={'ghost'} size={'xs'}>
                                <FontAwesomeIcon icon={faEllipsisV} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  navigator.clipboard.writeText(file.fileUrl);
                                }}
                              >
                                Copy Url
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  deleteFileMutation.mutate({
                                    _id: file._id,
                                  });
                                }}
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No results found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between px-3 py-4">
                <span className="text-muted-foreground text-sm font-semibold">
                  Page {data?.data.currentPage} of {data?.data.totalPages}
                </span>
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setPage((prev) => Math.max(prev - 1, 1));
                      fetchMediaFiles();
                    }}
                    disabled={isFetching || page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPage((prev) => prev + 1);
                      fetchMediaFiles();
                    }}
                    disabled={
                      isFetching ||
                      data?.data.currentPage === data?.data.totalPages
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button
              disabled={!selectedFile}
              className="mt-4"
              onClick={() => onChange(selectedFile)}
            >
              {selectedFile ? 'Confirm Selection' : 'Select File'}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
