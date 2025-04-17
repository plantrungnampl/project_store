import { Metadata } from "next";
import { getOrderByNumber } from "@/app/actions/orderActions";
import OrderConfirmationPage from "@/components/checkout/OrderConfirmationPage";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { Order } from "@/types/index";

type Props = {
  params: { orderNumber: string };
};

// Metadata động dựa trên thông tin đơn hàng
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = params;
  
  return {
    title: `Đơn hàng #${orderNumber} | Xác nhận đơn hàng`,
    description: "Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận.",
  };
}

export default async function ConfirmOrderPage({ params }: Props) {
  const { orderNumber } = params;
  const { success, order, error } = await getOrderByNumber(orderNumber);

  if (!success || !order) {
    console.error("Không thể tìm thấy đơn hàng:", error);
    notFound();
  }

  // Cập nhật trạng thái đơn hàng thành CONFIRMED nếu đang ở trạng thái PENDING
  if (order.status === "PENDING") {
    try {
      const updatedOrder = await prisma.order.update({
        where: {
          id: order.id
        },
        data: {
          status: "CONFIRMED",
          statusUpdates: {
            create: {
              status: "CONFIRMED",
              comment: "Đơn hàng đã được xác nhận thành công"
            }
          }
        },
        include: {
          items: true,
          shippingAddress: true,
          billingAddress: true,
        }
      });
      
      // Cập nhật trạng thái và dữ liệu đơn hàng trong object hiện tại để hiển thị đúng
      Object.assign(order, updatedOrder);
    } catch (error) {
      console.error("Không thể cập nhật trạng thái đơn hàng:", error);
      // Vẫn tiếp tục hiển thị trang với trạng thái hiện tại
    }
  }

  // Xử lý email xác nhận
  const handleOrderConfirmationEmail = async () => {
    // Kiểm tra xem đã gửi email xác nhận chưa
    const cookieStore = cookies();
    const orderConfirmationSent = cookieStore.get(`order_confirmation_${orderNumber}`)?.value;

    // Nếu chưa gửi email xác nhận, thì gửi
    if (!orderConfirmationSent) {
      try {
        // Logic gửi email ở đây - trong môi trường thực tế thì gọi API email service
        console.log(`Gửi email xác nhận đơn hàng ${orderNumber} đến ${order.email || 'khách hàng'}`);
        
        // Đặt cookie để đánh dấu đã gửi email xác nhận
        cookieStore.set({
          name: `order_confirmation_${orderNumber}`,
          value: 'sent',
          httpOnly: true,
          path: '/',
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 ngày
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
        
        return true;
      } catch (emailError) {
        console.error("Không thể gửi email xác nhận:", emailError);
        return false;
      }
    }
    
    return true; // Đã gửi email trước đó
  };

  // Gửi email xác nhận
  await handleOrderConfirmationEmail();

  return <OrderConfirmationPage order={order} />;
}