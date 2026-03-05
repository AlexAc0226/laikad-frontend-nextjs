"use client";

import React, { useMemo, useState } from "react";
import { Drawer } from "@mui/material";
import { BellIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAlertCenter } from "@/hooks/useAlertCenter";

function typeBadge(type: string) {
  switch (type) {
    case "error":
      return "bg-red-500 text-white";
    case "warning":
      return "bg-yellow-500 text-black";
    case "success":
      return "bg-green-500 text-white";
    default:
      return "bg-blue-500 text-white";
  }
}

export default function AlertCenter() {
  const { alerts, removeAlert, clearAlerts } = useAlertCenter();
  const [open, setOpen] = useState(false);

  const count = alerts.length;

  const grouped = useMemo(() => {
    const g: Record<string, number> = { error: 0, warning: 0, success: 0, info: 0 };
    alerts.forEach((a) => (g[a.type] = (g[a.type] || 0) + 1));
    return g;
  }, [alerts]);

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-5 right-20 z-[2000]">
        <button
          onClick={() => setOpen(true)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-black text-white shadow-xl dark:bg-white dark:text-black"
          aria-label="Open Alerts"
        >
          <BellIcon className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {count}
            </span>
          )}
        </button>
      </div>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <div className="flex h-screen w-[360px] flex-col bg-white dark:bg-gray-dark">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
            <div>
              <div className="text-base font-bold text-black dark:text-white">Alert Center</div>
              <div className="text-xs text-black/60 dark:text-white/60">
                errors: {grouped.error} • warnings: {grouped.warning} • success: {grouped.success} • info:{" "}
                {grouped.info}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={clearAlerts}
                className="rounded-md border border-black/20 px-2 py-1 text-xs text-black hover:bg-black/5 dark:border-white/20 dark:text-white dark:hover:bg-white/10"
              >
                Clear all
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-2 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Close Alerts"
              >
                <XMarkIcon className="h-5 w-5 text-black dark:text-white" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-auto p-4">
            {alerts.length === 0 ? (
              <div className="rounded-lg border border-black/10 p-4 text-sm text-black/60 dark:border-white/10 dark:text-white/60">
                No alerts yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-black/10 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-gray-dark"
                  >
                    <div className="mb-1 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${typeBadge(a.type)}`}>
                          {a.type.toUpperCase()}
                        </span>
                        <div className="text-sm font-semibold text-black dark:text-white">{a.title}</div>
                      </div>
                      <button
                        onClick={() => removeAlert(a.id)}
                        className="rounded-md px-2 py-1 text-xs text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
                      >
                        Dismiss
                      </button>
                    </div>

                    {a.message && (
                      <div className="text-sm text-black/70 dark:text-white/70 whitespace-pre-wrap">{a.message}</div>
                    )}

                    <div className="mt-2 text-[11px] text-black/40 dark:text-white/40">
                      {new Date(a.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  );
}