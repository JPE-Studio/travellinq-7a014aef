
import React, { useState, useRef } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Plus, X, MapPin, Image, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createPost } from '@/services/postService';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const formSchema = z.object({
  text: z.string().min(1, 'Post text is required'),
  category: z.enum(['campsite', 'service', 'question', 'general']),
});

type FormData = z.infer<typeof formSchema>;

const CreatePostButton: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      category: 'general',
    },
  });

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Location added",
            description: "Your current location has been added to the post.",
          });
        },
        (err) => {
          console.error("Error getting location:", err);
          toast({
            title: "Location error",
            description: "Could not get your location. Please try again.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
    }
  };

  // Handle image selection
  const handleImageSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Limit to 4 images total
      const totalImages = [...selectedImages, ...newFiles];
      if (totalImages.length > 4) {
        toast({
          title: "Too many images",
          description: "Maximum 4 images allowed per post.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedImages(prevImages => [...prevImages, ...newFiles]);
      
      // Create preview URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(prevUrls => [...prevUrls, ...newPreviews]);
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Upload images to storage and get URLs
  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];
    
    const uploadedUrls: string[] = [];
    
    for (const file of selectedImages) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `post-images/${fileName}`;
      
      const { error, data } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);
      
      if (error) {
        console.error("Error uploading image:", error);
        continue;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);
      
      uploadedUrls.push(publicUrlData.publicUrl);
    }
    
    return uploadedUrls;
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to create a post",
        variant: "destructive",
      });
      navigate('/auth');
      return;
    }
    
    if (!location) {
      toast({
        title: "Location required",
        description: "Please add your location to the post",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Upload images if any
      const imageUrls = await uploadImages();
      
      // Create the post
      const newPost = await createPost(
        data.text,
        data.category,
        location,
        imageUrls.length > 0 ? imageUrls : undefined
      );
      
      // Close drawer and reset form
      setIsOpen(false);
      form.reset();
      setSelectedImages([]);
      setImagePreviewUrls([]);
      setLocation(null);
      
      // Invalidate posts query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast({
        title: "Post created",
        description: "Your post has been published successfully.",
      });
      
      // Navigate to the new post
      navigate(`/post/${newPost.id}`);
    } catch (error: any) {
      toast({
        title: "Error creating post",
        description: error.message || "There was an error creating your post",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button 
        className="fixed create-post-button right-6 bg-secondary text-secondary-foreground w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-colors z-10"
        style={{ bottom: '5rem' }}
        onClick={() => {
          if (!user) {
            toast({
              title: "Not signed in",
              description: "Please sign in to create a post",
              variant: "destructive",
            });
            navigate('/auth');
          } else {
            setIsOpen(true);
          }
        }}
      >
        <Plus className="h-6 w-6" />
      </button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="p-4 max-h-[90vh] overflow-y-auto">
          <DrawerHeader className="flex justify-between items-center">
            <DrawerTitle>Create New Post</DrawerTitle>
            <DrawerClose className="h-6 w-6 p-0">
              <X className="h-6 w-6" />
            </DrawerClose>
          </DrawerHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What do you want to share?</FormLabel>
                    <FormControl>
                      <textarea 
                        className="w-full min-h-[150px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Share your experience, ask questions, or post a recommendation..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        {...field}
                      >
                        <option value="general">General</option>
                        <option value="campsite">Campsite</option>
                        <option value="service">Service</option>
                        <option value="question">Question</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location picker */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Location</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={getUserLocation}
                    className="flex items-center gap-1"
                    disabled={!!location}
                  >
                    <MapPin className="h-4 w-4" />
                    {location ? "Location Added" : "Add Current Location"}
                  </Button>
                </div>
                {location && (
                  <div className="text-sm text-muted-foreground">
                    Location added: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                  </div>
                )}
              </div>

              {/* Image upload */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <FormLabel>Photos</FormLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelection}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={selectedImages.length >= 4}
                    className="flex items-center gap-1"
                  >
                    <Image className="h-4 w-4" />
                    Add Photos
                  </Button>
                </div>
                
                {imagePreviewUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white"
                          onClick={() => removeImage(index)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedImages.length === 0 && (
                  <div 
                    className="border-dashed border-2 border-muted-foreground/30 rounded-md p-4 text-center cursor-pointer hover:bg-muted/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <p>+ Add photos</p>
                    <p className="text-xs text-muted-foreground">Up to 4 images</p>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={submitting || !location}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CreatePostButton;
