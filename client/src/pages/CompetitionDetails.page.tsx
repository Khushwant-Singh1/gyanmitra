import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  Trophy, Calendar, Upload, Grid, ChevronLeft, Loader2, LayoutGrid, Mail, Phone, Info, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const CompetitionDetails = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  // 1. Fetch Current Competition Data
  const { data: comp, isLoading } = useQuery({
    queryKey: ['competition', slug],
    queryFn: async () => {
      const res = await axios.get(`/api/competition/slug/${slug}`);
      return res.data.data;
    },
    enabled: !!slug
  });

  // 2. Fetch All Competitions for Recent Bar
  const { data: allCompetitions } = useQuery({
    queryKey: ['live-competitions'],
    queryFn: async () => {
      const res = await axios.get('/api/competition/all');
      return res.data.data;
    }
  });

  // 3. Filter Recent Competitions (Excluding current, max 4)
  const recentComps = allCompetitions
    ?.filter((c: any) => c.slug !== slug)
    ?.slice(0, 4);

  // 4. Registration Mutation
  const registerMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post('/api/competition/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: (res) => {
      toast.success("Registration Successful!");
      navigate('/competitions', { state: { regNumber: res.data.regNumber } }); 
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!comp?._id) return toast.error("Data loading...");
    const formData = new FormData(e.currentTarget);
    formData.append('competitionId', comp._id);
    if (file) {
      formData.append('uploadFile', file); 
    } else {
      return toast.error("Please upload your project PDF");
    }
    registerMutation.mutate(formData);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-[#fcfcfc]"><Loader2 className="animate-spin text-[#e98571]" /></div>;
  if (!comp) return <div className="text-center py-20 font-black text-slate-400 uppercase tracking-widest">Competition Not Found</div>;

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 font-sans antialiased pb-12 overflow-x-hidden">
      
      {/* 1. TOP RECENT COMPETITIONS BAR */}
      {recentComps && recentComps.length > 0 && (
        <div className="bg-white border-b border-slate-100 py-3 mb-6">
         <div className="max-w-[95%] mx-auto px-4 flex items-center gap-4 overflow-x-auto no-scrollbar">
  {/* 1. ALL HUBS BUTTON: Wapas main list par jaane ke liye */}
  <Link 
    to="/competitions" 
    className="shrink-0 flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-full text-white hover:bg-[#e98571] transition-all shadow-md active:scale-95 group"
  >
    <Grid className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-300" />
    <span className="text-[10px] font-bold capitalize">All Hubs</span>
  </Link>

  {/* Visual Separator */}
  <div className="h-5 w-[1px] bg-slate-200 shrink-0 mx-1" />

  {/* 2. RECENT HUB LABEL */}
  <div className="flex items-center gap-1.5 shrink-0 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
    <Zap className="h-3.5 w-3.5 text-[#e98571] fill-[#e98571]" />
    <span className="text-[10px] font-bold capitalize text-[#e98571]">Recent Hubs</span>
  </div>

  {/* 3. DYNAMIC RECENT COMPETITIONS */}
  {recentComps?.map((item: any) => (
    <Link 
      key={item._id} 
      to={`/competitions/${item.slug}`}
      className="shrink-0 flex items-center gap-2 px-4 py-1.5 hover:bg-white hover:shadow-sm rounded-xl transition-all border border-transparent hover:border-slate-100 group"
    >
      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-[10px] font-bold text-slate-500 group-hover:text-zinc-900 capitalize truncate max-w-[120px]">
        {item.title}
      </span>
    </Link>
  ))}
</div>
        </div>
      )}

      <div className="max-w-10xl mx-auto px-4 py-2">
        
        {/* HEADER SECTION */}
        <div className="mb-10 space-y-4">
          <button 
            onClick={() => navigate('/competitions')} 
            className="flex items-center gap-1 text-[10px] font-black text-slate-400 hover:text-[#e98571] transition-all uppercase tracking-widest"
          >
            <ChevronLeft className="h-3 w-3" /> Back to Portal
          </button>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#e98571] font-bold">
                <Trophy className="h-4 w-4" />
                <span className="text-[10px] capitalize">Official Entry</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-zinc-900 capitalize leading-tight break-words">
                {comp.title}
              </h1>
            </div>
            <Badge variant="outline" className="border-[#e98571] text-[#e98571] font-bold py-1.5 px-5 text-[10px] capitalize bg-orange-50/50 w-fit">
              Registration Active
            </Badge>
          </div>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          
          {/* SIDEBAR: Registration Form */}
          <aside className="w-full lg:w-[420px] order-1 lg:order-2 shrink-0">
            <div className="bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800 ring-1 ring-white/5 w-full">
              <div className="h-1.5 bg-[#e98571] w-full" />
              <div className="p-6 md:p-8">
                <div className="mb-8 space-y-1">
                  <h2 className="text-2xl font-bold text-white capitalize">Register Entry</h2>
                  <p className="text-[10px] text-zinc-500 font-bold capitalize">Application Form</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 w-full">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">Full Student Name</Label>
                    <Input name="fullName" required className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold capitalize focus:ring-1 focus:ring-[#e98571] w-full" placeholder="Enter Full Name" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">Institute Name</Label>
                    <Input name="schoolCollege" required className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold capitalize focus:ring-1 focus:ring-[#e98571] w-full" placeholder="School / College" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">Email ID</Label>
                      <Input name="emailId" type="email" required className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold focus:ring-1 focus:ring-[#e98571] w-full" placeholder="mail@example.com" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">WhatsApp No.</Label>
                      <Input name="mobileNumber" required className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold focus:ring-1 focus:ring-[#e98571] w-full" placeholder="Mobile" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">Complete Address</Label>
                    <Input name="address" required className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold capitalize focus:ring-1 focus:ring-[#e98571] w-full" placeholder="City, State, Pincode" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">Brief</Label>
                    <Textarea name="answer" className="bg-zinc-800/40 border-zinc-700 h-24 text-white text-[11px] font-medium resize-none focus:ring-1 focus:ring-[#e98571] w-full" placeholder="Explain your entry..." />
                  </div>

                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">Project (PDF)</Label>
                    <div className="relative group border-2 border-dashed border-zinc-700 rounded-xl p-5 text-center hover:border-[#e98571] transition-all cursor-pointer bg-zinc-800/20">
                      <input type="file" accept=".pdf" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                      <Upload className="mx-auto h-5 w-5 text-zinc-600 group-hover:text-[#e98571] mb-2" />
                      <p className="text-[9px] font-bold text-zinc-500 capitalize truncate px-2">{file ? <span className="text-emerald-400">{file.name}</span> : "Upload PDF (10MB Max)"}</p>
                    </div>
                  </div>

                  <Button type="submit" disabled={registerMutation.isPending} className="w-full bg-[#e98571] hover:bg-white hover:text-black text-white font-bold h-14 mt-4 text-[11px] capitalize shadow-xl active:scale-95 transition-all rounded-xl">
                    {registerMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify & Submit Entry"}
                  </Button>
                </form>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT Area */}
          <main className="flex-1 order-2 lg:order-1 space-y-6 w-full min-w-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-10 space-y-10 shadow-sm w-full">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-8 border-b border-slate-100">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-400 capitalize flex items-center gap-1.5 whitespace-nowrap"><Calendar className="h-3.5 w-3.5 text-[#e98571]" /> Start Date</p>
                  <p className="text-[13px] font-bold text-slate-800 capitalize">{format(new Date(comp.startDate), "dd MMM, yyyy")}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-red-400 capitalize flex items-center gap-1.5 whitespace-nowrap"><Calendar className="h-3.5 w-3.5" /> Deadline</p>
                  <p className="text-[13px] font-bold text-red-600 capitalize">{format(new Date(comp.deadline), "dd MMM, yyyy")}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-indigo-400 capitalize flex items-center gap-1.5 whitespace-nowrap"><Trophy className="h-3.5 w-3.5" /> Results</p>
                  <p className="text-[13px] font-bold text-indigo-600 capitalize">{format(new Date(comp.resultDate), "dd MMM, yyyy")}</p>
                </div>
              </div>

              <section className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 capitalize flex items-center gap-2"><Info className="h-4 w-4 text-[#e98571]" /> Overview</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium break-words">{comp.introduction}</p>
              </section>

              <section className="space-y-4 pt-4 border-t border-slate-50">
                <h3 className="text-sm font-bold text-slate-900 capitalize flex items-center gap-2"><LayoutGrid className="h-4 w-4 text-[#e98571]" /> Rules</h3>
                <div className="text-sm text-slate-600 leading-relaxed font-medium prose prose-slate max-w-full prose-sm list-disc marker:text-[#e98571] overflow-hidden break-words" dangerouslySetInnerHTML={{ __html: comp.howToParticipate }} />
              </section>
            </div>

            {/* CONTACT CARD */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full overflow-hidden">
              <div className="space-y-1 shrink-0">
                <h4 className="text-[10px] font-bold text-slate-400 capitalize">Coordinator</h4>
                <p className="text-sm font-bold text-slate-800 capitalize">{comp.contactName}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 overflow-hidden">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-indigo-50 rounded-lg shrink-0"><Mail className="h-3.5 w-3.5 text-[#e98571]" /></div>
                  <p className="text-xs font-black text-slate-500 truncate">{comp.contactEmail}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="p-2 bg-emerald-50 rounded-lg shrink-0"><Phone className="h-3.5 w-3.5 text-emerald-600" /></div>
                  <p className="text-xs font-black text-slate-500">{comp.contactPhone}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetails;