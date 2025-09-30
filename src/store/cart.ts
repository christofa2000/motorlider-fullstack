"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem } from "@/types";
import { getPriceById } from "@/data";

export type { CartItem };

type CartState = {
  items: CartItem[];
  isHydrated: boolean;
  add: (productId: string, qty?: number) => void;
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
      isHydrated: false,
      add: (productId, qty = 1) => {
        if (qty <= 0) {
          return;
        }

        set((state) => {
          const index = state.items.findIndex(
            (item) => item.productId === productId
          );

          if (index >= 0) {
            const updated = [...state.items];
            updated[index] = {
              ...updated[index],
              qty: updated[index].qty + qty,
            };
            return { items: updated };
          }

          return {
            items: [...state.items, { productId, qty }],
          };
        });
      },
      remove: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      setQty: (productId, qty) => {
        if (qty <= 0) {
          set((state) => ({
            items: state.items.filter((item) => item.productId !== productId),
          }));
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, qty } : item
          ),
        }));
      },
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((total, item) => total + item.qty, 0),
      total: () =>
        get().items.reduce(
          (total, item) => total + getPriceById(item.productId) * item.qty,
          0
        ),
    }),
    {
      name: "motorlider-cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);

export const useCartItems = () => useCartStore((state) => state.items);
export const useCartIsHydrated = () =>
  useCartStore((state) => state.isHydrated);
export const useCartCount = () =>
  useCartStore((state) =>
    state.items.reduce((total, item) => total + item.qty, 0)
  );
export const useCartTotal = () => useCartStore((state) => state.total());
