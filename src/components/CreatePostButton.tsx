
import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  text: z.string().min(1, 'Post text is required'),
  category: z.enum(['campsite', 'service', 'question', 'general']),
});

type FormData = z.infer<typeof formSchema>;

const CreatePostButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: '',
      category: 'general',
    },
  });

  const onSubmit = (data: FormData) => {
    // Here you would typically save the post to your backend
    console.log('Post submitted:', data);
    toast({
      title: "Post created",
      description: "Your post has been published.",
    });
    setIsOpen(false);
    form.reset();
  };

  return (
    <>
      <button 
        className="fixed create-post-button right-6 bg-secondary text-secondary-foreground w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-secondary/90 transition-colors z-10"
        style={{ bottom: '5rem' }}
        onClick={() => setIsOpen(true)}
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

              {/* Image upload placeholder - would need to be implemented with file upload functionality */}
              <div className="border-dashed border-2 border-muted-foreground/30 rounded-md p-4 text-center cursor-pointer hover:bg-muted/20">
                <p>+ Add photos</p>
                <p className="text-xs text-muted-foreground">Up to 4 images</p>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full">Publish</Button>
              </div>
            </form>
          </Form>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default CreatePostButton;
