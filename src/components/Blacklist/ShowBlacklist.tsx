"use client";
import React, { useState, useEffect } from "react";
import { FaTrash, FaPause, FaPlus, FaSync, FaFileExcel, FaTimes } from "react-icons/fa";
import { getSuppliers, getAdvertisers } from "@/app/api/filtersService/filtersService";
import { getCampaignsByAdvertiserID } from "@/app/api/campaign/service";
import { getOffers } from "@/app/api/offer/service";
import * as XLSX from "xlsx";
import { Box, Button, Select, MenuItem, Input, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, useTheme, Checkbox, TextareaAutosize } from "@mui/material";

interface Advertiser {
  AdvertiserID: number;
  Advertiser: string;
}

interface Supplier {
  SupplierID: number;
  Supplier: string;
}

interface Campaign {
  CampaignID: number;
  Campaign: string;
  StatusID?: string;
}

interface Offer {
  OfferID: number;
  Offer: string;
}

interface BlacklistItem {
  _id: string;
  status: string;
  campaign: string;
  supplier: string;
  offerID: string;
  subPubID: string;
  dateFrom: string;
  reason: string;
}

const ShowBlacklist: React.FC = () => {
  const theme = useTheme();
  const [advertiser, setAdvertiser] = useState("");
  const [supplier, setSupplier] = useState("");
  const [campaign, setCampaign] = useState("");
  const [offer, setOffer] = useState("");
  const [subPubID, setSubPubID] = useState("");
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [blacklistData, setBlacklistData] = useState<BlacklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resulConsult, setResulConsult] = useState("");
  const [totalTime, setTotalTime] = useState("");
  const [totalSize, setTotalSize] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [subPubIDsInput, setSubPubIDsInput] = useState("");
  const [reason, setReason] = useState("");
  const [isSupplierDisabled, setIsSupplierDisabled] = useState(false);
  const [isAdvertiserDisabled, setIsAdvertiserDisabled] = useState(false);
  const [isCampaignsDisabled, setIsCampaignsDisabled] = useState(true);
  const [isOffersDisabled, setIsOffersDisabled] = useState(true);
  const [selectAll, setSelectAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState<boolean[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const advertisersData = await getAdvertisers();
        if (advertisersData && Array.isArray(advertisersData.result)) {
          setAdvertisers(advertisersData.result);
        } else {
          console.warn("No advertisers found");
          setAdvertisers([]);
        }

        const suppliersData = await getSuppliers();
        if (suppliersData && Array.isArray(suppliersData.result)) {
          setSuppliers(suppliersData.result);
        } else {
          console.warn("No suppliers found");
          setSuppliers([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAdvertisers([]);
        setSuppliers([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    setSelectedRows(new Array(blacklistData.length).fill(false));
  }, [blacklistData]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!advertiser) {
        setCampaignsList([]);
        setCampaign("");
        setIsCampaignsDisabled(true);
        return;
      }

      try {
        const campaignsData = await getCampaignsByAdvertiserID(Number(advertiser));
        if (campaignsData && Array.isArray(campaignsData.result)) {
          const filteredCampaigns = campaignsData.result.filter(
            (camp: Campaign) => camp.StatusID === "A" || !camp.StatusID
          );
          setCampaignsList(filteredCampaigns);
          setIsCampaignsDisabled(false);
        } else {
          console.warn("No campaigns found for this advertiser");
          setCampaignsList([]);
          setIsCampaignsDisabled(true);
        }
        setCampaign("");
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setCampaignsList([]);
        setCampaign("");
        setIsCampaignsDisabled(true);
      }
    };

    fetchCampaigns();
  }, [advertiser]);

  const handleSupplierChange = async (supplierId: string) => {
    setSupplier(supplierId);
    setOffer("");

    setIsAdvertiserDisabled(!!supplierId);
    setIsOffersDisabled(!supplierId);

    if (!supplierId) {
      setOffersList([]);
      return;
    }

    try {
      const params = {
        OfferID: "",
        CampaignID: "",
        SupplierID: supplierId,
        StatusID: "A",
        AdvertiserID: "",
      };

      const offersData = await getOffers(params);
      if (offersData && Array.isArray(offersData.result)) {
        setOffersList(offersData.result);
      } else {
        console.warn("No offers found for this supplier");
        setOffersList([]);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setOffersList([]);
    }
  };

  const handleAdvertiserChange = (advertiserId: string) => {
    setAdvertiser(advertiserId);
    setIsSupplierDisabled(!!advertiserId);
  };

  const handleCampaignChange = async (campaignId: string) => {
    setCampaign(campaignId);
    setOffer("");

    if (!campaignId) {
      return;
    }

    try {
      const params = {
        OfferID: "",
        CampaignID: campaignId,
        SupplierID: "",
        StatusID: "A",
        AdvertiserID: "",
      };

      const offersData = await getOffers(params);
      if (offersData && Array.isArray(offersData.result)) {
        setOffersList(offersData.result);
      } else {
        console.warn("No offers found for this campaign");
        setOffersList([]);
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setOffersList([]);
    }
  };

  const handleFetchBlacklist = async () => {
    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken') || '';
      if (!accessToken) {
        throw new Error('Access token not found');
      }

      const params = new URLSearchParams({
        OfferID: offer || '',
        SubPubID: subPubID || '',
        AdvertiserID: advertiser || '',
        CampaignID: campaign || '',
        SupplieressID: supplier || '',
        ListType: 'BL',
        isIP: '0',
      });

      const response = await fetch(`https://api.laikad.com/api/blacklist?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Access-Token': accessToken,
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching blacklist');
      }

      const data = await response.json();
      if (data && Array.isArray(data.result.result)) {
        constడ:1.0
        const formattedData = data.result.result.map((item: any) => ({
          _id: item._id || '',
          status: item.StatusID || 'Unknown',
          campaign: item.Campaign || 'N/A',
          supplier: item.Supplier || 'N/A',
          offerID: item.OfferID || 'N/A',
          subPubID: item.SubPubID || 'N/A',
          dateFrom: item.DateFrom || 'N/A',
          reason: item.Motivo || 'N/A',
        }));
        setBlacklistData(formattedData);
        setResulConsult(`Record count ${data.result.total}`);
        setTotalTime(`${data.result.time} seg.`);
        setTotalSize(`${data.result.size} Kb.`);
      } else {
        console.warn('No se encontraron datos en la blacklist');
        setBlacklistData([]);
        setResulConsult('Record count 0');
        setTotalTime('0 seg.');
        setTotalSize('0 Kb.');
      }
    } catch (error) {
      console.error('Error al consultar la blacklist:', error);
      setBlacklistData([]);
      setResulConsult('Record count 0');
      setTotalTime('0 seg.');
      setTotalSize('0 Kb.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setSubPubIDsInput("");
    setReason("");
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const processSubPubIDs = (input: string): string[] => {
    const values = input.split(/\r\n|\r|\n| |,|;/g);
    const uniqueValues = Array.from(new Set(values.map((value) => value.trim()).filter((value) => value !== "")));
    return uniqueValues;
  };

  const handleAddBlacklist = async () => {
    if (!subPubIDsInput) {
      alert('Por favor, ingresa al menos un SubPubID.');
      return;
    }

    if (!reason) {
      alert('Por favor, ingresa un motivo (Reason) para el blacklist.');
      return;
    }

    const subPubIDs = processSubPubIDs(subPubIDsInput);
    if (subPubIDs.length === 0) {
      alert('No se encontraron SubPubIDs válidos. Por favor, verifica la entrada.');
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken') || '';
      if (!accessToken) {
        throw new Error('Access token not found');
      }

      const response = await fetch('/api/blacklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': accessToken,
        },
        body: JSON.stringify({
          OfferID: offer || '',
          SubPubID: subPubIDs.join(','),
          AdvertiserID: advertiser || '',
          CampaignID: campaign || '',
          SupplierID: supplier || '',
          StatusID: 'A',
          ListType: 'BL',
          isIP: 0,
          Status: 0,
          Reason: reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Error adding blacklist');
      }

      const data = await response.json();
      if (data && data.status === 'OK') {
        alert('Blacklist añadido correctamente');
        handleCloseAddModal();

        if (advertiser || supplier || campaign || offer) {
          handleFetchBlacklist();
        }
      } else {
        console.error('Error al añadir la blacklist:', data.message);
        alert('Error al añadir la blacklist: ' + data.message);
      }
    } catch (error) {
      console.error('Error al añadir la blacklist:', error);
      alert('Error al añadir la blacklist. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = (field: string) => {
    switch (field) {
      case "advertiser":
        setAdvertiser("");
        setCampaign("");
        setCampaignsList([]);
        setIsSupplierDisabled(false);
        setIsCampaignsDisabled(true);
        break;
      case "supplier":
        setSupplier("");
        setOffer("");
        setOffersList([]);
        setIsAdvertiserDisabled(false);
        setIsOffersDisabled(true);
        break;
      case "campaign":
        setCampaign("");
        break;
      case "offer":
        setOffer("");
        break;
      case "subPubID":
        setSubPubID("");
        setBlacklistData([]);
        setResulConsult("");
        setTotalTime("");
        setTotalSize("");
        break;
      default:
        break;
    }
  };

  const handleClearAll = () => {
    setAdvertiser("");
    setSupplier("");
    setCampaign("");
    setOffer("");
    setSubPubID("");
    setCampaignsList([]);
    setOffersList([]);
    setBlacklistData([]);
    setResulConsult("");
    setTotalTime("");
    setTotalSize("");
    setIsSupplierDisabled(false);
    setIsAdvertiserDisabled(false);
    setIsCampaignsDisabled(true);
    setIsOffersDisabled(true);
    setSelectAll(false);
    setSelectedRows([]);
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedRows(new Array(blacklistData.length).fill(!selectAll));
  };

  const handleRowSelect = (index: number) => {
    const newSelectedRows = [...selectedRows];
    newSelectedRows[index] = !newSelectedRows[index];
    setSelectedRows(newSelectedRows);
    setSelectAll(newSelectedRows.every((row) => row));
  };

  const handleDelete = async () => {
    const selectedIds = blacklistData
      .filter((_, index) => selectedRows[index])
      .map((item) => item._id);

    if (selectedIds.length === 0) {
      alert('Por favor, selecciona al menos una fila para eliminar.');
      return;
    }

    const idString = selectedIds.join(',');

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar las entradas seleccionadas (${selectedIds.length})?`
    );

    if (!confirmDelete) {
      return;
    }

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem('accessToken') || '';
      if (!accessToken) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`/api/blacklist?BlackListID=${encodeURIComponent(idString)}`, {
        method: 'DELETE',
        headers: {
          'Access-Token': accessToken,
        },
      });

      if (!response.ok) {
        throw new Error('Error deleting blacklist');
      }

      const data = await response.json();
      if (data && data.status === 'OK') {
        alert('Entradas eliminadas correctamente');
        setSelectAll(false);
        setSelectedRows([]);
        if (advertiser || supplier || campaign || offer) {
          await handleFetchBlacklist();
        } else {
          setBlacklistData([]);
          setResulConsult('Record count 0');
          setTotalTime('0 seg.');
          setTotalSize('0 Kb.');
        }
      } else {
        console.error('Error al eliminar las entradas:', data.message);
        alert('Error al eliminar las entradas: ' + data.message);
      }
    } catch (error) {
      console.error('Error al eliminar las entradas:', error);
      alert('Error al eliminar las entradas. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = () => {
    try {
      const data = blacklistData.map((item) => ({
        Status: item.status === "A" ? "Active" : item.status === "P" ? "Paused" : item.status,
        Campaign: item.campaign,
        Supplier: item.supplier,
        OfferID: item.offerID,
        SubPubID: item.subPubID,
        "Date From": item.dateFrom,
        Reason: item.reason,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const colWidths = [
        { wch: 10 },
        { wch: 20 },
        { wch: 20 },
        { wch: 10 },
        { wch: 15 },
        { wch: 20 },
        { wch: 30 },
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Blacklist");

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `blacklist_data_${timestamp}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      alert("Error al generar el archivo Excel. Por favor, intenta de nuevo.");
    }
  };

  const showFilterButtons = advertiser || supplier || campaign || offer || subPubID;
  const showTableButtons = blacklistData.length > 0;

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, boxShadow: 1, color: theme.palette.text.primary }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.palette.text.primary }}>Blacklist</h1>
      </Box>

      {isAddModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: { xs: 3, sm: 4 }, borderRadius: 2, maxWidth: 'md', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: theme.palette.text.primary }}>Add Blacklist</h2>
            <Box sx={{ mb: 4 }}>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>


                SubPubIDs (separate by comma, space, or newline)
              </label>
              <TextareaAutosize
                minRows={4}
                className="w-full rounded-md border p-2 text-sm"
                style={{ borderColor: theme.palette.divider, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary }}
                value={subPubIDsInput}
                onChange={(e) => setSubPubIDsInput(e.target.value)}
                placeholder="Enter SubPubIDs..."
              />
            </Box>
            <Box sx={{ mb: 4 }}>
              <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>
                Reason
              </label>
              <Input
                fullWidth
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason..."
                sx={{ height: 48 }}
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={handleCloseAddModal}
                variant="outlined"
                color="inherit"
                size="medium"
                sx={{ minWidth: 100, height: 40 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddBlacklist}
                variant="contained"
                color="success"
                size="medium"
                disabled={isLoading}
                sx={{ minWidth: 100, height: 40 }}
              >
                {isLoading ? <CircularProgress size={20} /> : 'Add'}
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        {showTableButtons && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
  onClick={handleDelete}
  variant="contained"
  color="error"
  size="medium"
  startIcon={<FaTrash />}
  disabled={isLoading}
  sx={{
    minWidth: { xs: '100%', sm: 100 },
    height: 40,
    fontSize: '1rem',
  }}
>
  Delete
</Button>
            <Button
              variant="contained"
              color="warning"
              size="medium"
              startIcon={<FaPause />}
              sx={{
                minWidth: { xs: '100%', sm: 100 },
                height: 40,
                fontSize: '1rem',
              }}
            >
              Pause
            </Button>
            <Button
              onClick={handleExportExcel}
              variant="contained"
              color="inherit"
              size="medium"
              startIcon={<FaFileExcel />}
              sx={{
                minWidth: { xs: '100%', sm: 100 },
                height: 40,
                fontSize: '1rem',
              }}
            >
              Excel
            </Button>
          </Box>
        )}
        {showFilterButtons && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              onClick={handleOpenAddModal}
              variant="contained"
              color="success"
              size="medium"
              startIcon={<FaPlus />}
              sx={{
                minWidth: { xs: '100%', sm: 100 },
                height: 40,
                fontSize: '1rem',
              }}
            >
              Add
            </Button>
            <Button
              onClick={handleFetchBlacklist}
              variant="outlined"
              color="inherit"
              size="medium"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <FaSync />}
              sx={{
                minWidth: { xs: '100%', sm: 100 },
                height: 40,
                fontSize: '1rem',
              }}
            >
              Refresh
            </Button>
            <Button
              onClick={handleClearAll}
              variant="contained"
              color="warning"
              size="medium"
              startIcon={<FaTimes />}
              sx={{
                minWidth: { xs: '100%', sm: 100 },
                height: 40,
                fontSize: '1rem',
              }}
            >
              Clear
            </Button>
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4, color: theme.palette.text.secondary, flexWrap: 'wrap', gap: 2 }}>
        <span>{resulConsult}</span>
        <span>{totalTime}</span>
        <span>{totalSize}</span>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr 1fr' }, gap: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1, color: theme.palette.text.primary }}>
        <Box sx={{ position: 'relative' }}>
           <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>
            Advertisers
          </label>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Select
              fullWidth
              value={advertiser}
              onChange={(e) => handleAdvertiserChange(e.target.value)}
              disabled={isAdvertiserDisabled}
              sx={{
                height: 48,
                bgcolor: 'background.paper',
                '& .MuiSelect-select': { color: theme.palette.text.primary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                opacity: isAdvertiserDisabled ? 0.5 : 1,
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select...</MenuItem>
              {advertisers.map((adv) => (
                <MenuItem key={adv.AdvertiserID} value={adv.AdvertiserID}>
                  {adv.Advertiser}
                </MenuItem>
              ))}
            </Select>
            {advertiser && !isAdvertiserDisabled && (
              <Button
                onClick={() => handleClear("advertiser")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  '&:hover': { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
           <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>
            Supplier
          </label>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Select
              fullWidth
              value={supplier}
              onChange={(e) => handleSupplierChange(e.target.value)}
              disabled={isSupplierDisabled}
              sx={{
                height: 48,
                bgcolor: 'background.paper',
                '& .MuiSelect-select': { color: theme.palette.text.primary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                opacity: isSupplierDisabled ? 0.5 : 1,
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select...</MenuItem>
              {suppliers.map((sup) => (
                <MenuItem key={sup.SupplierID} value={sup.SupplierID}>
                  {sup.Supplier}
                </MenuItem>
              ))}
            </Select>
            {supplier && !isSupplierDisabled && (
              <Button
                onClick={() => handleClear("supplier")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  '&:hover': { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
           <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>
            Campaigns
          </label>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Select
              fullWidth
              value={campaign}
              onChange={(e) => handleCampaignChange(e.target.value)}
              disabled={isCampaignsDisabled || isAdvertiserDisabled}
              sx={{
                height: 48,
                bgcolor: 'background.paper',
                '& .MuiSelect-select': { color: theme.palette.text.primary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                opacity: isCampaignsDisabled || isAdvertiserDisabled ? 0.5 : 1,
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select...</MenuItem>
              {campaignsList.map((camp) => (
                <MenuItem key={camp.CampaignID} value={camp.CampaignID}>
                  {camp.Campaign}
                </MenuItem>
              ))}
            </Select>
            {campaign && !isAdvertiserDisabled && !isCampaignsDisabled && (
              <Button
                onClick={() => handleClear("campaign")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  '&:hover': { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
           <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>
            Offers
          </label>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Select
              fullWidth
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              disabled={isOffersDisabled || isSupplierDisabled}
              sx={{
                height: 48,
                bgcolor: 'background.paper',
                '& .MuiSelect-select': { color: theme.palette.text.primary },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.primary.main },
                opacity: isOffersDisabled || isSupplierDisabled ? 0.5 : 1,
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select...</MenuItem>
              {offersList.map((off) => (
                <MenuItem key={off.OfferID} value={off.OfferID}>
                  {off.Offer}
                </MenuItem>
              ))}
            </Select>
            {offer && !isSupplierDisabled && !isOffersDisabled && (
              <Button
                onClick={() => handleClear("offer")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  '&:hover': { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
           <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>
            SubPubID
          </label>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Input
              fullWidth
              value={subPubID}
              onChange={(e) => setSubPubID(e.target.value)}
              placeholder="Search SubPubID..."
              sx={{ height: 48 }}
            />
            {subPubID && (
              <Button
                onClick={() => handleClear("subPubID")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  '&:hover': { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ mt: 3, overflowX: 'auto', pb: 2 }}>
        <Table sx={{ minWidth: 650, bgcolor: 'background.paper', borderRadius: 1, '& .MuiTableCell-root': { borderBottom: `1px solid ${theme.palette.divider}`, padding: '12px' }, color: theme.palette.text.primary }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={selectAll}
                  onChange={handleSelectAll}
                  sx={{ color: theme.palette.text.primary, '&.Mui-checked': { color: theme.palette.primary.main } }}
                />
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Campaign</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>OfferID</TableCell>
              <TableCell>SubPubID</TableCell>
              <TableCell>Date From</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blacklistData.length > 0 ? (
              blacklistData.map((item, index) => (
                <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows[index] || false}
                      onChange={() => handleRowSelect(index)}
                      sx={{ color: theme.palette.text.primary, '&.Mui-checked': { color: theme.palette.primary.main } }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 1,
                        display: 'inline-block',
                        bgcolor: item.status === 'A' ? 'success.main' : item.status === 'P' ? 'warning.main' : 'grey.500',
                        color: item.status === 'A' ? 'success.contrastText' : item.status === 'P' ? 'warning.contrastText' : 'text.primary',
                      }}
                    >
                      {item.status === 'A' ? 'Active' : item.status === 'P' ? 'Paused' : item.status}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.campaign}>
                    {item.campaign}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.supplier}>
                    {item.supplier}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.offerID}>
                    {item.offerID}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.subPubID}>
                    {item.subPubID}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.dateFrom}>
                    {item.dateFrom}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.reason}>
                    {item.reason}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 2, color: theme.palette.text.secondary }}>
                  No blacklist entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default ShowBlacklist;