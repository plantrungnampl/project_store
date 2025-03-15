"use server";

import { lucia, validateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const logout = async () => {
  const { session } = await validateRequest();
  if (!session) {
    throw Error("unauthorized");
  }
  await lucia.invalidateSession(session.id);
  const sessionCookies = lucia.createBlankSessionCookie();
  const cookiesStored = cookies();
  cookiesStored.set(
    sessionCookies.name,
    sessionCookies.value,
    sessionCookies.attributes
  );
  return redirect("/login");
};
