"use client";

import { getMockProductById } from "@/data";
import type { Product } from "@/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CartItem = {
  productId: string;
  qty: number;
};

export type { CartItem };

type CartState = {
  items: CartItem[];
  products: Record<string, Product>;
  isHydrated: boolean;
  add: (product: Product, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      products: {},
      isHydrated: false,
      add: (product, qty = 1) => {
        if (qty <= 0) {
          return;
        }

        set((state) => {
          const items = [...state.items];
          const index = items.findIndex((item) => item.productId === product.id);

          if (index >= 0) {
            items[index] = {
              ...items[index],
              qty: items[index].qty + qty,
            };
          } else {
            items.push({ productId: product.id, qty });
          }

          return {
            items,
            products: {
              ...state.products,
              [product.id]: product,
            },
          };
        });
      },
      remove: (productId) => {
        set((state) => {
          const { [productId]: _removed, ...restProducts } = state.products;
          return {
            items: state.items.filter((item) => item.productId !== productId),
            products: restProducts,
          };
        });
      },
      setQty: (productId, qty) => {
        if (qty <= 0) {
          set((state) => {
            const { [productId]: _removed, ...restProducts } = state.products;
            return {
              items: state.items.filter((item) => item.productId !== productId),
              products: restProducts,
            };
          });
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, qty } : item
          ),
        }));
      },
      clear: () => set({ items: [], products: {} }),
      count: () => get().items.reduce((total, item) => total + item.qty, 0),
      total: () =>
        get().items.reduce((total, item) => {
          const product = get().products[item.productId];
          if (!product) {
            return total;
          }

          return total + product.price * item.qty;
        }, 0),
    }),
    {
      name: "motorlider-cart-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        products: state.products,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);

export const useCartItems = () => useCartStore((state) => state.items);
export const useCartProducts = () => useCartStore((state) => state.products);
export const useCartIsHydrated = () =>
  useCartStore((state) => state.isHydrated);
export const useCartCount = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.qty, 0)
  );
export const useCartTotal = () => useCartStore((state) => state.total());





