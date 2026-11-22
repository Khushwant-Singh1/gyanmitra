'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IApiHome, IApiResponse } from '@/api/client.api';
import { Spinner } from '@/components/Spinner.components';
import { ErrorAlert } from '@/components/ErrorAlert.components';
import CenterCard from '@/components/CenterCard.components';
import LeftCard from '@/components/LeftCard.components';
import RightCard from '@/components/RightCard.components';
import ArticleList from '@/components/ArticleList.components';
import { FeaturedMedia } from '@/components/FeaturedMedia.components';
import { DateDisplay } from '@/components/DateDisplay.components';
import TimeAgo from '@/components/TimeAgo.components';
import { isJustNow } from '@/utils/date.utils';
import { MEDIA_FILE_TYPES } from '@/constants/index.constants';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowUpRight, Hash, Layers, Zap, PlayCircle, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySectionDef {
  key: string;
  name: string;
  englishName?: string;
  slug: string;
  aliases: string[];
}

// 1. Top News, 2. Sambhal, 3. Moradabad, 4. Amroha, 5. Rampur, 6. Pradesh, 7. Desh, 8. Duniya
const PRIMARY_SECTIONS: CategorySectionDef[] = [
  {
    key: 'top-news',
    name: 'टॉप न्यूज़',
    englishName: 'Top News',
    slug: 'टॉप-न्यूज़',
    aliases: ['top news', 'top-news', 'topnews', 'टॉप न्यूज़', 'टॉप न्यूज', 'प्रमुख समाचार', 'खास खबर', 'मुख्य समाचार', 'top'],
  },
  {
    key: 'sambhal',
    name: 'संभल',
    englishName: 'Sambhal',
    slug: 'sambhal',
    aliases: ['sambhal', 'संभल', 'chandausi', 'चंदौसी', 'bahjoi', 'बहजोई', 'gunnaur', 'गुन्नौर'],
  },
  {
    key: 'moradabad',
    name: 'मुरादाबाद',
    englishName: 'Moradabad',
    slug: 'moradabad',
    aliases: ['moradabad', 'मुरादाबाद'],
  },
  {
    key: 'amroha',
    name: 'अमरोहा',
    englishName: 'Amroha',
    slug: 'amroha',
    aliases: ['amroha', 'अमरोहा', 'jyotiba phule nagar'],
  },
  {
    key: 'rampur',
    name: 'रामपुर',
    englishName: 'Rampur',
    slug: 'rampur',
    aliases: ['rampur', 'रामपुर'],
  },
  {
    key: 'pradesh',
    name: 'प्रदेश',
    englishName: 'Uttar Pradesh',
    slug: 'उत्तरप्रदेश',
    aliases: ['pradesh', 'प्रदेश', 'uttar pradesh', 'uttarpradesh', 'उत्तरप्रदेश', 'उत्तर प्रदेश', 'up', 'यूपी', 'राज्य'],
  },
  {
    key: 'desh',
    name: 'देश',
    englishName: 'National',
    slug: 'देश',
    aliases: ['desh', 'देश', 'national', 'भारत', 'india', 'राष्ट्रीय', 'rashtriya'],
  },
  {
    key: 'duniya',
    name: 'दुनिया',
    englishName: 'International',
    slug: 'दुनिया',
    aliases: ['duniya', 'दुनिया', 'videsh', 'विदेश', 'international', 'world', 'global', 'अंतर्राष्ट्रीय'],
  },
];

interface HomeProps {
  initialHomeData?: IApiHome | null;
}

