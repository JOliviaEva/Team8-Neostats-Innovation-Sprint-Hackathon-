"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const AUTH_ROUTES = ["/login", "/signup"];

export default function ShellWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {children}
      </main>
    </>
  );
}
