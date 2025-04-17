"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { Session, User } from "lucia";
import { lucia } from "./config/auth-config";

//
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export const validateRequest = cache(
  async (
    request: NextRequest | Request
  ): Promise<
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

    const result = await lucia?.validateSession(sessionId);

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

/**
 * Helper function to get the current user's ID from session
 * Returns null if not logged in
 */
export default async function getUserId(): Promise<string | null> {
  try {
    const sessionCookie = cookies().get("auth_session")?.value;

    if (!sessionCookie) {
      return null;
    }

    const session = await prisma.session.findFirst({
      where: {
        id: sessionCookie,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        userId: true,
      },
    });

    return session?.userId || null;
  } catch (error) {
    console.error("Lỗi khi lấy userId:", error);
    return null;
  }
}

/**
 * Helper function to get the current user from session
 * Returns null if not logged in
 */
export async function getCurrentUser() {
  try {
    const userId = await getUserId();

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        avatarUrl: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    return null;
  }
}

/**
 * Helper function to require authentication
 * Redirects to login if not logged in
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
