import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  Trophy, Calendar, Search, Loader2, CheckCircle2, 
  ChevronRight, LayoutGrid, User, ArrowRight, Info
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

// --- Premium UI Components ---
const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl border border-slate-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-hidden ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode, variant?: "default" | "success" | "danger" | "warning" }) => {
  const styles = 
    variant === "success" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : 
    variant === "danger" ? "bg-red-50 text-red-600 border-red-200" :
    variant === "warning" ? "bg-amber-50 text-amber-600 border-amber-200" :
    "bg-slate-100 text-slate-600 border-slate-200";
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${styles}`}>{children}</span>;
};

const CompetitionHub = () => {
  const [searchReg, setSearchReg] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);
  const [viewResult, setViewResult] = useState<any>(null);

  const { data: competitions, isLoading } = useQuery({
    queryKey: ['live-competitions'],
    queryFn: async () => {
      const res = await axios.get('/api/competition/all');
      return res.data.data;
    }
  });

  const resultMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await axios.post('/api/competition/check-result', payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      setViewResult(data);
      toast.success(`Result found: ${data.fullName}`);
    },
    onError: () => toast.error("Result not found. Check your details.")
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans antialiased pb-20 selection:bg-[#e98571]/20">
      <div className="max-w-10xl mx-auto px-5 py-8 md:py-12">
        
        {/* PREMIUM HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#e98571]">
              <div className="bg-[#e98571]/10 p-1.5 rounded-lg">
                <Trophy className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold capitalize text-[#e98571]">National Excellence</span>
            </div>
            <h1 className="text-2xl md:text-2xl font-bold text-zinc-900 capitalize leading-none">
              Competition <span className="text-slate-400">Hub</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium">Join the elite challenges and showcase your talent to the world.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold text-slate-400 capitalize">Platform Status</p>
                <p className="text-xs font-bold text-emerald-500 capitalize">Live & Secure</p>
             </div>
             <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
             </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* SIDEBAR: Result Portal & Quick Links */}
          <aside className="w-full lg:w-[380px] space-y-6 order-1 lg:order-2 sticky top-6">
            
            {/* ENHANCED RESULT VIEW */}
            <Card className="border-0 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] ring-1 ring-slate-200 relative overflow-hidden bg-white">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#e98571] to-orange-400" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg">
                      {viewResult ? <Trophy className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">Result Portal</h3>
                      <p className="text-[10px] text-slate-400 font-bold capitalize">Instant Verification</p>
                    </div>
                  </div>
                  {!viewResult && <Info className="h-4 w-4 text-slate-300" />}
                </div>

                {viewResult ? (
                  <div className="space-y-4 animate-in zoom-in-95 duration-300">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                           <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                           <p className="text-[10px] text-slate-400 font-bold capitalize">Candidate</p>
                           <p className="text-xs font-bold text-slate-900 capitalize">{viewResult.fullName}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div className="bg-white p-3 rounded-lg border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 capitalize mb-1">Status</p>
                          <Badge variant={viewResult.status === 'pass' ? "success" : viewResult.status === 'fail' ? "danger" : "default"}>
                            {viewResult.status}
                          </Badge>
                        </div>
                        {viewResult.rank && (
                          <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                            <p className="text-[9px] font-bold text-orange-400 capitalize mb-1 text-center">Final Rank</p>
                            <p className="text-xl font-bold text-[#e98571] text-center leading-none">#{viewResult.rank}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setViewResult(null)} 
                      className="w-full text-xs font-bold text-slate-400 capitalize hover:text-[#e98571] transition-colors py-2 flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-3 w-3 rotate-180" /> Search Another ID
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="group relative">
                      <input 
                        placeholder="REGISTRATION ID" 
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold focus:ring-2 focus:ring-[#e98571]/20 focus:border-[#e98571] outline-none transition-all"
                        value={searchReg} onChange={(e) => setSearchReg(e.target.value)}
                      />
                    </div>
                    <div className="group relative">
                      <input 
                        placeholder="MOBILE NUMBER" 
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold focus:ring-2 focus:ring-[#e98571]/20 focus:border-[#e98571] outline-none transition-all"
                        value={searchMobile} onChange={(e) => setSearchMobile(e.target.value)}
                      />
                    </div>
                    <button 
                      className="w-full bg-zinc-900 hover:bg-black text-white font-bold h-12 rounded-xl text-xs capitalize transition-all shadow-xl shadow-zinc-200 flex items-center justify-center gap-2 group disabled:opacity-70"
                      onClick={() => resultMutation.mutate({ regNumber: searchReg, mobileNumber: searchMobile })}
                      disabled={resultMutation.isPending}
                    >
                      {resultMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : (
                        <>Verify Status <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </Card>

            {/* LIVE NOTIFICATIONS */}
            <Card className="bg-slate-900 border-0 text-white">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h4 className="text-[10px] font-bold capitalize text-slate-400">Live Feed</h4>
                <div className="h-1.5 w-1.5 rounded-full bg-[#e98571] animate-pulse" />
              </div>
              <div className="divide-y divide-white/5">
                {competitions?.slice(0, 3).map((comp: any) => (
                  <Link 
                    to={`/competitions/${comp.slug}`} 
                    key={comp._id} 
                    className="block p-5 hover:bg-white/5 transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-200 group-hover:text-[#e98571] transition-colors uppercase truncate">
                      {comp.title}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                       <span className="text-[9px] text-slate-500 font-bold capitalize">Deadline: {format(new Date(comp.deadline), "MMM dd")}</span>
                       <span className="text-[10px] font-bold text-[#e98571] opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all capitalize">Enter →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </aside>

          {/* MAIN GRID: Competitions */}
          <main className="flex-1 order-2 lg:order-1">
            <div className="flex items-center justify-between mb-6 px-1">
               <h3 className="text-sm font-bold text-slate-400 capitalize flex items-center gap-2">
                 <LayoutGrid className="h-4 w-4" /> Open Challenges
               </h3>
               <span className="text-[10px] font-bold text-slate-400">{competitions?.length} Programs</span>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                   <div key={i} className="h-[220px] rounded-2xl bg-slate-200 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {competitions?.map((comp: any) => (
                  <Card key={comp._id} className="group hover:border-[#e98571]/40 hover:shadow-2xl transition-all duration-500 bg-white relative">
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <Badge variant="warning">Ongoing</Badge>
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                              <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                                 <User className="h-3 w-3 text-slate-300" />
                              </div>
                           ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-xl font-bold text-zinc-900 leading-tight capitalize group-hover:text-[#e98571] transition-colors">
                          {comp.title}
                        </h2>
                        <p className="text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed">
                          {comp.introduction}
                        </p>
                      </div>

                      <div className="pt-6 flex items-center justify-between border-t border-slate-50">
                        <div className="flex items-center gap-2">
                           <Calendar className="h-3.5 w-3.5 text-slate-300" />
                           <span className="text-[10px] font-bold capitalize text-slate-400">
                             Ends {format(new Date(comp.deadline), "MMM dd, yyyy")}
                           </span>
                        </div>
                        <Link to={`/competitions/${comp.slug}`}>
                          <button className="text-[10px] font-bold bg-zinc-900 text-white px-5 py-2.5 rounded-lg hover:bg-[#e98571] transition-all capitalize shadow-lg shadow-zinc-100 group-hover:scale-105 active:scale-95">
                            Register
                          </button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* LUXURY SUCCESS MODAL */}
      {registrationSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-500">
          <Card className="max-w-sm w-full shadow-3xl border-0 rounded-[2rem] overflow-hidden bg-white scale-up-center">
            <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500 w-full" />
            <div className="p-10 text-center">
              <div className="mx-auto h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 border border-emerald-100 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 capitalize mb-2">Success!</h3>
              <p className="text-xs text-slate-500 font-medium mb-8">Your registration is complete. Welcome to the challenge.</p>
              
              <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                <p className="text-[10px] font-bold text-slate-400 capitalize mb-3">Registration ID</p>
                <span className="text-2xl font-mono font-bold text-[#e98571] block">
                  {registrationSuccess}
                </span>
                <div className="absolute -top-2 -right-2 bg-zinc-900 text-white p-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   <LayoutGrid className="h-3 w-3" />
                </div>
              </div>

              <button 
                onClick={() => setRegistrationSuccess(null)} 
                className="w-full bg-zinc-900 hover:bg-black text-white font-bold py-4 rounded-2xl text-xs capitalize transition-all shadow-xl shadow-zinc-200"
              >
                Enter Portal
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CompetitionHub;