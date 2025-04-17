// "use client";

import { useCallback } from "react";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "@/app/actions/cartActions";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

// Define cart item type
export interface CartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  subtotal: number;
  name: string;
  slug: string;
  sku: string;
  image: {
    url: string;
    alt: string;
  } | null;
  variant?: {
    id: string;
    name: string;
    sku: string;
    price: number;
  } | null;
}

// Thông báo
const MESSAGES = {
  success: {
    itemAdded: "Đã thêm sản phẩm vào giỏ hàng",
    cartUpdated: "Đã cập nhật giỏ hàng",
    itemRemoved: "Đã xóa sản phẩm khỏi giỏ hàng",
    cartCleared: "Đã xóa giỏ hàng",
  },
  error: {
    loadFailed: "Không thể tải giỏ hàng",
    addFailed: "Không thể thêm sản phẩm",
    updateFailed: "Không thể cập nhật giỏ hàng",
    removeFailed: "Không thể xóa sản phẩm",
    clearFailed: "Không thể xóa giỏ hàng",
  },
};

// Define cart store state
interface CartState {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
  isLoading: boolean;
  isInitialized: boolean;
  lastUpdated: number;
}

interface CartActions {
  refreshCart: () => Promise<void>;
  addItem: (
    productId: string,
    quantity?: number,
    variantId?: string
  ) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

// Create global cart store with fixed persist middleware
const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      cartCount: 0,
      subtotal: 0,
      taxTotal: 0,
      shippingTotal: 0,
      grandTotal: 0,
      isLoading: false,
      isInitialized: false,
      lastUpdated: Date.now(),

      refreshCart: async () => {
        // Prevent multiple simultaneous refreshes
        if (get().isLoading) return;

        set({ isLoading: true });

        try {
          const result = await getCart();

          if (result.success && result.data) {
            set({
              items: result.data.items || [],
              cartCount: result.data.itemCount || 0,
              subtotal: result.data.subtotal || 0,
              taxTotal: result.data.taxTotal || 0,
              shippingTotal: result.data.shippingTotal || 0,
              grandTotal: result.data.grandTotal || 0,
              isLoading: false,
              isInitialized: true,
              lastUpdated: Date.now(),
            });
          } else {
            set({
              items: [],
              cartCount: 0,
              subtotal: 0,
              taxTotal: 0,
              shippingTotal: 0,
              grandTotal: 0,
              isLoading: false,
              isInitialized: true,
              lastUpdated: Date.now(),
            });
            if (result.error) {
              console.error(result.error);
            }
          }
        } catch (error) {
          console.error("Error fetching cart:", error);
          set({
            isLoading: false,
            isInitialized: true,
            lastUpdated: Date.now(),
          });
        }
      },

