'use client';

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  Trophy, Calendar, Upload, Grid, ChevronLeft, Loader2, LayoutGrid, Mail, Phone, Info, Zap,
  ArrowRight, ArrowLeft, FileText, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CompetitionDetails = () => {
  const { slug } = useParams(); 
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formDataState, setFormDataState] = useState({
    fullName: '',
    schoolCollege: '',
    classRollNo: '',
    address: '',
    emailId: '',
    mobileNumber: '',
    answer: '',
  });

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

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formDataState.fullName.trim()) {
      toast.error("Please enter student name");
      return;
    }
    if (!formDataState.schoolCollege.trim()) {
      toast.error("Please enter institute name");
      return;
    }
    if (!formDataState.address.trim()) {
      toast.error("Please enter complete address");
      return;
    }
    setCurrentStep(2);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comp?._id) return toast.error("Data loading...");
    if (!formDataState.fullName.trim() || !formDataState.schoolCollege.trim() || !formDataState.address.trim()) {
      toast.error("Please complete student details in Step 1");
      setCurrentStep(1);
      return;
    }
    if (!formDataState.mobileNumber.trim()) {
      toast.error("Please enter mobile/WhatsApp number");
      return;
    }
    if (!formDataState.emailId.trim()) {
      toast.error("Please enter email address");
      return;
    }
    if (!file) {
      toast.error("Please upload your project PDF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File exceeds 10MB limit. Please compress your PDF.");
      return;
    }

    const data = new FormData();
    data.append('competitionId', comp._id);
    data.append('fullName', formDataState.fullName.trim());
    data.append('schoolCollege', formDataState.schoolCollege.trim());
    data.append('address', formDataState.address.trim());
    data.append('emailId', formDataState.emailId.trim());
    data.append('mobileNumber', formDataState.mobileNumber.trim());
    const answerText = formDataState.classRollNo
      ? `Class & Roll No: ${formDataState.classRollNo}\n\n${formDataState.answer}`.trim()
      : formDataState.answer.trim();
    data.append('answer', answerText);
    data.append('uploadFile', file);
    registerMutation.mutate(data);
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
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
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-[#e98571] text-[#e98571] font-bold py-1.5 px-4 text-[10px] capitalize bg-orange-50/50 w-fit">
                Registration Active
              </Badge>
              <a 
                href="#register" 
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#e98571] text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all"
              >
                Register Now ↓
              </a>
            </div>
          </div>
        </div>

        {/* MAIN LAYOUT GRID */}
        <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
          
          {/* SIDEBAR: Registration Form */}
          <aside id="register" className="w-full lg:w-[420px] order-2 lg:order-2 shrink-0 scroll-mt-20">
            <div className="bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800 ring-1 ring-white/5 w-full">
              <div className="h-1.5 bg-[#e98571] w-full" />
              <div className="p-6 md:p-8">
                {/* 2-Step Progress Stepper Header */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-white capitalize">Register Entry</h2>
                      <p className="text-[10px] text-zinc-400 font-bold capitalize">
                        {currentStep === 1 ? "Step 1: Student Details" : "Step 2: Submission & Contact"}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                      Step {currentStep} of 2
                    </span>
                  </div>

                  {/* 2-Step Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#e98571] to-orange-400 transition-all duration-300 rounded-full"
                        style={{ width: currentStep === 1 ? '50%' : '100%' }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className={cn(
                          "transition-colors text-left flex items-center gap-1",
                          currentStep === 1 ? "text-[#e98571]" : "text-emerald-400 hover:underline cursor-pointer"
                        )}
                      >
                        {currentStep === 2 ? "✓ 1. Student Details" : "1. Student Details"}
                      </button>
                      <span className={cn(currentStep === 2 ? "text-[#e98571]" : "text-zinc-500")}>
                        2. Submission &amp; Contact
                      </span>
                    </div>
                  </div>
                </div>

                {/* STEP 1: Student Details */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">
                        Full Student Name <span className="text-[#e98571]">*</span>
                      </Label>
                      <Input
                        name="fullName"
                        value={formDataState.fullName}
                        onChange={(e) => setFormDataState((prev) => ({ ...prev, fullName: e.target.value }))}
                        required
                        className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold capitalize focus:ring-1 focus:ring-[#e98571] w-full"
                        placeholder="Enter Student Full Name"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">
                        Institute Name <span className="text-[#e98571]">*</span>
                      </Label>
                      <Input
                        name="schoolCollege"
                        value={formDataState.schoolCollege}
                        onChange={(e) => setFormDataState((prev) => ({ ...prev, schoolCollege: e.target.value }))}
                        required
                        className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold capitalize focus:ring-1 focus:ring-[#e98571] w-full"
                        placeholder="School / College / Institute"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">
                        Class &amp; Roll No. (Optional)
                      </Label>
                      <Input
                        name="classRollNo"
                        value={formDataState.classRollNo}
                        onChange={(e) => setFormDataState((prev) => ({ ...prev, classRollNo: e.target.value }))}
                        className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold focus:ring-1 focus:ring-[#e98571] w-full"
                        placeholder="e.g. Class 12-B / Roll 42"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">
                        Complete Address <span className="text-[#e98571]">*</span>
                      </Label>
                      <Input
                        name="address"
                        value={formDataState.address}
                        onChange={(e) => setFormDataState((prev) => ({ ...prev, address: e.target.value }))}
                        required
                        className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold capitalize focus:ring-1 focus:ring-[#e98571] w-full"
                        placeholder="City, District, State, Pincode"
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full bg-[#e98571] hover:bg-[#d87460] text-white font-bold h-13 mt-4 text-xs capitalize shadow-xl active:scale-[0.99] transition-all rounded-xl flex items-center justify-center gap-2"
                    >
                      <span>Continue to Step 2: Submission</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* STEP 2: Submission & Contact */}
                {currentStep === 2 && (
                  <form onSubmit={handleFormSubmit} className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">
                          WhatsApp No. <span className="text-[#e98571]">*</span>
                        </Label>
                        <Input
                          name="mobileNumber"
                          type="tel"
                          value={formDataState.mobileNumber}
                          onChange={(e) => setFormDataState((prev) => ({ ...prev, mobileNumber: e.target.value }))}
                          required
                          className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold focus:ring-1 focus:ring-[#e98571] w-full"
                          placeholder="10-digit Mobile"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">
                          Email ID <span className="text-[#e98571]">*</span>
                        </Label>
                        <Input
                          name="emailId"
                          type="email"
                          value={formDataState.emailId}
                          onChange={(e) => setFormDataState((prev) => ({ ...prev, emailId: e.target.value }))}
                          required
                          className="bg-zinc-800/40 border-zinc-700 h-12 text-white text-xs font-bold focus:ring-1 focus:ring-[#e98571] w-full"
                          placeholder="mail@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">
                        Brief Explanation of Entry (Optional)
                      </Label>
                      <Textarea
                        name="answer"
                        value={formDataState.answer}
                        onChange={(e) => setFormDataState((prev) => ({ ...prev, answer: e.target.value }))}
                        className="bg-zinc-800/40 border-zinc-700 h-20 text-white text-[11px] font-medium resize-none focus:ring-1 focus:ring-[#e98571] w-full"
                        placeholder="Explain your project/solution in brief..."
                      />
                    </div>

                    {/* PDF Upload with Live File Size Meter */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-bold text-zinc-400 capitalize ml-1">
                          Project Submission (PDF) <span className="text-[#e98571]">*</span>
                        </Label>
                        <span className="text-[9px] text-zinc-500 font-mono">Max: 10 MB</span>
                      </div>

                      {file ? (
                        <div className="bg-zinc-800/60 border border-zinc-700/80 rounded-xl p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="h-4 w-4 text-[#e98571] shrink-0" />
                              <span className="font-bold text-white truncate text-xs">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFile(null)}
                              className="text-zinc-400 hover:text-red-400 text-xs px-1 font-bold cursor-pointer"
                              title="Remove PDF"
                            >
                              ✕
                            </button>
                          </div>

                          {/* File Size Meter */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-mono">
                              <span className={file.size > 10 * 1024 * 1024 ? "text-red-400 font-bold" : "text-zinc-300"}>
                                {(file.size / (1024 * 1024)).toFixed(2)} MB / 10.0 MB
                              </span>
                              <span className={file.size > 10 * 1024 * 1024 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                                {file.size > 10 * 1024 * 1024
                                  ? "Exceeds 10MB limit!"
                                  : `${Math.round((file.size / (10 * 1024 * 1024)) * 100)}% of limit`}
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-700/60 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all duration-300 rounded-full",
                                  file.size > 10 * 1024 * 1024 ? "bg-red-500" : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(100, (file.size / (10 * 1024 * 1024)) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group border-2 border-dashed border-zinc-700 rounded-xl p-5 text-center hover:border-[#e98571] transition-all cursor-pointer bg-zinc-800/20">
                          <input
                            type="file"
                            accept=".pdf,application/pdf"
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
                                  toast.error("Please upload a PDF file only");
                                  return;
                                }
                                if (f.size > 10 * 1024 * 1024) {
                                  toast.error("File size exceeds 10MB limit. Please compress your PDF.");
                                  return;
                                }
                                setFile(f);
                              }
                            }}
                          />
                          <Upload className="mx-auto h-5 w-5 text-zinc-500 group-hover:text-[#e98571] mb-2" />
                          <p className="text-xs font-bold text-zinc-300">Click or Drag &amp; Drop Project PDF</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">PDF format only • Max file size 10MB</p>
                        </div>
                      )}
                    </div>

                    {/* Stepper Navigation CTAs */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                        className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 h-13 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back</span>
                      </Button>
                      <Button
                        type="submit"
                        disabled={registerMutation.isPending || !file}
                        className="w-2/3 bg-[#e98571] hover:bg-white hover:text-black text-white font-bold h-13 text-xs capitalize shadow-xl active:scale-[0.99] transition-all rounded-xl"
                      >
                        {registerMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="animate-spin h-4 w-4" />
                            <span>Submitting...</span>
                          </div>
                        ) : (
                          "Verify & Submit Entry"
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT Area */}
          <main className="flex-1 order-1 lg:order-1 space-y-6 w-full min-w-0">
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