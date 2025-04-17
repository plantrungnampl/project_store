"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
// import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { getCart } from "@/app/actions/cartActions";
import { getCurrentUser, validateRequest } from "@/auth";

/**
 * Create a new order
 */
// export async function createOrder(orderData: any) {
//   try {
//     const session = await validateRequest();
//     const userId = session?.user?.id;

//     // Lấy giỏ hàng hiện tại
//     const cart = await getCart();

//     if (!cart?.items?.length) {
//       return {
//         success: false,
//         error: "Giỏ hàng trống",
//       };
//     }

//     // Tạo mã đơn hàng
//     const orderNumber = generateOrderNumber();

//     // Tạo/lấy địa chỉ giao hàng
//     let shippingAddressId: string | null = null;

//     const shippingAddress = await prisma.address.create({
//       data: {
//         firstName: orderData.shippingAddress.firstName,
//         lastName: orderData.shippingAddress.lastName,
//         addressLine1: orderData.shippingAddress.addressLine1,
//         addressLine2: orderData.shippingAddress.addressLine2 || null,
//         city: orderData.shippingAddress.city,
//         state: orderData.shippingAddress.state,
//         postalCode: orderData.shippingAddress.postalCode,
//         country: orderData.shippingAddress.country,
//         phone: orderData.shippingAddress.phone,
//         // Liên kết với user nếu đã đăng nhập
//         userId: userId || undefined,
//       },
//     });

//     shippingAddressId = shippingAddress.id;

//     // Tạo/lấy địa chỉ thanh toán
//     let billingAddressId: string | null = null;

//     if (orderData.billingAddress) {
//       const billingAddress = await prisma.address.create({
//         data: {
//           firstName: orderData.billingAddress.firstName,
//           lastName: orderData.billingAddress.lastName,
//           addressLine1: orderData.billingAddress.addressLine1,
//           addressLine2: orderData.billingAddress.addressLine2 || null,
//           city: orderData.billingAddress.city,
//           state: orderData.billingAddress.state,
//           postalCode: orderData.billingAddress.postalCode,
//           country: orderData.billingAddress.country,
//           phone: orderData.billingAddress.phone || null,
//           // Liên kết với user nếu đã đăng nhập
//           userId: userId || undefined,
//         },
//       });

//       billingAddressId = billingAddress.id;
//     }

//     // Tạo đơn hàng mới
//     const order = await prisma.order.create({
//       data: {
//         orderNumber,
//         userId: userId || null,
//         email: orderData.email,
//         status: "PENDING",
//         currencyCode: "VND",
//         subtotal: cart.subtotal,
//         discountTotal: cart.discountTotal,
//         taxTotal: cart.taxTotal,
//         shippingTotal: cart.shippingTotal,
//         grandTotal: cart.grandTotal,
//         shippingAddressId,
//         billingAddressId: billingAddressId || shippingAddressId,
//         shippingMethod: "standard",
//         paymentMethod: orderData.paymentMethod,
//         customerNote: orderData.customerNote || null,
//         ipAddress: null, // Có thể lấy từ headers nếu cần
//         items: {
//           create: cart.items.map((item) => ({
//             productId: item.productId,
//             variantId: item.variantId || null,
//             name: item.name,
//             sku: item.variant?.sku || "N/A",
//             quantity: item.quantity,
//             unitPrice: item.price,
//             subtotal: item.price * item.quantity,
//             total: item.price * item.quantity,
//             // Lưu snapshot dữ liệu sản phẩm
//             productData: {
//               name: item.name,
//               price: item.price,
//               image: item.image,
//             },
//           })),
//         },
//         // Tạo status history
//         statusUpdates: {
//           create: {
//             status: "PENDING",
//             comment: "Đơn hàng mới được tạo",
//           },
//         },
//       },
//     });

//     // Xóa giỏ hàng sau khi tạo đơn hàng thành công
//     const cookieStore = cookies();

//     if (userId) {
//       // Xóa cart của user đã đăng nhập
//       await prisma.cart.delete({
//         where: { userId },
//       });
//     } else {
//       // Xóa guest cart
//       const sessionId = cookieStore.get("cartSessionId")?.value;

//       if (sessionId) {
//         await prisma.cart.delete({
//           where: { sessionId },
//         });

//         // Xóa cookie
//         cookieStore.delete("cartSessionId");
//       }
//     }

//     revalidatePath("/cart");
//     revalidatePath("/orders");

//     return {
//       success: true,
//       orderId: order.id,
//       orderNumber: order.orderNumber,
//     };
//   } catch (error) {
//     console.error("Error creating order:", error);
//     return {
//       success: false,
//       error: "Đã có lỗi xảy ra khi tạo đơn hàng",
//     };
//   }
// }
/**
/**
 * Tạo đơn hàng mới
 */
