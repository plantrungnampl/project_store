
import {
  PrismaClient,
  UserRole,
  OrderStatus,
  TransactionType,
  TransactionStatus,
  NotificationType,
  CouponType,
  BannerType,
  ReportStatus,
} from "@prisma/client";
import { faker } from "@faker-js/faker";
import * as bcrypt from "bcrypt";
import {
  fakerEN_US,
  fakerEN_GB,
  fakerDE,
  fakerFR,
  fakerES,
  fakerJA,
  fakerZH_CN,
  fakerPT_BR,
  fakerRU,
  fakerEN_IN,
  fakerAR,
} from "@faker-js/faker";

// Tạo map cho các faker theo locale
const fakerMap: Record<string, typeof faker> = {
  en_US: fakerEN_US,
  en_GB: fakerEN_GB,
  de_DE: fakerDE,
  fr_FR: fakerFR,
  es_ES: fakerES,
  ja_JP: fakerJA,
  zh_CN: fakerZH_CN,
  pt_BR: fakerPT_BR,
  ru_RU: fakerRU,
  hi_IN: fakerEN_IN,
  ar_SA: fakerAR,
};

const prisma = new PrismaClient();

// Helper to generate a secure password hash
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Currency options for multi-national support
const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
];

// Languages for multi-national support
const languages = [
  "en", // English
  "es", // Spanish
  "fr", // French
  "de", // German
  "zh", // Chinese
  "ja", // Japanese
  "ar", // Arabic
  "hi", // Hindi
  "pt", // Portuguese
  "ru", // Russian
];

// Countries for addresses
const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "South Korea",
  "Italy",
  "Spain",
  "Netherlands",
  "Singapore",
  "United Arab Emirates",
  "Sweden",
  "Switzerland",
  "Russia",
];

// Function to seed all data
async function main() {
  console.log("Starting seed process...");

  // Clear existing data (if needed)
  await clearExistingData();

  // Create users (admins, staff, customers)
  const users = await seedUsers();
  console.log(`Created ${users.length} users`);

  // Create attributes and values (color, size, etc.)
  const attributes = await seedAttributes();
  console.log(`Created ${attributes.length} attributes`);

  // Create brands
  const brands = await seedBrands();
  console.log(`Created ${brands.length} brands`);

  // Create categories and subcategories
  const categories = await seedCategories();
  console.log(`Created ${categories.length} categories`);

  // Create products with variants, attributes, and images
  const products = await seedProducts(brands, categories, attributes);
  console.log(`Created ${products.length} products`);

  // Create coupons
  const coupons = await seedCoupons();
  console.log(`Created ${coupons.length} coupons`);

  // Create user addresses
  const addresses = await seedAddresses(users);
  console.log(`Created ${addresses.length} addresses`);

  // Create payment methods for users
  const paymentMethods = await seedPaymentMethods(users);
  console.log(`Created ${paymentMethods.length} payment methods`);

  // Create orders with items and transactions
  const orders = await seedOrders(users, products, addresses, paymentMethods);
  console.log(`Created ${orders.length} orders`);

  // Create reviews for products
  const reviews = await seedReviews(users, products);
  console.log(`Created ${reviews.length} reviews`);

  // Create wishlists for users
  const wishlists = await seedWishlists(users, products);
  console.log(`Created ${wishlists.length} wishlists`);

  // Create carts for users
  const carts = await seedCarts(users, products);
  console.log(`Created ${carts.length} carts`);

  // Create banners
  const banners = await seedBanners(users);
  console.log(`Created ${banners.length} banners`);

  // Create settings
  await seedSettings();
  console.log(`Created settings`);

  console.log("Seed process completed successfully!");
}

// Function to clear existing data if needed
async function clearExistingData() {
  // This is optional and should be used carefully
  // Only enable during development or when you want to completely reset the database
  // Uncomment the following lines if you want to clear data before seeding

  console.log("Clearing existing data...");

  // The order matters due to foreign key constraints
  await prisma.reviewHelpful.deleteMany({});
  await prisma.reviewReport.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.orderStatusUpdate.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartCoupon.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.productVariantImage.deleteMany({});
  await prisma.productVariantAttribute.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productAttribute.deleteMany({});
  await prisma.productCategory.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.attributeValue.deleteMany({});
  await prisma.attribute.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.banner.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.setting.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Existing data cleared");
}

// Function to seed users
async function seedUsers() {
  const users = [];

  // Create admin user
  const adminPasswordHash = await hashPassword("Admin1234@");
  const admin = await prisma.user.create({
    data: {
      email: "admin@gmail.com",
      passwordHash: adminPasswordHash,
      firstName: "Admin",
      lastName: "User",
      phone: "+1234567890",
      role: UserRole.ADMIN,
      emailVerified: true,
      preferences: {
        language: "en",
        currency: "USD",
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
      },
      lastLoginAt: new Date(),
    },
  });
  users.push(admin);

  // Create staff users
  for (let i = 0; i < 5; i++) {
    const staffPasswordHash = await hashPassword("Staff@123");
    const staff = await prisma.user.create({
      data: {
        email: `staff${i + 1}@example.com`,
        passwordHash: staffPasswordHash,
        firstName: fakerEN_US.person.firstName(),
        lastName: fakerEN_US.person.lastName(),
        phone: fakerEN_US.phone.number(),
        role: UserRole.STAFF,
        emailVerified: true,
        preferences: {
          language: fakerEN_US.helpers.arrayElement(languages),
          currency: fakerEN_US.helpers.arrayElement(currencies).code,
          notifications: {
            email: fakerEN_US.datatype.boolean(),
            push: fakerEN_US.datatype.boolean(),
            sms: fakerEN_US.datatype.boolean(),
          },
        },
        lastLoginAt: fakerEN_US.date.recent(),
      },
    });
    users.push(staff);
  }

  // Create customer users
  for (let i = 0; i < 50; i++) {
    const customerPasswordHash = await hashPassword("Customer@123");

    // Pick a random locale for international users
    const locales = Object.keys(fakerMap);
    const locale = fakerEN_US.helpers.arrayElement(locales);
    const localizedFaker = fakerMap[locale];

    const customer = await prisma.user.create({
      data: {
        email: localizedFaker.internet.email().toLowerCase(),
        passwordHash: customerPasswordHash,
        firstName: localizedFaker.person.firstName(),
        lastName: localizedFaker.person.lastName(),
        phone: localizedFaker.phone.number(),
        role: UserRole.CUSTOMER,
        emailVerified: localizedFaker.datatype.boolean(0.8), // 80% are verified
        preferences: {
          language: locale.split("_")[0],
          currency: localizedFaker.helpers.arrayElement(currencies).code,
          notifications: {
            email: localizedFaker.datatype.boolean(0.7),
            push: localizedFaker.datatype.boolean(0.5),
            sms: localizedFaker.datatype.boolean(0.3),
          },
          theme: localizedFaker.helpers.arrayElement([
            "light",
            "dark",
            "system",
          ]),
        },
        lastLoginAt: localizedFaker.date.recent({ days: 30 }),
        // Some users have OAuth credentials
        ...(localizedFaker.datatype.boolean(0.3) && {
          providerType: localizedFaker.helpers.arrayElement([
            "GOOGLE",
            "FACEBOOK",
            "APPLE",
          ]),
          providerId: localizedFaker.string.uuid(),
        }),
      },
    });
    users.push(customer);
  }

  return users;
}

// Function to seed attributes and values
async function seedAttributes() {
  const attributes = [];

  // Color attribute
  const colorAttribute = await prisma.attribute.create({
    data: {
      name: "color",
      displayName: "Color",
      description: "Product color",
      filterType: "color-swatch",
      values: {
        create: [
          { value: "red", displayValue: "Red", colorCode: "#FF0000" },
          { value: "blue", displayValue: "Blue", colorCode: "#0000FF" },
          { value: "green", displayValue: "Green", colorCode: "#00FF00" },
          { value: "black", displayValue: "Black", colorCode: "#000000" },
          { value: "white", displayValue: "White", colorCode: "#FFFFFF" },
          { value: "yellow", displayValue: "Yellow", colorCode: "#FFFF00" },
          { value: "purple", displayValue: "Purple", colorCode: "#800080" },
          { value: "pink", displayValue: "Pink", colorCode: "#FFC0CB" },
          { value: "orange", displayValue: "Orange", colorCode: "#FFA500" },
          { value: "gray", displayValue: "Gray", colorCode: "#808080" },
        ],
      },
    },
    include: {
      values: true,
    },
  });
  attributes.push(colorAttribute);

  // Size attribute
  const sizeAttribute = await prisma.attribute.create({
    data: {
      name: "size",
      displayName: "Size",
      description: "Product size",
      filterType: "dropdown",
      values: {
        create: [
          { value: "xs", displayValue: "XS", sortOrder: 1 },
          { value: "s", displayValue: "S", sortOrder: 2 },
          { value: "m", displayValue: "M", sortOrder: 3 },
          { value: "l", displayValue: "L", sortOrder: 4 },
          { value: "xl", displayValue: "XL", sortOrder: 5 },
          { value: "xxl", displayValue: "2XL", sortOrder: 6 },
          { value: "xxxl", displayValue: "3XL", sortOrder: 7 },
        ],
      },
    },
    include: {
      values: true,
    },
  });
  attributes.push(sizeAttribute);

  // Material attribute
  const materialAttribute = await prisma.attribute.create({
    data: {
      name: "material",
      displayName: "Material",
      description: "Product material",
      filterType: "checkbox",
      values: {
        create: [
          { value: "cotton", displayValue: "Cotton" },
          { value: "polyester", displayValue: "Polyester" },
          { value: "leather", displayValue: "Leather" },
          { value: "wool", displayValue: "Wool" },
          { value: "silk", displayValue: "Silk" },
          { value: "denim", displayValue: "Denim" },
          { value: "linen", displayValue: "Linen" },
          { value: "cashmere", displayValue: "Cashmere" },
        ],
      },
    },
    include: {
      values: true,
    },
  });
  attributes.push(materialAttribute);

  // Style attribute
  const styleAttribute = await prisma.attribute.create({
    data: {
      name: "style",
      displayName: "Style",
      description: "Product style",
      filterType: "checkbox",
      values: {
        create: [
          { value: "casual", displayValue: "Casual" },
          { value: "formal", displayValue: "Formal" },
          { value: "sporty", displayValue: "Sporty" },
          { value: "vintage", displayValue: "Vintage" },
          { value: "bohemian", displayValue: "Bohemian" },
          { value: "minimalist", displayValue: "Minimalist" },
        ],
      },
    },
    include: {
      values: true,
    },
  });
  attributes.push(styleAttribute);

  return attributes;
}

