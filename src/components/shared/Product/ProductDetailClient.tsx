// "use client";

// import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
// import ProductInfo, { type ProductVariant, type ProductDetails } from "@/components/shared/Product/ProductInfo";
// import { 
//   CheckIcon, HeartIcon, ShareIcon, TruckIcon, StarIcon, 
//   InfoIcon, ShieldIcon, CheckCircleIcon, XCircleIcon, 
//   TagIcon, RefreshCcwIcon, Truck, CreditCard, ShieldCheck, Package,
//   Star, StarHalf
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import dynamic from "next/dynamic";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { cn, formatPrice } from "@/lib/utils";
// import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
// import { useToast } from "@/components/ui/use-toast";
// import { ProductCardAddToCart } from "@/components/cart/ProductCardAddToCart ";
// import Image from "next/image";
// import { Separator } from "@/components/ui/separator";
// import Link from "next/link";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Progress } from "@/components/ui/progress";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

// // Lazy load heavy components
// const ProductReviews = dynamic(
//   () => import("@/components/shared/Product/review/ProductReviews"),
//   {
//     loading: () => (
//       <div className="space-y-4 animate-pulse">
//         <Skeleton className="h-12 w-full" />
//         <Skeleton className="h-24 w-full" />
//         <Skeleton className="h-24 w-full" />
//       </div>
//     ),
//     ssr: false,
//   }
// );

// const RecommendedProducts = dynamic(
//   () => import("@/components/shared/Product/RecommendedProducts"),
//   {
//     loading: () => (
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//         {Array(4).fill(0).map((_, i) => (
//           <Skeleton key={i} className="h-64 w-full rounded-lg" />
//         ))}
//       </div>
//     ),
//   }
// );

// interface ProductDetailClientProps {
//   product: ProductDetails;
// }

// export default function ProductDetailClient({
//   product,
// }: ProductDetailClientProps) {
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
//     product.variants && product.variants.length > 0 ? product.variants[0] : null
//   );
//   const [quantity, setQuantity] = useState<number>(1);
//   const [activeTab, setActiveTab] = useState<string>("description");
//   const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
//   const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
//   const { toast } = useToast();
  
//   // Intersection observer for lazy loading
//   const [reviewsSectionRef, isReviewsVisible] = useIntersectionObserver<HTMLDivElement>({
//     threshold: 0.1,
//     rootMargin: "100px",
//   });

//   // Get current stock based on selected variant or product
//   const currentStock = useMemo(
//     () => selectedVariant?.stockQuantity ?? product.stockQuantity ?? 0,
//     [selectedVariant, product.stockQuantity]
//   );

//   // Get current price based on selected variant or product
//   const currentPrice = useMemo(
//     () => selectedVariant?.price ?? product.price,
//     [selectedVariant, product.price]
//   );

//   // Get compare at price based on selected variant or product
//   const compareAtPrice = useMemo(
//     () => selectedVariant?.compareAtPrice ?? product.compareAtPrice,
//     [selectedVariant, product.compareAtPrice]
//   );

//   // Calculate discount percentage
//   const discountPercentage = useMemo(() => {
//     if (!compareAtPrice || !currentPrice) return 0;
//     return Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100);
//   }, [compareAtPrice, currentPrice]);

//   // Stock status indicator with more detailed states
//   const stockStatus = useMemo(() => {
//     if (currentStock <= 0) return { 
//       label: "Hết hàng", 
//       variant: "destructive" as const,
//       icon: <XCircleIcon className="h-4 w-4" />,
//       color: "text-destructive"
//     };
//     if (currentStock <= 5) return { 
//       label: "Sắp hết hàng", 
//       variant: "warning" as const,
//       icon: <InfoIcon className="h-4 w-4" />,
//       color: "text-amber-500"
//     };
//     return { 
//       label: "Còn hàng", 
//       variant: "success" as const,
//       icon: <CheckCircleIcon className="h-4 w-4" />,
//       color: "text-green-600"
//     };
//   }, [currentStock]);

//   // Calculate estimated delivery date
//   const estimatedDelivery = useMemo(() => {
//     const today = new Date();
//     const minDelivery = new Date(today);
//     const maxDelivery = new Date(today);
    
//     minDelivery.setDate(today.getDate() + 3); // Min 3 days
//     maxDelivery.setDate(today.getDate() + 5); // Max 5 days
    
//     // Format dates to Vietnamese format
//     const formatDate = (date: Date) => {
//       return new Intl.DateTimeFormat('vi-VN', {
//         day: '2-digit',
//         month: '2-digit'
//       }).format(date);
//     };
    
//     return {
//       min: formatDate(minDelivery),
//       max: formatDate(maxDelivery)
//     };
//   }, []);

//   // Group product images for gallery
//   const productImages = useMemo(() => {
//     // Start with main product images
//     const images = (product.images as Array<{url: string, altText?: string}> || []).map(img => ({
//       url: img.url,
//       alt: img.altText || product.name
//     }));
    
//     // Add variant images if a variant is selected
//     if (selectedVariant && 
//         (selectedVariant as any).images && 
//         (selectedVariant as any).images.length > 0) {
//       // Add variant-specific images at the beginning
//       const variantImages = (selectedVariant as any).images.map((img: {url: string, altText?: string}) => ({
//         url: img.url,
//         alt: img.altText || `${product.name} - ${(selectedVariant as any).name}`
//       }));
      
//       // Replace images with variant images
//       return variantImages;
//     }
    
//     // No variant selected or no variant images
//     return images.length > 0 ? images : [
//       { url: 'https://placehold.co/600x800?text=No+Image', alt: product.name }
//     ];
//   }, [product, selectedVariant]);