export async function createOrder(orderData: any) {
  try {
    console.log(
      "Creating order with data:",
      JSON.stringify(orderData, null, 2)
    );

    // Kiểm tra dữ liệu đầu vào
    if (!orderData) {
      return {
        success: false,
        error: "Dữ liệu đơn hàng không hợp lệ",
      };
    }

    // Thêm kiểm tra và gán mặc định cho items
    const orderItems = orderData.items || [];

    // Kiểm tra dữ liệu sản phẩm
    if (orderItems.length === 0) {
      return {
        success: false,
        error: "Không có sản phẩm nào trong đơn hàng",
      };
    }

    // Lấy thông tin người dùng hiện tại (nếu đã đăng nhập)
    const currentUser = await getCurrentUser();

    // Tạo số đơn hàng mới
    const orderNumber = generateOrderNumber();

    // Kiểm tra và lọc ra các sản phẩm có ID hợp lệ
    const validItems = orderItems.filter((item: any) => item.productId);

    if (validItems.length === 0) {
      return {
        success: false,
        error: "Không có sản phẩm hợp lệ nào trong đơn hàng",
      };
    }

    // Tạo đơn hàng trong database
    const order = await prisma.order.create({
      data: {
        // Thông tin cơ bản
        orderNumber,
        email: orderData.email,
        status: "PENDING",
        currencyCode: "VND",
        shippingMethod: "standard",

        // Thông tin tài chính
        subtotal: orderData.subtotal || 0,
        discountTotal: orderData.discountTotal || 0,
        taxTotal: orderData.taxTotal || 0,
        shippingTotal: orderData.shippingTotal || 0,
        grandTotal: orderData.grandTotal || 0,
        paymentMethod: orderData.paymentMethod,
        customerNote: orderData.customerNote || null,

        // Liên kết với người dùng nếu đã đăng nhập
        user: currentUser?.id
          ? {
              connect: {
                id: currentUser.id,
              },
            }
          : undefined,

        // Tạo bản ghi địa chỉ giao hàng
        shippingAddress: {
          create: {
            firstName: orderData.shippingAddress.firstName,
            lastName: orderData.shippingAddress.lastName,
            addressLine1: orderData.shippingAddress.addressLine1,
            addressLine2: orderData.shippingAddress.addressLine2 || null,
            city: orderData.shippingAddress.city,
            state: orderData.shippingAddress.state,
            postalCode: orderData.shippingAddress.postalCode,
            country: orderData.shippingAddress.country,
            phone: orderData.shippingAddress.phone || null,
            // Liên kết user với address nếu người dùng đã đăng nhập
            user: currentUser?.id
              ? {
                  connect: {
                    id: currentUser.id,
                  },
                }
              : undefined,
          },
        },

        // Tạo bản ghi địa chỉ thanh toán
        billingAddress: {
          create: {
            firstName: orderData.billingAddress.firstName,
            lastName: orderData.billingAddress.lastName,
            addressLine1: orderData.billingAddress.addressLine1,
            addressLine2: orderData.billingAddress.addressLine2 || null,
            city: orderData.billingAddress.city,
            state: orderData.billingAddress.state,
            postalCode: orderData.billingAddress.postalCode,
            country: orderData.billingAddress.country,
            phone: orderData.billingAddress.phone || null,
            // Liên kết user với address nếu người dùng đã đăng nhập
            user: currentUser?.id
              ? {
                  connect: {
                    id: currentUser.id,
                  },
                }
              : undefined,
          },
        },

        // Tạo các bản ghi sản phẩm đã đặt (chỉ những sản phẩm có ID hợp lệ)
        items: {
          create: validItems.map((item: any) => ({
            // Liên kết với sản phẩm
            product: {
              connect: {
                id: item.productId,
              },
            },
            // Liên kết với variant nếu có
            variant: item.variantId
              ? {
                  connect: {
                    id: item.variantId,
                  },
                }
              : undefined,
            // Thông tin sản phẩm
            quantity: item.quantity || 1,
            name: item.name || "Sản phẩm",
            sku: item.sku || "SKU" + Date.now().toString().substring(0, 5),
            unitPrice: item.price || 0,
            subtotal: (item.price || 0) * (item.quantity || 1),
            discount: 0,
            tax: 0,
            total: (item.price || 0) * (item.quantity || 1),
            // Lưu snapshot của sản phẩm để hiển thị sau này
            productData: {
              name: item.name || "Sản phẩm",
              price: item.price || 0,
              image: item.image || null,
            },
          })),
        },

        // Tạo bản ghi trạng thái đơn hàng đầu tiên
        statusUpdates: {
          create: {
            status: "PENDING",
            comment: "Đơn hàng được tạo",
            createdBy: "system",
          },
        },
      },
    });

    // Xóa giỏ hàng sau khi đặt hàng thành công
    if (currentUser?.id) {
      // Xóa cart của user đã đăng nhập
      try {
        await prisma.cart.deleteMany({
          where: { userId: currentUser.id },
        });
      } catch (error) {
        console.log("Không thể xóa giỏ hàng:", error);
      }
    } else {
      // Xóa guest cart bằng sessionId
      const sessionId = cookies().get("cartSessionId")?.value;
      if (sessionId) {
        try {
          await prisma.cart.deleteMany({
            where: { sessionId },
          });
          // Xóa cookie
          cookies().delete("cartSessionId");
        } catch (error) {
          console.log("Không thể xóa giỏ hàng guest:", error);
        }
      }
    }

    // Refresh dữ liệu trên trang đơn hàng
    revalidatePath("/cart");
    revalidatePath("/orders");
    revalidatePath(`/order-confirmation/${orderNumber}`);

    // Trả về kết quả thành công
    return {
      success: true,
      orderNumber,
    };
  } catch (error: any) {
    console.error("Failed to create order:", error);
    // Trả về lỗi chi tiết hơn để dễ debug
    return {
      success: false,
      error: `Không thể tạo đơn hàng: ${
        error.message || "Vui lòng thử lại sau"
      }`,
    };
  }
}
/**
 * Get order details
 */
