"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem } from "../types";

export type { CartItem };

type CartState = {
  items: CartItem[];
  isHydrated: boolean;
  add: (productId: string, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  total: (getPriceById: (id: string) => number) => number;
};

const isServer = typeof window === "undefined";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: isServer,
      add: (productId, qty = 1) => {
        if (qty <= 0) {
          return;
        }

        set((state) => {
          const index = state.items.findIndex((item) => item.productId === productId);

          if (index >= 0) {
            const updated = [...state.items];
            updated[index] = { ...updated[index], qty: updated[index].qty + qty };
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
      total: (getPriceById) =>
        get().items.reduce(
          (total, item) => total + getPriceById(item.productId) * item.qty,
          0
        ),
    }),
    {
      name: "motorlider-cart-v1",
      partialize: (state) => ({ items: state.items }),
      storage:
        typeof window !== "undefined"
          ? createJSONStorage<CartState>(() => window.localStorage)
          : undefined,
    }
  )
);

if (!isServer) {
  useCartStore.persist.onFinishHydration(() => {
    useCartStore.setState({ isHydrated: true });
  });
}

export const useCartItems = () => useCartStore((state) => state.items);
export const useCartIsHydrated = () => useCartStore((state) => state.isHydrated);
export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((total, item) => total + item.qty, 0));
export const useCartTotal = (getPriceById: (id: string) => number) =>
  useCartStore((state) =>
    state.items.reduce(
      (total, item) => total + getPriceById(item.productId) * item.qty,
      0
    )
  );
