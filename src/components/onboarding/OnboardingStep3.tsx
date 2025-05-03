
import React from 'react';
import { User, Upload, X, Camera } from 'lucide-react';
import { DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';

interface OnboardingStep3Props {
  avatarFile: File | null;
  avatarPreview: string | null;
  isUploading: boolean;
  onPrev: () => void;
  onComplete: () => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeAvatar: () => void;
}

const OnboardingStep3: React.FC<OnboardingStep3Props> = ({
  avatarFile,
  avatarPreview,
  isUploading,
  onPrev,
  onComplete,
  onAvatarChange,
  removeAvatar
}) => {
  return (
    <div className="space-y-6">
      <div>
        <DialogTitle className="text-2xl font-bold mb-2">Add Profile Picture</DialogTitle>
        <p className="text-muted-foreground">
          Upload a profile picture to help other travelers recognize you.
        </p>
      </div>
      
      <div className="flex flex-col items-center space-y-6">
        {avatarPreview ? (
          <div className="relative">
            <Avatar className="w-32 h-32 border-2 border-primary">
              <AvatarImage src={avatarPreview} alt="Avatar preview" style={{ objectFit: 'cover' }} />
              <AvatarFallback>
                <User className="h-16 w-16" />
              </AvatarFallback>
            </Avatar>
            <button 
              onClick={removeAvatar}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
              type="button"
              aria-label="Remove avatar"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-muted-foreground">
            <Camera size={32} className="text-muted-foreground" />
          </div>
        )}
        
        <div className="w-full">
          <Label htmlFor="avatar" className="cursor-pointer">
            <div className="flex items-center justify-center gap-2 p-3 border border-input bg-background hover:bg-accent text-center rounded-md">
              <Upload size={16} />
              <span>{avatarPreview ? 'Change Picture' : 'Select Picture'}</span>
            </div>
            <input 
              id="avatar" 
              type="file" 
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden" 
            />
          </Label>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Optional: JPG or PNG, max 5MB
          </p>
        </div>
      </div>

      <div className="pt-4 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onPrev}
          disabled={isUploading}
        >
          Back
        </Button>
        <Button 
          className="flex-1"
          onClick={onComplete}
          disabled={isUploading}
        >
          {isUploading ? 'Saving...' : 'Complete Setup'}
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep3;
