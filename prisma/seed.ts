import {
  PrismaClient,
  User,
  Address,
  Session,
  Category,
  Brand,
  Attribute,
  Product,
  Cart,
  Wishlist,
  Order,
  PaymentMethod,
  Transaction,
  Notification,
  Coupon,
  Setting,
  UserRole,
  OrderStatus,
  TransactionType,
  TransactionStatus,
  NotificationType,
  CouponType,
} from "@prisma/client";
import { hash } from "bcrypt";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

// Define interfaces for complex return types
// interface AttributeWithValues extends Attribute {
//   values: AttributeValue[];
// }

interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
  displayValue: string;
  colorCode?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
}

interface AttributeForVariant {
  attribute: Attribute;
  values: AttributeValue[];
}

interface VariantCombinationItem {
  attribute: Attribute;
  value: AttributeValue;
}

async function main(): Promise<void> {
  console.log("🌱 Starting seed process...");

  // Clear database tables in reverse order of dependencies
  await clearDatabase();

  // ==================== USER MANAGEMENT ====================
  console.log("Creating users...");
  const users: User[] = await createUsers(50);
  console.log(`✅ Created ${users.length} users`);

  const addresses: Address[] = await createAddresses(users);
  console.log(`✅ Created ${addresses.length} addresses`);

  const sessions: Session[] = await createSessions(users);
  console.log(`✅ Created ${sessions.length} sessions`);

  // ==================== PRODUCT MANAGEMENT ====================
  console.log("Creating product categories...");
  const categories: Category[] = await createCategories();
  console.log(`✅ Created ${categories.length} categories`);

  console.log("Creating brands...");
  const brands: Brand[] = await createBrands();
  console.log(`✅ Created ${brands.length} brands`);

  console.log("Creating attributes and values...");
  const attributes: Attribute[] = await createAttributes();
  console.log(`✅ Created ${attributes.length} attributes`);

  console.log("Creating products...");
  const products: Product[] = await createProducts(
    brands,
    categories,
    attributes
  );
  console.log(`✅ Created ${products.length} products`);

  // ==================== SHOPPING CARTS ====================
  console.log("Creating shopping carts...");
  const carts: Cart[] = await createCarts(users, products);
  console.log(`✅ Created ${carts.length} carts`);

  // ==================== WISHLISTS ====================
  console.log("Creating wishlists...");
  const wishlists: Wishlist[] = await createWishlists(users, products);
  console.log(`✅ Created ${wishlists.length} wishlists`);

  // ==================== ORDERS ====================
  console.log("Creating orders...");
  const orders: Order[] = await createOrders(users, products, addresses);
  console.log(`✅ Created ${orders.length} orders`);

  // ==================== PAYMENT METHODS ====================
  console.log("Creating payment methods...");
  const paymentMethods: PaymentMethod[] = await createPaymentMethods(users);
  console.log(`✅ Created ${paymentMethods.length} payment methods`);

  // ==================== TRANSACTIONS ====================
  console.log("Creating transactions...");
  const transactions: Transaction[] = await createTransactions(
    orders,
    paymentMethods
  );
  console.log(`✅ Created ${transactions.length} transactions`);

  // ==================== NOTIFICATIONS ====================
  console.log("Creating notifications...");
  const notifications: Notification[] = await createNotifications(
    users,
    orders
  );
  console.log(`✅ Created ${notifications.length} notifications`);

  // ==================== COUPONS ====================
  console.log("Creating coupons...");
  const coupons: Coupon[] = await createCoupons();
  console.log(`✅ Created ${coupons.length} coupons`);

  // ==================== SETTINGS ====================
  console.log("Creating settings...");
  //   const settings: Setting[] = await createSettings();
  console.log(`✅ Created settings`);

  console.log("🎉 Seed completed successfully!");
}

async function clearDatabase(): Promise<void> {
  const tablesToClear: string[] = [
    "settings",
    "coupons",
    "notifications",
    "transactions",
    "payment_methods",
    "order_status_updates",
    "order_items",
    "orders",
    "wishlist_items",
    "wishlists",
    "cart_coupons",
    "cart_items",
    "carts",
    "product_variant_images",
    "product_variant_attributes",
    "product_variants",
    "product_images",
    "product_attributes",
    "reviews",
    "product_categories",
    "products",
    "attribute_values",
    "attributes",
    "brands",
    "categories",
    "addresses",
    "sessions",
    "users",
  ];

  for (const table of tablesToClear) {
    await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
  }
}

// ==================== USER MANAGEMENT ====================

async function createUsers(count: number): Promise<User[]> {
  const saltRounds: number = 10;
  const adminPasswordHash: string = await hash("admin123", saltRounds);
  const userPasswordHash: string = await hash("password123", saltRounds);

  // Create admin user
  const admin: User = await prisma.user.create({
    data: {
      email: "admin@example.com",
      firstName: "Admin",
      lastName: "User",
      passwordHash: adminPasswordHash,
      phone: "+12025550108",
      role: "ADMIN" as UserRole,
      emailVerified: true,
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        theme: "dark",
      },
      lastLoginAt: new Date(),
    },
  });

  // Create staff user
  const staff: User = await prisma.user.create({
    data: {
      email: "staff@example.com",
      firstName: "Staff",
      lastName: "User",
      passwordHash: userPasswordHash,
      phone: "+12025550109",
      role: "STAFF" as UserRole,
      emailVerified: true,
      preferences: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        theme: "light",
      },
      lastLoginAt: new Date(),
    },
  });

  // Create regular users
  const regularUsers: User[] = [];

  for (let i = 0; i < count - 2; i++) {
    const firstName: string = faker.person.firstName();
    const lastName: string = faker.person.lastName();

    const user: User = await prisma.user.create({
      data: {
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        firstName,
        lastName,
        passwordHash: userPasswordHash,
        phone: faker.phone.number(),
        role: "CUSTOMER" as UserRole,
        emailVerified: faker.datatype.boolean(0.8),
        preferences: {
          notifications: {
            email: faker.datatype.boolean(0.7),
            sms: faker.datatype.boolean(0.3),
            push: faker.datatype.boolean(0.5),
          },
          theme: faker.helpers.arrayElement(["light", "dark", "system"]),
        },
        lastLoginAt: faker.datatype.boolean(0.7) ? faker.date.recent() : null,
      },
    });

    regularUsers.push(user);
  }

  return [admin, staff, ...regularUsers];
}

