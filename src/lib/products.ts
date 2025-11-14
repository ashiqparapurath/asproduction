export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Electronics' | 'Apparel' | 'Books';
  imageUrl: string; 
  showPrice: boolean;
  createdAt?: any;
  updatedAt?: any;
};

// This static data is no longer used. Products are now fetched from Firestore.
export const products: Product[] = [];
