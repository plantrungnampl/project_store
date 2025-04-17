import { Metadata } from "next";
import { UserRole } from "@prisma/client";
import CustomersList from "@/components/admin/customers/CustomersList";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Customers Management | NextStore",
  description: "Manage your store customers",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    limit?: string;
    sort?: string;
    q?: string;
    role?: string;
  };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const sort = searchParams.sort || "createdAt:desc";
  const query = searchParams.q || "";
  const role = searchParams.role as UserRole | undefined;
  const skip = (page - 1) * limit;

  // Parse sort parameter
  const [sortField, sortOrder] = sort.split(":");
  const orderBy = {
    [sortField]: sortOrder,
  };

  // Build filter conditions
  let filter: any = {
    deletedAt: null, // Only show active users
  };

  if (query) {
    filter.OR = [
      { email: { contains: query, mode: "insensitive" } },
      { firstName: { contains: query, mode: "insensitive" } },
      { lastName: { contains: query, mode: "insensitive" } },
      { phone: { contains: query, mode: "insensitive" } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  // Fetch customers with related data
  const [customers, totalCustomers, customersByRole] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      where: filter,
      orderBy,
      include: {
        orders: {
          select: {
            id: true,
            grandTotal: true,
          },
        },
        reviews: {
          select: {
            id: true,
          },
        },
        addresses: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.user.count({
      where: filter,
    }),
    prisma.user.groupBy({
      by: ["role"],
      where: {
        deletedAt: null,
      },
      _count: {
        role: true,
      },
    }),
  ]);

  // Calculate role counts
  const roleCounts = customersByRole.reduce((acc, item) => {
    acc[item.role] = item._count.role;
    return acc;
  }, {} as Record<string, number>);

  // Calculate additional customer metrics
  const enhancedCustomers = customers.map((customer) => {
    // Calculate total spent
    const totalSpent = customer.orders.reduce(
      (sum, order) => sum + Number(order.grandTotal),
      0
    );

    return {
      ...customer,
      totalSpent,
      orderCount: customer.orders.length,
      reviewCount: customer.reviews.length,
      addressCount: customer.addresses.length,
    };
  });

  const totalPages = Math.ceil(totalCustomers / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your store customers ({totalCustomers} total)
        </p>
      </div>

      <CustomersList
        customers={enhancedCustomers}
        currentPage={page}
        totalPages={totalPages}
        limit={limit}
        sort={sort}
        query={query}
        roleFilter={role}
        roleCounts={roleCounts}
      />
    </div>
  );
}
