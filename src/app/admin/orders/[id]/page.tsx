import { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderDetails from "@/components/admin/orders/OrderDetails";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Order Details | Admin | NextStore",
  description: "View and manage order details",
};

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
        },
      },
      shippingAddress: true,
      billingAddress: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              images: {
                where: {
                  isThumbnail: true,
                },
                take: 1,
              },
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      transactions: {
        orderBy: {
          createdAt: "desc",
        },
      },
      statusUpdates: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return <OrderDetails order={order} />;
}
