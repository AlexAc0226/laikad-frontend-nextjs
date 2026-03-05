"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

import CopilotChat from "@/components/Copilot/CopilotChat";
import ToastContext from "./context/ToastContext";

// ✅ NUEVO: Alert Center
import { AlertCenterProvider } from "@/context/AlertCenterContext";
import AlertCenter from "@/components/Alerts/AlertCenter";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastContext />

      {/* ✅ NUEVO: Provider global de alertas */}
      <AlertCenterProvider>
        {children}

        {/* ✅ Tu Copilot global (lo dejé igual) */}
        <CopilotChat />

        {/* ✅ NUEVO: UI del centro de alertas */}
        <AlertCenter />
      </AlertCenterProvider>
    </SessionProvider>
  );
}