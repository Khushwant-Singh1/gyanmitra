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
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Trophy, ArrowUpRight, Hash, Layers, Zap, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const { data, isLoading, error } = useQuery<IApiResponse<IApiHome>>({
    queryKey: ['home'],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<IApiHome>>('/api/users/home');
      return response.data;
    },
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  if (error || !data) return <div className="flex h-screen items-center justify-center p-4"><ErrorAlert message="Error loading feed" /></div>;

  const { todayPublished = [], recentPublished, articlePublished = [], mixedArticles = [] } = data.data;

  const breakingNewsList = todayPublished.length > 0 ? todayPublished : articlePublished.slice(0, 5);

  const getByCategory = (catName: string) => {
    return mixedArticles.filter(a => 
      a.category?.trim().toLowerCase() === catName.trim().toLowerCase()
    ).slice(0, 3);
  };

  return (
    /* FIXED: pb-32 use kiya hai taaki content bottom nav ke upar finish ho. 
       'pb-[env(safe-area-inset-bottom)]' iPhone users ke liye bottom notch space handle karega */
    <main className="bg-[#fcfcfc] min-h-screen pb-32 md:pb-12 font-sans overflow-x-hidden">
      <Helmet prioritizeSeoTags>
        <title>Gyanmitra | Leading Hindi News Portal</title>
      </Helmet>

      {/* Breaking News Bar */}
      <div className="bg-[#e98571] text-white py-2 shadow-sm sticky top-0 z-40 overflow-hidden">
        <div className="max-w-[95%] mx-auto px-4 flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-sm shrink-0 z-10 shadow-sm">
            <Zap className="h-3 w-3 fill-white animate-pulse" />
            <span className="font-black uppercase  text-[10px] tracking-widest">Breaking</span>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <motion.div
              className="flex whitespace-nowrap gap-12"
              animate={{ x: ["100%", "-100%"] }}
              transition={{
                repeat: Infinity,
                duration: 20,
                ease: "linear",
              }}
              whileHover={{ transition: { duration: 0 } }}
            >
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
                  ताज़ा खबरों के liye bane रहें...
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-[95%] mx-auto px-4 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* MAIN COLUMN */}
          <div className="lg:col-span-8 space-y-12">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
              {['देश', 'उत्तरप्रदेश'].map((category) => (
                <section key={category}>
                  <div className="flex items-center justify-between mb-4 border-b-2 border-zinc-900 pb-1">
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-md shadow-sm border border-slate-100">
                      <div className="bg-[#e98571] p-1.5 rounded-sm shadow-sm">
                        <Hash className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-lg font-bold uppercase tracking-wide text-slate-800">
                        {category} <span className="text-[#e98571]">News</span>
                      </h2>
                    </div>
                    <Link to={`/categories/${category}`} className="text-zinc-300 hover:text-[#e98571] transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="space-y-5">
                    {getByCategory(category).length > 0 ? (
                      getByCategory(category).map((article) => (
                        <div key={article.slug} className="rounded-sm hover:bg-zinc-50 transition-all border-b border-zinc-50 last:border-0 pb-4">
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
                        </div>
                      ))
                    ) : (
                      <div className="py-4 px-2 border border-dashed border-zinc-200 rounded-sm">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase ">
                          {category} में अभी कोई ताज़ा खबर नहीं है...
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              ))}
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