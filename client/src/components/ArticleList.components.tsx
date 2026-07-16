import React from 'react';
import { IApiHome } from '@/api/client.api';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { FeaturedMedia } from './FeaturedMedia.components';
import { DateDisplay } from './DateDisplay.components';
import { Clock, ArrowUpRight, Hash, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArticleListProps {
  articles: IApiHome['mixedArticles'];
}

const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  const categories = Array.from(new Set(articles.map(a => a.category)));
  
  // Logic for Sidebar
  const sidebarArticles = articles.slice(0, 5);

  // Split categories: First category for the 2-card layout, others for 3-card layout
  const firstCategory = categories[0];
  const otherCategories = categories.slice(1);

  const renderCategorySection = (cat: string, isFirst: boolean, isFullWidth: boolean) => (
    <section key={cat} className="space-y-6 lg:space-y-8">
      {/* Category Header */}
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-[#e98571] p-1.5 rounded-sm shadow-sm">
            <Hash className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg lg:text-xl font-black uppercase  tracking-tighter text-zinc-900">
            {cat}
          </h2>
        </div>
        <Link 
          to={`/categories/${cat}`} 
          className="group flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-[#e98571] transition-all"
        >
          See More <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid Configuration */}
      <div className={cn(
        "grid grid-cols-1 gap-6 lg:gap-8",
        isFirst ? "md:grid-cols-2" : (isFullWidth ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2")
      )}>
        {articles
          .filter(article => article.category === cat)
          .slice(0, isFirst ? 2 : (isFullWidth ? 6 : 4)) 
          .map((article) => (
            <Link
              to={`/articles/${article.slug}`}
              key={article._id}
              className={cn(
                "group flex flex-col bg-white border border-zinc-100 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-300",
                "active:scale-[0.98] lg:active:scale-100"
              )}
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <FeaturedMedia
                  name={article.featuredMedia.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  fileType={article.featuredMedia.fileType}
                  playable={true}
                  thumbnail={article.featuredMedia.thumbnail}
                  url={article.featuredMedia.url}
                />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-[#e98571] text-white text-[8px] font-black uppercase border-none rounded-sm px-2 py-0.5">
                    Latest
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col flex-1 p-4 space-y-2">
                <h3 className={cn(
                  "text-slate-900 line-clamp-2 font-bold leading-normal group-hover:text-[#e98571] transition-colors",
                  isFirst ? "text-lg md:text-xl" : "text-sm md:text-base"
                )}>
                  {article.headline}
                </h3>
                <p className="text-zinc-500 line-clamp-2 text-[11px] leading-relaxed">
                  {article.description}
                </p>
                <div className="pt-3 flex items-center justify-between border-t border-zinc-50 mt-auto">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="h-3 w-3 text-[#e98571]" />
                    <DateDisplay date={new Date(article.uploaded)} className="text-[9px] font-bold uppercase" />
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-zinc-300 group-hover:text-[#e98571]" />
                </div>
              </div>
            </Link>
          ))}
      </div>
    </section>
  );

  return (
    <div className="w-full px-[10px] py-6 lg:py-8 space-y-16">
      
      {/* TOP SECTION: 2-Card Feed + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-12 lg:space-y-16">
          {firstCategory && renderCategorySection(firstCategory, true, false)}
          {otherCategories[0] && renderCategorySection(otherCategories[0], false, false)}
        </div>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-6 border-l-4 border-[#e98571] pl-3">
              <Zap className="h-4 w-4 text-[#e98571]" />
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-900">Recommended</h2>
            </div>

            <div className="space-y-5">
              {sidebarArticles.map((article) => (
                <Link
                  key={article._id}
                  to={`/articles/${article.slug}`}
                  className="flex gap-3 group items-start border-b border-zinc-100 pb-4 last:border-0"
                >
                  <div className="h-20 w-24 shrink-0 overflow-hidden rounded-sm bg-zinc-100">
                    <FeaturedMedia
                      name={article.featuredMedia.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      fileType={article.featuredMedia.fileType}
                      playable={false}
                      thumbnail={article.featuredMedia.thumbnail}
                      url={article.featuredMedia.url}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant="outline" className="w-fit text-[8px] h-4 px-1.5 border-zinc-200 text-[#e98571] uppercase font-bold">
                      {article.category}
                    </Badge>
                    <h3 className="text-sm font-bold leading-normal line-clamp-2 group-hover:text-[#e98571] transition-colors text-slate-900">
                      {article.headline}
                    </h3>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[9px] mt-1">
                      <Clock className="h-2.5 w-2.5" />
                      <DateDisplay date={new Date(article.uploaded)} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 p-6 bg-zinc-900 rounded-sm relative overflow-hidden text-white">
              <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e98571] mb-2">GyanMitra Special</p>
                <h4 className="text-lg font-black  uppercase leading-tight mb-4 tracking-tighter">Stay Ahead with <br/> Real-time Updates</h4>
                <Link to="/search" className="text-[10px] font-black uppercase border-b border-[#e98571] pb-0.5 hover:text-[#e98571] transition-colors">
                  Explore Now
                </Link>
              </div>
              <Hash className="absolute -right-4 -bottom-4 h-24 w-24 text-white/5" />
            </div>
          </div>
        </aside>
      </div>

      {/* LOWER SECTION: 3-Card Full Width Feed */}
      <div className="space-y-12 lg:space-y-16">
        {otherCategories.slice(1).map((cat) => renderCategorySection(cat, false, true))}
      </div>

    </div>
  );
};

export default ArticleList;