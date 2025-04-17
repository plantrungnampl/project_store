"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import { normalizePrice, handleApiError } from "@/lib/utils";

/**
 * Helper function để lấy hoặc tạo giỏ hàng
 * Xử lý cả người dùng đã đăng nhập và khách
 */
async function getOrCreateCart(userId?: string | null) {
  try {
    // Xử lý người dùng đã đăng nhập
    if (userId) {
      let cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    select: {
                      url: true,
                      altText: true,
                    },
                    take: 1,
                  },
                },
              },
              variant: true,
            },
          },
        },
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { 
            userId,
            subtotal: 0,
            shippingTotal: 0,
            taxTotal: 0,
            grandTotal: 0,
          },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    images: {
                      select: {
                        url: true,
                        altText: true,
                      },
                      take: 1,
                    },
                  },
                },
                variant: true,
              },
            },
          },
        });
      }

      return cart;
    }

    // Xử lý khách (chưa đăng nhập)
    const cookieStore = cookies();
    let sessionId = cookieStore.get("cartSessionId")?.value;

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      cookieStore.set("cartSessionId", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 ngày
        path: "/",
      });
    }

    let cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  select: {
                    url: true,
                    altText: true,
                  },
                  take: 1,
                },
              },
            },
            variant: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { 
          sessionId,
          subtotal: 0,
          shippingTotal: 0,
          taxTotal: 0,
          grandTotal: 0,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    select: {
                      url: true,
                      altText: true,
                    },
                    take: 1,
                  },
                },
              },
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  } catch (error) {
    console.error("Error in getOrCreateCart:", error);
    throw error;
  }
}

/**
 * Helper function để cập nhật tổng tiền giỏ hàng
 * Tính toán lại giá tiền, phí vận chuyển, thuế, và tổng cộng
 */
async function updateCartTotals(cartId: string) {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId },
      include: {
        product: true,
        variant: true,
      },
    });

    const subtotal = cartItems.reduce((total, item) => {
      const price = normalizePrice(item.variant?.price || item.product.price);
      return total + price * item.quantity;
    }, 0);

    // Tính phí vận chuyển với logic nghiệp vụ
    // Miễn phí vận chuyển cho đơn hàng trên 500k VND, nếu không thì 30k VND
    const shippingTotal = subtotal > 500000 ? 0 : 30000; 

    // Thuế VAT 8% nếu áp dụng
    const taxTotal = subtotal * 0.08; 
    
    // Tổng cộng = tiền hàng + phí vận chuyển + thuế
    const grandTotal = subtotal + shippingTotal + taxTotal;

    await prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal,
        shippingTotal,
        taxTotal,
        grandTotal,
        updatedAt: new Date(), // Cập nhật thời gian thay đổi
      },
    });
    
    return {
      subtotal,
      shippingTotal,
      taxTotal,
      grandTotal
    };
  } catch (error) {
    console.error("Error in updateCartTotals:", error);
    throw error;
  }
}

/**
 * Thêm sản phẩm vào giỏ hàng
 * Xử lý cả sản phẩm thông thường và biến thể sản phẩm
 */
export async function addToCart(
  productId: string,
  quantity: number = 1,
  variantId?: string
) {
  try {
    // Validate input
    if (!productId) return { success: false, error: "Product ID is required" };
    if (quantity <= 0) return { success: false, error: "Quantity must be greater than 0" };
    
    // Lấy hoặc tạo giỏ hàng
    const { user } = await validateRequest();
    const cart = await getOrCreateCart(user?.id);

    // Kiểm tra sản phẩm và số lượng tồn kho
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        isActive: true, // Chỉ cho phép sản phẩm đang hoạt động
      },
      select: {
        id: true,
        name: true,
        price: true,
        stockQuantity: true,
        images: {
          select: {
            url: true,
            altText: true,
          },
          take: 1,
        },
        variants: variantId
          ? {
              where: { id: variantId },
              select: {
                id: true,
                name: true,
                price: true,
                stockQuantity: true,
              },
            }
          : undefined,
      },
    });

    if (!product) {
      return { success: false, error: "Sản phẩm không tồn tại hoặc không còn bán" };
    }

    // Xử lý biến thể sản phẩm nếu có
    const variant = variantId && product.variants?.length ? product.variants[0] : null;
    
    if (variantId && !variant) {
      return { success: false, error: "Biến thể sản phẩm không tồn tại" };
    }

    // Kiểm tra số lượng tồn kho
    const stockQuantity = variant ? variant.stockQuantity : product.stockQuantity;
    
    if (stockQuantity < quantity) {
      return {
        success: false,
        error: `Chỉ còn ${stockQuantity} sản phẩm trong kho`,
      };
    }

    // Kiểm tra nếu sản phẩm/biến thể đã có trong giỏ hàng
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: product.id,
        variantId: variant?.id || null,
      },
    });

    let cartItem;
    
    if (existingItem) {
      // Cập nhật số lượng nếu sản phẩm đã có trong giỏ hàng
      const newQuantity = existingItem.quantity + quantity;
      
      // Kiểm tra lại số lượng tồn kho
      if (newQuantity > stockQuantity) {
        return {
          success: false,
          error: `Không thể thêm ${quantity} sản phẩm. Chỉ còn ${stockQuantity - existingItem.quantity} sản phẩm có thể thêm`,
        };
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          price: variant ? variant.price : product.price,
        },
        include: {
          product: true,
          variant: true,
        },
      });
    } else {
      // Tạo mới nếu sản phẩm chưa có trong giỏ hàng
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant?.id || null,
          quantity,
          price: variant ? variant.price : product.price,
        },
        include: {
          product: true,
          variant: true,
        },
      });
    }

    // Cập nhật tổng tiền giỏ hàng
    const updatedTotals = await updateCartTotals(cart.id);
    revalidatePath("/cart");

    return {
      success: true,
      message: "Sản phẩm đã được thêm vào giỏ hàng",
      data: {
        cartItem,
        cart: {
          id: cart.id,
          itemCount: cart.items.length + (existingItem ? 0 : 1),
          ...updatedTotals
        },
      },
    };
  } catch (error) {
    console.error("Error in addToCart:", error);
    return handleApiError(error, "Không thể thêm sản phẩm vào giỏ hàng");
  }
}

