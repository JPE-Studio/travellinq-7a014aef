
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PostFiltersProps {
  onFilterChange: (filters: {
    radius: number;
    autoRadius: boolean;
    categories: string[];
  }) => void;
}

const PostFilters: React.FC<PostFiltersProps> = ({ onFilterChange }) => {
  const [radius, setRadius] = useState(50); // Default 50 miles
  const [autoRadius, setAutoRadius] = useState(true); // Default to auto
  
  // Keep the categories in the state to maintain compatibility with the API,
  // but we won't show UI controls for them anymore
  const [selectedCategories] = useState<string[]>(['general', 'campsite', 'service', 'question']);

  const radiusOptions = [2, 5, 50, 100]; // km radius options

  const handleRadiusButtonClick = (value: number) => {
    setRadius(value);
    if (!autoRadius) {
      onFilterChange({ radius: value, autoRadius, categories: selectedCategories });
    }
  };

  const handleAutoRadiusChange = (checked: boolean) => {
    setAutoRadius(checked);
    onFilterChange({ 
      radius: checked ? 50 : radius, // If auto, use default radius
      autoRadius: checked,
      categories: selectedCategories
    });
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        {/* Radius settings */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Location Radius</h3>
            <div className="flex items-center gap-2">
              <Switch 
                id="auto-radius" 
                checked={autoRadius} 
                onCheckedChange={handleAutoRadiusChange}
              />
              <Label htmlFor="auto-radius">Auto</Label>
            </div>
          </div>
          
          {!autoRadius && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mt-2">
                {radiusOptions.map((option) => (
                  <Button
                    key={option}
                    variant={radius === option ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleRadiusButtonClick(option)}
                    className="flex-1"
                  >
                    {option} km
                  </Button>
                ))}
              </div>
            </div>
          )}
          {autoRadius && (
            <p className="text-sm text-muted-foreground">
              Using your current location to find relevant posts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostFilters;
