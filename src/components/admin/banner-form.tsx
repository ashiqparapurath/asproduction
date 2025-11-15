'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useFirestore, useUser } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { Banner } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { X, UploadCloud } from 'lucide-react';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

const formSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.'),
  subtitle: z.string().min(2, 'Subtitle must be at least 2 characters.'),
  buttonText: z.string().min(2, 'Button text must be at least 2 characters.'),
  buttonLink: z.string().url('Please enter a valid URL.').or(z.string().startsWith('/', { message: "Internal links must start with a /" })),
  imageUrl: z.string().min(1, "An image is required."),
  isActive: z.boolean().default(true),
});

type BannerFormValues = z.infer<typeof formSchema>;

interface BannerFormProps {
  banner?: Banner;
  onFinished: () => void;
}

export function BannerForm({ banner, onFinished }: BannerFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const { user } = useUser();
  const isEditMode = !!banner;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(banner?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: banner?.title || '',
      subtitle: banner?.subtitle || '',
      buttonText: banner?.buttonText || '',
      buttonLink: banner?.buttonLink || '',
      imageUrl: banner?.imageUrl || '',
      isActive: banner?.isActive ?? true,
    },
    mode: 'onChange',
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      form.setError("imageUrl", { type: "manual", message: `File is too large (max 1MB).` });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
      form.setValue('imageUrl', result, { shouldValidate: true });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    form.setValue('imageUrl', '', { shouldValidate: true });
  }

  const onSubmit = async (data: BannerFormValues) => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to manage banners.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bannerData = {
        ...data,
      };

      if (isEditMode && banner) {
        const docRef = doc(firestore, 'banners', banner.id);
        const updatedData = { ...bannerData, updatedAt: serverTimestamp() };
        updateDocumentNonBlocking(docRef, updatedData);
        toast({
          title: 'Banner Updated',
          description: `The banner "${data.title}" has been successfully updated.`,
        });
      } else {
        const collectionRef = collection(firestore, 'banners');
        const newData = { ...bannerData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
        addDocumentNonBlocking(collectionRef, newData);
        toast({
          title: 'Banner Added',
          description: `The banner "${data.title}" has been successfully added.`,
        });
      }
      onFinished();
    } catch (error: any) {
      console.error("Banner form submission error:", error);
      toast({
        variant: 'destructive',
        title: 'Failed to save banner',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <FormField
              control={form.control}
              name="imageUrl"
              render={() => (
                <FormItem>
                  <FormLabel>Banner Image</FormLabel>
                   <FormControl>
                     {!imagePreview ? (
                        <div
                          className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            <span className="font-semibold">Click to upload</span>
                          </p>
                          <p className="text-xs text-muted-foreground">PNG, JPG (MAX 1MB)</p>
                          <Input 
                            type="file" 
                            accept="image/png, image/jpeg" 
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="sr-only"
                            disabled={isSubmitting}
                          />
                        </div>
                     ) : (
                        <div className="relative w-full h-48 rounded-md overflow-hidden border">
                          <Image src={imagePreview} alt="Banner preview" fill objectFit="cover" />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-2 right-2 h-7 w-7"
                            onClick={removeImage}
                          >
                            <X className="h-4 w-4"/>
                          </Button>
                        </div>
                     )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Activate Banner</FormLabel>
                    <FormDescription>Make this banner visible on the homepage.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
             <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mid-Season Sale" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subtitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtitle</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Up to 30% off" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buttonText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Text</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Shop Now" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="buttonLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Button Link</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., /products?category=Apparel" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full">
          {isSubmitting ? 'Saving...' : 'Save Banner'}
        </Button>
      </form>
    </Form>
  );
}
