"use client";

import { memo, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Package2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/app/sessionProvider";
import { logout } from "@/app/(auth)/actions";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/formatPrice";
import Image from "next/image";
import ThemeSwitcher from "@/components/ThemeSwitcher";

// Sử dụng DropdownMenu thay vì NavigationMenu
const CategoryNavItems = memo(({ categories }: { categories: any[] }) => (
  <div className="hidden md:flex items-center space-x-1">
    {categories.map((category) => (
      <DropdownMenu key={category.slug}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-1 rounded-md px-3 py-2"
          >
            {category.name}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="center"
          className="w-[500px] p-0"
          sideOffset={8}
        >
          <div className="grid grid-cols-2 gap-3 p-4">
            <div>
              <h3 className="font-medium text-sm mb-2 text-primary">
                Featured
              </h3>
              <ul className="space-y-2">
                {category.featured?.map((item: any) => (
                  <DropdownMenuItem key={item.href} asChild className="p-0">
                    <Link
                      href={item.href}
                      className="text-sm hover:text-primary transition-colors px-2 py-1.5 w-full"
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-2 text-primary">
                Categories
              </h3>
              <ul className="space-y-2">
                {category.subcategories?.map((item: any) => (
                  <DropdownMenuItem key={item.href} asChild className="p-0">
                    <Link
                      href={item.href}
                      className="text-sm hover:text-primary transition-colors px-2 py-1.5 w-full"
                    >
                      {item.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </ul>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    ))}
  </div>
));
CategoryNavItems.displayName = "CategoryNavItems";

// Simplified search input that only searches on submit or Enter key
const HeaderSearchInput = memo(
  ({ onSearch }: { onSearch: (query: string) => void }) => {
    const [searchValue, setSearchValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchValue.trim()) {
        onSearch(searchValue.trim());
      }
    };

    return (
      <form
        onSubmit={handleSubmit}
        className="hidden md:flex relative w-full max-w-sm"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-10 pr-4 h-9 rounded-full border-muted"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <Button
            type="submit"
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }
);
HeaderSearchInput.displayName = "HeaderSearchInput";

export function Header({ categories }: { categories: any[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSession();
  const router = useRouter();
  const { items, cartCount } = useCart();

  // Calculate subtotal from cart items
  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      return total + Number(item.price) * item.quantity;
    }, 0);
  }, [items]);

  // Optimized scroll handler with RAF
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    },
    [router]
  );

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/login");
  }, [router]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "border-b bg-background/95 backdrop-blur shadow-sm supports-[backdrop-filter]:bg-background/60"
          : "bg-background"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">nhấn để mở menu</span>
          </Button>

          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Store</span>
          </Link>

          {/* Phần đã thay đổi - sử dụng CategoryNavItems component */}
          <CategoryNavItems categories={categories} />

          <HeaderSearchInput onSearch={handleSearch} />

          <div className="flex items-center space-x-1">
            {/* Theme switcher */}
            <ThemeSwitcher className="mr-1" />

            {/* User account */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative"
                  aria-label="User Account"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              {user ? (
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-2 p-2">
                    <p className="text-sm font-medium">Account</p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="w-full">
                      {/* Profile */}
                      Hồ sơ
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={handleLogout}>
                    {/* Logout */}
                    <span className="text-red-500">Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              ) : (
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full">
                      {/* Sign In */}
                      Đăng nhập
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup" className="w-full">
                      {/* Sign Up */}
                      Đăng ký
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full relative"
                  aria-label="Shopping Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex flex-col space-y-4 p-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Giỏ hàng của bạn</h3>
                    <span className="text-sm text-muted-foreground">
                      {cartCount} {cartCount === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {items.length > 0 ? (
                    <>
                      <ul className="min-w-[320px] p-2 space-y-3">
                        {items.length === 0 ? (
                          <li className="py-6 px-4 text-center">
                            <Package2 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Giỏ hàng của bạn đang trống
                            </p>
                          </li>
                        ) : (
                          items.slice(0, 3).map((item) => (
                            <li
                              key={item.id}
                              className="flex gap-3 border-b pb-3 last:border-b-0 last:pb-0"
                            >
                              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                {item.image ? (
                                  <Image
                                    src={item.image.url}
                                    alt={item.image.alt || item.name}
                                    width={64}
                                    height={64}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-secondary/10">
                                    <Package2 className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <Link
                                  href={`/product/${item.slug}`}
                                  className="text-sm font-medium hover:text-primary"
                                >
                                  {item.name}
                                </Link>
                                <div className="flex justify-between mt-1">
                                  <span className="text-xs text-muted-foreground">
                                    Số lượng: {item.quantity}
                                  </span>
                                  <span className="text-sm font-medium">
                                    {formatPrice(item.subtotal)}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>

                      {items.length > 3 && (
                        <p className="text-sm text-muted-foreground text-center">
                          và {items.length - 3} nhiều sản phẩm khác
                        </p>
                      )}

                      <div className="border-t pt-4">
                        <div className="flex justify-between text-sm">
                          <p>Tổng cộng ({cartCount})</p>
                          <p className="font-medium">{formatPrice(subtotal)}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Phí vận chuyển và thuế sẽ được tính tại trang thanh
                          toán
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Button asChild className="w-full">
                          <Link href="/cart">Giỏ hàng ({cartCount})</Link>
                        </Button>
                        <Button asChild variant="secondary" className="w-full">
                          <Link href="/checkout">Thanh toán</Link>
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">
                        Giỏ hàng của bạn trống
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
                      </p>
                      <Button asChild variant="secondary">
                        <Link href="/product">Bắt đầu mua sắm</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t fixed inset-0 top-16 z-50 bg-background overflow-y-auto">
          <div className="container py-6">
            {/* Mobile search form */}
            <form onSubmit={handleMobileSearch} className="mb-6 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 w-full rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <nav className="space-y-6">
              {categories.map((category) => (
                <div key={category.slug} className="space-y-3">
                  <h3 className="font-medium text-sm text-primary">
                    {category.name}
                  </h3>

                  {/* Featured items */}
                  {category.featured && category.featured.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-xs uppercase text-muted-foreground mb-2">
                        Nổi bật
                      </h4>
                      <ul className="space-y-2">
                        {category.featured.map((item: any) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className="text-sm hover:text-primary"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Subcategories */}
                  {category.subcategories &&
                    category.subcategories.length > 0 && (
                      <div>
                        <h4 className="text-xs uppercase text-muted-foreground mb-2">
                          Danh mục
                        </h4>
                        <ul className="space-y-2">
                          {category.subcategories.map((item: any) => (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                className="text-sm hover:text-primary"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                </div>
              ))}

              {/* User account links on mobile */}
              <div className="pt-4 border-t">
                <h3 className="font-medium text-sm text-primary mb-3">
                  {user ? "Tài khoản của bạn" : "Tài khoản"}
                </h3>
                <ul className="space-y-2">
                  {user ? (
                    <>
                      <li>
                        <Link
                          href="/profile"
                          className="text-sm hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Hồ sơ
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/orders"
                          className="text-sm hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Đơn hàng
                        </Link>
                      </li>
                      <li>
                        <button
                          className="text-sm text-red-500 hover:text-red-700"
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                        >
                          Đăng xuất
                        </button>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          href="/login"
                          className="text-sm hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Đăng nhập
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/signup"
                          className="text-sm hover:text-primary"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Đăng ký
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
