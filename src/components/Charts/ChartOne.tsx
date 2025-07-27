import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";
import DefaultSelectOption from "@/components/SelectOption/DefaultSelectOption";
import { useEffect, useState } from "react";
import { getDashboardChartData } from "@/app/api/filtersService/filtersService"; // ajustá la ruta

const ChartOne: React.FC = () => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDashboardChartData();
        setChartData(data?.result || null);
      } catch (error) {
        console.error("Error loading chart data:", error);
      }
    };
  
    fetchData();
  }, []);
  const series = chartData
  ? [
      {
        name: "Clicks",
        data: [
          chartData.BeforeMonth?.totalClick || 0,
          chartData.Month?.totalClick || 0,
          chartData.BeforeYesterday?.totalClick || 0,
          chartData.Yesterday?.totalClick || 0,
          chartData.Today?.totalClick || 0,
        ],
      },
      {
        name: "Installs",
        data: [
          chartData.BeforeMonth?.totalInstall || 0,
          chartData.Month?.totalInstall || 0,
          chartData.BeforeYesterday?.totalInstall || 0,
          chartData.Yesterday?.totalInstall || 0,
          chartData.Today?.totalInstall || 0,
        ],
      },
      {
        name: "Events",
        data: [
          chartData.BeforeMonth?.totalEvent || 0,
          chartData.Month?.totalEvent || 0,
          chartData.BeforeYesterday?.totalEvent || 0,
          chartData.Yesterday?.totalEvent || 0,
          chartData.Today?.totalEvent || 0,
        ],
      },
      {
        name: "Revenue",
        data: [
          chartData.BeforeMonth?.totalRevenue || 0,
          chartData.Month?.totalRevenue || 0,
          chartData.BeforeYesterday?.totalRevenue || 0,
          chartData.Yesterday?.totalRevenue || 0,
          chartData.Today?.totalRevenue || 0,
        ],
      },
      {
        name: "Cost",
        data: [
          chartData.BeforeMonth?.totalCost || 0,
          chartData.Month?.totalCost || 0,
          chartData.BeforeYesterday?.totalCost || 0,
          chartData.Yesterday?.totalCost || 0,
          chartData.Today?.totalCost || 0,
        ],
      },
      {
        name: "Profit",
        data: [
          chartData.BeforeMonth?.totalProfit || 0,
          chartData.Month?.totalProfit || 0,
          chartData.BeforeYesterday?.totalProfit || 0,
          chartData.Yesterday?.totalProfit || 0,
          chartData.Today?.totalProfit || 0,
        ],
      },
    ]
  : [];

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#5750F1", "#0ABEF9", "#34D399", "#F59E0B", "#EF4444", "#A855F7"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    fill: {
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 320,
          },
        },
      },
    ],
    stroke: {
      curve: "smooth",
    },

    markers: {
      size: 0,
    },
    grid: {
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex }) {
        const labels = ["Clicks", "Installs", "Events", "Revenue", "Cost", "Profit"];
        
        let html = `<div style="padding:6px 10px; font-size:13px;">`;
        for (let i = 0; i < series.length; i++) {
          const label = labels[i];
          const value = series[i][dataPointIndex];
          html += `<div><strong>${label}:</strong> ${Number(value).toLocaleString()}</div>`;
        }
        html += `</div>`;
        
        return html;
      }
    },
    xaxis: {
      type: "category",
      categories: ["Last Month", "This Month", "2 Days Ago", "Yesterday", "Today"],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
    },
  };

 

  return (
    <div className="col-span-12 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <div className="mb-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            Payments Overview
          </h4>
        </div>
        <div className="flex items-center gap-2.5">
          <p className="font-medium uppercase text-dark dark:text-dark-6">
            Short by:
          </p>
          <DefaultSelectOption options={["Monthly", "Yearly"]} />
        </div>
      </div>
      <div>
        <div className="-ml-4 -mr-5">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={310}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 text-center xsm:flex-row xsm:gap-0">
  <div className="border-stroke dark:border-dark-3 xsm:w-1/2 xsm:border-r">
    <p className="font-medium">Revenue Today</p>
    <h4 className="mt-1 text-xl font-bold text-dark dark:text-white">
      ${chartData?.Today?.totalRevenue?.toFixed(2) || '0.00'}
    </h4>
  </div>
  <div className="xsm:w-1/2">
    <p className="font-medium">Cost Today</p>
    <h4 className="mt-1 text-xl font-bold text-dark dark:text-white">
      ${chartData?.Today?.totalCost?.toFixed(2) || '0.00'}
    </h4>
  </div>
</div>
    </div>
  );
};

export default ChartOne;