/**
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
export async function updateCartItem(itemId: string, quantity: number) {
  try {
    // Validate
    if (!itemId) return { success: false, error: "Item ID is required" };
    if (quantity < 0) return { success: false, error: "Quantity cannot be negative" };

    // Nếu số lượng là 0, xóa sản phẩm
    if (quantity === 0) {
      return removeFromCart(itemId);
    }

    // Tìm item cần cập nhật
    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        variant: true,
        cart: true
      },
    });

    if (!existingItem) {
      return { success: false, error: "Item not found in cart" };
    }

    // Kiểm tra số lượng tồn kho
    const stockQuantity = existingItem.variant 
      ? existingItem.variant.stockQuantity 
      : existingItem.product.stockQuantity;

    if (quantity > stockQuantity) {
      return {
        success: false,
        error: `Chỉ còn ${stockQuantity} sản phẩm trong kho`,
      };
    }

    // Cập nhật số lượng
    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        product: true,
        variant: true,
      },
    });

    // Cập nhật tổng tiền giỏ hàng
    const updatedTotals = await updateCartTotals(existingItem.cart.id);
    revalidatePath("/cart");

    return {
      success: true,
      message: "Số lượng đã được cập nhật",
      data: {
        cartItem: updatedItem,
        cart: {
          id: existingItem.cart.id,
          ...updatedTotals
        },
      },
    };
  } catch (error) {
    console.error("Error in updateCartItem:", error);
    return handleApiError(error, "Không thể cập nhật số lượng");
  }
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export async function removeFromCart(itemId: string) {
  try {
    // Validate
    if (!itemId) return { success: false, error: "Item ID is required" };

    // Tìm item để lấy thông tin cart
    const existingItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      select: {
        cartId: true,
      },
    });

    if (!existingItem) {
      return { success: false, error: "Item not found in cart" };
    }

    // Xóa item
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    // Cập nhật tổng tiền giỏ hàng
    const updatedTotals = await updateCartTotals(existingItem.cartId);
    revalidatePath("/cart");

    return {
      success: true,
      message: "Sản phẩm đã được xóa khỏi giỏ hàng",
      data: {
        cartId: existingItem.cartId,
        ...updatedTotals
      },
    };
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    return handleApiError(error, "Không thể xóa sản phẩm khỏi giỏ hàng");
  }
}

/**
 * Lấy thông tin giỏ hàng
 */
export async function getCart() {
  try {
    const { user } = await validateRequest();
    const cart = await getOrCreateCart(user?.id);

    // Format cart items với thông tin bổ sung
    const formattedItems = cart.items.map((item) => {
      // Lấy hình ảnh của sản phẩm
      const productImage = item.product.images && item.product.images.length > 0
        ? {
            url: item.product.images[0].url,
            alt: item.product.images[0].altText || item.product.name,
          }
        : null;

      // Lấy hình ảnh của biến thể nếu có
      const variantImage = item.variant?.images && item.variant.images.length > 0
        ? {
            url: item.variant.images[0].url,
            alt: item.variant.images[0].altText || item.variant.name || item.product.name,
          }
        : null;

      // Ưu tiên hiển thị thông tin từ variant nếu có
      return {
        id: item.id,
        quantity: item.quantity,
        price: normalizePrice(item.price),
        productId: item.product.id,
        sku: item.variant?.sku || item.product.sku,
        name: item.variant?.name ? `${item.product.name} - ${item.variant.name}` : item.product.name,
        slug: item.product.slug,
        image: variantImage || productImage,
        variant: item.variant
          ? {
              id: item.variant.id,
              name: item.variant.name,
              sku: item.variant.sku,
              price: normalizePrice(item.variant.price),
            }
          : null,
        subtotal: normalizePrice(item.price) * item.quantity,
      };
    });

    return {
      success: true,
      data: {
        id: cart.id,
        items: formattedItems,
        itemCount: formattedItems.length,
        subtotal: normalizePrice(cart.subtotal),
        shippingTotal: normalizePrice(cart.shippingTotal),
        taxTotal: normalizePrice(cart.taxTotal),
        grandTotal: normalizePrice(cart.grandTotal),
        isEmpty: formattedItems.length === 0,
      },
    };
  } catch (error) {
    console.error("Error in getCart:", error);
    return handleApiError(error, "Không thể lấy thông tin giỏ hàng");
  }
}

/**
 * Xóa toàn bộ giỏ hàng
 */
export async function clearCart() {
  try {
    const { user } = await validateRequest();
    const cart = await getOrCreateCart(user?.id);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotal: 0,
        shippingTotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/cart");

    return {
      success: true,
      message: "Giỏ hàng đã được xóa",
      data: {
        id: cart.id,
        itemCount: 0,
        subtotal: 0,
        shippingTotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        isEmpty: true,
      },
    };
  } catch (error) {
    console.error("Error in clearCart:", error);
    return handleApiError(error, "Không thể xóa giỏ hàng");
  }
}

/**
 * Hàm gộp để cập nhật số lượng trong giỏ hàng
 * @deprecated Sử dụng updateCartItem thay thế
 */
export async function updateCartQuantity(cartItemId: string, quantity: number) {
  return updateCartItem(cartItemId, quantity);
}