async function createAddresses(users: User[]): Promise<Address[]> {
  const addresses: Address[] = [];

  for (const user of users) {
    // Each user gets 1-3 addresses
    const addressCount: number = faker.number.int({ min: 1, max: 3 });

    for (let i = 0; i < addressCount; i++) {
      const isDefault: boolean = i === 0; // First address is default

      const address: Address = await prisma.address.create({
        data: {
          userId: user.id,
          isDefault,
          label: faker.helpers.arrayElement(["Home", "Work", "Other", null]),
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          addressLine1: faker.location.streetAddress(),
          addressLine2: faker.datatype.boolean(0.3)
            ? faker.location.secondaryAddress()
            : null,
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          postalCode: faker.location.zipCode(),
          country: "US",
          phone: faker.phone.number(),
        },
      });

      addresses.push(address);
    }
  }

  return addresses;
}

async function createSessions(users: User[]): Promise<Session[]> {
  const sessions: Session[] = [];

  for (const user of users) {
    if (faker.datatype.boolean(0.7)) {
      // 70% of users have active sessions
      const session: Session = await prisma.session.create({
        data: {
          userId: user.id,
          token: faker.string.uuid(),
          expiresAt: faker.date.future(),
          userAgent: faker.internet.userAgent(),
          ipAddress: faker.internet.ip(),
        },
      });

      sessions.push(session);
    }
  }

  return sessions;
}

// ==================== PRODUCT MANAGEMENT ====================

interface CategoryData {
  name: string;
  description: string;
}

interface SubCategoriesMap {
  [key: string]: string[];
}

async function createCategories(): Promise<Category[]> {
  const mainCategories: CategoryData[] = [
    { name: "Electronics", description: "Electronic devices and accessories" },
    { name: "Clothing", description: "Apparel and fashion accessories" },
    {
      name: "Home & Kitchen",
      description: "Products for your home and kitchen",
    },
    {
      name: "Beauty & Personal Care",
      description: "Beauty products and personal care items",
    },
    {
      name: "Sports & Outdoors",
      description: "Sports equipment and outdoor gear",
    },
  ];

  const subCategories: SubCategoriesMap = {
    Electronics: ["Smartphones", "Laptops", "Audio", "Cameras", "Accessories"],
    Clothing: ["Men's", "Women's", "Kids", "Shoes", "Accessories"],
    "Home & Kitchen": [
      "Furniture",
      "Kitchen",
      "Bedding",
      "Decor",
      "Appliances",
    ],
    "Beauty & Personal Care": [
      "Skincare",
      "Makeup",
      "Hair Care",
      "Fragrance",
      "Personal Care",
    ],
    "Sports & Outdoors": [
      "Fitness",
      "Outdoor Recreation",
      "Team Sports",
      "Water Sports",
      "Camping",
    ],
  };

  const categories: Category[] = [];

  // Create main categories
  for (const [index, category] of mainCategories.entries()) {
    const slug: string = category.name.toLowerCase().replace(/\s+/g, "-");

    const mainCategory: Category = await prisma.category.create({
      data: {
        name: category.name,
        slug,
        description: category.description,
        imageUrl: `https://example.com/categories/${slug}.jpg`,
        isActive: true,
        sortOrder: index,
      },
    });

    categories.push(mainCategory);

    // Create subcategories
    for (const [subIndex, subCategoryName] of subCategories[
      category.name
    ].entries()) {
      const subSlug: string = `${slug}-${subCategoryName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[&']/g, "")}`;

      const subCategory: Category = await prisma.category.create({
        data: {
          name: subCategoryName,
          slug: subSlug,
          description: `${subCategoryName} in ${category.name}`,
          imageUrl: `https://example.com/categories/${subSlug}.jpg`,
          isActive: true,
          parentId: mainCategory.id,
          level: 2,
          sortOrder: subIndex,
        },
      });

      categories.push(subCategory);
    }
  }

  return categories;
}

interface BrandData {
  name: string;
  description: string;
  website: string;
}

async function createBrands(): Promise<Brand[]> {
  const brandData: BrandData[] = [
    {
      name: "TechPro",
      description: "Innovative tech solutions",
      website: "https://techpro.example.com",
    },
    {
      name: "StyleMaster",
      description: "Fashion-forward apparel",
      website: "https://stylemaster.example.com",
    },
    {
      name: "HomeComfort",
      description: "Quality home essentials",
      website: "https://homecomfort.example.com",
    },
    {
      name: "GlowBeauty",
      description: "Premium beauty products",
      website: "https://glowbeauty.example.com",
    },
    {
      name: "ActiveLife",
      description: "Sports and outdoor gear",
      website: "https://activelife.example.com",
    },
    {
      name: "EcoEssentials",
      description: "Sustainable everyday products",
      website: "https://ecoessentials.example.com",
    },
    {
      name: "LuxeDesign",
      description: "Luxury home decor",
      website: "https://luxedesign.example.com",
    },
    {
      name: "FitPro",
      description: "Professional fitness equipment",
      website: "https://fitpro.example.com",
    },
  ];

  const brands: Brand[] = [];

  for (const brand of brandData) {
    const slug: string = brand.name.toLowerCase().replace(/\s+/g, "-");

    const createdBrand: Brand = await prisma.brand.create({
      data: {
        name: brand.name,
        slug,
        description: brand.description,
        logoUrl: `https://example.com/brands/${slug}.jpg`,
        websiteUrl: brand.website,
        isActive: true,
      },
    });

    brands.push(createdBrand);
  }

  return brands;
}

interface AttributeData {
  name: string;
  displayName: string;
  description: string;
  filterType: string;
  values: AttributeValueData[];
}

interface AttributeValueData {
  value: string;
  displayValue: string;
  colorCode?: string;
  imageUrl?: string;
  sortOrder?: number;
}

