import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BannersTable from "@/components/admin/banners/BannersTable";
import { BannerType } from "@prisma/client";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Banners Management | NextStore",
  description: "Manage your store banners",
};

export default async function BannersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    limit?: string;
    sort?: string;
    q?: string;
    type?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const sort = searchParams.sort || "sortOrder:asc";
  const query = searchParams.q || "";
  const type = searchParams.type as BannerType | undefined;
  const skip = (page - 1) * limit;

  // Parse sort parameter
  const [sortField, sortOrder] = sort.split(":");
  const orderBy = {
    [sortField]: sortOrder,
  };

  // Build filter conditions
  let filter: any = {};

  if (query) {
    filter.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { subtitle: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (type) {
    filter.type = type;
  }

  // Fetch banners with related data
  const [banners, totalBanners, bannersByType] = await Promise.all([
    prisma.banner.findMany({
      skip,
      take: limit,
      where: filter,
      orderBy,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),
    prisma.banner.count({
      where: filter,
    }),
    prisma.banner.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
    }),
  ]);

  // Calculate type counts
  const typeCounts = bannersByType.reduce((acc, item) => {
    acc[item.type] = item._count.type;
    return acc;
  }, {} as Record<string, number>);

  const totalPages = Math.ceil(totalBanners / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
          <p className="text-muted-foreground">
            Manage your store banners ({totalBanners} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/banners/new">
            <Plus className="h-4 w-4 mr-2" /> Add Banner
          </Link>
        </Button>
      </div>

      <BannersTable
        banners={banners}
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        sort={sort}
        query={query}
        typeFilter={type}
        typeCounts={typeCounts}
      />
    </div>
  );
}
