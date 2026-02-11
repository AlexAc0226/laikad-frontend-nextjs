import apiClient from "@/libs/axiosConfig";

/**
 * ✅ Fix PROD:
 * - Evita parseInt(null) => NaN
 * - Evita enviar AccountManager= (vacío) o AccountManager=null
 * - Para admins => AccountManager=0
 * - Si falta UserID (muy común en prod por dominio/origin) => fallback AccountManager=0
 */
const ADMIN_IDS = [2, 4, 55, 160, 194, 242, 279, 281, 282, 283, 284, 303, 322, 350, 368, 371, 372];

const getAccountManagerParam = () => {
  const rawUserId = localStorage.getItem("UserID");
  const userId = Number(rawUserId ?? 0);
  const isAdmin = ADMIN_IDS.includes(userId);

  // ✅ Admin o UserID faltante => 0 (trae todos / evita lista vacía)
  if (isAdmin || !userId) return "AccountManager=0";

  return `AccountManager=${userId}`;
};

const getAccessToken = () => localStorage.getItem("accessToken") ?? "";

// Obtener datos de Suppliers
export const getSuppliers = async () => {
  const params = getAccountManagerParam();

  try {
    const response = await apiClient.get(`/suppliers?${params}`, {
      headers: {
        "Access-Token": getAccessToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

// Obtener datos de Advertisers
export const getAdvertisers = async () => {
  const params = getAccountManagerParam();

  try {
    const response = await apiClient.get(`/advertisers?${params}`, {
      headers: {
        "Access-Token": getAccessToken(),
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching advertisers:", error);
    throw error;
  }
};

export const getManagers = async () => {
  try {
    const response = await apiClient.get("/users/managers", {
      headers: {
        "Access-Token": getAccessToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching managers:", error);
    throw error;
  }
};

export const getContacts = async (advertiserID: number) => {
  try {
    const response = await apiClient.get(
      `/contacts?SupplierID=0&AdvertiserID=${advertiserID}`,
      {
        headers: {
          "Access-Token": getAccessToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching contacts:", error);
    throw error;
  }
};

export const getUserPassword = async (email: string) => {
  try {
    const response = await apiClient.get(`/users/viewPasswordUser?EMail=${email}`, {
      headers: {
        "Access-Token": getAccessToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error obteniendo la contraseña:", error);
    throw error;
  }
};

export const changeUserPassword = async (email: string, newPassword: string) => {
  try {
    const body = { email: email, password: newPassword };
    const response = await apiClient.put("/auth/changepassword2", body, {
      headers: {
        "Access-Token": getAccessToken(),
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error cambiando la contraseña:", error);
    throw error;
  }
};

export const getCampaignHeads = async (advertiserID: string) => {
  try {
    const response = await apiClient.get(
      `/campaignshead?CampaignHeadID=&AdvertiserID=${advertiserID}&StatusID=&consultaAll=0`,
      {
        headers: {
          "Access-Token": getAccessToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching campaign heads:", error);
    throw error;
  }
};

export const getCampaignById = async (campaignId: number) => {
  try {
    const response = await apiClient.get(
      `https://api.laikad.com/api/campaignshead?CampaignHeadID=${campaignId}&AdvertiserID=&StatusID=&consultaAll=1`,
      {
        headers: {
          "Access-Token": getAccessToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener datos de la campaña:", error);
    throw error;
  }
};

export const getCampaignCategories = async () => {
  try {
    const response = await apiClient.get("/campaignshead/categories-head?", {
      headers: {
        "Access-Token": getAccessToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching campaign categories:", error);
    throw error;
  }
};

export const getTrackingData = async (dateFrom: string, dateTo: string, offerID: string | number) => {
  const formattedDateFrom = dateFrom.replace(/-/g, "");
  const formattedDateTo = dateTo.replace(/-/g, "");

  try {
    const response = await apiClient.get(
      `/reports/tracking?datefrom=${formattedDateFrom}&dateto=${formattedDateTo}&OfferID=${offerID}`,
      {
        headers: {
          "Access-Token": getAccessToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching tracking data:", error);
    throw error;
  }
};

export const getRequestsBySupplier = async (supplierID: number) => {
  try {
    const response = await apiClient.get(
      `https://api.laikad.com/api/pub/v2.0/request-by-supplier?SupplierID=${supplierID}`,
      {
        headers: {
          "Access-Token": getAccessToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching requests by supplier:", error);
    throw error;
  }
};

export const getSuppliersFromAPI = async () => {
  try {
    const response = await apiClient.get(
      "https://api.laikad.com/api/pub/v2.0/list-suppliers-request",
      {
        headers: {
          "Access-Token": getAccessToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    throw error;
  }
};

export const getTotalOffers = async (dateFrom: string, dateTo: string, filter = "CUSTOM") => {
  const formattedDateFrom = dateFrom.replace(/-/g, "");
  const formattedDateTo = dateTo.replace(/-/g, "");

  try {
    const response = await apiClient.get(
      `/suppliers/portal/totaloffers?DateFrom=${formattedDateFrom}&DateTo=${formattedDateTo}&filter=${filter}`,
      {
        headers: {
          "Access-Token": getAccessToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching total offers:", error);
    throw error;
  }
};

export const getCampaigns = async (status = "") => {
  const response = await apiClient.get(
    `https://api.laikad.com/api/suppliers/portal/campaigns?StatusID=${status}&Campaign=&OfferID=&CampaignID=&CampaignTypeID=&Category=&Device=&Countrys=`,
    {
      headers: {
        "Access-Token": getAccessToken(),
      },
    }
  );
  return response.data;
};

export const getTotalOffersAdvertiser = async (dateFrom: string, dateTo: string, filter = "CUSTOM") => {
  const formattedFrom = dateFrom.replace(/-/g, "");
  const formattedTo = dateTo.replace(/-/g, "");

  try {
    const response = await apiClient.get(
      `/advertisers/portal/totaloffers?DateFrom=${formattedFrom}&DateTo=${formattedTo}&filter=${filter}`,
      {
        headers: {
          "Access-Token": getAccessToken(),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching advertiser total offers:", error);
    throw error;
  }
};

export const getCampaignsAdvertiser = async (status: string) => {
  const url = `/advertisers/portal/campaigns?StatusID=${status}&Campaign=&OfferID=&CampaignID=&CampaignTypeID=&Category=&Device=&Countrys=`;

  try {
    const response = await apiClient.get(url, {
      headers: {
        "Access-Token": getAccessToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching advertiser campaigns:", error);
    throw error;
  }
};

export const getDashboardChartData = async () => {
  try {
    const response = await apiClient.get("/charts/dashboard", {
      headers: {
        "Access-Token": getAccessToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard chart data:", error);
    throw error;
  }
};

export const sendMailSupplier = async (offerIdsByEmail: string) => {
  try {
    const params = `Offers=${offerIdsByEmail}&output=email`;
    const url = `/reports/offers?${params}`;

    const response = await apiClient.get(url, {
      headers: {
        "Access-Token": getAccessToken(),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error sending mail supplier:", error);
    throw error;
  }
};
