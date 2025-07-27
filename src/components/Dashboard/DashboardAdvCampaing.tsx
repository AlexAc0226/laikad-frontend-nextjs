"use client";
import React, { useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { getCampaignsAdvertiser } from "@/app/api/filtersService/filtersService";
import Image from "next/image";

const DashboardAdvCampaign: React.FC = () => {
  const [status, setStatus] = useState("ALL");
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = async (statusFilter: string) => {
    setLoading(true);
    try {
      if (statusFilter === "ALL") {
        const activeRes = await getCampaignsAdvertiser("A");
        const pausedRes = await getCampaignsAdvertiser("P");
        const all = [...(activeRes.result || []), ...(pausedRes.result || [])];
        setCampaigns(all);
      } else {
        const statusParam = statusFilter === "ACTIVE" ? "A" : "P";
        const res = await getCampaignsAdvertiser(statusParam);
        setCampaigns(res.result || []);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(status);
  }, [status]);

  return (
    <div className="flex h-screen bg-white text-slate-900 dark:bg-[#0F172A] dark:text-white transition-colors">
      <main className="flex-1 flex flex-col px-6 py-6">
        <h2 className="text-xl font-semibold mb-6">Contacts Supplier:</h2>

        <div className="flex flex-wrap items-center justify-between mb-6">
          <input
            type="text"
            placeholder="Search"
            className="w-72 p-2 bg-white dark:bg-[#1E293B] text-slate-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded shadow transition-colors"
          />
          <div className="flex items-center gap-2">
            <button
              className={`px-4 py-2 text-white rounded flex items-center gap-1 shadow transition ${
                status === "ACTIVE" ? "bg-green-600" : "bg-green-500 hover:bg-green-600"
              }`}
              onClick={() => setStatus("ACTIVE")}
            >
              <Play size={16} /> ACTIVE
            </button>
            <button
              className={`px-4 py-2 text-white rounded shadow transition ${
                status === "ALL" ? "bg-blue-600" : "bg-blue-500 hover:bg-blue-600"
              }`}
              onClick={() => setStatus("ALL")}
            >
              ALL
            </button>
            <button
              className={`px-4 py-2 text-white rounded flex items-center gap-1 shadow transition ${
                status === "PAUSED" ? "bg-red-600" : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={() => setStatus("PAUSED")}
            >
              <Pause size={16} /> PAUSED
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center text-gray-400">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-500">
            <div className="text-5xl mb-4">🎫</div>
            <p className="text-lg">Campaigns</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white dark:bg-[#1E293B] rounded-xl p-4 shadow hover:bg-gray-100 dark:hover:bg-[#273549] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src="/logo-laikad.svg"
                    alt="Logo"
                    width={48}
                    height={48}
                    className="object-contain rounded-full bg-white dark:bg-slate-800 p-1"
                  />
                  <div>
                    <div className="flex gap-2 flex-wrap">
                      <span className="bg-cyan-600 text-white px-2 py-1 text-xs rounded font-semibold">
                        CampaignID #{c.CampaignID}
                      </span>
                      <span className="bg-cyan-500 text-white px-2 py-1 text-xs rounded font-semibold">
                        {c.Campaign}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-700 dark:text-gray-300 font-medium text-center">
                  - {c.Countrys} - ${c.Cost} - {c.Install || 0} install -
                </div>

                <div>
                  {c.Preview && (
                    <a
                      href={c.Preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-4 py-1 rounded text-sm font-medium hover:bg-green-700"
                    >
                      Preview
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardAdvCampaign;
