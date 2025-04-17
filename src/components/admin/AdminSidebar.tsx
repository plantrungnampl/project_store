"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  BarChart4,
  Store,
  Ban,
  Image,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/coupons", label: "Coupons", icon: Ban },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart4 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/", label: "Back to Store", icon: Store },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="z-30 flex-shrink-0 hidden w-64 overflow-y-auto bg-white dark:bg-gray-800 md:block">
      <div className="py-4">
        <div className="px-6 py-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            NextStore <span className="text-primary">Admin</span>
          </h2>
        </div>

        <div className="mt-6">
          <nav className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                    {
                      "bg-primary text-primary-foreground": pathname === item.href,
                      "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700":
                        pathname !== item.href,
                    }
                  )}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="px-6 mt-12">
          <Link
            href="/api/auth/logout"
            className="flex items-center w-full px-4 py-2 text-sm font-medium rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign out
          </Link>
        </div>
      </div>
    </aside>
  );
}
