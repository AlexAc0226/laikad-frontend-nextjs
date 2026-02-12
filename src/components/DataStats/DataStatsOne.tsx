"use client";

import { getDashboardData } from '@/app/api/dashboard/dashboard';
import { getReportsCampaignTotal } from '@/app/api/report/service';
import { dataStats } from '@/types/dataStats';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// ✅ Agregado: hook AI
import { useLaikadAI } from "@/hooks/useLaikadAI";

interface DataStatsOneProps {
  filters?: {
    fromDate?: string;
    toDate?: string;
    advertiserID?: number;
    supplierID?: number;
  };
}

const DataStatsOne: React.FC<DataStatsOneProps> = ({ filters }) => {
  const [data, setData] = useState<any | null>(null);
  const router = useRouter();
  const [checkingRole, setCheckingRole] = useState(true);

  // ✅ Agregado: estado + hook AI
  const { askAI, loading: aiLoading } = useLaikadAI();
  const [aiResponse, setAiResponse] = useState<string>("");

  async function testAI() {
    try {
      setAiResponse("");
      const reply = await askAI([
        {
          role: "user",
          content:
            "Escribime un mail corto para pedirle a un publisher más volumen de tráfico en una campaña CPA.",
        },
      ]);
      setAiResponse(reply || "Sin respuesta");
    } catch (e: any) {
      setAiResponse(`Error: ${e?.message || String(e)}`);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const roleId = localStorage.getItem('RoleID');

    if (roleId === '7') {
      router.replace('/dashboard/dashboardAdvertiser');
      return;
    }

    if (roleId === '8') {
      router.replace('/dashboard/dashboardSuppliers');
      return;
    }

    if (!token) {
      setData({
        Clicks: 0,
        Install: 0,
        Events: 0,
        Cost: 0,
        Revenue: 0,
        Profit: 0,
        TrackingProxy: 0,
      });
      setCheckingRole(false);
      return;
    }

    const fetchData = async () => {
      try {
        const response = await getReportsCampaignTotal(
          filters?.fromDate?.replace(/-/g, '') || '',
          filters?.toDate?.replace(/-/g, '') || '',
          filters?.advertiserID,
          filters?.supplierID,
          undefined,
          undefined,
          undefined,
          undefined,
          '0',
          '1',
          '1',
          '0',
          '0',
          '0',
          '0',
          '0',
          '0', '0', '0',
          'Greater', 'Greater', 'Greater',
          '0'
        );

        const todayData = response?.body?.result?.reduce(
          (acc: any, item: any) => {
            acc.Clicks += Number(item.totalClick || 0);
            acc.Install += Number(item.totalInstall || 0);
            acc.Events += Number(item.totalEvent || 0);
            acc.Cost += Number(item.totalCost || 0);
            acc.Revenue += Number(item.totalRevenue || 0);
            acc.Profit += Number(item.totalProfit || 0);
            acc.TrackingProxy += Number(item.totalProxy || 0);
            return acc;
          },
          {
            Clicks: 0,
            Install: 0,
            Events: 0,
            Cost: 0,
            Revenue: 0,
            Profit: 0,
            TrackingProxy: 0,
          }
        );

        setData(todayData);
      } catch (error) {
        console.error("Error fetching filtered stats:", error);
      } finally {
        setCheckingRole(false);
      }
    };

    if (roleId === '3' || roleId === '9') {
      fetchData();
    } else {
      setCheckingRole(false);
    }
  }, [filters, router]);

  if (checkingRole) {
    return null;
  }

  const dataStatsList = [
    {
      icon: (
        <svg width="26" height="26" className="text-black dark:text-white" viewBox="0 0 497.25 497.25" xmlns="http://www.w3.org/2000/svg">
          <g>
            <g>
              <path d="M144.788,66.938c0-26.775,21.038-47.812,47.812-47.812s47.812,21.038,47.812,47.812v45.9
              c11.474-11.475,19.125-28.688,19.125-45.9C259.538,30.6,228.938,0,192.601,0s-66.938,30.6-66.938,66.938
              c0,19.125,7.65,34.425,19.125,45.9V66.938z" />
              <path d="M422.1,172.125c-15.3,0-28.688,13.388-28.688,28.688v42.075v5.737h-19.125v-43.987v-22.95
              c0-15.3-13.388-28.688-28.688-28.688s-28.688,13.388-28.688,28.688v19.125V229.5h-19.125v-28.688v-38.25
              c0-15.3-13.388-28.688-28.688-28.688s-28.687,13.388-28.687,28.688V198.9v49.725h-19.125v-47.812V66.938
              c0-15.3-13.388-28.688-28.688-28.688s-28.688,13.388-28.688,28.688v196.987c-40.163-42.075-91.8-87.975-112.837-66.938
              c-21.038,21.038,32.512,78.413,107.1,204.638c34.425,57.375,76.5,95.625,149.174,95.625c78.412,0,143.438-65.025,143.438-143.438
              V290.7v-89.888C450.788,185.513,437.4,172.125,422.1,172.125z" />
            </g>
          </g>
        </svg>
      ),
      color: '#3FD97F',
      title: 'Total Clicks',
      value: data ? data.Clicks : '0',
      growthRate: data ? data.ClickCountGrowthRate || 0 : 0,
    },
    {
      icon: (
        <svg width="26" className="text-black dark:text-white" height="26" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <rect width="48" height="48" fill="currentColor" fillOpacity="0.01" />
          <path
            d="M41.4004 11.551L36.3332 5H11.6666L6.58398 11.551"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 13C6 11.8954 6.89543 11 8 11H40C41.1046 11 42 11.8954 42 13V40C42 41.6569 40.6569 43 39 43H9C7.34315 43 6 41.6569 6 40V13Z"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path d="M32 27L24 35L16 27" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M23.9917 19V35" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      color: 'black',
      title: 'Total Install',
      value: data ? data.Install : '0',
      growthRate: 4.35,
    },
    {
      icon: (
        <svg width="26" height="26" className="text-black dark:text-white" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path
            d="M6,30H26a2,2,0,0,0,2-2V22a2,2,0,0,0-2-2H6a2,2,0,0,0-2,2v6A2,2,0,0,0,6,30Zm0-8H26v6H6Z"
            transform="translate(0 0)"
            fill="currentColor"
          />
          <circle cx="9" cy="25" r="1" fill="currentColor" />
          <path
            d="M26,2,24.59,3.41,27.17,6H22.315A6.9835,6.9835,0,0,0,9.08,10H4.83L7.41,7.41,6,6,1,11l5,5,1.41-1.41L4.83,12H9.685A6.9835,6.9835,0,0,0,22.92,8h4.25l-2.58,2.59L26,12l5-5ZM21,9a4.983,4.983,0,0,1-8.9745,3H16V10H11.1011a4.9852,4.9852,0,0,1,8.8734-4H16V8h4.8989A5.0019,5.0019,0,0,1,21,9Z"
            transform="translate(0 0)"
            fill="currentColor"
          />
        </svg>
      ),
      color: '#8155FF',
      title: 'Total Proxy',
      value: data ? data.TrackingProxy : '0.00',
      growthRate: 2.59,
    },
    {
      icon: (
        <svg width="26" height="26" className="text-black dark:text-white" viewBox="0 0 652.801 652.801" xmlns="http://www.w3.org/2000/svg">
          <g>
            <g id="_x35__39_">
              <g>
                <path d="M142.8,367.199h40.8V326.4h-40.8V367.199z M142.8,530.4h40.8V489.6h-40.8V530.4z M550.801,40.8H469.2V20.4 c0-11.261-9.139-20.4-20.399-20.4s-20.4,9.139-20.4,20.4v20.4h-204V20.4C224.4,9.139,215.261,0,204,0s-20.4,9.139-20.4,20.4v20.4 H102c-45.063,0-81.6,36.537-81.6,81.6v448.799c0,45.064,36.537,81.602,81.6,81.602h448.8c45.063,0,81.6-36.537,81.6-81.602V122.4 C632.4,77.336,595.864,40.8,550.801,40.8z" />
              </g>
            </g>
          </g>
        </svg>
      ),
      color: '#18BFFF',
      title: 'Total Events',
      value: data ? data.Events : '0',
      growthRate: -0.95,
    },
    {
      icon: (
        <svg
          width="26"
          height="26"
          className="text-black dark:text-white"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
          style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}
        >
          <path d="M6,29l22,-0c0.552,0 1,-0.448 1,-1l-0,-18c0,-0.552 -0.448,-1 -1,-1l-4,-0c-0.552,-0 -1,0.448 -1,1l-0,17l-2,-0l-0,-12c0,-0.552 -0.448,-1 -1,-1l-4,-0c-0.552,-0 -1,0.448 -1,1l-0,12l-2,-0l0,-7.988c0,-0.552 -0.448,-1 -1,-1l-4,0c-0.552,0 -1,0.448 -1,1l0,7.988l-1,-0c-0.265,0 -0.52,-0.105 -0.707,-0.293c-0.188,-0.187 -0.293,-0.442 -0.293,-0.707l0,-22c-0,-0.552 -0.448,-1 -1,-1c-0.552,-0 -1,0.448 -1,1l0,22c-0,0.796 0.316,1.559 0.879,2.121c0.562,0.563 1.325,0.879 2.121,0.879Z" />
          <path d="M10.003,4l-0.003,0c-1.656,0 -3,1.344 -3,3c0,1.656 1.344,3 3,3c0,0 2,-0 2,-0c0.552,-0 1,0.448 1,1c-0,0.552 -0.448,1 -1,1c-0,-0 -3,-0 -3,-0c-0.552,0 -1,0.448 -1,1c0,0.552 0.448,1 1,1l1.003,-0l0,1c0,0.552 0.449,1 1,1c0.552,0 1,-0.448 1,-1l0,-1c1.655,-0.002 2.997,-1.345 2.997,-3c-0,-1.656 -1.344,-3 -3,-3c-0,-0 -2,0 -2,0c-0.552,0 -1,-0.448 -1,-1c0,-0.552 0.448,-1 1,-1l3,0c0.552,0 1,-0.448 1,-1c0,-0.552 -0.448,-1 -1,-1l-0.997,0l0,-1c0,-0.552 -0.448,-1 -1,-1c-0.551,0 -1,0.448 -1,1l0,1Z" />
        </svg>
      ),
      color: 'red',
      title: 'Total Revenue',
      value: `$${data ? data.Revenue.toFixed(2) : '0.00'}`,
      growthRate: -0.95,
    },
    {
      icon: (
        <svg width="26" height="26" className="text-black dark:text-white" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M5,51h29v-2H5c-1.654,0-3-1.346-3-3V18c0-1.654,1.346-3,3-3h46v-2H5c-2.757,0-5,2.243-5,5v28C0,48.757,2.243,51,5,51z" />
          <path d="M59,13h-2.324l1.226-2.569l-1.805-0.861l-21,44l1.805,0.861L38.54,51H59c2.757,0,5-2.243,5-5V18C64,15.243,61.757,13,59,13z" />
          <path d="M49,17H8c-0.552,0-1,0.447-1,1c0,1.103-0.897,2-2,2c-0.552,0-1,0.447-1,1v22c0,0.553,0.448,1,1,1c1.103,0,2,0.897,2,2 c0,0.553,0.448,1,1,1h28v-2H8.874C8.511,43.597,7.404,42.489,6,42.127V21.873c1.404-0.362,2.511-1.47,2.874-2.873H49V17z" />
          <path d="M21,32c0,6.065,4.935,11,11,11s11-4.935,11-11s-4.935-11-11-11S21,25.935,21,32z" />
        </svg>
      ),
      color: 'blue',
      title: 'Total Cost',
      value: data ? `$${data.Cost.toFixed(2)}` : '$0.00',
      growthRate: -0.95,
    },
    {
      icon: (
        <svg width="26" className="text-black dark:text-white" height="26" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M16,28h8.042A5.958,5.958,0,0,1,30,33.958V36H21.958A5.958,5.958,0,0,1,16,30.042V28Z" fill="#027de5" />
          <circle cx="32" cy="13" r="10" fill="#027de5" />
        </svg>
      ),
      color: 'violet',
      title: 'Total Profit',
      value: `$${data ? data.Profit.toFixed(2) : '0.00'}`,
      growthRate: -0.95,
    },
  ];

  return (
    <div>
      {/* ✅ BLOQUE IA (TEMPORAL PARA TESTEAR) */}
      <div className="mb-4 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-dark">
        <div className="mb-2 text-lg font-semibold text-black dark:text-white">
          Test ChatGPT (Laikad)
        </div>

        <button
          onClick={testAI}
          disabled={aiLoading}
          className="rounded-md border border-black px-4 py-2 text-black dark:border-white dark:text-white"
        >
          {aiLoading ? "Pensando..." : "Probar IA"}
        </button>

        {aiResponse && (
          <pre className="mt-3 whitespace-pre-wrap rounded bg-black/5 p-3 text-sm text-black dark:bg-white/10 dark:text-white">
            {aiResponse}
          </pre>
        )}
      </div>

      {/* ✅ TU GRID ORIGINAL */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dataStatsList.map((item, index) => (
          <div key={index} className="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-dark">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: item.color }}
            >
              {item.icon}
            </div>
            <div className="mb-4 text-lg font-semibold text-black dark:text-white">{item.title}</div>
            <div className="text-2xl font-bold text-black dark:text-white">{item.value}</div>
            <div
              className={`text-sm font-medium ${Number(item.growthRate) > 0 ? 'text-green-500' : 'text-red-500'}`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataStatsOne;
