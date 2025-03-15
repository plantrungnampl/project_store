// "use server";

// import { prisma } from "@/lib/prisma";

// export async function getProducts() {
//   try {
//     const products = await prisma.product.findMany({
//       orderBy: {
//         createdAt: "desc",
//       },
//     });
//     return { products };
//   } catch (error) {
//     console.log(error);
//     return { error: "Không thể lấy dữ liệu người dùng" };
//   }
// }
"use server";

// Import Prisma client hoặc database client của bạn
import prisma from "@/lib/prisma";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        brand: true,
        categories: {
          include: {
            category: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    return { products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [] };
  }
}
