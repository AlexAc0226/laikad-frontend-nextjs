"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Eye, Plus } from "lucide-react";
import { motion } from "framer-motion";

const additionalCategories = [
  { TypeID: "28", Description: "Action", OrderPriority: "10" },
  { TypeID: "29", Description: "Adventure", OrderPriority: "12" },
  { TypeID: "30", Description: "Arcade", OrderPriority: "14" },
  { TypeID: "31", Description: "Art & Design", OrderPriority: "16" },
  { TypeID: "32", Description: "Auto & Vehicles", OrderPriority: "18" },
  { TypeID: "33", Description: "Beauty", OrderPriority: "20" },
  { TypeID: "34", Description: "Board", OrderPriority: "22" },
  { TypeID: "35", Description: "Books", OrderPriority: "24" },
  { TypeID: "19", Description: "Books & Reference", OrderPriority: "26" },
  { TypeID: "2", Description: "Business", OrderPriority: "28" },
  { TypeID: "36", Description: "Card", OrderPriority: "30" },
  { TypeID: "37", Description: "Casino", OrderPriority: "32" },
  { TypeID: "38", Description: "Casual", OrderPriority: "34" },
  { TypeID: "40", Description: "Catalogs", OrderPriority: "36" },
  { TypeID: "12", Description: "Comics", OrderPriority: "38" },
  { TypeID: "14", Description: "Communication", OrderPriority: "40" },
  { TypeID: "41", Description: "Dating", OrderPriority: "42" },
  { TypeID: "42", Description: "Dice", OrderPriority: "44" },
  { TypeID: "10", Description: "E-Commerce", OrderPriority: "50" },
  { TypeID: "3", Description: "Education", OrderPriority: "60" },
  { TypeID: "43", Description: "Educational", OrderPriority: "62" },
  { TypeID: "5", Description: "Entertainment", OrderPriority: "70" },
  { TypeID: "44", Description: "Events", OrderPriority: "72" },
  { TypeID: "45", Description: "Family", OrderPriority: "74" },
  { TypeID: "16", Description: "Finance", OrderPriority: "80" },
  { TypeID: "46", Description: "Food & Drink", OrderPriority: "82" },
  { TypeID: "1", Description: "Games", OrderPriority: "90" },
  { TypeID: "9", Description: "Health and Fitness", OrderPriority: "100" },
  { TypeID: "47", Description: "House & Home", OrderPriority: "102" },
  { TypeID: "48", Description: "Kids", OrderPriority: "104" },
  { TypeID: "11", Description: "Libreries and demo", OrderPriority: "110" },
  { TypeID: "4", Description: "LifeStyle", OrderPriority: "120" },
  { TypeID: "49", Description: "Maps & Navigation", OrderPriority: "122" },
  { TypeID: "21", Description: "Media and video", OrderPriority: "130" },
  { TypeID: "20", Description: "Medical", OrderPriority: "140" },
  { TypeID: "8", Description: "Music", OrderPriority: "150" },
  { TypeID: "50", Description: "Music & Audio", OrderPriority: "152" },
  { TypeID: "51", Description: "Navigation", OrderPriority: "154" },
  { TypeID: "52", Description: "News", OrderPriority: "156" },
  { TypeID: "22", Description: "News and magazines", OrderPriority: "160" },
  { TypeID: "53", Description: "Parenting", OrderPriority: "162" },
  { TypeID: "23", Description: "Personalization", OrderPriority: "170" },
  { TypeID: "54", Description: "Photo & Video", OrderPriority: "172" },
  { TypeID: "17", Description: "Photography", OrderPriority: "180" },
  { TypeID: "24", Description: "Productivity", OrderPriority: "190" },
  { TypeID: "55", Description: "Puzzle", OrderPriority: "192" },
  { TypeID: "56", Description: "Racing", OrderPriority: "194" },
  { TypeID: "57", Description: "Reference", OrderPriority: "196" },
  { TypeID: "58", Description: "Role", OrderPriority: "198" },
  { TypeID: "59", Description: "Role Playing", OrderPriority: "199" },
  { TypeID: "13", Description: "Shopping", OrderPriority: "200" },
  { TypeID: "60", Description: "Simulation", OrderPriority: "202" },
  { TypeID: "25", Description: "Social", OrderPriority: "210" },
  { TypeID: "61", Description: "Social Networking", OrderPriority: "212" },
  { TypeID: "15", Description: "Sports", OrderPriority: "220" },
  { TypeID: "62", Description: "Strategy", OrderPriority: "222" },
  { TypeID: "18", Description: "Tools", OrderPriority: "230" },
  { TypeID: "27", Description: "Transportation", OrderPriority: "240" },
  { TypeID: "7", Description: "Travel", OrderPriority: "250" },
  { TypeID: "63", Description: "Travel & Local", OrderPriority: "252" },
  { TypeID: "64", Description: "Trivia", OrderPriority: "254" },
  { TypeID: "6", Description: "Utilities", OrderPriority: "260" },
  { TypeID: "65", Description: "Video Players & Editors", OrderPriority: "262" },
  { TypeID: "26", Description: "Weather", OrderPriority: "270" },
  { TypeID: "66", Description: "Word", OrderPriority: "272" },
  { TypeID: "99", Description: "Other", OrderPriority: "999" }
];


