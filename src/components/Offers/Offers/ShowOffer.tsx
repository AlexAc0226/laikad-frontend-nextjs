"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaTrash, FaPlus, FaSync, FaEdit, FaEye, FaPlay, FaPause, FaCopy, FaEraser, FaTimes, FaCheck, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";
import { getSuppliers, getAdvertisers } from "@/app/api/filtersService/filtersService";
import { getOffers, createOrUpdateOffer, changeStatusOffer } from "@/app/api/offer/service";
import { getCampaignsByAdvertiserID, getAllCampaigns } from "@/app/api/campaign/service";
import { Box, Button, Select, MenuItem, Input, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, useTheme, TextareaAutosize, Tooltip, SelectChangeEvent } from "@mui/material";

// Definimos las interfaces para los datos
interface Advertiser {
  AdvertiserID: number;
  Advertiser: string;
}

interface Supplier {
  SupplierID: number;
  Supplier: string;
  PostBackURL: string;
}

interface Campaign {
  CampaignID: string;
  CampaignName: string;
}

interface Offer {
  OfferId: string;
  AccountManager: string;
  Offer: string;
  Campaign: string;
  CampaignID: string;
  OfferType: string;
  Supplier: string;
  Proxy: string;
  Cost: string;
  PostBackURL: string;
  CapClick: string;
  CapInstallsEvents: string;
  Banners: string;
  Category: string;
  Countries: string;
  Device: string;
  PreviewLink: string;
  UrlClickSupplierTracking: string;
  UrlTestClick: string;
  StatusID: string;
  status: string;
  isPlaying?: boolean;
  Revenue?: string;
  CampaignTypeID?: string;
  DailyQuantityClick?: string;
  DailyQuantity?: string;
  Advertiser: string;
}

interface CampaignData {
  Campaign: string;
  CampaignID: string;
  Advertiser: string;
  AdvertiserID: string;
  Revenue: string;
  DailyQuantity: string;
  DailyQuantityClick: string;
  eventPayOut1: string;
  CampaignTypeID: string;
  URL: string;
}

interface OfferFormData {
  campaign: string;
  campaignId: string;
  supplier: string;
  supplierId: string;
  advertiser: string;
  advertiserId: string;
  advertiserUrl: string;
  urlPostback: string;
  offerName: string;
  cost: string;
  payout: string;
  capClicks: string;
  capInstallEvent: string;
  proxy: string;
  statusId: string;
  offer: string;
  offerId: string;
}

interface OfferResult {
  status: "OK" | "Error";
  message?: string;
  Offer?: string;
}

interface CreateOfferResponse {
  result: OfferResult[];
}

