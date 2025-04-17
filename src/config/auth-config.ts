import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia } from "lucia";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma";

const adapter = new PrismaAdapter(prisma.session, prisma.user);
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes(databaseUserAttributes) {
    return {
      id: databaseUserAttributes.id,
      email: databaseUserAttributes.email,
      firstName: databaseUserAttributes.firstName,
      lastName: databaseUserAttributes.lastName,
      role: databaseUserAttributes.role,
      avatarUrl: databaseUserAttributes.avatarUrl,
      emailVerified: databaseUserAttributes.emailVerified,
      phone: databaseUserAttributes.phone,
      providerType: databaseUserAttributes.providerType,
      providerId: databaseUserAttributes.providerId,
    };
  },
});

declare module "lucia" {
  interface Register {
    lucia: typeof lucia;
    DatabaseUserAttributes: databaseUserAttributes;
    UserId: string;
  }
}

interface databaseUserAttributes {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  passwordHash?: string | null;
  phone?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  emailVerified: boolean;
  providerType?: string | null;
  providerId?: string | null;
}
