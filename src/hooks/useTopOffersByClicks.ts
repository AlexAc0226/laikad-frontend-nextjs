import { useEffect, useState } from "react";
import apiClient from "@/libs/axiosConfig"; // asegurate que apunta bien a tu axiosConfig

interface OfferClicks {
  offerId: string;
  offerName: string;
  clicks: number;
}

export function useTopOffersByClicks(dateFrom: string, dateTo: string) {
  const [data, setData] = useState<OfferClicks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      try {
        const response = await apiClient.get(
          `/reports/ranking-offer-clicks?datefrom=${dateFrom}&dateto=${dateTo}&type=click`,
          {
            headers: {
              "Access-Token": token,
            },
          }
        );

       setData(
  response.data.result.slice(0, 10).map((item: any) => ({
    offerId: item.offer.OfferID,
    offerName: item.offer.Offer,
    clicks: item.totalClicks,
  }))
);
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