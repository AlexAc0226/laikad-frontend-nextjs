"use client";

import arrayHeadCategoies from "@/libs/headCategories";
import { getHeadByAdvertiserID } from "@/app/api/head/service";
import { getCountriesAndCities } from "@/app/api/country-and-city/service";
import { createOrUpdateCampaign } from "@/app/api/campaign/service";
import { createOrUpdateCampaignHead } from "@/app/api/head/service";
import { getCategories } from "@/app/api/category/service";
import React, { useState, useEffect, useCallback, useRef } from "react";
import apiClient from "@/libs/axiosConfig";
import Select from 'react-select';
import Image from 'next/image';
import { styled } from '@mui/material/styles';
import { Box, Button, TextField, Typography, FormControl, InputLabel, MenuItem, Select as MuiSelect, Checkbox, FormControlLabel } from '@mui/material';
import SearchableSelect from "@/components/SelectOption/SearchableSelect";

interface Info {
  CampaignID: number;
  CampaignHeadID: number;
  AdvertiserID: number;
  Campaign: string;
  CountryID: string | null;
  Countrys: string;
  Languages: string;
  CampaignTypeID: string;
  URL: string;
  DailyAmount: number;
  DailyQuantity: number;
  EventsGoal: number;
  LeadsGoal: number;
  Revenue: number;
  Cost: number;
  Proxy: number;
  Restrictions: string;
  CarrierTypeID: string;
  Banners: string;
  CarriersTypes: string;
  CitiesTypes: string;
  DeviceIdentifier: number;
  Featured: number;
  ForeignCampaignID: string;
  isAppName: number;
  DailyQuantityClick: number;
  StatusID: string;
  Incent: number;
  isFraude: number;
  isAppsFlyer: number;
  eventsName1: string;
  eventPayOut1: number;
  eventCost1: number;
  eventProxy1: number;
  eventOptimizarInstall1: number;
  eventOptimizarEvent1: number;
  eventsName2: string;
  eventPayOut2: number;
  eventCost2: number;
  eventProxy2: number;
  eventOptimizarEvent11: number;
  eventOptimizarEvent2: number;
  eventsName3: string;
  eventPayOut3: number;
  eventCost3: number;
  eventProxy3: number;
  eventOptimizarEvent21: number;
  eventOptimizarEvent3: number;
  isClone: string;
  DeviceVersion: string;
  AppIDAppsflyer: string;
  isCampaignAF: boolean;
  DeviceID: string;
  Device: string;
  Comments: string;
  CampaignCategory?: string;
  Geo: {
    IncludeCountries: boolean;
    Countries: { Code2: string; country: string }[];
    IncludeRegions: boolean;
    Regions: { RegionName: string; code?: string }[];
    IncludeCities: boolean;
    Cities: string[];
    CampaignCategory?: string;
    Icon72?: string;
  };
}

interface Device {
  Device: string;
  DeviceID: string;
}

interface Advertiser {
  AdvertiserID: number;
  Advertiser: string;
}

interface CampaignHead {
  CampaignHeadID: number;
  CampaignHead: string;
  CampaignTypeID: string;
  CampaignCategory: string;
  CampaignCategoryID?: number;
  CR: number;
  Icon72: string;
  MarcketURL: string;
}

interface CreateCampaignsProps {
  selectedAdvertiser: number;
  advertisers: Advertiser[];
  campaignToEdit?: any;
  onClose: () => void;
  countriesList: any[];
  regionsList: any[];
  selectedCountries: any[];
  selectedRegions: any[];
  geoOption: string;
  disableRegionsSelect: boolean;
  handleSelectCountries: (selected: any[]) => void;
  handleSelectRegions: (selected: any[]) => void;
}

interface Country {
  Code2: string;
  Code3?: string;
  country: string;
  LanguageCode?: string;
  code_country?: null;
}

interface Category {
  TypeID: number;
  Description: string;
  OrderPriority: number;
  StatusID: string;
}

interface CampaignType {
  CampaignTypeID: string;
  CampaignType: string;
}

const listCampaignType: CampaignType[] = [
  { CampaignTypeID: "CPI", CampaignType: "CPI" },
  { CampaignTypeID: "CPA", CampaignType: "CPA" },
  { CampaignTypeID: "CP3", CampaignType: "CPL" },
  { CampaignTypeID: "CP2", CampaignType: "CPA-Events" },
  { CampaignTypeID: "CPC", CampaignType: "CPC" },
];

