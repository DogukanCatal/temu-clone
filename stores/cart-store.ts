import {
  getOrCreateCart,
  syncCartWithUser,
  updateCartItem,
} from "@/actions/cart-actions";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
};

type CartStore = {
  items: CartItem[];
  isLoaded: boolean;
  isOpen: boolean;
  cartId: string | null;
  setStore: (store: Partial<CartStore>) => void;
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  open: () => void;
  close: () => void;
  setLoaded: (loaded: boolean) => void;
  syncWithUser: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoaded: false,
      cartId: null,

      setStore: (store) => set(store),

      addItem: async (item) => {
        const { cartId, items } = get();
        if (!cartId) return;

        // 1. Optimistic UI: Önce local state güncellenir
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              ...state,
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { ...state, items: [...state.items, item] };
        });

        try {
          // 2. Async olarak veritabanına istek atılır
          const updatedCart = await updateCartItem(cartId, item.id, {
            title: item.title,
            price: item.price,
            image: item.image,
            quantity: item.quantity,
          });

          // 3. Başarılı olursa cartId güncellenir
          set((state) => ({ ...state, cartId: updatedCart.id }));
        } catch (error) {
          console.error("Add item failed:", error);
          // 4. Hata olursa local state eski haline getirilir
          set({ items });
        }
      },

      removeItem: async (id) => {
        const { cartId, items } = get();
        if (!cartId) return;

        // 1. Optimistic UI: Local state'ten ürünü çıkar
        set((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== id),
        }));

        try {
          // 2. Async olarak veritabanına istek atılır
          const updatedCart = await updateCartItem(cartId, id, { quantity: 0 });

          // 3. Başarılı olursa cartId güncellenir
          set((state) => ({ ...state, cartId: updatedCart.id }));
        } catch (error) {
          console.error("Remove item failed:", error);
          // 4. Hata olursa eski state geri getirilir
          set({ items });
        }
      },

      updateQuantity: async (id, quantity) => {
        const { cartId, items } = get();
        if (!cartId) return;

        // 1. Optimistic UI: Önce local state güncellenir
        set((state) => ({
          ...state,
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));

        try {
          // 2. Async olarak veritabanına istek atılır
          const updatedCart = await updateCartItem(cartId, id, { quantity });

          // 3. Başarılı olursa cartId güncellenir
          set((state) => ({ ...state, cartId: updatedCart.id }));
        } catch (error) {
          console.error("Update quantity failed:", error);
          // 4. Hata olursa eski state geri getirilir
          set({ items });
        }
      },

      syncWithUser: async () => {
        const { cartId } = get();
        if (!cartId) {
          const cart = await getOrCreateCart();
          set((state) => ({
            ...state,
            cartId: cart.id,
            items: cart.items,
          }));
        }
        const syncedCart = await syncCartWithUser(cartId);
        if (syncedCart) {
          set((state) => ({
            ...state,
            cartId: syncedCart.id,
            items: syncedCart.items,
          }));
        }
      },

      clearCart: () => {
        set((state) => ({ ...state, items: [] }));
      },

      open: () => {
        set((state) => ({ ...state, isOpen: true }));
      },

      close: () => {
        set((state) => ({ ...state, isOpen: false }));
      },

      setLoaded: (loaded) => {
        set((state) => ({ ...state, isLoaded: loaded }));
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: "cart-storage",
      skipHydration: true,
    }
  )
);
