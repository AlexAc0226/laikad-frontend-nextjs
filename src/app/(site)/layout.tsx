"use client";

import { SessionProvider } from "next-auth/react";
import ToastContext from "../context/ToastContext";
import React from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToastContext />
      {children}
    </SessionProvider>
  );
}

