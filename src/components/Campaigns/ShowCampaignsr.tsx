"use client";
import { getAdvertisers, getCampaignHeads, getCampaignById, getCampaignCategories } from "@/app/api/filtersService/filtersService";
import apiClient from "@/libs/axiosConfig";
import arrayHeadCategoies from "@/libs/headCategories";
import React, { useState, useEffect,KeyboardEvent } from "react";
import { FaTrash, FaPlus, FaSync, FaEdit, FaPause, FaPlay } from "react-icons/fa";
import { AiFillApple, AiFillAndroid } from "react-icons/ai";
import { FiGlobe } from "react-icons/fi";
//import CreateCampaigns from "./CreateCampaigns";
import { changeStatusCampaign, deleteCampaign } from "@/app/api/campaign/service";
import { Box, Button, Select, MenuItem, Input, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, useTheme } from "@mui/material";
import CreateCampaigns from "./CreateCampaigns";



interface Campaign {
  CampaignID: number;
  Campaign: string;
  CampaignType?: string;
  Advertiser?: string;
  CampaignHead?: string;
  Cost?: number;
  PayOut?: number;
  Discount?: number;
  CampaignCategory?: string;
  Device?: string;
  DeviceID?: string;
  DailyAmount?: number;
  DailyQuantityClick?: number;
  Countrys?: string;
  Comments?: string;
  StatusID?: string;
  Geo?: {
    Icon72?: string;
  };
  CampaignHeadID?: number;
  AdvertiserID?: number;
  URL?: string;
  DailyQuantity?: number;
  Revenue?: number;
  Incent?: number;
  eventsName1?: string;
  eventPayOut1?: number;
  AppIDAppsflyer?: string;
  Banners?: string;
}

interface Advertiser {
  AdvertiserID: number;
  Advertiser: string;
}

