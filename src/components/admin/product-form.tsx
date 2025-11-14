'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { useFirestore, useAuth, useUser } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import type { User } from 'firebase/auth';


const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  category: z.enum(['Electronics', 'Apparel', 'Books']),
  image: z.any().optional(),
  showPrice: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onFinished: () => void;
}

const uploadImage = (file: File, user: User): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!user) {
        return reject(new Error("User not authenticated for upload. Please sign in again."));
      }

      const storage = getStorage();
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // This state update is handled by the component using the promise
        },
        (error) => {
          console.error('Upload failed:', error);
          if (error.code === 'storage/unauthorized') {
            reject(new Error('Permission denied. You might not have the rights to upload to this location.'));
          } else {
            reject(error);
          }
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(resolve).catch(reject);
        }
      );
    });
  };

export function ProductForm({ product, onFinished }: ProductFormProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const isEditMode = !!product;

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          showPrice: product.showPrice,
        }
      : {
          name: '',
          description: '',
          price: 0,
          category: 'Apparel',
          showPrice: true,
        },
  });

  const onSubmit = async (data: ProductFormValues) => {
    if (!firestore || !user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be signed in to create or update products.',
        });
        return;
    }
    
    let imageUrl = product?.imageUrl; 

    const imageFile = data.image?.[0];
    if (imageFile) {
        setUploadProgress(0);
        try {
            const storage = getStorage();
            const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
            const uploadTask = uploadBytesResumable(storageRef, imageFile);
            
            await new Promise<void>((resolve, reject) => {
                 uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                      setUploadProgress(progress);
                    },
                    (error) => {
                      console.error('Upload failed:', error);
                      setUploadProgress(null);
                      reject(error);
                    },
                    async () => {
                      try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        imageUrl = downloadURL;
                        resolve();
                      } catch (error) {
                        reject(error);
                      }
                    }
                );
            });

        } catch (error: any) {
            toast({
            variant: 'destructive',
            title: 'Image Upload Failed',
            description: error.message || 'Could not upload the image. Please try again.',
            });
            setUploadProgress(null);
            return; 
        } finally {
            setUploadProgress(null);
        }
    }

    if (!isEditMode && !imageUrl) {
        toast({
          variant: 'destructive',
          title: 'Image Required',
          description: 'Please select an image for the new product.',
        });
        return;
    }

    const productData: Partial<Product> & { name: string; description: string; price: number; category: "Electronics" | "Apparel" | "Books"; showPrice: boolean; imageUrl?: string} = {
        ...data,
        imageUrl,
    };
    // @ts-ignore
    delete productData.image; 


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
      // @ts-ignore
      addDocumentNonBlocking(collectionRef, newData);
      toast({
        title: 'Product Added',
        description: `${data.name} has been successfully added.`,
      });
    }
    onFinished();
  };

  const isSubmitting = form.formState.isSubmitting || uploadProgress !== null;

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
                <Input placeholder="Product Name" {...field} />
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
                <Textarea placeholder="Product description..." {...field} />
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
                <Input type="number" placeholder="99.99" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              <FormControl>
                 <Input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => field.onChange(e.target.files)}
                 />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         {uploadProgress !== null && (
          <Progress value={uploadProgress} className="w-full" />
        )}
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
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
           {uploadProgress !== null
            ? `Uploading... ${Math.round(uploadProgress)}%`
            : isSubmitting
            ? 'Saving...'
            : 'Save Product'}
        </Button>
      </form>
    </Form>
  );
}
