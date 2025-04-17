"use client";

// import { Order } from "@prisma/client";
import { formatPrice, formatDate } from "@/lib/formatPrice";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Order } from "@/types";

type OrderWithUser = Order & {
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
};

interface RecentOrdersTableProps {
  orders: OrderWithUser[];
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  // Function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "CANCELED":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="overflow-hidden rounded-lg">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600 dark:text-gray-400">
            <th className="pb-3 px-2">Order</th>
            <th className="pb-3 px-2">Customer</th>
            <th className="pb-3 px-2">Date</th>
            <th className="pb-3 px-2">Status</th>
            <th className="pb-3 px-2">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="py-6 text-center text-gray-500 dark:text-gray-400"
              >
                No recent orders
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-2">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    #{order.orderNumber}
                  </Link>
                </td>
                <td className="py-3 px-2">
                  {order.user ? (
                    <div>
                      <div className="font-medium">
                        {order.user.firstName} {order.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.user.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      {order.email}
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                  {formatDate(order.createdAt, " dd/MM/yyyy")}
                </td>
                <td className="py-3 px-2">
                  <Badge
                    className={getStatusColor(order.status)}
                    variant="outline"
                  >
                    {order.status}
                  </Badge>
                </td>
                <td className="py-3 px-2 font-medium">
                  {formatPrice(Number(order.grandTotal))}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
