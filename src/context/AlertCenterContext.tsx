"use client";

import React, { createContext, useCallback, useMemo, useState } from "react";

export type AlertType = "error" | "warning" | "success" | "info";

export type AlertItem = {
  id: string;
  type: AlertType;
  title: string;
  message?: string;
  createdAt: number;
  meta?: Record<string, any>;
};

type AlertCenterContextValue = {
  alerts: AlertItem[];
  addAlert: (a: Omit<AlertItem, "id" | "createdAt">) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
};

export const AlertCenterContext = createContext<AlertCenterContextValue | null>(null);

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AlertCenterProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  const addAlert = useCallback((a: Omit<AlertItem, "id" | "createdAt">) => {
    const item: AlertItem = {
      id: uid(),
      createdAt: Date.now(),
      ...a,
    };
    setAlerts((prev) => [item, ...prev].slice(0, 50)); // keep last 50
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const value = useMemo(
    () => ({ alerts, addAlert, removeAlert, clearAlerts }),
    [alerts, addAlert, removeAlert, clearAlerts]
  );

  return <AlertCenterContext.Provider value={value}>{children}</AlertCenterContext.Provider>;
}