async function createAttributes(): Promise<Attribute[]> {
  const attributesData: AttributeData[] = [
    {
      name: "color",
      displayName: "Color",
      description: "Product color",
      filterType: "swatch",
      values: [
        { value: "red", displayValue: "Red", colorCode: "#FF0000" },
        { value: "blue", displayValue: "Blue", colorCode: "#0000FF" },
        { value: "green", displayValue: "Green", colorCode: "#00FF00" },
        { value: "black", displayValue: "Black", colorCode: "#000000" },
        { value: "white", displayValue: "White", colorCode: "#FFFFFF" },
      ],
    },
    {
      name: "size",
      displayName: "Size",
      description: "Product size",
      filterType: "dropdown",
      values: [
        { value: "xs", displayValue: "XS", sortOrder: 0 },
        { value: "s", displayValue: "S", sortOrder: 1 },
        { value: "m", displayValue: "M", sortOrder: 2 },
        { value: "l", displayValue: "L", sortOrder: 3 },
        { value: "xl", displayValue: "XL", sortOrder: 4 },
      ],
    },
    {
      name: "material",
      displayName: "Material",
      description: "Product material",
      filterType: "checkbox",
      values: [
        { value: "cotton", displayValue: "Cotton" },
        { value: "polyester", displayValue: "Polyester" },
        { value: "leather", displayValue: "Leather" },
        { value: "wood", displayValue: "Wood" },
        { value: "metal", displayValue: "Metal" },
      ],
    },
    {
      name: "storage",
      displayName: "Storage",
      description: "Device storage capacity",
      filterType: "dropdown",
      values: [
        { value: "64gb", displayValue: "64 GB", sortOrder: 0 },
        { value: "128gb", displayValue: "128 GB", sortOrder: 1 },
        { value: "256gb", displayValue: "256 GB", sortOrder: 2 },
        { value: "512gb", displayValue: "512 GB", sortOrder: 3 },
        { value: "1tb", displayValue: "1 TB", sortOrder: 4 },
      ],
    },
  ];

  const attributes: Attribute[] = [];

  for (const attrData of attributesData) {
    const attribute: Attribute = await prisma.attribute.create({
      data: {
        name: attrData.name,
        displayName: attrData.displayName,
        description: attrData.description,
        filterType: attrData.filterType,
      },
    });

    // Create attribute values
    attrData.values.forEach(async (valueData, index) => {
      await prisma.attributeValue.create({
        data: {
          attributeId: attribute.id,
          value: valueData.value,
          displayValue: valueData.displayValue,
          colorCode: valueData.colorCode || null,
          imageUrl: valueData.imageUrl || null,
          sortOrder:
            valueData.sortOrder !== undefined ? valueData.sortOrder : index,
        },
      });
    });

    attributes.push(attribute);
  }

  return attributes;
}

