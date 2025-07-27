'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { getTotalOffers } from '@/app/api/filtersService/filtersService'; 
import { motion } from 'framer-motion';
import { MousePointerClick, Download, DollarSign, TrendingUp, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import ChartSuppliersDonut from '@/components/Charts/ChartSuppliersDonut';


const DashboardSuppliers = () => {
  const today = new Date().toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [campaigns, setCampaigns] = useState([]);
  const [totals, setTotals] = useState({
    clicks: 0,
    installs: 0,
    payableEvents: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchClick, setSearchClick] = useState('');
  const [searchPayable, setSearchPayable] = useState('');
  const [searchRevenue, setSearchRevenue] = useState('');

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTotalOffers(dateFrom, dateTo, 'CUSTOM');
      const data = response.result.result;

      const calculatedTotals = data.reduce(
        (acc, item) => ({
          clicks: acc.clicks + (item.Clicks || 0),
          installs: acc.installs + (item.Install || 0),
          payableEvents: acc.payableEvents + (item.PayableEvent || 0),
          revenue: acc.revenue + (item.REVENUE || 0),
        }),
        { clicks: 0, installs: 0, payableEvents: 0, revenue: 0 }
      );

      setCampaigns(data);
      setTotals(calculatedTotals);
    } catch (error) {
      setError('Failed to fetch offers.');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchOffers();
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredCampaigns);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Campaigns');
    XLSX.writeFile(workbook, 'Suppliers_Campaigns.xlsx');
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesId = c.CampaignID?.toString().includes(searchId);
    const matchesName = c.Offer?.toLowerCase().includes(searchName.toLowerCase());
    const matchesClick = searchClick === '' || c.Clicks?.toString().includes(searchClick);
    const matchesPayable = searchPayable === '' || c.PayableEvent?.toString().includes(searchPayable);
    const matchesRevenue = searchRevenue === '' || (c.REVENUE?.toString() || '0').includes(searchRevenue);

    return matchesId && matchesName && matchesClick && matchesPayable && matchesRevenue;
  });

  const stats = [
    { label: 'Clicks', value: totals.clicks, icon: MousePointerClick },
    { label: 'Installs', value: totals.installs, icon: Download },
    { label: 'Payable Events', value: totals.payableEvents, icon: TrendingUp },
    { label: 'Revenue', value: `$${totals.revenue.toFixed(2)}`, icon: DollarSign },
  ];

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-slate-900 dark:text-white">
      <div className="flex-1 flex flex-col p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ label, value, icon: Icon }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</p>
              </div>
              <p className="text-3xl font-bold">{value}</p>
            </motion.div>
          ))}
        </div>

    

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-6 p-6 rounded-xl shadow-md">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-slate-900 dark:text-white focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <button type="submit" className="self-end w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow">Filter</button>
            {filteredCampaigns.length > 0 && (
              <button type="button" onClick={handleExportExcel} className="self-end w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow flex items-center gap-2">
                <FileDown size={18} /> Export Excel
              </button>
            )}
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-6 rounded-xl shadow-md overflow-auto">
          {loading && <p className="text-center p-4">Loading campaigns...</p>}
          {error && <p className="text-center text-red-500 p-4">{error}</p>}
          {!loading && !error && campaigns.length > 0 && (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                <tr>
                  {['CampaignID', 'Name', 'Click', 'Payable Event', 'Revenue'].map((head) => (
                    <th key={head} className="px-4 py-3 font-semibold">{head}</th>
                  ))}
                </tr>
                <tr className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  {[searchId, searchName, searchClick, searchPayable, searchRevenue].map((val, idx) => {
                    const setFns = [setSearchId, setSearchName, setSearchClick, setSearchPayable, setSearchRevenue];
                    return (
                      <th key={idx} className="px-4 py-2">
                        <input
                          value={val}
                          onChange={(e) => setFns[idx](e.target.value)}
                          className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 bg-white dark:bg-gray-800 text-sm text-slate-700 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                          placeholder={["ID", "Search Campaign", "Search Click", "Search Payable", "Search Revenue"][idx]}
                        />
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredCampaigns.map((campaign, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-2">{campaign.CampaignID}</td>
                    <td className="px-4 py-2">{campaign.Offer}</td>
                    <td className="px-4 py-2">{campaign.Clicks || 0}</td>
                    <td className="px-4 py-2">{campaign.PayableEvent || 0}</td>
                    <td className="px-4 py-2">{(campaign.REVENUE || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && campaigns.length === 0 && (
            <p className="text-center p-6 text-slate-500 dark:text-slate-400">No campaigns available</p>
          )}
        </div>
            <div className="mt-6">
  <ChartSuppliersDonut campaigns={campaigns} />
</div>
      </div>
      
    </div>
  );
};

export default DashboardSuppliers;
