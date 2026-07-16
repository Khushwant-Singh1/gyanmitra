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
import { faShareNodes, faZap, faLink } from '@fortawesome/free-solid-svg-icons';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { FeaturedMedia } from '@/components/FeaturedMedia.components';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { MDToHTMLConverter } from '@/utils/MDToHTML.utils';
import { ArticleCommentsSection } from '@/components/ArticleComments.components';
import { motion } from 'framer-motion';

export const Article: React.FC = () => {
  const { articleSlug } = useParams<{ articleSlug: string }>();
  const [content, setContent] = useState<string | null>(null);

  // Main Article Data Fetch
  const { data, isLoading, error } = useQuery<IApiResponse<IApiArticle>>({
    queryKey: ['articles', 'page', articleSlug],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiArticle>>(
        `/api/articles/page/${articleSlug}`
      );
      return response.data;
    },
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
  const canonicalUrl = article.canonicalUrl || `${window.location.origin}/articles/${article.slug}`;
  const robotsSetting = article.robotsTag || "INDEX, FOLLOW";

  return (
    <main className="max-w-[1350px] mx-auto px-4 sm:px-6">
      <Helmet>
        {/* --- DYNAMIC SEO META TAGS --- */}
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content={robotsSetting} />
        
        {/* Open Graph (Social Sharing) */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={article.featuredMediaInfo.url} />
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
            
            <div className="flex flex-wrap items-center justify-between border-t border-zinc-200 py-4 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Writer</span>
                  <span className="font-bold text-xs text-zinc-900">{article.authorName}</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Timeline</span>
                  <div className="flex gap-1.5 text-zinc-500 font-bold text-[10px]">
                     <DateDisplay date={new Date(article.publishedDate)} />
                     <span className="opacity-30">|</span>
                     <TimeAgo timestamp={new Date(article.publishedDate)} />
                  </div>
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="rounded-none border-l border-zinc-200 h-8 gap-2 px-4 hover:bg-zinc-100 transition-all text-xs font-black uppercase tracking-widest">
                    <FontAwesomeIcon icon={faShareNodes} className="h-3 w-3" /> Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-none">
                  <DialogHeader><DialogTitle className="text-lg font-bold">Share this News</DialogTitle></DialogHeader>
                  <div className="flex flex-col gap-2 pt-4">
                    <Button variant="outline" className="rounded-none justify-start gap-3 text-xs" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link Copied'); }}>
                      <FontAwesomeIcon icon={faLink} className="h-3 w-3" /> Copy Link
                    </Button>
                    <a href={`https://wa.me/?text=${encodeURIComponent(article.headline)} - ${window.location.href}`} target="_blank" className={cn(buttonVariants({ variant: 'outline' }), "rounded-none justify-start gap-3 text-xs")} rel="noopener noreferrer">
                      <FontAwesomeIcon icon={faWhatsapp} className="h-3 w-3 text-green-600" /> WhatsApp
                    </a>
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