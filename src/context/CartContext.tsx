// "use client";

// import { createContext, useContext, useEffect } from "react";
// import {
//   useCart,
//   setupCartListener,
//   triggerCartRefresh,
// } from "@/hooks/useCart";

// // Tạo cart context với đầy đủ các giá trị và hàm từ useCart hook
// const CartContext = createContext<ReturnType<typeof useCart> | undefined>(
//   undefined
// );

// export function CartProvider({ children }: { children: React.ReactNode }) {
//   // Sử dụng useCart hook để lấy dữ liệu giỏ hàng và các hàm
//   const cart = useCart();

//   // Khởi tạo giỏ hàng và thiết lập listener chỉ một lần khi component được mount
//   useEffect(() => {
//     // Khởi tạo dữ liệu giỏ hàng
//     cart.init();
//     // init();

//     // Thiết lập cart listener
//     setupCartListener();

//     // Thiết lập global event listener để cập nhật giỏ hàng
//     const handleCartUpdate = () => {
//       cart.refreshCart();
//     };

//     // Lắng nghe sự kiện cập nhật giỏ hàng
//     if (typeof window !== "undefined") {
//       window.addEventListener("cart-updated", handleCartUpdate);
//     }

//     // Cleanup khi component unmounted
//     return () => {
//       if (typeof window !== "undefined") {
//         window.removeEventListener("cart-updated", handleCartUpdate);
//       }
//     };
//   }, [cart]);

//   // Cung cấp giỏ hàng và các hàm thông qua Context
//   return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
// }

// // Hook để sử dụng cart context trong components
// export function useCartContext() {
//   const context = useContext(CartContext);
//   if (context === undefined) {
//     throw new Error("useCartContext must be used within a CartProvider");
//   }
//   return context;
// }

// // Hàm để thông báo giỏ hàng đã được cập nhật
// export function notifyCartUpdated() {
//   if (typeof window !== "undefined") {
//     window.dispatchEvent(new Event("cart-updated"));
//     triggerCartRefresh(); // Gọi hàm triggerCartRefresh từ useCart
//   }
// }
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  useCart,
  setupCartListener,
  triggerCartRefresh,
} from "@/hooks/useCart";
import { CartItemsSkeleton } from "@/components/cart/CartItems"; // Giả sử bạn có component này

// Tạo cart context
const CartContext = createContext<ReturnType<typeof useCart> | undefined>(
  undefined
);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Theo dõi trạng thái hydrated
  const [isHydrated, setIsHydrated] = useState(false);

  // Sử dụng useCart hook
  const cart = useCart();

  // Khởi tạo giỏ hàng và thiết lập hydration state
  useEffect(() => {
    // Thiết lập cart listener
    setupCartListener();

    // Khởi tạo dữ liệu giỏ hàng
    cart.init().then(() => {
      // Đánh dấu hydration đã hoàn tất
      setIsHydrated(true);
    });

    // Thiết lập global event listener để cập nhật giỏ hàng
    const handleCartUpdate = () => {
      cart.refreshCart();
    };

    // Lắng nghe sự kiện cập nhật giỏ hàng
    if (typeof window !== "undefined") {
      window.addEventListener("cart-updated", handleCartUpdate);
    }

    // Cleanup khi component unmounted
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("cart-updated", handleCartUpdate);
      }
    };
  }, [cart]);

  // Render children chỉ khi đã hydrated
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
}

// Hook để sử dụng cart context trong components
export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return context;
}

// Hàm để thông báo giỏ hàng đã được cập nhật
export function notifyCartUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
    triggerCartRefresh();
  }
}

// Tạo một component wrapper để xử lý hiển thị trong quá trình loading
export function CartAwareComponent({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isInitialized, isLoading } = useCartContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hiển thị fallback cho đến khi client-side hydration hoàn tất
  if (!mounted || !isInitialized) {
    return fallback || null;
  }

  return <>{children}</>;
}
export function ClientOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback || null;
  }

  return <>{children}</>;
}
