"use client";

import { useTopOffersByClicks } from "@/hooks/useTopOffersByClicks";
import { Sparkles } from "lucide-react";

const TableOne = () => {
  const { data, loading, error } = useTopOffersByClicks("20250601", "20250608");

  if (loading) return <p>Cargando top 10 de ofertas...</p>;
  if (error) return <p>Error al cargar datos: {error}</p>;

  const maxClicks = data[0]?.clicks || 1;

  return (
    <div className="rounded-2xl bg-gray-900 p-6 shadow-lg">
      <h4 className="mb-6 text-lg font-semibold text-white flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-yellow-400" /> Top 10 Ofertas por Clics
      </h4>

      <div className="grid grid-cols-3 px-3 pb-2 text-xs font-medium uppercase text-gray-400">
        <div className="text-left">Oferta</div>
        <div className="text-center">Clicks</div>
        <div className="text-right">%</div>
      </div>

      <div className="divide-y divide-gray-700">
        {data.map((offer, idx) => {
          const percent = ((offer.clicks / maxClicks) * 100).toFixed(1);

          return (
            <div
              key={offer.offerId}
              className="grid grid-cols-3 items-center px-3 py-3 hover:bg-gray-800 rounded-md transition"
            >
              <p className="text-sm text-white truncate">{offer.offerName}</p>
              <p className="text-center text-sm text-white">{offer.clicks.toLocaleString()}</p>
              <p className="text-right text-sm text-white">{percent}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableOne;