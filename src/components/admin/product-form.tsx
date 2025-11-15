
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
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useState, useRef } from 'react';
import { useUser } from '@/firebase';
import { X, UploadCloud, PlusCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { CategoryDialog } from './category-dialog';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const MAX_IMAGES = 5;

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  category: z.string().min(1, 'Please select a category.'),
  imageUrls: z.array(z.string()).min(1, "At least one image is required.").max(MAX_IMAGES, `You can upload a maximum of ${MAX_IMAGES} images.`),
  showPrice: z.boolean().default(true),
});


type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product;
  onFinished: () => void;
}

type Category = {
  id: string;
  name: string;
}

export function ProductForm({ product, onFinished }: ProductFormProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const isEditMode = !!product;
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>(product?.imageUrls || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);

  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'categories');
  }, [firestore]);

  const { data: categories, isLoading: isLoadingCategories } = useCollection<Category>(categoriesQuery);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      category: product?.category || '',
      imageUrls: product?.imageUrls || [],
      showPrice: product?.showPrice ?? true,
    },
    mode: 'onChange',
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const currentImageCount = imagePreviews.length;
    if (currentImageCount + files.length > MAX_IMAGES) {
      form.setError("imageUrls", { type: "manual", message: `You can only upload a total of ${MAX_IMAGES} images.`});
      return;
    }

    const newPreviews: string[] = [];
    const newImageUrls = form.getValues('imageUrls') || [];
    
    Array.from(files).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        form.setError("imageUrls", { type: "manual", message: `File "${file.name}" is too large (max 1MB).` });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        newPreviews.push(result);
        newImageUrls.push(result);
        if (newPreviews.length === files.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
            form.setValue('imageUrls', newImageUrls, { shouldValidate: true });
        }
      };
      reader.readAsDataURL(file);
    });

    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImagePreviews = [...imagePreviews];
    newImagePreviews.splice(index, 1);
    setImagePreviews(newImagePreviews);
    form.setValue('imageUrls', newImagePreviews, { shouldValidate: true });
  }

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
        if (data.imageUrls.length === 0 || data.imageUrls.length > MAX_IMAGES) {
             toast({
                variant: "destructive",
                title: "Validation Error",
                description: `You must upload between 1 and ${MAX_IMAGES} images.`,
            });
            setIsSubmitting(false);
            return;
        }
        await saveProduct(data);
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
  
  const saveProduct = async (data: ProductFormValues) => {
    if (!firestore) return;
    const productData = {
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      showPrice: data.showPrice,
      imageUrls: data.imageUrls,
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
    setIsSubmitting(false);
  };

  return (
    <>
    <CategoryDialog isOpen={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen} />
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
          <FormField
              control={form.control}
              name="imageUrls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Images</FormLabel>
                   <FormControl>
                     <div
                      className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG (MAX 1MB each)</p>
                      <Input 
                        type="file" 
                        accept="image/png, image/jpeg" 
                        multiple
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="sr-only"
                        disabled={isSubmitting || imagePreviews.length >= MAX_IMAGES}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    You can upload between 1 and {MAX_IMAGES} images.
                  </FormDescription>
                  
                  {imagePreviews.length > 0 && (
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {imagePreviews.map((previewUrl, index) => (
                        <div key={index} className="relative w-full aspect-square rounded-md overflow-hidden border">
                          <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                          <Button 
                            type="button" 
                            variant="destructive" 
                            size="icon" 
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4"/>
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
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
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      {isLoadingCategories ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories && categories.length > 0 ? (
                                categories.map((category) => (
                                  <SelectItem key={category.id} value={category.name}>
                                    {category.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="p-4 text-sm text-muted-foreground">No categories found.</div>
                              )}
                            </SelectContent>
                          </Select>
                          <Button type="button" variant="outline" size="icon" onClick={() => setIsCategoryDialogOpen(true)}>
                              <PlusCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description..." {...field} disabled={isSubmitting} rows={5} />
                  </FormControl>
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
                     <FormDescription>Display the product price on the store.</FormDescription>
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
        
        <Button type="submit" disabled={isSubmitting || !form.formState.isValid} className="w-full">
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </form>
    </Form>
    </>
  );
}
