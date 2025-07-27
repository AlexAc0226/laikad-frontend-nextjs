import { ApexOptions } from "apexcharts";
import React, { useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";

const metricOptions = [
  { key: "Clicks", label: "Clicks" },
  { key: "Install", label: "Installs" },
  { key: "Events", label: "Events" },
  { key: "Revenue", label: "Revenue" },
];

interface ChartAdvertiserDonutProps {
  campaigns: any[];
}

const ChartAdvertiserDonut: React.FC<ChartAdvertiserDonutProps> = ({ campaigns }) => {
  const [selectedMetric, setSelectedMetric] = useState("Clicks");

 const series = useMemo(() => {
  if (!Array.isArray(campaigns)) return [0];
  const total = campaigns.reduce((acc, c) => acc + (c?.[selectedMetric] || 0), 0);
  return [total];
}, [campaigns, selectedMetric]);

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: ["#5750F1", "#5475E5", "#8099EC", "#ADBCF2", "#C7D6F9"],
    labels: [selectedMetric],
    legend: {
      show: false,
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          background: "transparent",
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label:
                metricOptions.find((m) => m.key === selectedMetric)?.label || "",
              fontSize: "16px",
              fontWeight: "400",
            },
            value: {
              show: true,
              fontSize: "28px",
              fontWeight: "bold",
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: { width: 415 },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: { width: 200 },
        },
      },
    ],
  };

  return (
    <div className="col-span-12 rounded-[10px] bg-white px-7.5 pb-7 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-5">
      <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:justify-between">
        <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
          Metric Distribution
        </h4>
        <select
          className="rounded border px-3 py-1 text-sm dark:bg-gray-800 dark:text-white"
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        >
          {metricOptions.map((metric) => (
            <option key={metric.key} value={metric.key}>
              {metric.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8">
        <div className="mx-auto flex justify-center">
          <ReactApexChart
            options={chartOptions}
            series={series}
            type="donut"
          />
        </div>
      </div>
    </div>
  );
};

export default ChartAdvertiserDonut;
