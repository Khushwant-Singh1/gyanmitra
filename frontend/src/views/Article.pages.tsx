'use client';

import { useEffect, useState } from 'react';
import { IApiArticle, IApiHome, IApiResponse } from '@/api/client.api';
import { isApiResponse } from '@/utils/handleApiError.utils';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Spinner } from '@/components/Spinner.components';
import axios, { isAxiosError } from 'axios';
import React from 'react';
import { cn } from '@/lib/utils';
import '@/index.css';
import LeftCard from '@/components/LeftCard.components';
import { DateDisplay } from '@/components/DateDisplay.components';
import TimeAgo from '@/components/TimeAgo.components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShareNodes,
  faZap,
  faLink,
  faCheck,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  faWhatsapp,
  faXTwitter,
  faFacebookF,
  faTelegram,
  faLinkedinIn,
} from '@fortawesome/free-brands-svg-icons';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { FeaturedMedia } from '@/components/FeaturedMedia.components';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { MDToHTMLConverter } from '@/utils/MDToHTML.utils';
import { ArticleCommentsSection } from '@/components/ArticleComments.components';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Feather,
  Users,
  Clock,
  BookOpen,
  Edit3,
  Globe,
  Eye,
  Loader2,
} from 'lucide-react';

const getInitials = (name?: string, firstName?: string, lastName?: string) => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  return 'GM';
};