//   // Update quantity when stock changes or variant changes
//   useEffect(() => {
//     if (quantity > currentStock && currentStock > 0) {
//       setQuantity(currentStock);
//     } else if (currentStock <= 0) {
//       setQuantity(1);
//     }
//   }, [currentStock, quantity]);

//   // Reset active image when changing variant
//   useEffect(() => {
//     setActiveImageIndex(0);
//   }, [selectedVariant]);

//   // Handle variant change from ProductInfo component
//   const handleVariantChange = useCallback((variant: ProductVariant | null) => {
//     setSelectedVariant(variant);
//     // Always reset quantity to 1 when changing variant
//     setQuantity(1);
//   }, []);

//   // Handle quantity change from ProductInfo component
//   const handleQuantityChange = useCallback(
//     (newQuantity: number) => {
//       // Validate quantity against current stock
//       if (newQuantity > 0 && (currentStock === 0 || newQuantity <= currentStock)) {
//         setQuantity(newQuantity);
//       }
//     },
//     [currentStock]
//   );

//   // Toggle wishlist status
//   const toggleWishlist = useCallback(() => {
//     setIsWishlisted((prev) => !prev);
//     toast({
//       title: isWishlisted 
//         ? "Đã xóa khỏi danh sách yêu thích" 
//         : "Đã thêm vào danh sách yêu thích",
//       description: isWishlisted 
//         ? "Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn." 
//         : "Sản phẩm đã được thêm vào danh sách yêu thích của bạn.",
//       variant: "default",
//     });
//   }, [isWishlisted, toast]);

//   // Open share modal/dropdown
//   const handleShare = useCallback(() => {
//     setIsShareModalOpen(true);
//     // Simple implementation - copy URL to clipboard
//     if (navigator.clipboard) {
//       navigator.clipboard.writeText(window.location.href);
//       toast({
//         title: "Đã sao chép liên kết",
//         description: "Liên kết đến sản phẩm đã được sao chép vào bộ nhớ tạm.",
//         variant: "default",
//       });
//     }
//   }, [toast]);

//   // Format price function
//   const formatCurrency = useCallback((price: number) => {
//     return new Intl.NumberFormat('vi-VN', {
//       style: 'currency',
//       currency: 'VND',
//       maximumFractionDigits: 0
//     }).format(price);
//   }, []);
  
//   // Cart button memoized to prevent unnecessary re-renders
//   const cartButton = useMemo(() => (
//     <ProductCardAddToCart
//       name={product.name}
//       inStock={currentStock > 0}
//       productId={product.id}
//       variantId={selectedVariant?.id}
//       quantity={quantity}
//       className="w-full flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg shadow transition-all hover:shadow-md h-12"
//     />
//   ), [product.id, product.name, selectedVariant?.id, quantity, currentStock]);

//   // Function to render star rating
//   const renderStarRating = useCallback((rating: number) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 >= 0.5;
    
//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
//     }
    
//     if (hasHalfStar) {
//       stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
//     }
    
//     // Add empty stars
//     const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />);
//     }
    
//     return stars;
//   }, []);

//   return (
//     <div className="bg-background min-h-screen pb-12">
//       {/* Breadcrumb Navigation */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//         <nav className="flex text-sm text-muted-foreground">
//           <ol className="flex items-center space-x-1">
//             <li>
//               <Link href="/" className="hover:text-primary transition-colors">
//                 Trang chủ
//               </Link>
//             </li>
//             <li>
//               <span className="mx-1">/</span>
//             </li>
//             {product.categories && product.categories.length > 0 && (
//               <>
//                 <li>
//                   <Link 
//                     href={`/categories/${product.categories[0]?.slug}`}
//                     className="hover:text-primary transition-colors"
//                   >
//                     {product.categories[0]?.name}
//                   </Link>
//                 </li>
//                 <li>
//                   <span className="mx-1">/</span>
//                 </li>
//               </>
//             )}
//             <li className="text-foreground font-medium truncate max-w-[200px]">
//               {product.name}
//             </li>
//           </ol>
//         </nav>
//       </div>

//       {/* Main Product Container */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
//           {/* Product Images - Left Column */}
//           <div className="space-y-6">
//             {/* Main Image */}
//             <div className="relative h-[450px] md:h-[600px] overflow-hidden rounded-xl border border-border shadow-sm bg-white dark:bg-gray-800">
//               {productImages.length > 0 && (
//                 <Image
//                   src={productImages[activeImageIndex].url}
//                   alt={productImages[activeImageIndex].alt || product.name}
//                   fill
//                   sizes="(max-width: 768px) 100vw, 50vw"
//                   priority
//                   className="object-contain"
//                 />
//               )}
              
//               {/* Discount Badge */}
//               {compareAtPrice && compareAtPrice > currentPrice && (
//                 <Badge 
//                   variant="destructive" 
//                   className="absolute top-4 left-4 text-sm px-3 py-1 font-medium"
//                 >
//                   -{discountPercentage}%
//                 </Badge>
//               )}
              
//               {/* New Badge */}
//               {product.isNew && (
//                 <Badge 
//                   variant="secondary" 
//                   className="absolute top-4 right-4 text-sm px-3 py-1 font-medium"
//                 >
//                   Mới
//                 </Badge>
//               )}
//             </div>
            
