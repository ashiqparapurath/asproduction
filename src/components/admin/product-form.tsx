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
import { useFirebase, useUser } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useState } from 'react';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  category: z.enum(['Electronics', 'Apparel', 'Books']),
  imageFile: z.instanceof(File).optional(),
  imageUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  showPrice: z.boolean().default(true),
})
.refine(data => data.imageUrl || data.imageFile, {
    message: "Either an image URL or an image file must be provided.",
    path: ["imageFile"],
});


type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onFinished: () => void;
}

export function ProductForm({ product, onFinished }: ProductFormProps) {
  const { firestore, firebaseApp } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const isEditMode = !!product;
  const storage = firebaseApp ? getStorage(firebaseApp) : null;

  const [imagePreview, setImagePreview] = useState<string | null>(product?.imageUrl || null);


  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || 'Apparel',
      imageUrl: product?.imageUrl || '',
      showPrice: product?.showPrice ?? true,
      imageFile: undefined,
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
      form.setValue('imageFile', file);
      form.setValue('imageUrl', ''); // Clear imageUrl if a file is selected
      form.clearErrors('imageFile'); 
      form.clearErrors('imageUrl');
    }
  };


  const onSubmit = async (data: ProductFormValues) => {
    if (!firestore || !user || !storage) {
        toast({
            variant: 'destructive',
            title: 'Authentication or Storage Error',
            description: 'You must be signed in and storage must be available.',
        });
        return;
    }
    
    let imageUrl = data.imageUrl || product?.imageUrl || '';

    if (data.imageFile) {
        try {
            const imageId = uuidv4();
            const storageRef = ref(storage, `products/${user.uid}/${imageId}`);
            await uploadBytes(storageRef, data.imageFile);
            imageUrl = await getDownloadURL(storageRef);
        } catch (error) {
            console.error("Image upload failed:", error);
            toast({
                variant: "destructive",
                title: "Image Upload Failed",
                description: "Could not upload the new image. Please try again.",
            });
            return;
        }
    }


    const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        showPrice: data.showPrice,
        imageUrl: imageUrl,
    };
    
    try {
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
         toast({
            variant: 'destructive',
            title: 'Failed to save product',
            description: error.message || 'An unexpected error occurred.',
        });
    }
  };

  const { isSubmitting } = form.formState;

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
                disabled={isSubmitting} 
                className="file:text-foreground"
            />
          </FormControl>
          <FormDescription>
            Upload an image from your computer. This will replace any existing image url.
          </FormDescription>
          <FormMessage />
        </FormItem>
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
        <Button type="submit" disabled={isSubmitting} className="w-full">
           {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
}
