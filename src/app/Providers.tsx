"use server";

import { ThemeProvider } from "next-themes";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "@/components/ui/sonner";
import { validateRequest } from "@/auth";
import { ProductQuickViewProvider } from "@/context/ProductQuickViewContext";
import { CartProvider } from "@/context/CartContext";
import SessionProvider from "./sessionProvider";

export default async function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  // if (!session.user) redirect("/login");
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SessionProvider value={session}>
        <WishlistProvider>
          <ProductQuickViewProvider>
            {/* <ClientOnly fallback={<CartLoadingFallback />}> */}
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
            {/* </ClientOnly> */}
          </ProductQuickViewProvider>
        </WishlistProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