//             {/* Thumbnail Gallery */}
//             {productImages.length > 1 && (
//               <div className="grid grid-cols-5 gap-3">
//                 {productImages.map((image, index) => (
//                   <button
//                     key={index}
//                     onClick={() => setActiveImageIndex(index)}
//                     className={cn(
//                       "h-20 w-full relative rounded-md overflow-hidden border-2 transition-all",
//                       activeImageIndex === index 
//                         ? "border-primary shadow-md" 
//                         : "border-border hover:border-primary/50"
//                     )}
//                   >
//                     <Image
//                       src={image.url}
//                       alt={image.alt || `${product.name} - Thumbnail ${index + 1}`}
//                       fill
//                       sizes="(max-width: 768px) 20vw, 10vw"
//                       className="object-cover"
//                     />
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>
          
//           {/* Product Information - Right Column */}
//           <div className="space-y-6">
//             {/* Product Header */}
//             <div>
//               <h1 className="text-3xl font-bold mb-3 text-foreground leading-tight">
//                 {product.name}
//                 {selectedVariant?.name && (
//                   <span className="text-muted-foreground ml-2 text-xl">
//                     - {selectedVariant.name}
//                   </span>
//                 )}
//               </h1>
              
//               {/* Brand */}
//               {product.brandName && (
//                 <div className="mb-3">
//                   <Link 
//                     href={`/brands/${product.brandSlug}`}
//                     className="text-sm text-primary hover:underline flex items-center gap-1.5"
//                   >
//                     <span className="font-medium">Thương hiệu:</span> {product.brandName}
//                   </Link>
//                 </div>
//               )}
              
//               {/* SKU & Rating */}
//               <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
//                 <div className="flex items-center gap-4">
//                   {/* Rating display */}
//                   {product.avgRating && product.avgRating > 0 && (
//                     <div className="flex items-center gap-1">
//                       <div className="flex items-center">
//                         {renderStarRating(product.avgRating)}
//                       </div>
//                       <span className="text-sm text-muted-foreground ml-1">
//                         ({product.reviewCount || 0})
//                       </span>
//                     </div>
//                   )}
                  
//                   {/* SKU */}
//                   <div className="text-sm text-muted-foreground">
//                     SKU: <span className="font-medium">{selectedVariant?.sku || product.sku}</span>
//                   </div>
//                 </div>
                
//                 {/* Stock status */}
//                 <div className="flex items-center gap-1 font-medium">
//                   {stockStatus.icon}
//                   <span className={stockStatus.color}>{stockStatus.label}</span>
//                 </div>
//               </div>
//             </div>
            
//             {/* Price Card */}
//             <Card className="bg-secondary/20 border-none shadow-sm">
//               <CardContent className="pt-6">
//                 <div className="flex items-baseline gap-2 mb-3">
//                   <span className="text-3xl font-bold text-primary">
//                     {formatCurrency(currentPrice)}
//                   </span>
//                   {compareAtPrice && compareAtPrice > currentPrice && (
//                     <span className="text-lg text-muted-foreground line-through">
//                       {formatCurrency(compareAtPrice)}
//                     </span>
//                   )}
//                   {compareAtPrice && compareAtPrice > currentPrice && (
//                     <Badge variant="secondary" className="ml-2 text-sm">
//                       Tiết kiệm {formatCurrency(compareAtPrice - currentPrice)}
//                     </Badge>
//                   )}
//                 </div>
                
//                 {/* Stock progress bar for low stock */}
//                 {currentStock > 0 && currentStock <= 10 && (
//                   <div className="mb-3 space-y-1">
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="font-medium text-amber-600">
//                         Chỉ còn {currentStock} sản phẩm
//                       </span>
//                       <span className="text-muted-foreground">
//                         Đã bán: {Math.floor(Math.random() * 50) + 10}
//                       </span>
//                     </div>
//                     <Progress value={currentStock * 10} className="h-2" />
//                   </div>
//                 )}
//               </CardContent>
//             </Card>
            
//             {/* Short description */}
//             {product.description && (
//               <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3 mb-3">
//                 <div dangerouslySetInnerHTML={{ 
//                   __html: product.description.split('</p>')[0] + '</p>' 
//                 }} />
//               </div>
//             )}
            
//             {/* Product variant selection */}
//             <ProductInfo
//               product={product}
//               onVariantChange={handleVariantChange}
//               onQuantityChange={handleQuantityChange}
//               actionButton={cartButton}
//             />
            
//             {/* Action buttons */}
//             <div className="flex gap-3 pt-2">
//               {/* Wishlist button */}
//               <Button 
//                 variant="outline" 
//                 size="icon" 
//                 className="h-12 w-12 rounded-full border-2 transition-all"
//                 onClick={toggleWishlist}
//               >
//                 <HeartIcon className={cn(
//                   "h-5 w-5", 
//                   isWishlisted && "fill-red-500 text-red-500"
//                 )} />
//                 <span className="sr-only">Thêm vào yêu thích</span>
//               </Button>
              
//               {/* Share button */}
//               <Button 
//                 variant="outline" 
//                 size="icon" 
//                 className="h-12 w-12 rounded-full border-2 transition-all"
//                 onClick={handleShare}
//               >
//                 <ShareIcon className="h-5 w-5" />
//                 <span className="sr-only">Chia sẻ sản phẩm</span>
//               </Button>
//             </div>
            
