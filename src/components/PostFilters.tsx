
import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PostFiltersProps {
  onFilterChange: (filters: {
    radius: number;
    autoRadius: boolean;
    categories: string[];
  }) => void;
}

const PostFilters: React.FC<PostFiltersProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [radius, setRadius] = useState(50); // Default 50 miles
  const [autoRadius, setAutoRadius] = useState(true); // Default to auto
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['general', 'campsite', 'service', 'question']);

  const handleRadiusChange = (value: number[]) => {
    setRadius(value[0]);
    if (!autoRadius) {
      onFilterChange({ radius: value[0], autoRadius, categories: selectedCategories });
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

  const handleCategoryToggle = (value: string[]) => {
    setSelectedCategories(value);
    onFilterChange({ radius, autoRadius, categories: value });
  };

  const applyFilters = () => {
    onFilterChange({ radius, autoRadius, categories: selectedCategories });
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <Filter size={16} />
          <span>Filters</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Filter Posts</SheetTitle>
          <SheetDescription>
            Customize what posts you see in your feed.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          {/* Radius settings */}
          <div className="space-y-4">
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
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Distance: {radius} miles</span>
                </div>
                <Slider
                  value={[radius]}
                  min={5}
                  max={500}
                  step={5}
                  onValueChange={handleRadiusChange}
                />
              </div>
            )}
            {autoRadius && (
              <p className="text-sm text-muted-foreground">
                Using your current location to find relevant posts.
              </p>
            )}
          </div>

          {/* Categories filter */}
          <div className="space-y-4">
            <h3 className="font-medium">Categories</h3>
            <ToggleGroup 
              type="multiple" 
              value={selectedCategories} 
              onValueChange={handleCategoryToggle}
              className="flex flex-wrap gap-2"
            >
              <ToggleGroupItem value="general">General</ToggleGroupItem>
              <ToggleGroupItem value="campsite">Campsites</ToggleGroupItem>
              <ToggleGroupItem value="service">Services</ToggleGroupItem>
              <ToggleGroupItem value="question">Questions</ToggleGroupItem>
            </ToggleGroup>
          </div>
          
          {/* Notification settings */}
          <div className="space-y-4">
            <h3 className="font-medium">Notifications</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="friend-proximity" className="flex-grow">
                  <span>Friend proximity alerts</span>
                  <p className="text-sm text-muted-foreground">Get notified when connections are nearby</p>
                </Label>
                <Switch id="friend-proximity" defaultChecked />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={applyFilters}>
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PostFilters;
