import React, { useRef } from 'react';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ARTICLE_CONTENT_TYPES } from '@/constants/index.constants';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { IApiResponse } from '@/api/client.api';
import { toast } from 'sonner';
import { SelectMediaFile } from './SelectMediaFile.components';
import { CategoryCombobox } from './CategoryCombobox.components';

export const FormSchema = z.object({
  headline: z.string().min(1, 'Headline is required'),
  slug: z
    .string()
    .regex(
      /^[a-zA-Z0-9\s]+$/,
      'Slug can only contain English letters, numbers, and spaces'
    )
    .optional(),
  description: z.string().min(1, 'Description is required'),
  contentType: z.enum([
    ARTICLE_CONTENT_TYPES.News,
    ARTICLE_CONTENT_TYPES.Article,
  ]),
  tags: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  featuredMediaId: z.string().min(1, 'Featured File is required'),
  scheduledPublishDate: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

export const CreateDraftArticle: React.FC = () => {
  const sheetCloseRef = useRef<HTMLButtonElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      headline: '',
      slug: '',
      description: '',
      contentType: ARTICLE_CONTENT_TYPES.News,
      tags: '',
      categoryId: '',
      featuredMediaId: '',
      scheduledPublishDate: '',
    },
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return await axios.post<IApiResponse<any>>(`/api/articles/`, {
        ...data,
        tags: data.tags?.split(',').filter((v) => v.trim()),
      });
    },
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['articles', 'drafts'] });
      if (sheetCloseRef.current) {
        sheetCloseRef.current.click();
      }
      toast.success('Draft saved successfully!');
    },
    onError: (error) => {
      const errorMessage = isAxiosError(error)
        ? error.response?.data?.message || 'An error occurred'
        : 'Unknown error occurred';
      toast.error(errorMessage);
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    mutation.mutate(data);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>Create Draft</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>New Draft</SheetTitle>
          <SheetDescription>
            Draft articles are visible only to the author and are not yet
            published.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Headline</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Enter a compelling headline for your article"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a strong and attention-grabbing headline for your
                    draft article.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a unique slug (e.g., my-article-title)"
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value.replace(
                          /[^a-zA-Z0-9\s]/g,
                          ''
                        );
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    The slug is used in the article URL. It can only contain
                    English letters, numbers, spaces.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="resize-none"
                      placeholder="Provide a brief summary or introduction to your article"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Include a concise description to give readers an idea of the
                    content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem
                            value={ARTICLE_CONTENT_TYPES.Article}
                          />
                        </FormControl>
                        <FormLabel>Article</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={ARTICLE_CONTENT_TYPES.News} />
                        </FormControl>
                        <FormLabel>News</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <CategoryCombobox
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormDescription>
                    Select the most relevant category for your article.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featuredMediaId"
              render={() => (
                <FormItem>
                  <FormLabel className="mr-2">Featured File</FormLabel>
                  <FormControl>
                    <SelectMediaFile
                      value={{ id: form.getValues('featuredMediaId') }}
                      onChange={(file) => {
                        if (file) form.setValue('featuredMediaId', file.id);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Choose an image or video to be displayed as the cover for
                    your article.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="scheduledPublishDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled Publish Date & Time (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Schedule when this article should be published. Leave empty to publish immediately upon approval.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter relevant tags separated by commas (e.g., news, technology)"
                      type="text"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to help categorize and improve discoverability of
                    your article (optional).
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
      </SheetContent>
    </Sheet>
  );
};
