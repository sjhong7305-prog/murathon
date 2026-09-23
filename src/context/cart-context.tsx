"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { CartItem } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  addItem: (productId: string, price: number, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updatePrice: (productId: string, price: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    fetch("/api/cart")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CartItem[]) => setItems(data))
      .catch(() => {
        // ignore network errors; cart stays empty until next successful sync
      });
  }, []);

  const addItem = (productId: string, price: number, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === productId
            ? { ...i, price, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { productId, price, quantity }];
    });
    fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, price, quantity }),
    }).catch(() => {});
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    fetch(`/api/cart?productId=${encodeURIComponent(productId)}`, {
      method: "DELETE",
    }).catch(() => {});
  };

  const updatePrice = (productId: string, price: number) => {
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, price } : i))
    );
    fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, price }),
    }).catch(() => {});
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const safeQuantity = Math.max(1, quantity);
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: safeQuantity } : i
      )
    );
    fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: safeQuantity }),
    }).catch(() => {});
  };

  const clearCart = () => {
    setItems([]);
    fetch("/api/cart", { method: "DELETE" }).catch(() => {});
  };

  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );
  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updatePrice,
        updateQuantity,
        clearCart,
        totalPrice,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
