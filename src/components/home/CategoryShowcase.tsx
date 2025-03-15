import Image from "next/image";
import Link from "next/link";

interface CategoryProps {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
}

interface CategoryShowcaseProps {
  categories: CategoryProps[];
}

export default function CategoryShowcase({
  categories,
}: CategoryShowcaseProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Các bố cục cho các loại danh mục khác nhau
  const getLayoutClasses = (index: number) => {
    // Tạo grid thú vị với kích thước khác nhau
    switch (index % 5) {
      case 0: // Large
        return "col-span-2 row-span-2";
      case 1: // Tall
        return "col-span-1 row-span-2";
      case 2: // Wide
        return "col-span-2 row-span-1";
      default: // Standard
        return "col-span-1 row-span-1";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-minmax(180px, auto)">
      {categories.map((category, index) => (
        <Link
          key={category.id}
          href={`/categories/${category.slug}`}
          className={`${getLayoutClasses(
            index
          )} group relative overflow-hidden rounded-lg shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg`}
        >
          {/* Image Background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10 z-10" />

          {category.imageUrl ? (
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 p-5 z-20 w-full">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-1 group-hover:text-primary-200 transition-colors">
              {category.name}
            </h3>

            {category.description && (
              <p className="text-sm text-gray-200 mb-2 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {category.description}
              </p>
            )}

            {category.productCount !== undefined && (
              <span className="inline-block px-3 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full text-white">
                {category.productCount} sản phẩm
              </span>
            )}

            <span className="text-white text-sm mt-2 inline-flex items-center font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Xem danh mục <span className="ml-1 text-lg">→</span>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
