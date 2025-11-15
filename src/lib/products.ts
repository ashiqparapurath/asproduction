export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Electronics' | 'Apparel' | 'Books';
  imageUrls: string[]; 
  showPrice: boolean;
  createdAt?: any;
  updatedAt?: any;
};

export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
};


// This static data is no longer used. Products are now fetched from Firestore.
export const products: Product[] = [];