const ShowOffers: React.FC = () => {
  const theme = useTheme();
  // Estados para los filtros
  const [advertiser, setAdvertiser] = useState<string>("");
  const [supplier, setSupplier] = useState<string>("");
  const [status, setStatus] = useState("Active");

  // Estados para los datos de los selects
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Estado para las ofertas y métricas
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resulConsult, setResulConsult] = useState("Record count 0");
  const [totalTime, setTotalTime] = useState("0 seg.");
  const [totalSize, setTotalSize] = useState("0 Kb.");

  // Estados para el modal de edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoadingEditModal, setIsLoadingEditModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    offer: "",
    PostBackURL: "",
    cost: "",
    proxy: "",
    DailyCapClick: "",
    DailyCap: "",
    status: "Active",
  });

  // Estados para el modal de detalles
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingDetailsModal, setIsLoadingDetailsModal] = useState(false);
  const [selectedOfferForDetails, setSelectedOfferForDetails] = useState<Offer | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Estados para el modal de "Add from Supplier"
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);
  const [isLoadingAddSupplierModal, setIsLoadingAddSupplierModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [allCampaigns, setAllCampaigns] = useState<CampaignData[]>([]);
  const [campaignSearchQuery, setCampaignSearchQuery] = useState<string>("");
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignData[]>([]);
  const [selectedSupplierCampaigns, setSelectedSupplierCampaigns] = useState<string[]>([]);
  const [offerForms, setOfferForms] = useState<OfferFormData[]>([]);
  const [selectedNewOffer, setSelectedNewOffer] = useState<string>("");
  const [isCampaignDropdownOpen, setIsCampaignDropdownOpen] = useState(false);
  const campaignDropdownRef = useRef<HTMLDivElement>(null);

  // Estados para el modal de "Add from Advertiser"
  const [isAddAdvertiserModalOpen, setIsAddAdvertiserModalOpen] = useState(false);
  const [isLoadingAddAdvertiserModal, setIsLoadingAddAdvertiserModal] = useState(false);
  const [selectedAdvertiser, setSelectedAdvertiser] = useState<string>("");
  const [advertiserCampaigns, setAdvertiserCampaigns] = useState<Campaign[]>([]);
  const [selectedAdvertiserCampaigns, setSelectedAdvertiserCampaigns] = useState<string[]>([]);
  const [selectedAdvertiserSupplier, setSelectedAdvertiserSupplier] = useState<string>("");

  // Estado para manejar la carga del cambio de estado
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);

  // Estados para el modal de confirmación
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<"success" | "error" | "mixed">("success");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  // Cargar los datos de Advertisers y Suppliers al montar el componente
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

  // Fetch campaigns when an advertiser is selected (for "Add from Advertiser" modal)
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!selectedAdvertiser) {
        setAdvertiserCampaigns([]);
        setSelectedAdvertiserCampaigns([]);
        return;
      }

      try {
        const response = await getCampaignsByAdvertiserID(Number(selectedAdvertiser));
        if (response && Array.isArray(response.result)) {
          setAdvertiserCampaigns(response.result);
        } else {
          console.warn("No campaigns found for advertiser:", selectedAdvertiser);
          setAdvertiserCampaigns([]);
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setAdvertiserCampaigns([]);
      }
    };

    fetchCampaigns();
  }, [selectedAdvertiser]);

  // Fetch campaigns when the "Add from Supplier" modal opens
  useEffect(() => {
    if (!isAddSupplierModalOpen) {
      setAllCampaigns([]);
      setFilteredCampaigns([]);
      return;
    }

    const fetchCampaigns = async () => {
      try {
        const campaignsData = await getAllCampaigns();
        let campaignsArray: CampaignData[] = [];
        if (Array.isArray(campaignsData)) {
          campaignsArray = campaignsData;
        } else if (campaignsData && Array.isArray(campaignsData.result)) {
          campaignsArray = campaignsData.result;
        } else {
          console.warn("No campaigns found or unexpected data structure");
        }
        setAllCampaigns(campaignsArray);
        setFilteredCampaigns(campaignsArray);
      } catch (error) {
        console.error("Error fetching campaigns for Add from Supplier modal:", error);
        setAllCampaigns([]);
        setFilteredCampaigns([]);
      }
    };

    fetchCampaigns();
  }, [isAddSupplierModalOpen]);

  // Filter campaigns based on search query and exclude selected campaigns
  useEffect(() => {
    let filtered = allCampaigns;

    if (campaignSearchQuery.trim() !== "") {
      const escapedQuery = campaignSearchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedQuery}\\b`, "i");
      filtered = filtered.filter((campaign) => regex.test(campaign.Campaign));
    }

    filtered = filtered.filter((campaign) => !selectedSupplierCampaigns.includes(campaign.Campaign));

    setFilteredCampaigns(filtered);
  }, [campaignSearchQuery, allCampaigns, selectedSupplierCampaigns]);

  // Handle clicks outside the campaign dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (campaignDropdownRef.current && !campaignDropdownRef.current.contains(event.target as Node)) {
        setIsCampaignDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Update offer forms when campaigns or supplier are selected
  useEffect(() => {
    if (!selectedSupplier || selectedSupplierCampaigns.length === 0) {
      setOfferForms([]);
      setSelectedNewOffer("");
      return;
    }

    const supplierData = suppliers.find((sup) => parseInt(sup.SupplierID.toString()) === parseInt(selectedSupplier));
    const supplierName = supplierData?.Supplier || "Unknown Supplier";
    const supplierPostBackURL = supplierData?.PostBackURL || "N/A";

    const newOfferForms: OfferFormData[] = selectedSupplierCampaigns.map((campaignName) => {
      const existingForm = offerForms.find((form) => form.campaign === campaignName);
      if (existingForm) {
        return existingForm;
      }

      const campaignData = allCampaigns.find((camp) => camp.Campaign === campaignName) || {
        Campaign: campaignName,
        CampaignID: "",
        Advertiser: "N/A",
        AdvertiserID: "",
        Revenue: "0",
        DailyQuantity: "0",
        DailyQuantityClick: "0",
        eventPayOut1: "0",
        CampaignTypeID: "",
        URL: "N/A",
      };

      const payout = campaignData.CampaignTypeID === "CP2" ? campaignData.eventPayOut1 : campaignData.Revenue;
      const cost = (parseFloat(payout) * 0.7).toFixed(2);
      const capClicks = campaignData.DailyQuantityClick
        ? Math.floor(parseFloat(campaignData.DailyQuantityClick) * 0.25).toString()
        : "0";
      const capInstallEvent = campaignData.DailyQuantity || "0";
      const proxy = "70";

      return {
        campaign: campaignData.Campaign,
        campaignId: campaignData.CampaignID,
        supplier: supplierName,
        supplierId: selectedSupplier,
        advertiser: campaignData.Advertiser,
        advertiserId: campaignData.AdvertiserID,
        advertiserUrl: campaignData.URL || "N/A",
        urlPostback: supplierPostBackURL,
        offerName: campaignData.Campaign,
        cost,
        payout,
        capClicks,
        capInstallEvent,
        proxy,
        statusId: "A",
        offer: "",
        offerId: "",
      };
    });

    setOfferForms(newOfferForms);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSupplierCampaigns, selectedSupplier, suppliers, allCampaigns]);

  const handleCampaignSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCampaignSearchQuery(e.target.value);
    setIsCampaignDropdownOpen(true);
  };

  const handleSelectCampaign = (campaign: string) => {
    if (!selectedSupplierCampaigns.includes(campaign)) {
      setSelectedSupplierCampaigns((prev) => [...prev, campaign]);
    }
    setCampaignSearchQuery("");
    setIsCampaignDropdownOpen(false);
  };

  const removeSupplierCampaign = (campaign: string) => {
    setSelectedSupplierCampaigns((prev) => prev.filter((c) => c !== campaign));
  };

  const handleOfferFormChange = (index: number, field: keyof OfferFormData, value: string) => {
    setOfferForms((prev) =>
      prev.map((form, i) =>
        i === index ? { ...form, [field]: value } : form
      )
    );
  };

  const handleCreateOffers = async () => {
    if (offerForms.length === 0) {
      alert("Please select at least one campaign to create an offer.");
      return;
    }

    setIsLoadingAddSupplierModal(true);
    try {
      const offerDataList = offerForms.map((form) => ({
        CampaignID: form.campaignId,
        Cost: form.cost,
        DailyCap: form.capInstallEvent,
        DailyCapClick: form.capClicks,
        Offer: form.offerName,
        OfferID: form.offerId,
        PostBackURL: form.urlPostback,
        Proxy: form.proxy,
        StatusID: form.statusId,
        SupplierID: form.supplierId,
      }));

      const response: CreateOfferResponse = await createOrUpdateOffer("POST", offerDataList);

      if (response.result && Array.isArray(response.result)) {
        const successfulOffers = response.result.filter((res) => res.status === "OK");
        const failedOffers = response.result.filter((res) => res.status === "Error");

        if (successfulOffers.length === response.result.length) {
          setConfirmationStatus("success");
          setConfirmationMessage("All offers created successfully!");
        } else if (failedOffers.length === response.result.length) {
          setConfirmationStatus("error");
          setConfirmationMessage("Failed to create offers. They may already exist.");
        } else {
          setConfirmationStatus("mixed");
          setConfirmationMessage(
            `${successfulOffers.length} offer${successfulOffers.length > 1 ? "s" : ""} created successfully, ` +
            `${failedOffers.length} offer${failedOffers.length > 1 ? "s" : ""} failed to create.`
          );
        }

        // Fetch offers for the specific supplier we just created offers for
        await handleFetchOffers(selectedSupplier);
      } else {
        setConfirmationStatus("error");
        setConfirmationMessage("Unexpected response from server.");
      }

      handleCloseAddSupplierModal();
      setIsConfirmationModalOpen(true);
    } catch (error) {
      console.error("Error creating offers:", error);
      setConfirmationStatus("error");
      setConfirmationMessage("An error occurred while creating offers. Please try again.");
      handleCloseAddSupplierModal();
      setIsConfirmationModalOpen(true);
    } finally {
      setIsLoadingAddSupplierModal(false);
    }
  };

  const handleCampaignSelection = (e: SelectChangeEvent<string[]>) => {
    const options = e.target.value as string[];
    setSelectedAdvertiserCampaigns(options);
  };

  const removeCampaign = (campaignId: string) => {
    setSelectedAdvertiserCampaigns((prev) => prev.filter((id) => id !== campaignId));
  };

  const handleFetchOffers = async (specificSupplierId?: string) => {
    setIsLoading(true);
    try {
      const params = {
        OfferID: "",
        CampaignID: "",
        SupplierID: specificSupplierId || supplier || "",
        StatusID: "",
        AdvertiserID: advertiser || "",
      };

      const response = await getOffers(params);

      if (response && Array.isArray(response.result)) {
        const formattedOffers = response.result.map((item: any, index: number) => ({
          Advertiser: item.Advertiser || "N/A",
          AccountManager: item.AccountManager || "N/A",
          OfferId: item.OfferID || index.toString(),
          Offer: item.Offer || "N/A",
          Campaign: item.Campaign || "N/A",
          CampaignID: item.CampaignID || "",
          OfferType: item.CampaignType || "N/A",
          Supplier: item.Supplier || "N/A",
          Proxy: item.Proxy || "N/A",
          Cost: item.Cost ? String(item.Cost) : "0",
          PostBackURL: item.PostBackURL || "",
          CapClick: item.DailyCapClick ? String(item.DailyCapClick) : "0",
          CapInstallsEvents: item.DailyCap ? String(item.DailyCap) : "0",
          Banners: item.Banners || "N/A",
          Category: item.Category || "N/A",
          Countries: item.Countries || "N/A",
          Device: item.Device || "N/A",
          PreviewLink: item.Preview_Link || "N/A",
          UrlClickSupplierTracking: item.url_click || "N/A",
          UrlTestClick: item.url_test || "N/A",
          StatusID: item.StatusID || "",
          status: item.StatusID === "A" ? "Active" : "Paused",
          isPlaying: item.StatusID === "A",
          Revenue: item.Revenue || "0",
          CampaignTypeID: item.CampaignType || "",
          DailyQuantityClick: item.DailyQuantityClick || "0",
          DailyQuantity: item.DailyQuantity || "0",
        }));

        setOffers(formattedOffers);
        setResulConsult(`Record count ${response.total || formattedOffers.length}`);
        setTotalTime(`${response.time || "0.001"} seg.`);
        setTotalSize(`${response.size || "1034"} Kb.`);
      } else {
        console.warn("No offers found");
        setOffers([]);
        setResulConsult("Record count 0");
        setTotalTime("0 seg.");
        setTotalSize("0 Kb.");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setOffers([]);
      setResulConsult("Record count 0");
      setTotalTime("0 seg.");
      setTotalSize("0 Kb.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOffers = (() => {
    let filtered = [...offers];

    if (status === "Active") {
      filtered = filtered.filter((offer) => offer.StatusID === "A");
    } else if (status === "Paused") {
      filtered = filtered.filter((offer) => offer.StatusID === "P");
    } else if (status === "All") {
      filtered.sort((a, b) => {
        if (a.StatusID === "A" && b.StatusID === "P") return -1;
        if (a.StatusID === "P" && b.StatusID === "A") return 1;
        return 0;
      });
    }

    return filtered;
  })();

  const handleTogglePlayPause = async (offer: Offer) => {
    const newStatusID = offer.StatusID === "A" ? "P" : "A";
    setChangingStatusId(offer.OfferId);

    try {
      const params = {
        OfferID: offer.OfferId,
        StatusID: newStatusID,
      };

      await changeStatusOffer(params);

      setOffers((prev) =>
        prev.map((o) =>
          o.OfferId === offer.OfferId
            ? {
                ...o,
                StatusID: newStatusID,
                status: newStatusID === "A" ? "Active" : "Paused",
                isPlaying: newStatusID === "A",
              }
            : o
        )
      );
    } catch (error) {
      console.error("Error changing offer status:", error);
      alert("Failed to change offer status. Please try again.");
    } finally {
      setChangingStatusId(null);
    }
  };

  const handleClear = (field: string) => {
    if (field === "advertiser") {
      setAdvertiser("");
    } else if (field === "supplier") {
      setSupplier("");
    } else if (field === "status") {
      setStatus("Active");
    }
  };

  const handleClearAll = () => {
    setAdvertiser("");
    setSupplier("");
    setStatus("Active");
    setOffers([]);
    setResulConsult("Record count 0");
    setTotalTime("0 seg.");
    setTotalSize("0 Kb.");
  };

  const showRefreshButton = advertiser !== "" || supplier !== "";
  const showClearButton =
    offers.length > 0 || advertiser !== "" || supplier !== "" || status !== "Active";
  const hasPausedOffers = offers.some((offer) => offer.StatusID === "P");

  const handleOpenEditModal = async (offer: Offer) => {
    setSelectedOffer(null);
    setFormData({
      offer: "",
      PostBackURL: "",
      cost: "",
      proxy: "",
      DailyCapClick: "",
      DailyCap: "",
      status: "Active",
    });
    setIsLoadingEditModal(true);
    setIsEditModalOpen(true);

    setTimeout(() => {
      setSelectedOffer(offer);
      setFormData({
        offer: offer.Offer || "",
        PostBackURL: offer.PostBackURL || "",
        cost: offer.Cost && offer.Cost !== "N/A" ? String(offer.Cost) : "",
        proxy: offer.Proxy || "",
        DailyCapClick: offer.CapClick ? String(offer.CapClick) : "",
        DailyCap: offer.CapInstallsEvents ? String(offer.CapInstallsEvents) : "",
        status: offer.status || "Active",
      });
      setIsLoadingEditModal(false);
    }, 300);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedOffer(null);
    setIsLoadingEditModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAccept = async () => {
    if (!formData.cost) {
      alert("Cost is required");
      return;
    }
    if (isNaN(Number(formData.cost))) {
      alert("Cost must be a valid number");
      return;
    }
    if (selectedOffer) {
      setIsLoadingEditModal(true);
      try {
        const supplier = suppliers.find((sup) => sup.Supplier === selectedOffer.Supplier);
        if (!supplier) {
          throw new Error("Supplier not found");
        }

        const offerData = {
          CampaignID: selectedOffer.CampaignID,
          Cost: formData.cost,
          DailyCap: formData.DailyCap || "0",
          DailyCapClick: formData.DailyCapClick || "0",
          Offer: formData.offer,
          OfferID: selectedOffer.OfferId,
          PostBackURL: formData.PostBackURL || "",
          Proxy: formData.proxy || "0",
          StatusID: formData.status === "Active" ? "A" : "P",
          SupplierID: String(supplier.SupplierID),
        };

        await createOrUpdateOffer("PUT", [offerData]);

        setOffers((prev) =>
          prev.map((offer) =>
            offer.OfferId === selectedOffer.OfferId
              ? {
                  ...offer,
                  Offer: formData.offer,
                  PostBackURL: formData.PostBackURL,
                  Cost: String(formData.cost),
                  Proxy: formData.proxy,
                  CapClick: formData.DailyCapClick,
                  CapInstallsEvents: formData.DailyCap,
                  status: formData.status,
                  StatusID: formData.status === "Active" ? "A" : "P",
                  isPlaying: formData.status === "Active",
                }
              : offer
          )
        );

        handleCloseEditModal();
      } catch (error) {
        console.error("Error updating offer:", error);
        alert("Failed to update offer. Please try again.");
      } finally {
        setIsLoadingEditModal(false);
      }
    }
  };

  const handleOpenDetailsModal = async (offer: Offer) => {
    setSelectedOfferForDetails(null);
    setIsLoadingDetailsModal(true);
    setIsDetailsModalOpen(true);

    setTimeout(() => {
      setSelectedOfferForDetails(offer);
      setIsLoadingDetailsModal(false);
    }, 300);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOfferForDetails(null);
    setIsLoadingDetailsModal(false);
    setCopySuccess(false);
  };

  const handleOpenAddSupplierModal = () => {
    setSelectedSupplier("");
    setCampaignSearchQuery("");
    setSelectedSupplierCampaigns([]);
    setOfferForms([]);
    setSelectedNewOffer("");
    setIsLoadingAddSupplierModal(true);
    setIsAddSupplierModalOpen(true);
    setIsCampaignDropdownOpen(true);

    setTimeout(() => {
      setIsLoadingAddSupplierModal(false);
    }, 300);
  };

  const handleCloseAddSupplierModal = () => {
    setIsAddSupplierModalOpen(false);
    setSelectedSupplier("");
    setCampaignSearchQuery("");
    setSelectedSupplierCampaigns([]);
    setOfferForms([]);
    setSelectedNewOffer("");
    setIsLoadingAddSupplierModal(false);
    setIsCampaignDropdownOpen(false);
  };

  const handleOpenAddAdvertiserModal = () => {
    setSelectedAdvertiser("");
    setAdvertiserCampaigns([]);
    setSelectedAdvertiserCampaigns([]);
    setSelectedAdvertiserSupplier("");
    setIsLoadingAddAdvertiserModal(true);
    setIsAddAdvertiserModalOpen(true);

    setTimeout(() => {
      setIsLoadingAddAdvertiserModal(false);
    }, 300);
  };

  const handleCloseAddAdvertiserModal = () => {
    setIsAddAdvertiserModalOpen(false);
    setSelectedAdvertiser("");
    setAdvertiserCampaigns([]);
    setSelectedAdvertiserCampaigns([]);
    setSelectedAdvertiserSupplier("");
    setIsLoadingAddAdvertiserModal(false);
  };

  const handleCopyToClipboard = () => {
    if (!selectedOfferForDetails) return;

    const offerDetailsText = `
Account Manager: ${selectedOfferForDetails.AccountManager || "N/A"}
Offer ID: ${selectedOfferForDetails.OfferId || "N/A"}
Offer: ${selectedOfferForDetails.Offer || "N/A"}
Campaign: ${selectedOfferForDetails.Campaign || "N/A"}
Campaign ID: ${selectedOfferForDetails.CampaignID || "N/A"}
Offer Type: ${selectedOfferForDetails.OfferType || "N/A"}
Supplier: ${selectedOfferForDetails.Supplier || "N/A"}
Proxy: ${selectedOfferForDetails.Proxy || "N/A"}
Cost: ${selectedOfferForDetails.Cost || "N/A"}
PostBack URL: ${selectedOfferForDetails.PostBackURL || "N/A"}
Cap Click: ${selectedOfferForDetails.CapClick || "N/A"}
Cap Installs/Events: ${selectedOfferForDetails.CapInstallsEvents || "N/A"}
Banners: ${selectedOfferForDetails.Banners || "N/A"}
Category: ${selectedOfferForDetails.Category || "N/A"}
Countries: ${selectedOfferForDetails.Countries || "N/A"}
Device: ${selectedOfferForDetails.Device || "N/A"}
Preview Link: ${selectedOfferForDetails.PreviewLink || "N/A"}
URL Click Supplier Tracking: ${selectedOfferForDetails.UrlClickSupplierTracking || "N/A"}
URL Test Click: ${selectedOfferForDetails.UrlTestClick || "N/A"}
Status: ${selectedOfferForDetails.status || "N/A"}
`.trim();

    navigator.clipboard.writeText(offerDetailsText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleNewOffers = () => {
    setIsConfirmationModalOpen(false);
    handleOpenAddSupplierModal();
  };

  return (
    <Box sx={{ p: 3, bgcolor: "background.default", borderRadius: 2, boxShadow: 1, color: theme.palette.text.primary }}>
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.palette.text.primary }}>
          Offers
        </h1>
      </Box>

      {/* Filtros */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr 1fr 1fr" },
          gap: 2,
          bgcolor: "background.paper",
          p: 2,
          borderRadius: 1,
          color: theme.palette.text.primary,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>
            Advertisers
          </label>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Select
              fullWidth
              value={advertiser}
              onChange={(e) => setAdvertiser(e.target.value)}
              sx={{
                height: 48,
                bgcolor: "background.paper",
                "& .MuiSelect-select": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select...
              </MenuItem>
              {advertisers.map((adv) => (
                <MenuItem key={adv.AdvertiserID} value={adv.AdvertiserID}>
                  {adv.Advertiser}
                </MenuItem>
              ))}
            </Select>
            {advertiser && (
              <Button
                onClick={() => handleClear("advertiser")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  "&:hover": { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ position: "relative" }}>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>
            Supplier
          </label>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Select
              fullWidth
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              sx={{
                height: 48,
                bgcolor: "background.paper",
                "& .MuiSelect-select": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select...
              </MenuItem>
              {suppliers.map((sup) => (
                <MenuItem key={sup.SupplierID} value={sup.SupplierID}>
                  {sup.Supplier}
                </MenuItem>
              ))}
            </Select>
            {supplier && (
              <Button
                onClick={() => handleClear("supplier")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  "&:hover": { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ position: "relative" }}>
          <label className="block text-sm font-medium mb-1" style={{ color: theme.palette.text.secondary }}>
            Status
          </label>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Select
              fullWidth
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{
                height: 48,
                bgcolor: "background.paper",
                "& .MuiSelect-select": { color: theme.palette.text.primary },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
              }}
              displayEmpty
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Paused">Paused</MenuItem>
            </Select>
            {status !== "Active" && (
              <Button
                onClick={() => handleClear("status")}
                sx={{
                  minWidth: 40,
                  height: 40,
                  ml: 1,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  "&:hover": { bgcolor: theme.palette.error.main, color: theme.palette.error.contrastText },
                }}
              >
                <FaTrash />
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ gridColumn: { xs: "span 1", sm: "span 2", lg: "span 2" }, display: "flex", justifyContent: "flex-end", gap: 2, alignItems: "flex-end", flexWrap: "wrap" }}>
          <Tooltip title="Add Offer from Supplier">
            <Button
              onClick={handleOpenAddSupplierModal}
              variant="contained"
              color="success"
              size="medium"
              startIcon={<FaPlus />}
              sx={{
                minWidth: { xs: "100%", sm: 100 },
                height: 40,
                fontSize: "1rem",
              }}
            >
              Create Offer
            </Button>
          </Tooltip>
          {showRefreshButton && (
            <Tooltip title="Refresh Offers">
              <Button
                onClick={() => handleFetchOffers()}
                variant="outlined"
                color="inherit"
                size="medium"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : <FaSync />}
                sx={{
                  minWidth: { xs: "100%", sm: 100 },
                  height: 40,
                  fontSize: "1rem",
                }}
              >
                Refresh
              </Button>
            </Tooltip>
          )}
          {showClearButton && (
            <Tooltip title="Clear Filters and Results">
              <Button
                onClick={handleClearAll}
                variant="contained"
                color="warning"
                size="medium"
                startIcon={<FaEraser />}
                sx={{
                  minWidth: { xs: "100%", sm: 100 },
                  height: 40,
                  fontSize: "1rem",
                }}
              >
                Clear
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4, color: theme.palette.text.secondary, flexWrap: "wrap", gap: 2 }}>
        <span>{resulConsult}</span>
        <span>{totalTime}</span>
        <span>{totalSize}</span>
      </Box>

      {hasPausedOffers && status === "Active" && (
        <Box
          sx={{
            bgcolor: "warning.main",
            color: "warning.contrastText",
            p: 2,
            borderRadius: 1,
            textAlign: "center",
            mb: 4,
          }}
        >
          There are paused offers available. Change the status filter to Paused or All to view them.
        </Box>
      )}

      {/* Tabla de Ofertas */}
      <Box sx={{ mt: 3, overflowX: "auto", pb: 2 }}>
        <Table sx={{ minWidth: 650, bgcolor: "background.paper", borderRadius: 1, "& .MuiTableCell-root": { borderBottom: `1px solid ${theme.palette.divider}`, padding: "12px" }, color: theme.palette.text.primary }}>
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Advertiser</TableCell>
              <TableCell>Offer</TableCell>
              <TableCell>Campaign</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Proxy</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Payout</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOffers.length > 0 ? (
              filteredOffers.map((item, index) => (
                <TableRow key={index} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Tooltip title="Edit Offer">
                        <Button
                          onClick={() => handleOpenEditModal(item)}
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: theme.palette.grey[300],
                            color: theme.palette.text.primary,
                            "&:hover": { bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText },
                            p: 0.5,
                          }}
                        >
                          <FaEdit />
                        </Button>
                      </Tooltip>
                      <Tooltip title="View Offer Details">
                        <Button
                          onClick={() => handleOpenDetailsModal(item)}
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: theme.palette.grey[300],
                            color: theme.palette.text.primary,
                            "&:hover": { bgcolor: theme.palette.info.main, color: theme.palette.info.contrastText },
                            p: 0.5,
                          }}
                        >
                          <FaEye />
                        </Button>
                      </Tooltip>
                      <Tooltip title={item.StatusID === "A" ? "Pause Offer" : "Activate Offer"}>
                        <Button
                          onClick={() => handleTogglePlayPause(item)}
                          variant="contained"
                          size="small"
                          disabled={changingStatusId === item.OfferId}
                          sx={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: "50%",
                            bgcolor: theme.palette.grey[300],
                            color: theme.palette.text.primary,
                            "&:hover": {
                              bgcolor: item.StatusID === "A" ? theme.palette.warning.main : theme.palette.success.main,
                              color: item.StatusID === "A" ? theme.palette.warning.contrastText : theme.palette.success.contrastText,
                            },
                            p: 0.5,
                          }}
                        >
                          {changingStatusId === item.OfferId ? (
                            <CircularProgress size={16} />
                          ) : item.StatusID === "A" ? (
                            <FaPause />
                          ) : (
                            <FaPlay />
                          )}
                        </Button>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Advertiser}>
                    {item.Advertiser}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Offer}>
                    {item.Offer}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Campaign}>
                    {item.Campaign}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Supplier}>
                    {item.Supplier}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Proxy}>
                    {item.Proxy}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title={item.Cost}>
                    {item.Cost}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis" }} title="N/A">
                    N/A
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: "center", py: 2, color: theme.palette.text.secondary }}>
                  {offers.length === 0 ? (
                    "No offers found"
                  ) : hasPausedOffers ? (
                    <Box sx={{ bgcolor: "warning.main", color: "warning.contrastText", p: 2, borderRadius: 1 }}>
                      There are paused offers available. Change the status filter to Paused or All to view them.
                    </Box>
                  ) : (
                    "No offers found"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Modal de Edición */}
      {isEditModalOpen && (
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: "background.paper", p: { xs: 3, sm: 4 }, borderRadius: 2, maxWidth: "md", maxHeight: "90vh", overflowY: "auto", boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: theme.palette.text.primary }}>
              Edit Offer
            </h2>
            {isLoadingEditModal ? (
              <Box sx={{ textAlign: "center", color: theme.palette.text.secondary }}>
                <CircularProgress size={32} />
                <Box component="span" sx={{ ml: 2 }}>
                  Loading...
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
                    Offer
                  </label>
                  <Input
                    fullWidth
                    name="offer"
                    value={formData.offer}
                    onChange={handleInputChange}
                    sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                  />
                </Box>
                <Box>
                  <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
                    PostBack URL
                  </label>
                  <TextareaAutosize
                    minRows={3}
                    name="PostBackURL"
                    value={formData.PostBackURL}
                    onChange={handleInputChange}
                    style={{ width: "100%", borderColor: theme.palette.divider, backgroundColor: theme.palette.background.paper, color: theme.palette.text.primary, padding: "8px", borderRadius: "4px" }}
                  />
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box>
                    <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
                      Cost
                    </label>
                    <Input
                      type="number"
                      fullWidth
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                      startAdornment={<Box sx={{ color: theme.palette.text.secondary, mr: 1 }}>$</Box>}
                    />
                  </Box>
                  <Box>
                    <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
                      Proxy
                    </label>
                    <Input
                      type="number"
                      fullWidth
                      name="proxy"
                      value={formData.proxy}
                      onChange={handleInputChange}
                      sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                      startAdornment={<Box sx={{ color: theme.palette.text.secondary, mr: 1 }}>%</Box>}
                    />
                  </Box>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <Box>
                    <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
                      Cap Clicks
                    </label>
                    <Input
                      type="number"
                      fullWidth
                      name="DailyCapClick"
                      value={formData.DailyCapClick}
                      onChange={handleInputChange}
                      sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                    />
                  </Box>
                  <Box>
                    <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 4 }}>
                      Cap (Install)
                    </label>
                    <Input
                      type="number"
                      fullWidth
                      name="DailyCap"
                      value={formData.DailyCap}
                      onChange={handleInputChange}
                      sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                    />
                  </Box>
                </Box>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              <Button
                onClick={handleCloseEditModal}
                variant="outlined"
                color="inherit"
                size="medium"
                sx={{ minWidth: 100, height: 40 }}
              >
                Close
              </Button>
              {!isLoadingEditModal && (
                <Button
                  onClick={handleAccept}
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={{ minWidth: 100, height: 40 }}
                >
                  Accept
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Modal de Detalles */}
      {isDetailsModalOpen && (
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: "background.paper", p: { xs: 3, sm: 4 }, borderRadius: 2, maxWidth: "md", maxHeight: "90vh", overflowY: "auto", boxShadow: 3, color: theme.palette.text.primary }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
              <h2 className="text-lg sm:text-xl font-semibold" style={{ color: theme.palette.text.primary }}>
                Offer Details
              </h2>
              <Button
                onClick={handleCopyToClipboard}
                variant="contained"
                size="small"
                sx={{
                  height: 36,
                  bgcolor: theme.palette.grey[300],
                  color: theme.palette.text.primary,
                  "&:hover": { bgcolor: theme.palette.grey[400] },
                }}
              >
                <FaCopy style={{ marginRight: 8 }} />
                {copySuccess ? "Copied!" : "Copy"}
              </Button>
            </Box>
            {isLoadingDetailsModal ? (
              <Box sx={{ textAlign: "center", color: theme.palette.text.secondary }}>
                <CircularProgress size={32} />
                <Box component="span" sx={{ ml: 2 }}>
                  Loading...
                </Box>
              </Box>
            ) : (
              selectedOfferForDetails && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <Box sx={{ bgcolor: theme.palette.background.paper, p: 3, borderRadius: 1 }}>
                    <h3 style={{ color: theme.palette.text.secondary, marginBottom: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                      URL Click Supplier Tracking
                    </h3>
                    <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem", wordBreak: "break-all" }}>
                      {selectedOfferForDetails.UrlClickSupplierTracking || "N/A"}
                    </Box>
                  </Box>

                  <Box sx={{ bgcolor: theme.palette.background.paper, p: 3, borderRadius: 1 }}>
                    <h3 style={{ color: theme.palette.text.secondary, marginBottom: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                      Offer Details
                    </h3>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {[
                        { label: "Account Manager", value: selectedOfferForDetails.AccountManager },
                        { label: "Offer ID", value: selectedOfferForDetails.OfferId },
                        { label: "Offer", value: selectedOfferForDetails.Offer },
                        { label: "Campaign", value: selectedOfferForDetails.Campaign },
                        { label: "Campaign ID", value: selectedOfferForDetails.CampaignID },
                        { label: "Offer Type", value: selectedOfferForDetails.OfferType },
                        { label: "Supplier", value: selectedOfferForDetails.Supplier },
                        { label: "Proxy", value: selectedOfferForDetails.Proxy },
                        { label: "Cost", value: selectedOfferForDetails.Cost },
                        { label: "PostBack URL", value: selectedOfferForDetails.PostBackURL },
                        { label: "Cap Click", value: selectedOfferForDetails.CapClick },
                        { label: "Cap Installs/Events", value: selectedOfferForDetails.CapInstallsEvents },
                        { label: "Category", value: selectedOfferForDetails.Category },
                        { label: "Countries", value: selectedOfferForDetails.Countries },
                        { label: "Device", value: selectedOfferForDetails.Device },
                        { label: "Status", value: selectedOfferForDetails.status },
                      ].map((item, index) => (
                        <Box key={index} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                          <Box sx={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>{item.label}:</Box>
                          <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem", textAlign: "right" }}>
                            {item.value || "N/A"}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {selectedOfferForDetails.PreviewLink && selectedOfferForDetails.PreviewLink !== "N/A" && (
                    <Box sx={{ bgcolor: theme.palette.background.paper, p: 3, borderRadius: 1 }}>
                      <h3 style={{ color: theme.palette.text.secondary, marginBottom: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                        Preview Link
                      </h3>
                      <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem", wordBreak: "break-all" }}>
                        {selectedOfferForDetails.PreviewLink}
                      </Box>
                    </Box>
                  )}

                  {selectedOfferForDetails.Banners && selectedOfferForDetails.Banners !== "N/A" && (
                    <Box sx={{ bgcolor: theme.palette.background.paper, p: 3, borderRadius: 1 }}>
                      <h3 style={{ color: theme.palette.text.secondary, marginBottom: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                        Banners
                      </h3>
                      <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem" }}>
                        {selectedOfferForDetails.Banners}
                      </Box>
                    </Box>
                  )}

                  {selectedOfferForDetails.UrlTestClick && selectedOfferForDetails.UrlTestClick !== "N/A" && (
                    <Box sx={{ bgcolor: theme.palette.background.paper, p: 3, borderRadius: 1 }}>
                      <h3 style={{ color: theme.palette.text.secondary, marginBottom: 2, fontSize: "0.875rem", fontWeight: 500 }}>
                        URL Test Click
                      </h3>
                      <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem", wordBreak: "break-all" }}>
                        {selectedOfferForDetails.UrlTestClick}
                      </Box>
                    </Box>
                  )}
                </Box>
              )
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
              <Button
                onClick={handleCloseDetailsModal}
                variant="outlined"
                color="inherit"
                size="medium"
                sx={{ minWidth: 100, height: 40 }}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Modal de Agregar desde Supplier */}
      {isAddSupplierModalOpen && (
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: "background.paper", p: { xs: 3, sm: 4 }, borderRadius: 2, maxWidth: "md", maxHeight: "90vh", overflowY: "auto", boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: theme.palette.text.primary }}>
              Add Offer from Supplier
            </h2>
            {isLoadingAddSupplierModal ? (
              <Box sx={{ textAlign: "center", color: theme.palette.text.secondary }}>
                <CircularProgress size={32} />
                <Box component="span" sx={{ ml: 2 }}>
                  Loading...
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                    Supplier
                  </label>
                  <Select
                    fullWidth
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    sx={{
                      height: 48,
                      bgcolor: "background.paper",
                      "& .MuiSelect-select": { color: theme.palette.text.primary },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select...
                    </MenuItem>
                    {suppliers.map((sup) => (
                      <MenuItem key={sup.SupplierID} value={sup.SupplierID}>
                        {sup.Supplier}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box sx={{ position: "relative" }}>
                  <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                    Campaigns
                  </label>
                  <Input
                    fullWidth
                    placeholder="Search campaigns..."
                    value={campaignSearchQuery}
                    onChange={handleCampaignSearchChange}
                    sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                  />
                  {isCampaignDropdownOpen && filteredCampaigns.length > 0 && (
                    <Box
                      ref={campaignDropdownRef}
                      sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        bgcolor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        maxHeight: 300,
                        overflowY: "auto",
                        zIndex: 10,
                        mt: 1,
                      }}
                    >
                      {filteredCampaigns.map((campaign) => (
                        <Box
                          key={campaign.Campaign}
                          sx={{
                            p: 1,
                            color: theme.palette.text.primary,
                            cursor: "pointer",
                            "&:hover": { bgcolor: theme.palette.action.hover },
                          }}
                          onClick={() => handleSelectCampaign(campaign.Campaign)}
                        >
                          {campaign.Campaign}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                {selectedSupplierCampaigns.length > 0 && (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2 }}>
                    {selectedSupplierCampaigns.map((campaign) => (
                      <Box
                        key={campaign}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: theme.palette.grey[300],
                          color: theme.palette.text.primary,
                          p: 1,
                          borderRadius: 1,
                          fontSize: "0.75rem",
                        }}
                      >
                        {campaign}
                        <FaTimes
                          onClick={() => removeSupplierCampaign(campaign)}
                        />
                      </Box>
                    ))}
                  </Box>
                )}

                {offerForms.map((form, index) => (
                  <Box key={index} sx={{ borderTop: `2px solid ${theme.palette.error.main}`, pt: 3, mt: 3 }}>
                    <h3 style={{ color: theme.palette.text.primary, fontSize: "1rem", fontWeight: 600, marginBottom: 2 }}>
                      {form.offerName}
                    </h3>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <Box>
                        <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                          Advertiser URL
                        </label>
                        <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem", wordBreak: "break-all" }}>
                          {form.advertiserUrl}
                        </Box>
                      </Box>
                      <Box>
                        <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                          URL Postback
                        </label>
                        <Box sx={{ color: theme.palette.text.primary, fontSize: "0.875rem", wordBreak: "break-all" }}>
                          {form.urlPostback}
                        </Box>
                      </Box>
                      <Box>
                        <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                          Offer
                        </label>
                        <Input
                          fullWidth
                          value={form.offerName}
                          onChange={(e) => handleOfferFormChange(index, "offerName", e.target.value)}
                          sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                        />
                      </Box>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        <Box>
                          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                            Cost
                          </label>
                          <Input
                            type="number"
                            fullWidth
                            value={form.cost}
                            onChange={(e) => handleOfferFormChange(index, "cost", e.target.value)}
                            sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                            startAdornment={<Box sx={{ color: theme.palette.text.secondary, mr: 1 }}>$</Box>}
                          />
                        </Box>
                        <Box>
                          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                            Payout
                          </label>
                          <Box sx={{ color: theme.palette.success.main, fontSize: "1.125rem", fontWeight: 600 }}>
                            $ {form.payout}
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        <Box>
                          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                            Cap Clicks
                          </label>
                          <Input
                            type="number"
                            fullWidth
                            value={form.capClicks}
                            onChange={(e) => handleOfferFormChange(index, "capClicks", e.target.value)}
                            sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                          />
                        </Box>
                        <Box>
                          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                            Cap Install/Event
                          </label>
                          <Input
                            type="number"
                            fullWidth
                            value={form.capInstallEvent}
                            onChange={(e) => handleOfferFormChange(index, "capInstallEvent", e.target.value)}
                            sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                          />
                        </Box>
                      </Box>
                      <Box>
                        <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                          Proxy
                        </label>
                        <Input
                          type="number"
                          fullWidth
                          value={form.proxy}
                          onChange={(e) => handleOfferFormChange(index, "proxy", e.target.value)}
                          sx={{ height: 48, bgcolor: theme.palette.background.paper }}
                          startAdornment={<Box sx={{ color: theme.palette.text.secondary, mr: 1 }}>%</Box>}
                        />
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              <Button
                onClick={handleCloseAddSupplierModal}
                variant="outlined"
                color="inherit"
                size="medium"
                sx={{ minWidth: 100, height: 40 }}
              >
                Close
              </Button>
              {!isLoadingAddSupplierModal && (
                <Button
                  onClick={handleCreateOffers}
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={{ minWidth: 100, height: 40 }}
                >
                  Accept
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Modal de Confirmación */}
      {isConfirmationModalOpen && (
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: "background.paper", p: { xs: 3, sm: 4 }, borderRadius: 2, maxWidth: "md", boxShadow: 3, color: theme.palette.text.primary, textAlign: "center" }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              {confirmationStatus === "success" ? (
                <FaCheck style={{ color: theme.palette.success.main, fontSize: 48, marginBottom: 2 }} />
              ) : confirmationStatus === "error" ? (
                <FaTimesCircle style={{ color: theme.palette.error.main, fontSize: 48, marginBottom: 2 }} />
              ) : (
                <FaExclamationTriangle style={{ color: theme.palette.warning.main, fontSize: 48, marginBottom: 2 }} />
              )}
              <Box sx={{ color: theme.palette.text.primary, fontSize: "1rem" }}>{confirmationMessage}</Box>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              <Button
                onClick={handleCloseConfirmationModal}
                variant="outlined"
                color="inherit"
                size="medium"
                sx={{ minWidth: 100, height: 40 }}
              >
                Close
              </Button>
              <Button
                onClick={handleNewOffers}
                variant="contained"
                color="success"
                size="medium"
                sx={{ minWidth: 100, height: 40 }}
              >
                New Offers
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Modal de Agregar desde Advertiser */}
      {isAddAdvertiserModalOpen && (
        <Box sx={{ position: "fixed", inset: 0, bgcolor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, p: 2 }}>
          <Box sx={{ bgcolor: "background.paper", p: { xs: 3, sm: 4 }, borderRadius: 2, maxWidth: "md", maxHeight: "90vh", overflowY: "auto", boxShadow: 3, color: theme.palette.text.primary }}>
            <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: theme.palette.text.primary }}>
              Add Offer from Advertiser
            </h2>
            {isLoadingAddAdvertiserModal ? (
              <Box sx={{ textAlign: "center", color: theme.palette.text.secondary }}>
                <CircularProgress size={32} />
                <Box component="span" sx={{ ml: 2 }}>
                  Loading...
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Box>
                  <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                    Advertiser
                  </label>
                  <Select
                    fullWidth
                    value={selectedAdvertiser}
                    onChange={(e) => setSelectedAdvertiser(e.target.value)}
                    sx={{
                      height: 48,
                      bgcolor: "background.paper",
                      "& .MuiSelect-select": { color: theme.palette.text.primary },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select...
                    </MenuItem>
                    {advertisers.map((adv) => (
                      <MenuItem key={adv.AdvertiserID} value={adv.AdvertiserID}>
                        {adv.Advertiser}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                    Campaigns
                  </label>
                  <Select<string[]>
                    fullWidth
                    multiple
                    value={selectedAdvertiserCampaigns}
                    onChange={handleCampaignSelection}
                    sx={{
                      height: 48,
                      bgcolor: "background.paper",
                      "& .MuiSelect-select": { color: theme.palette.text.primary },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => {
                          const campaign = advertiserCampaigns.find((c) => c.CampaignID === value);
                          return (
                            <Box
                              key={value}
                              sx={{
                                bgcolor: theme.palette.grey[300],
                                color: theme.palette.text.primary,
                                p: 1,
                                borderRadius: 1,
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {campaign ? campaign.CampaignName : value}
                              <FaTimes
                                style={{ marginLeft: 4, cursor: "pointer" }}
                                onClick={() => removeCampaign(value)}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  >
                    {advertiserCampaigns.map((campaign) => (
                      <MenuItem key={campaign.CampaignID} value={campaign.CampaignID}>
                        {campaign.CampaignName}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
                <Box>
                  <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: 1 }}>
                    Supplier
                  </label>
                  <Select
                    fullWidth
                    value={selectedAdvertiserSupplier}
                    onChange={(e) => setSelectedAdvertiserSupplier(e.target.value)}
                    sx={{
                      height: 48,
                      bgcolor: "background.paper",
                      "& .MuiSelect-select": { color: theme.palette.text.primary },
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.divider },
                      "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main },
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select...
                    </MenuItem>
                    {suppliers.map((sup) => (
                      <MenuItem key={sup.SupplierID} value={sup.SupplierID}>
                        {sup.Supplier}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
              <Button
                onClick={handleCloseAddAdvertiserModal}
                variant="outlined"
                color="inherit"
                size="medium"
                sx={{ minWidth: 100, height: 40 }}
              >
                Close
              </Button>
              {!isLoadingAddAdvertiserModal && (
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  sx={{ minWidth: 100, height: 40 }}
                  disabled={selectedAdvertiserCampaigns.length === 0 || !selectedAdvertiserSupplier}
                >
                  Accept
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ShowOffers;