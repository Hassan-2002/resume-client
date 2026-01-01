"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/blocks/footer";
import { Navbar } from "@/components/blocks/navbar";

// Routes that should not show the navbar/footer
const FULL_SCREEN_ROUTES = ["/ats-score", "/resume-builder"];

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isFullScreen = FULL_SCREEN_ROUTES.some(route => pathname.startsWith(route));

  if (isFullScreen) {
    return <main>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