const DashboardRequestOff: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [requestedCampaigns, setRequestedCampaigns] = useState<any[]>([]);
  const [category, setCategory] = useState("");
  const [device, setDevice] = useState("");
  const [country, setCountry] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [viewRequested, setViewRequested] = useState(false);
  const [modalData, setModalData] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchCountries = async () => {
    const res = await axios.get("https://api.laikad.com/api/countries?name=&code2=");
    const list = res.data.result.map((c: any) => ({ label: c.country, value: c.Code2 }));
    setCountries(list);
  };

  const fetchCategories = async () => {
    const res = await axios.get("https://api.laikad.com/api/campaignshead/categories-head?");
    const combined = [...res.data.result, ...additionalCategories];
const uniqueById = Array.from(new Map(combined.map(cat => [cat.TypeID, cat])).values());
uniqueById.sort((a, b) => Number(a.OrderPriority || 999) - Number(b.OrderPriority || 999));
const list = uniqueById.map((c: any) => ({ label: c.Description, value: c.TypeID }));
setCategories(list);
    
  };

  const fetchCampaigns = useCallback(async () => {
    const url = `https://api.laikad.com/api/pub/v2.0/offers?ApiKey=fe6a4c14a20f8d5a18045cd08b66b8fddff16662&Category=${category}&Device=${device}&Country=${country}`;
    const res = await axios.get(url);
    setCampaigns(res.data.result || []);
  }, [category, device, country]);

  const fetchRequestedCampaigns = async () => {
    const res = await axios.get("https://api.laikad.com/api/pub/v2.0/request_pending?ApiKey=fe6a4c14a20f8d5a18045cd08b66b8fddff16662");
    setRequestedCampaigns(res.data.result || []);
  };

  const handleAddToRequest = (id: number) => {
    const alreadyRequested = requestedCampaigns.some((c) => c.CampaignID === id);
    if (!alreadyRequested) {
      const campaign = campaigns.find((c) => c.CampaignID === id);
      if (campaign) setRequestedCampaigns((prev) => [...prev, campaign]);
    }
  };

  const handleViewDetails = async (id: string) => {
    const res = await axios.get(`https://api.laikad.com/api/campaigns/details_campaign_request_offer_client?CampaignID=${id}`);
    setModalData(res.data.result[0]);
    setShowModal(true);
  };

  useEffect(() => {
    fetchCategories();
    fetchCountries();
    fetchCampaigns();
    fetchRequestedCampaigns();
  }, [fetchCampaigns]);

  const displayedCampaigns = (viewRequested ? requestedCampaigns : campaigns).filter((c) =>
    c.Offer?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard Request Offer</h1>
        <div className="flex gap-4">
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setViewRequested(false)} className="btn btn-primary">
            View Campaigns
          </motion.button>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setViewRequested(true)} className="btn btn-secondary">
            Request Pending/s
          </motion.button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-select">
  <option value="">All Categories</option>
  {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
</select>
        <select value={device} onChange={(e) => setDevice(e.target.value)} className="input-select">
          <option value="">All Devices</option>
          <option value="iOS">iOS</option>
          <option value="Android">Android</option>
        </select>
        <select value={country} onChange={(e) => setCountry(e.target.value)} className="input-select">
          <option value="">All Countries</option>
          {countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search campaign"
          className="input-text"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border text-sm text-left text-gray-600 dark:text-gray-200">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white">
            <tr>
              <th className="px-4 py-2">Campaign</th>
              <th className="px-4 py-2">Country</th>
              <th className="px-4 py-2">View</th>
              <th className="px-4 py-2">Request</th>
            </tr>
          </thead>
          <tbody>
            {displayedCampaigns.map((c, i) => (
              <tr key={i} className="border-b">
                <td className="px-4 py-2 whitespace-nowrap max-w-[200px] truncate">
  {c.Offer}
</td>
                <td className="px-4 py-2">{Array.isArray(c.Countrys) ? c.Countrys.join(", ") : c.Countrys}</td>
                <td className="px-4 py-2 whitespace-nowrap">
  <button onClick={() => handleViewDetails(c.CampaignID)} className="btn btn-warning text-xs px-3 py-1">
    View more
  </button>
</td>
<td className="px-4 py-2 whitespace-nowrap">
  <button
    onClick={() => handleAddToRequest(c.CampaignID)}
    disabled={requestedCampaigns.some(rc => rc.CampaignID === c.CampaignID)}
    className="btn btn-success text-xs px-3 py-1 disabled:opacity-50"
  >
    {requestedCampaigns.some(rc => rc.CampaignID === c.CampaignID) ? "Requested" : "Request Offer"}
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && modalData && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-md w-full max-w-xl">
            <h2 className="text-lg font-bold mb-2">{modalData.Campaign}</h2>
            <p><strong>Advertiser:</strong> {modalData.Advertiser}</p>
            <p><strong>Revenue:</strong> {modalData.Revenue}</p>
            <p><strong>Country:</strong> {modalData.Geo?.Countries?.map((c: any) => c.country).join(", ")}</p>
            <p><strong>Campaign Type:</strong> {modalData.CampaignType}</p>
            <p><strong>Device:</strong> {modalData.Device}</p>
            <p><strong>Daily Event/Install:</strong> {modalData.EventsGoal}</p>
            <p><strong>Daily Click:</strong> {modalData.DailyQuantityClick}</p>
            <p><strong>URL Preview:</strong> <a href={modalData.MarcketURL} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">{modalData.MarcketURL}</a></p>
            <div className="mt-4 text-right">
              <button onClick={() => setShowModal(false)} className="btn btn-danger">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardRequestOff;