async function createProducts(
  brands: Brand[],
  categories: Category[],
  attributes: Attribute[]
): Promise<Product[]> {
  const products: Product[] = [];
  const productCount: number = 50;

  // Get all attribute values for later use
  const colorAttribute: Attribute | undefined = attributes.find(
    (a) => a.name === "color"
  );
  const sizeAttribute: Attribute | undefined = attributes.find(
    (a) => a.name === "size"
  );
  const materialAttribute: Attribute | undefined = attributes.find(
    (a) => a.name === "material"
  );
  const storageAttribute: Attribute | undefined = attributes.find(
    (a) => a.name === "storage"
  );

  if (
    !colorAttribute ||
    !sizeAttribute ||
    !materialAttribute ||
    !storageAttribute
  ) {
    throw new Error("Required attributes not found");
  }

  const colorValues: AttributeValue[] = await prisma.attributeValue.findMany({
    where: { attributeId: colorAttribute.id },
  });

  const sizeValues: AttributeValue[] = await prisma.attributeValue.findMany({
    where: { attributeId: sizeAttribute.id },
  });

  const materialValues: AttributeValue[] = await prisma.attributeValue.findMany(
    {
      where: { attributeId: materialAttribute.id },
    }
  );

  const storageValues: AttributeValue[] = await prisma.attributeValue.findMany({
    where: { attributeId: storageAttribute.id },
  });

  // Get subcategories
  const subcategories: Category[] = categories.filter((c) => c.level === 2);

  for (let i = 0; i < productCount; i++) {
    // Randomly assign to a brand and category
    const brand: Brand = faker.helpers.arrayElement(brands);
    const category: Category = faker.helpers.arrayElement(subcategories);

    // Determine which attributes to use based on category
    // const useColor: boolean = true; // All products have color
    const useSize: boolean =
      category.name.includes("Clothing") || category.name.includes("Shoes");
    const useMaterial: boolean =
      category.name.includes("Furniture") ||
      category.name.includes("Accessories");
    const useStorage: boolean =
      category.name.includes("Smartphones") ||
      category.name.includes("Laptops");

    // Generate product name
    const adjective: string = faker.commerce.productAdjective();
    const productName: string = `${
      brand.name
    } ${adjective} ${faker.commerce.product()}`;

    // Create slug
    const slug: string = productName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[&']/g, "");

    // Generate SKU
    const sku: string = `${brand.name
      .substring(0, 3)
      .toUpperCase()}-${faker.number.int({ min: 10000, max: 99999 })}`;

    // Generate prices
    const price: string = faker.commerce.price({ min: 10, max: 500 });
    const compareAtPrice: number | null = faker.datatype.boolean(0.3)
      ? parseFloat(price) * faker.number.float({ min: 1.1, max: 1.5 })
      : null;
    const costPrice: number =
      parseFloat(price) * faker.number.float({ min: 0.4, max: 0.7 });

    // Create product
    const product: Product = await prisma.product.create({
      data: {
        name: productName,
        slug,
        sku,
        description: faker.commerce.productDescription(),
        price: parseFloat(price),
        compareAtPrice,
        costPrice,
        brandId: brand.id,
        isActive: true,
        isFeatured: faker.datatype.boolean(0.2),
        isDigital: useStorage && faker.datatype.boolean(0.1),
        stockQuantity: faker.number.int({ min: 0, max: 100 }),
        weight: faker.number.float({ min: 0.1, max: 20 }),
        dimensions: {
          length: faker.number.float({ min: 1, max: 50 }),
          width: faker.number.float({ min: 1, max: 50 }),
          height: faker.number.float({ min: 1, max: 50 }),
        },
        metaTitle: `Buy ${productName} - Best Price`,
        metaDescription: `Purchase the ${productName}. ${faker.commerce
          .productDescription()
          .substring(0, 100)}`,
        taxClass: faker.helpers.arrayElement(["standard", "reduced", "zero"]),
        publishedAt: faker.date.past(),
      },
    });

    // Link product to category
    await prisma.productCategory.create({
      data: {
        productId: product.id,
        categoryId: category.id,
      },
    });

    // Add product attributes and generate variants
    const attributesForVariants: AttributeForVariant[] = [];

    // Add color attribute (all products have color)
    const productColors: AttributeValue[] = faker.helpers.arrayElements(
      colorValues,
      faker.number.int({ min: 1, max: 3 })
    );
    for (const colorValue of productColors) {
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: colorAttribute.id,
          attributeValueId: colorValue.id,
          isVariant: true,
        },
      });
    }
    attributesForVariants.push({
      attribute: colorAttribute,
      values: productColors,
    });

    // Add size attribute if applicable
    if (useSize) {
      const productSizes: AttributeValue[] = faker.helpers.arrayElements(
        sizeValues,
        faker.number.int({ min: 2, max: 5 })
      );
      for (const sizeValue of productSizes) {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            attributeId: sizeAttribute.id,
            attributeValueId: sizeValue.id,
            isVariant: true,
          },
        });
      }
      attributesForVariants.push({
        attribute: sizeAttribute,
        values: productSizes,
      });
    }

    // Add material attribute if applicable
    if (useMaterial) {
      const productMaterial: AttributeValue =
        faker.helpers.arrayElement(materialValues);
      await prisma.productAttribute.create({
        data: {
          productId: product.id,
          attributeId: materialAttribute.id,
          attributeValueId: productMaterial.id,
          isVariant: false, // Material doesn't create variants in this example
        },
      });
    }

    // Add storage attribute if applicable
    if (useStorage) {
      const productStorage: AttributeValue[] = faker.helpers.arrayElements(
        storageValues,
        faker.number.int({ min: 1, max: 3 })
      );
      for (const storageValue of productStorage) {
        await prisma.productAttribute.create({
          data: {
            productId: product.id,
            attributeId: storageAttribute.id,
            attributeValueId: storageValue.id,
            isVariant: true,
          },
        });
      }
      attributesForVariants.push({
        attribute: storageAttribute,
        values: productStorage,
      });
    }

    // Create product variants based on attribute combinations
    if (attributesForVariants.length > 0) {
      const createVariantCombinations = (
        attrs: AttributeForVariant[],
        current: VariantCombinationItem[] = [],
        index: number = 0
      ): VariantCombinationItem[][] => {
        if (index === attrs.length) {
          return [current];
        }

        const combinations: VariantCombinationItem[][] = [];
        for (const value of attrs[index].values) {
          combinations.push(
            ...createVariantCombinations(
              attrs,
              [...current, { attribute: attrs[index].attribute, value }],
              index + 1
            )
          );
        }

        return combinations;
      };

      const variantCombinations: VariantCombinationItem[][] =
        createVariantCombinations(attributesForVariants);

      for (const combination of variantCombinations) {
        const variantName: string = combination
          .map((c) => c.value.displayValue)
          .join(" / ");
        const variantPrice: number =
          parseFloat(price) + faker.number.float({ min: -10, max: 50 });
        const variantSku: string = `${sku}-${combination
          .map((c) => c.value.value)
          .join("-")}`;

        const variant = await prisma.productVariant.create({
          data: {
            productId: product.id,
            name: variantName,
            sku: variantSku,
            price: variantPrice,
            compareAtPrice: compareAtPrice
              ? parseFloat(compareAtPrice.toString()) +
                faker.number.float({ min: -10, max: 50 })
              : null,
            stockQuantity: faker.number.int({ min: 0, max: 50 }),
            isActive: true,
          },
        });

        // Link attributes to variant
        for (const item of combination) {
          await prisma.productVariantAttribute.create({
            data: {
              variantId: variant.id,
              attributeValueId: item.value.id,
            },
          });
        }

        // Add variant images
        const variantImageCount: number = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < variantImageCount; j++) {
          await prisma.productVariantImage.create({
            data: {
              variantId: variant.id,
              url: `https://example.com/products/${product.slug}/${
                variant.sku
              }-${j + 1}.jpg`,
              altText: `${product.name} ${variantName} - Image ${j + 1}`,
              width: faker.number.int({ min: 800, max: 1200 }),
              height: faker.number.int({ min: 800, max: 1200 }),
              isThumbnail: j === 0,
              sortOrder: j,
            },
          });
        }
      }
    }

    // Add product images
    const imageCount: number = faker.number.int({ min: 2, max: 5 });
    for (let j = 0; j < imageCount; j++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: `https://example.com/products/${product.slug}/main-${j + 1}.jpg`,
          altText: `${product.name} - Image ${j + 1}`,
          width: faker.number.int({ min: 800, max: 1200 }),
          height: faker.number.int({ min: 800, max: 1200 }),
          isThumbnail: j === 0,
          sortOrder: j,
        },
      });
    }

    products.push(product);
  }

  return products;
}

// ==================== SHOPPING CARTS ====================

