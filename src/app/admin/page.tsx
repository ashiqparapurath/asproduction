'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductList } from '@/components/admin/product-list';
import { ProductDialog } from '@/components/admin/product-dialog';
import { BannerList } from '@/components/admin/banner-list';
import { BannerDialog } from '@/components/admin/banner-dialog';
import { CategoryList } from '@/components/admin/category-list';
import { CategoryDialog } from '@/components/admin/category-dialog';
import { EnquirySettingsForm } from '@/components/admin/enquiry-settings-form';
import { LifeBuoy } from 'lucide-react';

function AdminContent() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const adminRoleRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [user, firestore]);

  const { data: adminRole, isLoading: isAdminLoading } = useDoc(adminRoleRef);

  const handleSignOut = async () => {
    if (auth) {
      setIsSigningOut(true);
      try {
        await auth.signOut();
        router.replace('/');
      } catch (error) {
        console.error("Sign out failed:", error);
        setIsSigningOut(false);
      }
    }
  };

  const handleContactDeveloper = () => {
    // Replace with your actual WhatsApp number, including the country code without '+'
    const developerPhoneNumber = '97430147881'; 
    const message = encodeURIComponent("Hello, I need assistance with the AS PRODUCTION admin panel.");
    const whatsappUrl = `https://wa.me/${developerPhoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isAdminLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!adminRole) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">
          You do not have the necessary permissions to view this page.
        </p>
        <Button onClick={handleSignOut} variant="outline" className="mt-4" disabled={isSigningOut}>
          {isSigningOut ? 'Signing Out...' : 'Sign Out & Go Home'}
        </Button>
      </div>
    );
  }

  const renderAddButton = () => {
    switch(activeTab) {
      case 'products':
        return (
          <ProductDialog isOpen={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <Button onClick={() => setIsProductDialogOpen(true)}>Add New Product</Button>
          </ProductDialog>
        );
      case 'banners':
        return (
          <BannerDialog isOpen={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
            <Button onClick={() => setIsBannerDialogOpen(true)}>Add New Banner</Button>
          </BannerDialog>
        );
      case 'categories':
        return (
           <CategoryDialog isOpen={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <Button onClick={() => setIsCategoryDialogOpen(true)}>Add New Category</Button>
          </CategoryDialog>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Admin Panel
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your store's content and settings here.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={handleContactDeveloper} variant="outline" size="sm">
            <LifeBuoy className="mr-2 h-4 w-4" />
            Contact Developer
          </Button>
          <Button onClick={handleSignOut} variant="outline" size="sm" disabled={isSigningOut}>
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="products">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
           <div className="flex items-center">
              {renderAddButton()}
          </div>
        </div>
        <TabsContent value="products">
          <ProductList />
        </TabsContent>
        <TabsContent value="banners">
          <BannerList />
        </TabsContent>
        <TabsContent value="categories">
          <CategoryList />
        </TabsContent>
        <TabsContent value="settings">
          <EnquirySettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="container py-12 md:py-20 lg:py-24">
            <div className="space-y-4">
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-12 md:py-20 lg:py-24">
          <AdminContent />
        </div>
      </main>
    </div>
  );
}
