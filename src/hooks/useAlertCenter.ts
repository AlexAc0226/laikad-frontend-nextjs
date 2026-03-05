"use client";

import { useContext } from "react";
import { AlertCenterContext } from "@/context/AlertCenterContext";

export function useAlertCenter() {
  const ctx = useContext(AlertCenterContext);
  if (!ctx) throw new Error("useAlertCenter must be used inside AlertCenterProvider");
  return ctx;
}