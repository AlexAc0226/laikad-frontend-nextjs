"use client";
import jsVectorMap from "jsvectormap";
import "jsvectormap/dist/maps/world-merc.js";
import React, { useEffect, useRef } from "react";
import apiClient from "@/libs/axiosConfig";

const MapOne: React.FC = () => {
  const mapRef = useRef<any>(null);
  const values: Record<string, number> = {};
  const validCountries = new Set<string>();

  const getTopCountriesByClicks = async (dateFrom: string, dateTo: string) => {
    const formattedFrom = dateFrom.replace(/-/g, "");
    const formattedTo = dateTo.replace(/-/g, "");

    try {
      const response = await apiClient.get(
        `/reports/ranking-offer-clicks?datefrom=${formattedFrom}&dateto=${formattedTo}&type=country`,
        {
          headers: {
            "Access-Token": localStorage.getItem("accessToken"),
          },
        }
      );
      return response.data.result;
    } catch (error) {
      console.error("Error fetching top countries by clicks:", error);
      throw error;
    }
  };

 useEffect(() => {
  const values: Record<string, number> = {};
  const validCountries = new Set<string>();

  const mapElement = document.querySelector("#mapOne");
  if (!mapElement) return;

  const map = new jsVectorMap({
    selector: "#mapOne",
    map: "world_merc",
    zoomButtons: true,
    regionStyle: {
      initial: {
        fill: "#E5E5E5",
      },
      hover: {
        fillOpacity: 1,
        fill: "#3056D3",
      },
    },
    series: {
      regions: [
        {
          scale: ["#E5E5E5", "#1E3A8A"],
          normalizeFunction: "linear",
          values: {}, // inicial
        },
      ],
    },
    regionLabelStyle: {
      initial: {
        fontFamily: "Satoshi",
        fontWeight: "semibold",
        fill: "#fff",
      },
      hover: {
        cursor: "pointer",
      },
    },
    labels: {
      regions: {
        render(code: string) {
          return validCountries.has(code) ? code : null;
        },
      },
    },
    onRegionTooltipShow: function (tooltip, code) {
      if (validCountries.has(code)) {
        const clicks = values[code] ?? 0;
        tooltip.innerHTML = `${code} — Clicks: ${clicks}`;
      } else {
        tooltip.innerHTML = "";
      }
    },
  });

  mapRef.current = map;

  const loadData = async () => {
    try {
      const topData = await getTopCountriesByClicks("2025-05-30", "2025-05-30");

      topData.forEach((item: any) => {
        if (/^[A-Z]{2}$/.test(item.CountryCode)) {
          values[item.CountryCode] = item.totalClicks;
          validCountries.add(item.CountryCode);
        }
      });

      mapRef.current.series.regions[0].setValues(values);
    } catch (err) {
      console.error("Error loading country click data:", err);
    }
  };

  loadData();

  return () => {
    try {
      if (
        mapRef.current &&
        mapRef.current.container &&
        document.body.contains(mapRef.current.container)
      ) {
        mapRef.current.destroy();
      }
    } catch (error) {
      console.warn("Error during map destroy:", error);
    } finally {
      mapRef.current = null;
    }
  };
}, []);


  return (
    <div className="col-span-12 rounded-[10px] bg-white p-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <h4 className="mb-7 text-body-2xlg font-bold text-dark dark:text-white">
        Region labels
      </h4>
      <div className="h-[422px]">
        <div id="mapOne" className="mapOne map-btn"></div>
      </div>
    </div>
  );
};

export default MapOne;