interface CurrentInfoHead {
  CampaignHeadID: number;
  CampaignTypeID: string;
  CampaignType: string;
  AdvertiserID: number;
  CampaignCategoryID: number;
  CampaignCategory: string;
  DeviceID: string;
  Device: string;
  DeviceVersion: string;
  DeviceVersionDesc: string;
  StatusID: string;
  Status: string;
  DailyAmount: number;
  DailyQuantity: number;
  PackageName: string;
  Icon72: string;
  MarketURL: string;
  CR: number;
  CRMin: number;
  TimeInstall: number;
  TimeInstallMin: number;
  Prepay: number;
  PrepayTerms: string;
  VPNCheck: number;
  LanguageCheck: number;
  accionApps: string;
  CampaignHead: string;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const StyledCard = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '1200px',
  maxHeight: '95vh',
  overflowY: 'auto',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  [theme.breakpoints.down('lg')]: {
    maxWidth: '95vw',
    padding: theme.spacing(3),
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
    padding: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `1px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

const StyledForm = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
}));

const StyledMacroButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const CreateCampaigns: React.FC<CreateCampaignsProps> = (props) => {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>(
    props.advertisers.sort((a, b) => a.Advertiser.localeCompare(b.Advertiser)),
  );
  const [heads, setHeads] = useState<CampaignHead[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);

  const [flagCreatedHead, setFlagCreatedHead] = useState<boolean>(false);
  const [countryAction, setCountryAction] = useState<"Include" | "Exclude">("Include");
  const [selectedCountries, setSelectedCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [flagCreateCampaign, setFlagCreateCampaign] = useState<boolean>(false);
  const [flagCreatedCampaign, setFlagCreatedCampaign] = useState<boolean>(false);
  
  type RegionOption = {
    RegionName: string;
    countryCityID: string;
  };

  const [selectedRegions, setSelectedRegions] = useState<RegionOption[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [regionsList, setRegionsList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  
  const trackingLinkRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = !!props.campaignToEdit;

  const [currentInfo, setCurrentInfo] = useState<Info>(
    props.campaignToEdit || {
      CampaignID: 0,
      CampaignHeadID: 0,
      AdvertiserID: 0,
      Campaign: "",
      CountryID: null,
      Countrys: "",
      Languages: "",
      CampaignTypeID: "",
      URL: "",
      DailyAmount: 0,
      DailyQuantity: 0,
      EventsGoal: 0,
      LeadsGoal: 0,
      Revenue: 0,
      Cost: 0,
      Proxy: 0,
      Restrictions: "",
      CarrierTypeID: "",
      Banners: "",
      CarriersTypes: "ALL-WIFI-SI",
      CitiesTypes: "",
      DeviceIdentifier: 0,
      Featured: 0,
      ForeignCampaignID: "",
      isAppName: 0,
      DailyQuantityClick: 200000,
      StatusID: "A",
      Incent: 0,
      isFraude: 0,
      isAppsFlyer: 0,
      eventsName1: "",
      eventPayOut1: 0,
      eventCost1: 0,
      eventProxy1: 0,
      eventOptimizarInstall1: 0,
      eventOptimizarEvent1: 0,
      eventsName2: "",
      eventPayOut2: 0,
      eventCost2: 0,
      eventProxy2: 0,
      eventOptimizarEvent11: 0,
      eventOptimizarEvent2: 0,
      eventsName3: "",
      eventPayOut3: 0,
      eventCost3: 0,
      eventProxy3: 0,
      eventOptimizarEvent21: 0,
      eventOptimizarEvent3: 0,
      isClone: "",
      DeviceVersion: "",
      AppIDAppsflyer: "",
      isCampaignAF: false,
      DeviceID: "",
      Device: "",
      Comments: "",
      Geo: {
        IncludeCountries: true,
        Countries: [{ Code2: "", country: "" }],
        IncludeRegions: false,
        Regions: [],
        IncludeCities: false,
        Cities: [],
      },
    },
  );

  const [currentInfoHead, setCurrentInfoHead] = useState<CurrentInfoHead>({
    CampaignHeadID: props.campaignToEdit?.CampaignHeadID || 0,
    CampaignTypeID: props.campaignToEdit?.CampaignTypeID || "",
    CampaignType: props.campaignToEdit?.CampaignTypeID
      ? listCampaignType.find((ct) => ct.CampaignTypeID === props.campaignToEdit!.CampaignTypeID)?.CampaignType || ""
      : "",
    AdvertiserID: props.campaignToEdit?.AdvertiserID || props.selectedAdvertiser || 0,
    CampaignCategoryID: 0,
    CampaignCategory: props.campaignToEdit?.Geo?.CampaignCategory || "",
    DeviceID: "",
    Device: "",
    DeviceVersion: "",
    DeviceVersionDesc: "",
    StatusID: "A",
    Status: "Active",
    DailyAmount: 0,
    DailyQuantity: 0,
    PackageName: "",
    Icon72: props.campaignToEdit?.Geo?.Icon72 || "",
    MarketURL: "",
    CR: 24,
    CRMin: 200000,
    TimeInstall: 0,
    TimeInstallMin: 0,
    Prepay: 0,
    PrepayTerms: "",
    VPNCheck: 1,
    LanguageCheck: 0,
    accionApps: "CREATE",
    CampaignHead: "",
  });

  const listDevice: Device[] = [
    { Device: "AOS", DeviceID: "AOS" },
    { Device: "Android", DeviceID: "AND" },
    { Device: "iOS", DeviceID: "IOS" },
    { Device: "Web/Desktop", DeviceID: "WEB" },
  ];

  const fetchRegionsByCountry = useCallback(async (countryCode: string) => {
    try {
      const response = await apiClient.get('/cities', {
        params: {
          Countries: countryCode,
          Regions: undefined,
          City: undefined,
        },
        headers: {
          "Access-Token": localStorage.getItem("accessToken"),
        },
      });

      if (response.data && response.data.result) {
        const seen = new Set<string>();
        const uniqueRegions = response.data.result
          .map((region: any) => ({
            RegionName: region.RegionName || region.CityName || "Unknown",
            countryCityID: region.CountryCityID?.toString() || "",
          }))
          .filter((region: any) => {
            if (!region.RegionName) return false;
            if (seen.has(region.RegionName)) return false;
            seen.add(region.RegionName);
            return true;
          });

        setRegionsList(uniqueRegions);

        if (isEditing && props.campaignToEdit?.Geo.IncludeRegions) {
          const preloadedRegions = props.campaignToEdit.Geo.Regions
            .filter((region) => !region.RegionName.includes("-"))
            .map((region) => ({
              RegionName: region.RegionName,
              countryCityID: region.code || "",
            }));
          setSelectedRegions(preloadedRegions);
        }
      } else {
        setRegionsList([]);
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
      setRegionsList([]);
    }
  }, [isEditing, props.campaignToEdit]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCountriesAndCities("", "");
        if (data && data.result) {
          setCountries(data.result);
        } else {
          console.error("No countries found in response:", data);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isEditing && props.campaignToEdit?.Geo) {
      const preloadedCountries = props.campaignToEdit.Geo.Countries.map((country) => ({
        Code2: country.Code2,
        country: country.country,
      }));
      setSelectedCountries(preloadedCountries);

      if (preloadedCountries.length === 1 && props.campaignToEdit.Geo.IncludeRegions) {
        const countryCode = preloadedCountries[0].Code2;
        setSelectedCountry(countryCode);
        fetchRegionsByCountry(countryCode);

        const preloadedRegions = props.campaignToEdit.Geo.Regions.map((region) => ({
          RegionName: region.RegionName,
          countryCityID: region.code || "",
        }));
        setSelectedRegions(preloadedRegions);
      }
    }
  }, [isEditing, props.campaignToEdit, fetchRegionsByCountry]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        const joinCategories = [...arrayHeadCategoies, ...data.result].sort(
          (a: Category, b: Category) => a.Description.localeCompare(b.Description),
        );
        setCategories(joinCategories);

        if (isEditing && props.campaignToEdit?.CampaignCategory) {
          const selectedCategory = joinCategories.find(
            (cat: Category) => cat.Description === props.campaignToEdit!.CampaignCategory
          );
          if (selectedCategory) {
            setCurrentInfoHead((prev) => ({
              ...prev,
              CampaignCategoryID: selectedCategory.TypeID,
              CampaignCategory: selectedCategory.Description,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [isEditing, props.campaignToEdit]);

  useEffect(() => {
    if (isEditing && props.campaignToEdit?.AdvertiserID) {
      const fetchHeadDetails = async () => {
        try {
          const data = await getHeadByAdvertiserID(props.campaignToEdit.AdvertiserID);
          const sortedHeads = data.result.sort((a: CampaignHead, b: CampaignHead) =>
            a.CampaignHead.localeCompare(b.CampaignHead),
          );
          setHeads(sortedHeads);

          if (props.campaignToEdit?.CampaignHeadID) {
            const head = sortedHeads.find(
              (h: CampaignHead) => h.CampaignHeadID === props.campaignToEdit!.CampaignHeadID,
            );
            if (head) {
              const selectedCampaignType = listCampaignType.find(
                (ct) => ct.CampaignTypeID === head.CampaignTypeID,
              );
              setCurrentInfoHead((prev) => ({
                ...prev,
                CampaignHeadID: head.CampaignHeadID,
                CampaignTypeID: head.CampaignTypeID || "",
                CampaignType: selectedCampaignType ? selectedCampaignType.CampaignType : "",
                CampaignHead: head.CampaignHead || "",
                CampaignCategory: head.CampaignCategory || "",
                CampaignCategoryID: head.CampaignCategoryID ? head.CampaignCategoryID : 0,
                CR: head.CR || 24,
                Icon72: head.Icon72 || "",
                MarketURL: head.MarcketURL || "",
              }));
              setFlagCreatedHead(true);
            }
          }
        } catch (error) {
          console.error("Error fetching head details:", error);
        }
      };
      fetchHeadDetails();
    }
  }, [isEditing, props.campaignToEdit]);

  const handleChangeHeadsList = async (e: any) => {
    const advertiserId = Number(e.target.value);
    setCurrentInfoHead((prev) => ({ ...prev, AdvertiserID: advertiserId }));
    try {
      const data = await getHeadByAdvertiserID(advertiserId);
      setHeads(
        data.result.sort((a: CampaignHead, b: CampaignHead) =>
          a.CampaignHead.localeCompare(b.CampaignHead),
        ),
      );
      if (isEditing && props.campaignToEdit?.CampaignHeadID) {
        const head = data.result.find(
          (h: CampaignHead) => h.CampaignHeadID === props.campaignToEdit!.CampaignHeadID,
        );
        if (head) {
          handleHeadChange({ target: { value: head.CampaignHeadID.toString() } } as any);
          setFlagCreatedHead(true);
        }
      }
    } catch (error) {
      console.error("Error fetching heads:", error);
    }
  };

  const handleHeadChange = (e: any) => {
    const headId = Number(e.target.value);
    const selectedHead = heads.find((head) => head.CampaignHeadID === headId);

    if (selectedHead) {
      const selectedCampaignType = listCampaignType.find(
        (ct) => ct.CampaignTypeID === selectedHead.CampaignTypeID,
      );

      setCurrentInfoHead((prev) => ({
        ...prev,
        CampaignHeadID: headId,
        CampaignTypeID: selectedHead.CampaignTypeID || "",
        CampaignType: selectedCampaignType ? selectedCampaignType.CampaignType : "",
        CampaignHead: selectedHead.CampaignHead || "",
        CampaignCategory: selectedHead.CampaignCategory || "",
        CampaignCategoryID: selectedHead.CampaignCategoryID ? selectedHead.CampaignCategoryID : 0,
        CR: selectedHead.CR || 24,
        Icon72: selectedHead.Icon72 || "",
        MarketURL: selectedHead.MarcketURL || "",
      }));
      setFlagCreateCampaign(true);
    } else {
      setCurrentInfoHead((prev) => ({
        ...prev,
        CampaignHeadID: 0,
        CampaignTypeID: "",
        CampaignType: "",
        CampaignCategoryID: 0,
        CampaignCategory: "",
        DeviceID: "",
        Device: "",
        DeviceVersion: "",
        DeviceVersionDesc: "",
        StatusID: "A",
        Status: "Active",
        DailyAmount: 0,
        DailyQuantity: 0,
        PackageName: "",
        Icon72: "url-icon",
        MarketURL: "url-market",
        CR: 24,
        CRMin: 200000,
        TimeInstall: 0,
        TimeInstallMin: 0,
        Prepay: 0,
        PrepayTerms: "",
        VPNCheck: 1,
        LanguageCheck: 0,
        accionApps: "CREATE",
        CampaignHead: "",
      }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | any,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "CampaignCategory") {
      const foundCategory = categories.find((cat) => cat.TypeID === parseInt(value));
      setCurrentInfoHead((prev) => ({
        ...prev,
        CampaignCategoryID: foundCategory ? foundCategory.TypeID : 0,
        CampaignCategory: foundCategory ? foundCategory.Description : "",
      }));
    } else if (name === "DeviceID") {
      const selectedDevice = listDevice.find((dev) => dev.DeviceID === value);
      setCurrentInfoHead((prev) => ({
        ...prev,
        DeviceID: value,
        Device: selectedDevice ? selectedDevice.Device : "",
      }));
    } else if (name === "CampaignTypeID") {
      const selectedCampaignType = listCampaignType.find((ct) => ct.CampaignTypeID === value);
      setCurrentInfoHead((prev) => ({
        ...prev,
        CampaignTypeID: value,
        CampaignType: selectedCampaignType ? selectedCampaignType.CampaignType : "",
      }));
    } else {
      setCurrentInfoHead((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }

    if (["incentChecked"].includes(name)) {
      setCurrentInfo((prev) => ({ ...prev, [name]: checked }));
    } else if (
      [
        "selectedDevice",
        "selectedPayOutInstall",
        "selectedPayOutEvent",
        "eventName1",
        "selectedDailyClick",
        "selectedDailyInstalls",
        "appsflyerAppID",
        "trackingLink",
        "comments",
        "banner",
      ].includes(name)
    ) {
      setCurrentInfo((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const handleCampaignInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | any,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === "Incent") {
      setCurrentInfo((prev) => ({ ...prev, Incent: checked ? 1 : 0 }));
    } else if (name === "Device") {
      const selectedDevice = listDevice.find((dev) => dev.Device === value);
      setCurrentInfo((prev) => ({
        ...prev,
        DeviceID: selectedDevice?.DeviceID || "",
        Device: value,
      }));
    } else {
      setCurrentInfo((prev) => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }
  };

  const submitForm = async () => {
    try {
      setIsSubmitting(true);
      const formattedRegions = selectedRegions.map((region) => ({
        code: region.countryCityID?.toString() || "",
        RegionName: region.RegionName || "",
      }));

      const payload = {
        ...currentInfo,
        Geo: {
          ...currentInfo.Geo,
          Regions: formattedRegions,
        },
      };

      const method = isEditing ? "PUT" : "POST";
      const response = await createOrUpdateCampaign(payload, currentInfoHead, method);

      if (response.status === "OK") {
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
        props.onClose?.();
      } else {
        console.error("Error processing campaign:", response.message);
      }
    } catch (error) {
      console.error("Error in submitForm:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [imageError, setImageError] = useState<string | null>(null);

  const createHead = async () => {
    const response = await createOrUpdateCampaignHead(currentInfoHead);

    if (response.status === "OK") {
      setFlagCreatedHead(true);
      setCurrentInfo((prev) => ({
        ...prev,
        CampaignHeadID: response.result?.CampaignHeadID || 0,
      }));
      setCurrentInfoHead((prev) => ({
        ...prev,
        CampaignHeadID: response.result?.CampaignHeadID || 0,
      }));
    } else {
      setFlagCreatedHead(false);
    }
  };

  const handleMacroClick = (macro: string) => {
    if (trackingLinkRef.current) {
      const start = trackingLinkRef.current.selectionStart;
      const end = trackingLinkRef.current.selectionEnd;
      const value = currentInfo.URL || "";
      const newValue = value.substring(0, start) + macro + value.substring(end);
      setCurrentInfo((prev) => ({ ...prev, URL: newValue }));
      trackingLinkRef.current.focus();
    }
  };

  return (
    <StyledContainer>
      <StyledCard>
        <StyledHeader>
          <Typography variant="h5" component="h1" color="text.primary">
            {isEditing ? "Edit Campaign" : "Create Campaign"}
          </Typography>
          <Button onClick={props.onClose} color="inherit">
            ✕
          </Button>
        </StyledHeader>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 3 }}>
          Here you can {isEditing ? "edit the selected campaign" : "create a new campaign"}. Complete the details below.
        </Typography>
        <Button
          variant="text"
          color="primary"
          onClick={props.onClose}
          sx={{ mb: 3, display: 'flex', alignItems: 'center' }}
        >
          ← Back
        </Button>
        <StyledForm>
          <Button onClick={props.onClose} sx={{ display: 'none' }}>Close</Button>

          <SearchableSelect
            options={advertisers.map((advertiser) => ({
              value: advertiser.AdvertiserID.toString(),
              label: advertiser.Advertiser
            }))}
            value={currentInfoHead.AdvertiserID.toString()}
            onChange={(value) => handleChangeHeadsList({ target: { value } } as any)}
            placeholder="Search advertisers..."
            label="Advertisers"
            fullWidth
            disabled={isEditing}
            clearable
            onClear={() => handleChangeHeadsList({ target: { value: "0" } } as any)}
          />

          <SearchableSelect
            options={heads.map((item) => ({
              value: item.CampaignHeadID.toString(),
              label: item.CampaignHead
            }))}
            value={currentInfoHead.CampaignHeadID.toString()}
            onChange={(value) => handleHeadChange({ target: { value } } as any)}
            placeholder="Search heads..."
            label="Heads"
            fullWidth
            disabled={isEditing}
            clearable
            onClear={() => handleHeadChange({ target: { value: "0" } } as any)}
          />

          {!currentInfoHead.CampaignHeadID && (
            <TextField
              fullWidth
              variant="outlined"
              label="Head Name"
              name="CampaignHead"
              value={currentInfoHead.CampaignHead}
              onChange={handleInputChange}
              disabled={isEditing}
              sx={{ mb: 3 }}
            />
          )}

          <SearchableSelect
            options={listCampaignType.map((item) => ({
              value: item.CampaignTypeID,
              label: item.CampaignType
            }))}
            value={currentInfoHead.CampaignTypeID}
            onChange={(value) => handleInputChange({ target: { name: "CampaignTypeID", value } } as any)}
            placeholder="Search campaign types..."
            label="Head Type"
            fullWidth
            disabled={isEditing}
            clearable
            onClear={() => handleInputChange({ target: { name: "CampaignTypeID", value: "" } } as any)}
          />

          <SearchableSelect
            options={[
              ...categories.map((category) => ({
                value: category.TypeID,
                label: category.Description
              })),
              ...(currentInfoHead.CampaignCategory ? [{
                value: currentInfoHead.CampaignCategoryID,
                label: currentInfoHead.CampaignCategory
              }] : [])
            ]}
            value={currentInfoHead.CampaignCategoryID || currentInfoHead.CampaignCategory}
            onChange={(value) => handleInputChange({ target: { name: "CampaignCategory", value } } as any)}
            placeholder="Search categories..."
            label="Categories"
            fullWidth
            disabled={isEditing}
            clearable
            onClear={() => handleInputChange({ target: { name: "CampaignCategory", value: 0 } } as any)}
          />

          <TextField
            fullWidth
            variant="outlined"
            label="CR"
            name="CR"
            type="number"
            value={currentInfoHead.CR}
            onChange={handleInputChange}
            disabled={isEditing}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            variant="outlined"
            label="Icon"
            name="Icon72"
            value={currentInfoHead.Icon72}
            onChange={handleInputChange}
            disabled={isEditing}
            sx={{ mb: 3 }}
          />

          {currentInfoHead.Icon72 && (
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Icon Preview
              </Typography>
              {/^https?:\/\//.test(currentInfoHead.Icon72) ? (
                <Image
                  src={currentInfoHead.Icon72}
                  alt="Icon Preview"
                  width={100}
                  height={100}
                  className="rounded-md shadow-md"
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No valid image
                </Typography>
              )}
            </Box>
          )}

          <TextField
            fullWidth
            variant="outlined"
            label="Market URL"
            name="MarketURL"
            value={currentInfoHead.MarketURL}
            onChange={handleInputChange}
            disabled={isEditing}
            sx={{ mb: 3 }}
          />

          {!flagCreatedHead ? (
            !currentInfoHead.CampaignHeadID || !flagCreateCampaign ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => createHead()}
                fullWidth
                sx={{ mb: 3 }}
              >
                Create Head
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={() => setFlagCreatedHead(true)}
                fullWidth
                sx={{ mb: 3 }}
              >
                Next
              </Button>
            )
          ) : null}

          {flagCreatedHead && (
            <Box>
              <TextField
                fullWidth
                variant="outlined"
                label="Campaign Name"
                name="Campaign"
                value={currentInfo.Campaign}
                onChange={handleCampaignInputChange}
                sx={{ mb: 3 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={currentInfo.Incent === 1}
                    onChange={handleCampaignInputChange}
                    name="Incent"
                  />
                }
                label="Incent"
                sx={{ mb: 3 }}
              />

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Campaign Status
                </Typography>
                <Typography variant="body2">Active</Typography>
              </Box>

              <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
                <InputLabel>Location</InputLabel>
                <MuiSelect
                  value={countryAction}
                  onChange={(e) => {
                    const value = e.target.value as "Include" | "Exclude";
                    setCountryAction(value);
                    setCurrentInfo((prev) => ({
                      ...prev,
                      Geo: {
                        ...prev.Geo,
                        IncludeCountries: value === "Include",
                      },
                    }));
                  }}
                  label="Location"
                >
                  <MenuItem value="Include">Include</MenuItem>
                  <MenuItem value="Exclude">Exclude</MenuItem>
                </MuiSelect>
              </FormControl>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Countries
                </Typography>
                <Select
                  isMulti
                  options={countries.map((country) => ({
                    value: country.Code2,
                    label: country.country,
                  }))}
                  value={selectedCountries.map((c) => ({
                    value: c.Code2,
                    label: c.country,
                  }))}
                  onChange={(selectedOptions) => {
                    const selected = selectedOptions.map((option) => ({
                      Code2: option.value,
                      country: option.label,
                    }));
                    setSelectedCountries(selected);
                    setCurrentInfo((prev) => {
                      const updatedGeo = {
                        ...prev.Geo,
                        Countries: selected,
                        IncludeCountries: countryAction === "Include",
                        IncludeRegions: selected.length === 1,
                        Regions: selected.length === 1 ? prev.Geo.Regions : [],
                        IncludeCities: false,
                        Cities: [],
                      };
                      return {
                        ...prev,
                        Geo: updatedGeo,
                        Countrys: selected.map((c) => c.country).join(", "),
                      };
                    });
                    if (selected.length === 1) {
                      fetchRegionsByCountry(selected[0].Code2);
                    } else {
                      setRegionsList([]);
                      setSelectedRegions([]);
                    }
                  }}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select countries..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderColor: '#d1d5db',
                      boxShadow: 'none',
                      '&:hover': { borderColor: '#93c5fd' },
                      backgroundColor: '#fff',
                      dark: { backgroundColor: '#4b5563' },
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: '#fff',
                      dark: { backgroundColor: '#4b5563' },
                    }),
                  }}
                />
              </Box>

              {selectedCountries.length === 1 &&
                !selectedCountries[0].country.toLowerCase().includes("multi") && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Regions
                    </Typography>
                    <Select
                      isMulti
                      options={regionsList.map((region, index) => ({
                        label: region.RegionName || region.CityName || `Region ${index}`,
                        value: region.CountryCityID?.toString() || `${index}`,
                      }))}
                      value={selectedRegions.map((region) => ({
                        label: region.RegionName,
                        value: region.countryCityID,
                      }))}
                      onChange={(selectedOptions) => {
                        const mapped = selectedOptions.map((option) => ({
                          RegionName: option.label,
                          countryCityID: option.value,
                        }));
                        setSelectedRegions(mapped);
                        setCurrentInfo((prev) => ({
                          ...prev,
                          Geo: {
                            ...prev.Geo,
                            Regions: mapped.map((r) => ({
                              RegionName: r.RegionName,
                              code: r.countryCityID,
                            })),
                            IncludeRegions: mapped.length > 0,
                          },
                        }));
                      }}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Select regions..."
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: '#d1d5db',
                          boxShadow: 'none',
                          '&:hover': { borderColor: '#93c5fd' },
                          backgroundColor: '#fff',
                          dark: { backgroundColor: '#4b5563' },
                        }),
                        menu: (base) => ({
                          ...base,
                          backgroundColor: '#fff',
                          dark: { backgroundColor: '#4b5563' },
                        }),
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                      You can select multiple regions.
                    </Typography>
                  </Box>
                )}

              <SearchableSelect
                options={Array.isArray(listDevice) ? listDevice.map((item) => ({
                  value: item.Device,
                  label: item.Device
                })) : []}
                value={currentInfo.Device}
                onChange={(value) => handleCampaignInputChange({ target: { name: "Device", value } } as any)}
                placeholder="Search devices..."
                label="Device"
                fullWidth
                clearable
                onClear={() => handleCampaignInputChange({ target: { name: "Device", value: "" } } as any)}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="PayOut - Install"
                name="Revenue"
                type="number"
                value={currentInfo.Revenue}
                onChange={handleCampaignInputChange}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="PayOut - Event"
                name="eventPayOut1"
                type="number"
                value={currentInfo.eventPayOut1}
                onChange={handleCampaignInputChange}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="App ID - Appsflyer"
                name="AppIDAppsflyer"
                value={currentInfo.AppIDAppsflyer}
                onChange={handleCampaignInputChange}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Event Name 1"
                name="eventsName1"
                value={currentInfo.eventsName1}
                onChange={handleCampaignInputChange}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Daily Click"
                name="DailyQuantityClick"
                type="number"
                value={currentInfo.DailyQuantityClick}
                onChange={handleCampaignInputChange}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Daily Installs"
                name="DailyQuantity"
                type="number"
                value={currentInfo.DailyQuantity}
                onChange={handleCampaignInputChange}
                sx={{ mb: 3 }}
              />

              <StyledMacroButtons>
                <Button variant="outlined" color="primary" onClick={() => handleMacroClick("{trace_id}")}>
                  Click ID
                </Button>
                <Button variant="outlined" color="secondary" onClick={() => handleMacroClick("{subpub_id}")}>
                  SubPubID
                </Button>
                <Button variant="outlined" color="info" onClick={() => handleMacroClick("{IDFA}")}>
                  IDFA
                </Button>
                <Button variant="outlined" color="warning" onClick={() => handleMacroClick("{GAID}")}>
                  GAID
                </Button>
                <Button variant="outlined" color="success" onClick={() => handleMacroClick("{tr_sub1}")}>
                  AppName
                </Button>
                <Button variant="outlined" color="error" onClick={() => handleMacroClick("{Supplier}")}>
                  Publisher
                </Button>
              </StyledMacroButtons>
              <Box sx={{ my: 2 }}></Box> {/* Added a Box for spacing */}
              <TextField
                fullWidth
                variant="outlined"
                label="Tracking Link"
                name="URL"
                value={currentInfo.URL}
                onChange={handleCampaignInputChange}
                multiline
                rows={3}
                inputRef={trackingLinkRef}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Comments"
                name="Comments"
                value={currentInfo.Comments}
                onChange={handleCampaignInputChange}
                multiline
                rows={3}
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                variant="outlined"
                label="Banners"
                name="Banners"
                value={currentInfo.Banners}
                onChange={handleCampaignInputChange}
                multiline
                rows={3}
                sx={{ mb: 3 }}
              />
            </Box>
          )}

          {flagCreatedHead && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              {showSuccessAlert && (
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'success.light', color: 'success.main', borderRadius: 1 }}>
                  Campaign {isEditing ? "updated" : "created"} successfully!
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={submitForm}
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <span className="animate-spin h-5 w-5 border-4 border-t-transparent border-white rounded-full"></span> : null}
                >
                  {isSubmitting ? "Saving..." : isEditing ? "Update Campaign" : "Create Campaign"}
                </Button>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={props.onClose}
                >
                  Close
                </Button>
              </Box>
            </Box>
          )}
        </StyledForm>
      </StyledCard>
    </StyledContainer>
  );
};

export default CreateCampaigns;