//             {/* Shipping & Warranty Info Cards */}
//             <div className="grid grid-cols-2 gap-4 mt-6">
//               <div className="flex flex-col items-center text-center p-4 border rounded-lg">
//                 <Truck className="h-6 w-6 text-primary mb-2" />
//                 <span className="text-sm font-medium">Giao hàng nhanh</span>
//                 <span className="text-xs text-muted-foreground">Dự kiến: {estimatedDelivery.min} - {estimatedDelivery.max}</span>
//               </div>
//               <div className="flex flex-col items-center text-center p-4 border rounded-lg">
//                 <ShieldCheck className="h-6 w-6 text-primary mb-2" />
//                 <span className="text-sm font-medium">Bảo hành chính hãng</span>
//                 <span className="text-xs text-muted-foreground">12 tháng toàn quốc</span>
//               </div>
//               <div className="flex flex-col items-center text-center p-4 border rounded-lg">
//                 <RefreshCcwIcon className="h-6 w-6 text-primary mb-2" />
//                 <span className="text-sm font-medium">Đổi trả miễn phí</span>
//                 <span className="text-xs text-muted-foreground">Trong vòng 7 ngày</span>
//               </div>
//               <div className="flex flex-col items-center text-center p-4 border rounded-lg">
//                 <CreditCard className="h-6 w-6 text-primary mb-2" />
//                 <span className="text-sm font-medium">Thanh toán an toàn</span>
//                 <span className="text-xs text-muted-foreground">Nhiều phương thức</span>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Product Tabs */}
//         <div className="mb-12">
//           <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="grid grid-cols-3 mb-6 rounded-lg bg-transparent border-b">
//               <TabsTrigger 
//                 value="description" 
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-3 text-base font-medium transition-all"
//               >
//                 Mô tả
//               </TabsTrigger>
//               <TabsTrigger 
//                 value="specifications" 
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-3 text-base font-medium transition-all"
//               >
//                 Thông số kỹ thuật
//               </TabsTrigger>
//               <TabsTrigger 
//                 value="reviews" 
//                 className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-3 text-base font-medium transition-all"
//               >
//                 Đánh giá ({product.reviewCount || 0})
//               </TabsTrigger>
//             </TabsList>
            
//             <Card className="border shadow-sm overflow-hidden">
//               <CardContent className="pt-6">
//                 <TabsContent value="description" className="mt-0">
//                   {product.description ? (
//                     <div className="prose dark:prose-invert max-w-none" 
//                       dangerouslySetInnerHTML={{ __html: product.description }} 
//                     />
//                   ) : (
//                     <div className="py-8 text-center">
//                       <p className="text-muted-foreground italic">Chưa có mô tả chi tiết cho sản phẩm này.</p>
//                     </div>
//                   )}
//                 </TabsContent>
                
//                 <TabsContent value="specifications" className="mt-0">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {product.variantAttributes && product.variantAttributes.length > 0 ? (
//                       product.variantAttributes.map((attr, index) => (
//                         <div 
//                           key={index} 
//                           className="flex justify-between py-3 border-b"
//                         >
//                           <span className="text-muted-foreground font-medium">{attr.displayName}</span>
//                           <span className="font-semibold">
//                             {selectedVariant?.attributes?.find(
//                               a => a.attributeValue.attribute.id === attr.id
//                             )?.attributeValue.displayValue || 
//                               attr.values[0]?.displayValue || 
//                               "-"}
//                           </span>
//                         </div>
//                       ))
//                     ) : (
//                       <div className="py-8 text-center col-span-2">
//                         <p className="text-muted-foreground italic">Không có thông số kỹ thuật cho sản phẩm này.</p>
//                       </div>
//                     )}
//                   </div>
//                 </TabsContent>
                
//                 <TabsContent value="reviews" className="mt-0">
//                   <div ref={reviewsSectionRef}>
//                     {isReviewsVisible ? (
//                       <Suspense fallback={
//                         <div className="space-y-4 animate-pulse">
//                           <Skeleton className="h-12 w-full" />
//                           <Skeleton className="h-24 w-full" />
//                           <Skeleton className="h-24 w-full" />
//                         </div>
//                       }>
//                         <ProductReviews productId={product.id} />
//                       </Suspense>
//                     ) : (
//                       <div className="space-y-4 animate-pulse">
//                         <Skeleton className="h-12 w-full" />
//                         <Skeleton className="h-24 w-full" />
//                         <Skeleton className="h-24 w-full" />
//                       </div>
//                     )}
//                   </div>
//                 </TabsContent>
//               </CardContent>
//             </Card>
//           </Tabs>
//         </div>
        
//         {/* Recommended products */}
//         <Card className="mb-12 border shadow-sm overflow-hidden">
//           <CardHeader className="pb-0">
//             <CardTitle className="text-2xl font-bold flex items-center">
//               <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
//               Sản phẩm tương tự
//             </CardTitle>
//             <CardDescription>
//               Những sản phẩm bạn có thể quan tâm
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="pt-6">
//             <Suspense fallback={
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//                 {Array(4).fill(0).map((_, i) => (
//                   <Skeleton key={i} className="h-64 w-full rounded-lg" />
//                 ))}
//               </div>
//             }>
//               <RecommendedProducts productId={product.id} />
//             </Suspense>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useMemo, useCallback, Suspense, memo } from "react";
import ProductInfo, { type ProductVariant, type ProductDetails } from "@/components/shared/Product/ProductInfo";
import { 
  CheckIcon, HeartIcon, ShareIcon, TruckIcon, StarIcon, 
  InfoIcon, ShieldIcon, CheckCircleIcon, XCircleIcon, 
  TagIcon, RefreshCcwIcon, Truck, CreditCard, ShieldCheck, Package,
  Star, StarHalf, ArrowLeft, ShoppingBag, Eye, ZoomIn, ZoomOut, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatPrice } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart"; // Giả định hook này tồn tại để quản lý giỏ hàng
import { ProductCardAddToCart } from "@/components/cart/ProductCardAddToCart ";

// Cập nhật type ProductVariant để thêm trường images cho type safety
export type ProductVariantExtended = ProductVariant & {
  images?: Array<{url: string, altText?: string}>;
};

// Lazy load heavy components
const ProductReviews = dynamic(
  () => import("@/components/shared/Product/review/ProductReviews"),
  {
    loading: () => (
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    ),
    ssr: false,
  }
);

