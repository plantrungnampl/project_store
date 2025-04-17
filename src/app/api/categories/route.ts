import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Đặt thời gian cache cho API
export const revalidate = 3600; // Cache 1 giờ

export async function GET() {
  try {
    // Lấy tất cả các danh mục đang active
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        level: true,
        parentId: true,
        sortOrder: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