const getEstimatedReadTime = (content?: string | null) => {
  if (!content) return '2 min read';
  const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = text ? text.split(' ').length : 0;
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} min read`;
};

interface ArticleProps {
  initialArticle?: IApiArticle | null;
  initialContentHtml?: string | null;
  slug?: string;
}

export const Article: React.FC<ArticleProps> = ({
  initialArticle,
  initialContentHtml,
  slug: propSlug,
}) => {
  const params = useParams<{ articleSlug: string }>();
  const articleSlug = propSlug || params?.articleSlug;
  const [content, setContent] = useState<string | null>(initialContentHtml || null);

  // Main Article Data Fetch
  const { data, isLoading, error } = useQuery<IApiResponse<IApiArticle>>({
    queryKey: ['articles', 'page', articleSlug],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiArticle>>(
        `/api/articles/page/${articleSlug}`
      );
      return response.data;
    },
    initialData: initialArticle
      ? { success: true, statusCode: 200, data: initialArticle }
      : undefined,
    staleTime: 1000 * 60 * 60,
  });

  // Home Data Fetch for Marquee
  const { data: homeData } = useQuery<IApiResponse<IApiHome>>({
    queryKey: ['home'],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiHome>>('/api/users/home');
      return response.data;
    },
  });

  const todayNews = homeData?.data?.todayPublished || [];
  const recentNews = homeData?.data?.articlePublished || homeData?.data?.mixedArticles || [];
  const marqueeData = todayNews.length > 0 ? todayNews : recentNews;

  useEffect(() => {
    const processContent = async () => {
      if (data && isApiResponse(data)) {
        try {
          const htmlContent = await MDToHTMLConverter(
            data.data.articleDetails.contentData
          );
          setContent(htmlContent);
        } catch (err) {
          console.error('Markdown processing error:', err);
        }
      }
    };
    processContent();
  }, [data]);

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;

  if (error || !data) {
    const errorMessage = isAxiosError(error) ? error.response?.data?.message || error.message : 'An error occurred';
    return <div className="flex h-screen items-center justify-center py-4"><ErrorAlert message={errorMessage} /></div>;
  }

  const article = data.data.articleDetails;

  // SEO Fallbacks
  const seoTitle = article.metaTitle || `${article.headline} - Gyanmitra`;
  const seoDescription = article.description || "Read the latest news and articles on Gyanmitra.";
  const canonicalUrl =
    article.canonicalUrl && article.canonicalUrl.startsWith('http')
      ? article.canonicalUrl
      : `https://gyanmitranews.com/articles/${encodeURIComponent(article.slug)}`;
  const robotsSetting = article.robotsTag || "INDEX, FOLLOW";
  const shareUrl = typeof window !== 'undefined' ? window.location.href : canonicalUrl;
  const shareText = `${article.headline}\n\n${shareUrl}`;

  const sharePreviewImage = (() => {
    const raw =
      article.featuredMediaInfo?.fileType === 'video'
        ? article.featuredMediaInfo?.thumbnail || article.featuredMediaInfo?.url
        : article.featuredMediaInfo?.url;
    if (!raw) return '/assets/s.png';
    const normalized = raw.replace(/\\/g, '/').trim();
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      return normalized;
    }
    const uploadsMatch = normalized.match(/(?:^|\/)uploads\/(.+)$/i);
    if (uploadsMatch) {
      return `/uploads/${uploadsMatch[1]}`;
    }
    return normalized.startsWith('/') ? normalized : `/${normalized}`;
  })();

  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('Link Copied to Clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link. Please copy URL manually.');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) {
      handleCopyLink();
      return;
    }

    setIsSharing(true);
    try {
      let fileToShare: File | null = null;
      if (sharePreviewImage && typeof fetch !== 'undefined') {
        try {
          const res = await fetch(sharePreviewImage, { mode: 'cors' });
          if (res.ok) {
            const blob = await res.blob();
            const mime = blob.type || 'image/jpeg';
            const ext = mime.split('/')[1] || 'jpg';
            const file = new File([blob], `gyanmitra-news.${ext}`, { type: mime });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              fileToShare = file;
            }
          }
        } catch {
          // Ignore image fetch failure and proceed with standard share
        }
      }

      if (fileToShare) {
        await navigator.share({
          title: article.headline,
          text: `${article.headline}\n\n${shareUrl}`,
          url: shareUrl,
          files: [fileToShare],
        });
      } else {
        await navigator.share({
          title: article.headline,
          text: `${article.headline}\n\n${shareUrl}`,
          url: shareUrl,
        });
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        handleCopyLink();
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <main className="max-w-[1350px] mx-auto px-4 sm:px-6">
      <Helmet>
        {/* --- DYNAMIC SEO META TAGS --- */}
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content={robotsSetting} />
        
        {/* Open Graph (Social Sharing) */}
        <meta property="og:site_name" content="Gyanmitra" />
        <meta property="og:locale" content="hi_IN" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={article.featuredMediaInfo.url} />
        <meta property="og:image:secure_url" content={article.featuredMediaInfo.url} />
        <meta property="og:image:alt" content={article.headline} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="author" content={article?.authorName || "Gyanmitra News"} />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={article.featuredMediaInfo.url} />
        <meta name="publisher" content="Gyanmitra News" />

        {/* Keywords */}
        <meta name="keywords" content={Array.isArray(article.tags) ? article.tags.join(', ') : ''} />
      </Helmet>

      {/* --- DYNAMIC BREAKING BAR --- */}
      <div className="bg-[#e98571] text-white py-2 rounded-sm shadow-sm overflow-hidden my-4 relative">
        <div className="flex items-center">
          <div className="flex items-center gap-1 bg-black/10 px-4 py-1 shrink-0 z-10 border-r border-white/20">
            <FontAwesomeIcon icon={faZap} className="h-3 w-3 text-white animate-pulse" />
            <span className="font-black uppercase  text-[10px] tracking-widest">Breaking</span>
          </div>
          <div className="flex-1 overflow-hidden relative">
            <motion.div
              className="flex whitespace-nowrap gap-12"
              animate={{ x: ["100%", "-100%"] }}
              transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            >
              {marqueeData.length > 0 ? (
                marqueeData.map((news, idx) => (
                  <Link 
                    key={idx} 
                    to={`/articles/${news.slug}`} 
                    className="text-[11px] font-bold uppercase tracking-tight hover:text-black transition-colors"
                  >
                    <span className="opacity-50 mr-2">•</span>
                    {news.headline}
                  </Link>
                ))
              ) : (
                <span className="text-[11px] font-bold uppercase ">
                  Gyanmitra News: ताज़ा खबरों के लिए बने रहें...
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* --- MAIN CONTENT AREA --- */}
        <article className="lg:col-span-8 space-y-6 pt-4">
          <div className="space-y-4">
            <Badge className="bg-[#e98571] text-white rounded-none uppercase text-[9px] font-black tracking-[0.2em] px-3 py-1 border-none">
              {article.categoryName || 'News'}
            </Badge>
            
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug text-slate-900">
              {article.headline}
            </h1>
            
            {/* --- ARTICLE BYLINE & METADATA BAR --- */}
            <div className="flex flex-wrap items-center justify-between border-y border-zinc-200 py-3.5 gap-4">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* --- WRITTEN BY (REPORTER / PRIMARY AUTHOR / CO-AUTHORS) --- */}
                {article.editorInfo ? (
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9 border border-zinc-200 shadow-xs ring-1 ring-black/5 shrink-0">
                      <AvatarImage
                        src={article.authorInfo?.avatar}
                        alt={article.authorInfo?.name || article.authorName}
                      />
                      <AvatarFallback className="bg-sky-50 text-sky-800 font-bold text-xs">
                        {getInitials(
                          article.authorInfo?.name || article.authorName,
                          article.authorInfo?.firstName,
                          article.authorInfo?.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-sky-600 uppercase tracking-wider flex items-center gap-1">
                          <Feather className="w-2.5 h-2.5" />
                          Written By
                        </span>
                      </div>
                      <span className="font-bold text-xs md:text-sm text-zinc-900 capitalize leading-tight">
                        {article.authorInfo?.name || article.authorName}
                        {article.coAuthors && article.coAuthors.length > 0 &&
                          `, ${article.coAuthors.map((c) => c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim()).join(', ')}`}
                      </span>
                    </div>
                  </div>
                ) : article.coAuthors && article.coAuthors.length > 0 ? (
                  <div className="flex items-center gap-2.5">
                    <div className="flex -space-x-2 overflow-hidden shrink-0">
                      {article.coAuthors.map((c, idx) => {
                        const name = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim();
                        return (
                          <Avatar
                            key={c._id || idx}
                            className="h-9 w-9 border-2 border-white ring-1 ring-black/10 shadow-xs inline-block"
                          >
                            <AvatarImage src={c.avatar} alt={name} />
                            <AvatarFallback className="bg-sky-50 text-sky-800 font-bold text-[10px]">
                              {getInitials(c.name, c.firstName, c.lastName)}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-sky-600 uppercase tracking-wider flex items-center gap-1">
                          <Feather className="w-2.5 h-2.5" />
                          Written By
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        {article.coAuthors.map((c, idx) => {
                          const name = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim();
                          return (
                            <span key={c._id || idx} className="font-bold text-xs md:text-sm text-zinc-800 capitalize leading-tight">
                              {name}{idx < (article.coAuthors?.length ?? 0) - 1 ? ', ' : ''}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9 border border-zinc-200 shadow-xs ring-1 ring-black/5 shrink-0">
                      <AvatarImage
                        src={article.authorInfo?.avatar}
                        alt={article.authorInfo?.name || article.authorName}
                      />
                      <AvatarFallback className="bg-sky-50 text-sky-800 font-bold text-xs">
                        {getInitials(
                          article.authorInfo?.name || article.authorName,
                          article.authorInfo?.firstName,
                          article.authorInfo?.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-black text-sky-600 uppercase tracking-wider flex items-center gap-1">
                          <Feather className="w-2.5 h-2.5" />
                          Written By
                        </span>
                      </div>
                      <span className="font-bold text-xs md:text-sm text-zinc-900 capitalize leading-tight">
                        {article.authorInfo?.name || article.authorName}
                      </span>
                    </div>
                  </div>
                )}

                {/* --- EDITED BY (WHEN EDITOR EXISTS OR CO-AUTHORS EXIST) --- */}
                {(article.editorInfo || (article.coAuthors && article.coAuthors.length > 0)) && (
                  <>
                    <Separator orientation="vertical" className="h-7 hidden sm:block bg-zinc-200" />
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-9 w-9 border border-zinc-200 shadow-xs ring-1 ring-black/5 shrink-0">
                        <AvatarImage
                          src={article.editorInfo?.avatar || article.authorInfo?.avatar}
                          alt={article.editorInfo?.name || article.authorInfo?.name || article.authorName}
                        />
                        <AvatarFallback className="bg-[#e98571]/10 text-[#d87460] font-bold text-xs">
                          {getInitials(
                            article.editorInfo?.name || article.authorInfo?.name || article.authorName,
                            article.editorInfo?.firstName || article.authorInfo?.firstName,
                            article.editorInfo?.lastName || article.authorInfo?.lastName
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-black text-[#e98571] uppercase tracking-wider flex items-center gap-1">
                            <Edit3 className="w-2.5 h-2.5" />
                            Edited By
                          </span>
                        </div>
                        <span className="font-bold text-xs md:text-sm text-zinc-900 capitalize leading-tight">
                          {article.editorInfo?.name || article.authorInfo?.name || article.authorName}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* --- TIMELINE & READ TIME --- */}
                <Separator orientation="vertical" className="h-7 hidden md:block bg-zinc-200" />
                <div className="flex flex-col justify-center">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    Timeline
                  </span>
                  <div className="flex items-center gap-1.5 text-zinc-500 font-bold text-[10px] sm:text-[11px] leading-tight">
                    <DateDisplay date={new Date(article.publishedDate)} />
                    <span className="opacity-30">•</span>
                    <TimeAgo timestamp={new Date(article.publishedDate)} />
                    <span className="opacity-30 hidden sm:inline">•</span>
                    <span className="text-zinc-600 font-semibold hidden sm:inline">
                      {getEstimatedReadTime(article.contentData)}
                    </span>
                  </div>
                </div>
              </div>

              {/* --- SHARE DIALOG BUTTON --- */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="rounded-none border-l border-zinc-200 h-9 gap-2 px-4 hover:bg-zinc-100 transition-all text-xs font-black uppercase tracking-widest shrink-0">
                    <FontAwesomeIcon icon={faShareNodes} className="h-3 w-3" /> Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-none sm:max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
                  <DialogHeader className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-[#e98571] animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#e98571]">Gyanmitra News</span>
                    </div>
                    <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">Share this Article</DialogTitle>
                    <p className="text-xs text-zinc-500 font-medium">Spread verified journalism and updates with your network.</p>
                  </DialogHeader>

                  {/* --- LIVE ARTICLE SHARE PREVIEW CARD --- */}
                  <div className="mt-4 rounded-md border border-zinc-200/90 bg-gradient-to-b from-zinc-50 to-white p-3.5 shadow-xs transition-all">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200/60">
                      <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                        <Eye className="w-3 h-3 text-[#e98571]" /> Social Preview Card
                      </span>
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-[#e98571]/30 bg-[#e98571]/5 text-[#d87460] rounded-none py-0">
                        {article.categoryName || 'News'}
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3.5 items-start">
                      {/* Thumbnail Preview */}
                      <div className="relative w-full sm:w-36 aspect-video sm:aspect-[4/3] rounded-sm overflow-hidden bg-zinc-200 shrink-0 border border-zinc-200/80 shadow-xs">
                        <img
                          src={sharePreviewImage}
                          alt={article.headline}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/assets/s.png';
                          }}
                        />
                        {article.featuredMediaInfo?.fileType === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <span className="text-[9px] font-black text-white bg-black/60 px-1.5 py-0.5 rounded-none uppercase tracking-wider">Video</span>
                          </div>
                        )}
                      </div>

                      {/* Content Details */}
                      <div className="flex flex-col justify-between flex-1 min-w-0 space-y-1.5 w-full">
                        <h4 className="font-bold text-xs sm:text-sm text-zinc-900 leading-snug line-clamp-2">
                          {article.headline}
                        </h4>
                        {article.description && (
                          <p className="text-[11px] text-zinc-500 font-medium line-clamp-2 leading-relaxed">
                            {article.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-1 text-[10px] font-bold text-zinc-400">
                          <span className="flex items-center gap-1 text-zinc-500">
                            <Globe className="w-2.5 h-2.5 text-[#e98571]" /> gyanmitranews.com
                          </span>
                          <span>•</span>
                          <span>{article.authorName || 'Gyanmitra News'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- NATIVE DEVICE SHARE BUTTON --- */}
                  {typeof navigator !== 'undefined' && 'share' in navigator && (
                    <Button
                      variant="default"
                      className="w-full rounded-none h-10 gap-2 text-xs font-bold bg-[#e98571] hover:bg-[#d87460] text-white shadow-xs transition-all active:scale-[0.99]"
                      onClick={handleNativeShare}
                      disabled={isSharing}
                    >
                      {isSharing ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing Share Sheet...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faShareNodes} className="h-3.5 w-3.5" />
                          Share via Apps (WhatsApp, Instagram, Messages...)
                        </>
                      )}
                    </Button>
                  )}

                  {/* --- SOCIAL CHANNELS GRID --- */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Direct Social Channels</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          "rounded-none justify-start gap-2.5 text-xs bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border-[#25D366]/30 font-bold transition-all"
                        )}
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faWhatsapp} className="h-4 w-4 text-[#25D366]" /> WhatsApp
                      </a>
                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(article.headline)}`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          "rounded-none justify-start gap-2.5 text-xs bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#1D84B5] border-[#229ED9]/30 font-bold transition-all"
                        )}
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faTelegram} className="h-4 w-4 text-[#229ED9]" /> Telegram
                      </a>
                      <a
                        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.headline)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          "rounded-none justify-start gap-2.5 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-zinc-200 font-bold transition-all"
                        )}
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faXTwitter} className="h-3.5 w-3.5" /> X (Twitter)
                      </a>
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          "rounded-none justify-start gap-2.5 text-xs bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2]/30 font-bold transition-all"
                        )}
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faFacebookF} className="h-3.5 w-3.5" /> Facebook
                      </a>
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank"
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          "rounded-none justify-start gap-2.5 text-xs bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] border-[#0A66C2]/30 font-bold transition-all"
                        )}
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faLinkedinIn} className="h-3.5 w-3.5" /> LinkedIn
                      </a>
                      <a
                        href={`mailto:?subject=${encodeURIComponent(article.headline)}&body=${encodeURIComponent(shareText)}`}
                        className={cn(
                          buttonVariants({ variant: 'outline' }),
                          "rounded-none justify-start gap-2.5 text-xs bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200 font-bold transition-all"
                        )}
                      >
                        <FontAwesomeIcon icon={faEnvelope} className="h-3.5 w-3.5 text-[#e98571]" /> Email
                      </a>
                    </div>
                  </div>

                  {/* --- COPY LINK FIELD --- */}
                  <div className="pt-3 border-t border-zinc-100 space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Page Link</span>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        readOnly
                        value={shareUrl}
                        className="flex-1 bg-zinc-50 border border-zinc-200 px-3 py-2 text-xs text-zinc-600 font-mono rounded-none focus:outline-none select-all truncate"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <Button
                        variant={copied ? 'default' : 'outline'}
                        className={cn(
                          "rounded-none text-xs font-bold gap-1.5 shrink-0 h-9 transition-all",
                          copied ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
                        )}
                        onClick={handleCopyLink}
                      >
                        {copied ? (
                          <>
                            <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" /> Copied!
                          </>
                        ) : (
                          <>
                            <FontAwesomeIcon icon={faLink} className="h-3.5 w-3.5" /> Copy Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <FeaturedMedia
              fileType={article.featuredMediaInfo.fileType}
              url={article.featuredMediaInfo.url}
              name={article.headline}
              className="w-full rounded-sm shadow-sm overflow-hidden aspect-video object-cover"
              thumbnail={article.featuredMediaInfo.thumbnail}
            />

            <p className="text-lg text-zinc-500 font-bold  leading-relaxed border-l-2 border-[#e98571] pl-6 py-2 bg-zinc-50">
              {article.description}
            </p>
          </div>

          <div className="prose prose-slate max-w-none pt-4 prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900" 
               dangerouslySetInnerHTML={{ __html: content || '' }} 
          />

          {/* --- EDITORIAL CREDITS & AUTHORSHIP SECTION --- */}
          <div className="my-8 rounded-sm border border-zinc-200 bg-zinc-50/70 p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#e98571]" />
                Editorial Credits & Authorship
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Written By Card (Reporter / Authors / Contributors) */}
              <div className="flex flex-col bg-white p-4 rounded-sm border border-zinc-200/80 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 text-[9px] font-black uppercase tracking-wider px-2 py-0 h-4 rounded-none">
                    Written By
                  </Badge>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    Reporting & Writing
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Primary Author / Reporter */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 border border-zinc-200 shadow-xs shrink-0">
                      <AvatarImage src={article.authorInfo?.avatar} alt={article.authorInfo?.name || article.authorName} />
                      <AvatarFallback className="bg-sky-50 text-sky-800 font-bold text-xs">
                        {getInitials(
                          article.authorInfo?.name || article.authorName,
                          article.authorInfo?.firstName,
                          article.authorInfo?.lastName
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-xs text-zinc-800 capitalize truncate">
                        {article.authorInfo?.name || article.authorName}
                      </span>
                      <span className="text-[10px] text-zinc-500 capitalize">
                        {article.authorInfo?.role || 'Reporter'}
                      </span>
                    </div>
                  </div>

                  {/* Co-Authors if any */}
                  {article.coAuthors && article.coAuthors.map((c, idx) => {
                    const name = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim();
                    return (
                      <div key={c._id || idx} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-zinc-200 shadow-xs shrink-0">
                          <AvatarImage src={c.avatar} alt={name} />
                          <AvatarFallback className="bg-sky-50 text-sky-800 font-bold text-xs">
                            {getInitials(c.name, c.firstName, c.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs text-zinc-800 capitalize truncate">
                            {name}
                          </span>
                          <span className="text-[10px] text-zinc-500 capitalize">
                            {c.role || 'Contributor'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Edited By Card (Admin / Reviewer / Editor) */}
              {(article.editorInfo || (article.coAuthors && article.coAuthors.length > 0)) ? (
                <div className="flex items-start gap-3.5 bg-white p-4 rounded-sm border border-zinc-200/80 shadow-xs">
                  <Avatar className="h-11 w-11 border border-zinc-200 shadow-sm shrink-0">
                    <AvatarImage
                      src={article.editorInfo?.avatar || article.authorInfo?.avatar}
                      alt={article.editorInfo?.name || article.authorInfo?.name || article.authorName}
                    />
                    <AvatarFallback className="bg-[#e98571]/10 text-[#d87460] font-bold text-sm">
                      {getInitials(
                        article.editorInfo?.name || article.authorInfo?.name || article.authorName,
                        article.editorInfo?.firstName || article.authorInfo?.firstName,
                        article.editorInfo?.lastName || article.authorInfo?.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className="bg-[#e98571] hover:bg-[#d87460] text-white text-[9px] font-black uppercase tracking-wider px-2 py-0 h-4 border-none rounded-none">
                        Edited By
                      </Badge>
                      <span className="text-[10px] text-zinc-500 font-medium capitalize truncate">
                        {article.editorInfo?.role || (article.editorInfo ? 'Admin' : article.authorInfo?.role || 'Editor')}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900 capitalize truncate">
                      {article.editorInfo?.name || article.authorInfo?.name || article.authorName}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                      Editorial reviewer responsible for review, formatting, verification, and publication oversight.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3.5 bg-white p-4 rounded-sm border border-zinc-200/80 shadow-xs">
                  <Avatar className="h-11 w-11 border border-zinc-200 shadow-sm shrink-0">
                    <AvatarImage src={article.authorInfo?.avatar} alt={article.authorInfo?.name || article.authorName} />
                    <AvatarFallback className="bg-[#e98571]/10 text-[#d87460] font-bold text-sm">
                      {getInitials(
                        article.authorInfo?.name || article.authorName,
                        article.authorInfo?.firstName,
                        article.authorInfo?.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0 h-4 border-none rounded-none">
                        Author & Publisher
                      </Badge>
                      {article.authorInfo?.role && (
                        <span className="text-[10px] text-zinc-500 font-medium capitalize truncate">
                          {article.authorInfo.role}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-zinc-900 capitalize truncate">
                      {article.authorInfo?.name || article.authorName}
                    </h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                      Direct publication by author with full editorial responsibility.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="pt-10 border-t border-zinc-100">
             <div className="flex flex-wrap gap-2 mb-12">
                <span className="text-[9px] font-black uppercase text-zinc-400 w-full mb-1 tracking-widest">Tagged Under</span>
                {Array.isArray(article.tags) && article.tags.map((tag, index) => (
                  <Badge variant="outline" key={index} className="rounded-none px-3 py-1 border-zinc-200 hover:border-[#e98571] hover:text-[#e98571] transition-colors cursor-pointer text-[10px] font-bold">
                    #{tag}
                  </Badge>
                ))}
             </div>

             <ArticleCommentsSection
                articleId={article._id}
                articleSlug={article.slug}
                comments={article.comments}
              />
          </div>
        </article>

        {/* --- SIDEBAR --- */}
        <aside className="lg:col-span-4 pt-4">
          <div className="sticky top-24 space-y-8">
            <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-900 pb-1">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">Recommended</h2>
            </div>
            
            <div className="space-y-6">
              {Array.isArray(data.data.recentArticles) &&
                data.data.recentArticles.slice(0, 6).map((item: any, index: number) => (
                  <div key={index} className="group border-b border-zinc-100 pb-5 last:border-0">
                    <LeftCard
                      title={item.headline}
                      mediaSrc={item.featuredMediaInfo.url}
                      fileType={item.featuredMediaInfo.fileType}
                      category={item.categoryName}
                      link={'/articles/' + item.slug}
                      thumbnail={item.featuredMediaInfo.thumbnail}
                      date={new Date(item.publishedDate)}
                      name={item.featuredMediaInfo.name}
                    />
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>

      {/* --- TRENDING SECTION --- */}
      <section className="mt-20 w-full bg-zinc-900 rounded-sm p-8 md:p-12 mb-12">
        <div className="flex items-center justify-between mb-10">
           <h2 className="text-white text-2xl md:text-3xl font-bold uppercase tracking-wide">
            Trending <span className="text-[#e98571]">Now</span>
           </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.isArray(data.data.trendingArticles) &&
            data.data.trendingArticles.slice(0, 4).map((item) => (
              <Link to={'/articles/' + item.slug} key={item._id} className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-zinc-800">
                <FeaturedMedia
                  fileType={item.featuredMediaInfo.fileType}
                  url={item.featuredMediaInfo.url}
                  className="absolute inset-0 h-full w-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
                  thumbnail={item.featuredMediaInfo.thumbnail}
                  name={item.featuredMediaInfo.name}
                  playable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-5 space-y-2">
                  <Badge className="bg-[#e98571] text-[8px] font-black uppercase tracking-widest border-none rounded-none">{item.categoryName}</Badge>
                  <h3 className="text-white font-bold text-base leading-tight line-clamp-3 ">{item.headline}</h3>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
};