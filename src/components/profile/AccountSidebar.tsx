"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}

interface AccountSidebarProps {
  menuItems: MenuItem[];
  user: {
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    avatarUrl?: string | null;
  };
}

export default function AccountSidebar({
  menuItems,
  user,
}: AccountSidebarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Update active state based on current path
  const items = menuItems.map((item) => ({
    ...item,
    active: pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));

  // User display name
  const displayName =
    user.firstName || user.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user.email.split("@")[0];

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="flex lg:hidden justify-between items-center mb-4 bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 rounded-full overflow-hidden bg-primary/10">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={displayName}
                fill
                className="object-cover"
                sizes="32px"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-primary font-semibold">
                {displayName[0].toUpperCase()}
              </div>
            )}
          </div>
          <span className="font-medium">{displayName}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Đóng menu" : "Mở menu"}
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar content */}
      <div
        className={cn(
          "bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 ease-in-out",
          {
            "max-h-0 lg:max-h-none": !isMenuOpen,
            "max-h-[1000px]": isMenuOpen,
          }
        )}
      >
        {/* User info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-primary/10">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={displayName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-primary font-semibold text-xl">
                  {displayName[0].toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <p className="font-medium text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-2">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                    item.active
                      ? "bg-primary text-white"
                      : item.danger
                      ? "text-red-500 hover:bg-red-50"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
