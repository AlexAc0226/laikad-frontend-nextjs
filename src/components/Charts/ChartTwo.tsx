import { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import DefaultSelectOption from "@/components/SelectOption/DefaultSelectOption";
import { getDashboardChartData } from "@/app/api/filtersService/filtersService";

const ChartTwo: React.FC = () => {
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getDashboardChartData();
        const data = response?.result;

        if (data) {
          setSeries([
            {
              name: "Clicks",
              data: [
                data.BeforeMonth?.totalClick || 0,
                data.Month?.totalClick || 0,
                data.BeforeYesterday?.totalClick || 0,
                data.Yesterday?.totalClick || 0,
                data.Today?.totalClick || 0,
              ],
            },
            {
              name: "Installs",
              data: [
                data.BeforeMonth?.totalInstall || 0,
                data.Month?.totalInstall || 0,
                data.BeforeYesterday?.totalInstall || 0,
                data.Yesterday?.totalInstall || 0,
                data.Today?.totalInstall || 0,
              ],
            },
            {
              name: "Events",
              data: [
                data.BeforeMonth?.totalEvent || 0,
                data.Month?.totalEvent || 0,
                data.BeforeYesterday?.totalEvent || 0,
                data.Yesterday?.totalEvent || 0,
                data.Today?.totalEvent || 0,
              ],
            },
            {
              name: "Revenue",
              data: [
                data.BeforeMonth?.totalRevenue || 0,
                data.Month?.totalRevenue || 0,
                data.BeforeYesterday?.totalRevenue || 0,
                data.Yesterday?.totalRevenue || 0,
                data.Today?.totalRevenue || 0,
              ],
            },
            {
              name: "Cost",
              data: [
                data.BeforeMonth?.totalCost || 0,
                data.Month?.totalCost || 0,
                data.BeforeYesterday?.totalCost || 0,
                data.Yesterday?.totalCost || 0,
                data.Today?.totalCost || 0,
              ],
            },
            {
              name: "Profit",
              data: [
                data.BeforeMonth?.totalProfit || 0,
                data.Month?.totalProfit || 0,
                data.BeforeYesterday?.totalProfit || 0,
                data.Yesterday?.totalProfit || 0,
                data.Today?.totalProfit || 0,
              ],
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);

  const options: ApexOptions = {
    colors: [
      "#5750F1", 
      "#00C4B4", 
      "#10B981", 
      "#0ABEF9", 
      "#F59E0B", 
      "#8B5CF6", 
    ],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 335,
      stacked: true,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    responsive: [{
      breakpoint: 1536,
      options: {
        plotOptions: {
          bar: {
            borderRadius: 3,
            columnWidth: "25%",
          },
        },
      },
    }],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 3,
        columnWidth: "25%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: { enabled: false },
    grid: {
      strokeDashArray: 5,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      categories: ["Last Month", "This Month", "2 Days Ago", "Yesterday", "Today"],
      labels: {
        rotate: 0,
        style: {
          fontSize: '13px',
        },
        trim: false, 
        maxHeight: 120, 
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        radius: 99,
        width: 16,
        height: 16,
        strokeWidth: 10,
        strokeColor: "transparent",
      },
    },
    fill: { opacity: 1 },
  };

  return (
    <div className="col-span-12 rounded-[10px] bg-white px-7.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-5">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-body-2xlg font-bold text-dark dark:text-white">
            Profit this week
          </h4>
        </div>
        <div>
          <DefaultSelectOption options={["This Week", "Last Week"]} />
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-ml-3.5">
          <ReactApexChart options={options} series={series} type="bar" height={370} />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;