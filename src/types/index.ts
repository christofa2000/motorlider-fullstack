export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number; // value in cents
  brand?: string | null;
  image: string;
  categoryId: string;
  stock: number;
  category?: Category;
}

export interface CartItem {
  productId: string;
  qty: number;
}

