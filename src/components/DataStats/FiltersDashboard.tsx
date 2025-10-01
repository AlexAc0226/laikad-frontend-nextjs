import { getDashboardData } from '@/app/api/dashboard/dashboard';
import { getAdvertisers, getSuppliers, getTrackingData } from '@/app/api/filtersService/filtersService';
import React, { useState, useEffect, useCallback } from 'react';
import { FaSync, FaEye } from 'react-icons/fa';
import { useTheme } from 'next-themes';
import DataStatsOne from './DataStatsOne';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import { getReportsCampaignTotal } from '@/app/api/report/service';

const Spinner: React.FC = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
);

const FiltersDashboard: React.FC = () => {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<any>(null);
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [showTable, setShowTable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [isTrackingExportLoading, setIsTrackingExportLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: string | null }>({
    key: null,
    direction: null,
  });

  const { resolvedTheme } = useTheme();

  const handleRefresh = useCallback(async () => {
    try {
      if (!fromDate || !toDate) {
        console.error('Las fechas son requeridas.');
        return;
      }

      setIsLoading(true);
      setIsTableLoading(true);
      const params = {
        datefrom: fromDate,
        dateto: toDate,
        AdvertiserID: selectedAdvertiser?.value || 0,
        SupplierID: selectedSupplier?.value || 0,
      };

      const response = await getReportsCampaignTotal(
        params.datefrom.replace(/-/g, ''),
        params.dateto.replace(/-/g, ''),
        params.AdvertiserID,
        params.SupplierID,
        undefined, undefined, undefined, undefined,
        '1', '1', '1', '0', '1', '0', '0',
        '0', '0', '0',
        'Greater', 'Greater', 'Greater',
        '0'
      );

      if (response?.body?.result?.length) {
        const transformedData = response.body.result.map((item: any) => ({
          CampaignID: item.CampaignID,
          AdvertiserID: item.AdvertiserID,
          SupplierID: item.SupplierID,
          Advertiser: item.Advertiser ?? '',
          Campaign: item.Campaign ?? '',
          RateCampaign: item.RateCampaign ?? '',
          AMPublisher: item.AccountManager ?? '',
          AMPublisherID: item.AccountManagerID ?? '',
          AMAdvertiser: item.AccountManagerAdv ?? '',
          AMAdvertiserID: item.AccountManagerIDAdv ?? '',
          Publisher: item.Supplier ?? '',
          Offer: item.Campaign ?? '',
          OfferID: item.OfferID ?? '',
          Clicks: item.totalClick ?? 0,
          Installs: item.totalInstall ?? 0,
          Events: item.totalEvent ?? 0,
          Revenue: item.totalRevenue ?? 0,
          Cost: item.totalCost ?? 0,
          Profit: item.totalProfit ?? 0,
        }));

        if (localStorage.getItem('RoleID') !== '9' && localStorage.getItem('RoleID') !== '3') {
          const userId = parseInt(localStorage.getItem('UserID') || '', 10);

          const newTransformedData = transformedData.filter((item: any) =>
            parseInt(item.AMAdvertiserID) === userId || parseInt(item.AMPublisherID) === userId
          );

          setFilteredData(newTransformedData);
          setOriginalData(newTransformedData);
        } else {
          setFilteredData(transformedData);
          setOriginalData(transformedData);
        }
      }
    } catch (error) {
      console.error('Error al aplicar los filtros:', error);
    } finally {
      setIsLoading(false);
      setIsTableLoading(false);
    }
  }, [fromDate, toDate, selectedAdvertiser, selectedSupplier]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setIsLoading(true);
        const suppliersData = await getSuppliers();
        setSuppliers(suppliersData.result || []);

        const advertisersData = await getAdvertisers();
        setAdvertisers(advertisersData.result || []);
      } catch (error) {
        console.error('Error fetching filter data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    if (selectedAdvertiser || selectedSupplier || fromDate || toDate) {
      handleRefresh();
    }
  }, [selectedAdvertiser, selectedSupplier, fromDate, toDate, handleRefresh]);

  const handleSupplierChange = (selectedOption: any) => {
    setSelectedSupplier(selectedOption);
  };

  const handleAdvertiserChange = (selectedOption: any) => {
    setSelectedAdvertiser(selectedOption);
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFromDate(e.target.value);

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setToDate(e.target.value);

  const handleExportExcel = () => {
    setIsExportLoading(true);
    setTimeout(() => {
      const worksheet = XLSX.utils.json_to_sheet(filteredData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'FilteredData');
      XLSX.writeFile(workbook, 'FilteredData.xlsx');
      setIsExportLoading(false);
    }, 500); // Simulate async export
  };

  const handleExportTrackingExcel = () => {
    setIsTrackingExportLoading(true);
    setTimeout(() => {
      if (trackingData && trackingData.length > 0) {
        const worksheet = XLSX.utils.json_to_sheet(trackingData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'TrackingData');
        XLSX.writeFile(workbook, 'TrackingData.xlsx');
      }
      setIsTrackingExportLoading(false);
    }, 500); // Simulate async export
  };

  const handleSort = (key: string) => {
    let direction: string | null = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ key, direction });

    if (direction === null) {
      setFilteredData([...originalData]);
      return;
    }

    const sortedData = [...filteredData].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (['Clicks', 'Installs', 'Events', 'Revenue', 'Cost', 'Profit'].includes(key)) {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aText = aValue?.toString().toLowerCase() || '';
      const bText = bValue?.toString().toLowerCase() || '';
      return direction === 'asc'
        ? aText.localeCompare(bText)
        : bText.localeCompare(bText);
    });

    setFilteredData(sortedData);
  };

  const getSortIndicator = (key: string) => {
    if (!sortConfig.direction) return null;
    if (sortConfig.key !== key) return null;
    const isAsc = sortConfig.direction === 'asc';
    return (
      <span
        className={`ml-2 inline-block w-0 h-0 border-l-[5px] border-r-[5px] border-b-[7px] border-transparent ${
          isAsc
            ? 'border-b-blue-500 dark:border-b-blue-400'
            : 'border-t-[7px] border-b-0 border-t-blue-500 dark:border-t-blue-400'
        } transition-all duration-200`}
      />
    );
  };

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
      borderColor: resolvedTheme === 'dark' ? '#374151' : '#ccc',
      height: '38px',
      color: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: resolvedTheme === 'dark' ? '#1f2937' : '#ffffff',
      color: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? resolvedTheme === 'dark'
          ? '#374151'
          : '#f3f4f6'
        : resolvedTheme === 'dark'
          ? '#1f2937'
          : '#ffffff',
      color: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
    }),
    input: (provided: any) => ({
      ...provided,
      color: resolvedTheme === 'dark' ? '#ffffff' : '#000000',
    }),
  };

  const handleViewTracking = async (dateFrom, dateTo, offerID) => {
    const formattedDateFrom = dateFrom.replace(/-/g, '');
    const formattedDateTo = dateTo.replace(/-/g, '');

    try {
      setIsTrackingLoading(true);
      const data = await getTrackingData(formattedDateFrom, formattedDateTo, offerID);
      setTrackingData(data.result);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <div className="mb-6 border-b border-gray-600 pb-4">
        <DataStatsOne
          filters={{
            fromDate,
            toDate,
            advertiserID: selectedAdvertiser?.value || 0,
            supplierID: selectedSupplier?.value || 0,
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col">
          <label htmlFor="supplierSelect" className="text-sm font-medium mb-1">
            Supplier
          </label>
          <div className="relative">
            <Select
              id="supplierSelect"
              options={suppliers.map((supplier: any) => ({
                value: supplier.SupplierID,
                label: supplier.Supplier,
              }))}
              value={selectedSupplier}
              onChange={handleSupplierChange}
              isClearable
              placeholder="Select or search"
              styles={customStyles}
              className="w-full min-w-[150px]"
              isDisabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="advertiserSelect" className="text-sm font-medium mb-1">
            Advertiser
          </label>
          <div className="relative">
            <Select
              id="advertiserSelect"
              options={advertisers.map((advertiser: any) => ({
                value: advertiser.AdvertiserID,
                label: advertiser.Advertiser,
              }))}
              value={selectedAdvertiser}
              onChange={handleAdvertiserChange}
              isClearable
              placeholder="Select or search"
              styles={customStyles}
              className="w-full min-w-[150px]"
              isDisabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="fromDate" className="text-sm font-medium mb-1">
            From
          </label>
          <div className="relative">
            <input
              id="fromDate"
              type="date"
              className={`border rounded-md p-2 h-10 transition-all w-full
                ${resolvedTheme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-black border-gray-300'}
              `}
              value={fromDate}
              onChange={handleFromDateChange}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Spinner />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <label htmlFor="toDate" className="text-sm font-medium mb-1">
            To
          </label>
          <div className="relative">
            <input
              id="toDate"
              type="date"
              className={`border rounded-md p-2 h-10 transition-all w-full
                ${resolvedTheme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-white text-black border-gray-300'}
              `}
              value={toDate}
              onChange={handleToDateChange}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Spinner />
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6 overflow-auto"
    onClick={() => setIsModalOpen(false)}
  >
    <div
      className="bg-white dark:bg-gray-800 dark:text-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-[95vw] sm:max-w-7xl max-h-[95vh] sm:max-h-[85vh] overflow-hidden flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Detalles de Tracking
      </h3>
      <div className="overflow-auto max-h-[60vh] relative">
        {isTrackingLoading ? (
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div>
        ) : trackingData && trackingData.length > 0 ? (
          <table className="min-w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg shadow-md">
            <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0">
              <tr>
                <th className="px-2 sm:px-4 py-2 border">Tracking ID</th>
                <th className="px-2 sm:px-4 py-2 border">SubPubID</th>
                <th className="px-2 sm:px-4 py-2 border">ClickID</th>
                <th className="px-2 sm:px-4 py-2 border">Event</th>
                <th className="px-2 sm:px-4 py-2 border">Proxy</th>
                <th className="px-2 sm:px-4 py-2 border">User Agent</th>
                <th className="px-2 sm:px-4 py-2 border">Date Click</th>
                <th className="px-2 sm:px-4 py-2 border">Date Install</th>
                <th className="px-2 sm:px-4 py-2 border">Dif Min</th>
              </tr>
            </thead>
            <tbody>
              {trackingData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                  <td className="px-2 sm:px-4 py-2 border">{item._id}</td>
                  <td className="px-2 sm:px-4 py-2 border">{item.SubPubID}</td>
                  <td className="px-2 sm:px-4 py-2 border">{item.ClickID}</td>
                  <td className="px-2 sm:px-4 py-2 border">{item.Event}</td>
                  <td className="px-2 sm:px-4 py-2 border">{item.TrackingProxy}</td>
                  <td className="px-2 sm:px-4 py-2 border">{item.OSfamilyVersion}</td>
                  <td className="px-2 sm:px-4 py-2 border">{item.FechaClick}</td>
                  <td className="px-2 sm:px-4 py-2 border">{item.FechaInstall}</td>
                  <td className="px-2 sm:px-4 py-2 border">{item.DifMin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-900 dark:text-white text-center">No tracking data available.</p>
        )}
      </div>
      <div className="mt-4 flex justify-end gap-2 flex-wrap">
        {trackingData && trackingData.length > 0 && (
          <button
            onClick={handleExportTrackingExcel}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all flex items-center gap-2"
            disabled={isTrackingExportLoading}
          >
            {isTrackingExportLoading ? <Spinner /> : 'Export Excel'}
          </button>
        )}
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
          onClick={() => setIsModalOpen(false)}
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
)}

      <div className="flex justify-center gap-4 mt-4 flex-wrap">
        <button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 shadow-md transition-all"
          disabled={isLoading}
        >
          {isLoading ? <Spinner /> : <FaSync className="mr-2" />}
          Refresh
        </button>
        {filteredData.length > 0 && (
          <button
            onClick={handleExportExcel}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 shadow-md transition-all"
            disabled={isExportLoading}
          >
            {isExportLoading ? <Spinner /> : 'Export Excel'}
          </button>
        )}
        {filteredData.length > 0 && (
          <button
            onClick={() => setShowTable(!showTable)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
          >
            {showTable ? 'Hide List' : 'Show List'}
          </button>
        )}
      </div>

      {showTable && (
        <div className="overflow-x-auto mt-4 relative">
          {isTableLoading ? (
            <div className="flex justify-center items-center h-64">
              <Spinner />
            </div>
          ) : (
            <table className="min-w-full border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-2 sm:px-4 py-2 border-b border-gray-600"></th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Advertiser')}
                  >
                    <div className="flex items-center justify-between">
                      Advertiser
                      {getSortIndicator('Advertiser')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Campaign')}
                  >
                    <div className="flex items-center justify-between">
                      Campaign
                      {getSortIndicator('Campaign')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('RateCampaign')}
                  >
                    <div className="flex items-center justify-between">
                      Rate Campaign
                      {getSortIndicator('RateCampaign')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('AMAdvertiser')}
                  >
                    <div className="flex items-center justify-between">
                      AM Advertiser
                      {getSortIndicator('AMAdvertiser')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Publisher')}
                  >
                    <div className="flex items-center justify-between">
                      Publisher
                      {getSortIndicator('Publisher')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Offer')}
                  >
                    <div className="flex items-center justify-between">
                      Offer
                      {getSortIndicator('Offer')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('AMPublisher')}
                  >
                    <div className="flex items-center justify-between">
                      AM Publisher
                      {getSortIndicator('AMPublisher')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Clicks')}
                  >
                    <div className="flex items-center justify-between">
                      Clicks
                      {getSortIndicator('Clicks')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Installs')}
                  >
                    <div className="flex items-center justify-between">
                      Installs
                      {getSortIndicator('Installs')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Events')}
                  >
                    <div className="flex items-center justify-between">
                      Events
                      {getSortIndicator('Events')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Revenue')}
                  >
                    <div className="flex items-center justify-between">
                      Revenue
                      {getSortIndicator('Revenue')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Cost')}
                  >
                    <div className="flex items-center justify-between">
                      Cost
                      {getSortIndicator('Cost')}
                    </div>
                  </th>
                  <th
                    className="px-2 sm:px-4 py-2 border-b border-gray-600 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 group"
                    onClick={() => handleSort('Profit')}
                  >
                    <div className="flex items-center justify-between">
                      Profit
                      {getSortIndicator('Profit')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-600">
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-600 text-center">
                        <button
                          onClick={() => handleViewTracking(fromDate, toDate, item.OfferID)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          disabled={isTrackingLoading}
                        >
                          {isTrackingLoading ? <Spinner /> : <FaEye />}
                        </button>
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Advertiser}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Campaign}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.RateCampaign}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.AMAdvertiser}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Publisher}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Offer}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.AMPublisher}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Clicks}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Installs}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Events}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Revenue}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Cost}
                      </td>
                      <td className="px-2 sm:px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                        {item.Profit}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-2 sm:px-4 py-2 text-center border-b border-gray-600"
                      colSpan={14}
                    >
                      No data available for selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default FiltersDashboard;