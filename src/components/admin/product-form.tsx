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
import { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/firebase';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  category: z.enum(['Electronics', 'Apparel', 'Books']),
  imageUrl: z.string().url('Please enter a valid URL.'),
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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || 'Apparel',
      imageUrl: product?.imageUrl || '',
      showPrice: product?.showPrice ?? true,
    },
    mode: 'onChange',
  });
  
  const imageUrlValue = form.watch('imageUrl');

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

    try {
        const productData = {
          name: data.name,
          description: data.description,
          price: data.price,
          category: data.category,
          showPrice: data.showPrice,
          imageUrl: data.imageUrl,
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
        toast({
            variant: 'destructive',
            title: 'Failed to save product',
            description: error.message || 'An unexpected error occurred.',
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image URL</FormLabel>
               {imageUrlValue && (
                <div className="mt-2 relative w-full h-48 rounded-md overflow-hidden border">
                  <Image src={imageUrlValue} alt="Image Preview" layout="fill" objectFit="cover" onError={(e) => e.currentTarget.src = 'https://placehold.co/600x400/EEE/31343C?text=Invalid+URL'} />
                </div>
              )}
              <FormControl>
                 <Input placeholder="https://example.com/image.png" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormDescription>
                Paste a URL to an image from the web.
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