// Function to seed brands
async function seedBrands() {
  const brands = [];

  // International brands
  const brandData = [
    {
      name: "Nordic Essentials",
      description: "Scandinavian-inspired minimalist designs for everyday life",
      logoUrl: "https://example.com/logos/nordic-essentials.png",
      websiteUrl: "https://nordicessentials.example.com",
    },
    {
      name: "Sakura Style",
      description:
        "Japanese-inspired fashion blending tradition with modern trends",
      logoUrl: "https://example.com/logos/sakura-style.png",
      websiteUrl: "https://sakurastyle.example.com",
    },
    {
      name: "Milano Moda",
      description: "Italian luxury fashion with exquisite craftsmanship",
      logoUrl: "https://example.com/logos/milano-moda.png",
      websiteUrl: "https://milanomoda.example.com",
    },
    {
      name: "Paris Élégance",
      description: "French sophistication with timeless elegance",
      logoUrl: "https://example.com/logos/paris-elegance.png",
      websiteUrl: "https://pariselegance.example.com",
    },
    {
      name: "Berlin Urban",
      description: "German engineering meets urban streetwear",
      logoUrl: "https://example.com/logos/berlin-urban.png",
      websiteUrl: "https://berlinurban.example.com",
    },
    {
      name: "Seoul Wave",
      description: "Korean-inspired fashion at the forefront of global trends",
      logoUrl: "https://example.com/logos/seoul-wave.png",
      websiteUrl: "https://seoulwave.example.com",
    },
    {
      name: "Bombay Bazaar",
      description: "Vibrant Indian designs with traditional craftsmanship",
      logoUrl: "https://example.com/logos/bombay-bazaar.png",
      websiteUrl: "https://bombaybazaar.example.com",
    },
    {
      name: "Cairo Collection",
      description: "Middle Eastern inspiration with modern interpretations",
      logoUrl: "https://example.com/logos/cairo-collection.png",
      websiteUrl: "https://cairocollection.example.com",
    },
    {
      name: "São Paulo Spirit",
      description: "Brazilian vibrant and colorful lifestyle products",
      logoUrl: "https://example.com/logos/sao-paulo-spirit.png",
      websiteUrl: "https://saopaulospirit.example.com",
    },
    {
      name: "New York Nouveau",
      description: "American metropolitan style for the modern consumer",
      logoUrl: "https://example.com/logos/new-york-nouveau.png",
      websiteUrl: "https://newyorknouveau.example.com",
    },
    {
      name: "Dubai Luxe",
      description:
        "Luxury lifestyle products inspired by Middle Eastern opulence",
      logoUrl: "https://example.com/logos/dubai-luxe.png",
      websiteUrl: "https://dubailuxe.example.com",
    },
    {
      name: "Moscow Heritage",
      description: "Traditional Russian craftsmanship with contemporary design",
      logoUrl: "https://example.com/logos/moscow-heritage.png",
      websiteUrl: "https://moscowheritage.example.com",
    },
  ];

  for (const data of brandData) {
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        slug: slugify(data.name),
        description: data.description,
        logoUrl: data.logoUrl,
        websiteUrl: data.websiteUrl,
        isActive: true,
      },
    });
    brands.push(brand);
  }

  return brands;
}

// Function to seed categories
async function seedCategories() {
  const categories = [];

  // Create main categories
  const mainCategories = [
    {
      name: "Apparel",
      description: "Clothing for all occasions",
      subCategories: [
        "Men's Clothing",
        "Women's Clothing",
        "Children's Clothing",
        "Accessories",
      ],
    },
    {
      name: "Electronics",
      description: "Latest gadgets and devices",
      subCategories: [
        "Smartphones",
        "Laptops & Computers",
        "Audio & Headphones",
        "Wearable Technology",
      ],
    },
    {
      name: "Home & Living",
      description: "Everything for your home",
      subCategories: ["Furniture", "Kitchen & Dining", "Bedding", "Home Décor"],
    },
    {
      name: "Beauty & Personal Care",
      description: "Look and feel your best",
      subCategories: ["Skincare", "Makeup", "Hair Care", "Fragrance"],
    },
    {
      name: "Sports & Outdoors",
      description: "Gear for an active lifestyle",
      subCategories: [
        "Fitness Equipment",
        "Outdoor Recreation",
        "Sports Apparel",
        "Camping Gear",
      ],
    },
    {
      name: "Books & Stationery",
      description: "For readers and writers",
      subCategories: [
        "Fiction",
        "Non-Fiction",
        "Office Supplies",
        "Art & Craft",
      ],
    },
    {
      name: "Cultural Collections",
      description: "Authentic products from around the world",
      subCategories: [
        "Asian Heritage",
        "European Treasures",
        "African Artistry",
        "Latin American Crafts",
      ],
    },
  ];

  for (const category of mainCategories) {
    const slugify = (text: string) =>
      text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "");

    const mainCategory = await prisma.category.create({
      data: {
        name: category.name,
        slug: slugify(category.name),
        description: category.description,
        imageUrl: `https://example.com/categories/${slugify(
          category.name
        )}.jpg`,
        isActive: true,
        metaTitle: `${category.name} - Shop the Best Selection`,
        metaDescription: `Explore our wide range of ${category.name.toLowerCase()} from top brands worldwide.`,
        level: 1,
      },
    });

    categories.push(mainCategory);

    // Create subcategories
    for (let i = 0; i < category.subCategories.length; i++) {
      const subCategoryName = category.subCategories[i];
      const subCategory = await prisma.category.create({
        data: {
          name: subCategoryName,
          slug: slugify(subCategoryName),
          description: `All ${subCategoryName.toLowerCase()} products`,
          imageUrl: `https://example.com/categories/${slugify(
            subCategoryName
          )}.jpg`,
          isActive: true,
          parentId: mainCategory.id,
          level: 2,
          sortOrder: i,
        },
      });

      categories.push(subCategory);
    }
  }

  return categories;
}