      addItem: async (productId, quantity = 1, variantId) => {
        if (get().isLoading) return;

        const previousItems = get().items;
        const tempId = `temp-${Date.now()}`;
        const optimisticItem: CartItem = {
          id: tempId,
          productId,
          variantId: variantId || null,
          quantity,
          price: 0,
          subtotal: 0,
          name: "Đang tải...",
          slug: "",
          sku: "",
          image: null,
        };

        // Tạm thời thêm sản phẩm vào local state
        set((state) => ({
          items: [...state.items, optimisticItem],
          cartCount: state.cartCount + quantity,
          isLoading: true,
        }));

        try {
          const result = await addToCart(productId, quantity, variantId);

          if (result.success) {
            await get().refreshCart();
            toast.success(MESSAGES.success.itemAdded);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("cart-updated"));
            }
          } else {
            throw new Error(result.error || MESSAGES.error.addFailed);
          }
        } catch (error) {
          console.error("Optimistic add failed:", error);
          toast.error(MESSAGES.error.addFailed);
          // Khôi phục lại state cũ nếu thất bại
          set({ items: previousItems });
        } finally {
          set({ isLoading: false });
        }
      },

      updateItem: async (itemId, quantity) => {
        if (get().isLoading) return;

        const previousItems = get().items;
        const currentItem = previousItems.find((item) => item.id === itemId);
        if (!currentItem) return;

        // Cập nhật local state trước (optimistic)
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity,
                  subtotal: item.price * quantity,
                }
              : item
          ),
          isLoading: true,
        }));

        try {
          const result = await updateCartItem(itemId, quantity);

          if (result.success) {
            await get().refreshCart();
            toast.success(MESSAGES.success.cartUpdated);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("cart-updated"));
            }
          } else {
            throw new Error(result.error || MESSAGES.error.updateFailed);
          }
        } catch (error) {
          console.error("Optimistic update failed:", error);
          toast.error(MESSAGES.error.updateFailed);
          // Rollback về state cũ nếu thất bại
          set({ items: previousItems });
        } finally {
          set({ isLoading: false });
        }
      },

      removeItem: async (itemId) => {
        if (get().isLoading) return;

        const previousItems = get().items;
        const removedItem = previousItems.find((item) => item.id === itemId);
        if (!removedItem) return;

        // Cập nhật local state trước (optimistic)
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
          cartCount: state.cartCount - removedItem.quantity,
          isLoading: true,
        }));

        try {
          const result = await removeFromCart(itemId);

          if (result.success) {
            await get().refreshCart();
            toast.success(MESSAGES.success.itemRemoved);
            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("cart-updated"));
            }
          } else {
            throw new Error(result.error || MESSAGES.error.removeFailed);
          }
        } catch (error) {
          console.error("Optimistic remove failed:", error);
          toast.error(MESSAGES.error.removeFailed);
          // Rollback về state cũ nếu thất bại
          set({ items: previousItems });
        } finally {
          set({ isLoading: false });
        }
      },
      openCart: async () => {
        if (get().isLoading) return;
        await get().refreshCart();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("cart-updated"));
        }
          
      },


      clearCart: async () => {
        if (get().isLoading) return;

        const previousItems = get().items;

        // Optimistically clear cart
        set({
          items: [],
          cartCount: 0,
          subtotal: 0,
          taxTotal: 0,
          shippingTotal: 0,
          grandTotal: 0,
          isLoading: true,
        });

        try {
          const result = await clearCart();

          if (result.success) {
            toast.success(MESSAGES.success.cartCleared);

            // Optional: refreshCart để đảm bảo sync dữ liệu
            await get().refreshCart();

            if (typeof window !== "undefined") {
              window.dispatchEvent(new Event("cart-updated"));
            }
          } else {
            throw new Error(result.error || MESSAGES.error.clearFailed);
          }
        } catch (error) {
          console.error("Optimistic clear failed:", error);
          toast.error(MESSAGES.error.clearFailed);
          // Rollback nếu xóa thất bại
          set({ items: previousItems });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "cart-storage", // tên key trong localStorage
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      partialize: (state) => ({
        items: state.items,
        cartCount: state.cartCount,
        subtotal: state.subtotal,
        taxTotal: state.taxTotal,
        shippingTotal: state.shippingTotal,
        grandTotal: state.grandTotal,
      }),
    }
  )
);

// Custom hook that wraps the Zustand store
export function useCart() {
  const cartStore = useCartStore();

  const init = useCallback(async () => {
    if (!cartStore.isInitialized && !cartStore.isLoading) {
      await cartStore.refreshCart();
    }
  }, [cartStore]);

  return {
    // Cart state
    items: cartStore.items,
    cartCount: cartStore.cartCount,
    totals: {
      subtotal: cartStore.subtotal,
      taxTotal: cartStore.taxTotal,
      shippingTotal: cartStore.shippingTotal,
      grandTotal: cartStore.grandTotal,
    },
    isLoading: cartStore.isLoading,
    isInitialized: cartStore.isInitialized,

    // Cart functions
    init,
    refreshCart: cartStore.refreshCart,
    addItem: cartStore.addItem,
    updateItem: cartStore.updateItem,
    removeItem: cartStore.removeItem,
    clear: cartStore.clearCart,
  };
}

// Set up a global event listener
let isListenerRegistered = false;

export function setupCartListener() {
  if (typeof window !== "undefined" && !isListenerRegistered) {
    window.addEventListener("cart-updated", () => {
      // Refresh cart when cart-updated event is triggered
      useCartStore.getState().refreshCart();
    });
    isListenerRegistered = true;
    console.log("Cart listener initialized");
    return true;
  }
  return false;
}

// Public function to trigger cart refresh from anywhere
export function triggerCartRefresh() {
  useCartStore.getState().refreshCart();
}