async function createCarts(
  users: User[],
  products: Product[]
): Promise<Cart[]> {
  const carts: Cart[] = [];

  // Create carts for 30% of users
  const cartUsers: User[] = faker.helpers.arrayElements(
    users,
    Math.ceil(users.length * 0.3)
  );

  for (const user of cartUsers) {
    // Create cart
    const cart: Cart = await prisma.cart.create({
      data: {
        userId: user.id,
        currencyCode: "USD",
        createdAt: faker.date.recent(),
      },
    });

    // Add 1-5 items to cart
    const itemCount: number = faker.number.int({ min: 1, max: 5 });
    let subtotal: number = 0;

    for (let i = 0; i < itemCount; i++) {
      const product: Product = faker.helpers.arrayElement(products);

      // Get a random variant if available
      const variants = await prisma.productVariant.findMany({
        where: { productId: product.id },
      });

      const variant =
        variants.length > 0 ? faker.helpers.arrayElement(variants) : null;
      const quantity: number = faker.number.int({ min: 1, max: 3 });
      const price: number = variant
        ? parseFloat(variant.price.toString())
        : parseFloat(product.price.toString());
      const itemTotal: number = price * quantity;
      subtotal += itemTotal;

      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant ? variant.id : null,
          quantity,
          price,
          createdAt: cart.createdAt,
        },
      });
    }

    // Sometimes add a coupon
    if (faker.datatype.boolean(0.2)) {
      const discountAmount: number =
        subtotal * faker.number.float({ min: 0.05, max: 0.2 });

      await prisma.cartCoupon.create({
        data: {
          cartId: cart.id,
          couponCode: faker.string.alphanumeric(8).toUpperCase(),
          discountAmount,
          createdAt: faker.date.between({
            from: cart.createdAt,
            to: new Date(),
          }),
        },
      });

      // Update cart totals
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          subtotal,
          discountTotal: discountAmount,
          taxTotal: (subtotal - discountAmount) * 0.08, // 8% tax rate
          shippingTotal: subtotal > 100 ? 0 : 10, // Free shipping over $100
          grandTotal:
            subtotal -
            discountAmount +
            (subtotal > 100 ? 0 : 10) +
            (subtotal - discountAmount) * 0.08,
        },
      });
    } else {
      // Update cart totals without discount
      await prisma.cart.update({
        where: { id: cart.id },
        data: {
          subtotal,
          discountTotal: 0,
          taxTotal: subtotal * 0.08, // 8% tax rate
          shippingTotal: subtotal > 100 ? 0 : 10, // Free shipping over $100
          grandTotal: subtotal + (subtotal > 100 ? 0 : 10) + subtotal * 0.08,
        },
      });
    }

    carts.push(cart);
  }

  return carts;
}

// ==================== WISHLISTS ====================

async function createWishlists(
  users: User[],
  products: Product[]
): Promise<Wishlist[]> {
  const wishlists: Wishlist[] = [];

  // Create wishlists for 40% of users
  const wishlistUsers: User[] = faker.helpers.arrayElements(
    users,
    Math.ceil(users.length * 0.4)
  );

  for (const user of wishlistUsers) {
    // Create wishlist
    const wishlist: Wishlist = await prisma.wishlist.create({
      data: {
        userId: user.id,
        createdAt: faker.date.past(),
      },
    });

    // Add 1-10 items to wishlist
    const itemCount: number = faker.number.int({ min: 1, max: 10 });
    const wishlistProducts: Product[] = faker.helpers.arrayElements(
      products,
      itemCount
    );

    for (const product of wishlistProducts) {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId: product.id,
          createdAt: faker.date.between({
            from: wishlist.createdAt,
            to: new Date(),
          }),
        },
      });
    }

    wishlists.push(wishlist);
  }

  return wishlists;
}

// ==================== ORDERS ====================

interface StatusUpdate {
  status: OrderStatus;
  createdAt: Date;
  comment: string;
}

