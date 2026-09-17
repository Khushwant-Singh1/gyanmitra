'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import {
  Camera,
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Shield,
  FileText,
  Save,
  Feather,
  BookOpen,
  Sparkles,
  ExternalLink,
  Loader2,
  Eye,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/Spinner.components';
import { USER_ROLE } from '@/constants/index.constants';
import type { IApiResponse, IApiCurrentUserSession, IApiUser } from '@/api/client.api';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const Profile: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch current session
  const { data: sessionData, isLoading, isError, error } = useQuery<IApiResponse<IApiCurrentUserSession>>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await axios.get<IApiResponse<IApiCurrentUserSession>>('/api/users/me');
      return res.data;
    },
    retry: 1,
  });

  const currentUser: IApiUser | undefined = sessionData?.data?.user;

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFirstName(currentUser.firstName || '');
      setLastName(currentUser.lastName || '');
      setPhone(currentUser.phone || '');
      setBio(currentUser.bio || '');
      setAvatarPreview(currentUser.avatar || null);
    }
  }, [currentUser]);

  // Mutation to update details
  const updateDetailsMutation = useMutation({
    mutationFn: async (payload: {
      firstName: string;
      lastName: string;
      phone: string;
      bio: string;
      avatar?: string;
    }) => {
      const res = await axios.patch<IApiResponse<{ user: IApiUser }>>('/api/users/profile', payload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Profile details saved successfully!');
      queryClient.setQueryData(
        ['me'],
        (old: IApiResponse<IApiCurrentUserSession> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              user: {
                ...old.data.user,
                ...data.data.user,
              },
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'names'] });
    },
    onError: (err) => {
      const message = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to update profile details.';
      toast.error(message);
    },
  });

  // Mutation to upload avatar
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await axios.post<IApiResponse<{ user: IApiUser; avatar: string }>>(
        '/api/users/profile/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('Profile picture updated successfully!');
      setAvatarPreview(data.data.avatar);
      queryClient.setQueryData(
        ['me'],
        (old: IApiResponse<IApiCurrentUserSession> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              user: {
                ...old.data.user,
                avatar: data.data.avatar,
              },
            },
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (err) => {
      const message = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to upload profile picture.';
      toast.error(message);
    },
  });

  // Handle avatar file selection
  const handleFileChange = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Invalid image type. Please select a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    // Client-side preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Trigger upload
    uploadAvatarMutation.mutate(file);
  };

  // Remove avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    updateDetailsMutation.mutate({
      firstName,
      lastName,
      phone,
      bio,
      avatar: '',
    });
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.warning('First name cannot be empty');
      return;
    }
    if (!lastName.trim()) {
      toast.warning('Last name cannot be empty');
      return;
    }

    updateDetailsMutation.mutate({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      avatar: avatarPreview || '',
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mb-3" />
        <h2 className="text-xl font-bold text-zinc-800">Unable to load profile</h2>
        <p className="text-sm text-zinc-500 mt-1 max-w-sm">
          Please make sure you are logged in with valid permissions to access this page.
        </p>
      </div>
    );
  }

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'GM';
  const roleBadgeStyle =
    currentUser.role === USER_ROLE.Reporter
      ? 'bg-sky-50 text-sky-800 border-sky-300'
      : currentUser.role === USER_ROLE.Editor
      ? 'bg-amber-50 text-amber-900 border-amber-300'
      : currentUser.role === USER_ROLE.Admin
      ? 'bg-purple-50 text-purple-900 border-purple-300'
      : 'bg-emerald-50 text-emerald-900 border-emerald-300';

  const roleLabel =
    currentUser.role === USER_ROLE.Reporter
      ? 'Reporter'
      : currentUser.role === USER_ROLE.Editor
      ? 'Editor'
      : currentUser.role === USER_ROLE.Admin
      ? 'Administrator'
      : 'Owner / Publisher';

  const isSaving = updateDetailsMutation.isPending || uploadAvatarMutation.isPending;

  return (
    <>
      <Helmet>
        <title>My Profile | Gyanmitra</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-6 pb-16">
        {/* TOP HERO PROFILE BANNER */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-zinc-900 to-stone-900 p-6 md:p-8 text-white shadow-xl border border-zinc-800">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-bl from-rose-500/20 to-orange-500/0 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-gradient-to-tr from-sky-500/20 to-emerald-500/0 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* AVATAR WITH QUICK UPLOAD BUTTON */}
            <div className="relative group shrink-0">
              <Avatar className="h-28 w-28 md:h-32 md:w-32 rounded-2xl border-4 border-white/20 shadow-2xl overflow-hidden ring-2 ring-white/10">
                {avatarPreview && (
                  <AvatarImage
                    src={avatarPreview}
                    alt={currentUser.firstName}
                    className="object-cover h-full w-full"
                  />
                )}
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-zinc-800 text-white font-extrabold text-3xl md:text-4xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSaving}
                className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold cursor-pointer backdrop-blur-xs gap-1"
                title="Change profile picture"
              >
                {uploadAvatarMutation.isPending ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <>
                    <Camera className="h-6 w-6" />
                    <span>Change</span>
                  </>
                )}
              </button>
            </div>

            {/* USER INFO */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight capitalize text-white">
                  {firstName || currentUser.firstName} {lastName || currentUser.lastName}
                </h1>
                <Badge variant="outline" className={`${roleBadgeStyle} text-xs font-bold px-2.5 py-0.5 rounded-full`}>
                  {roleLabel}
                </Badge>
              </div>

              <p className="text-sm text-zinc-300 flex items-center justify-center md:justify-start gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                {currentUser.email}
                {currentUser.isEmailVerified && (
                  <span className="inline-flex items-center gap-0.5 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </p>

              <p className="text-xs md:text-sm text-zinc-400 max-w-xl line-clamp-2">
                {bio || 'No author biography provided yet. Add your bio below to showcase your background on published articles.'}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN PROFILE BODY (GRID) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: EDIT DETAILS & AVATAR UPLOAD (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* AVATAR UPLOAD SECTION */}
            <Card className="border border-zinc-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
                  <Camera className="w-4 h-4 text-sky-600" />
                  Profile Picture
                </CardTitle>
                <CardDescription className="text-xs text-zinc-500">
                  Upload your photo to appear in article bylines, editorial credits, and dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0]);
                    }
                  }}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50/50 scale-[1.01]'
                      : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-sky-50 text-sky-600 rounded-full">
                      {uploadAvatarMutation.isPending ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <UploadCloud className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-xs md:text-sm text-zinc-800">
                        Click to upload
                      </span>{' '}
                      <span className="text-xs md:text-sm text-zinc-500">or drag and drop</span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      PNG, JPG, WebP or GIF (Recommended: Square aspect ratio, max 10MB)
                    </p>
                  </div>
                </div>

                {avatarPreview && (
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 rounded-full border border-zinc-200">
                        <AvatarImage src={avatarPreview} alt="Avatar Preview" className="object-cover" />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="text-xs text-zinc-500">
                        <span className="font-medium text-zinc-800 block">Current Photo</span>
                        <span>Visible on all articles you author</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isSaving}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* DETAILS FORM */}
            <Card className="border border-zinc-200 shadow-xs">
              <form onSubmit={handleSubmit}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
                    <User className="w-4 h-4 text-sky-600" />
                    Personal & Author Details
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500">
                    Update your public author profile information and contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-xs font-semibold text-zinc-700">
                        First Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter first name"
                        required
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-xs font-semibold text-zinc-700">
                        Last Name <span className="text-rose-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter last name"
                        required
                        className="text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-400" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter phone number"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-zinc-400" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        value={currentUser.email}
                        disabled
                        className="text-xs bg-zinc-50 text-zinc-500 cursor-not-allowed font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="bio" className="text-xs font-semibold text-zinc-700 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-zinc-400" />
                        Author Bio / About
                      </Label>
                      <span className="text-[10px] text-zinc-400">
                        {bio.length}/300 characters
                      </span>
                    </div>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 300) {
                          setBio(e.target.value);
                        }
                      }}
                      placeholder="Write a brief bio about your journalism background, focus topics, or credentials..."
                      className="text-xs min-h-[90px] resize-none"
                    />
                    <p className="text-[11px] text-zinc-400">
                      This bio is displayed in the Editorial Credits section on articles you author or review.
                    </p>
                  </div>

                  <div className="rounded-lg bg-zinc-50 p-3.5 border border-zinc-200/80 flex items-start gap-3">
                    <Shield className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-zinc-600 leading-relaxed">
                      <span className="font-semibold text-zinc-800">Role & Access: </span>
                      You are authenticated as{' '}
                      <span className="font-bold text-zinc-900">{roleLabel}</span>. Your articles
                      and drafts will automatically show your updated name and profile picture upon saving.
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSaving}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white gap-2 font-medium px-5"
                  >
                    {updateDetailsMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* RIGHT COLUMN: LIVE ARTICLE PREVIEW (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-zinc-200 shadow-xs sticky top-20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold flex items-center gap-2 text-zinc-900">
                    <Eye className="w-4 h-4 text-sky-600" />
                    Live Article Preview
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    Real-time
                  </Badge>
                </div>
                <CardDescription className="text-xs text-zinc-500">
                  How your profile picture and details appear to readers on article pages.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* PREVIEW 1: TOP ARTICLE BYLINE */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                    1. Article Top Byline
                  </span>
                  <div className="p-3.5 rounded-xl border border-zinc-200 bg-white shadow-xs">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-zinc-200 shadow-xs shrink-0 overflow-hidden">
                        {avatarPreview && (
                          <AvatarImage
                            src={avatarPreview}
                            alt="Author Preview"
                            className="object-cover h-full w-full"
                          />
                        )}
                        <AvatarFallback className="bg-sky-50 text-sky-800 font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-black text-sky-600 uppercase tracking-wider flex items-center gap-1">
                          <Feather className="w-2.5 h-2.5" />
                          Written By
                        </span>
                        <span className="font-bold text-xs md:text-sm text-zinc-900 capitalize truncate">
                          {firstName || 'First'} {lastName || 'Last'}
                        </span>
                        <span className="text-[10px] text-zinc-400">Today • 3 min read</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* PREVIEW 2: EDITORIAL CREDITS CARD */}
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 block">
                    2. Editorial Credits Section
                  </span>
                  <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/80 shadow-xs space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 text-[9px] font-black uppercase tracking-wider px-2 py-0 h-4 rounded-none">
                        Written By
                      </Badge>
                      <span className="text-[10px] text-zinc-400 font-medium">
                        Reporting & Authorship
                      </span>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border border-zinc-200/80">
                      <Avatar className="h-10 w-10 border border-zinc-200 shadow-xs shrink-0 overflow-hidden mt-0.5">
                        {avatarPreview && (
                          <AvatarImage
                            src={avatarPreview}
                            alt="Author Preview"
                            className="object-cover h-full w-full"
                          />
                        )}
                        <AvatarFallback className="bg-sky-50 text-sky-800 font-bold text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs text-zinc-900 capitalize truncate">
                            {firstName || 'First'} {lastName || 'Last'}
                          </span>
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded">
                            {roleLabel}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed line-clamp-3">
                          {bio.trim() || 'Journalism contributor dedicated to truthful reporting, educational insights, and verified news.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Tip:</strong> Keep your photo well-lit with your face centered for the best visual presentation across desktop and mobile devices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};