const Home: React.FC<HomeProps> = ({ initialHomeData }) => {
  const { data, isLoading, error } = useQuery<IApiResponse<IApiHome>>({
    queryKey: ['home'],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiHome>>('/api/users/home');
      return response.data;
    },
    initialData: initialHomeData
      ? { success: true, statusCode: 200, data: initialHomeData }
      : undefined,
    initialDataUpdatedAt: Date.now(),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  if (error || !data || !data.data) return <div className="flex h-screen items-center justify-center p-4"><ErrorAlert message="Error loading feed" /></div>;

  const { todayPublished = [], recentPublished, articlePublished = [], mixedArticles = [] } = data.data || {};

  const breakingNewsList = todayPublished.length > 0 ? todayPublished : articlePublished.slice(0, 5);

  const getBySection = (section: CategorySectionDef) => {
    const matched = mixedArticles.filter(a => {
      const cat = a.category?.trim().toLowerCase() || '';
      return section.aliases.some(alias => cat === alias.toLowerCase() || cat.includes(alias.toLowerCase()));
    });

    const limit = section.key === 'top-news' ? 4 : 3;

    if (matched.length > 0) {
      return matched.slice(0, limit);
    }

    // Fallback for Top News if no explicit 'top news' category tag is used
    if (section.key === 'top-news') {
      const pool = todayPublished.length > 0 ? todayPublished : mixedArticles;
      return pool.filter(a => a.slug !== recentPublished?.slug).slice(0, limit);
    }

    return [];
  };

  // Photo-Lead Big Card (Featured editorial lead for Top News)
  const renderPhotoLeadCard = (article: IApiHome['mixedArticles'][0], priority = false) => (
    <Link
      to={`/articles/${article.slug}`}
      key={article.slug}
      className="group flex flex-col bg-white border border-slate-200/80 rounded-md overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 h-full"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        <FeaturedMedia
          name={article.featuredMedia.name || article.headline}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          fileType={article.featuredMedia.fileType}
          playable={true}
          thumbnail={article.featuredMedia.thumbnail}
          url={article.featuredMedia.url}
          priority={priority}
          width={800}
          height={450}
          sizes="(max-width: 768px) 100vw, 600px"
        />
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          <Badge className="bg-[#e98571] text-white text-[9px] font-bold uppercase border-none rounded-xs px-2 py-0.5 shadow-xs">
            {article.category}
          </Badge>
          {isJustNow(article.uploaded) && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[10px] font-bold shadow-xs backdrop-blur-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              अभी-अभी
            </span>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1 space-y-2">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 group-hover:text-[#e98571] transition-colors leading-snug line-clamp-2">
          {article.headline}
        </h3>
        {article.description && (
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
            {article.description}
          </p>
        )}
        <div className="pt-3 mt-auto flex items-center justify-between border-t border-slate-100 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-[#e98571]" />
            <DateDisplay date={new Date(article.uploaded)} />
            <span className="opacity-40">•</span>
            <TimeAgo timestamp={new Date(article.uploaded)} />
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#e98571] transition-colors" />
        </div>
      </div>
    </Link>
  );

  // Compact 3-Item Bullet Feed for quick updates
  const renderBulletFeed = (feedArticles: IApiHome['mixedArticles']) => (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-md p-4 sm:p-5 flex flex-col justify-between shadow-2xs h-full">
      <div>
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#e98571] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              त्वरित अपडेट्स (Quick Updates)
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#e98571] uppercase tracking-wider bg-[#e98571]/10 px-2 py-0.5 rounded-full">
            Live Feed
          </span>
        </div>

        <div className="divide-y divide-slate-200/70">
          {feedArticles.map((article, idx) => (
            <Link
              to={`/articles/${article.slug}`}
              key={article.slug}
              className="group flex items-start gap-3 py-3.5 first:pt-2 last:pb-1 transition-all"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-[#e98571] font-mono text-xs font-bold shadow-2xs group-hover:bg-[#e98571] group-hover:text-white group-hover:border-[#e98571] transition-colors mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {article.category}
                  </span>
                  {isJustNow(article.uploaded) && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-red-50 border border-red-200 text-red-600 text-[9px] font-bold">
                      <span className="h-1 w-1 rounded-full bg-red-600 animate-ping" />
                      अभी-अभी
                    </span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#e98571] transition-colors line-clamp-2 leading-snug">
                  {article.headline}
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium pt-0.5">
                  <TimeAgo timestamp={new Date(article.uploaded)} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  // Video Spotlight Card (Dark luxury card with play overlay)
  const renderVideoSpotlightCard = (article: IApiHome['mixedArticles'][0]) => (
    <Link
      to={`/articles/${article.slug}`}
      key={article.slug}
      className="group block bg-slate-950 text-white rounded-md overflow-hidden border border-slate-800 shadow-md transition-all duration-300 hover:border-[#e98571]/50"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <FeaturedMedia
          name={article.featuredMedia.name || article.headline}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          fileType={article.featuredMedia.fileType}
          playable={true}
          thumbnail={article.featuredMedia.thumbnail}
          url={article.featuredMedia.url}
          width={600}
          height={338}
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge className="bg-red-600 text-white text-[9px] font-black uppercase border-none rounded-xs px-2 py-0.5 flex items-center gap-1 shadow-xs">
            <PlayCircle className="h-3 w-3" /> Video Story
          </Badge>
          {isJustNow(article.uploaded) && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-bold">
              <span className="h-1 w-1 rounded-full bg-red-400 animate-ping" /> अभी-अभी
            </span>
          )}
        </div>
      </div>
      <div className="p-3.5 sm:p-4 space-y-1.5">
        <span className="text-[10px] font-bold text-[#e98571] uppercase tracking-wider">
          {article.category}
        </span>
        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#e98571] transition-colors leading-snug line-clamp-2">
          {article.headline}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
          <DateDisplay date={new Date(article.uploaded)} />
          <span>•</span>
          <TimeAgo timestamp={new Date(article.uploaded)} />
        </div>
      </div>
    </Link>
  );

  // District Lead Card (Top-image card for alternating rhythm)
  const renderDistrictLeadCard = (article: IApiHome['mixedArticles'][0]) => (
    <Link
      to={`/articles/${article.slug}`}
      key={article.slug}
      className="group block bg-white border border-slate-200/80 rounded-md overflow-hidden shadow-2xs hover:shadow-sm transition-all duration-300 pb-3"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        <FeaturedMedia
          name={article.featuredMedia.name || article.headline}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          fileType={article.featuredMedia.fileType}
          playable={true}
          thumbnail={article.featuredMedia.thumbnail}
          url={article.featuredMedia.url}
          width={500}
          height={281}
          sizes="(max-width: 768px) 100vw, 400px"
        />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <Badge className="bg-[#e98571] text-white text-[8px] font-bold uppercase border-none rounded-xs px-2 py-0.5">
            {article.category}
          </Badge>
          {isJustNow(article.uploaded) && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-red-600/90 text-white text-[9px] font-bold shadow-xs backdrop-blur-xs">
              <span className="h-1 w-1 rounded-full bg-white animate-ping" />
              अभी-अभी
            </span>
          )}
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#e98571] transition-colors leading-snug line-clamp-2">
          {article.headline}
        </h3>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
          <Clock className="h-2.5 w-2.5 text-[#e98571]" />
          <DateDisplay date={new Date(article.uploaded)} />
          <span>•</span>
          <TimeAgo timestamp={new Date(article.uploaded)} />
        </div>
      </div>
    </Link>
  );

  return (
    /* FIXED: pb-32 use kiya hai taaki content bottom nav ke upar finish ho. 
       'pb-[env(safe-area-inset-bottom)]' iPhone users ke liye bottom notch space handle karega */
    <main className="bg-[#fcfcfc] min-h-screen pb-32 md:pb-12 font-sans overflow-x-hidden">
      <Helmet prioritizeSeoTags>
        <title>Gyanmitra - Hindi News & Knowledge Portal</title>
        <meta
          name="description"
          content="ज्ञानमित्र न्यूज़ - शिक्षा, नवाचार, और नैतिक मूल्यों पर आधारित समाचारों का आपका विश्वसनीय स्रोत।"
        />
        <link rel="canonical" href="https://gyanmitranews.com/" />
        <meta name="robots" content="INDEX, FOLLOW" />
      </Helmet>

      {/* Breaking News Bar */}
      <div className="bg-[#e98571] text-white py-2 shadow-sm sticky top-0 z-40 overflow-hidden">
        <div className="max-w-[95%] mx-auto px-4 flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-sm shrink-0 z-10 shadow-sm">
            <Zap className="h-3 w-3 fill-white" />
            <span className="font-black uppercase  text-[10px] tracking-widest">Breaking</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <div className="animate-marquee-scroll gap-12">
              {breakingNewsList.length > 0 ? (
                breakingNewsList.map((article, index) => (
                  <Link 
                    key={index} 
                    to={`/articles/${article.slug}`}
                    className="text-[11px] font-bold uppercase tracking-tight hover:underline flex items-center gap-2"
                  >
                    <span className="opacity-50 text-[8px]">●</span>
                    {article.headline}
                  </Link>
                ))
              ) : (
                <span className="text-[11px] font-bold uppercase tracking-tight">
                  ताज़ा खबरों के लिए बने रहें...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[95%] mx-auto px-4 mt-4 pb-20 md:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* MAIN COLUMN */}
          <div className="lg:col-span-8 space-y-12">
            {/* 1. TOP HERO NEWS (Lead Story / Featured Hero) */}
            {recentPublished && (
              <section className="rounded-sm overflow-hidden border border-zinc-100 bg-white p-2 shadow-sm">
                <CenterCard
                  fileType={recentPublished.featuredMedia.fileType}
                  mediaSrc={recentPublished.featuredMedia.url}
                  title={recentPublished.headline}
                  description={recentPublished.description}
                  category={recentPublished.category}
                  name={recentPublished.featuredMedia.name}
                  date={recentPublished.uploaded ? new Date(recentPublished.uploaded) : null}
                  link={`/articles/${recentPublished.slug}`}
                  thumbnail={recentPublished.featuredMedia.thumbnail}
                  priority={true}
                />
              </section>
            )}

            {/* 1. Top News (Full Width with Photo-Lead + Bullet Feed), 2. Sambhal, 3. Moradabad, 4. Amroha, 5. Rampur, 6. Pradesh, 7. Desh, 8. Duniya */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
              {PRIMARY_SECTIONS.map((section, sectionIndex) => {
                const articles = getBySection(section);
                const isTopNews = section.key === 'top-news';

                return (
                  <section
                    key={section.key}
                    className={cn("space-y-4", isTopNews && "md:col-span-2")}
                  >
                    <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-1">
                      <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-md shadow-xs border border-slate-100">
                        <div className="bg-[#e98571] p-1.5 rounded-xs shadow-xs text-white">
                          <Hash className="h-4 w-4" />
                        </div>
                        <h2 className="text-lg font-bold uppercase tracking-wide text-slate-800">
                          {section.name} <span className="text-[#e98571]">News</span>
                        </h2>
                      </div>
                      <Link
                        to={`/categories/${section.slug}`}
                        className="text-zinc-300 hover:text-[#e98571] transition-colors p-1"
                        title={`View ${section.name} news`}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>

                    {articles.length === 0 ? (
                      <div className="py-6 px-3 border border-dashed border-zinc-200 rounded-sm text-center bg-zinc-50/50">
                        <p className="text-[11px] font-bold text-zinc-400">
                          {section.name} में अभी कोई ताज़ा खबर नहीं है...
                        </p>
                      </div>
                    ) : isTopNews ? (
                      /* Editorial Layout for Top News: 1 Big Photo-Lead Card + Compact 3-Item Bullet Feed */
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7">
                          {renderPhotoLeadCard(articles[0], true)}
                        </div>
                        <div className="lg:col-span-5">
                          {articles.length > 1 ? (
                            renderBulletFeed(articles.slice(1, 4))
                          ) : (
                            <div className="p-4 bg-slate-50 rounded-md border border-slate-200 text-xs text-slate-500">
                              ताज़ा अपडेट्स जोड़े जा रहे हैं...
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* District Sections with Editorial Alternating Rhythm & Video Spotlight */
                      <div className="space-y-4">
                        {sectionIndex % 2 === 1 && articles.length > 0 ? (
                          <>
                            {articles[0].featuredMedia?.fileType === MEDIA_FILE_TYPES.Video ? (
                              renderVideoSpotlightCard(articles[0])
                            ) : (
                              renderDistrictLeadCard(articles[0])
                            )}
                            {articles.slice(1).map((article) => (
                              <div
                                key={article.slug}
                                className="rounded-xs hover:bg-zinc-50 transition-all border-b border-zinc-100 last:border-0 pb-3"
                              >
                                {article.featuredMedia?.fileType === MEDIA_FILE_TYPES.Video ? (
                                  renderVideoSpotlightCard(article)
                                ) : (
                                  <LeftCard
                                    title={article.headline}
                                    date={new Date(article.uploaded)}
                                    link={`/articles/${article.slug}`}
                                    category={article.category}
                                    thumbnail={article.featuredMedia.thumbnail}
                                    mediaSrc={article.featuredMedia.url}
                                    fileType={article.featuredMedia.fileType}
                                    name={article.featuredMedia.name}
                                  />
                                )}
                              </div>
                            ))}
                          </>
                        ) : (
                          articles.map((article) => (
                            <div
                              key={article.slug}
                              className="rounded-xs hover:bg-zinc-50 transition-all border-b border-zinc-100 last:border-0 pb-3"
                            >
                              {article.featuredMedia?.fileType === MEDIA_FILE_TYPES.Video ? (
                                renderVideoSpotlightCard(article)
                              ) : (
                                <LeftCard
                                  title={article.headline}
                                  date={new Date(article.uploaded)}
                                  link={`/articles/${article.slug}`}
                                  category={article.category}
                                  thumbnail={article.featuredMedia.thumbnail}
                                  mediaSrc={article.featuredMedia.url}
                                  fileType={article.featuredMedia.fileType}
                                  name={article.featuredMedia.name}
                                />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-10">
            <div className="bg-white rounded-md border border-slate-100 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 border-l-4 border-[#e98571] pl-3">
                <Layers className="h-5 w-5 text-slate-400" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">Trending Today</h2>
              </div>
              <div className="space-y-6">
                {articlePublished.slice(0, 5).map((article) => (
                  <RightCard
                    key={article.slug}
                    title={article.headline}
                    category={article.category}
                    date={new Date(article.uploaded)}
                    link={`/articles/${article.slug}`}
                    thumbnail={article.featuredMedia.thumbnail}
                    mediaSrc={article.featuredMedia.url}
                    fileType={article.featuredMedia.fileType}
                    name={article.featuredMedia.name}
                  />
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-md p-8 text-white relative overflow-hidden group border border-slate-800 shadow-xl">
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                <Trophy className="h-32 w-32" />
              </div>
              <div className="relative z-10 space-y-4">
                <Badge className="bg-[#e98571] text-[10px] font-black uppercase tracking-widest border-none rounded-sm px-2 py-1">Special Hub</Badge>
                <h3 className="text-2xl font-bold uppercase tracking-wide leading-tight text-white drop-shadow-md">Our Competition Hub</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Live entry tracking available</p>
                <Link to="/competitions/" className="block w-full pt-2">
                  <button className="w-full bg-white text-slate-900 py-3 rounded-md font-black text-[11px] uppercase tracking-widest hover:bg-[#e98571] hover:text-white transition-all active:scale-95 shadow-md">
                    Join Competition
                  </button>
                </Link>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-20 border-t pt-10">
          <div className="flex items-center gap-3 mb-8">
            <PlayCircle className="h-8 w-8 text-[#e98571]" />
            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-slate-800">News & Archives</h2>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
          <ArticleList articles={mixedArticles} />
        </div>
      </div>
    </main>
  );
};

export default Home;