import { BannerType } from "./../../../../../node_modules/.prisma/client/index.d";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
// import { BannerType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { validateRequest } from "@prisma/client";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";

// GET handler để lấy tất cả banner hoặc theo type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as BannerType | null;
    const active = searchParams.get("active");

    const whereClause: any = {};

    // Filter theo type nếu được cung cấp
    if (type) {
      whereClause.type = type;
    }

    // Filter theo trạng thái active nếu được cung cấp
    if (active === "true") {
      whereClause.isActive = true;

      // Nếu chỉ lấy banner active, kiểm tra startDate và endDate
      const currentDate = new Date();
      whereClause.AND = [
        {
          OR: [{ startDate: null }, { startDate: { lte: currentDate } }],
        },
        {
          OR: [{ endDate: null }, { endDate: { gte: currentDate } }],
        },
      ];
    } else if (active === "false") {
      whereClause.isActive = false;
    }

    const banners = await prisma.banner.findMany({
      where: whereClause,
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json(banners);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST handler để tạo banner mới
export async function POST(request: NextRequest) {
  try {
    // Kiểm tra quyền admin
    const session = await validateRequest();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate dữ liệu đầu vào
    if (!data.title || !data.ctaText || !data.ctaLink || !data.imageUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Tạo banner mới
    const banner = await prisma.banner.create({
      data: {
        ...data,
        createdBy: session.user.id,
      },
    });

    // Revalidate các trang liên quan
    revalidatePath("/");

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error creating banner:", error);
    return NextResponse.json(
      { error: "Failed to create banner" },
      { status: 500 }
    );
  }
}

// PUT handler để cập nhật banner
export async function PUT(request: NextRequest) {
  try {
    // Kiểm tra quyền admin
    const session = await validateRequest();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate dữ liệu đầu vào
    if (!data.id) {
      return NextResponse.json(
        { error: "Banner ID is required" },
        { status: 400 }
      );
    }

    // Cập nhật banner
    const banner = await prisma.banner.update({
      where: { id: data.id },
      data: {
        ...data,
        updatedBy: session.user.id,
      },
    });

    // Revalidate các trang liên quan
    revalidatePath("/");

    return NextResponse.json(banner);
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

// DELETE handler để xóa banner
export async function DELETE(request: NextRequest) {
  try {
    // Kiểm tra quyền admin
    const session = await validateRequest();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Banner ID is required" },
        { status: 400 }
      );
    }

    // Xóa banner
    await prisma.banner.delete({
      where: { id },
    });

    // Revalidate các trang liên quan
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
}
