import { Metadata } from "next";
import Link from "next/link";
import { getUserOrders } from "@/app/actions/orderActions";
import { formatPrice } from "@/lib/formatPrice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TruckIcon,
  ArrowUpRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi | Cửa hàng của bạn",
  description: "Xem và quản lý các đơn hàng của bạn",
};

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
    case "CONFIRMED":
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
    month: "long",
    day: "numeric",
  });
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  // Get all user orders
  const { success, orders, error } = await getUserOrders();

  // Filter orders by status if provided
  const status = searchParams.status?.toUpperCase();
  // const filteredOrders = status
  //   ? orders?.filter((order) => order.status === status)
  //   : orders;

  // Group orders by status
  const pendingOrders =
    orders?.filter((order) =>
      ["PENDING", "PROCESSING", "SHIPPED"].includes(order.status)
    ) || [];
  const completedOrders =
    orders?.filter((order) =>
      ["DELIVERED", "COMPLETED", "CONFIRMED"].includes(order.status)
    ) || [];
  const canceledOrders =
    orders?.filter((order) => order.status === "CANCELED") || [];

  // Set default tab based on search params
  let defaultTab = "all";
  if (status) {
    if (["PENDING", "PROCESSING", "SHIPPED"].includes(status)) {
      defaultTab = "pending";
    } else if (["DELIVERED", "COMPLETED", "CONFIRMED"].includes(status)) {
      defaultTab = "completed";
    } else if (status === "CANCELED") {
      defaultTab = "canceled";
    }
  }

  if (!success) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Đơn hàng của tôi</h2>
        <div className="text-red-500">
          {error || "Đã có lỗi xảy ra khi tải đơn hàng"}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Đơn hàng của tôi</h2>
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
          <Button asChild>
            <Link href="/product">Mua sắm ngay</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Đơn hàng của tôi</h2>
        <p className="text-gray-500 text-sm mt-1">
          Quản lý và theo dõi tất cả đơn hàng của bạn
        </p>
      </div>

      <div className="p-6">
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">Tất cả ({orders.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Đang xử lý ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Hoàn thành ({completedOrders.length})
            </TabsTrigger>
            <TabsTrigger value="canceled">
              Đã hủy ({canceledOrders.length})
            </TabsTrigger>
          </TabsList>

          {/* All orders */}
          <TabsContent value="all">
            <OrderList orders={orders} />
          </TabsContent>

          {/* Pending orders */}
          <TabsContent value="pending">
            <OrderList orders={pendingOrders} />
          </TabsContent>

          {/* Completed orders */}
          <TabsContent value="completed">
            <OrderList orders={completedOrders} />
          </TabsContent>

          {/* Canceled orders */}
          <TabsContent value="canceled">
            <OrderList orders={canceledOrders} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper component for the order list
function OrderList({ orders }: { orders: any[] }) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Không có đơn hàng nào trong mục này</p>
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
              {order.paymentMethod && (
                <>
                  <span className="mx-2">•</span>
                  <span>
                    {order.paymentMethod === "cod"
                      ? "Thanh toán khi nhận hàng"
                      : order.paymentMethod === "bank-transfer"
                      ? "Chuyển khoản ngân hàng"
                      : order.paymentMethod}
                  </span>
                </>
              )}
            </div>

            <div className="font-medium text-gray-900">
              {formatPrice(order.grandTotal)}
            </div>
          </div>

          <div className="w-full sm:w-auto flex gap-2">
            <Link href={`/profile/orders/${order.orderNumber}`}>
              <Button variant="outline" size="sm">
                Xem chi tiết
              </Button>
            </Link>

            {/* Show reorder button for completed orders */}
            {["DELIVERED", "COMPLETED", "CONFIRMED"].includes(order.status) && (
              <Button size="sm">Đặt lại</Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
