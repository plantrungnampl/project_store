"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Order,
  OrderStatus,
  User,
  Address,
  Transaction,
  OrderStatusUpdate,
} from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  ClipboardCheck,
  AlertCircle,
  CircleCheck,
  History,
  Receipt,
  User as UserIcon,
  Send,
  MapPin,
} from "lucide-react";
import OrderStatusUpdateForm from "./OrderStatusUpdateForm";
import { formatDate, formatPrice } from "@/lib/formatPrice";

type OrderWithRelations = Order & {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
  } | null;
  shippingAddress: Address | null;
  billingAddress: Address | null;
  items: (OrderItem & {
    product: {
      id: string;
      slug: string;
      images: {
        url: string;
        altText: string | null;
      }[];
    };
    variant: {
      id: string;
      name: string;
    } | null;
  })[];
  transactions: Transaction[];
  statusUpdates: OrderStatusUpdate[];
};

type OrderItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
};

interface OrderDetailsProps {
  order: OrderWithRelations;
}

export default function OrderDetails({ order }: OrderDetailsProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Function to get status badge color
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Completed
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            Processing
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Pending
          </Badge>
        );
      case "CANCELED":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Canceled
          </Badge>
        );
      case "SHIPPED":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
            Shipped
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
            Delivered
          </Badge>
        );
      case "ON_HOLD":
        return (
          <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
            On Hold
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get transaction status badge
  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            Success
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
            Pending
          </Badge>
        );
      case "FAILURE":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format address
  const formatAddress = (address: Address | null) => {
    if (!address) return "No address provided";

    return (
      <div className="space-y-1 text-sm">
        <p className="font-medium">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>{address.country}</p>
        {address.phone && <p>{address.phone}</p>}
      </div>
    );
  };

  // Calculate totals
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3">
          {!isUpdatingStatus ? (
            <Button variant="outline" onClick={() => setIsUpdatingStatus(true)}>
              Update Status
            </Button>
          ) : (
            <OrderStatusUpdateForm
              orderId={order.id}
              currentStatus={order.status}
              onCancel={() => setIsUpdatingStatus(false)}
              onSuccess={() => setIsUpdatingStatus(false)}
            />
          )}

          <Button>Print Invoice</Button>
        </div>
      </div>

      {/* Order summary header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between gap-6">
          <div>
            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              Order #{order.orderNumber}
              {getStatusBadge(order.status)}
            </h1>
            <p className="text-muted-foreground mb-4">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Customer</p>
              <p className="font-medium">
                {order.user ? (
                  <Link
                    href={`/admin/customers/${order.user.id}`}
                    className="hover:underline"
                  >
                    {order.user.firstName} {order.user.lastName}
                  </Link>
                ) : (
                  <span>Guest ({order.email})</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Payment Method
              </p>
              <p className="font-medium">
                {order.paymentMethod || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Shipping Method
              </p>
              <p className="font-medium">
                {order.shippingMethod || "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order details and items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({itemCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md divide-y">
                {order.items.map((item) => (
                  <div key={item.id} className="p-4 flex">
                    <div className="h-16 w-16 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product.images[0].altText || item.name}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-grow">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          {item.variant && (
                            <p className="text-sm text-muted-foreground">
                              Variant: {item.variant.name}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            SKU: {item.sku}
                          </p>
                        </div>
                        <div className="mt-2 sm:mt-0 text-right">
                          <div className="font-medium">
                            {formatPrice(Number(item.unitPrice))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </div>
                        </div>
                      </div>
                      {(Number(item.discount) > 0 || Number(item.tax) > 0) && (
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
                          <div>
                            {Number(item.discount) > 0 && (
                              <div>
                                Discount: {formatPrice(Number(item.discount))}
                              </div>
                            )}
                            {Number(item.tax) > 0 && (
                              <div>Tax: {formatPrice(Number(item.tax))}</div>
                            )}
                          </div>
                          <div className="font-medium">
                            Total: {formatPrice(Number(item.total))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order timeline and history tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="status">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="status">Status Updates</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                <TabsContent value="status" className="space-y-4 pt-4">
                  {order.statusUpdates.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                      No status updates recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {order.statusUpdates.map((update) => (
                        <div key={update.id} className="flex gap-4">
                          <div className="mt-1">
                            <div className="bg-primary rounded-full p-1">
                              <CircleCheck className="h-4 w-4 text-primary-foreground" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              {getStatusBadge(update.status)}
                              {update.comment && (
                                <span className="text-gray-500 dark:text-gray-400 text-sm">
                                  {update.comment}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(update.createdAt)} by{" "}
                              {update.createdBy || "System"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="transactions" className="pt-4">
                  {order.transactions.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                      No transactions recorded yet.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {order.transactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium capitalize">
                                  {transaction.type.toLowerCase()}
                                </span>
                                {getTransactionStatusBadge(transaction.status)}
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {formatPrice(Number(transaction.amount))}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {transaction.currency}
                              </div>
                            </div>
                          </div>
                          {transaction.providerTransactionId && (
                            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              Transaction ID:{" "}
                              {transaction.providerTransactionId}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Order summary and customer info */}
        <div className="space-y-6">
          {/* Order summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">
                    Shipping
                  </span>
                  <span>{formatPrice(Number(order.shippingTotal))}</span>
                </div>
                {Number(order.discountTotal) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Discount
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      -{formatPrice(Number(order.discountTotal))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Tax</span>
                  <span>{formatPrice(Number(order.taxTotal))}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium text-lg">
                  <span>Grand Total</span>
                  <span>{formatPrice(Number(order.grandTotal))}</span>
                </div>
              </div>
              {order.couponCodes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Applied coupons: {order.couponCodes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Contact Details</h4>
                <div className="space-y-1 text-sm">
                  <p>
                    {order.user ? (
                      <Link
                        href={`/admin/customers/${order.user.id}`}
                        className="hover:underline"
                      >
                        {order.user.firstName} {order.user.lastName}
                      </Link>
                    ) : (
                      "Guest Customer"
                    )}
                  </p>
                  <p>Email: {order.email}</p>
                  {order.user?.phone && <p>Phone: {order.user.phone}</p>}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h4>
                {formatAddress(order.shippingAddress)}
              </div>

              {order.billingAddress && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Billing Address
                    </h4>
                    {formatAddress(order.billingAddress)}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Admin notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.customerNote && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Customer Note</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      {order.customerNote}
                    </p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium mb-1">Admin Note</h4>
                  <p className="text-sm">
                    {order.adminNote || "No admin notes for this order."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
