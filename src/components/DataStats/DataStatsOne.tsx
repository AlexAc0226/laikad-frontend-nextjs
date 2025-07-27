import { getDashboardData } from '@/app/api/dashboard/dashboard';
import { getReportsCampaignTotal } from '@/app/api/report/service';
import { dataStats } from '@/types/dataStats';
import React, { useEffect, useState } from 'react';


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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    setIsAuthenticated(!!token);

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
          '0', '0', '0',
          'Greater', 'Greater', 'Greater',
          '0'
        );

        const roleID = localStorage.getItem('RoleID');
        const isFiltered = roleID !== '9' && roleID !== '3';
        const userId = parseInt(localStorage.getItem('UserID') || '', 10);

        const filteredData = isFiltered ? response?.body?.result?.filter((item: any) => 
          parseInt(item.AccountManagerID) === userId || parseInt(item.AccountManagerIDAdv) === userId
        ) : response?.body?.result;

        const todayData = filteredData?.reduce(
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
          { Clicks: 0, Install: 0, Events: 0, Cost: 0, Revenue: 0, Profit: 0, TrackingProxy: 0 }
        );
        setData(todayData);


      } catch (error) {
        console.error("Error fetching filtered stats:", error);
      }
    };

    fetchData();
  }, [filters]); 
  
  const dataStatsList = [
    {
      icon: (
        <svg width="26" height="26" className="text-black dark:text-white" viewBox="0 0 497.25 497.25" xmlns="http://www.w3.org/2000/svg">
          <g>
            <g>
              <path
                d="M144.788,66.938c0-26.775,21.038-47.812,47.812-47.812s47.812,21.038,47.812,47.812v45.9
              c11.474-11.475,19.125-28.688,19.125-45.9C259.538,30.6,228.938,0,192.601,0s-66.938,30.6-66.938,66.938
              c0,19.125,7.65,34.425,19.125,45.9V66.938z"
              />
              <path
                d="M422.1,172.125c-15.3,0-28.688,13.388-28.688,28.688v42.075v5.737h-19.125v-43.987v-22.95
              c0-15.3-13.388-28.688-28.688-28.688s-28.688,13.388-28.688,28.688v19.125V229.5h-19.125v-28.688v-38.25
              c0-15.3-13.388-28.688-28.688-28.688s-28.687,13.388-28.687,28.688V198.9v49.725h-19.125v-47.812V66.938
              c0-15.3-13.388-28.688-28.688-28.688s-28.688,13.388-28.688,28.688v196.987c-40.163-42.075-91.8-87.975-112.837-66.938
              c-21.038,21.038,32.512,78.413,107.1,204.638c34.425,57.375,76.5,95.625,149.174,95.625c78.412,0,143.438-65.025,143.438-143.438
              V290.7v-89.888C450.788,185.513,437.4,172.125,422.1,172.125z"
              />
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
          {}
          <rect width="48" height="48" fill="currentColor" fillOpacity="0.01" />
          {}
          <path
            d="M41.4004 11.551L36.3332 5H11.6666L6.58398 11.551"
              stroke="currentColor"

            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {}
          <path
            d="M6 13C6 11.8954 6.89543 11 8 11H40C41.1046 11 42 11.8954 42 13V40C42 41.6569 40.6569 43 39 43H9C7.34315 43 6 41.6569 6 40V13Z"
           fill="currentColor"
              stroke="currentColor"

            strokeWidth="4"
            strokeLinejoin="round"
          />
          {}
          <path d="M32 27L24 35L16 27" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {}
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
      value: data ? data.TrackingProxy: '0.00',
      growthRate: 2.59,
    },
    {
      icon: (
        <svg width="26" height="26" className="text-black dark:text-white" viewBox="0 0 652.801 652.801" xmlns="http://www.w3.org/2000/svg">
          <g>
            <g id="_x35__39_">
              <g>
                <path d="M142.8,367.199h40.8V326.4h-40.8V367.199z M142.8,530.4h40.8V489.6h-40.8V530.4z M550.801,40.8H469.2V20.4 c0-11.261-9.139-20.4-20.399-20.4s-20.4,9.139-20.4,20.4v20.4h-204V20.4C224.4,9.139,215.261,0,204,0s-20.4,9.139-20.4,20.4v20.4 H102c-45.063,0-81.6,36.537-81.6,81.6v448.799c0,45.064,36.537,81.602,81.6,81.602h448.8c45.063,0,81.6-36.537,81.6-81.602V122.4 C632.4,77.336,595.864,40.8,550.801,40.8z M224.4,530.4c0,22.541-18.258,40.799-40.8,40.799h-40.8 c-22.542,0-40.8-18.258-40.8-40.799V489.6c0-22.541,18.258-40.799,40.8-40.799h40.8c22.542,0,40.8,18.258,40.8,40.799V530.4z M224.4,367.199c0,22.521-18.258,40.801-40.8,40.801h-40.8c-22.542,0-40.8-18.279-40.8-40.801V326.4 c0-22.542,18.258-40.8,40.8-40.8h40.8c22.542,0,40.8,18.258,40.8,40.8V367.199z M387.601,530.4 c0,22.541-18.258,40.799-40.8,40.799H306c-22.521,0-40.8-18.258-40.8-40.799V489.6c0-22.541,18.279-40.799,40.8-40.799h40.8 c22.542,0,40.8,18.258,40.8,40.799V530.4z M387.601,367.199c0,22.521-18.258,40.801-40.8,40.801H306 c-22.521,0-40.8-18.279-40.8-40.801V326.4c0-22.542,18.279-40.8,40.8-40.8h40.8c22.542,0,40.8,18.258,40.8,40.8V367.199z M550.801,530.4c0,22.541-18.259,40.799-40.801,40.799h-40.8c-22.521,0-40.8-18.258-40.8-40.799V489.6 c0-22.541,18.278-40.799,40.8-40.799H510c22.542,0,40.801,18.258,40.801,40.799V530.4z M550.801,367.199 C550.801,389.721,532.542,408,510,408h-40.8c-22.521,0-40.8-18.279-40.8-40.801V326.4c0-22.542,18.278-40.8,40.8-40.8H510 c22.542,0,40.801,18.258,40.801,40.8V367.199z M591.601,163.2H61.2v-40.8c0-22.542,18.258-40.8,40.8-40.8h81.6V102 c0,11.261,9.139,20.4,20.4,20.4s20.4-9.139,20.4-20.4V81.6h204V102c0,11.261,9.14,20.4,20.4,20.4S469.2,113.261,469.2,102V81.6 h81.601c22.542,0,40.8,18.258,40.8,40.8V163.2z M469.2,367.199H510V326.4h-40.8V367.199z M469.2,530.4H510V489.6h-40.8V530.4z M306,530.4h40.8V489.6H306V530.4z M306,367.199h40.8V326.4H306V367.199z" />
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
        <svg
          width="26"
          height="26"
          className="text-black dark:text-white"
          viewBox="0 0 64 64"
          xmlns="http://www.w3.org/2000/svg"
        
        >
          <path d="M5,51h29v-2H5c-1.654,0-3-1.346-3-3V18c0-1.654,1.346-3,3-3h46v-2H5c-2.757,0-5,2.243-5,5v28C0,48.757,2.243,51,5,51z" />
          <path d="M59,13h-2.324l1.226-2.569l-1.805-0.861l-21,44l1.805,0.861L38.54,51H59c2.757,0,5-2.243,5-5V18C64,15.243,61.757,13,59,13z M53.812,19h1.314c0.363,1.403,1.47,2.511,2.874,2.873v20.254c-1.404,0.362-2.511,1.47-2.874,2.873H41.403L53.812,19z M62,46 c0,1.654-1.346,3-3,3H39.494l0.955-2H56c0.552,0,1-0.447,1-1c0-1.103,0.897-2,2-2c0.552,0,1-0.447,1-1V21c0-0.553-0.448-1-1-1 c-1.103,0-2-0.897-2-2c0-0.553-0.448-1-1-1h-1.233l0.955-2H59c1.654,0,3,1.346,3,3V46z" />
          <path d="M49,17H8c-0.552,0-1,0.447-1,1c0,1.103-0.897,2-2,2c-0.552,0-1,0.447-1,1v22c0,0.553,0.448,1,1,1c1.103,0,2,0.897,2,2 c0,0.553,0.448,1,1,1h28v-2H8.874C8.511,43.597,7.404,42.489,6,42.127V21.873c1.404-0.362,2.511-1.47,2.874-2.873H49V17z" />
          <path d="M21,32c0,6.065,4.935,11,11,11s11-4.935,11-11s-4.935-11-11-11S21,25.935,21,32z M23,32c0-4.625,3.507-8.442,8-8.941V25 c-2.206,0-4,1.794-4,4s1.794,4,4,4h2c1.103,0,2,0.897,2,2s-0.897,2-2,2h-2c-1.103,0-2-0.897-2-2h-2c0,2.206,1.794,4,4,4v1.941 C26.507,40.442,23,36.625,23,32z M41,32c0,4.625-3.507,8.442-8,8.941V39c2.206,0,4-1.794,4-4s-1.794-4-4-4h-2c-1.103,0-2-0.897-2-2 s0.897-2,2-2h2c1.103,0,2,0.897,2,2h2c0-2.206-1.794-4-4-4v-1.941C37.493,23.558,41,27.375,41,32z" />
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
          <path
            d="M39.958,28H48v2.042A5.958,5.958,0,0,1,42.042,36H34V33.958A5.958,5.958,0,0,1,39.958,28Z"
            fill="currentColor"
            transform="translate(82 64) rotate(-180)"
          />
          <path
            d="M46,28v.042A5.959,5.959,0,0,1,40.042,34H34V22a2,2,0,0,0-4,0V34H23.958A5.959,5.959,0,0,1,18,28.042V28H16v2.042A5.959,5.959,0,0,0,21.958,36H30v7h4V36h8.042A5.959,5.959,0,0,0,48,30.042V28Z"
         fill="currentColor"
          />
          <circle cx="32" cy="13" r="10" fill="#027de5" />
          <polygon points="42 61 22 61 18.802 46.076 45.198 46.076 42 61" fill="#cfcfd9" />
          <path d="M26.737,61H22L18.8,46.076H45.2A18.879,18.879,0,0,1,26.737,61Z" fill="#d9dae2" />
          <rect x="16" y="41" width="32" height="6" fill="#e5e6eb" />
          <rect x="44" y="41" width="4" height="6" fill="#cfcfd9" />
          <rect x="28" y="55" width="2" height="2" fill="#444" />
          <rect x="34" y="55" width="2" height="2" fill="#444" />
          <path
            d="M48,19h0a2,2,0,0,1,2,2v2H48a2,2,0,0,1-2-2v0A2,2,0,0,1,48,19Z"
            fill="#cceaff"
            transform="translate(67.092 69.79) rotate(-135)"
          />
          <path
            d="M48,8h0a2,2,0,0,1,2,2v2H48a2,2,0,0,1-2-2v0A2,2,0,0,1,48,8Z"
            fill="#cceaff"
            transform="translate(74.87 51.012) rotate(-135)"
          />
          <path
            d="M17,14.828h0a2,2,0,0,1,2,2v2H17a2,2,0,0,1-2-2v0a2,2,0,0,1,2-2Z"
            fill="#cceaff"
            transform="translate(17.121 40.749) rotate(-135)"
          />
          <path
            d="M17,3.828h0a2,2,0,0,1,2,2v2H17a2,2,0,0,1-2-2v0a2,2,0,0,1,2-2Z"
            fill="#cceaff"
            transform="translate(24.899 21.971) rotate(-135)"
          />
          <rect x="30" y="21" width="2" height="13" fill="#027de5" />
          <path d="M37.992,5.008A9.986,9.986,0,0,1,24.008,18.992,9.991,9.991,0,1,0,37.992,5.008Z" fill="#0468ad" />
          <path
            d="M31.344,10.49a1.025,1.025,0,0,1-.069-1.512,1.051,1.051,0,0,1,1.45,0l1.568,1.568,1.414-1.414L34.139,7.563A2.99,2.99,0,0,0,33,6.859V3.05c-.329-.032-.662-.05-1-.05s-.671.018-1,.05V6.858a3,3,0,0,0-1.14.705,3.027,3.027,0,0,0,.2,4.464l2.593,2.161a1.025,1.025,0,0,1,.07,1.511,1.027,1.027,0,0,1-1.451,0l-1.568-1.568-1.414,1.414,1.568,1.569a2.983,2.983,0,0,0,1.139.7V22.95c.329.032.662.05,1,.05s.671-.018,1-.05V17.818a3,3,0,0,0,1.14-.7,3.028,3.028,0,0,0-.2-4.464Z"
            fill="#fff"
          />
          <path
            d="M48,40H16a1,1,0,0,0-1,1v6a1,1,0,0,0,1,1h2.191l2.831,13.21A1,1,0,0,0,22,62H42a1,1,0,0,0,.978-.79L45.809,48H48a1,1,0,0,0,1-1V41A1,1,0,0,0,48,40ZM41.191,60H22.809L20.237,48H43.763ZM47,46H17V42H47Z"
            fill="#444"
          />
        </svg>
      ),
      color: 'violet',
      title: 'Total Profit',
      value: `$${data ? data.Profit.toFixed(2) : '0.00'}`,
      growthRate: -0.95,
    },
  ];

  return (
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
  );
};

export default DataStatsOne;
