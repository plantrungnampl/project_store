import { Metadata } from "next";
import DashboardCard from "@/components/admin/DashboardCard";
import { Users, ShoppingBag, Package, CreditCard } from "lucide-react";
import RecentOrdersTable from "@/components/admin/RecentOrdersTable";
import PerformanceChart from "@/components/admin/PerformanceChart";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/formatPrice";

export const metadata: Metadata = {
  title: "Admin Dashboard | NextStore",
  description: "Admin dashboard for NextStore",
};

export default async function AdminDashboardPage() {
  // Get counts and summary data for dashboard
  const [
    userCount,
    productCount,
    orderCount,
    totalRevenue,
    recentOrders,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: {
        grandTotal: true,
      },
      where: {
        status: {
          in: ["COMPLETED", "DELIVERED", "SHIPPED"],
        },
      },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  const totalRevenueValue = totalRevenue._sum.grandTotal || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your store's performance and recent activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Customers"
          value={userCount.toString()}
          description="Total registered users"
          icon={<Users className="h-6 w-6" />}
          trend={+5.2}
          color="blue"
        />
        <DashboardCard
          title="Products"
          value={productCount.toString()}
          description="Active products in store"
          icon={<Package className="h-6 w-6" />}
          trend={+2.5}
          color="green"
        />
        <DashboardCard
          title="Orders"
          value={orderCount.toString()}
          description="Total orders placed"
          icon={<ShoppingBag className="h-6 w-6" />}
          trend={+12.7}
          color="amber"
        />
        <DashboardCard
          title="Revenue"
          value={formatPrice(Number(totalRevenueValue))}
          description="Total completed orders"
          icon={<CreditCard className="h-6 w-6" />}
          trend={+8.3}
          color="purple"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Performance</h2>
          <PerformanceChart />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
          <RecentOrdersTable orders={recentOrders} />
        </div>
      </div>
    </div>
  );
}
