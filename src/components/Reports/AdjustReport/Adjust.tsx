"use client";

import { useMemo, useState } from "react";
import { FaFileExcel, FaSync } from "react-icons/fa";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import * as XLSX from "xlsx";
import { getAdjustFullReport } from "@/app/api/report/service";

type AdjustRow = {
  key?: string;

  day: string;
  app: string;
  app_token?: string;

  country: string;
  country_code: string;
  network: string;
  partner_name: string;
  channel: string;
  campaign: string;

  installs: number | string;
  clicks: number | string;

  impressions: string | number;
  events: string | number;
  cost: string | number;

  network_installs: string | number;
  network_clicks: string | number;
  network_cost: string | number;

  purchase_events?: string | number;
  purchase_revenue?: string | number;
  purchase_average_revenue_per_event?: string | number;
  sign_up_events?: string | number;

  [key: string]: any;
};

type AdjustTotals = {
  installs?: number | string;
  clicks?: number | string;
  impressions?: number | string;
  events?: number | string;
  cost?: number | string;
  network_installs?: number | string;
  network_clicks?: number | string;
  network_cost?: number | string;

  purchase_events?: number | string;
  purchase_revenue?: number | string;
  purchase_average_revenue_per_event?: number | string;
  sign_up_events?: number | string;

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
  app_token: r.app_token ?? "",

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

  purchase_events: toNumber(r.purchase_events),
  purchase_revenue: toNumber(r.purchase_revenue),
  purchase_average_revenue_per_event: toNumber(r.purchase_average_revenue_per_event),
  sign_up_events: toNumber(r.sign_up_events),
});

// ✅ columnas que se ven en la tabla (y se pueden ordenar)
type SortKey = keyof ReturnType<typeof pickImportantRowFields>;
type SortDir = "asc" | "desc";

const isNumericKey = (k: SortKey) => {
  return [
    "installs",
    "clicks",
    "impressions",
    "events",
    "cost",
    "network_installs",
    "network_clicks",
    "network_cost",
    "purchase_events",
    "purchase_revenue",
    "purchase_average_revenue_per_event",
    "sign_up_events",
  ].includes(k);
};

const compareValues = (a: any, b: any, numeric: boolean) => {
  if (numeric) {
    const na = toNumber(a);
    const nb = toNumber(b);
    return na === nb ? 0 : na > nb ? 1 : -1;
  }
  const sa = String(a ?? "").toLowerCase();
  const sb = String(b ?? "").toLowerCase();
  return sa.localeCompare(sb);
};

