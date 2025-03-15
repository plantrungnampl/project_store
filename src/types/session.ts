import { User } from "lucia";

// @/types/session.ts
export interface SessionContext {
  user: User;
  // ... any other session-related properties
}
