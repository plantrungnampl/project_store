// "use client";

// import { useState, useCallback, memo, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { Trash2, Minus, Plus, Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { formatPrice } from "@/lib/formatPrice";
// import { updateCartItem, removeFromCart } from "@/app/actions/cartActions";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { triggerCartRefresh, useCart } from "@/hooks/useCart";
// import { notifyCartUpdated } from "@/context/CartContext";
// import CartSummary from "./CartSummary";

// // Types
// interface CartItemImage {
//   url: string;
//   alt: string;
// }

// interface CartItemVariant {
//   id: string;
//   name: string;
//   sku: string;
// }

// interface CartItemData {
//   id: string;
//   productId: string;
//   variantId: string | null;
//   name: string;
//   slug: string;
//   price: number;
//   quantity: number;
//   subtotal: number;
//   image: CartItemImage | null;
//   variant: CartItemVariant | null;
// }

// interface CartItemsProps {
//   items: CartItemData[];
// }

// // Product image component
// const ProductImage = memo(
//   ({
//     image,
//     name,
//     slug,
//   }: {
//     image: CartItemImage | null;
//     name: string;
//     slug: string;
//     size?: "sm" | "md";
//   }) => {
//     const dimensions = {
//       sm: "h-20 w-20",
//       md: "h-24 w-24",
//     };
//     const sizePx = {
//       sm: "80px",
//       md: "96px",
//     };

//     const sizeClass = dimensions.sm;
//     const sizePxValue = sizePx.sm;

//     return (
//       <Link href={`/product/${slug}`} className="flex-shrink-0">
//         <div
//           className={`relative ${sizeClass} rounded-md overflow-hidden bg-gray-100 border border-gray-200`}
//         >
//           {image ? (
//             <Image
//               src={image.url}
//               alt={image.alt || name}
//               fill
//               className="object-cover"
//               sizes={sizePxValue}
//               priority={false}
//             />
//           ) : (
//             <div className="absolute inset-0 flex items-center justify-center text-gray-400">
//               <span className="text-xs">No image</span>
//             </div>
//           )}
//         </div>
//       </Link>
//     );
//   }
// );

// ProductImage.displayName = "ProductImage";

// // Quantity controls component
// const QuantityControls = memo(
//   ({
//     id,
//     quantity,
//     isLoading,
//     onUpdate,
//   }: {
//     id: string;
//     quantity: number;
//     isLoading: boolean;
//     onUpdate: (id: string, quantity: number) => Promise<void>;
//   }) => {
//     return (
//       <div className="flex items-center">
//         <Button
//           variant="outline"
//           size="icon"
//           className="h-8 w-8 rounded-r-none border-gray-200"
//           onClick={() => onUpdate(id, quantity - 1)}
//           disabled={quantity <= 1 || isLoading}
//           aria-label="Decrease quantity"
//         >
//           <Minus className="h-3 w-3" />
//         </Button>
//         <div className="h-8 w-12 flex items-center justify-center border-y border-gray-200 text-sm font-medium">
//           {isLoading ? (
//             <Loader2 className="h-3 w-3 animate-spin text-gray-400" />
//           ) : (
//             quantity
//           )}
//         </div>
//         <Button
//           variant="outline"
//           size="icon"
//           className="h-8 w-8 rounded-l-none border-gray-200"
//           onClick={() => onUpdate(id, quantity + 1)}
//           disabled={isLoading}
//           aria-label="Increase quantity"
//         >
//           <Plus className="h-3 w-3" />
//         </Button>
//       </div>
//     );
//   }
// );

// QuantityControls.displayName = "QuantityControls";

// // Remove button component
// const RemoveButton = memo(
//   ({
//     id,
//     isRemoving,
//     onRemove,
//     isMobile = false,
//   }: {
//     id: string;
//     isRemoving: boolean;
//     onRemove: (id: string) => Promise<void>;
//     isMobile?: boolean;
//   }) => {
//     return (
//       <Button
//         variant="ghost"
//         size="sm"
//         className={cn(
//           "h-7 text-gray-500 hover:text-red-600 p-0",
//           isMobile && "mt-1"
//         )}
//         onClick={() => onRemove(id)}
//         disabled={isRemoving}
//         aria-label="Remove item"
//       >
//         {isRemoving ? (
//           <Loader2 className="h-3 w-3 animate-spin mr-1" />
//         ) : (
//           <Trash2 className="h-3 w-3 mr-1" />
//         )}
//         <span className="text-xs">Xóa</span>
//       </Button>
//     );
//   }
// );

// RemoveButton.displayName = "RemoveButton";

// // Main Cart Items Component
// export default function CartItems({ items }: CartItemsProps) {
//   const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
//   const [removingItems, setRemovingItems] = useState<Record<string, boolean>>(
//     {}
//   );

//   // Handler for quantity changes
//   const handleQuantityChange = useCallback(
//     async (itemId: string, newQuantity: number) => {
//       if (newQuantity < 1) return;

