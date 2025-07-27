"use client";

import { useState, useEffect } from "react";
import { FaTrash, FaFileExcel, FaSync } from "react-icons/fa";
import {
  getAdvertisers,
  getSuppliers,
} from "@/app/api/filtersService/filtersService";
import { getReportRotador } from "@/app/api/report/service";
import * as XLSX from 'xlsx';

interface rotadorInterface {
  Campaign: string;
  CreationDate: string;
  Advertiser: string;
  Supplier: string;
  SubPubID: string;
  Rotador: string;
  count: number;
  OfferID: number;
}

export default function ShowAjust() {
  const today = new Date().toISOString().split('T')[0];
  
  const [listAdvertisers, setListAdvertisers] = useState([]);
  const [listPublishers, setListPublishers] = useState([]);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState("");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [reportInfo, setReportInfo] = useState<rotadorInterface[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [advertisersResponse, suppliersResponse] = await Promise.all([
        getAdvertisers(),
        getSuppliers(),
      ]);

      setListAdvertisers(advertisersResponse.result.sort((a: { Advertiser: string }, b: { Advertiser: string }) => a.Advertiser.localeCompare(b.Advertiser)));
      setListPublishers(suppliersResponse.result.sort((a: { Supplier: string }, b: { Supplier: string }) => a.Supplier.localeCompare(b.Supplier)));
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await getReportRotador(
        dateFrom,
        dateTo,
        selectedAdvertiser ? Number(selectedAdvertiser) : 0,
        selectedPublisher ? Number(selectedPublisher) : 0,
      );
      setReportInfo(response.result);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      if (reportInfo.length === 0) {
        alert('No hay datos para exportar');
        return;
      }
      const worksheet = XLSX.utils.json_to_sheet(reportInfo);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'RotadorReport');
      const fileName = `RotadorReport_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Hubo un error al exportar el archivo');
    }
  };

  const handleClear = (field: string) => {
    switch (field) {
      case "advertiser":
        setSelectedAdvertiser("");
        break;
      case "publisher":
        setSelectedPublisher("");
        break;
      case "dateFrom":
        setDateFrom(today);
        break;
      case "dateTo":
        setDateTo(today);
        break;
      default:
        break;
    }
  };

  return (
    <div className="rounded-lg bg-[#212121] p-6">
      <div className="flex justify-end space-x-3 mb-4">
        <button
          onClick={handleRefresh}
          className="flex items-center rounded-md bg-[#B0BEC5] px-3 py-2 text-[#212121] hover:bg-[#90A4AE] transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <svg
              className="animate-spin h-5 w-5 mr-2 text-[#212121]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <FaSync className="h-5 w-5 mr-2" />
          )}
          Refresh
        </button>
        {reportInfo.length > 0 && (
          <button
            onClick={handleExportExcel}
            className="flex items-center rounded-md bg-[#B0BEC5] px-3 py-2 text-[#212121] hover:bg-[#90A4AE] transition-all duration-200"
          >
            <FaFileExcel className="h-5 w-5 mr-2" />
            Excel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg bg-[#212121] p-3 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Advertiser
          </label>
          <div className="relative">
            <select
              id="advertiserSelect"
              className="w-full rounded-md border border-[#424242] bg-[#424242] p-2 pr-10 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={selectedAdvertiser}
              onChange={(e) => setSelectedAdvertiser(e.target.value)}
            >
              <option value="">Select...</option>
              {listAdvertisers.map((advertiser) => (
                <option
                  key={advertiser.AdvertiserID}
                  value={advertiser.AdvertiserID}
                >
                  {advertiser.Advertiser}
                </option>
              ))}
            </select>
            {selectedAdvertiser && (
              <button
                onClick={() => handleClear("advertiser")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Publisher
          </label>
          <div className="relative">
            <select
              id="publisherSelect"
              className="w-full rounded-md border border-[#424242] bg-[#424242] p-2 pr-10 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
            >
              <option value="">Select...</option>
              {listPublishers.map((publisher) => (
                <option
                  key={publisher.SupplierID}
                  value={publisher.SupplierID}
                >
                  {publisher.Supplier}
                </option>
              ))}
            </select>
            {selectedPublisher && (
              <button
                onClick={() => handleClear("publisher")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            From
          </label>
          <div className="relative">
            <input
              type="date"
              id="dateFrom"
              className="w-full rounded-md border border-[#424242] bg-[#424242] p-2 pr-10 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
            {dateFrom !== today && (
              <button
                onClick={() => handleClear("dateFrom")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            To
          </label>
          <div className="relative">
            <input
              type="date"
              id="dateTo"
              className="w-full rounded-md border border-[#424242] bg-[#424242] p-2 pr-10 text-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
            {dateTo !== today && (
              <button
                onClick={() => handleClear("dateTo")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors duration-200"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg">
        <table className="w-full border-collapse bg-[#212121]">
          <thead>
            <tr className="bg-[#424242] text-gray-300">
              <th className="p-3 text-left text-sm font-semibold">Date</th>
              <th className="p-3 text-left text-sm font-semibold">Advertiser</th>
              <th className="p-3 text-left text-sm font-semibold">Campaign</th>
              <th className="p-3 text-left text-sm font-semibold">Supplier</th>
              <th className="p-3 text-left text-sm font-semibold">SubPubID</th>
              <th className="p-3 text-left text-sm font-semibold">Rotador Reason</th>
              <th className="p-3 text-left text-sm font-semibold">Clicks Count</th>
            </tr>
          </thead>
          <tbody>
            {reportInfo.length > 0 ? (
              reportInfo.map((report: rotadorInterface, index: number) => (
                <tr
                  key={report.OfferID}
                  className={`border-b border-[#424242] ${
                    index % 2 === 0 ? "bg-[#303030]" : "bg-[#212121]"
                  } hover:bg-[#424242] transition-colors duration-200`}
                >
                  <td className="p-3 text-sm text-gray-300">{report.CreationDate}</td>
                  <td className="p-3 text-sm text-gray-300">{report.Advertiser}</td>
                  <td className="p-3 text-sm text-gray-300">{report.Campaign}</td>
                  <td className="p-3 text-sm text-gray-300">{report.Supplier}</td>
                  <td className="p-3 text-sm text-gray-300">{report.SubPubID}</td>
                  <td className="p-3 text-sm text-gray-300">{report.Rotador}</td>
                  <td className="p-3 text-sm text-gray-300">{report.count}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No campaigns found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}