export default function ShowAdjust() {
  const today = new Date().toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  const [grouping, setGrouping] = useState<
    "day" | "week" | "month" | "dayAndapp" | "dayAndCampaign"
  >("day");

  const [rows, setRows] = useState<AdjustRow[]>([]);
  const [totals, setTotals] = useState<AdjustTotals>({});
  const [isLoading, setIsLoading] = useState(false);

  // ✅ SORT state (como en la foto)
  const [sortKey, setSortKey] = useState<SortKey>("day");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const cleanRowsForExcel = useMemo(() => rows.map(pickImportantRowFields), [rows]);

  const sortedRows = useMemo(() => {
    const numeric = isNumericKey(sortKey);
    const dirMul = sortDir === "asc" ? 1 : -1;

    return [...rows].sort((ra, rb) => {
      const a = pickImportantRowFields(ra)[sortKey];
      const b = pickImportantRowFields(rb)[sortKey];
      return compareValues(a, b, numeric) * dirMul;
    });
  }, [rows, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    setSortKey((prevKey) => {
      if (prevKey === key) {
        setSortDir((prevDir) => (prevDir === "asc" ? "desc" : "asc"));
        return prevKey;
      }
      setSortDir("asc");
      return key;
    });
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <FaSort className="ml-2 opacity-60" />;
    return sortDir === "asc" ? (
      <FaSortUp className="ml-2" />
    ) : (
      <FaSortDown className="ml-2" />
    );
  };

  const thClass = (col: SortKey) =>
    `p-3 text-left text-sm font-semibold select-none cursor-pointer whitespace-nowrap ${
      sortKey === col ? "text-white" : "text-gray-300"
    }`;

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
      // ✅ exporta RESPETANDO el orden actual
      const rowsForExcelSorted = sortedRows.map(pickImportantRowFields);

      if (rowsForExcelSorted.length === 0) {
        alert("No hay datos para exportar");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(rowsForExcelSorted);
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

    purchase_events: toNumber(totals.purchase_events),
    purchase_revenue: toNumber(totals.purchase_revenue),
    purchase_avg: toNumber(totals.purchase_average_revenue_per_event),
    sign_up_events: toNumber(totals.sign_up_events),
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
              disabled={rows.length === 0}
              title={rows.length === 0 ? "No hay datos" : "Exportar"}
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
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border-collapse bg-[#212121]">
          <thead>
            <tr className="bg-[#424242]">
              <th onClick={() => handleSort("day")} className={thClass("day")}>
                <div className="inline-flex items-center">
                  Day <SortIcon col="day" />
                </div>
              </th>

              <th onClick={() => handleSort("app")} className={thClass("app")}>
                <div className="inline-flex items-center">
                  App <SortIcon col="app" />
                </div>
              </th>

              <th onClick={() => handleSort("app_token")} className={thClass("app_token")}>
                <div className="inline-flex items-center">
                  App Token <SortIcon col="app_token" />
                </div>
              </th>

              <th onClick={() => handleSort("country")} className={thClass("country")}>
                <div className="inline-flex items-center">
                  Country <SortIcon col="country" />
                </div>
              </th>

              <th onClick={() => handleSort("network")} className={thClass("network")}>
                <div className="inline-flex items-center">
                  Network <SortIcon col="network" />
                </div>
              </th>

              <th onClick={() => handleSort("partner_name")} className={thClass("partner_name")}>
                <div className="inline-flex items-center">
                  Partner <SortIcon col="partner_name" />
                </div>
              </th>

              <th onClick={() => handleSort("channel")} className={thClass("channel")}>
                <div className="inline-flex items-center">
                  Channel <SortIcon col="channel" />
                </div>
              </th>

              <th onClick={() => handleSort("campaign")} className={thClass("campaign")}>
                <div className="inline-flex items-center">
                  Campaign <SortIcon col="campaign" />
                </div>
              </th>

              <th onClick={() => handleSort("installs")} className={thClass("installs")}>
                <div className="inline-flex items-center">
                  Installs <SortIcon col="installs" />
                </div>
              </th>

              <th onClick={() => handleSort("clicks")} className={thClass("clicks")}>
                <div className="inline-flex items-center">
                  Clicks <SortIcon col="clicks" />
                </div>
              </th>

              <th onClick={() => handleSort("impressions")} className={thClass("impressions")}>
                <div className="inline-flex items-center">
                  Impr. <SortIcon col="impressions" />
                </div>
              </th>

              <th onClick={() => handleSort("events")} className={thClass("events")}>
                <div className="inline-flex items-center">
                  Events <SortIcon col="events" />
                </div>
              </th>

              <th onClick={() => handleSort("cost")} className={thClass("cost")}>
                <div className="inline-flex items-center">
                  Cost <SortIcon col="cost" />
                </div>
              </th>

              <th onClick={() => handleSort("network_installs")} className={thClass("network_installs")}>
                <div className="inline-flex items-center">
                  Net Installs <SortIcon col="network_installs" />
                </div>
              </th>

              <th onClick={() => handleSort("network_clicks")} className={thClass("network_clicks")}>
                <div className="inline-flex items-center">
                  Net Clicks <SortIcon col="network_clicks" />
                </div>
              </th>

              <th onClick={() => handleSort("network_cost")} className={thClass("network_cost")}>
                <div className="inline-flex items-center">
                  Net Cost <SortIcon col="network_cost" />
                </div>
              </th>

              <th onClick={() => handleSort("purchase_events")} className={thClass("purchase_events")}>
                <div className="inline-flex items-center">
                  Purchase Events <SortIcon col="purchase_events" />
                </div>
              </th>

              <th onClick={() => handleSort("purchase_revenue")} className={thClass("purchase_revenue")}>
                <div className="inline-flex items-center">
                  Purchase Revenue <SortIcon col="purchase_revenue" />
                </div>
              </th>

              <th
                onClick={() => handleSort("purchase_average_revenue_per_event")}
                className={thClass("purchase_average_revenue_per_event")}
              >
                <div className="inline-flex items-center">
                  Avg Rev / Purchase <SortIcon col="purchase_average_revenue_per_event" />
                </div>
              </th>

              <th onClick={() => handleSort("sign_up_events")} className={thClass("sign_up_events")}>
                <div className="inline-flex items-center">
                  Sign Up <SortIcon col="sign_up_events" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedRows.length > 0 ? (
              sortedRows.map((r, idx) => {
                const rr = pickImportantRowFields(r);

                const rowKey =
                  r.key ?? `${rr.day}-${rr.app_token}-${rr.country_code}-${rr.campaign}-${idx}`;

                return (
                  <tr
                    key={rowKey}
                    className={`border-b border-[#424242] ${
                      idx % 2 === 0 ? "bg-[#303030]" : "bg-[#212121]"
                    } hover:bg-[#424242] transition-colors duration-200`}
                  >
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{rr.day}</td>
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{rr.app}</td>
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{rr.app_token}</td>
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">
                      {rr.country} ({rr.country_code})
                    </td>
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{rr.network}</td>
                    <td className="p-3 text-sm text-gray-300 whitespace-nowrap">{rr.partner_name}</td>
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

                    <td className="p-3 text-sm text-gray-300">{rr.purchase_events}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.purchase_revenue}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.purchase_average_revenue_per_event}</td>
                    <td className="p-3 text-sm text-gray-300">{rr.sign_up_events}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={20} className="p-4 text-center text-gray-500">
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
