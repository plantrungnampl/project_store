"use server";
import { HeroBanner } from "@/components/layout/Banner";
// import { Header } from "@/components/layout/Header";
import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";
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
      <div className=" bg-gray-100">
        {/* <Header /> */}
        <div className="max-w-7xl mx-auto w-full mt-16 ">
          <HeroBanner />
        </div>
        <main className=" transition-all duration-300 ease-in-out bg-slate-200">
          <div className="max-w-7xl mx-auto  py-3 ">{children}</div>
        </main>
      </div>
    </SessionProvider>
  );
}
