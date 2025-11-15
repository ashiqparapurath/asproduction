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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useFirestore } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/ai/flows/upload-image-flow';
import { useUser } from '@/firebase';


const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  category: z.enum(['Electronics', 'Apparel', 'Books']),
  image: z.any(),
  showPrice: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onFinished: () => void;
}

export function ProductForm({ product, onFinished }: ProductFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isEditMode = !!product;
  const { user } = useUser();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || 'Apparel',
      image: null,
      showPrice: product?.showPrice ?? true,
    },
    mode: 'onChange',
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue('image', file); // Set the file object in the form
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Firestore Error',
        description: 'Firestore is not available. Please try again later.',
      });
      return;
    }

    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to create or update a product.",
        });
        return;
    }

    setIsSubmitting(true);

    let imageUrl = product?.imageUrl || '';

    try {
        if (data.image instanceof File) {
            const imageDataUri = imagePreview; // The data URI from the preview
            if (!imageDataUri) {
                 toast({
                    variant: "destructive",
                    title: "Image Error",
                    description: "Could not read the image file for upload.",
                });
                setIsSubmitting(false);
                return;
            }
            // Call the server-side flow to upload the image
            const result = await uploadImage({
                imageDataUri: imageDataUri,
                userId: user.uid,
                fileName: data.image.name,
            });
            imageUrl = result.downloadUrl;
        }

        const productData = {
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          showPrice: data.showPrice,
          imageUrl: imageUrl, // Use the new or existing URL
        };

        if (isEditMode && product) {
            const docRef = doc(firestore, 'products', product.id);
            const updatedData = { ...productData, updatedAt: serverTimestamp() };
            updateDocumentNonBlocking(docRef, updatedData);
            toast({
                title: 'Product Updated',
                description: `${data.name} has been successfully updated.`,
            });
        } else {
            const collectionRef = collection(firestore, 'products');
            const newData = { ...productData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
            addDocumentNonBlocking(collectionRef, newData);
            toast({
                title: 'Product Added',
                description: `${data.name} has been successfully added.`,
            });
        }
        onFinished();

    } catch (error: any) {
        console.error("Product form submission error:", error);
        let description = 'An unexpected error occurred.';
        if (error.message.includes('storage/object-not-found')) {
            description = 'Storage object not found. Please ensure Firebase Storage is enabled in your project.';
        } else if (error.message.includes('storage/unauthorized')) {
            description = 'You are not authorized to upload images. Please check your Storage Security Rules.';
        }
        toast({
            variant: 'destructive',
            title: 'Failed to save product',
            description: description,
        });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Product Name" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Product description..." {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="99.99" {...field} disabled={isSubmitting} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Apparel">Apparel</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
       
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              {imagePreview && (
                <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden border">
                  <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="cover" />
                </div>
              )}
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  disabled={isSubmitting}
                />
              </FormControl>
               <FormDescription>
                Upload an image for the product.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="showPrice"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Show Price</FormLabel>
                <FormMessage />
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
        <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full">
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
}
