

"use client";

import { useState, useRef, useEffect, useMemo } from 'react';
import { UserProfile } from '@/lib/users';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Camera, PlusCircle, Loader2, Heart, MessageSquare, Flag, Ban, Wand2, ShieldCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { wantsOptions, interestsOptions, bodyTypeOptions, ethnicityOptions, hairColorOptions, eyeColorOptions, smokerOptions, drinkerOptions, piercingsOptions, tattoosOptions, relationshipStatusOptions, childrenOptions } from '@/lib/options';
import { MultiSelect } from '../ui/multi-select';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { NotificationToast } from '../ui/notification-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { sendEmail } from '@/lib/email';

type ProfileFormProps = {
    initialProfile: UserProfile;
    currentUser: UserProfile;
};

const ProfileActionButtons = ({ onAction, onCuteMessage, viewerRole }: { onAction: (action: string) => void, onCuteMessage: () => void, viewerRole?: UserProfile['role'] }) => {
    const actions = [
        { id: 'favorite', icon: <Heart className="h-5 w-5" />, label: 'Add to Favorites' },
        { id: 'message', icon: <MessageSquare className="h-5 w-5" />, label: 'Send Message' },
    ];
    
    const secondaryActions = [
        { id: 'report', icon: <Flag className="h-5 w-5" />, label: 'Report Profile' },
        { id: 'block', icon: <Ban className="h-5 w-5" />, label: 'Block User' },
    ]

    return (
        <div className="flex items-center gap-1">
            <TooltipProvider>
                {actions.map(action => (
                    <Tooltip key={action.id}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onAction(action.id)}>
                                {action.icon}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{action.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                 {viewerRole === 'Sugar Baby' && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={onCuteMessage}>
                                <Wand2 className="h-5 w-5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Send Cute Message</p>
                        </TooltipContent>
                    </Tooltip>
                )}
                 <div className="border-l h-6 mx-2"></div>
                 {secondaryActions.map(action => (
                    <Tooltip key={action.id}>
                        <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => onAction(action.id)}>
                                {action.icon}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{action.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </TooltipProvider>
        </div>
    );
};

const completionSections = {
    about: ['bio'],
    wantsAndInterests: ['wants', 'interests'],
    gallery: ['gallery'],
    attributes: ['height', 'bodyType', 'ethnicity', 'hairColor', 'eyeColor', 'smoker', 'drinker', 'piercings', 'tattoos', 'relationshipStatus', 'children'],
    main: ['name', 'location'],
    privateGallery: ['privateGallery'],
};

const calculateCompletion = (profile: UserProfile, sections: string[] | 'all' = 'all') => {
    const fieldsToCheck = sections === 'all'
        ? Object.values(completionSections).flat()
        : sections.flatMap(sec => completionSections[sec as keyof typeof completionSections] || []);

    let completedCount = 0;
    
    const fieldsWithoutImage = fieldsToCheck.filter(f => f !== 'image');
    if (!fieldsWithoutImage.includes('privateGallery')) fieldsWithoutImage.push('privateGallery');


    fieldsWithoutImage.forEach(field => {
        const value = profile[field as keyof UserProfile];
        if (Array.isArray(value)) {
            if (value.length > 0) completedCount++;
        } else if (typeof value === 'string') {
            if (value.trim() !== '') completedCount++;
        } else if (value) {
            completedCount++;
        }
    });

    return fieldsWithoutImage.length > 0 ? Math.round((completedCount / fieldsWithoutImage.length) * 100) : 0;
};


export function ProfileForm({ initialProfile, currentUser }: ProfileFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isEditModeFromQuery = searchParams.get('edit') === 'true';

    const [isEditMode, setIsEditMode] = useState(isEditModeFromQuery || false);
    const [profile, setProfile] = useState(initialProfile);
    
    const [imagePreview, setImagePreview] = useState<string | null>(initialProfile.image);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageBase64, setImageBase64] = useState<string | null>(null);

    const [galleryPreviews, setGalleryPreviews] = useState<(string)[]>(initialProfile.gallery || []);
    const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
    const [galleryBase64s, setGalleryBase64s] = useState<string[]>([]);
    
    const [privateGalleryPreviews, setPrivateGalleryPreviews] = useState<(string)[]>(initialProfile.image ? [initialProfile.image] : []);
    const [privateGalleryFiles, setPrivateGalleryFiles] = useState<File[]>([]);
    const [privateGalleryBase64s, setPrivateGalleryBase64s] = useState<string[]>([]);


    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const privateGalleryInputRef = useRef<HTMLInputElement>(null);

    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const allImages = useMemo(() => {
        const primaryImage = privateGalleryPreviews[0];
        const otherImages = galleryPreviews;
        const all = primaryImage ? [primaryImage, ...otherImages.filter(img => img !== primaryImage)] : otherImages;
        return [...new Set(all)].filter(Boolean) as string[]; // Deduplicate and remove empty
    }, [privateGalleryPreviews, galleryPreviews]);

    const openGallery = (index: number) => {
        setCurrentImageIndex(index);
        setIsGalleryOpen(true);
    };

    const closeGallery = () => setIsGalleryOpen(false);

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
    };

    const isOwnProfile = initialProfile.id === currentUser.id;
    const isVerified = profile.verifiedUntil && new Date(profile.verifiedUntil) > new Date();
    
    const canViewSensitiveInfo = isOwnProfile || currentUser.role === 'Admin';
    
    const completionPercentages = useMemo(() => ({
        about: calculateCompletion(profile, ['about']),
        wantsAndInterests: calculateCompletion(profile, ['wantsAndInterests']),
        gallery: calculateCompletion(profile, ['gallery']),
        attributes: calculateCompletion(profile, ['attributes']),
        total: calculateCompletion(profile, 'all'),
    }), [profile]);

    useEffect(() => {
        if (!isOwnProfile) {
            toast({
                duration: 5000,
                component: (
                    <NotificationToast
                        user={currentUser}
                        actionText="just viewed your profile!"
                        profileUrl={`/dashboard/profile/${currentUser.id}`}
                    />
                )
            });

            sendEmail({
                to: profile.email,
                recipientName: profile.name,
                subject: 'Someone viewed your profile!',
                body: `${currentUser.name} just viewed your profile.`,
                callToAction: {
                    text: 'View Their Profile',
                    url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/dashboard/profile/${currentUser.id}`
                }
            });
        }
    }, [isOwnProfile, currentUser, profile.email, profile.name, toast]);

    const handleAction = (action: string) => {
        const actionTextMap: Record<string, string> = {
            favorite: "just favorited your profile!",
            message: "just sent you a message!",
            report: "just reported your profile.",
            block: "just blocked you."
        };

        const subjectMap: Record<string, string> = {
            favorite: "You have a new favorite!",
            message: "You have a new message!",
            report: "Your profile has been reported",
            block: "A user has blocked you"
        };
        
        toast({
            duration: 5000,
            component: (
                 <NotificationToast
                    user={currentUser}
                    actionText={actionTextMap[action] || `performed action: ${action}`}
                    profileUrl={`/dashboard/profile/${currentUser.id}`}
                />
            )
        });

        sendEmail({
            to: profile.email,
            recipientName: profile.name,
            subject: subjectMap[action] || 'New activity on your profile',
            body: `${currentUser.name} ${actionTextMap[action]}.`,
            callToAction: {
                text: 'View Their Profile',
                url: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:9002'}/dashboard/profile/${currentUser.id}`
            }
        });
    }
    
    const handleSendCuteMessage = () => {
        const cuteMessages = [
            "I love your style! That watch in your photo is stunning.",
            "You have amazing taste. We should go shopping on Rodeo Drive sometime!",
            "Your profile has such a classy vibe. I'm already picturing our first elegant dinner.",
            "Just wanted to say you have a fantastic sense of fashion. ✨"
        ];
        const randomMessage = cuteMessages[Math.floor(Math.random() * cuteMessages.length)];
        
        toast({
            duration: 5000,
            component: (
                <NotificationToast
                    user={currentUser}
                    actionText={`sent you a message: "${randomMessage}"`}
                    profileUrl={`/dashboard/profile/${currentUser.id}`}
                />
            )
        });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (name: string, values: string[]) => {
        setProfile(prev => ({ ...prev, [name]: values }));
    };

    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            if (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true') {
                const base64 = await toBase64(file);
                setImageBase64(base64);
            }
        }
    };
    
    const handleGalleryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newFiles = [...galleryFiles, ...files];
            setGalleryFiles(newFiles);

            const newPreviews = files.map(file => URL.createObjectURL(file));
            setGalleryPreviews(prev => [...prev, ...newPreviews]);
            
            if (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true') {
                const newBase64s = await Promise.all(files.map(file => toBase64(file)));
                setGalleryBase64s(prev => [...prev, ...newBase64s]);
            }
        }
    };
    
    const handlePrivateGalleryImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newFiles = [file];
            setPrivateGalleryFiles(newFiles);

            const newPreviews = [URL.createObjectURL(file)];
            setPrivateGalleryPreviews(newPreviews);
            
            if (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true') {
                const newBase64s = await Promise.all(newFiles.map(f => toBase64(f)));
                setPrivateGalleryBase64s(newBase64s);
            }
        }
    };

    const handleRemoveGalleryImage = (index: number) => {
        const urlToRemove = galleryPreviews[index];
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        
        if (urlToRemove.startsWith('blob:')) {
            const blobIndex = galleryPreviews.filter(p => p.startsWith('blob:')).indexOf(urlToRemove);
            if (blobIndex > -1) {
                setGalleryFiles(files => files.filter((_, i) => i !== blobIndex));
                if (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true') {
                    setGalleryBase64s(base64s => base64s.filter((_, i) => i !== blobIndex));
                }
            }
        }
    };

    const handleRemovePrivateGalleryImage = (index: number) => {
        setPrivateGalleryPreviews([]);
        setPrivateGalleryFiles([]);
        setPrivateGalleryBase64s([]);
    };

    const handleSave = async () => {
        setIsLoading(true);
        const formData = new FormData();

        Object.entries(profile).forEach(([key, value]) => {
            if (['image', 'gallery', 'privateGallery', 'password'].includes(key)) return;
            if (Array.isArray(value)) formData.append(key, value.join(','));
            else if (value !== null && value !== undefined) formData.append(key, String(value));
        });

        const mainImageFile = privateGalleryFiles[0];
        const mainImageBase64 = privateGalleryBase64s[0];
        const mainImagePreview = privateGalleryPreviews[0];

        if (process.env.NEXT_PUBLIC_USE_LOCAL_STORAGE === 'true') {
            if (mainImageBase64) formData.append('image', mainImageBase64);
            else if (mainImagePreview) formData.append('image', mainImagePreview);

            const allGalleryUrls = [...galleryPreviews.filter(p => !p.startsWith('blob:')), ...galleryBase64s];
            formData.append('gallery', JSON.stringify(allGalleryUrls));

            formData.append('privateGallery', JSON.stringify([]));

        } else {
            if (mainImageFile) formData.append('image', mainImageFile);
            else if (mainImagePreview) formData.append('image', mainImagePreview);

            galleryFiles.forEach(file => formData.append('galleryImages', file));
            const existingGalleryUrls = galleryPreviews.filter(p => !p.startsWith('blob:'));
            formData.append('gallery', JSON.stringify(existingGalleryUrls));
            
            formData.append('privateGallery', JSON.stringify([]));
        }

        try {
            const response = await fetch(`/api/users/${profile.id}`, { method: 'PUT', body: formData });
            if (!response.ok) throw new Error((await response.json()).message || 'Failed to save profile.');
            
            const updatedProfile: UserProfile = await response.json();
            if (isOwnProfile) {
                localStorage.setItem('user', JSON.stringify(updatedProfile));
                window.dispatchEvent(new StorageEvent('storage', { key: 'user', newValue: JSON.stringify(updatedProfile) }));
            }

            toast({ title: "Profile Saved", description: "Your changes have been saved successfully." });
            setIsEditMode(false);
            setProfile(updatedProfile);
            
            setImagePreview(updatedProfile.image);
            setImageFile(null);
            setImageBase64(null);

            setGalleryPreviews(updatedProfile.gallery || []);
            setGalleryFiles([]);
            setGalleryBase64s([]);
            
            setPrivateGalleryPreviews(updatedProfile.image ? [updatedProfile.image] : []);
            setPrivateGalleryFiles([]);
            setPrivateGalleryBase64s([]);
            
            const newUrl = window.location.pathname;
            window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Save Failed", description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setProfile(initialProfile);
        setImagePreview(initialProfile.image);
        setImageFile(null);
        setGalleryPreviews(initialProfile.gallery || []);
        setGalleryFiles([]);
        setPrivateGalleryPreviews(initialProfile.image ? [initialProfile.image] : []);
        setPrivateGalleryFiles([]);
        setIsEditMode(false);
        const newUrl = window.location.pathname;
        window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
    };

    const VerificationBadge = () => {
        if (isVerified) {
            return (
                <Badge className="absolute top-4 left-4 bg-blue-500 hover:bg-blue-600 text-white z-10 text-xs px-2 py-1 h-auto">
                    <ShieldCheck className="mr-1 h-3 w-3" />
                    Verified
                </Badge>
            );
        }
        if (isOwnProfile) {
            return (
                <Button asChild className="absolute top-4 left-4 z-10 h-auto px-2 py-1 text-xs" size="sm">
                    <Link href="/get-verified">
                        Unverified
                    </Link>
                </Button>
            );
        }
        return (
             <Badge variant="secondary" className="absolute top-4 left-4 z-10 text-xs px-2 py-1 h-auto">
                Unverified
            </Badge>
        );
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {/* Left Column */}
                <div className="md:col-span-1 space-y-8 md:sticky top-28 self-start">
                     <Card className="shadow-xl">
                            <CardContent className="p-6">
                                <div className="relative group aspect-square">
                                    {privateGalleryPreviews.length > 0 && privateGalleryPreviews[0] ? (
                                         <div className="relative w-full h-full group">
                                             <button className="w-full h-full" onClick={() => openGallery(allImages.indexOf(privateGalleryPreviews[0]))}>
                                                 <Image
                                                     key={privateGalleryPreviews[0]}
                                                     src={privateGalleryPreviews[0]}
                                                     alt="Profile photo"
                                                     fill
                                                     className="rounded-lg object-cover"
                                                     data-ai-hint="profile photo"
                                                 />
                                             </button>
                                              {isEditMode && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                    onClick={() => handleRemovePrivateGalleryImage(0)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                         </div>
                                    ) : isEditMode ? (
                                        <div
                                            className="flex items-center justify-center border-2 border-dashed rounded-lg aspect-square cursor-pointer hover:bg-accent p-4"
                                            onClick={() => privateGalleryInputRef.current?.click()}
                                        >
                                            <div className="text-center text-muted-foreground">
                                                <PlusCircle className="mx-auto h-8 w-8" />
                                                <p>Add Photo</p>
                                            </div>
                                            <input
                                                type="file"
                                                ref={privateGalleryInputRef}
                                                onChange={handlePrivateGalleryImageChange}
                                                accept="image/*"
                                                className="hidden"
                                                multiple={false}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center border-2 border-dashed rounded-lg aspect-square p-4">
                                            <div className="text-center text-muted-foreground">
                                                <Camera className="mx-auto h-8 w-8" />
                                                <p>No Profile Photo</p>
                                            </div>
                                        </div>
                                    )}
                                     <VerificationBadge />
                                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
                                        <div className="flex items-center gap-2">
                                            <Progress value={completionPercentages.total} className="h-2 w-full" />
                                            <span className="text-white text-xs font-bold">{completionPercentages.total}%</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                   
                     <Card className="shadow-xl">
                         <CardContent className="p-6 space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={profile.name} onChange={handleInputChange} disabled={!isEditMode || isLoading} />
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                    <Select name="role" value={profile.role} onValueChange={(value) => handleSelectChange('role', value)} disabled={!isEditMode || isLoading || currentUser.role !== 'Admin'}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sugar Baby">Sugar Baby</SelectItem>
                                        <SelectItem value="Sugar Daddy">Sugar Daddy</SelectItem>
                                        <SelectItem value="Admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                                <div>
                                <Label htmlFor="location">Location</Label>
                                <Input id="location" name="location" value={profile.location} onChange={handleInputChange} disabled={!isEditMode || isLoading} />
                            </div>
                            {canViewSensitiveInfo && (
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" value={profile.email} disabled />
                                    {isOwnProfile && !isEditMode && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Email cannot be changed here. <Link href="/settings" className="underline text-primary">Change here</Link>.
                                        </p>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    
                    <div className="mt-6 flex flex-col gap-2">
                            {isEditMode ? (
                            <>
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isLoading ? 'Saving...' : 'Save Profile'}
                                </Button>
                                <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>Cancel</Button>
                            </>
                        ) : isOwnProfile ? (
                            <Button onClick={() => setIsEditMode(true)}>Edit Profile</Button>
                        ) : (
                            <Button asChild>
                                <Link href={`/messages?userId=${profile.id}`}>Message {profile.name}</Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div className="md:col-span-2 space-y-8">
                     <Card className="shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className='flex items-center gap-2'>
                                <CardTitle>{`About ${profile.name}`}</CardTitle>
                                <Badge variant="outline">{completionPercentages.about}%</Badge>
                            </div>
                           <ProfileActionButtons onAction={handleAction} onCuteMessage={handleSendCuteMessage} viewerRole={currentUser.role} />
                        </CardHeader>
                        <CardContent>
                            {isEditMode ? (
                                <Textarea name="bio" value={profile.bio || ''} onChange={handleInputChange} rows={5} disabled={isLoading} />
                            ) : (
                                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio || 'No bio provided.'}</p>
                            )}
                        </CardContent>
                    </Card>
                    
                    <Card className="shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div className='flex items-center gap-2'>
                                <CardTitle>Wants & Interests</CardTitle>
                                <Badge variant="outline">{completionPercentages.wantsAndInterests}%</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <Label>Wants</Label>
                                <MultiSelect
                                    options={wantsOptions}
                                    selected={profile.wants || []}
                                    onChange={(selected) => handleMultiSelectChange('wants', selected)}
                                    disabled={!isEditMode || isLoading}
                                    placeholder="Select what you're looking for..."
                                />
                            </div>
                                <div>
                                <Label>Interests</Label>
                                    <MultiSelect
                                    options={interestsOptions}
                                    selected={profile.interests}
                                    onChange={(selected) => handleMultiSelectChange('interests', selected)}
                                    disabled={!isEditMode || isLoading}
                                    placeholder="Select your interests..."
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div className='flex items-center gap-2'>
                                <CardTitle>Gallery</CardTitle>
                                <Badge variant="outline">{completionPercentages.gallery}%</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {galleryPreviews.map((img, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <button className="w-full h-full" onClick={() => openGallery(allImages.indexOf(img))}>
                                            <Image src={img} alt={`Gallery image ${i+1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-110" data-ai-hint="gallery photo" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                        {isEditMode && (
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                                onClick={() => handleRemoveGalleryImage(i)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                {isEditMode && (
                                    <div 
                                        className="flex items-center justify-center border-2 border-dashed rounded-lg aspect-square cursor-pointer hover:bg-accent"
                                        onClick={() => galleryInputRef.current?.click()}
                                    >
                                        <div className="text-center text-muted-foreground">
                                            <PlusCircle className="mx-auto h-8 w-8" />
                                            <p>Add Photo</p>
                                        </div>
                                        <input 
                                            type="file" 
                                            ref={galleryInputRef} 
                                            onChange={handleGalleryImageChange} 
                                            accept="image/*" 
                                            multiple 
                                            className="hidden" 
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>


                     <Card className="shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between">
                           <div className='flex items-center gap-2'>
                                <CardTitle>Attributes</CardTitle>
                                <Badge variant="outline">{completionPercentages.attributes}%</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                <AttributeSelect label="Age" value={(profile.age || 18).toString()} name="age" options={Array.from({length: 53}, (_, i) => (i + 18).toString())} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading} />
                                <AttributeSelect label="Height" value={profile.height || `5'8"`} name="height" options={[`5'0"`, `5'1"`, `5'2"`, `5'3"`, `5'4"`, `5'5"`, `5'6"`, `5'7"`, `5'8"`, `5'9"`, `5'10"`, `5'11"`, `6'0"+`]} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Body Type" value={profile.bodyType || 'Slim'} name="bodyType" options={bodyTypeOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Ethnicity" value={profile.ethnicity || 'Caucasian'} name="ethnicity" options={ethnicityOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Hair Color" value={profile.hairColor || 'Black'} name="hairColor" options={hairColorOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Eye Color" value={profile.eyeColor || 'Brown'} name="eyeColor" options={eyeColorOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Smoker" value={profile.smoker || 'No'} name="smoker" options={smokerOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Drinker" value={profile.drinker || 'Socially'} name="drinker" options={drinkerOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Piercings" value={profile.piercings || 'No'} name="piercings" options={piercingsOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Tattoos" value={profile.tattoos || 'No'} name="tattoos" options={tattoosOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Relationship Status" value={profile.relationshipStatus || 'Single'} name="relationshipStatus" options={relationshipStatusOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                                <AttributeSelect label="Children" value={profile.children || 'No'} name="children" options={childrenOptions} isEditMode={isEditMode} onChange={handleSelectChange} disabled={isLoading}/>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

             <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                <DialogContent className="p-0 m-0 w-screen h-screen max-w-none border-0 bg-black/90 flex items-center justify-center" showCloseButton={false}>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Image Gallery</DialogTitle>
                    </DialogHeader>
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-4 top-4 z-10 text-white bg-black/20 hover:bg-white/20 hover:text-white rounded-full h-12 w-12"
                        >
                            <X className="h-8 w-8" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </DialogClose>
                     {allImages.length > 0 && allImages[currentImageIndex] && (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                key={allImages[currentImageIndex]}
                                src={allImages[currentImageIndex]}
                                alt={`Gallery image ${currentImageIndex + 1}`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    )}
                    
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-white/20 hover:text-white rounded-full h-14 w-14"
                        onClick={prevImage}
                        disabled={allImages.length <= 1}
                    >
                        <ChevronLeft className="h-10 w-10" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/20 hover:bg-white/20 hover:text-white rounded-full h-14 w-14"
                        onClick={nextImage}
                        disabled={allImages.length <= 1}
                    >
                        <ChevronRight className="h-10 w-10" />
                    </Button>
                    
                    {allImages.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                            {currentImageIndex + 1} / {allImages.length}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

const AttributeSelect = ({ label, value, name, options, isEditMode, onChange, disabled }: { label: string, value: string, name: string, options: string[], isEditMode: boolean, onChange: (name: string, value: string) => void, disabled: boolean }) => (
    <div>
        <Label>{label}</Label>
        {isEditMode ? (
            <Select value={value} onValueChange={(val) => onChange(name, val)} disabled={disabled}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
            </Select>
        ) : (
            <p className="text-muted-foreground h-10 flex items-center">{value || '-'}</p>
        )}
    </div>
);


    














    