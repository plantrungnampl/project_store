import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, Session, User } from "lucia";
import { cache } from "react";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { prisma } from "./prisma";

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
      // id: databaseUserAttributes.id,
      // username: databaseUserAttributes.username,
      // displayName: databaseUserAttributes.displayname,
      // avartarUrl: databaseUserAttributes.avartarUrl,
      // googleId: databaseUserAttributes.googleId,
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
// interface databaseUserAttributes {
//   id: string;
//   username: string;
//   displayname: string;
//   avartarUrl?: string | null;
//   googleId: string | null;
// }
export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const cookiStored = cookies();
    const sessionId = cookiStored.get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);

    try {
      if (result.session && result.session.fresh) {
        const sessionCookies = lucia.createSessionCookie(result.session.id);
        cookiStored.set(
          sessionCookies.name,
          sessionCookies.value,
          sessionCookies.attributes
        );
      }
      if (!result.session) {
        const sessionCookies = lucia.createBlankSessionCookie();
        cookiStored.set(
          sessionCookies.name,
          sessionCookies.value,
          sessionCookies.attributes
        );
      }
    } catch {}
    return result;
  }
);
