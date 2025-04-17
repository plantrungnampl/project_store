import { redirect } from "next/navigation";

import { validateRequest } from "@/auth";
import SessionProvider from "../sessionProvider";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  if (!session.user) redirect("/login");

  return (
    <SessionProvider value={session}>
      <div className=" bg-background flex flex-col">
        {/* <Header /> */}
        {children}
      </div>
    </SessionProvider>
  );
}