// Function to seed products
async function seedProducts(
  brands: any[],
  categories: any[],
  attributes: any[]
) {
  const products = [];
  const subcategories = categories.filter((c) => c.level === 2);

  // Helper function to create product variations (multiple languages)
  function getMultilingualProduct(baseName: string, category: string) {
    const translations = {
      // English is default
      en: {
        name: baseName,
        description: `High-quality ${baseName.toLowerCase()} for all occasions. This ${category.toLowerCase()} product offers superior comfort and style.`,
      },
      es: {
        name: `${baseName} Español`,
        description: `${baseName} de alta calidad para todas las ocasiones. Este producto de ${category.toLowerCase()} ofrece comodidad y estilo superior.`,
      },
      fr: {
        name: `${baseName} Français`,
        description: `${baseName} de haute qualité pour toutes les occasions. Ce produit de ${category.toLowerCase()} offre un confort et un style supérieurs.`,
      },
      de: {
        name: `${baseName} Deutsch`,
        description: `Hochwertiges ${baseName.toLowerCase()} für alle Gelegenheiten. Dieses ${category.toLowerCase()}-Produkt bietet überlegenen Komfort und Stil.`,
      },
      zh: {
        name: `${baseName} 中文`,
        description: `适合各种场合的高质量${baseName.toLowerCase()}。这款${category.toLowerCase()}产品提供卓越的舒适性和风格。`,
      },
      ja: {
        name: `${baseName} 日本語`,
        description: `あらゆる機会に最適な高品質の${baseName.toLowerCase()}。この${category.toLowerCase()}製品は、優れた快適さとスタイルを提供します。`,
      },
      ar: {
        name: `${baseName} عربي`,
        description: `${baseName.toLowerCase()} عالي الجودة لجميع المناسبات. يوفر منتج ${category.toLowerCase()} هذا راحة وأناقة فائقة.`,
      },
      pt: {
        name: `${baseName} Português`,
        description: `${baseName} de alta qualidade para todas as ocasiões. Este produto de ${category.toLowerCase()} oferece conforto e estilo superiores.`,
      },
      ru: {
        name: `${baseName} Русский`,
        description: `Высококачественный ${baseName.toLowerCase()} для всех случаев. Этот продукт ${category.toLowerCase()} предлагает превосходный комфорт и стиль.`,
      },
    };

    return {
      name: translations.en.name,
      description: {
        en: translations.en.description,
        es: translations.es.description,
        fr: translations.fr.description,
        de: translations.de.description,
        zh: translations.zh.description,
        ja: translations.ja.description,
        ar: translations.ar.description,
        pt: translations.pt.description,
        ru: translations.ru.description,
      },
    };
  }

  // Generate 50 products
  for (let i = 0; i < 50; i++) {
    // Select random category and brand
    const category = faker.helpers.arrayElement(subcategories);
    const brand = faker.helpers.arrayElement(brands);

    // Generate SKU
    const sku = `${brand.name.substring(0, 3).toUpperCase()}-${category.name
      .substring(0, 3)
      .toUpperCase()}-${100 + i}`;

    // Generate product name and multilingual content
    const productBase = faker.commerce.productName();
    const multiProduct = getMultilingualProduct(productBase, category.name);

    // Create base price in USD then convert to a random currency
    const basePrice = parseFloat(faker.commerce.price({ min: 10, max: 1000 }));
    const selectedCurrency = faker.helpers.arrayElement(currencies);

    // Determine if product has a sale price
    const hasDiscount = faker.datatype.boolean(0.4); // 40% chance of discount
    const compareAtPrice = hasDiscount
      ? basePrice * (1 + faker.number.float({ min: 0.1, max: 0.5 }))
      : null;

    // Create product
    const product = await prisma.product.create({
      data: {
        name: multiProduct.name,
        slug: `${sku.toLowerCase()}-${faker.helpers.slugify(
          multiProduct.name.toLowerCase()
        )}`,
        sku: sku,
        description: JSON.stringify(multiProduct.description),
        price: basePrice,
        compareAtPrice: compareAtPrice,
        costPrice: basePrice * 0.6, // 60% of retail price
        brandId: brand.id,
        isActive: true,
        isFeatured: faker.datatype.boolean(0.2), // 20% are featured
        isDigital:
          category.name.includes("Books") || faker.datatype.boolean(0.1),
        stockQuantity: faker.number.int({ min: 0, max: 1000 }),
        weight: faker.datatype.boolean(0.7)
          ? parseFloat(
              faker.number
                .float({ min: 0.1, max: 20, precision: 0.1 })
                .toFixed(1)
            )
          : null,
        dimensions: faker.datatype.boolean(0.6)
          ? {
              length: parseFloat(
                faker.number
                  .float({ min: 1, max: 100, precision: 0.1 })
                  .toFixed(1)
              ),
              width: parseFloat(
                faker.number
                  .float({ min: 1, max: 100, precision: 0.1 })
                  .toFixed(1)
              ),
              height: parseFloat(
                faker.number
                  .float({ min: 1, max: 100, precision: 0.1 })
                  .toFixed(1)
              ),
            }
          : null,
        metaTitle: `${multiProduct.name} | ${brand.name}`,
        metaDescription: multiProduct.description.en.substring(0, 160),
        taxClass: faker.helpers.arrayElement(["standard", "reduced", "zero"]),
        publishedAt: faker.date.past(),
        // Link to categories
        categories: {
          create: {
            categoryId: category.id,
          },
        },
      },
    });

    products.push(product);

    // Add product images (3-6 images per product)
    const numImages = faker.number.int({ min: 3, max: 6 });
    for (let j = 0; j < numImages; j++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://example.com/products/${product.sku.toLowerCase()}-${
            j + 1
          }.jpg`,
          altText: `${product.name} - Image ${j + 1}`,
          width: 800,
          height: 800,
          isThumbnail: j === 0, // First image is thumbnail
          sortOrder: j,
        },
      });
    }

    // Add product attributes
    const colorAttribute = attributes.find((a) => a.name === "color");
    const sizeAttribute = attributes.find((a) => a.name === "size");
    const materialAttribute = attributes.find((a) => a.name === "material");
    const styleAttribute = attributes.find((a) => a.name === "style");

    // Add color attribute
    if (colorAttribute && !category.name.includes("Books")) {
      const colorValues = faker.helpers.arrayElements(
        colorAttribute.values,
        faker.number.int({ min: 1, max: 4 })
      );
      for (const colorValue of colorValues) {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            attributeId: colorAttribute.id,
            attributeValueId: colorValue.id,
            isVariant: true,
          },
        });
      }
    }

    // Add size attribute for apparel
    if (
      sizeAttribute &&
      (category.name.includes("Clothing") || category.name.includes("Apparel"))
    ) {
      const sizeValues = faker.helpers.arrayElements(
        sizeAttribute.values,
        faker.number.int({ min: 3, max: 7 })
      );
      for (const sizeValue of sizeValues) {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            attributeId: sizeAttribute.id,
            attributeValueId: sizeValue.id,
            isVariant: true,
          },
        });
      }
    }

    // Add material attribute
    if (materialAttribute && faker.datatype.boolean(0.7)) {
      const materialValues = faker.helpers.arrayElements(
        materialAttribute.values,
        faker.number.int({ min: 1, max: 2 })
      );
      for (const materialValue of materialValues) {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            attributeId: materialAttribute.id,
            attributeValueId: materialValue.id,
            isVariant: false,
          },
        });
      }
    }

    // Add style attribute
    if (styleAttribute && faker.datatype.boolean(0.5)) {
      const styleValues = faker.helpers.arrayElements(styleAttribute.values, 1);
      for (const styleValue of styleValues) {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            attributeId: styleAttribute.id,
            attributeValueId: styleValue.id,
            isVariant: false,
          },
        });
      }
    }

    // Create product variants if it has variant attributes
    const hasColorVariants =
      colorAttribute &&
      (await prisma.productAttribute.findFirst({
        where: {
          productId: product.id,
          attributeId: colorAttribute.id,
          isVariant: true,
        },
      }));

    const hasSizeVariants =
      sizeAttribute &&
      (await prisma.productAttribute.findFirst({
        where: {
          productId: product.id,
          attributeId: sizeAttribute.id,
          isVariant: true,
        },
      }));

    if (hasColorVariants || hasSizeVariants) {
      // Get all color values for this product
      const productColorAttributes = colorAttribute
        ? await prisma.productAttribute.findMany({
            where: {
              productId: product.id,
              attributeId: colorAttribute.id,
              isVariant: true,
            },
            include: { attributeValue: true },
          })
        : [];

      // Get all size values for this product
      const productSizeAttributes = sizeAttribute
        ? await prisma.productAttribute.findMany({
            where: {
              productId: product.id,
              attributeId: sizeAttribute.id,
              isVariant: true,
            },
            include: { attributeValue: true },
          })
        : [];

      // If we have both color and size, create variants for each combination
      if (
        productColorAttributes.length > 0 &&
        productSizeAttributes.length > 0
      ) {
        let variantCount = 0;
        for (const colorAttr of productColorAttributes) {
          for (const sizeAttr of productSizeAttributes) {
            variantCount++;

            // Sometimes skip a variant to simulate out-of-stock combinations
            if (faker.datatype.boolean(0.9)) {
              // 90% chance to create each variant
              const variantName = `${product.name} - ${colorAttr.attributeValue.displayValue}, ${sizeAttr.attributeValue.displayValue}`;

              // Tạo SKU độc đáo
              const uniqueIdentifier = faker.string
                .alphanumeric(6)
                .toUpperCase();
              const variantSku = `${
                product.sku
              }-${colorAttr.attributeValue.value.substring(
                0,
                1
              )}${sizeAttr.attributeValue.value.substring(
                0,
                1
              )}-${uniqueIdentifier}`;

              // Variant price might be slightly different from base product
              const variantPrice =
                basePrice * (1 + faker.number.float({ min: -0.1, max: 0.1 }));

              // Create the variant
              const variant = await prisma.productVariant.create({
                data: {
                  productId: product.id,
                  name: variantName,
                  sku: variantSku,
                  price: parseFloat(variantPrice.toFixed(2)),
                  compareAtPrice: compareAtPrice
                    ? compareAtPrice *
                      (1 + faker.number.float({ min: -0.05, max: 0.05 }))
                    : null,
                  stockQuantity: faker.number.int({ min: 0, max: 100 }),
                  isActive: true,
                },
              });

              // Link color and size attributes to the variant
              await prisma.productVariantAttribute.create({
                data: {
                  variantId: variant.id,
                  attributeValueId: colorAttr.attributeValueId,
                },
              });

              await prisma.productVariantAttribute.create({
                data: {
                  variantId: variant.id,
                  attributeValueId: sizeAttr.attributeValueId,
                },
              });

              // Add a variant image
              await prisma.productVariantImage.create({
                data: {
                  variantId: variant.id,
                  url: `https://example.com/products/${product.sku.toLowerCase()}-${
                    colorAttr.attributeValue.value
                  }-${sizeAttr.attributeValue.value}.jpg`,
                  altText: variantName,
                  width: 800,
                  height: 800,
                  isThumbnail: true,
                },
              });
            }
          }
        }
      }
      // Nếu chỉ có color
      else if (productColorAttributes.length > 0) {
        for (const colorAttr of productColorAttributes) {
          const variantName = `${product.name} - ${colorAttr.attributeValue.displayValue}`;

          // Tạo SKU độc đáo
          const uniqueIdentifier = faker.string.alphanumeric(6).toUpperCase();
          const variantSku = `${
            product.sku
          }-${colorAttr.attributeValue.value.substring(
            0,
            2
          )}-${uniqueIdentifier}`;

          const variant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: variantName,
              sku: variantSku,
              price: basePrice,
              compareAtPrice: compareAtPrice,
              stockQuantity: faker.number.int({ min: 0, max: 100 }),
              isActive: true,
            },
          });

          // Link color attribute to the variant
          await prisma.productVariantAttribute.create({
            data: {
              variantId: variant.id,
              attributeValueId: colorAttr.attributeValueId,
            },
          });

          // Add a variant image
          await prisma.productVariantImage.create({
            data: {
              variantId: variant.id,
              url: `https://example.com/products/${product.sku.toLowerCase()}-${
                colorAttr.attributeValue.value
              }.jpg`,
              altText: variantName,
              width: 800,
              height: 800,
              isThumbnail: true,
            },
          });
        }
      }
      // Nếu chỉ có size
      else if (productSizeAttributes.length > 0) {
        for (const sizeAttr of productSizeAttributes) {
          const variantName = `${product.name} - ${sizeAttr.attributeValue.displayValue}`;

          // Tạo SKU độc đáo
          const uniqueIdentifier = faker.string.alphanumeric(6).toUpperCase();
          const variantSku = `${product.sku}-${sizeAttr.attributeValue.value}-${uniqueIdentifier}`;

          const variant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: variantName,
              sku: variantSku,
              price: basePrice,
              compareAtPrice: compareAtPrice,
              stockQuantity: faker.number.int({ min: 0, max: 100 }),
              isActive: true,
            },
          });

          // Link size attribute to the variant
          await prisma.productVariantAttribute.create({
            data: {
              variantId: variant.id,
              attributeValueId: sizeAttr.attributeValueId,
            },
          });
        }
      }
    }
  }

  return products;
}
// Function to seed coupons
async function seedCoupons() {
  const coupons = [];

  // Create coupons for different regions and currencies
  const couponData = [
    // Global coupons (USD)
    {
      code: "WELCOME10",
      type: CouponType.PERCENTAGE,
      value: 10,
      description: "Get 10% off your first order",
      minOrderAmount: 50,
      usageLimit: 1000,
      perUserLimit: 1,
    },
    {
      code: "SUMMER25",
      type: CouponType.PERCENTAGE,
      value: 25,
      description: "Summer sale! 25% off select items",
      minOrderAmount: 100,
      maxDiscount: 50,
      usageLimit: 500,
      startsAt: new Date(new Date().getFullYear(), 5, 1), // June 1st
      expiresAt: new Date(new Date().getFullYear(), 8, 1), // September 1st
    },
    {
      code: "FREESHIP",
      type: CouponType.FREE_SHIPPING,
      value: 0,
      description: "Free shipping on all orders",
      minOrderAmount: 75,
      usageLimit: 2000,
    },

    // EUR region coupons
    {
      code: "EURO20",
      type: CouponType.PERCENTAGE,
      value: 20,
      description: "Special 20% discount for European customers",
      minOrderAmount: 50,
      usageLimit: 300,
    },

    // Fixed amount coupons in different currencies
    {
      code: "USD15OFF",
      type: CouponType.FIXED_AMOUNT,
      value: 15,
      description: "$15 off orders over $100",
      minOrderAmount: 100,
    },
    {
      code: "EUR10OFF",
      type: CouponType.FIXED_AMOUNT,
      value: 10,
      description: "€10 off orders over €80",
      minOrderAmount: 80,
    },
    {
      code: "GBP8OFF",
      type: CouponType.FIXED_AMOUNT,
      value: 8,
      description: "£8 off orders over £70",
      minOrderAmount: 70,
    },

    // Holiday promotions
    {
      code: "HOLIDAY30",
      type: CouponType.PERCENTAGE,
      value: 30,
      description: "Holiday season savings! 30% off sitewide",
      maxDiscount: 100,
      startsAt: new Date(new Date().getFullYear(), 10, 25), // November 25th
      expiresAt: new Date(new Date().getFullYear(), 11, 26), // December 26th
    },

    // New customer offers
    {
      code: "NEWCUST25",
      type: CouponType.PERCENTAGE,
      value: 25,
      description: "New customer offer: 25% off your first purchase",
      perUserLimit: 1,
    },

    // Flash sale coupons
    {
      code: "FLASH50",
      type: CouponType.PERCENTAGE,
      value: 50,
      description: "Flash sale! 50% off select items for 24 hours only",
      maxDiscount: 200,
      startsAt: new Date(new Date().setHours(0, 0, 0, 0)),
      expiresAt: new Date(new Date().setHours(24, 0, 0, 0)),
      usageLimit: 100,
    },
  ];

  for (const data of couponData) {
    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxDiscount: data.maxDiscount,
        description: data.description,
        isActive: true,
        usageLimit: data.usageLimit,
        usageCount: faker.number.int({
          min: 0,
          max: data.usageLimit ? data.usageLimit / 2 : 100,
        }),
        perUserLimit: data.perUserLimit,
        startsAt: data.startsAt,
        expiresAt: data.expiresAt,
      },
    });

    coupons.push(coupon);
  }

  return coupons;
}
// Sửa đổi hàm seedAddresses
async function seedAddresses(users: any[]) {
  const addresses = [];

  // Create addresses for users (customers only)
  const customers = users.filter((user) => user.role === UserRole.CUSTOMER);

  for (const user of customers) {
    // Number of addresses per user (1-3)
    const addressCount = fakerEN_US.number.int({ min: 1, max: 3 });

    for (let i = 0; i < addressCount; i++) {
      // Use appropriate faker locale for address based on country
      const country = fakerEN_US.helpers.arrayElement(countries);
      let locale = "en_US";

      // Map countries to appropriate locales
      if (country === "United Kingdom") locale = "en_GB";
      else if (country === "Germany") locale = "de_DE";
      else if (country === "France") locale = "fr_FR";
      else if (country === "Spain") locale = "es_ES";
      else if (country === "Japan") locale = "ja_JP";
      else if (country === "China") locale = "zh_CN";
      else if (country === "Brazil") locale = "pt_BR";
      else if (country === "Russia") locale = "ru_RU";

      const localizedFaker = fakerMap[locale] || fakerEN_US;

      // Generate local-appropriate address
      const address = await prisma.address.create({
        data: {
          userId: user.id,
          isDefault: i === 0, // First address is default
          label:
            i === 0
              ? "Home"
              : localizedFaker.helpers.arrayElement([
                  "Work",
                  "Vacation Home",
                  "Parent's House",
                  null,
                ]),
          firstName: user.firstName,
          lastName: user.lastName,
          addressLine1: localizedFaker.location.streetAddress(),
          addressLine2: localizedFaker.datatype.boolean(0.3)
            ? localizedFaker.location.secondaryAddress()
            : null,
          city: localizedFaker.location.city(),
          state: localizedFaker.location.state(),
          postalCode: localizedFaker.location.zipCode(),
          country: country,
          phone: localizedFaker.phone.number(),
        },
      });

      addresses.push(address);
    }
  }

  return addresses;
}
// Function to seed payment methods
async function seedPaymentMethods(users: any[]) {
  const paymentMethods = [];

  // Create payment methods for users (customers only)
  const customers = users.filter((user) => user.role === UserRole.CUSTOMER);

  // Payment providers by region
  const paymentProviders = {
    global: ["stripe", "paypal"],
    europe: ["stripe", "paypal", "klarna", "ideal", "sepa"],
    asia: ["stripe", "paypal", "alipay", "wechat_pay", "paytm"],
    americas: ["stripe", "paypal", "apple_pay", "google_pay", "mercado_pago"],
    africa: ["stripe", "paypal", "flutterwave", "paystack"],
    middleEast: ["stripe", "paypal", "tap", "hyperpay"],
  };

  // Card brands
  const cardBrands = [
    "visa",
    "mastercard",
    "amex",
    "discover",
    "jcb",
    "diners",
  ];

  for (const user of customers) {
    // Determine user's region based on their first address
    const userAddress = await prisma.address.findFirst({
      where: { userId: user.id },
    });

    let userRegion = "global";
    if (userAddress) {
      if (
        [
          "Germany",
          "France",
          "Spain",
          "Italy",
          "Netherlands",
          "Sweden",
          "Switzerland",
          "United Kingdom",
        ].includes(userAddress.country)
      ) {
        userRegion = "europe";
      } else if (
        ["Japan", "China", "India", "South Korea", "Singapore"].includes(
          userAddress.country
        )
      ) {
        userRegion = "asia";
      } else if (
        ["United States", "Canada", "Brazil", "Mexico"].includes(
          userAddress.country
        )
      ) {
        userRegion = "americas";
      } else if (
        ["United Arab Emirates", "Saudi Arabia"].includes(userAddress.country)
      ) {
        userRegion = "middleEast";
      }
    }

    // Each user has 1-3 payment methods
    const methodCount = faker.number.int({ min: 1, max: 3 });

    // Always add a credit card as the first payment method
    const creditCard = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type: "credit_card",
        isDefault: true,
        provider: "stripe",
        tokenId: `tok_${faker.string.alphanumeric(24)}`,
        cardBrand: faker.helpers.arrayElement(cardBrands),
        cardLast4: faker.finance.creditCardNumber("####"),
        cardExpMonth: faker.number.int({ min: 1, max: 12 }),
        cardExpYear: faker.number.int({
          min: new Date().getFullYear(),
          max: new Date().getFullYear() + 5,
        }),
        isActive: true,
      },
    });

    paymentMethods.push(creditCard);

    // Maybe add additional payment methods
    if (methodCount > 1) {
      // Get regional payment options
      const availableProviders =
        paymentProviders[userRegion as keyof typeof paymentProviders] ||
        paymentProviders.global;

      // Filter out credit card (stripe) since we already added it
      const otherProviders = availableProviders.filter((p) => p !== "stripe");

      for (let i = 1; i < methodCount; i++) {
        const providerType = faker.helpers.arrayElement(otherProviders);

        const paymentMethod = await prisma.paymentMethod.create({
          data: {
            userId: user.id,
            type: providerType,
            isDefault: false,
            provider: providerType,
            tokenId: `tok_${providerType}_${faker.string.alphanumeric(24)}`,
            isActive: true,
          },
        });

        paymentMethods.push(paymentMethod);
      }
    }
  }

  return paymentMethods;
}

// Function to seed orders
async function seedOrders(
  users: any[],
  products: any[],
  addresses: any[],
  paymentMethods: any[]
) {
  const orders = [];

  // Create orders for customer users (60% of customers have orders)
  const customers = users.filter((user) => user.role === UserRole.CUSTOMER);
  const customersWithOrders = faker.helpers.arrayElements(
    customers,
    Math.floor(customers.length * 0.6)
  );

  let orderCounter = 10000; // Starting order number

  for (const user of customersWithOrders) {
    // Each user has 1-5 orders
    const orderCount = faker.number.int({ min: 1, max: 5 });

    // Get user addresses and payment methods
    const userAddresses = await prisma.address.findMany({
      where: { userId: user.id },
    });

    const userPaymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
    });

    // Skip if user has no addresses or payment methods
    if (userAddresses.length === 0 || userPaymentMethods.length === 0) continue;

    // Generate orders for this user
    for (let i = 0; i < orderCount; i++) {
      // Generate order date (more recent orders are more likely)
      const orderDate = faker.date.recent({ days: 180 * (i + 1) });

      // Select currency based on user's preferences or address country
      const userPreferences = user.preferences as any;
      let currency = "USD";

      if (userPreferences && userPreferences.currency) {
        currency = userPreferences.currency;
      } else if (userAddresses.length > 0) {
        // Map country to likely currency
        const country = userAddresses[0].country;
        if (
          ["Germany", "France", "Spain", "Italy", "Netherlands"].includes(
            country
          )
        ) {
          currency = "EUR";
        } else if (country === "United Kingdom") {
          currency = "GBP";
        } else if (country === "Japan") {
          currency = "JPY";
        } else if (country === "China") {
          currency = "CNY";
        } else if (country === "Canada") {
          currency = "CAD";
        } else if (country === "Australia") {
          currency = "AUD";
        } else if (country === "Brazil") {
          currency = "BRL";
        } else if (country === "India") {
          currency = "INR";
        }
      }

      // Pick addresses
      const shippingAddress = faker.helpers.arrayElement(userAddresses);
      const billingAddress = faker.datatype.boolean(0.7)
        ? shippingAddress
        : faker.helpers.arrayElement(userAddresses);

      // Pick payment method
      const paymentMethod = faker.helpers.arrayElement(userPaymentMethods);

      // Determine order status based on date
      let status: OrderStatus;
      const daysSinceOrder =
        (new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysSinceOrder < 1) {
        status = faker.helpers.arrayElement([
          OrderStatus.PENDING,
          OrderStatus.PROCESSING,
        ]);
      } else if (daysSinceOrder < 3) {
        status = faker.helpers.arrayElement([
          OrderStatus.PROCESSING,
          OrderStatus.SHIPPED,
        ]);
      } else if (daysSinceOrder < 7) {
        status = faker.helpers.arrayElement([
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
        ]);
      } else {
        status = faker.helpers.arrayElement(
          [
            OrderStatus.DELIVERED,
            OrderStatus.COMPLETED,
            OrderStatus.CANCELED,
            OrderStatus.REFUNDED,
          ],
          { weights: [70, 20, 5, 5] }
        );
      }

      // Generate unique order number
      orderCounter++;
      const orderNumber = `ORD-${orderDate.getFullYear()}${String(
        orderDate.getMonth() + 1
      ).padStart(2, "0")}-${orderCounter}`;

      // Create order with no items yet
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          orderNumber: orderNumber,
          email: user.email,
          status: status,
          currencyCode: currency,
          subtotal: 0, // Will calculate after adding items
          discountTotal: 0,
          taxTotal: 0,
          shippingTotal: 0,
          grandTotal: 0, // Will calculate after adding items
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddress.id,
          shippingMethod: faker.helpers.arrayElement([
            "Standard Shipping",
            "Express Shipping",
            "Next Day Delivery",
            "International Shipping",
          ]),
          paymentMethod: paymentMethod.type,
          notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
          customerNote: faker.datatype.boolean(0.2)
            ? faker.lorem.sentence()
            : null,
          adminNote: faker.datatype.boolean(0.1)
            ? faker.lorem.sentence()
            : null,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          couponCodes: faker.datatype.boolean(0.3)
            ? faker.helpers.arrayElement(["WELCOME10", "SUMMER25", "FREESHIP"])
            : null,
          createdAt: orderDate,
          updatedAt: faker.date.between({ from: orderDate, to: new Date() }),
          canceledAt:
            status === OrderStatus.CANCELED
              ? faker.date.between({ from: orderDate, to: new Date() })
              : null,
        },
      });

      // Add 1-5 items to the order
      const itemCount = faker.number.int({ min: 1, max: 5 });
      let subtotal = 0;

      for (let j = 0; j < itemCount; j++) {
        // Select a random product
        const product = faker.helpers.arrayElement(products);

        // Check if product has variants
        const variants = await prisma.productVariant.findMany({
          where: { productId: product.id },
        });

        let variant = null;
        if (variants.length > 0 && faker.datatype.boolean(0.7)) {
          variant = faker.helpers.arrayElement(variants);
        }

        // Determine quantity and price
        const quantity = faker.number.int({ min: 1, max: 3 });
        const unitPrice = variant ? variant.price : product.price;
        const itemSubtotal = unitPrice * quantity;

        // Add to order subtotal
        subtotal += Number(itemSubtotal);

        // Create order item
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            variantId: variant ? variant.id : null,
            name: variant ? variant.name : product.name,
            sku: variant ? variant.sku : product.sku,
            quantity: quantity,
            unitPrice: unitPrice,
            subtotal: itemSubtotal,
            tax: itemSubtotal * 0.1, // 10% tax rate
            discount: 0,
            total: itemSubtotal + itemSubtotal * 0.1, // Subtotal + tax
            productData: {
              productName: product.name,
              brandName: product.brandId
                ? (
                    await prisma.brand.findUnique({
                      where: { id: product.brandId },
                    })
                  )?.name
                : null,
              productSlug: product.slug,
              productImage:
                (
                  await prisma.productImage.findFirst({
                    where: { productId: product.id, isThumbnail: true },
                  })
                )?.url || null,
            },
          },
        });
      }

      // Calculate order totals
      const discountTotal = order.couponCodes ? subtotal * 0.1 : 0; // 10% discount if coupon applied
      const taxTotal = subtotal * 0.1; // 10% tax rate
      const shippingTotal = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const grandTotal = subtotal - discountTotal + taxTotal + shippingTotal;

      // Update order with calculated totals
      await prisma.order.update({
        where: { id: order.id },
        data: {
          subtotal: subtotal,
          discountTotal: discountTotal,
          taxTotal: taxTotal,
          shippingTotal: shippingTotal,
          grandTotal: grandTotal,
        },
      });

      // Create transaction for the order
      let transactionStatus: TransactionStatus;
      if (status === OrderStatus.CANCELED || status === OrderStatus.FAILED) {
        transactionStatus = TransactionStatus.FAILURE;
      } else if (status === OrderStatus.REFUNDED) {
        transactionStatus = TransactionStatus.SUCCESS;
      } else {
        transactionStatus = TransactionStatus.SUCCESS;
      }

      await prisma.transaction.create({
        data: {
          orderId: order.id,
          paymentMethodId: paymentMethod.id,
          type: TransactionType.PAYMENT,
          status: transactionStatus,
          amount: grandTotal,
          currency: currency,
          providerTransactionId: `txn_${faker.string.alphanumeric(24)}`,
          providerResponse: {
            success: transactionStatus === TransactionStatus.SUCCESS,
            message:
              transactionStatus === TransactionStatus.SUCCESS
                ? "Payment successful"
                : "Payment failed",
            timestamp: new Date().toISOString(),
          },
          createdAt: orderDate,
          updatedAt: orderDate,
        },
      });

      // For refunded orders, add a refund transaction
      if (status === OrderStatus.REFUNDED) {
        await prisma.transaction.create({
          data: {
            orderId: order.id,
            paymentMethodId: paymentMethod.id,
            type: TransactionType.REFUND,
            status: TransactionStatus.SUCCESS,
            amount: grandTotal,
            currency: currency,
            providerTransactionId: `ref_${faker.string.alphanumeric(24)}`,
            providerResponse: {
              success: true,
              message: "Refund processed successfully",
              timestamp: new Date().toISOString(),
            },
            createdAt: faker.date.between({ from: orderDate, to: new Date() }),
            updatedAt: faker.date.between({ from: orderDate, to: new Date() }),
          },
        });
      }

      // Add order status updates
      await addOrderStatusUpdates(order.id, status, orderDate);

      orders.push(order);
    }
  }

  return orders;
}

// Helper function to add order status updates
async function addOrderStatusUpdates(
  orderId: string,
  currentStatus: OrderStatus,
  orderDate: Date
) {
  const statusSequence: { [key in OrderStatus]?: OrderStatus[] } = {
    [OrderStatus.PENDING]: [OrderStatus.PENDING],
    [OrderStatus.PROCESSING]: [OrderStatus.PENDING, OrderStatus.PROCESSING],
    [OrderStatus.ON_HOLD]: [OrderStatus.PENDING, OrderStatus.ON_HOLD],
    [OrderStatus.SHIPPED]: [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
    ],
    [OrderStatus.DELIVERED]: [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ],
    [OrderStatus.COMPLETED]: [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.COMPLETED,
    ],
    [OrderStatus.CANCELED]: [OrderStatus.PENDING, OrderStatus.CANCELED],
    [OrderStatus.REFUNDED]: [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.REFUNDED,
    ],
    [OrderStatus.FAILED]: [OrderStatus.PENDING, OrderStatus.FAILED],
  };

  const statuses = statusSequence[currentStatus] || [currentStatus];

  // Get random admin or system for status updates
  const adminUsers = await prisma.user.findMany({
    where: { role: { in: [UserRole.ADMIN, UserRole.STAFF] } },
    select: { id: true },
  });

  const creators = [...adminUsers.map((admin) => admin.id), "system"];

  // Create status updates
  for (let i = 0; i < statuses.length; i++) {
    const status = statuses[i];
    const updateDate = new Date(orderDate);
    updateDate.setHours(
      updateDate.getHours() + i * faker.number.int({ min: 1, max: 24 })
    );

    await prisma.orderStatusUpdate.create({
      data: {
        orderId: orderId,
        status: status,
        comment: getStatusUpdateComment(status),
        createdBy: faker.helpers.arrayElement(creators),
        createdAt: updateDate,
      },
    });
  }
}

// Helper function to generate status update comments
function getStatusUpdateComment(status: OrderStatus): string {
  switch (status) {
    case OrderStatus.PENDING:
      return faker.helpers.arrayElement([
        "Order received, awaiting payment confirmation.",
        "Thank you for your order! We're processing it now.",
        "Order placed successfully.",
      ]);
    case OrderStatus.PROCESSING:
      return faker.helpers.arrayElement([
        "Payment confirmed, preparing your items for shipment.",
        "Your order is being processed and will be shipped soon.",
        "Order processing has begun.",
      ]);
    case OrderStatus.ON_HOLD:
      return faker.helpers.arrayElement([
        "Order placed on hold pending inventory check.",
        "Additional verification required, our team will contact you shortly.",
        "Order temporarily on hold.",
      ]);
    case OrderStatus.SHIPPED:
      return faker.helpers.arrayElement([
        "Your order has been shipped! Tracking information has been sent.",
        "Order shipped via " +
          faker.helpers.arrayElement(["DHL", "FedEx", "UPS", "USPS"]),
        "All items shipped successfully.",
      ]);
    case OrderStatus.DELIVERED:
      return faker.helpers.arrayElement([
        "Order delivered successfully.",
        "Delivery confirmed. Thank you for shopping with us!",
        "Your order has been delivered. Enjoy!",
      ]);
    case OrderStatus.COMPLETED:
      return faker.helpers.arrayElement([
        "Order fulfilled and completed. Thank you for your business!",
        "Order completed successfully.",
        "All items delivered and order marked as complete.",
      ]);
    case OrderStatus.CANCELED:
      return faker.helpers.arrayElement([
        "Order canceled as requested.",
        "Order has been canceled. Refund will be processed shortly.",
        "Order canceled due to inventory issues.",
      ]);
    case OrderStatus.REFUNDED:
      return faker.helpers.arrayElement([
        "Full refund processed. Amount should appear in your account within 3-5 business days.",
        "Refund completed successfully.",
        "Order refunded as requested.",
      ]);
    case OrderStatus.FAILED:
      return faker.helpers.arrayElement([
        "Payment failed. Please try again or use an alternative payment method.",
        "Order processing failed. Our team has been notified.",
        "Unable to complete transaction.",
      ]);
    default:
      return "Status updated.";
  }
}

// Function to seed reviews
async function seedReviews(users: any[], products: any[]) {
  const reviews = [];

  // Create reviews for products (40% of products have reviews)
  const productsWithReviews = faker.helpers.arrayElements(
    products,
    Math.floor(products.length * 0.4)
  );

  // Get customer users for reviews
  const customers = users.filter((user) => user.role === UserRole.CUSTOMER);

  // Multi-language review templates
  const reviewTemplates = {
    en: {
      positive: [
        "Excellent quality product! I'm very satisfied with my purchase.",
        "Exactly what I was looking for. Shipped quickly and works perfectly.",
        "Great value for money, would definitely recommend to others.",
        "Superior craftsmanship and attention to detail. Very impressed!",
        "Fantastic product that exceeded my expectations. Will buy again!",
      ],
      neutral: [
        "Decent product for the price, but nothing special.",
        "It works as described, but I expected better quality.",
        "Average product. Does the job but has some minor issues.",
        "Acceptable quality but took longer than expected to arrive.",
        "Not bad, but I've seen better options for similar prices.",
      ],
      negative: [
        "Disappointed with the quality. Not worth the price.",
        "Product arrived damaged and customer service was unhelpful.",
        "Does not match the description or photos. Would not recommend.",
        "Poor quality materials and construction. Avoid this product.",
        "Complete waste of money. Stopped working after a few days.",
      ],
    },
    es: {
      positive: [
        "¡Producto de excelente calidad! Estoy muy satisfecho con mi compra.",
        "Exactamente lo que estaba buscando. Envío rápido y funciona perfectamente.",
        "Gran relación calidad-precio, definitivamente lo recomendaría a otros.",
      ],
      neutral: [
        "Producto decente por el precio, pero nada especial.",
        "Funciona como se describe, pero esperaba mejor calidad.",
        "Producto promedio. Hace el trabajo pero tiene algunos problemas menores.",
      ],
      negative: [
        "Decepcionado con la calidad. No vale el precio.",
        "El producto llegó dañado y el servicio al cliente no fue de ayuda.",
        "No coincide con la descripción o las fotos. No lo recomendaría.",
      ],
    },
    fr: {
      positive: [
        "Produit d'excellente qualité ! Je suis très satisfait de mon achat.",
        "Exactement ce que je cherchais. Expédié rapidement et fonctionne parfaitement.",
        "Excellent rapport qualité-prix, je le recommanderais certainement à d'autres.",
      ],
      neutral: [
        "Produit décent pour le prix, mais rien de spécial.",
        "Il fonctionne comme décrit, mais je m'attendais à une meilleure qualité.",
        "Produit moyen. Fait le travail mais présente quelques problèmes mineurs.",
      ],
      negative: [
        "Déçu par la qualité. Ne vaut pas le prix.",
        "Le produit est arrivé endommagé et le service client n'a pas été utile.",
        "Ne correspond pas à la description ou aux photos. Je ne recommanderais pas.",
      ],
    },
    de: {
      positive: [
        "Produkt von ausgezeichneter Qualität! Ich bin mit meinem Kauf sehr zufrieden.",
        "Genau das, wonach ich gesucht habe. Schnell versendet und funktioniert einwandfrei.",
        "Gutes Preis-Leistungs-Verhältnis, würde ich definitiv anderen empfehlen.",
      ],
      neutral: [
        "Anständiges Produkt für den Preis, aber nichts Besonderes.",
        "Es funktioniert wie beschrieben, aber ich hatte eine bessere Qualität erwartet.",
        "Durchschnittliches Produkt. Erledigt seinen Zweck, hat aber einige kleine Probleme.",
      ],
      negative: [
        "Von der Qualität enttäuscht. Nicht den Preis wert.",
        "Produkt kam beschädigt an und der Kundenservice war nicht hilfreich.",
        "Entspricht nicht der Beschreibung oder den Fotos. Würde ich nicht empfehlen.",
      ],
    },
    zh: {
      positive: [
        "产品质量极佳！我对我的购买非常满意。",
        "正是我所寻找的。快速发货，完美运行。",
        "物超所值，绝对推荐给其他人。",
      ],
      neutral: [
        "价格合适的产品，但没什么特别之处。",
        "它按照描述工作，但我期望更好的质量。",
        "一般产品。能完成工作但有一些小问题。",
      ],
      negative: [
        "对质量感到失望。不值这个价格。",
        "产品到达时已损坏，客户服务也没有帮助。",
        "与描述或照片不符。不推荐。",
      ],
    },
  };

  for (const product of productsWithReviews) {
    // Each product has 3-15 reviews
    const reviewCount = faker.number.int({ min: 3, max: 15 });

    // Select random customers to review this product
    const reviewers = faker.helpers.arrayElements(customers, reviewCount);

    for (let i = 0; i < reviewers.length; i++) {
      const user = reviewers[i];

      // Determine review rating distribution (mostly positive)
      let rating: number;
      const ratingDist = faker.number.int(100);
      if (ratingDist < 60) {
        // 60% chance for 4-5 stars
        rating = faker.helpers.arrayElement([4, 5]);
      } else if (ratingDist < 85) {
        // 25% chance for 3 stars
        rating = 3;
      } else {
        // 15% chance for 1-2 stars
        rating = faker.helpers.arrayElement([1, 2]);
      }

      // Determine review content based on rating
      let reviewType: "positive" | "neutral" | "negative";
      if (rating >= 4) reviewType = "positive";
      else if (rating === 3) reviewType = "neutral";
      else reviewType = "negative";

      // Determine review language based on user preferences
      const userPreferences = user.preferences as any;
      let language = "en";

      if (userPreferences && userPreferences.language) {
        language = userPreferences.language;
      }

      // Default to English if the language is not supported in our templates
      if (!reviewTemplates[language as keyof typeof reviewTemplates]) {
        language = "en";
      }

      // Get templates for the selected language and review type
      const templates =
        reviewTemplates[language as keyof typeof reviewTemplates][reviewType];

      // Generate review content
      const reviewComment = faker.helpers.arrayElement(templates);

      // Create review
      const review = await prisma.review.create({
        data: {
          productId: product.id,
          userId: user.id,
          rating: rating,
          title:
            rating >= 4
              ? faker.helpers.arrayElement([
                  "Love it!",
                  "Great product",
                  "Highly recommend",
                  "Fantastic purchase",
                ])
              : rating === 3
              ? faker.helpers.arrayElement([
                  "Decent",
                  "Average",
                  "Not bad",
                  "Good enough",
                ])
              : faker.helpers.arrayElement([
                  "Disappointed",
                  "Not worth it",
                  "Would not recommend",
                  "Poor quality",
                ]),
          comment: reviewComment,
          isVerified: faker.datatype.boolean(0.8), // 80% are verified purchases
          isApproved: faker.datatype.boolean(0.9), // 90% are approved
          createdAt: faker.date.past(),
        },
      });

      reviews.push(review);

      // Add helpful marks to reviews (for some reviews)
      if (faker.datatype.boolean(0.4)) {
        // 40% of reviews get helpful marks
        const helpfulCount = faker.number.int({ min: 1, max: 10 });
        const helpfulUsers = faker.helpers.arrayElements(
          customers.filter((c) => c.id !== user.id), // Exclude the reviewer
          helpfulCount
        );

        for (const helpfulUser of helpfulUsers) {
          await prisma.reviewHelpful.create({
            data: {
              reviewId: review.id,
              userId: helpfulUser.id,
            },
          });
        }
      }

      // Add report for some negative reviews
      if (rating <= 2 && faker.datatype.boolean(0.3)) {
        // 30% of negative reviews get reported
        const reportUser = faker.helpers.arrayElement(
          customers.filter((c) => c.id !== user.id) // Exclude the reviewer
        );

        await prisma.reviewReport.create({
          data: {
            reviewId: review.id,
            userId: reportUser.id,
            reason: faker.helpers.arrayElement([
              "Inappropriate language",
              "Not relevant to the product",
              "Contains false information",
              "Spam",
            ]),
            status: faker.helpers.arrayElement([
              ReportStatus.PENDING,
              ReportStatus.REVIEWED,
              ReportStatus.REJECTED,
              ReportStatus.ACCEPTED,
            ]),
          },
        });
      }
    }
  }

  return reviews;
}

// Function to seed wishlists
async function seedWishlists(users: any[], products: any[]) {
  const wishlists = [];

  // Create wishlists for customer users (50% of customers have wishlists)
  const customers = users.filter((user) => user.role === UserRole.CUSTOMER);
  const customersWithWishlists = faker.helpers.arrayElements(
    customers,
    Math.floor(customers.length * 0.5)
  );

  for (const user of customersWithWishlists) {
    // Create wishlist
    const wishlist = await prisma.wishlist.create({
      data: {
        userId: user.id,
      },
    });

    wishlists.push(wishlist);

    // Add 1-10 random products to wishlist
    const wishlistItemCount = faker.number.int({ min: 1, max: 10 });
    const wishlistProducts = faker.helpers.arrayElements(
      products,
      wishlistItemCount
    );

    for (const product of wishlistProducts) {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId: product.id,
        },
      });
    }

    // Add notifications for price changes on some wishlist items (if any)
    if (wishlistProducts.length > 0 && faker.datatype.boolean(0.3)) {
      const notifiedProduct = faker.helpers.arrayElement(wishlistProducts);

      await prisma.notification.create({
        data: {
          userId: user.id,
          type: NotificationType.WISHLIST_PRICE_CHANGE,
          title: "Price Drop Alert!",
          message: `The price of ${notifiedProduct.name} has been reduced. Check it out now!`,
          isRead: faker.datatype.boolean(0.5),
          data: {
            productId: notifiedProduct.id,
            productName: notifiedProduct.name,
            oldPrice: parseFloat((notifiedProduct.price * 1.2).toFixed(2)),
            newPrice: parseFloat(notifiedProduct.price.toString()),
            discount: 20, // 20% off
          },
          createdAt: faker.date.recent({ days: 10 }),
          readAt: faker.datatype.boolean(0.5)
            ? faker.date.recent({ days: 5 })
            : null,
        },
      });
    }
  }

  return wishlists;
}

// Function to seed carts
async function seedCarts(users: any[], products: any[]) {
  const carts = [];

  // Create carts for customer users (30% of customers have active carts)
  const customers = users.filter((user) => user.role === UserRole.CUSTOMER);
  const customersWithCarts = faker.helpers.arrayElements(
    customers,
    Math.floor(customers.length * 0.3)
  );

  for (const user of customersWithCarts) {
    // Get user currency preference
    const userPreferences = user.preferences as any;
    let currencyCode = "USD";

    if (userPreferences && userPreferences.currency) {
      currencyCode = userPreferences.currency;
    }

    // Create cart
    const cart = await prisma.cart.create({
      data: {
        userId: user.id,
        currencyCode: currencyCode,
        // All zeros initially, will update after adding items
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        shippingTotal: 0,
        grandTotal: 0,
      },
    });

    carts.push(cart);

    // Add 1-5 random products to cart
    const cartItemCount = faker.number.int({ min: 1, max: 5 });
    let subtotal = 0;

    for (let i = 0; i < cartItemCount; i++) {
      // Select random product
      const product = faker.helpers.arrayElement(products);

      // Check if product has variants
      const variants = await prisma.productVariant.findMany({
        where: { productId: product.id },
      });

      let variant = null;
      if (variants.length > 0 && faker.datatype.boolean(0.7)) {
        variant = faker.helpers.arrayElement(variants);
      }

      // Determine quantity and price
      const quantity = faker.number.int({ min: 1, max: 3 });
      const price = variant ? variant.price : product.price;
      const itemSubtotal = price * quantity;

      // Add to cart subtotal
      subtotal += Number(itemSubtotal);

      // Create cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant ? variant.id : null,
          quantity: quantity,
          price: price,
          // Some items have discounted price
          discountedPrice: faker.datatype.boolean(0.3) ? price * 0.9 : null,
        },
      });
    }

    // Apply coupon to some carts
    const hasCoupon = faker.datatype.boolean(0.4); // 40% of carts have coupons
    let discountTotal = 0;

    if (hasCoupon) {
      const couponCode = faker.helpers.arrayElement([
        "WELCOME10",
        "SUMMER25",
        "FREESHIP",
      ]);
      let discountAmount = 0;

      switch (couponCode) {
        case "WELCOME10":
          discountAmount = subtotal * 0.1; // 10% off
          break;
        case "SUMMER25":
          discountAmount = subtotal * 0.25; // 25% off
          break;
        case "FREESHIP":
          discountAmount = 10; // $10 shipping fee waived
          break;
      }

      discountTotal = discountAmount;

      await prisma.cartCoupon.create({
        data: {
          cartId: cart.id,
          couponCode: couponCode,
          discountAmount: discountAmount,
        },
      });
    }

    // Calculate cart totals
    const taxTotal = subtotal * 0.1; // 10% tax rate
    const shippingTotal = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const grandTotal = subtotal - discountTotal + taxTotal + shippingTotal;

    // Update cart with calculated totals
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotal: subtotal,
        discountTotal: discountTotal,
        taxTotal: taxTotal,
        shippingTotal: shippingTotal,
        grandTotal: grandTotal,
      },
    });
  }

  // Create some guest carts (not linked to users)
  const guestCartCount = 20;

  for (let i = 0; i < guestCartCount; i++) {
    // Generate session ID for guest cart
    const sessionId = `sess_${faker.string.alphanumeric(32)}`;

    // Randomly select a currency
    const currencyCode = faker.helpers.arrayElement(currencies).code;

    // Create guest cart
    const cart = await prisma.cart.create({
      data: {
        sessionId: sessionId,
        currencyCode: currencyCode,
        // All zeros initially, will update after adding items
        subtotal: 0,
        discountTotal: 0,
        taxTotal: 0,
        shippingTotal: 0,
        grandTotal: 0,
      },
    });

    carts.push(cart);

    // Add 1-3 random products to guest cart
    const cartItemCount = faker.number.int({ min: 1, max: 3 });
    let subtotal = 0;

    for (let j = 0; j < cartItemCount; j++) {
      // Select random product
      const product = faker.helpers.arrayElement(products);

      // Determine quantity and price
      const quantity = faker.number.int({ min: 1, max: 2 });
      const price = product.price;
      const itemSubtotal = price * quantity;

      // Add to cart subtotal
      subtotal += Number(itemSubtotal);

      // Create cart item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: null,
          quantity: quantity,
          price: price,
          discountedPrice: null,
        },
      });
    }

    // Calculate cart totals (no coupons for guest carts)
    const taxTotal = subtotal * 0.1; // 10% tax rate
    const shippingTotal = subtotal > 100 ? 0 : 10; // Free shipping over $100
    const grandTotal = subtotal + taxTotal + shippingTotal;

    // Update cart with calculated totals
    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        subtotal: subtotal,
        taxTotal: taxTotal,
        shippingTotal: shippingTotal,
        grandTotal: grandTotal,
      },
    });
  }

  return carts;
}

// Function to seed banners
async function seedBanners(users: any[]) {
  const banners = [];

  // Get admin user for banner creation
  const adminUser = users.find((user) => user.role === UserRole.ADMIN);

  // Banner data with multilingual support
  const bannerData = [
    // Hero banners
    {
      title: "Summer Collection 2025",
      subtitle: "Discover the latest trends",
      description:
        "Shop our new arrivals for the summer season with styles from around the world",
      ctaText: "Shop Now",
      ctaLink: "/collections/summer-2025",
      imageUrl: "https://example.com/banners/summer-collection-2025.jpg",
      mobileImageUrl:
        "https://example.com/banners/mobile/summer-collection-2025.jpg",
      position: "center",
      color: "bg-blue-100",
      textColor: "text-blue-900",
      buttonVariant: "default",
      type: BannerType.HERO,
      sortOrder: 1,
      translations: {
        es: {
          title: "Colección Verano 2025",
          subtitle: "Descubre las últimas tendencias",
          description:
            "Compra nuestras novedades para la temporada de verano con estilos de todo el mundo",
          ctaText: "Comprar Ahora",
        },
        fr: {
          title: "Collection Été 2025",
          subtitle: "Découvrez les dernières tendances",
          description:
            "Achetez nos nouveautés pour la saison estivale avec des styles du monde entier",
          ctaText: "Acheter Maintenant",
        },
      },
    },
    {
      title: "Global Artisan Collection",
      subtitle: "Handcrafted with love",
      description:
        "Unique items created by skilled artisans from across the globe",
      ctaText: "Explore Collection",
      ctaLink: "/collections/global-artisan",
      imageUrl: "https://example.com/banners/global-artisan.jpg",
      mobileImageUrl: "https://example.com/banners/mobile/global-artisan.jpg",
      position: "right",
      color: "bg-amber-100",
      textColor: "text-amber-900",
      buttonVariant: "outline",
      type: BannerType.HERO,
      sortOrder: 2,
      translations: {
        es: {
          title: "Colección de Artesanos Globales",
          subtitle: "Hecho a mano con amor",
          description:
            "Artículos únicos creados por artesanos calificados de todo el mundo",
          ctaText: "Explorar Colección",
        },
        zh: {
          title: "全球工匠系列",
          subtitle: "用爱手工制作",
          description: "由全球熟练工匠创造的独特物品",
          ctaText: "探索系列",
        },
      },
    },

    // Promo banners
    {
      title: "Flash Sale!",
      subtitle: "24 Hours Only",
      description: "Up to 50% off select items. Hurry while supplies last!",
      ctaText: "Shop Sale",
      ctaLink: "/sales/flash",
      imageUrl: "https://example.com/banners/flash-sale.jpg",
      mobileImageUrl: "https://example.com/banners/mobile/flash-sale.jpg",
      position: "left",
      color: "bg-red-100",
      textColor: "text-red-900",
      buttonVariant: "default",
      type: BannerType.PROMO,
      sortOrder: 1,
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
      translations: {
        ja: {
          title: "フラッシュセール！",
          subtitle: "24時間限定",
          description: "対象商品が最大50%オフ。在庫がなくなり次第終了！",
          ctaText: "セールをチェック",
        },
      },
    },
    {
      title: "Free Worldwide Shipping",
      subtitle: "On all orders over $100",
      description: "Limited time offer. Exclusions may apply.",
      ctaText: "Learn More",
      ctaLink: "/shipping-info",
      imageUrl: "https://example.com/banners/free-shipping.jpg",
      mobileImageUrl: "https://example.com/banners/mobile/free-shipping.jpg",
      position: "center",
      color: "bg-green-100",
      textColor: "text-green-900",
      buttonVariant: "outline",
      type: BannerType.PROMO,
      sortOrder: 2,
      translations: {
        de: {
          title: "Kostenloser weltweiter Versand",
          subtitle: "Für alle Bestellungen über 100 €",
          description:
            "Zeitlich begrenztes Angebot. Ausschlüsse können gelten.",
          ctaText: "Mehr Erfahren",
        },
      },
    },

    // Category banners
    {
      title: "Asian-Inspired Fashion",
      subtitle: "Tradition meets modern design",
      description:
        "Explore our collection of clothing inspired by Asian craftsmanship and design",
      ctaText: "View Collection",
      ctaLink: "/collections/asian-inspired",
      imageUrl: "https://example.com/banners/asian-fashion.jpg",
      mobileImageUrl: "https://example.com/banners/mobile/asian-fashion.jpg",
      position: "right",
      color: "bg-indigo-100",
      textColor: "text-indigo-900",
      buttonVariant: "default",
      type: BannerType.CATEGORY,
      sortOrder: 1,
      translations: {
        zh: {
          title: "亚洲风格时尚",
          subtitle: "传统与现代设计的结合",
          description: "探索我们受亚洲工艺和设计启发的服装系列",
          ctaText: "查看系列",
        },
        ja: {
          title: "アジアにインスパイアされたファッション",
          subtitle: "伝統と現代デザインの融合",
          description:
            "アジアの職人技とデザインにインスパイアされた衣類コレクションをご覧ください",
          ctaText: "コレクションを見る",
        },
      },
    },
    {
      title: "European Luxury",
      subtitle: "Timeless elegance from Europe's finest brands",
      description:
        "Discover premium products crafted with European heritage and excellence",
      ctaText: "Shop Luxury",
      ctaLink: "/collections/european-luxury",
      imageUrl: "https://example.com/banners/european-luxury.jpg",
      mobileImageUrl: "https://example.com/banners/mobile/european-luxury.jpg",
      position: "left",
      color: "bg-gray-100",
      textColor: "text-gray-900",
      buttonVariant: "ghost",
      type: BannerType.CATEGORY,
      sortOrder: 2,
      translations: {
        fr: {
          title: "Luxe Européen",
          subtitle: "Élégance intemporelle des meilleures marques européennes",
          description:
            "Découvrez des produits premium fabriqués avec le patrimoine et l'excellence européens",
          ctaText: "Acheter Luxe",
        },
        de: {
          title: "Europäischer Luxus",
          subtitle: "Zeitlose Eleganz von Europas feinsten Marken",
          description:
            "Entdecken Sie Premium-Produkte, die mit europäischem Erbe und Exzellenz hergestellt wurden",
          ctaText: "Luxus Einkaufen",
        },
      },
    },
  ];

  for (const data of bannerData) {
    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        ctaText: data.ctaText,
        ctaLink: data.ctaLink,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl,
        position: data.position,
        color: data.color,
        textColor: data.textColor,
        buttonVariant: data.buttonVariant,
        isActive: true,
        sortOrder: data.sortOrder,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        createdBy: adminUser?.id,
      },
    });

    banners.push(banner);
  }

  return banners;
}

// Function to seed settings
async function seedSettings() {
  // Global store settings
  await prisma.setting.create({
    data: {
      id: "store",
      value: {
        name: "Global Marketplace",
        description:
          "An international marketplace for unique products from around the world",
        email: "support@globalmarketplace.example.com",
        phone: "+1-800-123-4567",
        address: {
          street: "123 Commerce St",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "United States",
        },
        social: {
          facebook: "https://facebook.com/globalmarketplace",
          instagram: "https://instagram.com/globalmarketplace",
          twitter: "https://twitter.com/globalmarketplace",
          youtube: "https://youtube.com/globalmarketplace",
        },
        logo: {
          url: "https://example.com/logo.png",
          altText: "Global Marketplace Logo",
        },
        favicon: "https://example.com/favicon.ico",
      },
    },
  });

  // Currency settings
  await prisma.setting.create({
    data: {
      id: "currencies",
      value: currencies,
    },
  });

  // Language settings
  await prisma.setting.create({
    data: {
      id: "languages",
      value: [
        { code: "en", name: "English", isDefault: true },
        { code: "es", name: "Español", isDefault: false },
        { code: "fr", name: "Français", isDefault: false },
        { code: "de", name: "Deutsch", isDefault: false },
        { code: "zh", name: "中文", isDefault: false },
        { code: "ja", name: "日本語", isDefault: false },
        { code: "ar", name: "العربية", isDefault: false },
        { code: "pt", name: "Português", isDefault: false },
        { code: "ru", name: "Русский", isDefault: false },
        { code: "hi", name: "हिन्दी", isDefault: false },
      ],
    },
  });

  // Shipping settings
  await prisma.setting.create({
    data: {
      id: "shipping",
      value: {
        methods: [
          {
            id: "standard",
            name: "Standard Shipping",
            description: "Delivery in 3-5 business days",
            price: 10.0,
            freeThreshold: 100.0,
            countries: ["*"], // Available for all countries
          },
          {
            id: "express",
            name: "Express Shipping",
            description: "Delivery in 1-2 business days",
            price: 20.0,
            freeThreshold: 200.0,
            countries: ["*"], // Available for all countries
          },
          {
            id: "international",
            name: "International Shipping",
            description: "Delivery in 7-14 business days",
            price: 30.0,
            freeThreshold: 300.0,
            countries: ["*"], // Available for all countries
          },
        ],
        restrictions: [
          // Example of country-specific restrictions
          {
            countryCode: "US",
            postalCodePatterns: ["*"], // All postal codes
            methods: ["standard", "express"],
          },
          {
            countryCode: "CA",
            postalCodePatterns: ["*"],
            methods: ["standard", "express", "international"],
          },
        ],
      },
    },
  });

  // Payment settings
  await prisma.setting.create({
    data: {
      id: "payment",
      value: {
        providers: [
          {
            id: "stripe",
            name: "Credit/Debit Card",
            enabled: true,
            test: false,
            supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"],
          },
          {
            id: "paypal",
            name: "PayPal",
            enabled: true,
            test: false,
            supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
          },
          {
            id: "apple_pay",
            name: "Apple Pay",
            enabled: true,
            test: false,
            supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"],
          },
          {
            id: "google_pay",
            name: "Google Pay",
            enabled: true,
            test: false,
            supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD", "JPY"],
          },
          // Regional payment methods
          {
            id: "alipay",
            name: "Alipay",
            enabled: true,
            test: false,
            supportedCurrencies: ["CNY", "USD"],
          },
          {
            id: "wechat_pay",
            name: "WeChat Pay",
            enabled: true,
            test: false,
            supportedCurrencies: ["CNY"],
          },
          {
            id: "klarna",
            name: "Klarna",
            enabled: true,
            test: false,
            supportedCurrencies: ["EUR", "GBP", "USD", "DKK", "NOK", "SEK"],
          },
        ],
      },
    },
  });

  // Tax settings
  await prisma.setting.create({
    data: {
      id: "tax",
      value: {
        rates: [
          { id: "standard", percentage: 10, default: true },
          { id: "reduced", percentage: 5 },
          { id: "zero", percentage: 0 },
        ],
        countryRates: {
          US: { standard: 8.5, reduced: 4, zero: 0 },
          GB: { standard: 20, reduced: 5, zero: 0 },
          DE: { standard: 19, reduced: 7, zero: 0 },
          FR: { standard: 20, reduced: 5.5, zero: 0 },
          JP: { standard: 10, reduced: 8, zero: 0 },
          CA: { standard: 13, reduced: 5, zero: 0 },
          AU: { standard: 10, reduced: 0, zero: 0 },
        },
      },
    },
  });

  // Features and flags
  await prisma.setting.create({
    data: {
      id: "features",
      value: {
        reviews: { enabled: true, requireApproval: true },
        wishlist: { enabled: true },
        compareProducts: { enabled: true },
        guestCheckout: { enabled: true },
        multiCurrency: { enabled: true },
        multiLanguage: { enabled: true },
        inventory: {
          trackInventory: true,
          allowBackorders: false,
          lowStockThreshold: 5,
        },
      },
    },
  });
}

// Updated main function execution code
// Execute seed function
main()
  .catch((e) => {
    console.error("Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log("Disconnecting from database...");
    await prisma.$disconnect();
    console.log("Database seeding completed!");
  });

// main()
//   .catch((e: Error) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
