"use client";

import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { useSession } from "@/app/sessionProvider";
import { logout } from "@/app/(auth)/actions";

const categories = [
  {
    name: "Clothing",
    slug: "clothing",
    featured: [
      { name: "New Arrivals", href: "/category/clothing/new" },
      { name: "Summer Collection", href: "/category/clothing/summer" },
    ],
    subcategories: [
      { name: "Men", href: "/category/clothing/men" },
      { name: "Women", href: "/category/clothing/women" },
      { name: "Kids", href: "/category/clothing/kids" },
      { name: "Accessories", href: "/category/clothing/accessories" },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    featured: [
      { name: "Latest Gadgets", href: "/category/electronics/latest" },
      { name: "Smart Home", href: "/category/electronics/smart-home" },
    ],
    subcategories: [
      { name: "Phones", href: "/category/electronics/phones" },
      { name: "Laptops", href: "/category/electronics/laptops" },
      { name: "Audio", href: "/category/electronics/audio" },
      { name: "Wearables", href: "/category/electronics/wearables" },
    ],
  },
  {
    name: "Home & Garden",
    slug: "home",
    featured: [
      { name: "Interior Design", href: "/category/home/interior" },
      { name: "Outdoor Living", href: "/category/home/outdoor" },
    ],
    subcategories: [
      { name: "Furniture", href: "/category/home/furniture" },
      { name: "Kitchen", href: "/category/home/kitchen" },
      { name: "Decor", href: "/category/home/decor" },
      { name: "Garden", href: "/category/home/garden" },
    ],
  },
  {
    name: "Beauty",
    slug: "beauty",
    featured: [
      { name: "New Arrivals", href: "/category/beauty/new" },
      { name: "Trending", href: "/category/beauty/trending" },
    ],
    subcategories: [
      { name: "Skincare", href: "/category/beauty/skincare" },
      { name: "Makeup", href: "/category/beauty/makeup" },
      { name: "Hair Care", href: "/category/beauty/hair" },
      { name: "Fragrances", href: "/category/beauty/fragrances" },
    ],
  },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(3);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const { user } = useSession();
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        isScrolled
          ? "border-b bg-background/95 backdrop-blur shadow-sm supports-[backdrop-filter]:bg-background/60"
          : "bg-background"
      )}
    >
      {/* Top bar - optional promo or free shipping message */}
      <div className="bg-primary py-2 text-primary-foreground text-center text-sm hidden md:block">
        <p>
          Free shipping on orders over $50 |{" "}
          <span className="font-medium">Shop now</span>
        </p>
      </div>

      <div className="container flex h-16 items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
              className="rounded-full"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl tracking-tight">ELEGANCE</span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {categories.map((category) => (
                <NavigationMenuItem key={category.slug}>
                  <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid grid-cols-2 gap-3 p-4 w-[500px]">
                      <div>
                        <h3 className="font-medium text-sm mb-2 text-primary">
                          Featured
                        </h3>
                        <ul className="space-y-2">
                          {category.featured.map((item) => (
                            <li key={item.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={item.href}
                                  className="text-sm hover:text-primary transition-colors"
                                >
                                  {item.name}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm mb-2 text-primary">
                          Categories
                        </h3>
                        <ul className="space-y-2">
                          {category.subcategories.map((subcategory) => (
                            <li key={subcategory.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={subcategory.href}
                                  className="text-sm hover:text-primary transition-colors"
                                >
                                  {subcategory.name}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem>
                <Link href="/new-arrivals" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    New Arrivals
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/deals" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Deals
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              className="pl-10 pr-4 h-9 rounded-full border-muted"
            />
          </div>

          <div className="flex items-center space-x-1">
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
                  <DropdownMenuItem>
                    <Link href="/profile" className="flex w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Button onClick={() => logout()} className="flex w-full">
                      Logout
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              ) : (
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-2 p-2">
                    <p className="text-sm font-medium">My Account</p>
                    <p className="text-xs text-muted-foreground">
                      Manage your account and settings
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/login" className="flex w-full">
                      Sign In
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/signup" className="flex w-full">
                      signup
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
              {/* <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col space-y-2 p-2">
                  <p className="text-sm font-medium">My Account</p>
                  <p className="text-xs text-muted-foreground">
                    Manage your account and settings
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/login" className="flex w-full">
                    Sign In
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/signup" className="flex w-full">
                    signup
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent> */}
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t fixed inset-0 top-16 z-40 bg-background overflow-y-auto">
          <div className="container py-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-10 w-full rounded-full"
              />
            </div>

            <nav className="space-y-6">
              {categories.map((category) => (
                <div key={category.slug} className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-medium">{category.name}</h3>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2 pl-2">
                    {category.subcategories.map((subcategory) => (
                      <li key={subcategory.href}>
                        <Link
                          href={subcategory.href}
                          className="text-sm text-muted-foreground hover:text-foreground"
                          onClick={toggleMenu}
                        >
                          {subcategory.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="space-y-3 pt-4 border-t">
                <Link
                  href="/new-arrivals"
                  className="block font-medium py-2"
                  onClick={toggleMenu}
                >
                  New Arrivals
                </Link>
                <Link
                  href="/deals"
                  className="block font-medium py-2"
                  onClick={toggleMenu}
                >
                  Deals
                </Link>
                <Link
                  href="/about"
                  className="block font-medium py-2"
                  onClick={toggleMenu}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block font-medium py-2"
                  onClick={toggleMenu}
                >
                  Contact
                </Link>
              </div>

              <div className="pt-6 border-t">
                <Button variant="default" className="w-full mb-3">
                  Sign In
                </Button>
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