// export async function getOrderByNumber(orderNumber: string) {
//   try {
//     const session = await validateRequest();
//     const userId = session?.user?.id;

//     const order = await prisma.order.findFirst({
//       where: {
//         orderNumber,
//         userId: userId || undefined,
//       },
//       include: {
//         items: true,
//         shippingAddress: true,
//         billingAddress: true,
//         statusUpdates: {
//           orderBy: {
//             createdAt: "desc",
//           },
//         },
//       },
//     });

//     if (!order) {
//       return {
//         success: false,
//         error: "Không tìm thấy đơn hàng",
//       };
//     }

//     return {
//       success: true,
//       order,
//     };
//   } catch (error) {
//     console.error("Error getting order:", error);
//     return {
//       success: false,
//       error: "Đã có lỗi xảy ra khi lấy thông tin đơn hàng",
//     };
//   }
// }
export async function getOrderByNumber(orderNumber: string) {
  try {
    // Lấy thông tin người dùng hiện tại
    const currentUser = await getCurrentUser();

    // Tìm đơn hàng theo số đơn hàng
    const order = await prisma.order.findUnique({
      where: {
        orderNumber,
      },
      include: {
        items: true,
        shippingAddress: true,
        billingAddress: true,
        statusUpdates: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    // Nếu không tìm thấy đơn hàng
    if (!order) {
      return {
        success: false,
        error: "Không tìm thấy đơn hàng",
      };
    }

    // Nếu người dùng chưa đăng nhập và đơn hàng có userId
    // Hoặc người dùng đã đăng nhập nhưng không khớp với userId của đơn hàng
    if (
      (order.userId && !currentUser) ||
      (currentUser && order.userId && order.userId !== currentUser.id)
    ) {
      // Kiểm tra cookie để xác thực quyền truy cập đơn hàng
      const orderAccessToken = cookies().get(`order_${orderNumber}`)?.value;

      // Nếu không có cookie hoặc token không khớp
      if (!orderAccessToken) {
        return {
          success: false,
          error: "Bạn không có quyền truy cập đơn hàng này",
        };
      }
    }

    // Trả về thông tin đơn hàng
    return {
      success: true,
      order,
    };
  } catch (error) {
    console.error("Failed to get order:", error);
    return {
      success: false,
      error: "Không thể lấy thông tin đơn hàng",
    };
  }
}

/**
 * Get user orders
 */
export async function getUserOrders() {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để xem đơn hàng",
      };
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          take: 1, // Chỉ lấy 1 item để hiển thị hình ảnh
        },
        _count: {
          select: {
            items: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      orders,
    };
  } catch (error) {
    console.error("Error getting user orders:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi lấy danh sách đơn hàng",
    };
  }
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: string) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để hủy đơn hàng",
      };
    }

    // Kiểm tra đơn hàng tồn tại và thuộc về user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
      },
    });

    if (!order) {
      return {
        success: false,
        error:
          "Không tìm thấy đơn hàng hoặc bạn không có quyền hủy đơn hàng này",
      };
    }

    // Kiểm tra trạng thái đơn hàng có thể hủy không
    const cancelableStatuses = ["PENDING", "PROCESSING"];
    if (!cancelableStatuses.includes(order.status)) {
      return {
        success: false,
        error: "Đơn hàng không thể hủy ở trạng thái hiện tại",
      };
    }

    // Cập nhật trạng thái đơn hàng
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "CANCELED",
        canceledAt: new Date(),
        statusUpdates: {
          create: {
            status: "CANCELED",
            comment: "Đơn hàng đã bị hủy bởi khách hàng",
          },
        },
      },
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${order.orderNumber}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error canceling order:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi hủy đơn hàng",
    };
  }
}

/**
 * Helper: Generate order number
 */
function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `ORD-${year}${month}${day}-${random}`;
}