const ShowCampaigns: React.FC = () => {
  const theme = useTheme();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState("");
  const [advertiserSearch, setAdvertiserSearch] = useState("");
  const [showAdvertiserSuggestions, setShowAdvertiserSuggestions] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("0");
  const [selectedStatus, setSelectedStatus] = useState("A");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);
  const [isHeadsModalOpen, setIsHeadsModalOpen] = useState(false);
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [regionsList, setRegionsList] = useState<any[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<any[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<any[]>([]);
  const [includeRegions, setIncludeRegions] = useState(false);
  const [geoOption, setGeoOption] = useState("country");
  const [disableRegionsSelect, setDisableRegionsSelect] = useState(false);
  const [campaignHeads, setCampaignHeads] = useState<any[]>([]);
  const [campaignCategories, setCampaignCategories] = useState<any[]>([]);
  const [selectedHeadCampaign, setSelectedHeadCampaign] = useState<any>(null);
  const [isHeadEditModalOpen, setIsHeadEditModalOpen] = useState(false);
  const [showHeadTable, setShowHeadTable] = useState(false);
  const [isStatusChanging, setIsStatusChanging] = useState<{ [key: number]: boolean }>({});
   const [campaignIdInput, setCampaignIdInput] = useState<string>("");   
  const [highlightId, setHighlightId] = useState<number | null>(null);  

  const listCampaignType = [
    { CampaignTypeID: "CPI", CampaignType: "CPI" },
    { CampaignTypeID: "CPA", CampaignType: "CPA" },
    { CampaignTypeID: "CPL", CampaignType: "CPL" },
    { CampaignTypeID: "CPA-Events", CampaignType: "CPA-Events" },
    { CampaignTypeID: "CPC", CampaignType: "CPC" },
  ];

  useEffect(() => {
    const fetchAdvertisers = async () => {
      try {
        const data = await getAdvertisers();
        const sortedData = data.result.sort((a: any, b: any) => a.Advertiser.localeCompare(b.Advertiser));
        setAdvertisers(sortedData);
      } catch (error) {
        console.error("Error fetching advertisers:", error);
      }
    };

    const fetchCampaignCategories = async () => {
      try {
        const data = await getCampaignCategories();
        const arrayJoinCategoies = [...arrayHeadCategoies, ...data.result].sort((a: any, b: any) =>
          a.Description.localeCompare(b.Description)
        );
        setCampaignCategories(arrayJoinCategoies || []);
      } catch (error) {
        console.error("Error fetching campaign categories:", error);
      }
    };

    fetchAdvertisers();
    fetchCampaignCategories();
    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedAdvertiser && isHeadsModalOpen && showHeadTable) {
      const fetchCampaignHeads = async () => {
        try {
          const data = await getCampaignHeads(selectedAdvertiser);
          setCampaignHeads(data.result || []);
        } catch (error) {
          console.error("Error fetching Campaign Heads:", error);
        }
      };

      fetchCampaignHeads();
    }
  }, [selectedAdvertiser, isHeadsModalOpen, showHeadTable]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/campaigns`, {
        params: {
          AdvertiserID: selectedAdvertiser || undefined,
          StartDate: fromDate || undefined,
          EndDate: toDate || undefined,
          StatusID: selectedStatus || undefined,
          Platform: selectedPlatform !== "0" ? parseInt(selectedPlatform, 10) : undefined,
          CampaignName: selectedCampaign || undefined,
        },
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });

      if (response.data && Array.isArray(response.data.result)) {
        let filteredData = response.data.result as Campaign[];
        
        filteredData = filteredData.filter(campaign => {
          if (selectedPlatform === "1") {
            return campaign.Device?.toLowerCase().includes("mobile") || 
                   campaign.Device?.toLowerCase().includes("android");
          } else if (selectedPlatform === "2") {
            return campaign.Device?.toLowerCase().includes("web") || 
                   campaign.Device?.toLowerCase().includes("desktop");
          }
          return true;
        });

        setCampaigns(filteredData);
      } else {
        console.warn("No campaigns found");
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaignsByName = async () => {
    if (!selectedCampaign) return;

    setIsLoading(true);
    try {
      const response = await apiClient.get(`/campaigns`, {
        params: {
          CampaignName: selectedCampaign,
          AdvertiserID: selectedAdvertiser || undefined,
          StartDate: fromDate || undefined,
          EndDate: toDate || undefined,
          StatusID: selectedStatus || undefined,
          Platform: selectedPlatform !== "0" ? parseInt(selectedPlatform, 10) : undefined,
        },
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });

      if (response.data && Array.isArray(response.data.result)) {
        setCampaigns(response.data.result);
      } else {
        console.warn("No campaigns found");
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCampaignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedCampaign(value);

    if (value.length > 0) {
      const filtered = campaigns.filter((campaign: Campaign) =>
        campaign.Campaign.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCampaigns(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCampaign = (campaignName: string) => {
    setSelectedCampaign(campaignName);
    setShowSuggestions(false);
  };

  const handleAdvertiserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAdvertiserSearch(value);

    if (value.length > 0) {
      setShowAdvertiserSuggestions(true);
    } else {
      setShowAdvertiserSuggestions(false);
      setSelectedAdvertiser("");
    }
  };

  const selectAdvertiser = (advertiser: Advertiser) => {
    setSelectedAdvertiser(advertiser.AdvertiserID.toString());
    setAdvertiserSearch(advertiser.Advertiser);
    setShowAdvertiserSuggestions(false);
  };

  const handleAdvertiserFocus = () => {
    setShowAdvertiserSuggestions(true);
  };

  const handleAdvertiserBlur = () => {
    setTimeout(() => {
      setShowAdvertiserSuggestions(false);
    }, 200);
  };

  const handleOpenModal = () => {
    setCampaignToEdit(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCampaignToEdit(null);
  };

  const handleEdit = (campaign: Campaign) => {
    setCampaignToEdit(campaign);
    setIsModalOpen(true);
  };

  const handlePlayPause = async (campaign: Campaign) => {
    const campaignId = campaign.CampaignID;
    setIsStatusChanging(prev => ({ ...prev, [campaignId]: true }));

    const newStatus = campaign.StatusID === "A" ? "P" : "A";

    try {
      const response = await changeStatusCampaign(campaign.CampaignID, newStatus);

      if (response.status === "OK") {
        setCampaigns((prevCampaigns) =>
          prevCampaigns.map((c) =>
            c.CampaignID === campaign.CampaignID ? { ...c, StatusID: newStatus } : c
          )
        );
      } else {
        console.error("Error al actualizar el estado de la campaña:", response.message);
      }
    } catch (error) {
      console.error("Error al actualizar el estado de la campaña:", error);
    } finally {
      setIsStatusChanging(prev => ({ ...prev, [campaignId]: false }));
    }
  };

  const handleDelete = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!campaignToDelete) return;

    try {
      const response = await deleteCampaign(campaignToDelete.CampaignID);

      if (response.status === "OK") {
        setCampaigns((prevCampaigns) =>
          prevCampaigns.filter((c) => c.CampaignID !== campaignToDelete.CampaignID)
        );
      } else {
        console.error("Error al eliminar la campaña:", response.message);
      }
    } catch (error) {
      console.error("Error al eliminar la campaña:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setCampaignToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCampaignToDelete(null);
  };

  const handleEditHeadClick = async (campaignId: number) => {
    try {
      const response = await getCampaignById(campaignId);

      if (!response || !response.result || response.result.length === 0) {
        console.error("No se encontraron datos de la campaña.");
        return;
      }

      setSelectedHeadCampaign(response.result[0]);
      setIsHeadEditModalOpen(true);
    } catch (error) {
      console.error("Error al obtener datos de la campaña:", error);
    }
  };

  const handleSaveHeadCampaign = async () => {
    if (!selectedHeadCampaign) return;

    try {
      const params = new URLSearchParams({
        CampaignHeadID: selectedHeadCampaign.CampaignHeadID.toString(),
        CampaignTypeID: selectedHeadCampaign.CampaignTypeID || "",
        CampaignType: encodeURIComponent(selectedHeadCampaign.CampaignType || ""),
        AdvertiserID: selectedHeadCampaign.AdvertiserID || "",
        CampaignCategoryID: selectedHeadCampaign.CampaignCategoryID || "",
        CampaignCategory: encodeURIComponent(selectedHeadCampaign.CampaignCategory || ""),
        DeviceID: "",
        Device: "",
        DeviceVersion: "",
        DeviceVersionDesc: "",
        StatusID: "A",
        Status: "Active",
        DailyAmount: "0",
        DailyQuantity: "0",
        PackageName: "",
        Icon72: encodeURIComponent(selectedHeadCampaign.Icon72 || ""),
        MarcketURL: encodeURIComponent(selectedHeadCampaign.MarcketURL || ""),
        CR: selectedHeadCampaign.CR?.toString() || "0",
        CRMin: selectedHeadCampaign.CRMin?.toString() || "0",
        TimeInstall: selectedHeadCampaign.CTITMin?.toString() || "0",
        TimeInstallMin: selectedHeadCampaign.CTITMax?.toString() || "0",
        Prepay: selectedHeadCampaign.PrepayTerms?.toString() || "0",
        PrepayTerms: "0",
        VPNCheck: "1",
        LanguageCheck: "0",
        accionApps: "ALTA",
        CampaignHead: encodeURIComponent(selectedHeadCampaign.CampaignHead || ""),
      });

      const url = `https://api.laikad.com/api/campaignshead?${params.toString()}`;

      const response = await apiClient.put(url, null, {
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });

      alert("Campaña actualizada con éxito");
      setIsHeadEditModalOpen(false);
      const updatedCampaigns = await getCampaignHeads(selectedAdvertiser);
      setCampaignHeads(updatedCampaigns.result || []);
    } catch (error) {
      console.error("Error al actualizar la campaña:", error);
      alert("Hubo un error al actualizar la campaña");
    }
  };

  const handleDeleteHeadCampaign = async (campaignId: number) => {
    if (!campaignId) return;

    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta campaña?");
    if (!confirmDelete) return;

    try {
      const url = `https://api.laikad.com/api/campaignshead?CampaignHeadID=${campaignId}`;

      await apiClient.delete(url, {
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });

      alert("Campaña eliminada con éxito");
      const updatedCampaigns = await getCampaignHeads(selectedAdvertiser);
      setCampaignHeads(updatedCampaigns.result || []);
    } catch (error) {
      console.error("Error al eliminar la campaña:", error);
      alert("Hubo un error al eliminar la campaña");
    }
  };

  const renderDeviceIcon = (deviceID?: string) => {
    switch (deviceID) {
      case "IOS":
        return <AiFillApple className="text-gray-600 text-2xl hover:text-gray-800 transition-colors" title="iOS" />;
      case "AND":
        return <AiFillAndroid className="text-green-500 text-2xl hover:text-green-600 transition-colors" title="Android" />;
      case "AOS":
        return (
          <div className="flex space-x-1">
            <AiFillApple className="text-gray-600 text-2xl hover:text-gray-800 transition-colors" title="iOS" />
            <AiFillAndroid className="text-green-500 text-2xl hover:text-green-600 transition-colors" title="Android" />
          </div>
        );
      case "WEB":
        return <FiGlobe className="text-blue-500 text-2xl hover:text-blue-600 transition-colors" title="Web" />;
      default:
        return <span className="text-gray-400">N/A</span>;
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await apiClient.get('/countries', {
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });
      setCountriesList(response.data.result || []);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const fetchRegions = async (countryCode: string) => {
    try {
      const response = await apiClient.get('/cities', {
        params: {
          Countries: countryCode,
        },
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });

      const regions = response.data.result || [];
      const validRegions = regions.filter(
        (region: any) => region.RegionName || region.City
      );
      setRegionsList(validRegions);
    } catch (error) {
      console.error("Error fetching regions:", error);
      setRegionsList([]);
    }
  };

  const handleSelectCountries = (selected: any[]) => {
    setSelectedCountries(selected);

    if (selected.length === 1) {
      const selectedCountryCode = selected[0].Code2;
      fetchRegions(selectedCountryCode);
      setGeoOption("region");
      setDisableRegionsSelect(false);
    } else {
      setRegionsList([]);
      setSelectedRegions([]);
      setGeoOption("country");
      setDisableRegionsSelect(true);
    }
  };

  const handleSelectRegions = (selected: any[]) => {
    setSelectedRegions(selected);
    setIncludeRegions(selected.length > 0);
  };

    const fetchCampaignById = async () => {
  const raw = campaignIdInput.trim();
  if (!raw) return;

  const id = Number(raw);
  if (Number.isNaN(id) || id <= 0) {
    alert("Ingresá un Campaign ID válido (número mayor a 0).");
    return;
  }

  setIsLoading(true);
  try {
    const { data } = await apiClient.get('/campaigns', {
      params: { CampaignID: id }, // <-- sin StatusID
      headers: { "Access-Token": localStorage.getItem("accessToken") },
    });

    const arr = Array.isArray(data?.result)
      ? data.result
      : (data?.result ? [data.result] : []);

    if (arr.length === 0) {
      setCampaigns([]);
      setHighlightId(null);
      alert(`No se encontró campaña con ID ${id}.`);
      return;
    }

    setCampaigns(arr as Campaign[]);
    setHighlightId(id);
    setShowSuggestions(false);
    setSelectedCampaign("");
  } catch (e) {
    console.error("Error buscando CampaignID:", e);
    alert("Ocurrió un error buscando la campaña. Revisá la consola para más detalles.");
  } finally {
    setIsLoading(false);
  }
};

  // <-- ADD: Enter para disparar búsqueda por ID
  const onCampaignIdKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") fetchCampaignById();
  };


  const handleConfirmAdvertiser = () => {
    if (selectedAdvertiser) {
      setShowHeadTable(true);
    }
  };

  const handleCancelAdvertiser = () => {
    setSelectedAdvertiser("");
    setShowHeadTable(false);
    setIsHeadsModalOpen(false);
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, boxShadow: 1, color: theme.palette.text.primary }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.palette.text.primary }}>Campaigns</h1>
      </Box>

  {isModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, maxWidth: '3xl', maxHeight: '90vh', overflowY: 'auto', boxShadow: 3, color: theme.palette.text.primary }}>
            <CreateCampaigns
              selectedAdvertiser={campaignToEdit?.AdvertiserID || Number(selectedAdvertiser) || 0}
              advertisers={advertisers}
              campaignToEdit={campaignToEdit || undefined}
              onClose={handleCloseModal}
              countriesList={countriesList}
              regionsList={regionsList}
              selectedCountries={selectedCountries}
              selectedRegions={selectedRegions}
              geoOption={geoOption}
              disableRegionsSelect={disableRegionsSelect}
              handleSelectCountries={handleSelectCountries}
              handleSelectRegions={handleSelectRegions}
            />
          </Box>
        </Box>
      )}

      {isDeleteModalOpen && campaignToDelete && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: { xs: 4, sm: 6 }, borderRadius: 2, maxWidth: 'lg', width: '90vw', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-lg font-semibold mb-4" style={{ color: theme.palette.text.primary }}>Confirmar Eliminación</h2>
            <p className="mb-6" style={{ color: theme.palette.text.secondary }}>
  ¿Estás seguro de que deseas eliminar la campaña &quot;{campaignToDelete.Campaign}&quot;?
</p>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={cancelDelete} variant="outlined" color="inherit" size="large">
                Cancelar
              </Button>
              <Button onClick={confirmDelete} variant="contained" color="error" size="large">
                Confirmar
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {isHeadsModalOpen && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: { xs: 4, sm: 6 }, borderRadius: 2, maxWidth: '4xl', width: '90vw', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: theme.palette.text.primary }}>Select Head Advertiser</h2>
            <Select
              value={selectedAdvertiser || ""}
              onChange={(e) => setSelectedAdvertiser(e.target.value as string)}
              fullWidth
              sx={{ mb: 4, bgcolor: 'background.paper', height: 48 }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Advertiser</MenuItem>
              {advertisers.map((adv) => (
                <MenuItem key={adv.AdvertiserID} value={adv.AdvertiserID}>
                  {adv.Advertiser}
                </MenuItem>
              ))}
            </Select>
            {showHeadTable && (
              <>
                <h3 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: theme.palette.text.primary }}>Campaign Heads</h3>
                {campaignHeads.length > 0 ? (
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Campaign Head</TableCell>
                        <TableCell>Campaign Type</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>CRMin</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {campaignHeads.map((campaign) => (
                        <TableRow key={campaign.CampaignHeadID} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                          <TableCell>{campaign.CampaignHead || "N/A"}</TableCell>
                          <TableCell>{campaign.CampaignType || "N/A"}</TableCell>
                          <TableCell>{campaign.CampaignCategory || "N/A"}</TableCell>
                          <TableCell>{campaign.CRMin || "0"}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleEditHeadClick(campaign.CampaignHeadID)}
                              size="medium"
                              sx={{ mr: 1, minWidth: 80, height: 40, borderRadius: '50%' }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeleteHeadCampaign(campaign.CampaignHeadID)}
                              size="medium"
                              sx={{ minWidth: 80, height: 40, borderRadius: '50%' }}
                            >
                              X
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-400 mt-4">No Campaign Heads found for this Advertiser.</p>
                )}
              </>
            )}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={handleCancelAdvertiser} variant="outlined" color="inherit" size="medium">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAdvertiser}
                variant="contained"
                color="primary"
                size="medium"
                disabled={!selectedAdvertiser}
              >
                Search
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {isHeadEditModalOpen && selectedHeadCampaign && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, maxWidth: 'xl', boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-xl font-semibold mb-4 text-red-500 border-b-2 border-red-500 pb-2">CAMPAIGN HEAD</h2>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Input
                  fullWidth
                  value={selectedHeadCampaign.AdvertiserID || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, AdvertiserID: e.target.value })
                  }
                  placeholder="Select Advertiser"
                  sx={{ mb: 2, height: 48 }}
                />
              </Box>
              <Box>
                <Input
                  fullWidth
                  value={selectedHeadCampaign.CampaignHead || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, CampaignHead: e.target.value })
                  }
                  placeholder="Campaign Head"
                  sx={{ mb: 2, height: 48 }}
                />
              </Box>
              <Box>
                <Select
                  fullWidth
                  value={selectedHeadCampaign.CampaignType || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, CampaignType: e.target.value })
                  }
                  sx={{ mb: 2, height: 48 }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select Type</MenuItem>
                  {listCampaignType.map((type) => (
                    <MenuItem key={type.CampaignTypeID} value={type.CampaignType}>
                      {type.CampaignType}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box>
                <Select
                  fullWidth
                  value={selectedHeadCampaign.CampaignCategory || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, CampaignCategory: e.target.value })
                  }
                  sx={{ mb: 2, height: 48 }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>Select Category</MenuItem>
                  {campaignCategories.map((category) => (
                    <MenuItem key={category.id} value={category.Description}>
                      {category.Description}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
              <Box>
                <Input
                  fullWidth
                  value={selectedHeadCampaign.AddCategory || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, AddCategory: e.target.value })
                  }
                  placeholder="Add Category"
                  sx={{ mb: 2, height: 48 }}
                />
              </Box>
              <Box>
                <Input
                  fullWidth
                  type="number"
                  value={selectedHeadCampaign.CR || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, CR: e.target.value })
                  }
                  placeholder="CR"
                  sx={{ mb: 2, height: 48 }}
                />
              </Box>
              <Box>
                <Input
                  fullWidth
                  type="number"
                  value={selectedHeadCampaign.CRMin || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, CRMin: e.target.value })
                  }
                  placeholder="Clicks Count"
                  sx={{ mb: 2, height: 48 }}
                />
              </Box>
              <Box>
                <Input
                  fullWidth
                  type="number"
                  value={selectedHeadCampaign.CTITMin || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, CTITMin: e.target.value })
                  }
                  placeholder="CTIT Min"
                  sx={{ mb: 2, height: 48 }}
                />
              </Box>
              <Box>
                <Input
                  fullWidth
                  type="number"
                  value={selectedHeadCampaign.CTITMax || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, CTITMax: e.target.value })
                  }
                  placeholder="CTIT Max"
                  sx={{ mb: 2, height: 48 }}
                />
              </Box>
              <Box sx={{ gridColumn: 'span 2' }}>
                <Input
                  fullWidth
                  value={selectedHeadCampaign.Icon72 || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, Icon72: e.target.value })
                  }
                  placeholder="Icon"
                  sx={{ mb: 2, height: 48 }}
                />
              </Box>
              <Box sx={{ gridColumn: 'span 2' }}>
                <Input
                  fullWidth
                  value={selectedHeadCampaign.MarcketURL || ""}
                  onChange={(e) =>
                    setSelectedHeadCampaign({ ...selectedHeadCampaign, MarcketURL: e.target.value })
                  }
                  placeholder="Market URL"
                  sx={{ mb: 2, height: 48 }}
                />
              </Box>
            </Box>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => setIsHeadEditModalOpen(false)} variant="outlined" color="inherit" size="medium">
                Back
              </Button>
              <Button onClick={handleSaveHeadCampaign} variant="contained" color="primary" size="medium">
                Save and list heads
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1, color: theme.palette.text.primary }}>
        <Box>
          <Input
            fullWidth
            value={advertiserSearch}
            onChange={handleAdvertiserSearchChange}
            onFocus={handleAdvertiserFocus}
            onBlur={handleAdvertiserBlur}
            placeholder="Search advertisers..."
            sx={{ mb: 1, height: 48 }}
          />
          {showAdvertiserSuggestions && (
            <Box sx={{ position: 'absolute', zIndex: 10, mt: 1, width: '100%', bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1, maxHeight: 240, overflowY: 'auto' }}>
              {advertisers
                .filter((advertiser) =>
                  advertiserSearch.length === 0
                    ? true
                    : advertiser.Advertiser.toLowerCase().includes(advertiserSearch.toLowerCase())
                )
                .map((advertiser) => (
                  <Box
                    key={advertiser.AdvertiserID}
                    onClick={() => selectAdvertiser(advertiser)}
                    sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    {advertiser.Advertiser}
                  </Box>
                ))}
            </Box>
          )}
        </Box>

        <Box>
          <Input
            fullWidth
            value={selectedCampaign}
            onChange={handleCampaignChange}
            placeholder="Type campaign name..."
            sx={{ mb: 1, height: 48 }}
          />
          {showSuggestions && filteredCampaigns.length > 0 && (
            <Box sx={{ position: 'absolute', zIndex: 10, mt: 1, width: '100%', bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1, maxHeight: 240, overflowY: 'auto' }}>
              {filteredCampaigns.map((campaign: any) => (
                <Box
                  key={campaign.CampaignID}
                  onClick={() => selectCampaign(campaign.Campaign)}
                  sx={{ p: 1, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                >
                  {campaign.Campaign}
                </Box>
              ))}
            </Box>
          )}
          {selectedCampaign && (
            <Button
              onClick={fetchCampaignsByName}
              variant="outlined"
              size="medium"
              sx={{ mt: 1, height: 48 }}
            >
              🔍
            </Button>
          )}
        </Box>

        {/* 5) NUEVO: Search por Campaign ID */}
<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
  <Input
    fullWidth
    value={campaignIdInput}
    onChange={(e) => setCampaignIdInput(e.target.value)}
    onKeyDown={onCampaignIdKeyDown}
    placeholder="Search by Campaign ID..."
    sx={{ height: 48 }}
    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
  />
  <Button
    onClick={fetchCampaignById}
    variant="contained"
    size="medium"
    sx={{ height: 48, minWidth: 48 }}
    disabled={isLoading || !campaignIdInput.trim()}
  >
    🔎
  </Button>
  {!!campaignIdInput && (
    <Button
      onClick={() => {
        setCampaignIdInput("");
        setHighlightId(null);
        handleRefresh(); // recarga la lista general
      }}
      variant="outlined"
      size="medium"
      sx={{ height: 48 }}
    >
      Limpiar
    </Button>
  )}
</Box>

        <Box>
          <Select
            fullWidth
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as string)}
            sx={{ mb: 1, height: 48 }}
            displayEmpty
          >
            <MenuItem value="" disabled>Status</MenuItem>
            <MenuItem value="A">Run</MenuItem>
            <MenuItem value="P">Not Run</MenuItem>
          </Select>
        </Box>

        <Box>
          <Select
            fullWidth
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as string)}
            sx={{ mb: 1, height: 48 }}
            displayEmpty
          >
            <MenuItem value="" disabled>Platform</MenuItem>
            <MenuItem value="0">All</MenuItem>
            <MenuItem value="1">Mobile</MenuItem>
            <MenuItem value="2">Desktop</MenuItem>
          </Select>
        </Box>

        <Box sx={{ gridColumn: 'span 4', display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
          <Button
            onClick={handleOpenModal}
            variant="contained"
            color="success"
            size="medium"
            startIcon={<FaPlus />}
            sx={{
              minWidth: { xs: '100%', sm: 100 },
              height: 40,
              mb: { xs: 2, sm: 0 },
              fontSize: '1rem',
            }}
          >
            Add
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outlined"
            color="inherit"
            size="medium"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : <FaSync />}
            sx={{
              minWidth: { xs: '100%', sm: 100 },
              height: 40,
              mb: { xs: 2, sm: 0 },
              fontSize: '1rem',
            }}
          >
            Refresh
          </Button>
          <Button
            onClick={() => setIsHeadsModalOpen(true)}
            variant="contained"
            color="primary"
            size="medium"
            sx={{
              minWidth: { xs: '100%', sm: 100 },
              height: 40,
              fontSize: '1rem',
            }}
          >
            Heads
          </Button>
        </Box>
      </Box>

      <Box sx={{ mt: 3, overflowX: 'auto', pb: 2 }}>
        <Table sx={{ minWidth: 650, bgcolor: 'background.paper', borderRadius: 1, '& .MuiTableCell-root': { borderBottom: '1px solid rgba(224, 224, 224, 1)', padding: '12px' }, color: theme.palette.text.primary }}>
          <TableHead>
            <TableRow>
              <TableCell>Actions</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Advertiser</TableCell>
              <TableCell>Head Campaigns</TableCell>
              <TableCell>PayOut Install</TableCell>
              <TableCell>PayOut Event</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>Daily Budget</TableCell>
              <TableCell>Daily Installs</TableCell>
              <TableCell>Countries</TableCell>
              <TableCell>Preview Link</TableCell>
              <TableCell>Comments</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.length > 0 ? (
              campaigns.map((campaign: Campaign) => (
                <TableRow key={campaign.CampaignID} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        onClick={() => handleEdit(campaign)}
                        variant="contained"
                        size="small"
                        sx={{
                          minWidth: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: theme.palette.grey[300],
                          color: theme.palette.text.primary,
                          '&:hover': {
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                          },
                          p: 0.5,
                        }}
                      >
                        <FaEdit />
                      </Button>
                      <Button
  onClick={() => handlePlayPause(campaign)}
  variant="contained"
  size="small"
  disabled={isStatusChanging[campaign.CampaignID]} 
  sx={{
    minWidth: 40,
    height: 40,
    borderRadius: '50%',
    bgcolor: theme.palette.grey[300],
    color: theme.palette.text.primary,
    '&:hover': {
      bgcolor: theme.palette.warning.main,
      color: theme.palette.warning.contrastText,
    },
    p: 0.5,
  }}
>
  {isStatusChanging[campaign.CampaignID] ? <CircularProgress size={16} /> : campaign.StatusID === "A" ? <FaPlay /> : <FaPause />}
</Button>
                      <Button
                        onClick={() => handleDelete(campaign)}
                        variant="contained"
                        size="small"
                        sx={{
                          minWidth: 40,
                          height: 40,
                          borderRadius: '50%',
                          bgcolor: theme.palette.grey[300],
                          color: theme.palette.text.primary,
                          '&:hover': {
                            bgcolor: theme.palette.error.main,
                            color: theme.palette.error.contrastText,
                          },
                          p: 0.5,
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </Box>
                  </TableCell>
                  <TableCell>{renderDeviceIcon(campaign.DeviceID)}</TableCell>
                  <TableCell>{campaign.CampaignType || "N/A"}</TableCell>
                  <TableCell>{campaign.Advertiser || "N/A"}</TableCell>
                  <TableCell>
  {campaign.CampaignHead
    ? `${campaign.CampaignHead}${campaign.CampaignID ? ` (${campaign.CampaignID})` : ""}`
    : (campaign.CampaignID ? `(${campaign.CampaignID})` : "N/A")}
</TableCell>
                  <TableCell>${campaign.Revenue || "0"}</TableCell>
                  <TableCell>${campaign.eventPayOut1 || "0"}</TableCell>
                  <TableCell>{campaign.CampaignCategory || "N/A"}</TableCell>
                  <TableCell>{campaign.Device || "N/A"}</TableCell>
                  <TableCell>${campaign.DailyAmount || "0"}</TableCell>
                  <TableCell>{campaign.DailyQuantityClick || "0"}</TableCell>
                  <TableCell>{campaign.Countrys || "N/A"}</TableCell>
                  <TableCell>
                    <a href={campaign.Geo?.Icon72} target="_blank" className="text-blue-500 hover:underline">
                      Link
                    </a>
                  </TableCell>
                  <TableCell>{campaign.Comments || "N/A"}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={15} sx={{ textAlign: 'center', py: 2 }}>
                  No campaigns found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default ShowCampaigns;