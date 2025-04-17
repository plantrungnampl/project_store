"use server";

import prisma from "@/lib/prisma";

/**
 * Get all active categories
 */
export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        level: 1, // Only top-level categories
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        subcategories: {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        slug,
        isActive: true,
      },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        parent: true,
      },
    });

    if (!category) return null;

    return category;
  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Get category breadcrumb
 */
export async function getCategoryBreadcrumb(categoryId: string) {
  try {
    // Start with the category itself
    const breadcrumb = [];
    let currentCategory = await prisma.category.findUnique({
      where: { id: categoryId, isActive: true },
      select: { id: true, name: true, slug: true, parentId: true },
    });

    if (!currentCategory) return [];

    // Add current category
    breadcrumb.unshift({
      id: currentCategory.id,
      name: currentCategory.name,
      slug: currentCategory.slug,
    });

    // Fetch parents recursively
    while (currentCategory?.parentId) {
      currentCategory = await prisma.category.findUnique({
        where: { id: currentCategory.parentId, isActive: true },
        select: { id: true, name: true, slug: true, parentId: true },
      });

      if (currentCategory) {
        breadcrumb.unshift({
          id: currentCategory.id,
          name: currentCategory.name,
          slug: currentCategory.slug,
        });
      }
    }

    return breadcrumb;
  } catch (error) {
    console.error(
      `Error fetching breadcrumb for category ${categoryId}:`,
      error
    );
    return [];
  }
}

/**
 * Get all active brands
 */
export async function getBrands() {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return brands;
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

/**
 * Get brand by slug
 */
export async function getBrandBySlug(slug: string) {
  try {
    const brand = await prisma.brand.findUnique({
      where: {
        slug,
        isActive: true,
      },
    });

    return brand;
  } catch (error) {
    console.error(`Error fetching brand with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Get menu categories (for navigation)
 */
export async function getMenuCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        level: 1, // Only top-level categories for menu
      },
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        subcategories: {
          where: {
            isActive: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
          take: 8, // Limit subcategories for menu
        },
      },
      take: 6, // Limit top categories for menu
    });

    return categories;
  } catch (error) {
    console.error("Error fetching menu categories:", error);
    return [];
  }
}
