'use client';

import { IApiEditArticle, IApiResponse } from '@/api/client.api';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import MdxEditorComponent from '@/components/MdxEditor.components';
import { Spinner } from '@/components/Spinner.components';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { faArrowLeft, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { faEye, faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SelectMediaFile } from '@/components/SelectMediaFile.components';
import { CategoryCombobox } from '@/components/CategoryCombobox.components';
import { CoAuthorSelect } from '@/components/CoAuthorSelect.components';
import { generateSlug, resolveUniqueSlug } from '@/utils/slug.utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';

const formatDateForInput = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const pad = (num: number) => String(num).padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const EditArticle: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [searchParams] = useSearchParams();
  const mode: 'View' | 'Edit' =
    (searchParams.get('mode') as 'View' | 'Edit') || 'Edit';

  const clientQuery = useQueryClient();

  const { data, isLoading, error } = useQuery<IApiResponse<IApiEditArticle>>({
    queryKey: ['articles', 'draft', articleId],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiEditArticle>>(
        `/api/articles/draft/` + articleId
      );
      return response.data;
    },
  });

  const [formData, setFormData] = useState({
    headline: '',
    content: 'Start Writing',
    tags: '',
    slug: '',
    description: '',
    featuredMediaId: '',
    featuredMediaCaption: '',
    categoryId: '',
    coAuthorIds: [] as string[],
    // --- SEO Fields ---
    metaTitle: '',
    focusKeyword: '',
    canonicalUrl: '',
    robotsTag: 'INDEX, FOLLOW',
    author: 'Invitations',
    scheduledPublishDate: '',
  });
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // SEO Score Logic
  const getSeoIssues = () => {
    const issues = [];
    if (formData.metaTitle.length < 30 || formData.metaTitle.length > 65) issues.push("Title length (30-65 chars)");
    if (formData.description.length < 120 || formData.description.length > 160) issues.push("Description length (120-160 chars)");
    if (!formData.focusKeyword) issues.push("Focus keyword missing");
    if (formData.focusKeyword && !formData.slug.includes(formData.focusKeyword.toLowerCase().replace(/\s+/g, '-'))) issues.push("Keyword not in Slug");
    return issues;
  };

  const seoIssues = getSeoIssues();

  const saveMutation = useMutation({
    mutationFn: async (updatedArticle: typeof formData) => {
      const baseSlug = generateSlug(updatedArticle.slug);
      const uniqueSlug = await resolveUniqueSlug(baseSlug, articleId);

      const response = await axios.put<IApiResponse<IApiEditArticle>>(
        `/api/articles/${articleId}/edit`,
        {
          ...updatedArticle,
          slug: uniqueSlug,
          tags: updatedArticle.tags.split(',').filter((v) => v.trim()),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Successfully saved article with SEO settings.');
      clientQuery.invalidateQueries({
        queryKey: ['articles', 'draft', articleId],
      });
    },
    onError: (error: unknown) => {
      let errorMessage = 'Failed to save the article';
      if (isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      }
      toast.error(errorMessage);
    },
  });

  const handleSave = () => {
    if (
      !formData.headline.trim() ||
      !formData.content.trim() ||
      !formData.description.trim() ||
      !formData.slug.trim() ||
      !formData.categoryId.trim()
    ) {
      toast.warning('Required fields cannot be empty!');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHeadlineChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      headline: value,
      slug: isSlugEdited ? prev.slug : generateSlug(value),
    }));
  };

  const handleSlugChange = (value: string) => {
    setIsSlugEdited(true);
    handleInputChange('slug', value);
  };

  useEffect(() => {
    if (data?.data) {
      setIsSlugEdited(!!data.data.slug);
      setFormData({
        headline: data.data.headline,
        content: data.data.content,
        tags: data.data.tags?.join(',') || '',
        slug: data.data.slug || '',
        description: data.data.description || '',
        featuredMediaId: data.data.featuredMedia,
        featuredMediaCaption: data.data.featuredMediaCaption || '',
        categoryId: data.data.categoryId,
        coAuthorIds: data.data.coAuthorIds || [],
        // Map from API if exists, else defaults
        metaTitle: (data.data as any).metaTitle || data.data.headline,
        focusKeyword: (data.data as any).focusKeyword || '',
        canonicalUrl: (data.data as any).canonicalUrl || '',
        robotsTag: (data.data as any).robotsTag || 'INDEX, FOLLOW',
        author: (data.data as any).author || 'Invitations',
        scheduledPublishDate: formatDateForInput(data.data.scheduledPublishDate),
      });
    }
  }, [data]);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  if (error || !data) return <div className="flex h-screen items-center justify-center"><ErrorAlert message="Error loading article" /></div>;

  const renderSidebarContent = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h5 className="font-bold text-sm text-blue-600 uppercase tracking-wider">SEO Optimizer</h5>
        
        <div>
          <Label className="text-xs">Focus Keyword</Label>
          <Input
            value={formData.focusKeyword}
            onChange={(e) => handleInputChange('focusKeyword', e.target.value)}
            placeholder="e.g., UP Election 2024"
            className="bg-white mt-1 text-xs"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Meta Title</Label>
            <span className={`text-[10px] ${formData.metaTitle.length > 65 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
              {formData.metaTitle.length}/65
            </span>
          </div>
          <Input
            value={formData.metaTitle}
            onChange={(e) => handleInputChange('metaTitle', e.target.value)}
            placeholder="e.g., UP Election 2024: Complete Details and News"
            className="bg-white text-xs"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <Label className="text-xs">Meta Description</Label>
            <span className={`text-[10px] ${formData.description.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
              {formData.description.length}/160
            </span>
          </div>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="e.g., Get the latest updates and detailed analysis..."
            className="bg-white min-h-[100px] resize-none text-xs"
          />
        </div>

        <div>
          <Label className="text-xs">URL Slug</Label>
          <Input
            value={formData.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="e.g., up-election-2024-news"
            className="bg-white font-mono text-xs mt-1"
          />
        </div>
      </div>

      <div className="p-3 rounded-lg bg-white border border-slate-200">
        <h6 className="text-[10px] font-bold text-slate-500 mb-2">SEO CHECKLIST</h6>
        <ul className="space-y-2">
          {seoIssues.length === 0 ? (
            <li className="text-[11px] text-green-600 flex items-center gap-2">
              <FontAwesomeIcon icon={faCheckCircle} /> Content is 100% SEO Optimized
            </li>
          ) : (
            seoIssues.map((issue, idx) => (
              <li key={idx} className="text-[11px] text-amber-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faExclamationCircle} /> {issue}
              </li>
            ))
          )}
        </ul>
      </div>

      <hr />

      <div className="space-y-4">
        <h5 className="font-bold text-sm text-slate-600 uppercase tracking-wider">Advanced Settings</h5>
        
        <div>
          <Label className="text-xs">Scheduled Publish Date & Time (Optional)</Label>
          <Input 
            type="datetime-local" 
            value={formData.scheduledPublishDate} 
            onChange={(e) => handleInputChange('scheduledPublishDate', e.target.value)} 
            className="bg-white text-xs mt-1" 
          />
        </div>

        <div>
          <Label className="text-xs mb-1 block">Co-Authors / Contributors (Optional)</Label>
          <CoAuthorSelect
            selectedCoAuthorIds={formData.coAuthorIds}
            onChange={(selectedIds) => setFormData((prev) => ({ ...prev, coAuthorIds: selectedIds }))}
          />
        </div>

        <div>
          <Label className="text-xs">Canonical URL</Label>
          <Input
            value={formData.canonicalUrl}
            onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
            placeholder="e.g., https://gyanmitranews.com/news/slug"
            className="bg-white text-xs mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Robots Tag</Label>
          <select 
            className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-xs mt-1"
            value={formData.robotsTag}
            onChange={(e) => handleInputChange('robotsTag', e.target.value)}
          >
            <option value="INDEX, FOLLOW">INDEX, FOLLOW</option>
            <option value="NOINDEX, NOFOLLOW">NOINDEX, NOFOLLOW</option>
          </select>
        </div>

        <div>
          <Label className="text-xs">Tags (Comma separated)</Label>
          <Textarea
            value={formData.tags}
            onChange={(e) => handleInputChange('tags', e.target.value)}
            placeholder="news, education, updates"
            className="bg-white text-xs min-h-[60px] mt-1"
          />
        </div>

        <div>
          <Label className="text-xs">Category</Label>
          <div className="mt-1">
            <CategoryCombobox value={formData.categoryId} onChange={(val) => handleInputChange('categoryId', val)} />
          </div>
        </div>

        <div>
          <Label className="text-xs">Featured Image</Label>
          <div className="mt-1">
            <SelectMediaFile value={{ id: formData.featuredMediaId }} onChange={(val) => val && handleInputChange('featuredMediaId', val.id)} />
          </div>
        </div>

        <div>
          <Label className="text-xs">Image Caption</Label>
          <Input
            value={formData.featuredMediaCaption}
            onChange={(e) => handleInputChange('featuredMediaCaption', e.target.value)}
            placeholder="Add a short line about the image"
            className="bg-white text-xs mt-1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full flex-col">
      <Helmet>
        <title>{formData.metaTitle || 'Edit Article'}</title>
        <meta name="description" content={formData.description} />
        <meta name="robots" content={formData.robotsTag} />
        {formData.canonicalUrl && <link rel="canonical" href={formData.canonicalUrl} />}
      </Helmet>

      <header className="flex items-center justify-between border-b px-3 sm:px-4 py-2 bg-white sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => window.history.back()} title="Back">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
            <AvatarImage src={'/assets/gyanmitra.webp'} />
            <AvatarFallback>GM</AvatarFallback>
          </Avatar>
          <h1 className="font-bold text-base sm:text-lg hidden sm:block text-slate-700 truncate">Editor</h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className={`text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${seoIssues.length === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
             SEO: {seoIssues.length === 0 ? '100%' : `${Math.max(0, 100 - (seoIssues.length * 20))}%`}
          </div>

          {/* Responsive Sidebar Sheet for screens below lg */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden gap-1.5 h-9 px-2.5 text-xs font-semibold">
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#e98571]" />
                <span>Settings</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full">
              <SheetHeader className="p-4 border-b bg-white shrink-0 text-left">
                <SheetTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
                  <SlidersHorizontal className="h-4 w-4 text-[#e98571]" />
                  Article Settings &amp; SEO
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
                {renderSidebarContent()}
              </div>
            </SheetContent>
          </Sheet>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending || mode === 'View'}
            className="h-9 px-3.5 text-xs sm:text-sm font-bold bg-[#e98571] hover:bg-[#d87460] text-white"
          >
            <FontAwesomeIcon icon={mode === 'View' ? faEye : faFloppyDisk} className="mr-1.5" />
            {mode === 'View' ? 'View' : saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </header>

      <section className="flex flex-1 flex-col lg:flex-row h-[calc(100vh-57px)] overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto p-4 sm:p-6 min-w-0 bg-[#fcfcfc]">
          <div className="space-y-1.5">
            <Label htmlFor="headline" className="text-muted-foreground text-xs uppercase tracking-wider font-bold">
              Article Headline
            </Label>
            <Input
              id="headline"
              className="text-xl sm:text-2xl font-bold h-auto py-2 border-none shadow-none focus-visible:ring-0 px-0 bg-transparent placeholder:text-zinc-300"
              value={formData.headline}
              onChange={(e) => handleHeadlineChange(e.target.value)}
              placeholder="Enter article headline..."
            />
          </div>

          <div className="flex-1 min-h-[400px] sm:min-h-[500px] rounded-md border bg-white shadow-2xs overflow-hidden">
            <MdxEditorComponent
              initialContent={data.data.content}
              onChange={(newContent) => handleInputChange('content', newContent)}
            />
          </div>
        </div>

        {/* Desktop Sidebar (lg and above) */}
        <aside className="hidden lg:flex w-80 xl:w-96 flex-col border-l bg-slate-50/50 shadow-inner overflow-y-auto shrink-0">
          <div className="p-5">
            {renderSidebarContent()}
          </div>
        </aside>
      </section>
    </div>
  );
};