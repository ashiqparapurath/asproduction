export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Electronics' | 'Apparel' | 'Books';
  imageId: string;
};

export const products: Product[] = [
  { 
    id: 'prod_1', 
    name: 'Modern Laptop', 
    description: 'High-performance laptop for work and play, featuring a sleek design and a vibrant display.', 
    price: 1250.00, 
    category: 'Electronics', 
    imageId: 'prod_img_1'
  },
  { 
    id: 'prod_2', 
    name: 'Wireless Headphones', 
    description: 'Noise-cancelling over-ear headphones with superior sound quality and all-day comfort.', 
    price: 249.99, 
    category: 'Electronics', 
    imageId: 'prod_img_2'
  },
  { 
    id: 'prod_3', 
    name: 'Smart Watch', 
    description: 'Track your fitness, get notifications, and stay connected with this stylish smartwatch.', 
    price: 399.00, 
    category: 'Electronics', 
    imageId: 'prod_img_3'
  },
  { 
    id: 'prod_4', 
    name: 'Classic White T-Shirt', 
    description: 'A timeless wardrobe essential made from 100% premium cotton for ultimate softness.', 
    price: 29.50, 
    category: 'Apparel', 
    imageId: 'prod_img_4'
  },
  { 
    id: 'prod_5', 
    name: 'Cozy Fleece Hoodie', 
    description: 'Stay warm and stylish with this ultra-soft fleece hoodie, perfect for chilly days.', 
    price: 55.00, 
    category: 'Apparel', 
    imageId: 'prod_img_5'
  },
  { 
    id: 'prod_6', 
    name: 'Slim-Fit Denim Jeans', 
    description: 'A perfect pair of jeans that combines modern style with classic comfort and durability.', 
    price: 78.90, 
    category: 'Apparel', 
    imageId: 'prod_img_6'
  },
  { 
    id: 'prod_7', 
    name: 'Galaxy at War', 
    description: 'An epic sci-fi saga of interstellar conflict, ancient aliens, and the fate of humanity.', 
    price: 15.99, 
    category: 'Books', 
    imageId: 'prod_img_7'
  },
  { 
    id: 'prod_8', 
    name: 'The Art of Strategy', 
    description: 'A must-read for aspiring leaders, this book breaks down the principles of effective business strategy.', 
    price: 22.50, 
    category: 'Books', 
    imageId: 'prod_img_8'
  },
  { 
    id: 'prod_9', 
    name: 'World Cuisine', 
    description: 'Explore global flavors with this beautifully illustrated cookbook featuring over 200 recipes.', 
    price: 34.95, 
    category: 'Books', 
    imageId: 'prod_img_9'
  },
];
