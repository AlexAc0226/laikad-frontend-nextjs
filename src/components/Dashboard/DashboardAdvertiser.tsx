"use client";
import React, { useState, useEffect, useCallback } from "react";
import { CalendarIcon, RefreshCcw, Filter, FileDown } from "lucide-react";
import { getTotalOffersAdvertiser } from "@/app/api/filtersService/filtersService";
import * as XLSX from "xlsx";
import ChartAdvertiserDonut from "../Charts/ChartAdvertiserDonut";


const DashboardAdvertiser: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ clicks: 0, install: 0, events: 0, revenue: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTotalOffersAdvertiser(from, to);
      const data = res.result.result || [];
      setCampaigns(data);

      const totalClicks = data.reduce((acc, c) => acc + (c.Clicks || 0), 0);
      const totalInstall = data.reduce((acc, c) => acc + (c.Install || 0), 0);
      const totalEvents = data.reduce((acc, c) => acc + (c.Events || 0), 0);
      const totalRevenue = data.reduce((acc, c) => acc + (c.Revenue || 0), 0);

      setTotals({
        clicks: totalClicks,
        install: totalInstall,
        events: totalEvents,
        revenue: totalRevenue,
      });
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(campaigns);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaigns');
    XLSX.writeFile(workbook, `Advertiser_Campaigns_${from}_to_${to}.xlsx`);
  };

  return (
    <div className="p-6 min-h-screen bg-white text-slate-800 dark:bg-slate-900 dark:text-white transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {[{ icon: "👍", label: "Clicks", value: totals.clicks },
          { icon: "📱", label: "Install", value: totals.install },
          { icon: "⬇️", label: "Events", value: totals.events },
          { icon: "💰", label: "Revenue", value: `$${totals.revenue.toFixed(2)}` },
        ].map((item, i) => (
          <div key={i} className="bg-slate-200 dark:bg-slate-800 rounded-xl shadow p-6 flex flex-col items-center transition-colors">
            <div className="text-3xl">{item.icon}</div>
            <div className="mt-2 text-sm text-slate-700 dark:text-gray-300">{item.label}</div>
            <div className="text-xl font-bold mt-1">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-slate-200 dark:bg-slate-800 mt-6 p-4 rounded-xl shadow transition-colors">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="text-sm text-gray-300">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="block mt-1 p-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-gray-300 dark:border-slate-600 rounded transition-colors"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="block mt-1 p-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-white border border-gray-300 dark:border-slate-600 rounded transition-colors"
            />
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow mt-6"
          >
            <Filter size={16} /> Filter
          </button>
          <button
            onClick={() => {
              setFrom(today);
              setTo(today);
              fetchData();
            }}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded shadow mt-6"
          >
            <RefreshCcw size={16} />
          </button>
          {campaigns.length > 0 && (
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow mt-6"
            >
              <FileDown size={16} /> Export Excel
            </button>
          )}
        </div>
      </div>

     

   
      <div className="bg-white dark:bg-slate-800 mt-6 p-4 rounded-xl shadow overflow-x-auto transition-colors">
        <table className="min-w-full text-sm text-slate-800 dark:text-gray-300 transition-colors">
          <thead className="bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white transition-colors">
            <tr>
              {["CampaignID", "Name", "Click", "Install", "Events", "Revenue"].map((head, i) => (
                <th key={i} className="px-4 py-2 text-left font-semibold">{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center p-4">Loading...</td></tr>
            ) : campaigns.length > 0 ? (
              campaigns.map((c, i) => (
                <tr key={i} className="hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <td className="px-4 py-2">{c.CampaignID}</td>
                  <td className="px-4 py-2">{c.Offer}</td>
                  <td className="px-4 py-2">{c.Clicks}</td>
                  <td className="px-4 py-2">{c.Install}</td>
                  <td className="px-4 py-2">{c.Events}</td>
                  <td className="px-4 py-2">${(c.Revenue || 0).toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="text-center p-4 text-gray-400">No data</td></tr>
            )}
          </tbody>
        </table>
        
      </div>
       <div className="mt-6">
        <ChartAdvertiserDonut campaigns={campaigns} />
      </div>
    </div>
  );
};

export default DashboardAdvertiser;
