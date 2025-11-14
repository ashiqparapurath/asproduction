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
import type { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useState } from 'react';
import Image from 'next/image';
import { uploadImage } from '@/ai/flows/upload-image-flow';


const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  category: z.enum(['Electronics', 'Apparel', 'Books']),
  imageFile: z.instanceof(File).optional(),
  imageUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  showPrice: z.boolean().default(true),
})
.refine(data => {
    // If we are editing and an imageUrl already exists, imageFile is optional.
    // In all other cases (creating, or editing without an imageUrl), imageFile is required.
    return !!data.imageUrl || !!data.imageFile;
}, {
    message: "An image file must be provided.",
    path: ["imageFile"],
});


type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onFinished: () => void;
}

export function ProductForm({ product, onFinished }: ProductFormProps) {
  const { firestore } = useFirebase();
  const { user } = useUser();
  const { toast } = useToast();
  const isEditMode = !!product;

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
      form.setValue('imageFile', file, { shouldValidate: true });
      form.setValue('imageUrl', ''); // Clear imageUrl when a new file is selected
    }
  };


  const onSubmit = async (data: ProductFormValues) => {
    if (!firestore || !user) {
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: 'You must be signed in to save a product.',
        });
        return;
    }
    
    form.control.register('name', { disabled: true });

    let finalImageUrl = product?.imageUrl || '';

    // Manually trigger form submission state
    form.control.register('name', { disabled: true });


    if (data.imageFile) {
        try {
            const reader = new FileReader();
            const fileAsDataURL = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(data.imageFile!);
            });
            
            const result = await uploadImage({
                fileDataUri: fileAsDataURL,
                fileName: data.imageFile.name,
                userId: user.uid,
            });

            if (result.downloadUrl) {
                finalImageUrl = result.downloadUrl;
            } else {
                throw new Error("Image upload failed to return a URL.");
            }

        } catch (error) {
            console.error("Image upload failed:", error);
            toast({
                variant: "destructive",
                title: "Image Upload Failed",
                description: "Could not upload the new image. Please try again.",
            });
            form.control.register('name', { disabled: false }); // Re-enable on error
            return;
        }
    }


    const productData = {
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        showPrice: data.showPrice,
        imageUrl: finalImageUrl,
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
    } finally {
        form.control.register('name', { disabled: false }); // Re-enable form after completion
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
        <FormField
            control={form.control}
            name="imageFile"
            render={() => (
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
                Upload an image from your computer.
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