async function createOrders(
  users: User[],
  products: Product[],
  addresses: Address[]
): Promise<Order[]> {
  const orders: Order[] = [];

  // Create 1-3 orders for 60% of users
  const orderUsers: User[] = faker.helpers.arrayElements(
    users,
    Math.ceil(users.length * 0.6)
  );

  let orderNumber: number = 10001;

  for (const user of orderUsers) {
    const orderCount: number = faker.number.int({ min: 1, max: 3 });

    // Get user's addresses
    const userAddresses: Address[] = addresses.filter(
      (addr) => addr.userId === user.id
    );

    if (userAddresses.length === 0) continue;

    for (let i = 0; i < orderCount; i++) {
      // Select random addresses for shipping and billing
      const shippingAddress: Address =
        faker.helpers.arrayElement(userAddresses);
      const billingAddress: Address = faker.datatype.boolean(0.7)
        ? shippingAddress
        : faker.helpers.arrayElement(userAddresses);

      // Determine order date
      const orderDate: Date = faker.date.past({ years: 1 });

      // Generate order status based on date (older orders more likely to be completed)
      const daysSinceOrder: number = Math.floor(
        (new Date().getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      let status: OrderStatus;

      if (daysSinceOrder > 30) {
        status = faker.helpers.arrayElement([
          "COMPLETED",
          "DELIVERED",
          "REFUNDED",
          "CANCELED",
        ]) as OrderStatus;
      } else if (daysSinceOrder > 14) {
        status = faker.helpers.arrayElement([
          "COMPLETED",
          "DELIVERED",
          "SHIPPED",
          "PROCESSING",
        ]) as OrderStatus;
      } else if (daysSinceOrder > 7) {
        status = faker.helpers.arrayElement([
          "PROCESSING",
          "SHIPPED",
          "ON_HOLD",
        ]) as OrderStatus;
      } else {
        status = faker.helpers.arrayElement([
          "PENDING",
          "PROCESSING",
          "ON_HOLD",
        ]) as OrderStatus;
      }

      // Create order
      const order: Order = await prisma.order.create({
        data: {
          userId: user.id,
          orderNumber: `ORD-${orderNumber++}`,
          email: user.email,
          status,
          currencyCode: "USD",
          subtotal: 0, // Will be calculated based on items
          discountTotal: 0,
          taxTotal: 0,
          shippingTotal: 0,
          grandTotal: 0, // Will be calculated
          shippingAddressId: shippingAddress.id,
          billingAddressId: billingAddress.id,
          shippingMethod: faker.helpers.arrayElement([
            "Standard",
            "Express",
            "Next Day",
          ]),
          paymentMethod: faker.helpers.arrayElement([
            "Credit Card",
            "PayPal",
            "Bank Transfer",
          ]),
          notes: faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null,
          customerNote: faker.datatype.boolean(0.2)
            ? faker.lorem.sentence()
            : null,
          adminNote: faker.datatype.boolean(0.1)
            ? faker.lorem.sentence()
            : null,
          ipAddress: faker.internet.ip(),
          userAgent: faker.internet.userAgent(),
          createdAt: orderDate,
          updatedAt: faker.date.between({ from: orderDate, to: new Date() }),
          canceledAt:
            status === "CANCELED"
              ? faker.date.between({ from: orderDate, to: new Date() })
              : null,
        },
      });

      // Add 1-5 items to order
      const itemCount: number = faker.number.int({ min: 1, max: 5 });
      let subtotal: number = 0;

      for (let j = 0; j < itemCount; j++) {
        const product: Product = faker.helpers.arrayElement(products);

        // Get a random variant if available
        const variants = await prisma.productVariant.findMany({
          where: { productId: product.id },
        });

        const variant =
          variants.length > 0 ? faker.helpers.arrayElement(variants) : null;
        const quantity: number = faker.number.int({ min: 1, max: 3 });
        const price: number = variant
          ? parseFloat(variant.price.toString())
          : parseFloat(product.price.toString());
        const itemSubtotal: number = price * quantity;
        subtotal += itemSubtotal;

        // Create snapshot of product data
        const productSnapshot = {
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: price,
          images: await prisma.productImage.findMany({
            where: { productId: product.id },
            select: { url: true },
          }),
        };

        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            variantId: variant ? variant.id : null,
            name: variant ? `${product.name} - ${variant.name}` : product.name,
            sku: variant ? variant.sku : product.sku,
            quantity,
            unitPrice: price,
            subtotal: itemSubtotal,
            tax: itemSubtotal * 0.08, // 8% tax rate
            discount: 0, // No item-level discounts in this example
            total: itemSubtotal + itemSubtotal * 0.08,
            productData: productSnapshot,
          },
        });
      }

      // Apply discount to some orders
      const discountTotal: number = faker.datatype.boolean(0.3)
        ? subtotal * faker.number.float({ min: 0.05, max: 0.2 })
        : 0;
      const taxTotal: number = (subtotal - discountTotal) * 0.08; // 8% tax
      const shippingTotal: number = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const grandTotal: number =
        subtotal - discountTotal + taxTotal + shippingTotal;

      // Update order totals
      await prisma.order.update({
        where: { id: order.id },
        data: {
          subtotal,
          discountTotal,
          taxTotal,
          shippingTotal,
          grandTotal,
          couponCodes:
            discountTotal > 0
              ? faker.string.alphanumeric(8).toUpperCase()
              : null,
        },
      });

      // Add order status history
      const statusUpdates: StatusUpdate[] = [];

      // Always add the initial "PENDING" status
      statusUpdates.push({
        status: "PENDING",
        createdAt: orderDate,
        comment: "Order received",
      });

      // Add intermediate statuses based on final status
      if (
        ["PROCESSING", "ON_HOLD", "COMPLETED", "SHIPPED", "DELIVERED"].includes(
          status
        )
      ) {
        statusUpdates.push({
          status: "PROCESSING",
          createdAt: faker.date.between({ from: orderDate, to: new Date() }),
          comment: "Payment confirmed, processing order",
        });
      }

      if (["ON_HOLD"].includes(status)) {
        statusUpdates.push({
          status: "ON_HOLD",
          createdAt: faker.date.between({
            from: statusUpdates[statusUpdates.length - 1].createdAt,
            to: new Date(),
          }),
          comment: "Order placed on hold pending verification",
        });
      }

      if (["SHIPPED", "DELIVERED"].includes(status)) {
        statusUpdates.push({
          status: "SHIPPED",
          createdAt: faker.date.between({
            from: statusUpdates[statusUpdates.length - 1].createdAt,
            to: new Date(),
          }),
          comment: `Order shipped via ${order.shippingMethod}`,
        });
      }

      if (["DELIVERED"].includes(status)) {
        statusUpdates.push({
          status: "DELIVERED",
          createdAt: faker.date.between({
            from: statusUpdates[statusUpdates.length - 1].createdAt,
            to: new Date(),
          }),
          comment: "Order delivered successfully",
        });
      }

      if (["COMPLETED"].includes(status)) {
        statusUpdates.push({
          status: "COMPLETED",
          createdAt: faker.date.between({
            from: statusUpdates[statusUpdates.length - 1].createdAt,
            to: new Date(),
          }),
          comment: "Order completed",
        });
      }

      if (["CANCELED"].includes(status)) {
        statusUpdates.push({
          status: "CANCELED",
          createdAt: order.canceledAt!,
          comment: "Order canceled by customer",
        });
      }

      if (["REFUNDED"].includes(status)) {
        statusUpdates.push({
          status: "REFUNDED",
          createdAt: faker.date.between({
            from: orderDate,
            to: new Date(),
          }),
          comment: "Order refunded",
        });
      }

      // Add status updates to the database
      for (const update of statusUpdates) {
        await prisma.orderStatusUpdate.create({
          data: {
            orderId: order.id,
            status: update.status,
            comment: update.comment,
            createdBy: faker.datatype.boolean(0.7)
              ? "system"
              : [user.id, "admin@example.com"].join(":"),
            createdAt: update.createdAt,
          },
        });
      }

      orders.push(order);
    }
  }

  return orders;
}

// ==================== PAYMENT METHODS ====================

