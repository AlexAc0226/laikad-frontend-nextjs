"use client";

import { useEffect, useState } from "react";
import apiClient from "@/libs/axiosConfig";
import { Globe2 } from "lucide-react";

interface CountryClicks {
  countryCode: string;
  countryName: string;
  clicks: number;
}

export function useTopCountriesByClicks(dateFrom: string, dateTo: string) {
  const [data, setData] = useState<CountryClicks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      try {
        const response = await apiClient.get(
          `/reports/ranking-offer-clicks?datefrom=${dateFrom}&dateto=${dateTo}&type=country`,
          {
            headers: {
              "Access-Token": token,
            },
          }
        );

        const topCountries = response.data.result
          .filter((item: any) => /^[A-Z]{2}$/.test(item.CountryCode))
          .slice(0, 10)
          .map((item: any) => ({
            countryCode: item.CountryCode,
            countryName: item.CountryName,
            clicks: item.totalClicks,
          }));

        setData(topCountries);
      } catch (err: any) {
        setError(err.message || "Error al obtener datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateFrom, dateTo]);

  return { data, loading, error };
}

const TopCountriesCard = () => {
  const { data, loading, error } = useTopCountriesByClicks("20250601", "20250608");
  const maxClicks = data[0]?.clicks || 1;

  if (loading) return <p className="text-gray-800 dark:text-white">Cargando top 10 de países...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-lg min-w-[320px]">
      <h4 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Globe2 className="h-5 w-5 text-blue-500 dark:text-blue-400" /> Top 10 Countries per Clicks
      </h4>

      <div className="w-full overflow-hidden">
        <div className="flex justify-between px-3 pb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
          <span className="w-1/2 text-left">Country</span>
          <span className="w-1/4 text-center">Clicks</span>
          <span className="w-1/4 text-right">%</span>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item) => {
            const percent = ((item.clicks / maxClicks) * 100).toFixed(1);

            return (
              <div
                key={item.countryCode}
                className="flex justify-between items-center px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition"
              >
                <p className="w-1/2 text-sm text-gray-800 dark:text-white truncate">{item.countryName}</p>
                <p className="w-1/4 text-center text-sm text-gray-800 dark:text-white">
                  {item.clicks.toLocaleString()}
                </p>
                <p className="w-1/4 text-right text-sm text-gray-800 dark:text-white">{percent}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopCountriesCard;