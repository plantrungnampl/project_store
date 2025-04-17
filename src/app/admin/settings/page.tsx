import { Metadata } from "next";
import prisma from "@/lib/prisma";
import StoreSettingsForm from "@/components/admin/settings/StoreSettingsForm";

export const metadata: Metadata = {
  title: "Store Settings | NextStore",
  description: "Configure your store settings",
};

export default async function SettingsPage() {
  // Fetch store settings
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
      position: "suffix", // prefix or suffix
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">
          Configure your store settings and preferences
        </p>
      </div>

      <StoreSettingsForm initialSettings={storeSettings} />
    </div>
  );
}
