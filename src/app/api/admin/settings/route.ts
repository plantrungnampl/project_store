import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { validateRequest } from "@/auth";

// Define schema for validation
const storeSettingsSchema = z.object({
  store: z.object({
    name: z
      .string()
      .min(2, { message: "Store name must be at least 2 characters." }),
    description: z.string(),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string(),
    address: z.string(),
    logo: z.string(),
    favicon: z.string(),
    socialLinks: z.object({
      facebook: z.string(),
      instagram: z.string(),
      twitter: z.string(),
      youtube: z.string(),
    }),
  }),
  appearance: z.object({
    theme: z.enum(["light", "dark", "system"]),
    primaryColor: z.string(),
    showHeroBanner: z.boolean(),
    showFeaturedProducts: z.boolean(),
    showPromoSection: z.boolean(),
  }),
  currency: z.object({
    code: z.string().min(3).max(3),
    symbol: z.string(),
    exchangeRate: z.number().positive(),
    position: z.enum(["prefix", "suffix"]),
  }),
  checkout: z.object({
    guestCheckout: z.boolean(),
    termsAndConditionsUrl: z.string(),
    privacyPolicyUrl: z.string(),
    minimumOrderAmount: z.number().min(0),
    paymentMethods: z.array(z.string()),
    shippingMethods: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        price: z.number(),
        description: z.string(),
        isActive: z.boolean(),
      })
    ),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.string(),
    ogImage: z.string(),
    twitterHandle: z.string(),
    googleAnalyticsId: z.string(),
  }),
  notifications: z.object({
    orderConfirmation: z.boolean(),
    orderStatusUpdate: z.boolean(),
    passwordReset: z.boolean(),
    stockAlert: z.boolean(),
    marketingEmails: z.boolean(),
  }),
  legal: z.object({
    returnPolicy: z.string(),
    shippingPolicy: z.string(),
    termsOfService: z.string(),
    privacyPolicy: z.string(),
  }),
});

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await validateRequest();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the store settings
    const settings = await prisma.setting.findFirst({
      where: { id: "store_settings" },
    });

    // Default settings structure if nothing exists in database
    const defaultSettings = {
      store: {
        name: "NextStore",
        description: "Modern e-commerce store built with Next.js",
        email: "support@example.com",
        phone: "",
        address: "",
        logo: "",
        favicon: "",
        socialLinks: {
          facebook: "",
          instagram: "",
          twitter: "",
          youtube: "",
        },
      },
      appearance: {
        theme: "system",
        primaryColor: "blue",
        showHeroBanner: true,
        showFeaturedProducts: true,
        showPromoSection: true,
      },
      currency: {
        code: "VND",
        symbol: "₫",
        exchangeRate: 1,
        position: "suffix",
      },
      checkout: {
        guestCheckout: true,
        termsAndConditionsUrl: "",
        privacyPolicyUrl: "",
        minimumOrderAmount: 0,
        paymentMethods: ["COD", "BankTransfer"],
        shippingMethods: [
          {
            id: "standard",
            name: "Standard Shipping",
            price: 30000,
            description: "3-5 business days",
            isActive: true,
          },
        ],
      },
      seo: {
        title: "NextStore - Modern E-commerce Store",
        description: "Find the best products at great prices",
        keywords: "ecommerce, online shopping, products",
        ogImage: "",
        twitterHandle: "",
        googleAnalyticsId: "",
      },
      notifications: {
        orderConfirmation: true,
        orderStatusUpdate: true,
        passwordReset: true,
        stockAlert: true,
        marketingEmails: true,
      },
      legal: {
        returnPolicy: "",
        shippingPolicy: "",
        termsOfService: "",
        privacyPolicy: "",
      },
    };

    // Parse settings or use defaults
    const storeSettings = settings
      ? typeof settings.value === "string"
        ? JSON.parse(settings.value)
        : settings.value
      : defaultSettings;

    return NextResponse.json(storeSettings);
  } catch (error) {
    console.error("Error fetching store settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch store settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await validateRequest();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the request body
    const body = await request.json();

    // Validate the request body
    const validatedData = storeSettingsSchema.parse(body);

    // Update or create settings
    const settings = await prisma.setting.upsert({
      where: { id: "store_settings" },
      update: {
        value: validatedData,
        updatedAt: new Date(),
      },
      create: {
        id: "store_settings",
        value: validatedData,
      },
    });

    return NextResponse.json({
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating store settings:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update store settings" },
      { status: 500 }
    );
  }
}
