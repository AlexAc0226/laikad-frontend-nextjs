"use client";

import { useMemo, useState } from "react";
import { FaFileExcel, FaSync } from "react-icons/fa";
import * as XLSX from "xlsx";
import { getAdjustFullReport } from "@/app/api/report/service";

type AdjustRow = {
  // ✅ ahora puede venir en dayAndapp
  key?: string;

  day: string;
  app: string;
  app_token: string;
  country: string;
  country_code: string;
  network: string;
  partner_name: string;
  channel: string;
  campaign: string;

  installs: number;
  clicks: number;

  impressions: string | number;
  events: string | number;
  cost: string | number;

  network_installs: string | number;
  network_clicks: string | number;
  network_cost: string | number;

  [key: string]: any;
};

type AdjustTotals = {
  installs?: number;
  clicks?: number;
  impressions?: number;
  events?: number;
  cost?: number;
  network_installs?: number;
  network_clicks?: number;
  network_cost?: number;
  [key: string]: any;
};

type AdjustResponse = {
  result: {
    rows: AdjustRow[];
    totals: AdjustTotals;
  };
  status: string;
  time?: number;
  totalSize?: number;
};

const toNumber = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const pickImportantRowFields = (r: AdjustRow) => ({
  day: r.day,
  app: r.app,
  country: r.country,
  country_code: r.country_code,
  network: r.network,
  partner_name: r.partner_name,
  channel: r.channel,
  campaign: r.campaign,
  installs: toNumber(r.installs),
  clicks: toNumber(r.clicks),
  impressions: toNumber(r.impressions),
  events: toNumber(r.events),
  cost: toNumber(r.cost),
  network_installs: toNumber(r.network_installs),
  network_clicks: toNumber(r.network_clicks),
  network_cost: toNumber(r.network_cost),
});

