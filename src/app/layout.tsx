"use client";

import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "nouislider/dist/nouislider.css";
import "dropzone/dist/dropzone.css";
import "@/css/satoshi.css";
import "@/css/simple-datatables.css";
import "@/css/style.css";

import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import Providers from "./providers";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>
          {loading ? <Loader /> : children}
        </Providers>
      </body>
    </html>
  );
}