//       setLoadingItems((prev) => ({ ...prev, [itemId]: true }));

//       try {
//         const result = await updateCartItem(itemId, newQuantity);
//         triggerCartRefresh();
//         notifyCartUpdated();
//         if (!result.success) {
//           toast("Không thể cập nhật số lượng", {
//             description: result.error,
//           });
//         }
//       } catch (err) {
//         console.log(err);

//         toast("Lỗi", {
//           description: "Đã có lỗi xảy ra khi cập nhật số lượng",
//         });
//       } finally {
//         setLoadingItems((prev) => ({ ...prev, [itemId]: false }));
//       }
//     },
//     []
//   );

//   // Handler for removing items
//   const handleRemoveItem = useCallback(async (itemId: string) => {
//     setRemovingItems((prev) => ({ ...prev, [itemId]: true }));

//     try {
//       const result = await removeFromCart(itemId);

//       // Bỏ comment hai dòng này để cập nhật giỏ hàng tự động
//       triggerCartRefresh();
//       notifyCartUpdated();

//       if (result.success) {
//         toast("Đã xóa sản phẩm", {
//           description: "Sản phẩm đã được xóa khỏi giỏ hàng zz",
//         });
//       } else {
//         toast("Không thể xóa sản phẩm", {
//           description: result.error,
//         });
//         // Reset removing state if failed
//         setRemovingItems((prev) => ({ ...prev, [itemId]: false }));
//       }
//     } catch (error) {
//       console.log(error);

//       toast("Lỗi", {
//         description: "Đã có lỗi xảy ra khi xóa sản phẩm",
//       });
//       setRemovingItems((prev) => ({ ...prev, [itemId]: false }));
//     }
//   }, []);

//   // If cart is empty, render empty state
//   if (items.length === 0) {
//     return (
//       <div className="bg-white rounded-lg shadow-sm p-8 text-center">
//         <h2 className="text-xl font-semibold text-gray-900 mb-2">
//           Giỏ hàng trống
//         </h2>
//         <p className="text-gray-500 mb-6">
//           Bạn chưa có sản phẩm nào trong giỏ hàng.
//         </p>
//         <Link
//           href="/products"
//           className="inline-flex items-center justify-center text-primary hover:text-primary/90 border border-primary hover:bg-primary/5 transition-colors px-6 py-2 rounded-md font-medium"
//         >
//           Tiếp tục mua sắm
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//       <div className="p-6 border-b border-gray-100">
//         <h2 className="text-xl font-semibold text-gray-900">
//           Sản phẩm trong giỏ hàng
//         </h2>
//       </div>

//       {/* Cart items table header - desktop only */}
//       <div className="hidden md:grid md:grid-cols-12 bg-gray-50 text-gray-500 text-sm py-3 px-6 border-b border-gray-100">
//         <div className="col-span-6">Sản phẩm</div>
//         <div className="col-span-2 text-center">Đơn giá</div>
//         <div className="col-span-2 text-center">Số lượng</div>
//         <div className="col-span-2 text-right">Thành tiền</div>
//       </div>

//       {/* Cart items list */}
//       <div className="divide-y divide-gray-100">
//         {items.map((item) => (
//           <div
//             key={item.id}
//             className={cn(
//               "p-6 transition-opacity duration-300",
//               removingItems[item.id] && "opacity-50"
//             )}
//             aria-busy={loadingItems[item.id] || removingItems[item.id]}
//           >
//             {/* Mobile layout */}
//             <div className="md:hidden space-y-4">
//               <div className="flex gap-4">
//                 {/* Product image */}
//                 <ProductImage
//                   image={item.image}
//                   name={item.name}
//                   slug={item.slug}
//                   size="md"
//                 />

//                 {/* Product info */}
//                 <div className="flex-1 min-w-0">
//                   <Link
//                     href={`/product/${item.slug}`}
//                     className="text-base font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2"
//                   >
//                     {item.name}
//                   </Link>

//                   {item.variant && (
//                     <Badge variant="outline" className="mt-1">
//                       {item.variant.name}
//                     </Badge>
//                   )}

//                   <div className="mt-1 text-sm text-gray-500 flex items-center">
//                     <span>SKU: {item.variant?.sku || "N/A"}</span>
//                   </div>

//                   <div className="mt-2 font-medium text-gray-900">
//                     {formatPrice(item.price)}
//                   </div>
//                 </div>
//               </div>
//               {/* Quantity controls and subtotal for mobile */}
//               <div className="flex items-center justify-between pt-2">
//                 <QuantityControls
//                   id={item.id}
//                   quantity={item.quantity}
//                   isLoading={loadingItems[item.id] || false}
//                   onUpdate={handleQuantityChange}
//                 />

