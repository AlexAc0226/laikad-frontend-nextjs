"use client";
import React, { useState, useEffect } from "react";
import { FaTrash, FaSync, FaFileExcel, FaTimes, FaSortUp, FaSortDown } from "react-icons/fa";
import * as XLSX from "xlsx";
import { getSuppliers, getAdvertisers } from "@/app/api/filtersService/filtersService";
import { getOffers } from "@/app/api/offer/service";
import { getCampaignsByAdvertiserID } from "@/app/api/campaign/service";
import { Box, Button, Select, MenuItem, Input, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, useTheme, Checkbox, Typography } from "@mui/material";
import { getReportsCampaignTotal } from "../../../app/api/report/service";
import SearchableSelect from "@/components/SelectOption/SearchableSelect";

interface ReportItem {
  creationDate: string;
  offer: string;
  advertiser: string;
  campaign: string;
  supplier: string;
  accountManagerPub: string;
  accountManagerAdv: string;
  device: string;
  category: string;
  subPub: string;
  campaignTypeID: string;
  countrys: string;
  rate: string;
  cr: string;
  totalClicks: string;
  totalInstall: string;
  totalRevenue: string;
  totalCost: string;
  totalProfit: string;
  totalProxy: string;
  totalEvents: string;
  adjustmentEvents: string;
  resultEvents: string;
  adjEventsCount: string;
  adjInstallsCount: string;
  adjTotalCost: string;
  adjTotalProfit: string;
  adjTotalRevenue: string;
  bl: string;
}

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

