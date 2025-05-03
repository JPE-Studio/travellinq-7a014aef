
import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User as AppUser } from '@/types';

interface ProfileInformationFormProps {
  profile: AppUser | null;
  displayName: string;
  setDisplayName: (value: string) => void;
  bio: string;
  setBio: (value: string) => void;
  location: string;
  setLocation: (value: string) => void;
  preferredLanguage: string;
  setPreferredLanguage: (value: string) => void;
  avatar: File | null;
  avatarPreview: string | null;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ru', label: 'Russian' },
  { value: 'zh', label: 'Chinese' },
];

const ProfileInformationForm: React.FC<ProfileInformationFormProps> = ({
  profile,
  displayName,
  setDisplayName,
  bio,
  setBio,
  location,
  setLocation,
  preferredLanguage,
  setPreferredLanguage,
  avatar,
  avatarPreview,
  handleImageChange,
}) => {
  return (
    <div className="bg-card rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
      
      <div className="flex items-center mb-6">
        <Avatar className="h-16 w-16 mr-4">
          <AvatarImage src={avatarPreview || profile?.avatar} className="object-cover" />
          <AvatarFallback>
            <User className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <label className="px-4 py-2 border rounded-md text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
          Change Profile Photo
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageChange}
          />
        </label>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium mb-1">Display Name</Label>
          <Input 
            type="text" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">Bio</Label>
          <Textarea 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">Location</Label>
          <Input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Portland, OR"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your location will be stored and used to show nearby posts
          </p>
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">Preferred Language</Label>
          <Select
            value={preferredLanguage}
            onValueChange={setPreferredLanguage}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((language) => (
                <SelectItem key={language.value} value={language.value}>
                  {language.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Your preferred language for content translation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileInformationForm;
