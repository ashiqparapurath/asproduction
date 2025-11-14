'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ProductForm } from './product-form';
import type { Product } from '@/lib/products';

interface ProductDialogProps {
  children?: React.ReactNode;
  product?: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({ children, product, isOpen, onOpenChange }: ProductDialogProps) {
  const isEditMode = !!product;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of your product.' : 'Fill in the details for the new product.'}
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={product} onFinished={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
