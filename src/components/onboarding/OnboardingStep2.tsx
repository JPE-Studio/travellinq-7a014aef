
import React from 'react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea";
import { DialogTitle } from '@/components/ui/dialog';
import { UseFormReturn } from 'react-hook-form';

interface OnboardingFormValues {
  pseudonym: string;
  bio: string;
  location: string;
}

interface OnboardingStep2Props {
  form: UseFormReturn<OnboardingFormValues>;
  onNext: () => void;
  onPrev: () => void;
}

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ form, onNext, onPrev }) => {
  return (
    <div className="space-y-6">
      <div>
        <DialogTitle className="text-2xl font-bold mb-2">Create Your Profile</DialogTitle>
        <p className="text-muted-foreground">
          Set up your profile to connect with other travelers.
        </p>
      </div>
      
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="pseudonym"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. TravelExplorer"
                  {...field}
                  autoComplete="off"
                  minLength={3}
                  maxLength={30}
                  required
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Choose a unique username (minimum 3 characters).
              </p>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Share a bit about yourself and your travel interests..."
                  className="resize-none"
                  maxLength={300}
                  rows={3}
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Optional, max 300 characters
              </p>
            </FormItem>
          )}
        />
      </div>
      
      <div className="pt-4 flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={onPrev}
        >
          Back
        </Button>
        <Button 
          className="flex-1"
          onClick={onNext}
          disabled={!form.getValues('pseudonym') || form.getValues('pseudonym').length < 3}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep2;