async function createPaymentMethods(users: User[]): Promise<PaymentMethod[]> {
  const paymentMethods: PaymentMethod[] = [];

  // Create payment methods for 50% of users
  const paymentUsers: User[] = faker.helpers.arrayElements(
    users,
    Math.ceil(users.length * 0.5)
  );

  for (const user of paymentUsers) {
    // Add 1-2 payment methods per user
    const methodCount: number = faker.number.int({ min: 1, max: 2 });

    for (let i = 0; i < methodCount; i++) {
      const isDefault: boolean = i === 0; // First payment method is default
      const type: string = faker.helpers.arrayElement([
        "credit_card",
        "paypal",
      ]);

      // Create payment method
      const paymentMethod: PaymentMethod = await prisma.paymentMethod.create({
        data: {
          userId: user.id,
          type,
          isDefault,
          provider: type === "credit_card" ? "stripe" : "paypal",
          tokenId: faker.string.uuid(),
          cardBrand:
            type === "credit_card"
              ? faker.helpers.arrayElement(["visa", "mastercard", "amex"])
              : null,
          cardLast4:
            type === "credit_card"
              ? faker.finance.creditCardNumber().slice(-4)
              : null,
          cardExpMonth:
            type === "credit_card"
              ? faker.number.int({ min: 1, max: 12 })
              : null,
          cardExpYear:
            type === "credit_card"
              ? faker.number.int({
                  min: new Date().getFullYear(),
                  max: new Date().getFullYear() + 5,
                })
              : null,
          isActive: true,
          createdAt: faker.date.past(),
        },
      });

      paymentMethods.push(paymentMethod);
    }
  }

  return paymentMethods;
}

// ==================== TRANSACTIONS ====================

async function createTransactions(
  orders: Order[],
  paymentMethods: PaymentMethod[]
): Promise<Transaction[]> {
  const transactions: Transaction[] = [];

  for (const order of orders) {
    // Find user's payment methods
    let paymentMethod: PaymentMethod | null = null;
    if (order.userId) {
      const userPaymentMethods: PaymentMethod[] = paymentMethods.filter(
        (pm) => pm.userId === order.userId
      );
      if (userPaymentMethods.length > 0) {
        paymentMethod = faker.helpers.arrayElement(userPaymentMethods);
      }
    }

    // Determine transaction status based on order status
    let transactionStatus: TransactionStatus = "PENDING";
    let transactionType: TransactionType = "PAYMENT";

    if (
      ["COMPLETED", "PROCESSING", "SHIPPED", "DELIVERED"].includes(order.status)
    ) {
      transactionStatus = "SUCCESS";
    } else if (["CANCELED", "FAILED"].includes(order.status)) {
      transactionStatus = "FAILURE";
    } else if (order.status === "REFUNDED") {
      transactionStatus = "SUCCESS";
      transactionType = "REFUND";
    }

    // Create initial payment transaction
    const transaction: Transaction = await prisma.transaction.create({
      data: {
        orderId: order.id,
        paymentMethodId: paymentMethod ? paymentMethod.id : null,
        type: transactionType,
        status: transactionStatus,
        amount: parseFloat(order.grandTotal.toString()),
        currency: order.currencyCode,
        providerTransactionId: faker.string.uuid(),
        providerResponse: {
          success: transactionStatus === "SUCCESS",
          message:
            transactionStatus === "SUCCESS"
              ? "Transaction approved"
              : "Transaction declined",
          code: transactionStatus === "SUCCESS" ? "0000" : "1000",
          timestamp: new Date().toISOString(),
        },
        createdAt: order.createdAt,
        updatedAt: faker.date.between({
          from: order.createdAt,
          to: new Date(),
        }),
      },
    });

    transactions.push(transaction);

    // Add refund transaction if order was refunded
    if (order.status === "REFUNDED") {
      const refundTransaction: Transaction = await prisma.transaction.create({
        data: {
          orderId: order.id,
          paymentMethodId: paymentMethod ? paymentMethod.id : null,
          type: "REFUND",
          status: "SUCCESS",
          amount: parseFloat(order.grandTotal.toString()),
          currency: order.currencyCode,
          providerTransactionId: faker.string.uuid(),
          providerResponse: {
            success: true,
            message: "Refund processed successfully",
            code: "0000",
            timestamp: new Date().toISOString(),
          },
          createdAt: faker.date.between({
            from: order.updatedAt,
            to: new Date(),
          }),
          updatedAt: faker.date.recent(),
        },
      });

      transactions.push(refundTransaction);
    }
  }

  return transactions;
}

// ==================== NOTIFICATIONS ====================

async function createNotifications(
  users: User[],
  orders: Order[]
): Promise<Notification[]> {
  const notifications: Notification[] = [];

  // Create order status notifications
  for (const order of orders) {
    if (!order.userId) continue;

    // Create notification based on order status
    let notificationTitle: string, notificationMessage: string;

    switch (order.status) {
      case "PROCESSING":
        notificationTitle = "Order Confirmed";
        notificationMessage = `Your order #${order.orderNumber} has been confirmed and is being processed.`;
        break;
      case "SHIPPED":
        notificationTitle = "Order Shipped";
        notificationMessage = `Great news! Your order #${order.orderNumber} has been shipped.`;
        break;
      case "DELIVERED":
        notificationTitle = "Order Delivered";
        notificationMessage = `Your order #${order.orderNumber} has been delivered.`;
        break;
      case "COMPLETED":
        notificationTitle = "Order Completed";
        notificationMessage = `Your order #${order.orderNumber} is now complete. Thank you for shopping with us!`;
        break;
      default:
        continue; // Skip other statuses
    }

    const notification: Notification = await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "ORDER_STATUS" as NotificationType,
        title: notificationTitle,
        message: notificationMessage,
        isRead: faker.datatype.boolean(0.5),
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
        },
        createdAt: order.updatedAt,
        readAt: faker.datatype.boolean(0.5)
          ? faker.date.between({ from: order.updatedAt, to: new Date() })
          : null,
      },
    });

    notifications.push(notification);
  }

  // Create promotional notifications for random users
  const promoUsers: User[] = faker.helpers.arrayElements(
    users,
    Math.ceil(users.length * 0.3)
  );

  for (const user of promoUsers) {
    const promoNotification: Notification = await prisma.notification.create({
      data: {
        userId: user.id,
        type: "PROMOTION" as NotificationType,
        title: "Special Offer Just For You!",
        message: `Use code ${faker.string
          .alphanumeric(6)
          .toUpperCase()} for ${faker.number.int({
          min: 10,
          max: 30,
        })}% off your next purchase.`,
        isRead: faker.datatype.boolean(0.4),
        data: {
          couponCode: faker.string.alphanumeric(6).toUpperCase(),
          discount: faker.number.int({ min: 10, max: 30 }),
        },
        createdAt: faker.date.recent(),
        readAt: faker.datatype.boolean(0.4) ? faker.date.recent() : null,
      },
    });

    notifications.push(promoNotification);
  }

  return notifications;
}

