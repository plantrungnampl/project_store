"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { validateRequest } from "@/auth";
import bcrypt from "bcrypt";
/**
 * Get user addresses
 */
export async function getUserAddresses() {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return [];
    }

    const addresses = await prisma.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        isDefault: "desc",
      },
    });

    return addresses;
  } catch (error) {
    console.error("Error fetching user addresses:", error);
    return [];
  }
}

/**
 * Add new address
 */
export async function addUserAddress(data: any) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để thêm địa chỉ",
      };
    }

    // If this is the first address, set it as default
    const addressCount = await prisma.address.count({
      where: {
        userId: session.user.id,
      },
    });

    // If setting as default, unset other default addresses
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        firstName: data.firstName,
        lastName: data.lastName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault || addressCount === 0, // Set as default if it's the first address
        label: data.label || null,
      },
    });

    revalidatePath("/account/addresses");

    return {
      success: true,
      address,
    };
  } catch (error) {
    console.error("Error adding address:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi thêm địa chỉ",
    };
  }
}

/**
 * Update address
 */
export async function updateUserAddress(addressId: string, data: any) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật địa chỉ",
      };
    }

    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });

    if (!address) {
      return {
        success: false,
        error: "Địa chỉ không tồn tại hoặc không thuộc về bạn",
      };
    }

    // If setting as default, unset other default addresses
    if (data.isDefault && !address.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        phone: data.phone,
        isDefault: data.isDefault || address.isDefault, // Preserve default status if not changing
        label: data.label || null,
      },
    });

    revalidatePath("/account/addresses");

    return {
      success: true,
      address: updatedAddress,
    };
  } catch (error) {
    console.error("Error updating address:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi cập nhật địa chỉ",
    };
  }
}

/**
 * Delete address
 */
export async function deleteUserAddress(addressId: string) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để xóa địa chỉ",
      };
    }

    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });

    if (!address) {
      return {
        success: false,
        error: "Địa chỉ không tồn tại hoặc không thuộc về bạn",
      };
    }

    // Delete address
    await prisma.address.delete({
      where: {
        id: addressId,
      },
    });

    // If deleted address was default, set another address as default
    if (address.isDefault) {
      const anotherAddress = await prisma.address.findFirst({
        where: {
          userId: session.user.id,
        },
      });

      if (anotherAddress) {
        await prisma.address.update({
          where: {
            id: anotherAddress.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    revalidatePath("/account/addresses");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting address:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi xóa địa chỉ",
    };
  }
}

/**
 * Set address as default
 */
export async function setDefaultAddress(addressId: string) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật địa chỉ",
      };
    }

    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: session.user.id,
      },
    });

    if (!address) {
      return {
        success: false,
        error: "Địa chỉ không tồn tại hoặc không thuộc về bạn",
      };
    }

    // Update all addresses to non-default
    await prisma.address.updateMany({
      where: {
        userId: session.user.id,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set new default address
    await prisma.address.update({
      where: {
        id: addressId,
      },
      data: {
        isDefault: true,
      },
    });

    revalidatePath("/account/addresses");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error setting default address:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi cập nhật địa chỉ mặc định",
    };
  }
}

/**
 * Get user profile
 */
export async function getUserProfile() {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để xem thông tin tài khoản",
      };
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        preferences: true,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Không tìm thấy thông tin người dùng",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi lấy thông tin tài khoản",
    };
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(data: any) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật thông tin tài khoản",
      };
    }

    const user = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        avatarUrl: data.avatarUrl || undefined,
      },
    });

    revalidatePath("/account");

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("Error updating user profile:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi cập nhật thông tin tài khoản",
    };
  }
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để thay đổi mật khẩu",
      };
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user || !user.passwordHash) {
      return {
        success: false,
        error: "Tài khoản không hỗ trợ thay đổi mật khẩu",
      };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return {
        success: false,
        error: "Mật khẩu hiện tại không đúng",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi thay đổi mật khẩu",
    };
  }
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(preferences: any) {
  try {
    const session = await validateRequest();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Bạn cần đăng nhập để cập nhật tùy chọn",
      };
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        preferences,
      },
    });

    revalidatePath("/account/preferences");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return {
      success: false,
      error: "Đã có lỗi xảy ra khi cập nhật tùy chọn",
    };
  }
}
