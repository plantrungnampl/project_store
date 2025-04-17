import { Metadata } from "next";
import OrdersTable from "@/components/admin/orders/OrdersTable";
import { OrderStatus } from "@prisma/client";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Orders Management | NextStore",
  description: "Manage your customer orders",
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    limit?: string;
    sort?: string;
    q?: string;
    status?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const sort = searchParams.sort || "createdAt:desc";
  const query = searchParams.q || "";
  const skip = (page - 1) * limit;
  const status = searchParams.status as OrderStatus | undefined;

  // Parse sort parameter
  const [sortField, sortOrder] = sort.split(":");
  const orderBy = {
    [sortField]: sortOrder,
  };

  // Build filter conditions
  let filter: any = {};

  if (query) {
    filter.OR = [
      { orderNumber: { contains: query } },
      { email: { contains: query, mode: "insensitive" } },
      {
        user: {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
      },
    ];
  }

  if (status) {
    filter.status = status;
  }

  // Fetch orders with related data
  const [orders, totalOrders, ordersByStatus] = await Promise.all([
    prisma.order.findMany({
      skip,
      take: limit,
      where: filter,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          select: {
            id: true,
            quantity: true,
            total: true,
          },
        },
        shippingAddress: true,
      },
    }),
    prisma.order.count({
      where: filter,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
  ]);

  // Calculate status counts
  const statusCounts = ordersByStatus.reduce((acc, item) => {
    acc[item.status] = item._count.status;
    return acc;
  }, {} as Record<string, number>);

  const totalPages = Math.ceil(totalOrders / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage your customer orders ({totalOrders} total)
        </p>
      </div>

      <OrdersTable
        orders={orders}
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        sort={sort}
        query={query}
        statusFilter={status}
        statusCounts={statusCounts}
      />
    </div>
  );
}