const RecommendedProducts = dynamic(
  () => import("@/components/shared/Product/RecommendedProducts"),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    ),
  }
);

const RecentlyViewedProducts = dynamic(
  () => import("@/components/shared/Product/RecentlyViewedProducts"),
  {
    loading: () => (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    ),
  }
);

// FAQ data mẫu - trong thực tế, dữ liệu này sẽ được lấy từ API
const FAQs = [
  {
    question: "Sản phẩm có bảo hành không?",
    answer: "Có, sản phẩm được bảo hành chính hãng 12 tháng trên toàn quốc."
  },
  {
    question: "Có thể đổi trả sản phẩm nếu không vừa ý?",
    answer: "Bạn có thể đổi trả sản phẩm trong vòng 7 ngày nếu sản phẩm còn nguyên vẹn và đầy đủ phụ kiện."
  },
  {
    question: "Thời gian giao hàng mất bao lâu?",
    answer: "Thời gian giao hàng thường từ 3-5 ngày tùy khu vực. Khu vực nội thành có thể nhận hàng trong 24 giờ."
  },
  {
    question: "Có hỗ trợ thanh toán trả góp không?",
    answer: "Chúng tôi hỗ trợ trả góp qua thẻ tín dụng và một số đối tác tài chính. Vui lòng liên hệ bộ phận CSKH để biết thêm chi tiết."
  }
];

interface ProductDetailClientProps {
  product: ProductDetails;
}

