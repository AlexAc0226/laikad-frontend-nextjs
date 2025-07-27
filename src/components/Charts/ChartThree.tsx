import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { getDashboardChartData } from "@/app/api/filtersService/filtersService";

const metricOptions = [
  { key: "totalClick", label: "Clicks" },
  { key: "totalInstall", label: "Installs" },
  { key: "totalEvent", label: "Events" },
  { key: "totalRevenue", label: "Revenue" },
  { key: "totalCost", label: "Cost" },
  { key: "totalProfit", label: "Profit" },
];

const ChartThree: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [selectedMetric, setSelectedMetric] = useState("totalInstall");
  const [series, setSeries] = useState<number[]>([]);
  const [labels] = useState([
    "Last Month",
    "This Month",
    "2 Days Ago",
    "Yesterday",
    "Today",
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardChartData();
        setData(response?.result);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!data) return;

    setSeries([
      data.BeforeMonth?.[selectedMetric] || 0,
      data.Month?.[selectedMetric] || 0,
      data.BeforeYesterday?.[selectedMetric] || 0,
      data.Yesterday?.[selectedMetric] || 0,
      data.Today?.[selectedMetric] || 0,
    ]);
  }, [data, selectedMetric]);

  const chartOptions: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: ["#5750F1", "#5475E5", "#8099EC", "#ADBCF2", "#C7D6F9"],
    labels,
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
              label: metricOptions.find(m => m.key === selectedMetric)?.label || "",
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
          <ReactApexChart options={chartOptions} series={series} type="donut" />
        </div>
      </div>
    </div>
  );
};

export default ChartThree;