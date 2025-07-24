
"use client";

import { useState } from 'react';
import { UserProfile } from '@/lib/users';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Camera, PlusCircle } from 'lucide-react';
import { wantsOptions, interestsOptions, bodyTypeOptions, ethnicityOptions, hairColorOptions, eyeColorOptions, smokerOptions, drinkerOptions, piercingsOptions, tattoosOptions, relationshipStatusOptions, childrenOptions } from '@/lib/options';
import { FormSection } from './form-section';
import { MultiSelect } from '../ui/multi-select';

type ProfileFormProps = {
    initialProfile: UserProfile;
    currentUser: UserProfile;
};

export function ProfileForm({ initialProfile, currentUser }: ProfileFormProps) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [profile, setProfile] = useState(initialProfile);
    const { toast } = useToast();

    const isOwnProfile = initialProfile.id === currentUser.id;

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
    
    const handleSave = async () => {
        toast({ title: "Profile Saved", description: "Your changes have been saved successfully." });
        setIsEditMode(false);
        // Here you would typically make an API call to save the profile data
    };

    const handleCancel = () => {
        setProfile(initialProfile); // Reset changes
        setIsEditMode(false);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="md:col-span-1 space-y-8">
                <Card>
                    <CardContent className="p-6">
                        <div className="relative group mb-6">
                            <Image
                                src={profile.image || '/placeholder.jpg'}
                                alt={profile.name}
                                width={500}
                                height={500}
                                className="rounded-lg object-cover aspect-square"
                                data-ai-hint="profile photo"
                            />
                            {isEditMode && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" className="text-white hover:bg-white/20">
                                        <Camera className="mr-2 h-4 w-4" /> Change Photo
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" value={profile.name} onChange={handleInputChange} disabled={!isEditMode} />
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                 <Select name="role" value={profile.role} onValueChange={(value) => handleSelectChange('role', value)} disabled={!isEditMode}>
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
                                <Input id="location" name="location" value={profile.location} onChange={handleInputChange} disabled={!isEditMode} />
                            </div>
                             <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" value={profile.email} onChange={handleInputChange} disabled={!isEditMode} />
                                 {!isEditMode && <p className="text-xs text-muted-foreground mt-1">Email is not verified. <a href="#" className="text-primary hover:underline">Change here.</a></p>}
                            </div>
                        </div>
                        
                        <div className="mt-6 flex flex-col gap-2">
                             {isEditMode ? (
                                <>
                                    <Button onClick={handleSave}>Save Profile</Button>
                                    <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                                </>
                            ) : isOwnProfile ? (
                                <Button onClick={() => setIsEditMode(true)}>Edit Profile</Button>
                            ) : (
                                 <Button>Message {profile.name}</Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column */}
            <div className="md:col-span-2 space-y-8">
                <FormSection title={`About ${profile.name}`}>
                    {isEditMode ? (
                        <Textarea name="bio" value={profile.bio} onChange={handleInputChange} rows={5} />
                    ) : (
                        <p className="text-muted-foreground">{profile.bio}</p>
                    )}
                </FormSection>
                
                <FormSection title="Wants & Interests">
                    <div className="space-y-4">
                        <div>
                            <Label>Wants</Label>
                            <MultiSelect
                                options={wantsOptions}
                                selected={profile.wants || []}
                                onChange={(selected) => handleMultiSelectChange('wants', selected)}
                                disabled={!isEditMode}
                                placeholder="Select what you're looking for..."
                            />
                        </div>
                         <div>
                            <Label>Interests</Label>
                             <MultiSelect
                                options={interestsOptions}
                                selected={profile.interests}
                                onChange={(selected) => handleMultiSelectChange('interests', selected)}
                                disabled={!isEditMode}
                                placeholder="Select your interests..."
                            />
                        </div>
                    </div>
                </FormSection>

                <FormSection title="Gallery">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {(profile.gallery || ['/user-profiles/Female_Gemini_Generated_Image(small)-001.jpg', '/user-profiles/Female_Gemini_Generated_Image(small)-002.jpg', '/user-profiles/Female_Gemini_Generated_Image(small)-003.jpg']).map((img, i) => (
                            <Image key={i} src={img} alt={`Gallery image ${i+1}`} width={200} height={200} className="rounded-lg object-cover aspect-square" data-ai-hint="gallery photo" />
                        ))}
                         {isEditMode && (
                            <div className="flex items-center justify-center border-2 border-dashed rounded-lg aspect-square cursor-pointer hover:bg-accent">
                                <div className="text-center text-muted-foreground">
                                    <PlusCircle className="mx-auto h-8 w-8" />
                                    <p>Add Photo</p>
                                </div>
                            </div>
                        )}
                    </div>
                </FormSection>

                <FormSection title="Attributes">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        <AttributeSelect label="Age" value={profile.age.toString()} name="age" options={Array.from({length: 53}, (_, i) => (i + 18).toString())} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Height" value={profile.height || `5'8"`} name="height" options={[`5'8"`, `5'9"`, `5'10"`]} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Body Type" value={profile.bodyType || 'Slim'} name="bodyType" options={bodyTypeOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Ethnicity" value={profile.ethnicity || 'Caucasian'} name="ethnicity" options={ethnicityOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Hair Color" value={profile.hairColor || 'Black'} name="hairColor" options={hairColorOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Eye Color" value={profile.eyeColor || 'Brown'} name="eyeColor" options={eyeColorOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Smoker" value={profile.smoker || 'No'} name="smoker" options={smokerOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Drinker" value={profile.drinker || 'Socially'} name="drinker" options={drinkerOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Piercings" value={profile.piercings || 'No'} name="piercings" options={piercingsOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Tattoos" value={profile.tattoos || 'No'} name="tattoos" options={tattoosOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Relationship Status" value={profile.relationshipStatus || 'Single'} name="relationshipStatus" options={relationshipStatusOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                        <AttributeSelect label="Children" value={profile.children || 'No'} name="children" options={childrenOptions} isEditMode={isEditMode} onChange={handleSelectChange} />
                    </div>
                </FormSection>
            </div>
        </div>
    );
}

const AttributeSelect = ({ label, value, name, options, isEditMode, onChange }: { label: string, value: string, name: string, options: string[], isEditMode: boolean, onChange: (name: string, value: string) => void }) => (
    <div>
        <Label>{label}</Label>
        {isEditMode ? (
            <Select value={value} onValueChange={(val) => onChange(name, val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    {options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
            </Select>
        ) : (
            <p className="text-muted-foreground">{value}</p>
        )}
    </div>
);
