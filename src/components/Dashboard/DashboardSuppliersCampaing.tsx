'use client'
import React, { useState, useEffect } from 'react';
import { getCampaigns } from '@/app/api/filtersService/filtersService';
import Image from 'next/image';

const DashboardSuppliersCampaing = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('ALL');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchCampaigns = async (statusFilter = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCampaigns(statusFilter);
      setCampaigns(response.result);
    } catch (error) {
      setError('Failed to fetch campaigns.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns(status === 'ACTIVE' ? 'A' : status === 'PAUSED' ? 'P' : '');
  }, [status]);

  useEffect(() => {
    const filterCampaigns = () => {
      let filtered = campaigns;
      if (status !== 'ALL') {
        filtered = filtered.filter(campaign => campaign.StatusID === (status === 'ACTIVE' ? 'A' : 'P'));
      }
      setFilteredCampaigns(filtered);
    };
    filterCampaigns();
  }, [campaigns, status]);

  const handleViewInfo = async (campaignId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getCampaigns();
      const campaign = response.result.find(c => c.CampaignID === campaignId);
      if (campaign) {
        setSelectedCampaign(campaign);
        setModalOpen(true);
      } else {
        setError('Campaign not found');
      }
    } catch (error) {
      setError('Failed to fetch campaign details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="flex-1 flex flex-col">
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="bg-white text-black dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow">
            <div className="mb-4">
              <button onClick={() => setStatus('ACTIVE')} className={`px-4 py-2 ${status === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-gray-200 text-black dark:bg-gray-600 dark:text-white'} rounded-lg`}>Active</button>
              <button onClick={() => setStatus('ALL')} className={`px-4 py-2 ${status === 'ALL' ? 'bg-blue-600' : 'bg-gray-600'} text-white rounded-lg mx-2`}>All</button>
              <button onClick={() => setStatus('PAUSED')} className={`px-4 py-2 ${status === 'PAUSED' ? 'bg-red-600' : 'bg-gray-600'} text-white rounded-lg`}>Paused</button>
            </div>

            {loading && <p className="text-center text-gray-700 dark:text-gray-300">Loading campaigns...</p>}
            {error && <p className="text-center text-red-400">{error}</p>}
            {!loading && !error && filteredCampaigns.length > 0 && (
              <div className="space-y-4">
                {filteredCampaigns.map((campaign, index) => (
                 <div key={index} className="flex items-center justify-between p-4 bg-gray-100 text-black dark:bg-gray-700 dark:text-white rounded-lg shadow-md">
  <div className="flex items-center space-x-4">
    <Image
      src={campaign.Icon72?.startsWith('http') ? campaign.Icon72 : campaign.url?.startsWith('http') ? campaign.url : 'https://via.placeholder.com/40'}
      alt="Campaign Logo"
      width={48}
      height={48}
      className="rounded-full object-cover"
    />
    <div className="text-left">
      <div className="font-bold text-black dark:text-white">{campaign.Name}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">CampaignID: {campaign.CampaignID}</div>
    </div>
  </div>

  <div className="text-lg text-black dark:text-white">{`$ ${campaign.Cost || '0'}`}</div>
  <div className="text-gray-700 dark:text-gray-300">{`${campaign.Daily || 0} installs`}</div>

  <div className="flex space-x-4">
    <button onClick={() => handleViewInfo(campaign.CampaignID)} className="bg-blue-600 text-white rounded-lg px-4 py-2">View info offer</button>
    {campaign.Preview && (
      <a href={campaign.Preview} target="_blank" rel="noopener noreferrer" className="bg-green-600 text-white rounded-lg px-4 py-2">Preview</a>
    )}
  </div>
</div>
                ))}
              </div>
            )}
            {filteredCampaigns.length === 0 && !loading && !error && (
              <p className="text-center text-gray-600 dark:text-gray-400">No campaigns available</p>
            )}
          </div>
        </div>
      </div>

      {modalOpen && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex justify-center items-center">
          <div className="bg-white text-black dark:bg-gray-900 dark:text-white p-6 rounded-lg shadow-lg w-1/2">
            <h2 className="text-xl font-semibold mb-4">{selectedCampaign.Campaign}</h2>
            <p><strong>CampaignID:</strong> {selectedCampaign.CampaignID}</p>
            <p><strong>Cost:</strong> {selectedCampaign.Cost}</p>
            <p><strong>Country:</strong> {selectedCampaign.Countrys}</p> 
            <p><strong>Daily Cap:</strong> {selectedCampaign.DailyCap}</p>
            <p><strong>Device:</strong> {selectedCampaign.Device}</p>
            <p><strong>Status:</strong> {selectedCampaign.Status}</p>
            <p><strong>Description:</strong> {selectedCampaign.Description || 'No description available'}</p>
            <button onClick={() => setModalOpen(false)} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardSuppliersCampaing;