// Sử dụng memo để tối ưu hiệu năng
const ProductDetailClient = memo(({
  product,
}: ProductDetailClientProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const { cartItems, cartCount, openCart } = useCart(); // Giả định hook useCart

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantExtended | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] as ProductVariantExtended : null
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("description");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  
  // Intersection observer for lazy loading
  const [reviewsSectionRef, isReviewsVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: "100px",
  });

  // Kiểm tra dữ liệu sản phẩm
  useEffect(() => {
    if (!product || !product.id) {
      toast({
        title: "Không tìm thấy sản phẩm",
        description: "Thông tin sản phẩm không hợp lệ hoặc không tồn tại.",
        variant: "destructive",
      });
      router.push('/products');
    }
  }, [product, toast, router]);

  // Kiểm tra trạng thái wishlist khi component mount
  useEffect(() => {
    // Trong thực tế, sẽ gọi API để kiểm tra sản phẩm có trong wishlist không
    const checkWishlistStatus = async () => {
      try {
        const response = await fetch(`/api/wishlist/check?productId=${product.id}`);
        const data = await response.json();
        setIsWishlisted(data.isWishlisted);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [product.id]);

  // Lưu lại sản phẩm đã xem
  useEffect(() => {
    // Lưu thông tin sản phẩm vào localStorage
    const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    
    // Kiểm tra nếu sản phẩm đã có trong danh sách
    const existingIndex = recentlyViewed.findIndex((item: any) => item.id === product.id);
    
    // Nếu sản phẩm đã tồn tại, xóa nó để thêm vào đầu danh sách
    if (existingIndex !== -1) {
      recentlyViewed.splice(existingIndex, 1);
    }
    
    // Thêm sản phẩm vào đầu danh sách
    recentlyViewed.unshift({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.images && product.images.length > 0 ? product.images[0].url : null,
      timestamp: new Date().getTime()
    });
    
    // Giới hạn số lượng sản phẩm đã xem
    const limitedRecentlyViewed = recentlyViewed.slice(0, 10);
    
    // Lưu vào localStorage
    localStorage.setItem('recentlyViewed', JSON.stringify(limitedRecentlyViewed));
  }, [product]);

  // Hiển thị thông báo khi thay đổi variant và số lượng còn ít
  useEffect(() => {
    if (selectedVariant && selectedVariant.stockQuantity <= 5 && selectedVariant.stockQuantity > 0) {
      toast({
        title: "Số lượng có hạn",
        description: `Chỉ còn ${selectedVariant.stockQuantity} sản phẩm "${selectedVariant.name}" trong kho.`,
        variant: "warning",
      });
    }
  }, [selectedVariant, toast]);

  // Get current stock based on selected variant or product
  const currentStock = useMemo(
    () => selectedVariant?.stockQuantity ?? product.stockQuantity ?? 0,
    [selectedVariant, product.stockQuantity]
  );

  // Get current price based on selected variant or product
  const currentPrice = useMemo(
    () => selectedVariant?.price ?? product.price,
    [selectedVariant, product.price]
  );

  // Get compare at price based on selected variant or product
  const compareAtPrice = useMemo(
    () => selectedVariant?.compareAtPrice ?? product.compareAtPrice,
    [selectedVariant, product.compareAtPrice]
  );

  // Calculate discount percentage
  const discountPercentage = useMemo(() => {
    if (!compareAtPrice || !currentPrice) return 0;
    return Math.round(((compareAtPrice - currentPrice) / compareAtPrice) * 100);
  }, [compareAtPrice, currentPrice]);

  // Stock status indicator with more detailed states
  const stockStatus = useMemo(() => {
    if (currentStock <= 0) return { 
      label: "Hết hàng", 
      variant: "destructive" as const,
      icon: <XCircleIcon className="h-4 w-4" />,
      color: "text-destructive"
    };
    if (currentStock <= 5) return { 
      label: "Sắp hết hàng", 
      variant: "warning" as const,
      icon: <InfoIcon className="h-4 w-4" />,
      color: "text-amber-500"
    };
    return { 
      label: "Còn hàng", 
      variant: "success" as const,
      icon: <CheckCircleIcon className="h-4 w-4" />,
      color: "text-green-600"
    };
  }, [currentStock]);

  // Calculate estimated delivery date
  const estimatedDelivery = useMemo(() => {
    const today = new Date();
    const minDelivery = new Date(today);
    const maxDelivery = new Date(today);
    
    minDelivery.setDate(today.getDate() + 3); // Min 3 days
    maxDelivery.setDate(today.getDate() + 5); // Max 5 days
    
    // Format dates to Vietnamese format
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      }).format(date);
    };
    
    return {
      min: formatDate(minDelivery),
      max: formatDate(maxDelivery)
    };
  }, []);

  // Group product images for gallery
  const productImages = useMemo(() => {
    // Start with main product images
    const images = (product.images as Array<{url: string, altText?: string}> || []).map(img => ({
      url: img.url,
      alt: img.altText || product.name
    }));
    
    // Add variant images if a variant is selected
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      // Add variant-specific images at the beginning
      const variantImages = selectedVariant.images.map(img => ({
        url: img.url,
        alt: img.altText || `${product.name} - ${selectedVariant.name}`
      }));
      
      // Replace images with variant images
      return variantImages;
    }
    
    // No variant selected or no variant images
    return images.length > 0 ? images : [
      { url: 'https://placehold.co/600x800?text=No+Image', alt: product.name }
    ];
  }, [product, selectedVariant]);

  // Update quantity when stock changes or variant changes
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (currentStock <= 0) {
      setQuantity(1);
    }
  }, [currentStock, quantity]);

  // Reset active image when changing variant
  useEffect(() => {
    setActiveImageIndex(0);
    setIsZoomed(false);
  }, [selectedVariant]);

  // Handle variant change from ProductInfo component
  const handleVariantChange = useCallback((variant: ProductVariant | null) => {
    setSelectedVariant(variant as ProductVariantExtended);
    // Always reset quantity to 1 when changing variant
    setQuantity(1);
  }, []);

  // Handle quantity change from ProductInfo component
  const handleQuantityChange = useCallback(
    (newQuantity: number) => {
      // Validate quantity against current stock
      if (newQuantity > 0 && (currentStock === 0 || newQuantity <= currentStock)) {
        setQuantity(newQuantity);
      }
    },
    [currentStock]
  );

  // Toggle wishlist status - Cải tiến với API và xử lý loading
  const toggleWishlist = useCallback(async () => {
    setIsLoadingWishlist(true);
    
    try {
      // Gọi API thêm/xóa wishlist
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          productId: product.id, 
          variantId: selectedVariant?.id, 
          action: isWishlisted ? 'remove' : 'add' 
        })
      });
      
      if (!response.ok) throw new Error('Wishlist action failed');
      
      const data = await response.json();
      setIsWishlisted(data.isWishlisted);
      
      toast({
        title: data.isWishlisted 
          ? "Đã thêm vào danh sách yêu thích" 
          : "Đã xóa khỏi danh sách yêu thích",
        description: data.isWishlisted 
          ? "Sản phẩm đã được thêm vào danh sách yêu thích của bạn." 
          : "Sản phẩm đã được xóa khỏi danh sách yêu thích của bạn.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      // Fallback UI update - đảo ngược lại trạng thái trong UI để đồng bộ với server
      toast({
        title: "Có lỗi xảy ra",
        description: "Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWishlist(false);
    }
  }, [isWishlisted, product.id, selectedVariant?.id, toast]);

  // Cải tiến xử lý chia sẻ - sử dụng Web Share API nếu có thể
  const handleShare = useCallback(() => {
    // Kiểm tra hỗ trợ Web Share API
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description?.replace(/<[^>]*>/g, '').substring(0, 100) || 'Xem sản phẩm này!',
        url: window.location.href,
      })
      .then(() => {
        toast({
          title: "Đã chia sẻ",
          description: "Cảm ơn bạn đã chia sẻ sản phẩm.",
          variant: "default",
        });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          navigator.clipboard.writeText(window.location.href);
          toast({
            title: "Đã sao chép liên kết",
            description: "Liên kết đến sản phẩm đã được sao chép.",
            variant: "default",
          });
        }
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết đến sản phẩm đã được sao chép.",
        variant: "default",
      });
    }
  }, [product.name, product.description, toast]);

  // Handle image zoom - Xử lý zoom ảnh
  const handleImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  }, [isZoomed]);

  // Toggle zoom
  const toggleZoom = useCallback(() => {
    setIsZoomed(prev => !prev);
  }, []);

  // Format price function
  const formatCurrency = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(price);
  }, []);
  
  // Cart button memoized to prevent unnecessary re-renders
  const cartButton = useMemo(() => (
    <ProductCardAddToCart
      name={product.name}
      inStock={currentStock > 0}
      productId={product.id}
      variantId={selectedVariant?.id}
      quantity={quantity}
      className="w-full flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg shadow transition-all hover:shadow-md h-12"
    />
  ), [product.id, product.name, selectedVariant?.id, quantity, currentStock]);

  // Function to render star rating
  const renderStarRating = useCallback((rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="h-4 w-4 text-gray-300" />);
    }
    
    return stars;
  }, []);

  if (!product || !product.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold">Không tìm thấy sản phẩm</h2>
          <p className="text-muted-foreground">Sản phẩm không tồn tại hoặc đã bị xóa.</p>
          <Button onClick={() => router.push('/products')}>
            Quay lại danh sách sản phẩm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-12">
      {/* Mini Cart Indicator - Thêm mới */}
      <div className="fixed top-24 right-6 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 shadow-md border-2 relative"
                onClick={openCart}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Giỏ hàng ({cartCount})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex text-sm text-muted-foreground">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>
              <span className="mx-1">/</span>
            </li>
            {product.categories && product.categories.length > 0 && (
              <>
                <li>
                  <Link 
                    href={`/categories/${product.categories[0]?.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {product.categories[0]?.name}
                  </Link>
                </li>
                <li>
                  <span className="mx-1">/</span>
                </li>
              </>
            )}
            <li className="text-foreground font-medium truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Back button - Thêm mới */}
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 flex items-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </Button>
      </div>

      {/* Main Product Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images - Left Column */}
          <div className="space-y-6">
            {/* Main Image with Zoom functionality - Cải tiến */}
            <div 
              className={cn(
                "relative h-[450px] md:h-[600px] overflow-hidden rounded-xl border border-border shadow-sm bg-white dark:bg-gray-800",
                isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              )}
              onClick={toggleZoom}
              onMouseMove={handleImageMouseMove}
            >
              {productImages.length > 0 && (
                <>
                  <Image
                    src={productImages[activeImageIndex].url}
                    alt={productImages[activeImageIndex].alt || product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    className={cn(
                      "object-contain transition-transform duration-200",
                      isZoomed ? "scale-150" : "scale-100"
                    )}
                    style={
                      isZoomed ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      } : undefined
                    }
                  />
                  
                  {/* Zoom indicator */}
                  <div className="absolute bottom-4 right-4 bg-background/80 rounded-full p-2">
                    {isZoomed ? (
                      <ZoomOut className="h-5 w-5 text-foreground" />
                    ) : (
                      <ZoomIn className="h-5 w-5 text-foreground" />
                    )}
                  </div>
                </>
              )}
              
              {/* Discount Badge */}
              {compareAtPrice && compareAtPrice > currentPrice && (
                <Badge 
                  variant="destructive" 
                  className="absolute top-4 left-4 text-sm px-3 py-1 font-medium"
                >
                  -{discountPercentage}%
                </Badge>
              )}
              
              {/* New Badge */}
              {product.isNew && (
                <Badge 
                  variant="secondary" 
                  className="absolute top-4 right-4 text-sm px-3 py-1 font-medium"
                >
                  Mới
                </Badge>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    className={cn(
                      "h-20 w-full relative rounded-md overflow-hidden border-2 transition-all",
                      activeImageIndex === index 
                        ? "border-primary shadow-md" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || `${product.name} - Thumbnail ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 20vw, 10vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Information - Right Column */}
          <div className="space-y-6">
            {/* Product Header */}
            <div>
              <h1 className="text-3xl font-bold mb-3 text-foreground leading-tight">
                {product.name}
                {selectedVariant?.name && (
                  <span className="text-muted-foreground ml-2 text-xl">
                    - {selectedVariant.name}
                  </span>
                )}
              </h1>
              
              {/* Brand */}
              {product.brandName && (
                <div className="mb-3">
                  <Link 
                    href={`/brands/${product.brandSlug}`}
                    className="text-sm text-primary hover:underline flex items-center gap-1.5"
                  >
                    <span className="font-medium">Thương hiệu:</span> {product.brandName}
                  </Link>
                </div>
              )}
              
              {/* SKU & Rating */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  {/* Rating display */}
                  {product.avgRating && product.avgRating > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="flex items-center">
                        {renderStarRating(product.avgRating)}
                      </div>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({product.reviewCount || 0})
                      </span>
                    </div>
                  )}
                  
                  {/* SKU */}
                  <div className="text-sm text-muted-foreground">
                    SKU: <span className="font-medium">{selectedVariant?.sku || product.sku}</span>
                  </div>
                </div>
                
                {/* Stock status */}
                <div className="flex items-center gap-1 font-medium">
                  {stockStatus.icon}
                  <span className={stockStatus.color}>{stockStatus.label}</span>
                </div>
              </div>
            </div>
            
            {/* Price Card */}
            <Card className="bg-secondary/20 border-none shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-primary">
                    {formatCurrency(currentPrice)}
                  </span>
                  {compareAtPrice && compareAtPrice > currentPrice && (
                    <span className="text-lg text-muted-foreground line-through">
                      {formatCurrency(compareAtPrice)}
                    </span>
                  )}
                  {compareAtPrice && compareAtPrice > currentPrice && (
                    <Badge variant="secondary" className="ml-2 text-sm">
                      Tiết kiệm {formatCurrency(compareAtPrice - currentPrice)}
                    </Badge>
                  )}
                </div>
                
                {/* Stock progress bar for low stock */}
                {currentStock > 0 && currentStock <= 10 && (
                  <div className="mb-3 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-amber-600">
                        Chỉ còn {currentStock} sản phẩm
                      </span>
                      <span className="text-muted-foreground">
                        Đã bán: {Math.floor(Math.random() * 50) + 10}
                      </span>
                    </div>
                    <Progress value={currentStock * 10} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Short description */}
            {product.description && (
              <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-3 mb-3">
                <div dangerouslySetInnerHTML={{ 
                  __html: product.description.split('</p>')[0] + '</p>' 
                }} />
              </div>
            )}
            
            {/* Product variant selection */}
            <ProductInfo
              product={product}
              onVariantChange={handleVariantChange}
              onQuantityChange={handleQuantityChange}
              actionButton={cartButton}
            />
            
            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              {/* Wishlist button */}
              <Button 
                variant="outline" 
                size="icon" 
                className={cn(
                  "h-12 w-12 rounded-full border-2 transition-all",
                  isLoadingWishlist && "opacity-70 cursor-not-allowed"
                )}
                onClick={toggleWishlist}
                disabled={isLoadingWishlist}
              >
                {isLoadingWishlist ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                ) : (
                  <HeartIcon className={cn(
                    "h-5 w-5", 
                    isWishlisted && "fill-red-500 text-red-500"
                  )} />
                )}
                <span className="sr-only">Thêm vào yêu thích</span>
              </Button>
              
              {/* Share button */}
              <Button 
                variant="outline" 
                size="icon" 
                className="h-12 w-12 rounded-full border-2 transition-all"
                onClick={handleShare}
              >
                <ShareIcon className="h-5 w-5" />
                <span className="sr-only">Chia sẻ sản phẩm</span>
              </Button>
            </div>
            
            {/* Shipping & Warranty Info Cards */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <Truck className="h-6 w-6 text-primary mb-2" />
                <span className="text-sm font-medium">Giao hàng nhanh</span>
                <span className="text-xs text-muted-foreground">Dự kiến: {estimatedDelivery.min} - {estimatedDelivery.max}</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <ShieldCheck className="h-6 w-6 text-primary mb-2" />
                <span className="text-sm font-medium">Bảo hành chính hãng</span>
                <span className="text-xs text-muted-foreground">12 tháng toàn quốc</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <RefreshCcwIcon className="h-6 w-6 text-primary mb-2" />
                <span className="text-sm font-medium">Đổi trả miễn phí</span>
                <span className="text-xs text-muted-foreground">Trong vòng 7 ngày</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 border rounded-lg">
                <CreditCard className="h-6 w-6 text-primary mb-2" />
                <span className="text-sm font-medium">Thanh toán an toàn</span>
                <span className="text-xs text-muted-foreground">Nhiều phương thức</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mb-12">
          <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6 rounded-lg bg-transparent border-b">
              <TabsTrigger 
                value="description" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-3 text-base font-medium transition-all"
              >
                Mô tả
              </TabsTrigger>
              <TabsTrigger 
                value="specifications" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-3 text-base font-medium transition-all"
              >
                Thông số kỹ thuật
              </TabsTrigger>
              <TabsTrigger 
                value="reviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-3 text-base font-medium transition-all"
              >
                Đánh giá ({product.reviewCount || 0})
              </TabsTrigger>
              {/* Tab mới cho FAQ */}
              <TabsTrigger 
                value="faq" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary bg-transparent px-6 py-3 text-base font-medium transition-all"
              >
                Câu hỏi thường gặp
              </TabsTrigger>
            </TabsList>
            
            <Card className="border shadow-sm overflow-hidden">
              <CardContent className="pt-6">
                <TabsContent value="description" className="mt-0">
                  {product.description ? (
                    <div className="prose dark:prose-invert max-w-none" 
                      dangerouslySetInnerHTML={{ __html: product.description }} 
                    />
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground italic">Chưa có mô tả chi tiết cho sản phẩm này.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="specifications" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {product.variantAttributes && product.variantAttributes.length > 0 ? (
                      product.variantAttributes.map((attr, index) => (
                        <div 
                          key={index} 
                          className="flex justify-between py-3 border-b"
                        >
                          <span className="text-muted-foreground font-medium">{attr.displayName}</span>
                          <span className="font-semibold">
                            {selectedVariant?.attributes?.find(
                              a => a.attributeValue.attribute.id === attr.id
                            )?.attributeValue.displayValue || 
                              attr.values[0]?.displayValue || 
                              "-"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center col-span-2">
                        <p className="text-muted-foreground italic">Không có thông số kỹ thuật cho sản phẩm này.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="reviews" className="mt-0">
                  <div ref={reviewsSectionRef}>
                    {isReviewsVisible ? (
                      <Suspense fallback={
                        <div className="space-y-4 animate-pulse">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-24 w-full" />
                          <Skeleton className="h-24 w-full" />
                        </div>
                      }>
                        <ProductReviews productId={product.id} />
                      </Suspense>
                    ) : (
                      <div className="space-y-4 animate-pulse">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab nội dung FAQ - Thêm mới */}
                <TabsContent value="faq" className="mt-0">
                  <div className="py-4">
                    <h3 className="text-lg font-medium mb-4">Câu hỏi thường gặp về sản phẩm</h3>
                    <Accordion type="single" collapsible className="w-full">
                      {FAQs.map((faq, index) => (
                        <AccordionItem key={index} value={`faq-${index}`}>
                          <AccordionTrigger className="text-left font-medium">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                    
                    <div className="mt-6 bg-secondary/20 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Bạn có câu hỏi khác? Vui lòng{" "}
                        <Link href="/contact" className="text-primary hover:underline">
                          liên hệ
                        </Link>{" "}
                        với chúng tôi để được hỗ trợ.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>
        
        {/* Recommended products */}
        <Card className="mb-12 border shadow-sm overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-2xl font-bold flex items-center">
              <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
              Sản phẩm tương tự
            </CardTitle>
            <CardDescription>
              Những sản phẩm bạn có thể quan tâm
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Suspense fallback={
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            }>
              <RecommendedProducts productId={product.id} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Recently Viewed Products - Thêm mới */}
        <Card className="mb-12 border shadow-sm overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-2xl font-bold flex items-center">
              <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
              Đã xem gần đây
            </CardTitle>
            <CardDescription>
              Sản phẩm bạn đã xem trước đó
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Suspense fallback={
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            }>
              <RecentlyViewedProducts currentProductId={product.id} />
            </Suspense>
          </CardContent>
        </Card>

        {/* Continue Shopping Button - Thêm mới */}
        <div className="flex justify-center mt-8">
          <Link href="/products">
            <Button variant="outline" size="lg" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>Tiếp tục mua sắm</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
});

// Display name cho memo component
ProductDetailClient.displayName = "ProductDetailClient";

export default ProductDetailClient;