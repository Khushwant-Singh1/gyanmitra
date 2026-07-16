import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IApiArticleManage } from '@/api/client.api';
import numeral from 'numeral';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import TimeAgo from './TimeAgo.components';
import {
  ARTICLE_CONTENT_TYPES,
  ARTICLE_STATUS,
} from '@/constants/index.constants';
import { Badge } from './ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { DataTablePagination } from './DataTablePagination.components';
import { Textarea } from './ui/textarea';

interface ArticleTableProps {
  articles: IApiArticleManage[];
  navigate: (path: string) => void;
}

export const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  navigate,
}) => {
  const queryClient = useQueryClient();

  // Mutations
  const cloneArticle = useMutation({
    mutationFn: async ({ _id }: { _id: string }) => {
      const response = await axios.post(`/api/articles/${_id}/clone`);
      return { data: response.data };
    },
    onMutate: async ({ _id }) => {
      const toastId = toast.loading('Requesting to clone Article', { id: _id });
      return { toastId };
    },
    onSuccess: (_data, _, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success('Successfully Cloned Article');
      queryClient.invalidateQueries({ queryKey: ['articles', 'drafts'] });
      navigate('/administrator/articles-draft');
    },
    onError: (error, _, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const deleteArticle = useMutation({
    mutationFn: async ({ _id }: { _id: string }) => {
      const response = await axios.delete(`/api/articles/${_id}`);
      return { data: response.data };
    },
    onMutate: async ({ _id }) => {
      const toastId = toast.loading('Requesting to delete Article', {
        id: _id,
      });
      return { toastId };
    },
    onSuccess: (_data, _, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success('Successfully Deleted Article');
      queryClient.invalidateQueries({ queryKey: ['articles', 'all'] });
    },
    onError: (error, _, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const privateArticle = useMutation({
    mutationFn: async ({ _id }: { _id: string }) => {
      const response = await axios.put(`/api/articles/${_id}/private`);
      return { data: response.data };
    },
    onMutate: async ({ _id }) => {
      const toastId = toast.loading('Requesting to private Article', {
        id: _id,
      });
      return { toastId };
    },
    onSuccess: (_data, _, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success('Successfully Private Article');
      queryClient.invalidateQueries({ queryKey: ['articles', 'all'] });
    },
    onError: (error, _, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const publishArticle = useMutation({
    mutationFn: async ({ _id }: { _id: string }) => {
      const response = await axios.put(`/api/articles/${_id}/publish`);
      return { data: response.data };
    },
    onMutate: async ({ _id }) => {
      const toastId = toast.loading('Requesting to publish Article', {
        id: _id,
      });
      return { toastId };
    },
    onSuccess: (_data, _, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.success('Successfully Published Article');
      queryClient.invalidateQueries({ queryKey: ['articles', 'all'] });
    },
    onError: (error, _, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'lastUpdated', desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: false,
    slug: true,
    headline: true,
  });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<IApiArticleManage>[] = [
    {
      id: 'serialNumber',
      header: 'S.N.',
      cell: (info) => {
        const rowIndex = info.table
          .getRowModel()
          .rows.findIndex((row) => row.id === info.row.id);
        return rowIndex + 1;
      },
      enableSorting: false,
      enableColumnFilter: false,
    },
    {
      header: 'Headline',
      accessorKey: 'headline',
      cell: (info) => (
        <div className="line-clamp-3 max-w-[200px]">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      header: 'Slug',
      accessorKey: 'slug',
      cell: (info) => {
        const slug = info.getValue() as string;

        const handleCopy = () => {
          navigator.clipboard.writeText(slug).then(() => {
            toast.success('Slug copied to clipboard!');
          });
        };

        return (
          <Button
            variant={'ghost'}
            onClick={handleCopy}
            className="line-clamp-3 h-full max-w-[300px] !whitespace-normal p-0 text-start"
            title="Click to copy slug"
          >
            {slug}
          </Button>
        );
      },
    },

    {
      header: 'Description',
      accessorKey: 'description',
      cell: (info) => (
        <div className="line-clamp-3 max-w-[300px]">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (info) => (
        <Badge variant={'outline'}>{info.getValue() as string}</Badge>
      ),
    },
    {
      id: 'author',
      header: 'Author',
      accessorFn: ({ author }) => `${author.firstName} ${author.lastName}`,
      cell: (info) => (
        <div className="whitespace-nowrap text-center capitalize">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Views
          <ArrowUpDown />
        </Button>
      ),
      accessorKey: 'views',
      cell: (info) => (
        <div className="text-right">
          {numeral(info.getValue() as number).format('0.[0]a')}
        </div>
      ),
    },
    {
      accessorKey: 'contentType',
      header: ({ column }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              Type
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col">
              Filter
              <span className="text-muted-foreground text-sm font-normal">
                Select at least one
              </span>
            </DropdownMenuLabel>
            {[ARTICLE_CONTENT_TYPES.News, ARTICLE_CONTENT_TYPES.Article].map(
              (type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  className="capitalize"
                  checked={(column.getFilterValue() as string[])?.includes(
                    type
                  )}
                  onCheckedChange={(checked) => {
                    setColumnFilters((filters) => {
                      const existing = filters.find(
                        (f) => f.id === 'contentType'
                      );
                      if (!checked) {
                        return existing
                          ? filters.filter((f) => f !== existing)
                          : filters;
                      }
                      return [
                        ...filters.filter((f) => f.id !== 'contentType'),
                        { id: 'contentType', value: type },
                      ];
                    });
                  }}
                >
                  {type}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      accessorKey: 'lastUpdated',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Modified
          <ArrowUpDown />
        </Button>
      ),
      cell: (info) => (
        <TimeAgo icon={true} timestamp={new Date(info.getValue() as string)} />
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              Status
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex flex-col">
              Filter
              <span className="text-muted-foreground text-sm font-normal">
                Select at least one
              </span>
            </DropdownMenuLabel>
            {[ARTICLE_STATUS.Private, ARTICLE_STATUS.Published].map(
              (status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  className="capitalize"
                  checked={(column.getFilterValue() as string[])?.includes(
                    status
                  )}
                  onCheckedChange={(checked) => {
                    setColumnFilters((filters) => {
                      const existing = filters.find((f) => f.id === 'status');
                      if (!checked) {
                        return existing
                          ? filters.filter((f) => f !== existing)
                          : filters;
                      }
                      return [
                        ...filters.filter((f) => f.id !== 'status'),
                        { id: 'status', value: status },
                      ];
                    });
                  }}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <FontAwesomeIcon icon={faEllipsis} className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => deleteArticle.mutate({ _id: row.original._id })}
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => cloneArticle.mutate({ _id: row.original._id })}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                row.original.status === ARTICLE_STATUS.Private
                  ? publishArticle.mutate({ _id: row.original._id })
                  : privateArticle.mutate({ _id: row.original._id })
              }
            >
              {row.original.status === ARTICLE_STATUS.Private
                ? 'Published'
                : 'Private'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: articles,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    pageCount: Math.ceil(articles.length / pagination.pageSize),
  });

  return (
    <div>
      <div className="flex flex-wrap justify-start gap-3 pb-4">
        <Textarea
          placeholder="Filter Headline"
          className="max-w-sm basis-56 resize-none"
          value={
            (table.getColumn('headline')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) => {
            table.getColumn('headline')?.setFilterValue(event.target.value);
          }}
        />
        <Textarea
          placeholder="Filter Slug"
          className="max-w-sm basis-56 resize-none"
          value={(table.getColumn('slug')?.getFilterValue() as string) ?? ''}
          onChange={(event) => {
            table.getColumn('slug')?.setFilterValue(event.target.value);
          }}
        />
        <Input
          placeholder="Filter Category"
          type="search"
          className="max-w-sm basis-56"
          value={
            (table.getColumn('category')?.getFilterValue() as string) ?? ''
          }
          onChange={(event) => {
            table.getColumn('category')?.setFilterValue(event.target.value);
          }}
        />
        <Input
          placeholder="Filter Author"
          type="search"
          className="max-w-sm basis-56"
          value={(table.getColumn('author')?.getFilterValue() as string) ?? ''}
          onChange={(event) => {
            table.getColumn('author')?.setFilterValue(event.target.value);
          }}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <FontAwesomeIcon icon={faChevronDown} className="!h-3 !w-3" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="bg-muted/50 w-full py-1">
          <DataTablePagination table={table} />
        </div>
      </div>
    </div>
  );
};
