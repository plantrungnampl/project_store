'use client'
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { CheckCircle, Package, Truck, CreditCard, Share2, Download, ArrowRight, Printer, Home } from "lucide-react";
import type { Order } from "@/types/index"; 
import OrderTrackingStatus from "@/components/orders/OrderTrackingStatus";
import OrderNotificationOpt from "@/components/orders/OrderNotificationOpt";
import OrderReviewPrompt from "@/components/orders/OrderReviewPrompt";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface OrderConfirmationPageProps {
  order: Order;
  className?: string;
}

export default function OrderConfirmationPage({ order, className }: OrderConfirmationPageProps) {
  const [mounted, setMounted] = useState(false);

  // Set mounted state to true on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Format thời gian đặt hàng
  const orderDate = order.createdAt ? format(new Date(order.createdAt), 'HH:mm - dd/MM/yyyy', { locale: vi }) : '';
  
  // Thông tin thanh toán
  const paymentMethodLabels: Record<string, string> = {
    cod: "Thanh toán khi nhận hàng (COD)",
    "bank-transfer": "Chuyển khoản ngân hàng",
    "credit-card": "Thẻ tín dụng/ghi nợ",
    momo: "Ví MoMo",
  };

  const paymentMethodLabel =
    paymentMethodLabels[order.paymentMethod] || order.paymentMethod;

  // Thông tin giao hàng
  const shippingAddress = order.shippingAddress;
  const billingAddress = order.billingAddress;
  
  // Chia sẻ đơn hàng
  const shareOrder = () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: `Đơn hàng #${order.orderNumber}`,
        text: `Tôi vừa đặt hàng tại NextStore. Đơn hàng #${order.orderNumber} với tổng tiền ${formatPrice(order.grandTotal)}`,
        url: window.location.href,
      })
      .catch((error) => console.log('Lỗi khi chia sẻ:', error));
    }
  };
  
  // Tạo và in hóa đơn
  const printInvoice = () => {
    window.print();
  };
  
  // Format địa chỉ để hiển thị
  const formatAddress = (address: any) => {
    if (!address) return 'Không có thông tin';
    
    const parts = [
      address.firstName && address.lastName ? `${address.firstName} ${address.lastName}` : address.fullName || '',
      address.addressLine1,
      address.addressLine2,
      [address.city, address.state, address.postalCode].filter(Boolean).join(', '),
      address.country,
      address.phone
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  // Kiểm tra nếu đơn hàng có chi tiết sản phẩm
  const hasOrderItems = order.items && order.items.length > 0;
  
  // Kiểm tra xem đơn hàng đã được giao / hoàn thành chưa để hiển thị prompt đánh giá
  const canReview = ['DELIVERED', 'COMPLETED'].includes(order.status);
  
  return (
    <div className={cn("bg-white dark:bg-gray-950 min-h-screen py-8 print:py-0 print:bg-white", className)}>
      <div className="container mx-auto px-4 print:px-0 print:max-w-full">
        <div className="max-w-3xl mx-auto print:max-w-full">
          
          {/* Crumb navigation - chỉ hiển thị trên màn hình */}
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-6 print:hidden">
            <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 inline-flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Trang chủ
            </Link>
            <span className="mx-2">/</span>
            <Link href="/profile/orders" className="hover:text-gray-700 dark:hover:text-gray-300">
              Đơn hàng của tôi
            </Link>
            <span className="mx-2">/</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">#{order.orderNumber}</span>
          </div>
          
          {/* Success message */}
          <div className="text-center mb-8 print:mb-4 print:text-black">
            <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 mb-4 print:hidden">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white print:text-black mb-2">
              Đặt hàng thành công!
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 print:text-gray-800">
              Cảm ơn bạn đã mua hàng, đơn hàng của bạn đã được xác nhận.
            </p>
            
            {/* Order info and date */}
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 print:text-gray-700">
              Mã đơn hàng: <span className="font-medium text-gray-700 dark:text-gray-300 print:text-gray-900">{order.orderNumber}</span>
              {orderDate && (
                <>
                  <span className="mx-2">•</span>
                  <span>{orderDate}</span>
                </>
              )}
            </div>
          </div>

          {/* Order tracking - chỉ hiển thị trên desktop */}
          {mounted && (
            <div className="mb-8 print:hidden">
              <OrderTrackingStatus status={order.status} statusUpdates={order.statusUpdates} />
            </div>
          )}

          {/* Order summary */}
          <Card className="mb-8 border dark:border-gray-800 shadow-sm print:shadow-none print:border print:border-gray-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-4 flex-wrap md:flex-nowrap">
              <div>
                <CardTitle className="text-xl">Chi tiết đơn hàng</CardTitle>
                <CardDescription>
                  <span className="font-medium">{order.items?.length || 0}</span> sản phẩm
                </CardDescription>
              </div>
              
              {/* Order actions */}
              <div className="flex items-center gap-2 print:hidden">
                {typeof navigator !== 'undefined' && navigator.share && (
                  <Button onClick={shareOrder} variant="outline" size="sm" className="hidden md:flex gap-1.5">
                    <Share2 className="h-4 w-4" />
                    Chia sẻ
                  </Button>
                )}
                
                <Button onClick={printInvoice} variant="outline" size="sm" className="gap-1.5">
                  <Printer className="h-4 w-4" />
                  <span className="hidden md:inline">In hóa đơn</span>
                  <span className="inline md:hidden">In</span>
                </Button>
              </div>
            </CardHeader>
            
            <Separator className="mb-4" />
            
            <CardContent className="p-0">
              {/* Order items */}
              {hasOrderItems ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-4 px-6">
                      <div className="flex items-start gap-4">
                        {/* Product image */}
                        {item.productData?.image?.url && (
                          <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <Image
                              src={item.productData.image.url}
                              alt={item.name}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                // Fallback image on error
                                (e.target as HTMLImageElement).src = '/images/placeholder.png';
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Product details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                              {item.name}
                            </h3>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatPrice(item.unitPrice)} x {item.quantity}
                            </div>
                          </div>
                          
                          {item.variantName && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Phiên bản: {item.variantName}
                            </div>
                          )}
                        </div>
                        
                        {/* Item total */}
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {formatPrice(item.quantity * item.unitPrice)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-4 px-6 text-center text-gray-500 italic">
                  Không có thông tin chi tiết sản phẩm
                </p>
              )}
              
              {/* Order totals */}
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Tạm tính</span>
                    <span className="text-gray-900 dark:text-gray-200">{formatPrice(order.subtotal || 0)}</span>
                  </div>
                  
                  {order.discountTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Giảm giá</span>
                      <span className="text-green-600 dark:text-green-400">-{formatPrice(order.discountTotal)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Phí vận chuyển</span>
                    <span className="text-gray-900 dark:text-gray-200">{formatPrice(order.shippingTotal || 0)}</span>
                  </div>
                  
                  {order.taxTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Thuế</span>
                      <span className="text-gray-900 dark:text-gray-200">{formatPrice(order.taxTotal)}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between text-base">
                    <span className="font-medium text-gray-900 dark:text-white">Tổng cộng</span>
                    <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order.grandTotal || 0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order details and payment info */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="border dark:border-gray-800 shadow-sm print:shadow-none print:border print:border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Thông tin giao hàng</CardTitle>
              </CardHeader>
              <CardContent>
                {shippingAddress ? (
                  <div className="text-sm">
                    <div><span className="font-medium">Họ tên:</span> {shippingAddress.firstName} {shippingAddress.lastName}</div>
                    <div className="mt-1"><span className="font-medium">Địa chỉ:</span> {shippingAddress.addressLine1}</div>
                    {shippingAddress.addressLine2 && <div>{shippingAddress.addressLine2}</div>}
                    <div className="mt-1">{shippingAddress.city}, {shippingAddress.state || ''}</div>
                    <div>{shippingAddress.country}</div>
                    <div className="mt-1"><span className="font-medium">Điện thoại:</span> {shippingAddress.phone}</div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Không có thông tin địa chỉ giao hàng</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="border dark:border-gray-800 shadow-sm print:shadow-none print:border print:border-gray-300">
              <CardHeader>
                <CardTitle className="text-lg">Thông tin thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div className="flex gap-3 items-start">
                    <CreditCard className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Phương thức thanh toán</div>
                      <div className="text-gray-600 dark:text-gray-400 mt-0.5">{paymentMethodLabel}</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex gap-3 items-start">
                    <Truck className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-0.5" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Phương thức vận chuyển</div>
                      <div className="text-gray-600 dark:text-gray-400 mt-0.5">
                        {order.shippingMethod === 'standard'
                          ? 'Giao hàng tiêu chuẩn (3-5 ngày)'
                          : order.shippingMethod === 'express'
                          ? 'Giao hàng nhanh (1-2 ngày)'
                          : order.shippingMethod}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Order notifications - chỉ hiển thị cho đơn hàng đang xử lý/vận chuyển */}
          {mounted && ['PENDING', 'PROCESSING', 'CONFIRMED', 'SHIPPED'].includes(order.status) && (
            <div className="print:hidden">
              <OrderNotificationOpt orderNumber={order.orderNumber} />
            </div>
          )}
          
          {/* Order review prompt - chỉ hiển thị cho đơn hàng đã giao/hoàn thành */}
          {mounted && canReview && order.items && order.items.length > 0 && (
            <div className="print:hidden">
              <OrderReviewPrompt 
                orderNumber={order.orderNumber} 
                products={order.items.map(item => ({
                  id: item.id,
                  name: item.name,
                  slug: item.productId,
                  image: item.productData?.image?.url
                }))} 
              />
            </div>
          )}

          {/* Next steps - chỉ hiển thị khi trạng thái là đang xử lý/đã xác nhận */}
          {["PENDING", "PROCESSING", "CONFIRMED", "SHIPPED"].includes(order.status) && (
            <Card className="mb-8 border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 shadow-sm print:hidden">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Các bước tiếp theo</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                      <Package className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {order.status === "PENDING" ? "Đơn hàng đang chờ xử lý" : 
                         order.status === "PROCESSING" ? "Đơn hàng đang được xử lý" :
                         order.status === "CONFIRMED" ? "Đơn hàng đã được xác nhận" :
                         "Đơn hàng đang được giao"}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {order.status === "SHIPPED" 
                          ? "Đơn hàng của bạn đang trên đường giao đến." 
                          : "Chúng tôi sẽ xác nhận đơn hàng của bạn và tiến hành đóng gói."}
                      </p>
                    </div>
                  </div>

                  {order.status !== "SHIPPED" && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Giao hàng</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Đơn hàng sẽ được giao đến địa chỉ của bạn trong vòng 3-5 ngày làm việc.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Thanh toán</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {order.paymentMethod === "cod"
                          ? "Vui lòng chuẩn bị số tiền chính xác khi nhận hàng."
                          : order.paymentMethod === "bank-transfer"
                          ? "Vui lòng chuyển khoản trong vòng 24 giờ để đơn hàng không bị hủy."
                          : "Thanh toán của bạn đã được xử lý thành công."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="text-center print:hidden">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/product">
                <Button className="min-w-[180px]">Tiếp tục mua sắm</Button>
              </Link>
              
              <Link href="/profile/orders">
                <Button variant="outline" className="min-w-[180px]">Xem đơn hàng của tôi</Button>
              </Link>
            </div>
          </div>
          
          {/* Chỉ hiển thị khi in trang */}
          <div className="hidden print:block mt-8 text-center text-sm text-gray-500">
            <p>Đơn hàng này được xác nhận lúc {orderDate}</p>
            <p className="mt-2">{new Date().getFullYear()} - NextStore. Mọi quyền được bảo lưu.</p>
          </div>
        </div>
      </div>
    </div>
  );
}