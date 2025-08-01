"use client";

import { useTopOffersByClicks } from "@/hooks/useTopOffersByClicks";
import { Sparkles } from "lucide-react";

const TableOne = () => {
  const { data, loading, error } = useTopOffersByClicks("20250601", "20250608");

  if (loading) return <p className="text-gray-800 dark:text-white">Cargando top 10 de ofertas...</p>;
  if (error) return <p className="text-red-500">Error al cargar datos: {error}</p>;

  const maxClicks = data[0]?.clicks || 1;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-lg">
      <h4 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-500 dark:text-yellow-400" /> Top 10 Offers per Click
      </h4>

      <div className="grid grid-cols-3 px-3 pb-2 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
        <div className="text-left">Offer</div>
        <div className="text-center">Clicks</div>
        <div className="text-right">%</div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.map((offer) => {
          const percent = ((offer.clicks / maxClicks) * 100).toFixed(1);

          return (
            <div
              key={offer.offerId}
              className="grid grid-cols-3 items-center px-3 py-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition"
            >
              <p className="text-sm text-gray-800 dark:text-white truncate">{offer.offerName}</p>
              <p className="text-center text-sm text-gray-800 dark:text-white">
                {offer.clicks.toLocaleString()}
              </p>
              <p className="text-right text-sm text-gray-800 dark:text-white">{percent}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableOne;