// ==================== COUPONS ====================

async function createCoupons(): Promise<Coupon[]> {
  const coupons: Coupon[] = [];
  const couponTypes: CouponType[] = [
    "PERCENTAGE",
    "FIXED_AMOUNT",
    "FREE_SHIPPING",
  ];

  // Create 10 coupons
  for (let i = 0; i < 10; i++) {
    const type: CouponType = faker.helpers.arrayElement(couponTypes);
    const code: string = faker.string.alphanumeric(8).toUpperCase();

    // Value depends on coupon type
    let value: number = 0;
    if (type === "PERCENTAGE") {
      value = faker.number.int({ min: 5, max: 50 });
    } else if (type === "FIXED_AMOUNT") {
      value = faker.number.int({ min: 5, max: 50 });
    } else {
      value = 0;
    }

    const coupon: Coupon = await prisma.coupon.create({
      data: {
        code,
        type,
        value,
        minOrderAmount: faker.datatype.boolean(0.6)
          ? faker.number.int({ min: 25, max: 100 })
          : null,
        maxDiscount:
          type === "PERCENTAGE"
            ? faker.number.int({ min: 20, max: 100 })
            : null,
        description: `${
          type === "PERCENTAGE"
            ? value + "% off"
            : type === "FIXED_AMOUNT"
            ? "$" + value + " off"
            : "Free shipping"
        } ${faker.commerce.productAdjective()} ${faker.commerce.product()} promotion`,
        isActive: faker.datatype.boolean(0.8),
        usageLimit: faker.datatype.boolean(0.7)
          ? faker.number.int({ min: 50, max: 1000 })
          : null,
        usageCount: faker.number.int({ min: 0, max: 49 }),
        perUserLimit: faker.datatype.boolean(0.5)
          ? faker.number.int({ min: 1, max: 3 })
          : null,
        startsAt: faker.date.past(),
        expiresAt: faker.datatype.boolean(0.7) ? faker.date.future() : null,
      },
    });

    coupons.push(coupon);
  }

  return coupons;
}

// ==================== SETTINGS ====================

async function createSettings(): Promise<Setting[]> {
  const settings: Setting[] = [];

  const siteSetting: Setting = await prisma.setting.create({
    data: {
      id: "site_settings",
      value: {
        site_name: "Modern E-commerce",
        site_description: "A Next.js E-commerce Platform",
        contact_email: "support@example.com",
        contact_phone: "+1-202-555-0170",
        default_currency: "USD",
        available_currencies: ["USD", "EUR", "GBP"],
        business_hours: {
          monday: "9:00 AM - 6:00 PM",
          tuesday: "9:00 AM - 6:00 PM",
          wednesday: "9:00 AM - 6:00 PM",
          thursday: "9:00 AM - 6:00 PM",
          friday: "9:00 AM - 6:00 PM",
          saturday: "10:00 AM - 4:00 PM",
          sunday: "Closed",
        },
        social_links: {
          facebook: "https://facebook.com/example",
          twitter: "https://twitter.com/example",
          instagram: "https://instagram.com/example",
        },
        shipping: {
          free_shipping_threshold: 100,
          standard_shipping_cost: 10,
          express_shipping_cost: 25,
        },
        tax: {
          default_rate: 0.08,
          tax_by_state: {
            CA: 0.0725,
            NY: 0.045,
            TX: 0.0625,
          },
        },
      },
    },
  });

  settings.push(siteSetting);

  // Create tax settings
  const taxSettings: Setting = await prisma.setting.create({
    data: {
      id: "tax_settings",
      value: {
        tax_enabled: true,
        prices_include_tax: false,
        tax_calculation_method: "per_item",
        shipping_tax_class: "standard",
        tax_classes: [
          {
            id: "standard",
            name: "Standard Rate",
            rate: 0.08,
          },
          {
            id: "reduced",
            name: "Reduced Rate",
            rate: 0.05,
          },
          {
            id: "zero",
            name: "Zero Rate",
            rate: 0,
          },
        ],
      },
    },
  });

  settings.push(taxSettings);

  // Create shipping settings
  const shippingSettings: Setting = await prisma.setting.create({
    data: {
      id: "shipping_settings",
      value: {
        shipping_enabled: true,
        shipping_methods: [
          {
            id: "standard",
            name: "Standard Shipping",
            description: "Delivery in 3-5 business days",
            base_cost: 10,
            free_threshold: 100,
          },
          {
            id: "express",
            name: "Express Shipping",
            description: "Delivery in 1-2 business days",
            base_cost: 25,
            free_threshold: 200,
          },
          {
            id: "next_day",
            name: "Next Day Delivery",
            description: "Delivery on the next business day",
            base_cost: 35,
            free_threshold: null,
          },
        ],
      },
    },
  });

  settings.push(shippingSettings);

  // Create payment settings
  const paymentSettings: Setting = await prisma.setting.create({
    data: {
      id: "payment_settings",
      value: {
        payment_methods: [
          {
            id: "credit_card",
            name: "Credit Card",
            enabled: true,
            description: "Pay securely with credit card",
            icon: "credit-card",
          },
          {
            id: "paypal",
            name: "PayPal",
            enabled: true,
            description: "Pay securely with PayPal",
            icon: "paypal",
          },
          {
            id: "bank_transfer",
            name: "Bank Transfer",
            enabled: true,
            description: "Pay via bank transfer",
            icon: "bank",
          },
        ],
        stripe_settings: {
          public_key: "pk_test_example",
          webhook_secret: "whsec_example",
          currency: "USD",
        },
        paypal_settings: {
          client_id: "client_id_example",
          secret: "secret_example",
          currency: "USD",
        },
      },
    },
  });

  settings.push(paymentSettings);

  return settings;
}

main()
  .catch((e: Error) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
