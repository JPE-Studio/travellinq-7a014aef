
import React from 'react';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DialogTitle } from '@/components/ui/dialog';
import { UseFormReturn } from 'react-hook-form';

interface OnboardingFormValues {
  pseudonym: string;
  bio: string;
  location: string;
}

interface OnboardingStep1Props {
  form: UseFormReturn<OnboardingFormValues>;
  onNext: () => void;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ form, onNext }) => {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto">
        <MapPin size={32} />
      </div>
      
      <div>
        <DialogTitle className="text-2xl font-bold mb-2">Welcome to Travellinq</DialogTitle>
        <p className="text-muted-foreground">
          Connect with fellow travelers, share tips and discover hidden places on your journey.
        </p>
      </div>
      
      <div className="pt-4">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Where are you now?</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Vienna, Austria"
                  {...field}
                  autoComplete="off"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                Let others know where you're currently traveling
              </p>
            </FormItem>
          )}
        />
        
        <Button 
          onClick={onNext} 
          className="w-full mt-4"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OnboardingStep1;
