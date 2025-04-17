import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CouponsTable from "@/components/admin/coupons/CouponsTable";
import { CouponType } from "@prisma/client";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Coupons Management | NextStore",
  description: "Manage your store discount coupons",
};

export default async function CouponsPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    limit?: string;
    sort?: string;
    q?: string;
    type?: string;
    active?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const sort = searchParams.sort || "createdAt:desc";
  const query = searchParams.q || "";
  const type = searchParams.type as CouponType | undefined;
  const active =
    searchParams.active !== undefined
      ? searchParams.active === "true"
      : undefined;
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
      { code: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
  }

  if (type) {
    filter.type = type;
  }

  if (active !== undefined) {
    filter.isActive = active;

    // Only show active coupons that haven't expired yet
    if (active) {
      filter.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
    }
  }

  // Fetch coupons data
  const [coupons, totalCoupons, couponsByType] = await Promise.all([
    prisma.coupon.findMany({
      skip,
      take: limit,
      where: filter,
      orderBy,
    }),
    prisma.coupon.count({
      where: filter,
    }),
    prisma.coupon.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
    }),
  ]);

  // Calculate type counts
  const typeCounts = couponsByType.reduce((acc, item) => {
    acc[item.type] = item._count.type;
    return acc;
  }, {} as Record<string, number>);

  // Get active vs. inactive counts
  const [activeCoupons, inactiveCoupons] = await Promise.all([
    prisma.coupon.count({
      where: {
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
    prisma.coupon.count({
      where: {
        OR: [
          { isActive: false },
          {
            isActive: true,
            expiresAt: { lt: new Date() },
          },
        ],
      },
    }),
  ]);

  // Format the coupons with additional data
  const formattedCoupons = coupons.map((coupon) => {
    const isExpired = coupon.expiresAt
      ? new Date(coupon.expiresAt) < new Date()
      : false;
    const isActiveNow = coupon.isActive && !isExpired;

    return {
      ...coupon,
      isExpired,
      isActiveNow,
    };
  });

  const totalPages = Math.ceil(totalCoupons / limit);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Coupons</h1>
          <p className="text-muted-foreground">
            Manage your discount coupons ({totalCoupons} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/coupons/new">
            <Plus className="h-4 w-4 mr-2" /> Add Coupon
          </Link>
        </Button>
      </div>

      <CouponsTable
        coupons={formattedCoupons}
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        sort={sort}
        query={query}
        typeFilter={type}
        activeFilter={active}
        typeCounts={typeCounts}
        activeCouponsCount={activeCoupons}
        inactiveCouponsCount={inactiveCoupons}
      />
    </div>
  );
}
