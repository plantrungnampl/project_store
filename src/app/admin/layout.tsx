import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Header from "@/components/admin/Header";
import { UserRole } from "@prisma/client";
import { validateRequest } from "@/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await validateRequest();

  // if (!session) {
  //   redirect("/login?callbackUrl=/admin");
  // }

  // Check if user has admin or staff role
  // if (session.user?.role !== UserRole.ADMIN && session.user?.role !== UserRole.STAFF) {
  //   redirect("/"); // Redirect non-admin users to homepage
  // }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header />

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
