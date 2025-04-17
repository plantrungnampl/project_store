"use client";
import { Session } from "lucia";
import React, { createContext, useContext } from "react";
// interface User {
//   id: string;
//   username?: string;
//   email?: string;
//   password?: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }
import { WishlistProvider } from "@/context/WishlistContext";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  passwordHash?: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  lastLoginAt?: Date;

  // User Preferences

  // OAuth integration
  providerType?: string;
  providerId?: string;
}
interface SessionContext {
  user: User | null;
  session: Session;
}

const SessionContext = createContext<SessionContext | null>(null);
export default function SessionProvider({
  children,
  value,
}: React.PropsWithChildren<{ value: SessionContext }>) {
  return (
    <SessionContext.Provider value={value}>
      <WishlistProvider>{children}</WishlistProvider>
      {/* {children} */}
    </SessionContext.Provider>
  );
}
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw Error("useSession must be used within a SessionProvider");
  }
  return context;
};
