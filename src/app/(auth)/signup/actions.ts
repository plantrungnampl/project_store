"use server";

import { lucia } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validation";
import { hash } from "@node-rs/argon2";
import { randomUUID } from "crypto"; // Use crypto for proper UUID generation
import { isRedirectError } from "next/dist/client/components/redirect";
import { cookies } from "next/headers";
// import { redirect } from "next/navigation";
import { z } from "zod";

// Define the type based on our register schema
export type RegisterFormData = z.infer<typeof registerSchema>;

export const register = async (
  formData: RegisterFormData
): Promise<{ error?: string; success?: boolean; redirectUrl?: string }> => {
  try {
    // Validate input data
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      // Get the first error message
      const error = result.error.errors[0]?.message;
      return { error };
    }
    // agreeTerms
    const { firstName, lastName, email, password, receiveNews } = result.data;

    // Hash the password
    const passwordHash = await hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    // Generate a proper UUID instead of using generateIdFromEntropySize
    const userId = randomUUID();

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (existingEmail) {
      return {
        error: "Email already exists. Please use a different email or sign in.",
      };
    }
    // const session = await lucia.createSession(userId, {});
    // const sessionCookie = lucia.createSessionCookie(session.id);
    // Create user in database using your schema
    await prisma.user.create({
      data: {
        id: userId,
        email,
        firstName,
        lastName,
        passwordHash,
        phone: null,
        role: "CUSTOMER",
        emailVerified: false,
        preferences: {
          notifications: {
            email: receiveNews,
            sms: false,
            push: receiveNews,
          },
        },
      },
    });

    // Create a new session for the user
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    // Set the session cookie
    const cookieStore = cookies();
    cookieStore.set(sessionCookie.name, sessionCookie.value, {
      ...sessionCookie.attributes,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    });

    // return redirect("/login");
    return { success: true, redirectUrl: "/login" };
  } catch (error) {
    console.error("Registration error:", error);

    // Handle redirect errors
    if (isRedirectError(error)) throw error;

    return {
      error: "Something went wrong during registration. Please try again.",
    };
  }
};