// Obtener la fecha actual en formato YYYY-MM-DD para input type="date"
const getCurrentDateForInput = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ShowReport: React.FC = () => {
  const theme = useTheme();
  // Estados para los filtros
  const [advertiser, setAdvertiser] = useState("");
  const [supplier, setSupplier] = useState("");
  const [accountManager, setAccountManager] = useState("");
  const [fromDate, setFromDate] = useState(getCurrentDateForInput());
  const [toDate, setToDate] = useState(getCurrentDateForInput());
  const [campaign, setCampaign] = useState("");
  const [offer, setOffer] = useState("");
  const [isCampaignDisabled, setIsCampaignDisabled] = useState(true);
  const [isOfferDisabled, setIsOfferDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para los datos de los selects
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [campaignsList, setCampaignsList] = useState<Campaign[]>([]);
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [isLoadingAdvertisers, setIsLoadingAdvertisers] = useState(false);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(false);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [errorAdvertisers, setErrorAdvertisers] = useState<string | null>(null);
  const [errorSuppliers, setErrorSuppliers] = useState<string | null>(null);
  const [errorCampaigns, setErrorCampaigns] = useState<string | null>(null);
  const [errorOffers, setErrorOffers] = useState<string | null>(null);

  // Estados para los grupos (controlan visibilidad de columnas)
  const [groups, setGroups] = useState({
    date: false,
    advertisers: false,
    campaigns: false,
    adjustment: false,
    suppliers: false,
    offers: false,
    subPub: false,
  });

  // Estados para la tabla y paginación
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Estados para ordenamiento
  const [sortConfig, setSortConfig] = useState<{ key: keyof ReportItem | null; direction: 'asc' | 'desc' | null }>({
    key: null,
    direction: null,
  });

  // Estados para filtros de búsqueda por columna
  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof ReportItem, string>>>({});

  // Opciones ficticias para los selects que no tienen API aún
  const accountManagers = [
    { id: "1", name: "Manager 1" },
    { id: "2", name: "Manager 2" },
  ];

  // Cargar datos iniciales de los selects al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingAdvertisers(true);
      try {
        const advertisersData = await getAdvertisers();
        if (advertisersData && Array.isArray(advertisersData.result)) {
          setAdvertisers(advertisersData.result);
        } else {
          console.warn("No advertisers found");
          setAdvertisers([]);
          setErrorAdvertisers("No advertisers found");
        }
      } catch (error) {
        console.error("Error fetching advertisers:", error);
        setAdvertisers([]);
        setErrorAdvertisers("Failed to load advertisers");
      } finally {
        setIsLoadingAdvertisers(false);
      }

      setIsLoadingSuppliers(true);
      try {
        const suppliersData = await getSuppliers();
        if (suppliersData && Array.isArray(suppliersData.result)) {
          setSuppliers(suppliersData.result);
        } else {
          console.warn("No suppliers found");
          setSuppliers([]);
          setErrorSuppliers("No suppliers found");
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        setSuppliers([]);
        setErrorSuppliers("Failed to load suppliers");
      } finally {
        setIsLoadingSuppliers(false);
      }
    };

    fetchData();
  }, []);

  // Cargar campañas dinámicamente cuando se selecciona un Advertiser
  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!advertiser) {
        setCampaignsList([]);
        setCampaign("");
        setIsCampaignDisabled(true);
        return;
      }

      setIsLoadingCampaigns(true);
      try {
        const campaignsData = await getCampaignsByAdvertiserID(Number(advertiser));
        if (campaignsData && Array.isArray(campaignsData.result)) {
          const filteredCampaigns = campaignsData.result.filter(
            (camp: Campaign) => camp.StatusID === "A" || !camp.StatusID
          );
          setCampaignsList(filteredCampaigns);
          setIsCampaignDisabled(false);
        } else {
          console.warn("No campaigns found for this advertiser");
          setCampaignsList([]);
          setIsCampaignDisabled(true);
          setErrorCampaigns("No campaigns found");
        }
        setCampaign("");
      } catch (error) {
        console.error("Error fetching campaigns:", error);
        setCampaignsList([]);
        setCampaign("");
        setIsCampaignDisabled(true);
        setErrorCampaigns("Failed to load campaigns");
      } finally {
        setIsLoadingCampaigns(false);
      }
    };

    fetchCampaigns();
  }, [advertiser]);

  // Cargar ofertas dinámicamente cuando se selecciona un Supplier
  useEffect(() => {
    const fetchOffers = async () => {
      if (!supplier) {
        setOffersList([]);
        setOffer("");
        setIsOfferDisabled(true);
        return;
      }

      setIsLoadingOffers(true);
      try {
        const params = {
          OfferID: "",
          CampaignID: "",
          SupplierID: supplier,
          StatusID: "A",
          AdvertiserID: "",
        };
        const offersData = await getOffers(params);
        if (offersData && Array.isArray(offersData.result)) {
          setOffersList(offersData.result);
          setIsOfferDisabled(false);
        } else {
          console.warn("No offers found for this supplier");
          setOffersList([]);
          setIsOfferDisabled(true);
          setErrorOffers("No offers found");
        }
        setOffer("");
      } catch (error) {
        console.error("Error fetching offers:", error);
        setOffersList([]);
        setOffer("");
        setIsOfferDisabled(true);
        setErrorOffers("Failed to load offers");
      } finally {
        setIsLoadingOffers(false);
      }
    };

    fetchOffers();
  }, [supplier]);

  // Habilitar/deshabilitar selects de Campaigns y Offers
  useEffect(() => {
    setIsCampaignDisabled(!advertiser);
    setIsOfferDisabled(!supplier);
    if (!advertiser) setCampaign("");
    if (!supplier) setOffer("");
  }, [advertiser, supplier]);

  // Función para manejar la búsqueda y obtener los datos del reporte
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      let AdvertiserID = advertiser || '';
      let SupplierID = supplier || '';
      let AccountManagerID = accountManager || '';
      let OfferID = offer || '';
      let CampaignID = campaign || '';
      let AccountManagerID2 = accountManager || '';

      const DateFrom = fromDate.replace(/-/g, '');
      const DateTo = toDate.replace(/-/g, '');

      const isDate = groups.date ? '1' : '0';
      const isAdvertiser = groups.advertisers ? '1' : '0';
      const isCampaign = groups.campaigns ? '1' : '0';
      const isSupplier = groups.suppliers ? '1' : '0';
      const isOffer = groups.offers ? '1' : '0';
      const isSubPub = groups.subPub ? '1' : '0';
      const isAdjustment = groups.adjustment ? '1' : '0';

      const clicks = '0';
      const installs = '0';
      const events = '0';
      const opeClicks = 'Greater';
      const opeInstalls = 'Greater';
      const opeEvents = 'Greater';
      const isP2 = '0';

      const response = await getReportsCampaignTotal(
        DateFrom,
        DateTo,
        AdvertiserID ? Number(AdvertiserID) : undefined,
        SupplierID ? Number(SupplierID) : undefined,
        CampaignID ? Number(CampaignID) : undefined,
        OfferID ? Number(OfferID) : undefined,
        undefined,
        AccountManagerID2 ? Number(AccountManagerID2) : undefined,
        isDate,
        isAdvertiser,
        isCampaign,
        isSupplier,
        isOffer,
        isSubPub,
        isAdjustment,
        clicks,
        installs,
        events,
        opeClicks,
        opeInstalls,
        opeEvents,
        isP2
      );


      const result = response?.body?.result || [];

      const data = result.map((row: any) => ({
        creationDate: String(row.CreationDate || ''),
        offer: String(row.Offer || ''),
        advertiser: String(row.Advertiser || ''),
        campaign: String(row.Campaign || ''),
        supplier: String(row.Supplier || ''),
        accountManagerPub: String(row.AccountManager || ''),
        accountManagerAdv: String(row.AccountManagerAdv || ''),
        accountManagerID: String(row.AccountManagerID || ''),
        accountManagerIDAdv: String(row.AccountManagerIDAdv || ''),
        device: String(row.Device || ''),
        category: String(row.Category || ''),
        subPub: String(row.SubPubID || ''),
        campaignTypeID: String(row.CampaignTypeID || ''),
        countrys: String(row.Countrys || ''),
        rate: String(row.RateCampaign || ''),
        cr: String(row.CR || 'N/A'),
        totalClicks: String(row.totalClick || '0'),
        totalInstall: String(row.totalInstall || '0'),
        totalRevenue: String(row.totalRevenue || '0'),
        totalCost: String(row.totalCost || '0'),
        totalProfit: String(row.totalProfit || '0'),
        totalProxy: String(row.totalProxy || '0'),
        totalEvents: String(row.totalEvent || '0'),
        adjustmentEvents: String(row.Adjustment_events || '0'),
        resultEvents: String(row.resultEvent || '0'),
        adjEventsCount: String(row.Adj_values?.AdjEventsCount || '0'),
        adjInstallsCount: String(row.Adj_values?.AdjInstallsCount || '0'),
        adjTotalCost: String(row.Adj_values?.AdjResultTotalCost || '0'),
        adjTotalProfit: String(row.Adj_values?.AdjResultTotalProfit || '0'),
        adjTotalRevenue: String(row.Adj_values?.AdjResultTotalRevenue || '0'),
        bl: String(row.totalSource || '0'),
      }));

      if (localStorage.getItem('RoleID') !== '9' && localStorage.getItem('RoleID') !== '3') {
        const userId = parseInt(localStorage.getItem('UserID') || '', 10);
        const newData = data.filter((item: any) =>
          parseInt(item.accountManagerID) === userId || parseInt(item.accountManagerIDAdv) === userId
        );
        setReportData(newData);
      } else {  
        setReportData(data);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      alert("Could not load report data. Please try again. Error: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Función para exportar a Excel
  const handleExportExcel = () => {
    try {
      const data = filteredData.map((item) => {
        const row: { [key: string]: string } = {};
        if (groups.date) row.Date = item.creationDate;
        if (groups.offers) row.Offer = item.offer;
        if (groups.advertisers) row.Advertiser = item.advertiser;
        if (groups.campaigns) row.Campaign = item.campaign;
        if (groups.suppliers) row.Supplier = item.supplier;
        if (groups.suppliers) row.AccountManagerPub = item.accountManagerPub;
        if (groups.advertisers) row.AccountManagerAdv = item.accountManagerAdv;
        row.Device = item.device;
        if (!groups.subPub) row.Category = item.category;
        if (groups.subPub) row.SubPub = item.subPub;
        row.Type = item.campaignTypeID;
        row.Countrys = item.countrys;
        row.Rate = item.rate;
        row.CR = item.cr;
        row["Total Clicks"] = item.totalClicks;
        row["Total Install"] = item.totalInstall;
        row["Total Revenue"] = item.totalRevenue;
        row["Total Cost"] = item.totalCost;
        row["Total Profit"] = item.totalProfit;
        row["Total Proxy"] = item.totalProxy;
        row["Total Events"] = item.totalEvents;
        if (groups.adjustment) row["Adjustment Events"] = item.adjustmentEvents;
        row["Result Events"] = item.resultEvents;
        if (groups.adjustment) row["Adj Events Count"] = item.adjEventsCount;
        if (groups.adjustment) row["Adj Installs Count"] = item.adjInstallsCount;
        if (groups.adjustment) row["Adj Total Cost"] = item.adjTotalCost;
        if (groups.adjustment) row["Adj Total Profit"] = item.adjTotalProfit;
        if (groups.adjustment) row["Adj Total Revenue"] = item.adjTotalRevenue;
        if (groups.subPub) row.BL = item.bl;
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const colWidths = Object.keys(data[0]).map(() => ({ wch: 15 }));
      ws["!cols"] = colWidths;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `report_data_${timestamp}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      alert("Error al generar el archivo Excel. Por favor, intenta de nuevo.");
    }
  };

  // Funciones para manejar los filtros
  const handleClear = (field: string) => {
    switch (field) {
      case "advertiser":
        setAdvertiser("");
        break;
      case "supplier":
        setSupplier("");
        break;
      case "accountManager":
        setAccountManager("");
        break;
      case "campaign":
        setCampaign("");
        break;
      case "offer":
        setOffer("");
        break;
      default:
        break;
    }
  };

  const handleClearAll = () => {
    setAdvertiser("");
    setSupplier("");
    setAccountManager("");
    setCampaign("");
    setOffer("");
    setReportData([]);
    setColumnFilters({});
    setSortConfig({ key: null, direction: null });
    setFromDate(getCurrentDateForInput());
    setToDate(getCurrentDateForInput());
    setGroups({
      date: false,
      advertisers: false,
      campaigns: false,
      adjustment: false,
      suppliers: false,
      offers: false,
      subPub: false,
    });
  };

  // Manejar los checkboxes de grupos
  const handleGroupChange = (group: keyof typeof groups) => {
    setGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  // Manejar el ordenamiento
  const handleSort = (key: keyof ReportItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key, direction });

    const sortedData = [...reportData].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      // Manejar números
      if (['totalClicks', 'totalInstall', 'totalRevenue', 'totalCost', 'totalProfit', 'totalProxy', 'totalEvents', 'adjustmentEvents', 'resultEvents', 'adjEventsCount', 'adjInstallsCount', 'adjTotalCost', 'adjTotalProfit', 'adjTotalRevenue'].includes(key)) {
        const aNum = parseFloat(aValue) || 0;
        const bNum = parseFloat(bValue) || 0;
        return direction === 'asc' ? aNum - bNum : bNum - aNum;
      }

      // Manejar cadenas
      return direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

    setReportData(sortedData);
  };

  // Manejar los filtros de búsqueda por columna
  const handleColumnFilterChange = (key: keyof ReportItem, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Filtrar los datos según los filtros de búsqueda
  const filteredData = reportData.filter((item) =>
    Object.entries(columnFilters).every(([key, value]) =>
      value
        ? String(item[key as keyof ReportItem])
            .toLowerCase()
            .includes(value.toLowerCase())
        : true
    )
  );

  // Condición para mostrar los botones Clear y Excel
  const showClearButton =
    reportData.length > 0 ||
    advertiser ||
    supplier ||
    accountManager ||
    campaign ||
    offer;

  const showExcelButton = reportData.length > 0;

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2, boxShadow: 1, color: theme.palette.text.primary }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: theme.palette.text.primary }}>Reports</h1>
      </Box>

      {/* Primera fila: Advertiser, Campaign, Supplier, Offers, Account Managers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr 1fr' }, gap: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1, color: theme.palette.text.primary }}>
        <Box sx={{ position: 'relative' }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, marginBottom: '8px', fontWeight: 'medium' }}>
            Advertisers
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoadingAdvertisers ? (
              <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1, color: theme.palette.text.secondary }}>
                Loading...
              </Box>
            ) : errorAdvertisers ? (
              <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1, color: 'error.main' }}>
                {errorAdvertisers}
              </Box>
            ) : (
              <>
                <SearchableSelect
                  options={advertisers.map((adv) => ({
                    value: adv.AdvertiserID,
                    label: adv.Advertiser
                  }))}
                  value={advertiser}
                  onChange={(value) => setAdvertiser(value.toString())}
                  placeholder="Search advertisers..."
                  fullWidth
                  clearable
                  onClear={() => setAdvertiser("")}
                />
                {advertiser && (
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
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
            Campaign
          </label>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoadingCampaigns ? (
              <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1, color: theme.palette.text.secondary }}>
                Loading...
              </Box>
            ) : errorCampaigns ? (
              <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1, color: 'error.main' }}>
                {errorCampaigns}
              </Box>
            ) : (
              <>
                <SearchableSelect
                  options={campaignsList.map((camp) => ({
                    value: camp.CampaignID,
                    label: camp.Campaign
                  }))}
                  value={campaign}
                  onChange={(value) => setCampaign(value.toString())}
                  placeholder="Search campaigns..."
                  fullWidth
                  disabled={isCampaignDisabled}
                  clearable
                  onClear={() => setCampaign("")}
                />
                {campaign && !isCampaignDisabled && (
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
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
            Suppliers
          </label>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoadingSuppliers ? (
              <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1, color: theme.palette.text.secondary }}>
                Loading...
              </Box>
            ) : errorSuppliers ? (
              <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1, color: 'error.main' }}>
                {errorSuppliers}
              </Box>
            ) : (
              <>
                <SearchableSelect
                  options={suppliers.map((sup) => ({
                    value: sup.SupplierID,
                    label: sup.Supplier
                  }))}
                  value={supplier}
                  onChange={(value) => setSupplier(value.toString())}
                  placeholder="Search suppliers..."
                  fullWidth
                  clearable
                  onClear={() => setSupplier("")}
                />
                {supplier && (
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
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
            Offer
          </label>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isLoadingOffers ? (
              <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1, color: theme.palette.text.secondary }}>
                Loading...
              </Box>
            ) : errorOffers ? (
              <Box sx={{ width: '100%', p: 2, bgcolor: 'background.paper', borderRadius: 1, color: 'error.main' }}>
                {errorOffers}
              </Box>
            ) : (
              <>
                <SearchableSelect
                  options={offersList.map((off) => ({
                    value: off.OfferID,
                    label: off.Offer
                  }))}
                  value={offer}
                  onChange={(value) => setOffer(value.toString())}
                  placeholder="Search offers..."
                  fullWidth
                  disabled={isOfferDisabled}
                  clearable
                  onClear={() => setOffer("")}
                />
                {offer && !isOfferDisabled && (
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
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
            Account Managers
          </label>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchableSelect
              options={accountManagers.map((mgr) => ({
                value: mgr.id,
                label: mgr.name
              }))}
              value={accountManager}
              onChange={(value) => setAccountManager(value.toString())}
              placeholder="Search account managers..."
              fullWidth
              clearable
              onClear={() => setAccountManager("")}
            />
            {accountManager && (
              <Button
                onClick={() => handleClear("accountManager")}
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

      {/* Segunda fila: Fechas (Calendarios) y Botones */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr auto' }, gap: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1, color: theme.palette.text.primary, mt: 2 }}>
        <Box>
          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
            From
          </label>
          <Input
            type="date"
            fullWidth
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            sx={{ height: 48 }}
          />
        </Box>

        <Box>
          <label className="block text-sm font-medium" style={{ color: theme.palette.text.secondary, marginBottom: '8px' }}>
            To
          </label>
          <Input
            type="date"
            fullWidth
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            sx={{ height: 48 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Button
            onClick={handleSearch}
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
            Search
          </Button>
          {showClearButton && (
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
          )}
          {showExcelButton && (
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
          )}
        </Box>
      </Box>

      {/* Tercera fila: Grupos */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        {['date', 'advertisers', 'campaigns', 'adjustment', 'suppliers', 'offers', 'subPub'].map((group) => (
          <Box key={group} sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              checked={groups[group as keyof typeof groups]}
              onChange={() => handleGroupChange(group as keyof typeof groups)}
              sx={{ color: theme.palette.text.primary, '&.Mui-checked': { color: theme.palette.primary.main } }}
            />
            <span style={{ color: theme.palette.text.primary }}>{group.charAt(0).toUpperCase() + group.slice(1)}</span>
          </Box>
        ))}
      </Box>

      {/* Tabla de Resultados */}
      <Box sx={{ mt: 3, overflowX: 'auto', pb: 2, maxHeight: '500px', overflowY: 'auto' }}>
        <Table sx={{ minWidth: 650, bgcolor: 'background.paper', borderRadius: 1, '& .MuiTableCell-root': { borderBottom: `1px solid ${theme.palette.divider}`, padding: '12px' }, color: theme.palette.text.primary }}>
          <TableHead sx={{ position: 'sticky', top: 0, bgcolor: 'background.paper', zIndex: 10 }}>
            <TableRow>
              {groups.date && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('creationDate')}>
                    Date
                    {sortConfig.key === 'creationDate' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.creationDate || ''}
                    onChange={(e) => handleColumnFilterChange('creationDate', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.advertisers && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('advertiser')}>
                    Advertiser
                    {sortConfig.key === 'advertiser' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.advertiser || ''}
                    onChange={(e) => handleColumnFilterChange('advertiser', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.campaigns && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('campaign')}>
                    Campaign
                    {sortConfig.key === 'campaign' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.campaign || ''}
                    onChange={(e) => handleColumnFilterChange('campaign', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.advertisers && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('accountManagerAdv')}>
                    Account Manager Adv
                    {sortConfig.key === 'accountManagerAdv' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.accountManagerAdv || ''}
                    onChange={(e) => handleColumnFilterChange('accountManagerAdv', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.suppliers && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('supplier')}>
                    Supplier
                    {sortConfig.key === 'supplier' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.supplier || ''}
                    onChange={(e) => handleColumnFilterChange('supplier', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.offers && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('offer')}>
                    Offer
                    {sortConfig.key === 'offer' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.offer || ''}
                    onChange={(e) => handleColumnFilterChange('offer', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.suppliers && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('accountManagerPub')}>
                    Account Manager Pub
                    {sortConfig.key === 'accountManagerPub' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.accountManagerPub || ''}
                    onChange={(e) => handleColumnFilterChange('accountManagerPub', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {!groups.subPub && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('category')}>
                    Category
                    {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.category || ''}
                    onChange={(e) => handleColumnFilterChange('category', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.subPub && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('subPub')}>
                    SubPub
                    {sortConfig.key === 'subPub' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.subPub || ''}
                    onChange={(e) => handleColumnFilterChange('subPub', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('campaignTypeID')}>
                  Type
                  {sortConfig.key === 'campaignTypeID' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.campaignTypeID || ''}
                  onChange={(e) => handleColumnFilterChange('campaignTypeID', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('rate')}>
                  Rate
                  {sortConfig.key === 'rate' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.rate || ''}
                  onChange={(e) => handleColumnFilterChange('rate', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('totalClicks')}>
                  Total Clicks
                  {sortConfig.key === 'totalClicks' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.totalClicks || ''}
                  onChange={(e) => handleColumnFilterChange('totalClicks', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('totalInstall')}>
                  Total Install
                  {sortConfig.key === 'totalInstall' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.totalInstall || ''}
                  onChange={(e) => handleColumnFilterChange('totalInstall', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('totalRevenue')}>
                  Total Revenue
                  {sortConfig.key === 'totalRevenue' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.totalRevenue || ''}
                  onChange={(e) => handleColumnFilterChange('totalRevenue', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('totalCost')}>
                  Total Cost
                  {sortConfig.key === 'totalCost' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.totalCost || ''}
                  onChange={(e) => handleColumnFilterChange('totalCost', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('totalProfit')}>
                  Total Profit
                  {sortConfig.key === 'totalProfit' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.totalProfit || ''}
                  onChange={(e) => handleColumnFilterChange('totalProfit', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('totalProxy')}>
                  Total Proxy
                  {sortConfig.key === 'totalProxy' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.totalProxy || ''}
                  onChange={(e) => handleColumnFilterChange('totalProxy', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('totalEvents')}>
                  Total Events
                  {sortConfig.key === 'totalEvents' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.totalEvents || ''}
                  onChange={(e) => handleColumnFilterChange('totalEvents', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              {groups.adjustment && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('adjustmentEvents')}>
                    Adjustment Events
                    {sortConfig.key === 'adjustmentEvents' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.adjustmentEvents || ''}
                    onChange={(e) => handleColumnFilterChange('adjustmentEvents', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('resultEvents')}>
                  Result Events
                  {sortConfig.key === 'resultEvents' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                </Box>
                <Input
                  fullWidth
                  placeholder="Search..."
                  value={columnFilters.resultEvents || ''}
                  onChange={(e) => handleColumnFilterChange('resultEvents', e.target.value)}
                  sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                />
              </TableCell>
              {groups.adjustment && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('adjEventsCount')}>
                    Adj Events Count
                    {sortConfig.key === 'adjEventsCount' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.adjEventsCount || ''}
                    onChange={(e) => handleColumnFilterChange('adjEventsCount', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.adjustment && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('adjInstallsCount')}>
                    Adj Installs Count
                    {sortConfig.key === 'adjInstallsCount' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.adjInstallsCount || ''}
                    onChange={(e) => handleColumnFilterChange('adjInstallsCount', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.adjustment && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('adjTotalCost')}>
                    Adj Total Cost
                    {sortConfig.key === 'adjTotalCost' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.adjTotalCost || ''}
                    onChange={(e) => handleColumnFilterChange('adjTotalCost', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.adjustment && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('adjTotalProfit')}>
                    Adj Total Profit
                    {sortConfig.key === 'adjTotalProfit' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.adjTotalProfit || ''}
                    onChange={(e) => handleColumnFilterChange('adjTotalProfit', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.adjustment && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('adjTotalRevenue')}>
                    Adj Total Revenue
                    {sortConfig.key === 'adjTotalRevenue' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.adjTotalRevenue || ''}
                    onChange={(e) => handleColumnFilterChange('adjTotalRevenue', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
              {groups.subPub && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleSort('bl')}>
                    BL
                    {sortConfig.key === 'bl' && (sortConfig.direction === 'asc' ? <FaSortUp /> : <FaSortDown />)}
                  </Box>
                  <Input
                    fullWidth
                    placeholder="Search..."
                    value={columnFilters.bl || ''}
                    onChange={(e) => handleColumnFilterChange('bl', e.target.value)}
                    sx={{ mt: 1, height: 32, fontSize: '0.875rem' }}
                  />
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  {groups.date && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.creationDate}>
                      {item.creationDate}
                    </TableCell>
                  )}
                  {groups.advertisers && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.advertiser}>
                      {item.advertiser}
                    </TableCell>
                  )}
                  {groups.campaigns && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.campaign}>
                      {item.campaign}
                    </TableCell>
                  )}
                  {groups.advertisers && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.accountManagerAdv}>
                      {item.accountManagerAdv}
                    </TableCell>
                  )}
                  {groups.suppliers && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.supplier}>
                      {item.supplier}
                    </TableCell>
                  )}
                  {groups.offers && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.offer}>
                      {item.offer}
                    </TableCell>
                  )}
                  {groups.suppliers && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.accountManagerPub}>
                      {item.accountManagerPub}
                    </TableCell>
                  )}
                  {!groups.subPub && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.category}>
                      {item.category}
                    </TableCell>
                  )}
                  {groups.subPub && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.subPub}>
                      {item.subPub}
                    </TableCell>
                  )}
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.campaignTypeID}>
                    {item.campaignTypeID}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.rate}>
                    {item.rate}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.totalClicks}>
                    {item.totalClicks}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.totalInstall}>
                    {item.totalInstall}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.totalRevenue}>
                    {item.totalRevenue}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.totalCost}>
                    {item.totalCost}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.totalProfit}>
                    {item.totalProfit}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.totalProxy}>
                    {item.totalProxy}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.totalEvents}>
                    {item.totalEvents}
                  </TableCell>
                  {groups.adjustment && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.adjustmentEvents}>
                      {item.adjustmentEvents}
                    </TableCell>
                  )}
                  <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.resultEvents}>
                    {item.resultEvents}
                  </TableCell>
                  {groups.adjustment && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.adjEventsCount}>
                      {item.adjEventsCount}
                    </TableCell>
                  )}
                  {groups.adjustment && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.adjInstallsCount}>
                      {item.adjInstallsCount}
                    </TableCell>
                  )}
                  {groups.adjustment && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.adjTotalCost}>
                      {item.adjTotalCost}
                    </TableCell>
                  )}
                  {groups.adjustment && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.adjTotalProfit}>
                      {item.adjTotalProfit}
                    </TableCell>
                  )}
                  {groups.adjustment && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.adjTotalRevenue}>
                      {item.adjTotalRevenue}
                    </TableCell>
                  )}
                  {groups.subPub && (
                    <TableCell sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.bl}>
                      {item.bl}
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={29} sx={{ textAlign: 'center', py: 2, color: theme.palette.text.secondary }}>
                  No report entries found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Paginación */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 4, gap: 2 }}>
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          variant="outlined"
          color="inherit"
          disabled={currentPage === 1}
          sx={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: '50%',
            '&:hover': { bgcolor: theme.palette.action.hover },
          }}
        >
          {"<"}
        </Button>
        <Box sx={{ px: 2, py: 1, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%', fontSize: '0.875rem', fontWeight: 'bold' }}>
          {currentPage}
        </Box>
        <Button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          variant="outlined"
          color="inherit"
          disabled={filteredData.length === 0}
          sx={{
            width: 40,
            height: 40,
            minWidth: 40,
            borderRadius: '50%',
            '&:hover': { bgcolor: theme.palette.action.hover },
          }}
        >
          {">"}
        </Button>
      </Box>
    </Box>
  );
};

export default ShowReport;
