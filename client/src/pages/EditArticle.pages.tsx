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
    categoryId: '',
    // --- SEO Fields ---
    metaTitle: '',
    focusKeyword: '',
    canonicalUrl: '',
    robotsTag: 'INDEX, FOLLOW',
    author: 'Invitations',
    scheduledPublishDate: '',
  });

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
      const response = await axios.put<IApiResponse<IApiEditArticle>>(
        `/api/articles/${articleId}/edit`,
        {
          ...updatedArticle,
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

  useEffect(() => {
    if (data?.data) {
      setFormData({
        headline: data.data.headline,
        content: data.data.content,
        tags: data.data.tags?.join(',') || '',
        slug: data.data.slug || '',
        description: data.data.description || '',
        featuredMediaId: data.data.featuredMedia,
        categoryId: data.data.categoryId,
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

  return (
    <div className="flex h-screen w-full flex-col">
      <Helmet>
        <title>{formData.metaTitle || 'Edit Article'}</title>
        <meta name="description" content={formData.description} />
        <meta name="robots" content={formData.robotsTag} />
        {formData.canonicalUrl && <link rel="canonical" href={formData.canonicalUrl} />}
      </Helmet>

      <header className="flex items-center justify-between border-b px-4 py-2 bg-white">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={'/assets/gyanmitra.png'} />
            <AvatarFallback>GM</AvatarFallback>
          </Avatar>
          <h1 className="font-bold text-lg hidden md:block text-slate-700">Editor</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-xs font-bold px-2 py-1 rounded-full ${seoIssues.length === 0 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
             SEO Score: {seoIssues.length === 0 ? '100%' : `${Math.max(0, 100 - (seoIssues.length * 20))}%`}
          </div>
          <Button onClick={handleSave} disabled={saveMutation.isPending || mode === 'View'}>
            <FontAwesomeIcon icon={mode === 'View' ? faEye : faFloppyDisk} className="mr-2" />
            {mode === 'View' ? 'View Only' : saveMutation.isPending ? 'Saving...' : 'Save Article'}
          </Button>
        </div>
      </header>

      <section className="flex h-full flex-row gap-0 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex h-full flex-[3] flex-col gap-4 overflow-auto p-6">
          <div className="space-y-2">
            <Label htmlFor="headline" className="text-muted-foreground">Article Headline</Label>
            <Input
              id="headline"
              className="text-2xl font-bold h-14 border-none shadow-none focus-visible:ring-0 px-0"
              value={formData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              placeholder="Enter a catchy headline..."
            />
          </div>

          <div className="flex-1 min-h-[500px] rounded-md border bg-white">
            <MdxEditorComponent
              initialContent={data.data.content}
              onChange={(newContent) => handleInputChange('content', newContent)}
            />
          </div>
        </div>

        {/* SEO & Settings Sidebar */}
        <div className="flex h-full flex-[1] flex-col gap-6 overflow-auto border-l bg-slate-50/50 p-5 shadow-inner">
          
          <div className="space-y-4">
             <h5 className="font-bold text-sm text-blue-600 uppercase tracking-wider">SEO Optimizer</h5>
             
             <div>
                <Label className="text-xs">Focus Keyword</Label>
                <Input value={formData.focusKeyword} onChange={(e) => handleInputChange('focusKeyword', e.target.value)} placeholder="e.g., UP Election 2024" className="bg-white" />
             </div>

             <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs">Meta Title</Label>
                  <span className={`text-[10px] ${formData.metaTitle.length > 65 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{formData.metaTitle.length}/65</span>
                </div>
                <Input value={formData.metaTitle} onChange={(e) => handleInputChange('metaTitle', e.target.value)} placeholder="e.g., UP Election 2024: Complete Details and News" className="bg-white" />
             </div>

             <div>
                <div className="flex justify-between items-center mb-1">
                  <Label className="text-xs">Meta Description</Label>
                  <span className={`text-[10px] ${formData.description.length > 160 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{formData.description.length}/160</span>
                </div>
                <Textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder="e.g., Get the latest updates and detailed analysis of the upcoming UP Election 2024. Read more to find out..." className="bg-white min-h-[100px] resize-none" />
             </div>

             <div>
                <Label className="text-xs">URL Slug</Label>
                <Input value={formData.slug} onChange={(e) => handleInputChange('slug', e.target.value)} placeholder="e.g., up-election-2024-news" className="bg-white font-mono text-xs" />
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
                className="bg-white text-xs" 
              />
            </div>

            <div>
              <Label className="text-xs">Canonical URL</Label>
              <Input value={formData.canonicalUrl} onChange={(e) => handleInputChange('canonicalUrl', e.target.value)} placeholder="e.g., https://gyanmitra.com/news/up-election-2024-news" className="bg-white text-xs" />
            </div>

            <div>
              <Label className="text-xs">Robots Tag</Label>
              <select 
                className="w-full h-9 rounded-md border border-input bg-white px-3 py-1 text-xs"
                value={formData.robotsTag}
                onChange={(e) => handleInputChange('robotsTag', e.target.value)}
              >
                <option value="INDEX, FOLLOW">INDEX, FOLLOW</option>
                <option value="NOINDEX, NOFOLLOW">NOINDEX, NOFOLLOW</option>
              </select>
            </div>

            <div>
              <Label className="text-xs">Tags (Comma separated)</Label>
              <Textarea value={formData.tags} onChange={(e) => handleInputChange('tags', e.target.value)} placeholder="wedding, templates, free" className="bg-white text-xs min-h-[60px]" />
            </div>

            <div>
              <Label className="text-xs">Category</Label>
              <CategoryCombobox value={formData.categoryId} onChange={(val) => handleInputChange('categoryId', val)} />
            </div>

            <div>
              <Label className="text-xs">Featured Image</Label>
              <SelectMediaFile value={{ id: formData.featuredMediaId }} onChange={(val) => val && handleInputChange('featuredMediaId', val.id)} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};