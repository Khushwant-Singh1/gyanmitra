import React, { useState, lazy, Suspense } from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import axios from 'axios'; // Added missing import

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; 
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { IApiResponse } from '@/api/client.api';

// Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faPlus,faFilePdf,faMapMarkerAlt, faSearch, faChevronLeft, faChevronRight, faLayerGroup, faUser, faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';

// Dynamic import for React Quill to prevent SSR issues
const ReactQuill = lazy(() => import('react-quill-new'));
import 'react-quill-new/dist/quill.snow.css';

const CompetitionAdmin: React.FC = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [openResultModal, setOpenResultModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState<any>(null);
  
  // Form States - Added missing states to resolve "Cannot find name" errors
  const [compTitle, setCompTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [howToParticipate, setHowToParticipate] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [deadline, setDeadline] = useState<Date>();
  const [resultDate, setResultDate] = useState<Date>();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
const [idToDelete, setIdToDelete] = useState<string | null>(null);
  // Result Management States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  // Fetch Competitions
  const { data: competitionsData, isLoading: isCompsLoading } = useQuery<IApiResponse<any[]>>({
    queryKey: ['competitions'],
    queryFn: async () => {
      const response = await axios.get<IApiResponse<any[]>>('/api/competition/all');
      return response.data;
    },
  });

  const competitions = competitionsData?.data || [];

// Fetch Participants
const { data: participantsData, refetch: refetchParticipants } = useQuery({
  queryKey: ['participants', selectedComp?._id],
  queryFn: async () => {
    const res = await axios.get(`/api/competition/participants/${selectedComp?._id}`);
    return res.data;
  },
  enabled: !!selectedComp?._id, // Sirf tabhi fetch hoga jab modal khulega
});

  const participants = participantsData?.data || [];

  const filteredData = participants.filter((p: any) => 
    p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.schoolCollege?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedData.map((p: any) => p._id);
      setSelectedParticipants(prev => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIds = paginatedData.map((p: any) => p._id);
      setSelectedParticipants(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const toggleParticipant = (id: string) => {
    setSelectedParticipants(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

const deleteMutation = useMutation({
  mutationFn: async (id: string) => {
    const response = await axios.delete(`/api/competition/${id}`);
    return response.data;
  },
  onSuccess: () => {
    toast.success('Competition deleted successfully');
    queryClient.invalidateQueries({ queryKey: ['competitions'] });
  },
  onError: () => toast.error('Failed to delete competition')
});
   
const [bulkStatus, setBulkStatus] = useState<'pass' | 'fail' | 'pending'>('pending');

// 1. Bulk Status Update Mutation
const bulkUpdateMutation = useMutation({
  mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
    const response = await axios.patch('/api/competition/update-results', {
      participantIds: ids,
      status: status
    });
    return response.data;
  },
  onSuccess: () => {
    // TypeScript warning fix: Yahan refetchParticipants ki jagah query invalidate karein
    queryClient.invalidateQueries({ queryKey: ['participants'] }); 
    toast.success("Status updated successfully!");
    setSelectedParticipants([]);
  },
  onError: (err: any) => toast.error(err.response?.data?.message || "Update failed")
});

// 2. Individual Status Change Handler
const updateIndividualStatus = (id: string, newStatus: string) => {
  bulkUpdateMutation.mutate({ ids: [id], status: newStatus });
};

// 3. Bulk Action Trigger
const applyBulkAction = () => {
  if (!bulkStatus || selectedParticipants.length === 0) {
    toast.error("Please select students and a status");
    return;
  }
  bulkUpdateMutation.mutate({ ids: selectedParticipants, status: bulkStatus });
};

// 4. Save All Button Logic (ReferenceError fix)
// handleSaveAll function ko aise update karein taaki refetch use ho sake
const handleSaveAll = () => {
  refetchParticipants(); // Data refresh karne ke liye
  toast.success("All changes have been synchronized with the database.");
  setOpenResultModal(false);
};

// 5. Rank Update Helper
const updateRank = async (participantId: string, newRank: string) => {
  try {
    // Backend router ke mutabik URL fix kiya gaya:
    await axios.patch(`/api/competition/participant/${participantId}/rank`, { rank: newRank });
    toast.success("Rank updated successfully");
  } catch (error) {
    toast.error("Failed to update rank");
    console.error("Rank update error");
  }
};

const publishMutation = useMutation({
  mutationFn: async (payload: any) => {
    // Agar selectedComp._id hai, toh iska matlab hum update kar rahe hain
    if (selectedComp?._id) {
      const response = await axios.patch(`/api/competition/${selectedComp._id}`, payload);
      return response.data;
    } else {
      // Agar _id nahi hai, toh naya competition create ho raha hai
      const response = await axios.post('/api/competition/create', payload);
      return response.data;
    }
  },
  onSuccess: () => {
    // Dynamic toast message
    toast.success(selectedComp ? 'Competition Updated!' : 'Competition Published!');
    
    setOpenSidebar(false);
    queryClient.invalidateQueries({ queryKey: ['competitions'] });

    // Form states ko reset karein
    setCompTitle('');
    setSlug('');
    setIntroduction('');
    setHowToParticipate('');
    setStartDate(undefined);
    setDeadline(undefined);
    setResultDate(undefined);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setSelectedComp(null); // Reset selection zaroori hai
  },
  onError: (error: any) => {
    let msg = isAxiosError(error) ? error.response?.data?.message : "Operation failed";
    toast.error(msg);
  }
});

  const handlePublish = () => {
    publishMutation.mutate({
      title: compTitle, 
      slug, 
      introduction, 
      howToParticipate,
      startDate, 
      deadline, 
      resultDate,
      contactName, 
      contactEmail, 
      contactPhone
    });
  };

 const DatePicker = ({ date, setDate, label }: any) => (
  <div className="flex-1 min-w-[140px] space-y-2">
    <Label className="font-bold text-zinc-800 text-sm">{label}</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "w-full justify-start text-left font-normal h-11 border-zinc-200 shadow-sm px-3",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">{date ? format(date, "PPP") : "Pick date"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar 
          mode="single" 
          selected={date} 
          onSelect={setDate} // Ye prop sahi hona chahiye
          initialFocus 
        />
      </PopoverContent>
    </Popover>
  </div>
);

  const quillModules = {
    toolbar: [
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline'],
      ['clean']
    ],
  };

  return (
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-1xl md:text-1xl font-bold tracking-tight text-zinc-900">Competition Hub</h1>
          <p className="text-xs md:text-sm text-zinc-500">Manage registration, submissions, and results.</p>
        </div>
        <Button className="w-full sm:w-auto bg-zinc-900 text-white hover:bg-zinc-800 shadow-md transition-all" onClick={() => { setSelectedComp(null); setOpenSidebar(true); }}>
          <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create Competition
        </Button>
      </div>

      <Card className="shadow-sm border-zinc-200 overflow-hidden">
        <CardHeader className="border-b bg-white">
          <CardTitle className="text-1xl ">
            {isCompsLoading ? "Loading..." : "Active Competitions"}
          </CardTitle>
        </CardHeader>
     <CardContent className="p-0 md:p-6">
  {/* Desktop View: Visible on md and up */}
  <div className="hidden md:block">
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent bg-slate-50/50">
          <TableHead className="font-bold text-zinc-700">Title & Slug</TableHead>
          <TableHead className="font-bold text-zinc-700">Status</TableHead>
          <TableHead className="text-right font-bold text-zinc-700">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {competitions.map((comp: any) => (
          <TableRow key={comp._id} className="hover:bg-slate-50/50 transition-colors">
            <TableCell>
              <div className="font-bold text-zinc-900">{comp.title}</div>
              <div className="text-[11px] text-blue-600 font-semibold mt-0.5">/{comp.slug}</div>
            </TableCell>
            <TableCell><Badge className="bg-emerald-600 text-white hover:bg-emerald-600 px-3 border-none">{comp.status}</Badge></TableCell>
            <TableCell className="text-right space-x-2">
             <Button 
  variant="outline" 
  size="sm" 
  className="h-8 text-xs border-zinc-300 hover:bg-zinc-50"
  onClick={() => { 
    setSelectedComp(comp); 
    setCompTitle(comp.title);
    setSlug(comp.slug);
    setIntroduction(comp.introduction);
    setHowToParticipate(comp.howToParticipate);
    setStartDate(new Date(comp.startDate));
    setDeadline(new Date(comp.deadline));
    setResultDate(new Date(comp.resultDate));
    setContactName(comp.contactName);
    setContactEmail(comp.contactEmail);
    setContactPhone(comp.contactPhone);
    setOpenSidebar(true); 
  }}
>
  Edit Setup
</Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="bg-red-50 text-red-600"
                onClick={() => setIdToDelete(comp._id)}
              >
                Delete
              </Button>
              <Button 
                size="sm" 
                className="h-8 text-xs bg-[#e98571] text-white" 
                onClick={() => { setSelectedComp(comp); setOpenResultModal(true); }}
              >
                Manage Results
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>

  {/* Mobile View: Visible ONLY on small screens */}
  <div className="md:hidden divide-y divide-zinc-100">
    {competitions.map((comp: any) => (
      <div key={comp._id} className="p-4 space-y-4 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-bold text-zinc-900 text-sm">{comp.title}</div>
            <div className="text-[10px] text-blue-600 font-semibold">/{comp.slug}</div>
          </div>
          <Badge className="bg-emerald-600 text-white text-[10px]">{comp.status}</Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-[11px] h-9"
            onClick={() => {
              setSelectedComp(comp); 
              setCompTitle(comp.title);
              setSlug(comp.slug);
              setIntroduction(comp.introduction);
              setHowToParticipate(comp.howToParticipate);
              setStartDate(new Date(comp.startDate));
              setDeadline(new Date(comp.deadline));
              setResultDate(new Date(comp.resultDate));
              setContactName(comp.contactName);
              setContactEmail(comp.contactEmail);
              setContactPhone(comp.contactPhone);
              setOpenSidebar(true); 
            }}
          >
            Edit Setup
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full text-[11px] h-9 bg-red-50 text-red-600"
            onClick={() => setIdToDelete(comp._id)}
          >
            Delete
          </Button>
          <Button 
            size="sm" 
            className="w-full col-span-2 text-[11px] h-9 bg-[#e98571] text-white font-bold" 
            onClick={() => { setSelectedComp(comp); setOpenResultModal(true); }}
          >
            Manage Results
          </Button>
        </div>
      </div>
    ))}
    {competitions.length === 0 && (
      <div className="p-8 text-center text-zinc-500 text-sm">No competitions found.</div>
    )}
  </div>
</CardContent>
      </Card>

      <Sheet open={openSidebar} onOpenChange={setOpenSidebar}>
        <SheetContent side="right" className="w-full md:w-[700px] lg:w-[750px] transition-all duration-300 h-screen overflow-y-auto border-l shadow-2xl p-4 sm:p-6 md:p-8 bg-white flex flex-col">
          <SheetHeader className="border-b pb-5 sm:pb-6 mb-6 sm:mb-8">
            <SheetTitle className=" text-lg">
              {selectedComp ? 'Update Competition' : 'New Competition Hub'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-6 sm:space-y-8 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="font-bold text-zinc-700">Competition Title</Label>
                <Input value={compTitle} onChange={(e) => setCompTitle(e.target.value)} placeholder="e.g. Science Fair 2026" className="h-11 border-zinc-300" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-zinc-700">URL Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="science-fair-2026" className="h-11 border-zinc-300" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-zinc-700">Introduction</Label>
              <Textarea value={introduction} onChange={(e) => setIntroduction(e.target.value)} placeholder="Brief summary for participants..." className="min-h-[110px] border-zinc-300 resize-none" />
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-zinc-700">How to Participate</Label>
              <div className="border border-zinc-300 bg-white overflow-hidden">
                <Suspense fallback={<div className="h-full w-full bg-slate-100 animate-pulse" />}>
                  <ReactQuill theme="snow" value={howToParticipate} onChange={setHowToParticipate} modules={quillModules} className="min-h-50px h-60" />
                </Suspense>
              </div>
            </div>

            <div className="border border-zinc-900 bg-white p-6">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Start Date - Works fine */}
    <DatePicker
      label="Start Date"
      date={startDate}
      setDate={setStartDate}
    />
    
    {/* Deadline - Fixed setter mapping */}
    <DatePicker
      label="Deadline"
      date={deadline}
      setDate={setDeadline} 
    />
    
    {/* Results - Fixed setter mapping */}
    <DatePicker
      label="Results"
      date={resultDate}
      setDate={setResultDate} 
    />
  </div>
</div>

            <div className="space-y-5 p-5 border border-zinc-200 bg-slate-50">
              <div className="flex items-center gap-2 text-zinc-900 font-black text-xs sm:text-sm uppercase tracking-wider">
                <FontAwesomeIcon icon={faUser} className="text-[#e98571]" /> Person of Contact
              </div>
              <div className="space-y-2"><Label className="font-bold text-xs text-zinc-600">Full Name</Label><Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Enter contact name" className="h-11 bg-white border-zinc-300" /></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="font-bold text-xs text-zinc-600"><FontAwesomeIcon icon={faEnvelope} className="text-[10px]" /> Email Address</Label><Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} type="email" placeholder="contact@example.com" className="h-11 bg-white border-zinc-300" /></div>
                <div className="space-y-2"><Label className="font-bold text-xs text-zinc-600"><FontAwesomeIcon icon={faPhone} className="text-[10px]" /> Phone Number</Label><Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+91 00000 00000" className="h-11 bg-white border-zinc-300" /></div>
              </div>
            </div>

            <Button disabled={publishMutation.isPending} onClick={handlePublish} className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-12 sm:h-14 text-base sm:text-lg font-black shadow-xl mt-4 transition-all">
              {publishMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : (selectedComp ? 'Update Details' : 'Publish Competition Hub')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

   <Dialog open={openResultModal} onOpenChange={setOpenResultModal}>
  <DialogContent className="max-w-[100vw] md:max-w-[95vw] w-full md:w-[1200px] h-full md:h-auto md:max-h-[95vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl text-zinc-900">
    <DialogHeader className="p-4 md:p-6 border-b bg-white">
      <div className="flex flex-col gap-4">
        <DialogTitle className="flex items-center gap-2 text-xl font-black">
          <FontAwesomeIcon icon={faTrophy} className="text-[#e98571]" /> 
          Competition Results: <span className="text-zinc-500 font-medium">Manage Participants</span>
        </DialogTitle>
        <div className="relative w-full">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
          <Input 
            placeholder="Search by name, reg number or mobile..." 
            className="pl-9 h-10 w-full border-input bg-slate-50 focus:ring-[#e98571]" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>
    </DialogHeader>

    {/* Bulk Actions Bar */}
    {selectedParticipants.length > 0 && (
      <div className="bg-[#e98571] text-white px-4 md:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-300">
        <div className="flex items-center gap-2 text-sm font-black">
          <FontAwesomeIcon icon={faLayerGroup} />
          <span>{selectedParticipants.length} Participants Selected</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={bulkStatus} onValueChange={(value: any) => setBulkStatus(value)}>
            <SelectTrigger className="flex-1 sm:w-40 h-9 bg-white text-black border-none text-xs font-bold shadow-sm">
              <SelectValue placeholder="Change Status To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pass" className="text-green-600 font-bold uppercase">Set as PASSED</SelectItem>
              <SelectItem value="fail" className="text-red-600 font-bold uppercase">Set as FAILED</SelectItem>
              <SelectItem value="pending" className="text-zinc-500 font-bold uppercase">Set as PENDING</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            size="sm" 
            className="bg-zinc-900 text-white h-9 px-6 font-black hover:bg-zinc-800 transition-all active:scale-95"
            onClick={applyBulkAction}
          >
            APPLY BULK
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-9 text-white font-bold px-2 hover:bg-white/10" 
            onClick={() => setSelectedParticipants([])}
          >
            Deselect
          </Button>
        </div>
      </div>
    )}

    <div className="flex-1 overflow-x-auto px-0 md:px-6 py-2 bg-white">
  <div className="min-w-[800px]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b-2">
            <TableHead className="w-12">
              <Checkbox 
                checked={paginatedData.length > 0 && paginatedData.every((p: any) => selectedParticipants.includes(p._id))}
                onCheckedChange={(checked) => handleSelectAll(!!checked)}
              />
            </TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-wider text-zinc-400">Student Info</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-wider text-zinc-400">School & Contact</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-wider text-zinc-400">Submission</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-wider text-zinc-400">Action: Status</TableHead>
            <TableHead className="font-black text-[10px] uppercase tracking-wider text-zinc-400">Rank & Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((p: any) => (
            <TableRow key={p._id} className={cn("transition-colors", selectedParticipants.includes(p._id) ? "bg-slate-50/80" : "hover:bg-zinc-50/50")}>
              <TableCell>
                <Checkbox checked={selectedParticipants.includes(p._id)} onCheckedChange={() => toggleParticipant(p._id)}/>
              </TableCell>
              
              <TableCell>
                <div className="font-black text-zinc-900 leading-tight text-sm uppercase">{p.fullName}</div>
                <div className="text-[10px] font-mono text-blue-600 font-black mt-1 tracking-tighter bg-blue-50 w-max px-1.5 rounded">
                  {p.regNumber || "NO-ID"}
                </div>
              </TableCell>

              <TableCell>
                <div className="text-xs font-bold text-zinc-700 truncate max-w-[140px]" title={p.schoolCollege}>
                  {p.schoolCollege}
                </div>
                <div className="flex flex-col gap-0.5 mt-1 text-[10px] text-zinc-400 font-medium">
                  <span className="flex items-center gap-1"><FontAwesomeIcon icon={faEnvelope} className="text-[8px]" /> {p.emailId}</span>
                  <span className="flex items-center gap-1"><FontAwesomeIcon icon={faPhone} className="text-[8px]" /> {p.mobileNumber}</span>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex flex-col gap-2">
                  {/* File Handling Sync with Multer/Schema */}
                  {p.uploadFileUrl ? (
                    <a 
                      href={p.uploadFileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded w-max font-black flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
                    >
                      <FontAwesomeIcon icon={faFilePdf} /> PDF SUBMISSION
                    </a>
                  ) : (
                    <span className="text-[10px] font-bold text-zinc-300 uppercase">No Document</span>
                  )}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="text-[9px] font-black text-zinc-500 underline hover:text-zinc-900 uppercase tracking-tighter">
                        Check Written Answer
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px] rounded-3xl p-8">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight">Student Submission: {p.fullName}</DialogTitle>
                        <p className="text-xs text-zinc-400 font-medium">Original answer provided during registration</p>
                      </DialogHeader>
                      <div className="mt-6 p-6 bg-zinc-50 rounded-2xl text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap max-h-[450px] overflow-y-auto border border-zinc-100 font-medium">
                        {p.answer || "No textual answer was provided by the student."}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>

             <TableCell>
  {/* Individual Status Update Sync */}
  <Select 
    defaultValue={p.status} 
    onValueChange={(val) => updateIndividualStatus(p._id, val)} // Yahan use karein
  >
    <SelectTrigger className={cn(
      "h-9 text-[10px] font-black uppercase tracking-wider transition-all",
      p.status === 'pass' && "border-green-500 bg-green-50 text-green-700",
      p.status === 'fail' && "border-red-500 bg-red-50 text-red-700",
      p.status === 'pending' && "border-zinc-200 bg-zinc-50 text-zinc-400"
    )}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent className="font-bold uppercase text-[10px]">
      <SelectItem value="pending">Pending</SelectItem>
      <SelectItem value="pass" className="text-green-600">Passed</SelectItem>
      <SelectItem value="fail" className="text-red-600">Failed</SelectItem>
    </SelectContent>
  </Select>
</TableCell>

              <TableCell>
                <div className="space-y-1.5">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-zinc-300">#</span>
                    <Input 
                      className="h-8 text-[11px] font-black border-zinc-200 text-zinc-900 w-24 pl-4 focus:ring-[#e98571]" 
                      placeholder="Rank" 
                      defaultValue={p.rank}
                      onBlur={(e) => updateRank(p._id, e.target.value)}
                    />
                  </div>
                  {/* Address Display */}
                 <div 
      className="text-[10px] text-zinc-500 font-bold leading-tight max-w-[150px] whitespace-normal break-words " 
      title={p.address}
    >
      <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-1 text-[#e98571] opacity-70" />
      {p.address || "No Address Provided"}
    </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>

    <div className="p-4 border-t flex flex-col gap-4 bg-zinc-50/50">
      <div className="flex items-center justify-between">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Records {((currentPage-1)*10)+1} - {Math.min(currentPage*10, participants.length)} of {participants.length}
          </div>
          <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setOpenResultModal(false)} size="sm" className="h-9 font-bold text-zinc-500 hover:text-zinc-900">Close</Button>
              <Button 
                onClick={handleSaveAll} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-8 font-black shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                SAVE ALL CHANGES
              </Button>
          </div>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-1 md:gap-2">
        <Button variant="outline" size="sm" className="h-8 w-8 md:w-auto p-0 md:px-4 border-zinc-200" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          <FontAwesomeIcon icon={faChevronLeft} className="md:mr-2 h-3" /> <span className="hidden md:inline font-bold">Prev</span>
        </Button>
        <div className="flex gap-1">
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentPage(i + 1)}
              className={cn("h-8 w-8 rounded-md text-[10px] font-black transition-all", currentPage === i + 1 ? "bg-[#e98571] text-white shadow-md shadow-[#e98571]/30" : "bg-white border text-zinc-400 hover:border-zinc-300")}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" className="h-8 w-8 md:w-auto p-0 md:px-4 border-zinc-200" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          <span className="hidden md:inline font-bold text-xs">Next</span> <FontAwesomeIcon icon={faChevronRight} className="md:ml-2 h-3" />
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

                      <AlertDialog open={!!idToDelete} onOpenChange={() => setIdToDelete(null)}>
  <AlertDialogContent className="bg-white border-none shadow-2xl">
    <AlertDialogHeader>
      <AlertDialogTitle className="text-xl font-bold text-zinc-900">
        Confirm Deletion
      </AlertDialogTitle>
      <AlertDialogDescription className="text-zinc-500">
       Are you sure you want to delete this competition? All associated student data will be permanently removed.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter className="mt-4">
      <AlertDialogCancel className="border-zinc-200">Cancel</AlertDialogCancel>
      <AlertDialogAction 
        className="bg-red-600 text-white hover:bg-red-700"
        onClick={() => {
          if (idToDelete) {
            deleteMutation.mutate(idToDelete);
            setIdToDelete(null);
          }
        }}
      >
        Yes, Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>


    </div>
  );
  
};

export default CompetitionAdmin;