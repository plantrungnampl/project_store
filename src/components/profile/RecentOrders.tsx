import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TruckIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  grandTotal: number;
  items: any[];
  _count?: {
    items: number;
  };
}

interface RecentOrdersProps {
  orders: Order[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  // Function to get status badge properties
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Chờ xử lý",
          variant: "outline" as const,
          icon: <Clock className="h-3 w-3" />,
        };
      case "PROCESSING":
        return {
          label: "Đang xử lý",
          variant: "secondary" as const,
          icon: <Package className="h-3 w-3" />,
        };
      case "SHIPPED":
        return {
          label: "Đang giao hàng",
          variant: "default" as const,
          icon: <TruckIcon className="h-3 w-3" />,
        };
      case "DELIVERED":
      case "COMPLETED":
        return {
          label: "Hoàn thành",
          variant: "success" as const,
          icon: <CheckCircle className="h-3 w-3" />,
        };
      case "CANCELED":
        return {
          label: "Đã hủy",
          variant: "destructive" as const,
          icon: <XCircle className="h-3 w-3" />,
        };
      default:
        return {
          label: status,
          variant: "outline" as const,
          icon: null,
        };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
        <Button asChild>
          <Link href="/products">Mua sắm ngay</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="flex flex-col sm:flex-row justify-between items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <Link
                href={`/profile/orders/${order.orderNumber}`}
                className="font-medium text-primary hover:underline flex items-center"
              >
                Đơn hàng #{order.orderNumber}{" "}
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Link>

              <Badge
                variant={getStatusBadge(order.status).variant}
                className="flex items-center gap-1"
              >
                {getStatusBadge(order.status).icon}
                {getStatusBadge(order.status).label}
              </Badge>
            </div>

            <div className="text-sm text-gray-500 mb-2">
              <span>{formatDate(order.createdAt)}</span>
              <span className="mx-2">•</span>
              <span>
                {order._count ? order._count.items : order.items.length} sản
                phẩm
              </span>
            </div>

            <div className="font-medium text-gray-900">
              {formatPrice(order.grandTotal)}
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <Link href={`/account/orders/${order.orderNumber}`}>
              <Button variant="outline" size="sm">
                Xem chi tiết
              </Button>
            </Link>
          </div>
        </div>
      ))}

      {/* View all link */}
      {orders.length > 0 && (
        <div className="text-center mt-6">
          <Link
            href="/account/orders"
            className="text-sm text-primary hover:underline font-medium inline-flex items-center"
          >
            Xem tất cả đơn hàng <ArrowUpRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
