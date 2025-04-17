import { validateRequest } from "@/auth";
import SessionProvider from "../sessionProvider";
import { redirect } from "next/navigation";
export default async function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();
  if (!session.user) redirect("/login");
  return (
    <SessionProvider value={session}>
      <div className=" bg-background flex flex-col">
        {/* <SearchHeader /> */}
        {children}
      </div>
    </SessionProvider>
  );
}
