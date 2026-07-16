import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CategoryCombobox } from './CategoryCombobox.components';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { IApiResponse, type IApiAEditCategory } from '@/api/client.api';
import { toast } from 'sonner';
import { Spinner } from './Spinner.components';
import { ErrorAlert } from './ErrorAlert.components';
import { Checkbox } from './ui/checkbox';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must contain at least 2 characters')
    .max(50, 'Name must contain no more than 50 characters'),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  index: z.preprocess((val) => Number(val), z.number()),
});

type FormValues = z.infer<typeof formSchema>;

interface EditCategoryProps {
  open: boolean;
  onClose: () => void;
  categoryId: string;
}

export const EditCategory: React.FC<EditCategoryProps> = ({
  open,
  onClose,
  categoryId,
}) => {
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<IApiResponse<IApiAEditCategory>>({
    queryKey: ['categories', 'edit', categoryId],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiAEditCategory>>(
        `/api/categories/${categoryId}`
      );
      return response.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return await axios.put<IApiResponse<any>>(
        `/api/categories/` + categoryId,
        {
          ...data,
        }
      );
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['categories', 'manage'] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'all'] });
      if (sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
      toast.success('Category edited successfully!');
    },
    onError: (error) => {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (value) => {
    const formData = {
      ...value,
      parentId: value.parentId === '' ? undefined : value.parentId,
      index: Number(value.index),
    };

    mutation.mutate(formData);
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      parentId: '',
      isActive: false,
      index: 0,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.data.name,
        parentId: data.data.parentId || '',
        isActive: data.data.isActive || false,
        index: data.data.index,
      });
    }
  }, [data]);

  let content;

  if (isLoading) {
    content = (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  } else if (error || !data) {
    const errorMessage = isAxiosError(error)
      ? error.response?.data?.message || error.message || 'An error occurred'
      : 'An error occurred';

    content = (
      <div className="relative flex h-screen items-center justify-center py-4">
        <ErrorAlert message={errorMessage} />
      </div>
    );
  } else {
    content = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter the category name" {...field} />
                </FormControl>
                <FormDescription>
                  Provide a unique and descriptive title for this category.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Category</FormLabel>
                <CategoryCombobox
                  value={field.value}
                  onChange={field.onChange}
                />
                <FormDescription>
                  Specify the parent category if this is a subcategory. Leave
                  blank if it’s a main category.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="isActive"
            control={form.control}
            render={({ field }) => (
              <FormItem className="">
                <div className="flex items-start space-x-3 space-y-0">
                  <FormLabel>Show in Navigation:</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </div>
                <FormDescription>
                  Check this box to show this category in the navigation bar.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="index"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Index</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter the index value"
                    type="number"
                    min={1}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Set the order in which this category appears in the list.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <SheetFooter className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Draft'}
            </Button>
            <SheetClose asChild>
              <Button variant="outline" ref={sheetCloseRef}>
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </Form>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Category</SheetTitle>
          <SheetDescription>
            Create a new category to manage your large number of articles in an
            organized way.
          </SheetDescription>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  );
};
