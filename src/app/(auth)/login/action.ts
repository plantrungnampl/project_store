"use server";

import {
  isRedirectError,
  // redirect,
} from "next/dist/client/components/redirect";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
import { loginSchema, LoginValues } from "@/validation";
// import { lucia } from "@/auth";
import { prisma } from "@/lib/prisma";
import { lucia } from "@/config/auth-config";

export async function LoginLucia(
  data: LoginValues
): Promise<{ error?: string; success?: boolean }> {
  try {
    const { email, password } = loginSchema.parse(data);
    const exitingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email.toLowerCase(),
          mode: "insensitive",
        },
      },
    });
    if (!exitingUser || !exitingUser.passwordHash) {
      return {
        error: "wrong email or password",
      };
    }
    const validPassword = await verify(exitingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });
    if (!validPassword) {
      return {
        error: "wrong email or password",
      };
    }
    const session = await lucia.createSession(exitingUser.id, {});
    const sessionCookies = lucia.createSessionCookie(session.id);
    const storedCookies = cookies();
    storedCookies.set(
      sessionCookies.name,
      sessionCookies.value,
      sessionCookies.attributes
    );
    return { success: true };
  } catch (error) {
    console.error(error);
    if (isRedirectError(error)) throw error;
    return {
      error: "something went wrong",
    };
  }
}
