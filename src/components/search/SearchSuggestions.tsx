// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import SearchInput from "./SearchInput";
// import { ArrowRight, TrendingUp, Sparkles, Tag, Clock } from "lucide-react";

// export default function SearchSuggestions() {
//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState("");

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchTerm.trim()) {
//       router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
//     }
//   };

//   // Popular categories
//   const popularCategories = [
//     { name: "Thời trang nữ", slug: "thoi-trang-nu" },
//     { name: "Thời trang nam", slug: "thoi-trang-nam" },
//     { name: "Giày dép", slug: "giay-dep" },
//     { name: "Túi xách", slug: "tui-xach" },
//     { name: "Phụ kiện", slug: "phu-kien" },
//     { name: "Đồng hồ", slug: "dong-ho" },
//   ];

//   // Popular searches
//   const popularSearches = [
//     "Áo sơ mi",
//     "Váy đầm",
//     "Sneakers",
//     "Túi xách nữ",
//     "Đồng hồ nam",
//     "Khuyến mãi",
//   ];

//   // Recent product releases
//   const newReleases = [
//     "Bộ sưu tập hè 2025",
//     "Đầm dự tiệc mới nhất",
//     "Giày thể thao Ultra 5.0",
//     "Phụ kiện công nghệ",
//   ];

//   return (
//     <div className="w-full space-y-8">
//       {/* Search form */}
//       <div className="bg-white p-6 rounded-lg shadow-sm">
//         <h2 className="text-xl font-semibold mb-4">Tìm kiếm sản phẩm</h2>
//         <form onSubmit={handleSearch} className="mb-4">
//           <SearchInput
//             className="w-full"
//             placeholder="Nhập tên sản phẩm, thương hiệu hoặc danh mục..."
//           />
//         </form>
//       </div>

//       {/* Trending searches */}
//       <div className="bg-white p-6 rounded-lg shadow-sm">
//         <h2 className="flex items-center text-lg font-semibold mb-4">
//           <TrendingUp className="w-5 h-5 mr-2 text-primary" />
//           Tìm kiếm phổ biến
//         </h2>
//         <div className="flex flex-wrap gap-2">
//           {popularSearches.map((term, index) => (
//             <button
//               key={index}
//               onClick={() =>
//                 router.push(`/search?q=${encodeURIComponent(term)}`)
//               }
//               className="px-4 py-2 bg-muted rounded-full hover:bg-primary hover:text-white transition-colors text-sm"
//             >
//               {term}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Popular categories */}
//       <div className="bg-white p-6 rounded-lg shadow-sm">
//         <h2 className="flex items-center text-lg font-semibold mb-4">
//           <Tag className="w-5 h-5 mr-2 text-primary" />
//           Danh mục phổ biến
//         </h2>
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//           {popularCategories.map((category, index) => (
//             <a
//               key={index}
//               href={`/category/${category.slug}`}
//               className="flex justify-between items-center p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
//             >
//               <span>{category.name}</span>
//               <ArrowRight className="w-4 h-4 text-muted-foreground" />
//             </a>
//           ))}
//         </div>
//       </div>

//       {/* New releases */}
//       <div className="bg-white p-6 rounded-lg shadow-sm">
//         <h2 className="flex items-center text-lg font-semibold mb-4">
//           <Sparkles className="w-5 h-5 mr-2 text-primary" />
//           Sản phẩm mới ra mắt
//         </h2>
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//           {newReleases.map((item, index) => (
//             <div key={index} className="flex items-center">
//               <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
//               <a
//                 href={`/search?q=${encodeURIComponent(item)}&sort=newest`}
//                 className="text-primary hover:underline"
//               >
//                 {item}
//               </a>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchInput from "./SearchInput";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  Tag,
  Clock,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function SearchSuggestions() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  // Popular categories
  const popularCategories = [
    { name: "Thời trang nữ", slug: "thoi-trang-nu" },
    { name: "Thời trang nam", slug: "thoi-trang-nam" },
    { name: "Giày dép", slug: "giay-dep" },
    { name: "Túi xách", slug: "tui-xach" },
    { name: "Phụ kiện", slug: "phu-kien" },
    { name: "Đồng hồ", slug: "dong-ho" },
  ];

  // Popular searches
  const popularSearches = [
    { term: "Áo sơ mi", icon: "👔" },
    { term: "Váy đầm", icon: "👗" },
    { term: "Sneakers", icon: "👟" },
    { term: "Túi xách nữ", icon: "👜" },
    { term: "Đồng hồ nam", icon: "⌚" },
    { term: "Khuyến mãi", icon: "🏷️" },
  ];

  // Recent product releases
  const newReleases = [
    "Bộ sưu tập hè 2025",
    "Đầm dự tiệc mới nhất",
    "Giày thể thao Ultra 5.0",
    "Phụ kiện công nghệ",
  ];

  // Featured collections
  const featuredCollections = [
    {
      name: "Thời Trang Công Sở",
      description: "Phong cách thanh lịch và chuyên nghiệp",
      image: "/images/collections/office-wear.jpg",
      url: "/collection/office-wear",
    },
    {
      name: "Dạo Phố Cuối Tuần",
      description: "Thoải mái, năng động và thời thượng",
      image: "/images/collections/casual.jpg",
      url: "/collection/casual",
    },
    {
      name: "Đầm Dự Tiệc",
      description: "Tỏa sáng trong mọi sự kiện đặc biệt",
      image: "/images/collections/party.jpg",
      url: "/collection/party-dress",
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Main search form with enhanced design */}
      <div className="bg-white p-8 rounded-xl shadow-sm text-center">
        <h2 className="text-2xl font-semibold mb-3">Tìm kiếm sản phẩm</h2>
        <p className="text-muted-foreground mb-6">
          Hàng ngàn sản phẩm đang chờ bạn khám phá
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative flex">
            <SearchInput
              className="w-full flex-grow"
              placeholder="Nhập tên sản phẩm, thương hiệu hoặc danh mục..."
            />
            <Button type="submit" size="lg" className="ml-2 rounded-full">
              <Search className="mr-2 h-4 w-4" /> Tìm kiếm
            </Button>
          </div>
        </form>
      </div>

      {/* Trending searches with icons */}
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="flex items-center text-xl font-semibold mb-6">
          <TrendingUp className="w-5 h-5 mr-2 text-primary" />
          Tìm kiếm phổ biến
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {popularSearches.map((item, index) => (
            <button
              key={index}
              onClick={() =>
                router.push(`/search?q=${encodeURIComponent(item.term)}`)
              }
              className="flex items-center p-3 border rounded-lg hover:bg-primary/5 transition-colors group"
            >
              <span className="text-2xl mr-3">{item.icon}</span>
              <span className="text-sm font-medium group-hover:text-primary">
                {item.term}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular categories with better design */}
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="flex items-center text-xl font-semibold mb-6">
          <Tag className="w-5 h-5 mr-2 text-primary" />
          Danh mục phổ biến
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {popularCategories.map((category, index) => (
            <a
              key={index}
              href={`/category/${category.slug}`}
              className="group"
            >
              <div className="flex justify-between items-center p-4 bg-muted rounded-lg hover:bg-primary/10 transition-all duration-300 border-l-4 border-transparent group-hover:border-primary">
                <span className="font-medium">{category.name}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transform group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Featured collections */}
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="flex items-center text-xl font-semibold mb-6">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          Bộ sưu tập nổi bật
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCollections.map((collection, index) => (
            <div
              key={index}
              className="group cursor-pointer"
              onClick={() => router.push(collection.url)}
            >
              <div className="relative rounded-lg overflow-hidden aspect-[4/3] mb-3">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 opacity-60 z-10 transition-opacity duration-300 group-hover:opacity-80" />
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <h3 className="text-white font-semibold text-lg">
                    {collection.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {collection.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New releases with minimalist design */}
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="flex items-center text-xl font-semibold mb-6">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Mới ra mắt
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {newReleases.map((item, index) => (
            <a
              key={index}
              href={`/search?q=${encodeURIComponent(item)}&sort=newest`}
              className="group flex items-center p-4 border rounded-lg hover:border-primary/50 transition-colors"
            >
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <span className="font-medium group-hover:text-primary transition-colors">
                  {item}
                </span>
                <p className="text-xs text-muted-foreground mt-1">Mới ra mắt</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
