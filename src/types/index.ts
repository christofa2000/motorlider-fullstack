export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  brand?: string;
  image: string;
  categoryId: string;
  stock: number;
}

export interface CartItem {
  productId: string;
  qty: number;
}
