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
import {
  SlidersHorizontal,
  UploadCloud,
  Clock,
  FileText,
  Sparkles,
  Trash2,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACCEPTED_FILE_TYPES } from '@/constants/index.constants';

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

  // --- REAL-TIME AUTOSAVE & DRAFTING STATE ---
  type DraftStatus = 'saved_cloud' | 'saving' | 'saved_local';
  const [draftStatus, setDraftStatus] = useState<DraftStatus>('saved_cloud');
  const [lastCloudSaveTime, setLastCloudSaveTime] = useState<string | null>(null);
  const [lastLocalSaveTime, setLastLocalSaveTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRestoredFromSession, setIsRestoredFromSession] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const isInitialized = React.useRef(false);

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

  // --- LIVE STORY METRICS ---
  const storyMetrics = React.useMemo(() => {
    const rawContent = formData.content || '';
    const rawHeadline = formData.headline || '';
    // Strip markdown formatting tokens and HTML tags for accurate word/char counting
    const cleanContent = rawContent
      .replace(/<[^>]*>/g, ' ')
      .replace(/[#*`_~\[\]()!>+-]/g, ' ')
      .trim();

    const fullText = `${rawHeadline} ${cleanContent}`.trim();
    const wordList = fullText ? fullText.split(/\s+/).filter(Boolean) : [];
    const wordCount = wordList.length;
    const charCount = fullText.length;
    // Hindi Devanagari character count (range: \u0900-\u097F)
    const devanagariCount = (fullText.match(/[\u0900-\u097F]/g) || []).length;
    // Estimated reading speed: ~180 words/min
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
    // SEO Score calculation (0-100)
    const seoScore = Math.max(0, 100 - (seoIssues.length * 20));

    return {
      wordCount,
      charCount,
      devanagariCount,
      readingTimeMinutes,
      seoScore,
    };
  }, [formData.content, formData.headline, seoIssues]);

  // --- FEATURED MEDIA DRAG & DROP AND ASPECT RATIO PREVIEW STATE ---
  type AspectRatioMode = '16:9' | '1:1' | '4:5';
  const [previewRatio, setPreviewRatio] = useState<AspectRatioMode>('16:9');
  const [featuredMediaUrl, setFeaturedMediaUrl] = useState<string | null>(null);
  const [featuredMediaName, setFeaturedMediaName] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [isDraggingMedia, setIsDraggingMedia] = useState(false);
  const mediaFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Fetch media URL for initial/existing featuredMediaId
  useEffect(() => {
    if (formData.featuredMediaId && !featuredMediaUrl) {
      axios
        .get<IApiResponse<{ _id: string; name: string; fileUrl: string }>>(
          `/api/media/${formData.featuredMediaId}`
        )
        .then((res) => {
          if (res.data?.data?.fileUrl) {
            setFeaturedMediaUrl(res.data.data.fileUrl);
            setFeaturedMediaName(res.data.data.name);
          }
        })
        .catch(() => {
          // ignore error
        });
    }
  }, [formData.featuredMediaId, featuredMediaUrl]);

  const handleMediaUploadFile = async (file: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Please upload a PNG, JPEG, or WebP image.');
      return;
    }
    const cleanFileName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    setIsUploadingMedia(true);
    const localPreview = URL.createObjectURL(file);
    setFeaturedMediaUrl(localPreview);
    setFeaturedMediaName(cleanFileName);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('name', cleanFileName || 'Featured Image');

      const res = await axios.post('/api/media/', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data?._id) {
        handleInputChange('featuredMediaId', res.data.data._id);
        if (res.data.data.fileUrl) {
          setFeaturedMediaUrl(res.data.data.fileUrl);
        }
        setFeaturedMediaName(res.data.data.name || cleanFileName);
        toast.success('Featured image uploaded & selected!');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to upload image');
      setFeaturedMediaUrl(null);
      setFeaturedMediaName(null);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleDragOverMedia = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(true);
  };

  const handleDragLeaveMedia = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(false);
  };

  const handleDropMedia = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMedia(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleMediaUploadFile(droppedFile);
    }
  };

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
      setHasUnsavedChanges(false);
      setDraftStatus('saved_cloud');
      setIsRestoredFromSession(false);
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      setLastCloudSaveTime(nowStr);
      try {
        if (articleId) {
          sessionStorage.removeItem(`gyanmitra_draft_${articleId}`);
        }
      } catch {
        // Ignore
      }
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

  // Discard local session draft and revert to original server content
  const handleDiscardLocalDraft = () => {
    if (!data?.data || !articleId) return;
    try {
      sessionStorage.removeItem(`gyanmitra_draft_${articleId}`);
    } catch {
      // Ignore
    }
    const serverData = {
      headline: data.data.headline,
      content: data.data.content,
      tags: data.data.tags?.join(',') || '',
      slug: data.data.slug || '',
      description: data.data.description || '',
      featuredMediaId: data.data.featuredMedia,
      featuredMediaCaption: data.data.featuredMediaCaption || '',
      categoryId: data.data.categoryId,
      coAuthorIds: data.data.coAuthorIds || [],
      metaTitle: (data.data as any).metaTitle || data.data.headline,
      focusKeyword: (data.data as any).focusKeyword || '',
      canonicalUrl: (data.data as any).canonicalUrl || '',
      robotsTag: (data.data as any).robotsTag || 'INDEX, FOLLOW',
      author: (data.data as any).author || 'Invitations',
      scheduledPublishDate: formatDateForInput(data.data.scheduledPublishDate),
    };
    setFormData(serverData);
    setIsRestoredFromSession(false);
    setHasUnsavedChanges(false);
    setDraftStatus('saved_cloud');
    setEditorKey((k) => k + 1);
    toast.success('Local draft discarded. Restored original server content.');
  };

  // Initial load and sessionStorage recovery
  useEffect(() => {
    if (!data?.data || isInitialized.current) return;

    const serverData = {
      headline: data.data.headline,
      content: data.data.content,
      tags: data.data.tags?.join(',') || '',
      slug: data.data.slug || '',
      description: data.data.description || '',
      featuredMediaId: data.data.featuredMedia,
      featuredMediaCaption: data.data.featuredMediaCaption || '',
      categoryId: data.data.categoryId,
      coAuthorIds: data.data.coAuthorIds || [],
      metaTitle: (data.data as any).metaTitle || data.data.headline,
      focusKeyword: (data.data as any).focusKeyword || '',
      canonicalUrl: (data.data as any).canonicalUrl || '',
      robotsTag: (data.data as any).robotsTag || 'INDEX, FOLLOW',
      author: (data.data as any).author || 'Invitations',
      scheduledPublishDate: formatDateForInput(data.data.scheduledPublishDate),
    };

    setIsSlugEdited(!!data.data.slug);

    const initialCloudTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    setLastCloudSaveTime(initialCloudTime);

    // Check for existing sessionStorage draft
    if (articleId && mode !== 'View') {
      try {
        const savedDraftRaw = sessionStorage.getItem(`gyanmitra_draft_${articleId}`);
        if (savedDraftRaw) {
          const savedDraft = JSON.parse(savedDraftRaw);
          const hasEdits =
            savedDraft.headline !== serverData.headline ||
            savedDraft.content !== serverData.content ||
            savedDraft.description !== serverData.description ||
            savedDraft.slug !== serverData.slug;

          if (hasEdits) {
            setFormData(savedDraft);
            setIsRestoredFromSession(true);
            setDraftStatus('saved_local');
            setHasUnsavedChanges(true);
            if (savedDraft.savedAt) {
              const localTime = new Date(savedDraft.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
              setLastLocalSaveTime(localTime);
            }
            isInitialized.current = true;
            setEditorKey((k) => k + 1);
            toast.info('Restored unsaved draft from this session.');
            return;
          }
        }
      } catch {
        // Ignore sessionStorage parse errors
      }
    }

    setFormData(serverData);
    setDraftStatus('saved_cloud');
    isInitialized.current = true;
    setEditorKey((k) => k + 1);
  }, [data, articleId, mode]);

  // Debounced Autosave to sessionStorage (2 seconds)
  useEffect(() => {
    if (!isInitialized.current || mode === 'View' || !articleId) return;

    setDraftStatus('saving');
    setHasUnsavedChanges(true);

    const timer = setTimeout(() => {
      try {
        const snapshot = {
          ...formData,
          savedAt: Date.now(),
        };
        sessionStorage.setItem(`gyanmitra_draft_${articleId}`, JSON.stringify(snapshot));
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        setLastLocalSaveTime(timeStr);
        setDraftStatus('saved_local');
      } catch (err) {
        console.error('Failed to autosave draft to sessionStorage:', err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, articleId, mode]);

  // BeforeUnload guard to prevent accidental tab closing when unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && mode !== 'View') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, mode]);

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

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-700">Featured Media</Label>
            {featuredMediaUrl && (
              <span className="text-[10px] text-zinc-400 font-medium">
                Live Aspect Preview
              </span>
            )}
          </div>

          {featuredMediaUrl ? (
            /* Selected / Uploaded Image with 3-Way Aspect Ratio Preview */
            <div className="space-y-2.5 bg-white border border-zinc-200 rounded-md p-3 shadow-2xs">
              {/* 3-Way Aspect Ratio Toggle */}
              <div className="flex items-center justify-between bg-zinc-100 p-0.5 rounded-md text-[10px] font-bold text-zinc-600">
                <button
                  type="button"
                  onClick={() => setPreviewRatio('16:9')}
                  className={cn(
                    "flex-1 py-1 px-1.5 rounded transition-all text-center",
                    previewRatio === '16:9'
                      ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
                      : "hover:text-zinc-900"
                  )}
                  title="Hero 16:9 — Article Header, Social Shares & Top News"
                >
                  Hero 16:9
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRatio('1:1')}
                  className={cn(
                    "flex-1 py-1 px-1.5 rounded transition-all text-center",
                    previewRatio === '1:1'
                      ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
                      : "hover:text-zinc-900"
                  )}
                  title="Square 1:1 — Trending Widgets, Right Cards & Thumbnails"
                >
                  Square 1:1
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewRatio('4:5')}
                  className={cn(
                    "flex-1 py-1 px-1.5 rounded transition-all text-center",
                    previewRatio === '4:5'
                      ? "bg-white text-zinc-900 shadow-2xs font-extrabold"
                      : "hover:text-zinc-900"
                  )}
                  title="Vertical 4:5 — Mobile Feed Cards & Status Updates"
                >
                  Vertical 4:5
                </button>
              </div>

              {/* Interactive Aspect Ratio Preview Frame */}
              <div className="w-full rounded-md overflow-hidden bg-zinc-950 border border-zinc-200 flex items-center justify-center p-2 min-h-[140px] max-h-60 relative group">
                <div
                  className={cn(
                    "relative overflow-hidden rounded transition-all duration-300 w-full flex items-center justify-center bg-black/40 shadow-inner",
                    previewRatio === '16:9' && "aspect-[16/9] max-h-48",
                    previewRatio === '1:1' && "aspect-square max-w-[170px] max-h-44",
                    previewRatio === '4:5' && "aspect-[4/5] max-w-[150px] max-h-48"
                  )}
                >
                  <img
                    src={featuredMediaUrl}
                    alt={featuredMediaName || 'Featured Preview'}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                  <div className="absolute bottom-1 left-1 bg-black/75 backdrop-blur-xs text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {previewRatio === '16:9' && '16:9 Hero'}
                    {previewRatio === '1:1' && '1:1 Square'}
                    {previewRatio === '4:5' && '4:5 Vertical'}
                  </div>
                </div>

                {isUploadingMedia && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 text-white">
                    <Loader2 className="w-5 h-5 animate-spin text-[#e98571]" />
                    <span className="text-[11px] font-bold">Uploading media...</span>
                  </div>
                )}
              </div>

              {featuredMediaName && (
                <p className="text-[11px] text-zinc-500 truncate font-medium">
                  {featuredMediaName}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-zinc-100">
                <input
                  ref={mediaFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleMediaUploadFile(f);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 h-8 text-[11px] font-semibold"
                  onClick={() => mediaFileInputRef.current?.click()}
                  disabled={isUploadingMedia}
                >
                  <UploadCloud className="w-3 h-3 mr-1 text-[#e98571]" />
                  Replace
                </Button>
                <SelectMediaFile
                  value={{ id: formData.featuredMediaId }}
                  onChange={(val) => {
                    if (val) {
                      handleInputChange('featuredMediaId', val.id);
                      setFeaturedMediaUrl(val.url);
                      setFeaturedMediaName(val.name);
                    } else {
                      handleInputChange('featuredMediaId', '');
                      setFeaturedMediaUrl(null);
                      setFeaturedMediaName(null);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-[11px] text-red-600 hover:text-red-700 hover:bg-red-50 font-bold"
                  onClick={() => {
                    handleInputChange('featuredMediaId', '');
                    setFeaturedMediaUrl(null);
                    setFeaturedMediaName(null);
                  }}
                  title="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            /* Drag and Drop Zone when no image is selected */
            <div className="space-y-2">
              <div
                onDragOver={handleDragOverMedia}
                onDragLeave={handleDragLeaveMedia}
                onDrop={handleDropMedia}
                onClick={() => mediaFileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 bg-white",
                  isDraggingMedia
                    ? "border-[#e98571] bg-[#e98571]/10 scale-[0.99]"
                    : "border-zinc-300 hover:border-[#e98571] hover:bg-zinc-50/80 shadow-2xs"
                )}
              >
                <input
                  ref={mediaFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleMediaUploadFile(f);
                  }}
                />
                <div className="h-9 w-9 rounded-full bg-[#e98571]/10 flex items-center justify-center text-[#e98571]">
                  {isUploadingMedia ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-zinc-800">
                    {isUploadingMedia ? 'Uploading image...' : 'ड्रैग करें या इमेज चुनें'}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    PNG, JPG, WebP (Max 10MB)
                  </p>
                </div>
              </div>

              {/* Or Select from Media Library */}
              <div className="flex items-center justify-center">
                <SelectMediaFile
                  value={{ id: formData.featuredMediaId }}
                  onChange={(val) => {
                    if (val) {
                      handleInputChange('featuredMediaId', val.id);
                      setFeaturedMediaUrl(val.url);
                      setFeaturedMediaName(val.name);
                    }
                  }}
                />
              </div>
            </div>
          )}
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

      <header className="flex items-center justify-between border-b px-3 sm:px-4 py-2 bg-white sticky top-0 z-30 shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => window.history.back()} title="Back">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
            <AvatarImage src={'/assets/gyanmitra.webp'} />
            <AvatarFallback>GM</AvatarFallback>
          </Avatar>
          <h1 className="font-bold text-base sm:text-lg hidden sm:block text-slate-700 truncate">Editor</h1>

          {/* Non-intrusive Draft Status Indicator */}
          <div className="flex items-center ml-1 sm:ml-2 shrink-0">
            {draftStatus === 'saved_cloud' && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs transition-all"
                title={`Saved to cloud at ${lastCloudSaveTime || 'just now'}`}
              >
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden sm:inline">Saved to cloud</span>
                <span className="sm:hidden">Saved</span>
                {lastCloudSaveTime && (
                  <span className="font-mono text-[10px] text-emerald-600/80">({lastCloudSaveTime})</span>
                )}
              </div>
            )}

            {draftStatus === 'saving' && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs transition-all"
                title="Autosaving changes to local session..."
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="hidden sm:inline">Saving draft...</span>
                <span className="sm:hidden">Saving...</span>
              </div>
            )}

            {draftStatus === 'saved_local' && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs transition-all"
                title={`Local draft stored in sessionStorage at ${lastLocalSaveTime || 'just now'}`}
              >
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                <span className="hidden sm:inline">Local draft stored</span>
                <span className="sm:hidden">Draft stored</span>
                {lastLocalSaveTime && (
                  <span className="font-mono text-[10px] text-slate-500">({lastLocalSaveTime})</span>
                )}
              </div>
            )}
          </div>
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
          {/* Recovery banner if restored from sessionStorage */}
          {isRestoredFromSession && (
            <div className="flex items-center justify-between gap-3 bg-amber-50/90 border border-amber-200/80 text-amber-900 px-3.5 py-2.5 rounded-md text-xs font-medium shadow-2xs animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                <span className="truncate">
                  <strong>Unsaved draft recovered:</strong> Restored your latest session edits.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 text-[11px] text-amber-800 hover:text-amber-950 hover:bg-amber-100 font-bold border border-amber-300/60"
                  onClick={handleDiscardLocalDraft}
                >
                  Discard &amp; Use Server Version
                </Button>
                <button
                  type="button"
                  onClick={() => setIsRestoredFromSession(false)}
                  className="text-amber-500 hover:text-amber-700 text-xs px-1 font-bold"
                  aria-label="Dismiss recovery notice"
                  title="Keep recovered draft"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

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

          {/* --- LIVE STORY METRICS PILL BAR --- */}
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 py-2 px-3.5 bg-zinc-50 border border-zinc-200/80 rounded-md text-xs text-zinc-600 shadow-2xs">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
              {/* Word Count */}
              <div className="flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-[#e98571]" />
                <span className="text-zinc-500 font-bold text-[11px]">शब्द:</span>
                <span className="font-bold text-zinc-900 font-mono text-xs">{storyMetrics.wordCount}</span>
              </div>

              <span className="text-zinc-300 hidden sm:inline">•</span>

              {/* Reading Time */}
              <div className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-[#e98571]" />
                <span className="text-zinc-500 font-bold text-[11px]">पढ़ने का समय:</span>
                <span className="font-bold text-zinc-900">~{storyMetrics.readingTimeMinutes} मिनट</span>
              </div>

              <span className="text-zinc-300 hidden sm:inline">•</span>

              {/* Character & Hindi metrics */}
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-zinc-500 font-bold text-[11px]">अक्षर:</span>
                <span className="font-bold text-zinc-900 font-mono text-xs">{storyMetrics.charCount}</span>
                {storyMetrics.devanagariCount > 0 && (
                  <span className="text-[10px] text-zinc-400 font-medium">
                    (हिंदी: {storyMetrics.devanagariCount})
                  </span>
                )}
              </div>
            </div>

            {/* SEO Score Pill */}
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#e98571]" />
              <span className="text-zinc-500 font-bold text-[11px]">SEO स्कोर:</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[11px] font-bold font-mono shadow-2xs",
                storyMetrics.seoScore >= 80 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                storyMetrics.seoScore >= 60 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                "bg-red-50 text-red-700 border border-red-200"
              )}>
                {storyMetrics.seoScore}/100
              </span>
            </div>
          </div>

          <div className="flex-1 min-h-[400px] sm:min-h-[500px] rounded-md border bg-white shadow-xs overflow-hidden">
            <MdxEditorComponent
              key={editorKey}
              initialContent={formData.content}
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