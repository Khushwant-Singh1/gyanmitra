import { IApiResponse, type IApiManageCategory } from '@/api/client.api';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Spinner } from '@/components/Spinner.components';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  faChevronDown,
  faChevronUp,
  faEllipsisV,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import type { UseMutationResult } from '@tanstack/react-query';
import { CreateCategory } from '../components/CreateCategory.components';
import { EditCategory } from '@/components/EditCategory.components';

// Update DropDownMenuCat
const DropDownMenuCat: React.FC<{
  category: { _id: string; name: string };
  subcategories: { _id: string; name: string }[];
  deleteMutation: UseMutationResult<
    any,
    Error,
    { id: string },
    { toastID: string | number }
  >;
}> = ({ category, subcategories, deleteMutation }) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
  const handleEditClick = () => {
    setIsEditOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-3">
        <div className="bg-customGray w-0.5" />
        <Button
          variant="ghost"
          className="w-full flex-1 justify-start capitalize"
          onClick={() => setIsOpened((v) => !v)}
        >
          {subcategories.length > 0 ? (
            <FontAwesomeIcon
              icon={isOpened ? faChevronUp : faChevronDown}
              className="mr-2"
            />
          ) : null}
          {category.name}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <FontAwesomeIcon icon={faEllipsisV} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              className="text-destructive hover:text-destructive"
              onClick={() => deleteMutation.mutate({ id: category._id })}
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <EditCategory
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        categoryId={category._id}
      />

      {isOpened && subcategories.length > 0 && (
        <div id={`subcategory-${category.name}`} style={{ marginLeft: '40px' }}>
          {subcategories.map((subcategory, index) => (
            <SubCategoryRow
              key={`${subcategory}-${index}`}
              name={subcategory.name}
              _id={subcategory._id}
              deleteMutation={deleteMutation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Update SubCategoryRow
const SubCategoryRow: React.FC<{
  name: string;
  _id: string;
  deleteMutation: UseMutationResult<
    any,
    Error,
    { id: string },
    { toastID: string | number }
  >;
}> = ({ name, _id, deleteMutation }) => {
  const [isEditOpen, setIsEditOpen] = useState<boolean | undefined>(false);
  const handleEditClick = () => {
    setIsEditOpen(true);
  };

  return (
    <div className="flex flex-row gap-3">
      <div className="bg-customGray w-0.5" />
      <div
        className={buttonVariants({
          variant: 'ghost',
          className: 'w-full !justify-start capitalize',
        })}
      >
        {name}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost">
            <FontAwesomeIcon icon={faEllipsisV} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            className="text-destructive hover:text-destructive"
            onClick={() => deleteMutation.mutate({ id: _id })}
          >
            Delete
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isEditOpen && (
        <EditCategory
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          categoryId={_id}
        />
      )}
    </div>
  );
};

export const ManageCategory: React.FC = () => {
  const { data, isLoading, error } = useQuery<
    IApiResponse<IApiManageCategory[]>
  >({
    queryKey: ['categories', 'manage'],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiManageCategory[]>>(
        `/api/categories/manage`
      );
      return response.data;
    },
  });

  const clientQuery = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await axios.delete(`/api/categories/${id}`);
      return response.data;
    },
    onMutate: () => {
      const toastID = toast.loading('Deleting...');
      return { toastID };
    },
    onSuccess: (_, {}, context) => {
      toast.dismiss(context.toastID);
      clientQuery.invalidateQueries({
        queryKey: ['categories', 'manage'],
      });
      clientQuery.invalidateQueries({ queryKey: ['categories', 'all'] });
      toast.success('Deleted successfully');
    },
    onError: (error, _, context) => {
      if (context?.toastID) {
        toast.dismiss(context.toastID);
      }
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || error.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  let errorMessage = 'An error occurred';
  if (error || !data) {
    if (isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message || error.message || errorMessage;
    }

    return (
      <div className="relative flex h-screen items-center justify-center py-4">
        <div>
          <ErrorAlert message={errorMessage} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Helmet>
        <title>Categories - Gyanmitra</title>
      </Helmet>
      <CreateCategory />
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>
            See categories which are used to categorize the article.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {data.data.map((category) => (
              <DropDownMenuCat
                key={category._id}
                category={category}
                subcategories={category.subcategories}
                deleteMutation={deleteMutation}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
