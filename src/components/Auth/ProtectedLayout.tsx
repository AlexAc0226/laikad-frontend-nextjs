"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push("https://admin.laikad.com/auth/signin"); 
    }
  }, [router]);

  return <>{children}</>;
}