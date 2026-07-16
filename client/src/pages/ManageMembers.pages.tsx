import React from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEllipsisV,
  faUserCheck,
  faUserSlash,
} from '@fortawesome/free-solid-svg-icons';
import { DateDisplay } from '@/components/DateDisplay.components';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { IApiManageMembers, type IApiResponse } from '@/api/client.api';
import axios, { isAxiosError } from 'axios';
import { Spinner } from '@/components/Spinner.components';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { USER_ROLE } from '@/constants/index.constants';
import { CreateMember } from '@/components/CreateMember.components';

export const columns: ColumnDef<IApiManageMembers>[] = [
  {
    accessorKey: 'userName',
    header: 'Name',
    cell: ({ row }) => (
      <span className="font-medium capitalize">
        {row.original.userName.firstName + ' ' + row.original.userName.lastName}
      </span>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    filterFn: (row, columnId, filterValue) => {
      const effectiveFilter = filterValue.length
        ? filterValue
        : [USER_ROLE.Admin, USER_ROLE.Viewer, USER_ROLE.Editor];
      return effectiveFilter.includes(row.getValue(columnId));
    },
    header: ({ column }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              Role <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[USER_ROLE.Admin, USER_ROLE.Viewer, USER_ROLE.Editor].map(
              (role) => (
                <DropdownMenuCheckboxItem
                  key={role}
                  className="capitalize"
                  checked={(column.getFilterValue() as string[])?.includes(
                    role
                  )}
                  onCheckedChange={(isChecked) => {
                    const currentFilter =
                      (column.getFilterValue() as string[]) || [];
                    if (isChecked) {
                      column.setFilterValue([...currentFilter, role]);
                    } else {
                      column.setFilterValue(
                        currentFilter.filter((r) => r !== role)
                      );
                    }
                  }}
                >
                  {role}
                </DropdownMenuCheckboxItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },

    cell: ({ row }) => <Badge variant={'outline'}>{row.original.role}</Badge>,
  },
  {
    accessorKey: 'inviter',
    header: 'Inviter',
    cell: ({ row }) => {
      if (row.original.inviter.length) {
        return (
          <Button
            variant={'ghost'}
            onClick={() => {
              toast.success('Email Copied.');
              navigator.clipboard.writeText(row.original.inviter);
            }}
            className="px-1"
          >
            {row.original.inviter}
          </Button>
        );
      }
      return 'Not invited';
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <DateDisplay date={new Date(row.original.createdAt)} />,
  },
  {
    accessorKey: 'emailVerified',
    header: 'Email Verified',
    cell: ({ row }) =>
      row.original.emailVerified ? (
        <FontAwesomeIcon className="w-full" icon={faUserCheck} />
      ) : (
        <FontAwesomeIcon className="w-full" icon={faUserSlash} />
      ),
  },
  {
    accessorKey: 'actions',
    header: '',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'ghost'}>
            <FontAwesomeIcon icon={faEllipsisV} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem className="text-destructive">
            Block
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export const ManageMembers: React.FC = () => {
  const memoizedColumns = React.useMemo(() => columns, []);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const { data, isLoading, error } = useQuery<
    IApiResponse<IApiManageMembers[]>
  >({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const response =
        await axios.get<IApiResponse<IApiManageMembers[]>>(`/api/users/`);
      return response.data;
    },
    staleTime: 1000 * 60 * 60,
  });
  const table = useReactTable({
    data: data?.data || [],
    columns: memoizedColumns,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
    initialState: {
      columnFilters: [
        {
          id: 'role',
          value: [USER_ROLE.Admin, USER_ROLE.Viewer, USER_ROLE.Editor],
        },
      ],
    },
  });
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Helmet>
          <title>Members - Gyanmitra</title>
        </Helmet>
        <Spinner />
      </div>
    );
  }

  if (error || !data) {
    const errorMessage =
      isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : 'An error occurred';

    return (
      <div className="flex h-screen items-center justify-center py-4">
        <ErrorAlert message={errorMessage} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Helmet>
        <title>Members - Gyanmitra</title>
      </Helmet>
      <div className="flex justify-between">
        <Input
          placeholder="Filter Email"
          type="email"
          className="max-w-sm"
          value={(table.getColumn('email')?.getFilterValue() as string) ?? ''}
          onChange={(event) => {
            table.getColumn('email')?.setFilterValue(event.target.value);
          }}
        />
        <CreateMember />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Members invited by you.</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TableCell colSpan={columns.length} className="text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