//                 <div className="text-right">
//                   <div className="font-semibold text-gray-900">
//                     {formatPrice(item.subtotal)}
//                   </div>
//                   <RemoveButton
//                     id={item.id}
//                     isRemoving={removingItems[item.id] || false}
//                     onRemove={handleRemoveItem}
//                     isMobile
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Desktop layout */}
//             <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
//               {/* Product with image */}
//               <div className="col-span-6 flex gap-4 items-center">
//                 <ProductImage
//                   image={item.image}
//                   name={item.name}
//                   slug={item.slug}
//                 />

//                 {/* Product info */}
//                 <div className="flex-1 min-w-0">
//                   <Link
//                     href={`/product/${item.slug}`}
//                     className="text-base font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2"
//                   >
//                     {item.name}
//                   </Link>

//                   {item.variant && (
//                     <Badge variant="outline" className="mt-1">
//                       {item.variant.name}
//                     </Badge>
//                   )}

//                   <div className="mt-1 text-sm text-gray-500">
//                     SKU: {item.variant?.sku || "N/A"}
//                   </div>
//                 </div>
//               </div>

//               {/* Price */}
//               <div className="col-span-2 font-medium text-gray-900 text-center">
//                 {formatPrice(item.price)}
//               </div>

//               {/* Quantity */}
//               <div className="col-span-2 flex items-center justify-center">
//                 <QuantityControls
//                   id={item.id}
//                   quantity={item.quantity}
//                   isLoading={loadingItems[item.id] || false}
//                   onUpdate={handleQuantityChange}
//                 />
//               </div>

//               {/* Subtotal and Remove */}
//               <div className="col-span-2 text-right">
//                 <div className="font-semibold text-gray-900">
//                   {formatPrice(item.subtotal)}
//                 </div>
//                 <RemoveButton
//                   id={item.id}
//                   isRemoving={removingItems[item.id] || false}
//                   onRemove={handleRemoveItem}
//                 />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
//         <p className="text-sm text-gray-500">* Giá đã bao gồm thuế VAT</p>
//       </div>
//     </div>
//   );
// }

// // Loading skeleton for cart items
// export function CartItemsSkeleton() {
//   return (
//     <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//       <div className="p-6 border-b border-gray-100">
//         <Skeleton className="h-7 w-48" />
//       </div>

//       <div className="hidden md:grid md:grid-cols-12 bg-gray-50 py-3 px-6 border-b border-gray-100">
//         <div className="col-span-6">
//           <Skeleton className="h-4 w-20" />
//         </div>
//         <div className="col-span-2">
//           <Skeleton className="h-4 w-16 mx-auto" />
//         </div>
//         <div className="col-span-2">
//           <Skeleton className="h-4 w-16 mx-auto" />
//         </div>
//         <div className="col-span-2">
//           <Skeleton className="h-4 w-20 ml-auto" />
//         </div>
//       </div>

//       <div className="divide-y divide-gray-100">
//         {[1, 2].map((item) => (
//           <div
//             key={item}
//             className="p-6"
//             role="status"
//             aria-label="Loading cart item"
//           >
//             {/* Mobile skeleton */}
//             <div className="md:hidden space-y-4">
//               <div className="flex gap-4">
//                 <Skeleton className="h-24 w-24 rounded-md" />
//                 <div className="flex-1 space-y-2">
//                   <Skeleton className="h-5 w-full" />
//                   <Skeleton className="h-5 w-3/4" />
//                   <Skeleton className="h-4 w-1/2" />
//                   <Skeleton className="h-5 w-1/4" />
//                 </div>
//               </div>
//               <div className="flex justify-between pt-2">
//                 <Skeleton className="h-8 w-28" />
//                 <div className="text-right">
//                   <Skeleton className="h-5 w-20 ml-auto" />
//                   <Skeleton className="h-4 w-12 ml-auto mt-2" />
//                 </div>
//               </div>
//             </div>

//             {/* Desktop skeleton */}
//             <div className="hidden md:grid md:grid-cols-12 md:gap-4 md:items-center">
//               <div className="col-span-6 flex gap-4 items-center">
//                 <Skeleton className="h-20 w-20 rounded-md" />
//                 <div className="flex-1 space-y-2">
//                   <Skeleton className="h-5 w-full" />
//                   <Skeleton className="h-4 w-3/4" />
//                   <Skeleton className="h-4 w-1/2" />
//                 </div>
//               </div>
//               <div className="col-span-2">
//                 <Skeleton className="h-5 w-20 mx-auto" />
//               </div>
//               <div className="col-span-2">
//                 <Skeleton className="h-8 w-28 mx-auto" />
//               </div>
//               <div className="col-span-2 text-right">
//                 <Skeleton className="h-5 w-24 ml-auto" />
//                 <Skeleton className="h-4 w-16 ml-auto mt-2" />
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="p-6 bg-gray-50 border-t border-gray-100">
//         <Skeleton className="h-4 w-48" />
//       </div>
//     </div>
//   );
// }
