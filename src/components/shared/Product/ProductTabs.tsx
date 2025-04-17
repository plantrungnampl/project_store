// "use client";

// import { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import ProductReviewsWrapper from "./ProductReviewsWrapper";
// import ProductReviews from "./ProductReviews";
// // import ProductReviews from "./ProductReviews";
// // import ProductReviews from "@/components/products/ProductReviews";

// interface ProductTabsProps {
//   description?: string | null;
//   productId: string;
// }

// export default function ProductTabs({
//   description,
//   productId,
// }: ProductTabsProps) {
//   const [activeTab, setActiveTab] = useState("description");

//   return (
//     <Tabs
//       defaultValue="description"
//       value={activeTab}
//       onValueChange={setActiveTab}
//     >
//       <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
//         <TabsTrigger value="description">Mô tả</TabsTrigger>
//         <TabsTrigger value="specifications">Thông số</TabsTrigger>
//         <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
//       </TabsList>

//       {/* Description Tab */}
//       <TabsContent
//         value="description"
//         className="bg-white rounded-lg p-6 shadow-sm"
//       >
//         {description ? (
//           <div className="prose prose-sm sm:prose max-w-none">
//             <h3 className="text-lg font-medium mb-4">Mô tả sản phẩm</h3>
//             <div dangerouslySetInnerHTML={{ __html: description }} />
//           </div>
//         ) : (
//           <p className="text-gray-500 italic">
//             Không có mô tả chi tiết cho sản phẩm này.
//           </p>
//         )}
//       </TabsContent>

//       {/* Specifications Tab */}
//       <TabsContent
//         value="specifications"
//         className="bg-white rounded-lg p-6 shadow-sm"
//       >
//         <h3 className="text-lg font-medium mb-4">Thông số kỹ thuật</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <table className="min-w-full divide-y divide-gray-200">
//             <tbody className="divide-y divide-gray-200">
//               {/* Product attributes would be dynamically loaded here */}
//               <tr>
//                 <td className="py-2 text-sm font-medium text-gray-500">
//                   Thương hiệu
//                 </td>
//                 <td className="py-2 text-sm text-gray-900">Sony</td>
//               </tr>
//               <tr>
//                 <td className="py-2 text-sm font-medium text-gray-500">
//                   Model
//                 </td>
//                 <td className="py-2 text-sm text-gray-900">XYZ-1234</td>
//               </tr>
//               <tr>
//                 <td className="py-2 text-sm font-medium text-gray-500">
//                   Kích thước
//                 </td>
//                 <td className="py-2 text-sm text-gray-900">10 x 5 x 2 cm</td>
//               </tr>
//               <tr>
//                 <td className="py-2 text-sm font-medium text-gray-500">
//                   Trọng lượng
//                 </td>
//                 <td className="py-2 text-sm text-gray-900">250g</td>
//               </tr>
//               <tr>
//                 <td className="py-2 text-sm font-medium text-gray-500">
//                   Màu sắc
//                 </td>
//                 <td className="py-2 text-sm text-gray-900">
//                   Đen / Trắng / Xám
//                 </td>
//               </tr>
//               <tr>
//                 <td className="py-2 text-sm font-medium text-gray-500">
//                   Bảo hành
//                 </td>
//                 <td className="py-2 text-sm text-gray-900">12 tháng</td>
//               </tr>
//             </tbody>
//           </table>
//         </div>
//       </TabsContent>

//       {/* Reviews Tab */}
//       <TabsContent
//         value="reviews"
//         className="bg-white rounded-lg p-6 shadow-sm"
//       >
//         {/* <ProductReviews productId={productId} /> */}
//         <ProductReviewsWrapper productId={productId} />
//       </TabsContent>
//     </Tabs>
//   );
// }
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductReviews from "./review/ProductReviews";

interface ProductTabsProps {
  description?: string | null;
  productId: string;
}

export default function ProductTabs({
  description,
  productId,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <Tabs
      defaultValue="description"
      value={activeTab}
      onValueChange={setActiveTab}
    >
      <TabsList className="grid grid-cols-3 w-full max-w-md mb-8">
        <TabsTrigger value="description">Mô tả</TabsTrigger>
        <TabsTrigger value="specifications">Thông số</TabsTrigger>
        <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
      </TabsList>

      {/* Description Tab */}
      <TabsContent
        value="description"
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        {description ? (
          <div className="prose prose-sm sm:prose max-w-none">
            <h3 className="text-lg font-medium mb-4">Mô tả sản phẩm</h3>
            <div dangerouslySetInnerHTML={{ __html: description }} />
          </div>
        ) : (
          <p className="text-gray-500 italic">
            Không có mô tả chi tiết cho sản phẩm này.
          </p>
        )}
      </TabsContent>

      {/* Specifications Tab */}
      <TabsContent
        value="specifications"
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        <h3 className="text-lg font-medium mb-4">Thông số kỹ thuật</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody className="divide-y divide-gray-200">
              {/* Product attributes would be dynamically loaded here */}
              <tr>
                <td className="py-2 text-sm font-medium text-gray-500">
                  Thương hiệu
                </td>
                <td className="py-2 text-sm text-gray-900">Sony</td>
              </tr>
              <tr>
                <td className="py-2 text-sm font-medium text-gray-500">
                  Model
                </td>
                <td className="py-2 text-sm text-gray-900">XYZ-1234</td>
              </tr>
              <tr>
                <td className="py-2 text-sm font-medium text-gray-500">
                  Kích thước
                </td>
                <td className="py-2 text-sm text-gray-900">10 x 5 x 2 cm</td>
              </tr>
              <tr>
                <td className="py-2 text-sm font-medium text-gray-500">
                  Trọng lượng
                </td>
                <td className="py-2 text-sm text-gray-900">250g</td>
              </tr>
              <tr>
                <td className="py-2 text-sm font-medium text-gray-500">
                  Màu sắc
                </td>
                <td className="py-2 text-sm text-gray-900">
                  Đen / Trắng / Xám
                </td>
              </tr>
              <tr>
                <td className="py-2 text-sm font-medium text-gray-500">
                  Bảo hành
                </td>
                <td className="py-2 text-sm text-gray-900">12 tháng</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TabsContent>

      {/* Reviews Tab - sử dụng client component */}
      <TabsContent
        value="reviews"
        className="bg-white rounded-lg p-6 shadow-sm"
      >
        {activeTab === "reviews" && <ProductReviews productId={productId} />}
      </TabsContent>
    </Tabs>
  );
}
