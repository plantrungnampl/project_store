import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserProfile } from "@/app/actions/userActions";
import { getUserOrders } from "@/app/actions/orderActions";
// import PasswordForm from "@/components/account/PasswordForm";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordForm from "@/components/profile/PasswordForm";
import RecentOrders from "@/components/profile/RecentOrders";

export const metadata: Metadata = {
  title: "Tài khoản của tôi | Cửa hàng của bạn",
  description: "Quản lý thông tin tài khoản cá nhân",
};

export default async function AccountPage() {
  // Get user profile
  const { user } = await getUserProfile();

  // Get recent orders
  const { orders } = await getUserOrders();
  const recentOrders = orders?.slice(0, 3) || [];

  return (
    <div className="space-y-8">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Mật khẩu</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm initialData={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Thay đổi mật khẩu</CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để bảo vệ tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent orders */}
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
          <CardDescription>Xem các đơn hàng gần đây của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentOrders orders={recentOrders} />
        </CardContent>
      </Card>

      {/* Account stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{orders?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Tổng số đơn hàng</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Thành viên từ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                  })
                : "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ngày tham gia</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {user?.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Tài khoản email</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
