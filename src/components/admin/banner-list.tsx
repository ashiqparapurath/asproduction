'use client';

import { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import type { Banner } from '@/lib/products';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { BannerDialog } from './banner-dialog';
import { deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';

export function BannerList() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const bannersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'banners');
  }, [firestore]);

  const { data: banners, isLoading } = useCollection<Banner>(bannersQuery);

  const [bannerToEdit, setBannerToEdit] = useState<Banner | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const handleEdit = (banner: Banner) => {
    setBannerToEdit(banner);
    setIsEditOpen(true);
  };

  const handleDelete = (banner: Banner) => {
    setBannerToDelete(banner);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (bannerToDelete && firestore) {
      const docRef = doc(firestore, 'banners', bannerToDelete.id);
      deleteDocumentNonBlocking(docRef);
      toast({
        title: 'Banner Deleted',
        description: `The banner "${bannerToDelete.title}" has been removed.`,
      });
      setIsDeleteConfirmOpen(false);
      setBannerToDelete(null);
    }
  };
  
  const handleToggleActive = (banner: Banner) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'banners', banner.id);
    updateDocumentNonBlocking(docRef, { isActive: !banner.isActive, updatedAt: serverTimestamp() });
    toast({
        title: "Banner status updated",
        description: `"${banner.title}" is now ${!banner.isActive ? 'active' : 'inactive'}.`
    });
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, 'PPpp');
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners && banners.length > 0 ? (
              banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell>
                     <div className="relative w-16 h-9 rounded-md overflow-hidden border">
                        <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{banner.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                        <Switch
                            checked={banner.isActive}
                            onCheckedChange={() => handleToggleActive(banner)}
                            aria-label="Toggle banner status"
                        />
                        <span className="text-sm">{banner.isActive ? "Active" : "Inactive"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(banner.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(banner)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(banner)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No banners found. Add one to get started!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {bannerToEdit && (
         <BannerDialog
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          banner={bannerToEdit}
        />
      )}

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the banner
              "{bannerToDelete?.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
