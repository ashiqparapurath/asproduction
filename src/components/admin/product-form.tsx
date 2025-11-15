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
import { useUser } from '@/firebase';
import { Progress } from '@/components/ui/progress';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  category: z.enum(['Electronics', 'Apparel', 'Books']),
  image: z.any().optional(),
  imageUrl: z.string().optional(),
  showPrice: z.boolean().default(true),
})
.refine(data => data.image || data.imageUrl, {
  message: "An image is required.",
  path: ["image"],
})
.refine(data => {
  if (data.image && data.image instanceof File) {
    return data.image.size <= MAX_FILE_SIZE;
  }
  return true;
}, {
  message: `Image must be less than 1MB.`,
  path: ["image"],
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
      imageUrl: product?.imageUrl || '',
      showPrice: product?.showPrice ?? true,
    },
    mode: 'onChange',
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        form.setError("image", { type: "manual", message: "Image must be less than 1MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        form.setValue('imageUrl', result, { shouldValidate: true });
        form.setValue('image', file); // Keep file for validation if needed
        form.clearErrors('image');
      };
      reader.readAsDataURL(file);
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

    if (!data.imageUrl) {
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "An image is required to save the product.",
        });
        return;
    }

    setIsSubmitting(true);

    try {
        await saveProduct(data, data.imageUrl);
    } catch (error: any) {
        console.error("Product form submission error:", error);
        toast({
            variant: 'destructive',
            title: 'Failed to save product',
            description: error.message || 'An unexpected error occurred.',
        });
        setIsSubmitting(false);
    }
  };
  
  const saveProduct = async (data: ProductFormValues, imageUrl: string) => {
    if (!firestore) return;
    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      showPrice: data.showPrice,
      imageUrl: imageUrl, // This is the Base64 data URI
    };

    if (isEditMode && product) {
      const docRef = doc(firestore, 'products', product.id);
      const updatedData = { ...productData, updatedAt: serverTimestamp() };
      await updateDocumentNonBlocking(docRef, updatedData);
      toast({
        title: 'Product Updated',
        description: `${data.name} has been successfully updated.`,
      });
    } else {
      const collectionRef = collection(firestore, 'products');
      const newData = { ...productData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
      await addDocumentNonBlocking(collectionRef, newData);
      toast({
        title: 'Product Added',
        description: `${data.name} has been successfully added.`,
      });
    }
    onFinished();
    setIsSubmitting(false);
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
                   className="file:text-foreground"
                 />
              </FormControl>
              <FormDescription>
                Upload an image for the product. Max size: 1MB.
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
