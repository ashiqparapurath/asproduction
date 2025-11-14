export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Electronics' | 'Apparel' | 'Books';
  imageId: string;
};

// This static data is no longer used. Products are now fetched from Firestore.
export const products: Product[] = [];
