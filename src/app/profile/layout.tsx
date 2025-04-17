import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/actions/userActions";
import {
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  CreditCard,
  BellRing,
  LogOut,
} from "lucide-react";
import { validateRequest } from "@/auth";
import AccountSidebar from "@/components/profile/AccountSidebar";
import { Header } from "@/components/layout/Header";
import SessionProvider from "../sessionProvider";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Check if user is logged in
  const session = await validateRequest();
  if (!session.user) redirect("/login");
  // if (!session?.user) {
  //   redirect("/login?callbackUrl=/profile");
  // }

  // Get user profile
  const { success, user, error } = await getUserProfile();

  if (!success || !user) {
    // Handle error or redirect to login
    redirect("/login?callbackUrl=/profile");
  }

  // Menu items for the sidebar
  const menuItems = [
    {
      label: "Tài khoản của tôi",
      href: "/profile",
      icon: <User className="h-5 w-5" />,
      active: true, // Will be set dynamically based on current path
    },
    {
      label: "Đơn hàng của tôi",
      href: "/profile/orders",
      icon: <Package className="h-5 w-5" />,
    },
    {
      label: "Danh sách yêu thích",
      href: "/wishlist", // External to account folder
      icon: <Heart className="h-5 w-5" />,
    },
    // {
    //   label: "Địa chỉ của tôi",
    //   href: "/profile/addresses",
    //   icon: <MapPin className="h-5 w-5" />,
    // },
    // {
    //   label: "Phương thức thanh toán",
    //   href: "/profile/payment-methods",
    //   icon: <CreditCard className="h-5 w-5" />,
    // },
    // {
    //   label: "Thông báo",
    //   href: "/profile/notifications",
    //   icon: <BellRing className="h-5 w-5" />,
    // },
    // {
    //   label: "Tùy chọn tài khoản",
    //   href: "/profile/preferences",
    //   icon: <Settings className="h-5 w-5" />,
    // },
    // {
    //   label: "Đăng xuất",
    //   href: "/api/auth/signout",
    //   icon: <LogOut className="h-5 w-5" />,
    //   danger: true,
    // },
  ];

  return (
    <SessionProvider value={session}>
      <div className="bg-gray-50 min-h-screen pb-10">
        {/* <Header /> */}
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Quản lý tài khoản
          </h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-1/4 w-full">
              <AccountSidebar menuItems={menuItems} user={user} />
            </div>

            {/* Main content */}
            <div className="lg:w-3/4 w-full">{children}</div>
          </div>
        </div>
      </div>
    </SessionProvider>
  );
}
