
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CategoryForm } from './category-form';
import type { Category } from '@/lib/products';

interface CategoryDialogProps {
  children?: React.ReactNode;
  category?: Category;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CategoryDialog({ children, category, isOpen, onOpenChange }: CategoryDialogProps) {
  const isEditMode = !!category;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of your category.' : 'Fill in the details for the new category.'}
          </DialogDescription>
        </DialogHeader>
        <CategoryForm category={category} onFinished={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