export default function ShowAdjust() {
  const today = new Date().toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  // ✅ NUEVO: agregamos dayAndapp
  const [grouping, setGrouping] = useState<
  "day" | "week" | "month" | "dayAndapp" | "dayAndCampaign"
>("day");

  const [rows, setRows] = useState<AdjustRow[]>([]);
  const [totals, setTotals] = useState<AdjustTotals>({});
  const [isLoading, setIsLoading] = useState(false);

  const cleanRowsForExcel = useMemo(() => rows.map(pickImportantRowFields), [rows]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const resp: AdjustResponse = await getAdjustFullReport(dateFrom, dateTo, grouping);
      setRows(resp?.result?.rows ?? []);
      setTotals(resp?.result?.totals ?? {});
    } catch (error) {
      console.error("Error fetching adjust report:", error);
      alert("Error al traer el Adjust report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      if (cleanRowsForExcel.length === 0) {
        alert("No hay datos para exportar");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(cleanRowsForExcel);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "AdjustReport");

      const fileName = `AdjustReport_${grouping}_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      alert("Hubo un error al exportar el archivo");
    }
  };

  const t = {
    events: toNumber(totals.events),
    installs: toNumber(totals.installs),
    clicks: toNumber(totals.clicks),
    impressions: toNumber(totals.impressions),
    cost: toNumber(totals.cost),
    network_installs: toNumber(totals.network_installs),
    network_clicks: toNumber(totals.network_clicks),
    network_cost: toNumber(totals.network_cost),
  };

  return (
    <div className="rounded-lg bg-[#212121] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">From</label>
            <input
              type="date"
              className="w-full rounded-md border border-[#424242] bg-[#424242] p-2 text-gray-300"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">To</label>
            <input
              type="date"
              className="w-full rounded-md border border-[#424242] bg-[#424242] p-2 text-gray-300"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Grouping</label>
            <select
              className="w-full rounded-md border border-[#424242] bg-[#424242] p-2 text-gray-300"
              value={grouping}
              onChange={(e) =>
  setGrouping(
    e.target.value as "day" | "week" | "month" | "dayAndapp" | "dayAndCampaign"
  )
}
            >
              <option value="day">Day</option>
<option value="dayAndapp">Day + App</option>
<option value="dayAndCampaign">Day + Campaign</option>
<option value="week">Week</option>
<option value="month">Month</option>
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="flex-1 flex items-center justify-center rounded-md bg-[#B0BEC5] px-3 py-2 text-[#212121] hover:bg-[#90A4AE] transition-all duration-200"
              disabled={isLoading}
            >
              <FaSync className={`h-5 w-5 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={handleExportExcel}
              className="flex-1 flex items-center justify-center rounded-md bg-[#B0BEC5] px-3 py-2 text-[#212121] hover:bg-[#90A4AE] transition-all duration-200"
              disabled={cleanRowsForExcel.length === 0}
              title={cleanRowsForExcel.length === 0 ? "No hay datos" : "Exportar"}
            >
              <FaFileExcel className="h-5 w-5 mr-2" />
              Excel
            </button>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="rounded-lg border border-[#424242] bg-[#303030] p-4">
          <div className="text-xs text-gray-400">Events</div>
          <div className="text-xl font-semibold text-gray-100">{t.events}</div>
        </div>
        <div className="rounded-lg border border-[#424242] bg-[#303030] p-4">
          <div className="text-xs text-gray-400">Installs</div>
          <div className="text-xl font-semibold text-gray-100">{t.installs}</div>
        </div>
        <div className="rounded-lg border border-[#424242] bg-[#303030] p-4">
          <div className="text-xs text-gray-400">Clicks</div>
          <div className="text-xl font-semibold text-gray-100">{t.clicks}</div>
        </div>
        <div className="rounded-lg border border-[#424242] bg-[#303030] p-4">
          <div className="text-xs text-gray-400">Impressions</div>
          <div className="text-xl font-semibold text-gray-100">{t.impressions}</div>
        </div>

        <div className="rounded-lg border border-[#424242] bg-[#303030] p-4">
          <div className="text-xs text-gray-400">Cost</div>
          <div className="text-xl font-semibold text-gray-100">{t.cost}</div>
        </div>
        <div className="rounded-lg border border-[#424242] bg-[#303030] p-4">
          <div className="text-xs text-gray-400">Network Installs</div>
          <div className="text-xl font-semibold text-gray-100">{t.network_installs}</div>
        </div>
        <div className="rounded-lg border border-[#424242] bg-[#303030] p-4">
          <div className="text-xs text-gray-400">Network Clicks</div>
          <div className="text-xl font-semibold text-gray-100">{t.network_clicks}</div>
        </div>
        <div className="rounded-lg border border-[#424242] bg-[#303030] p-4">
          <div className="text-xs text-gray-400">Network Cost</div>
          <div className="text-xl font-semibold text-gray-100">{t.network_cost}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border-collapse bg-[#212121]">
          <thead>
            <tr className="bg-[#424242] text-gray-300">
              <th className="p-3 text-left text-sm font-semibold">Day</th>
              <th className="p-3 text-left text-sm font-semibold">App</th>
              <th className="p-3 text-left text-sm font-semibold">Country</th>
              <th className="p-3 text-left text-sm font-semibold">Network</th>
              <th className="p-3 text-left text-sm font-semibold">Channel</th>
              <th className="p-3 text-left text-sm font-semibold">Campaign</th>
              <th className="p-3 text-left text-sm font-semibold">Installs</th>
              <th className="p-3 text-left text-sm font-semibold">Clicks</th>
              <th className="p-3 text-left text-sm font-semibold">Impr.</th>
              <th className="p-3 text-left text-sm font-semibold">Events</th>
              <th className="p-3 text-left text-sm font-semibold">Cost</th>
              <th className="p-3 text-left text-sm font-semibold">Net Installs</th>
              <th className="p-3 text-left text-sm font-semibold">Net Clicks</th>
              <th className="p-3 text-left text-sm font-semibold">Net Cost</th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((r, idx) => {
                const rr = pickImportantRowFields(r);

                // ✅ key estable: si viene "key" lo usamos, sino fallback
                const rowKey =
                  r.key ??
                  `${rr.day}-${r.app_token}-${rr.country_code}-${rr.campaign}-${idx}`;

                return (
                  <tr
                    key={rowKey}
                    className={`border-b border-[#424242] ${
                      idx % 2 === 0 ? "bg-[#303030]" : "bg-[#212121]"
                    } hover:bg-[#424242] transition-colors duration-200`}
                  >
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{rr.day}</td>
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{rr.app}</td>
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">
                      {rr.country} ({rr.country_code})
                    </td>
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{rr.network}</td>
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{rr.channel}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.campaign}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.installs}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.clicks}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.impressions}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.events}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.cost}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.network_installs}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.network_clicks}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.network_cost}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={14} className="p-4 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
