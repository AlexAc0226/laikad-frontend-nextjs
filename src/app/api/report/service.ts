import apiClient from '@/libs/axiosConfig';
import axios from 'axios';

export const getReportRotador = async (dateFrom: string, dateTo: string, AdvertiserID: number, SupplierID: number) => {
    const newFormatDateFrom = dateFrom.replaceAll("-", "");
    const newFormatDateTo = dateTo.replaceAll("-", "");
    let params = `datefrom=${newFormatDateFrom}&dateto=${newFormatDateTo}`;

    if (AdvertiserID) params += `&AdvertiserID=${AdvertiserID}`;
    if (SupplierID) params += `&SupplierID=${SupplierID}`;
    
    try {
        const response = await apiClient.get(`/reports/rotador?${params}`, {
          headers: {
            'Access-Token': localStorage.getItem('accessToken'),
            },
        });

        return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
};

export const getReportsCampaignTotal = async (
  DateFrom: string,
  DateTo: string,
  AdvertiserID?: number,
  SupplierID?: number,
  CampaignID?: number,
  OfferID?: number,
  UserID?: number,
  AccountManagerID2?: number,
  isDate?: string,
  isAdvertiser?: string,
  isCampaign?: string,
  isSupplier?: string,
  isOffer?: string,
  isSubPub?: string,
  isAdjustment?: string,
  clicks?: string,
  install?: string,
  events?: string,
  opeClicks?: string,
  opeInstalls?: string,
  opeEvents?: string,
  isP2?: string
) => {
  const urlBase = "https://ad.laikad.com/reports/campaign_total?";

  let params = `datefrom=${DateFrom}&dateto=${DateTo}`;

  if (AdvertiserID) params += `&AdvertiserID=${AdvertiserID}`;
  if (SupplierID) params += `&SupplierID=${SupplierID}`;
  if (CampaignID) params += `&CampaignID=${CampaignID}`;
  if (OfferID) params += `&OfferID=${OfferID}`;
  if (AccountManagerID2) params += `&AccountManagerID2=${AccountManagerID2}`;
  if (UserID) params += `&UserID=${UserID}`;
  if (isDate) params += `&isDate=${isDate}`;
  if (isAdvertiser) params += `&isAdvertiser=${isAdvertiser}`;
  if (isCampaign) params += `&isCampaign=${isCampaign}`;
  if (isSupplier) params += `&isSupplier=${isSupplier}`;
  if (isOffer) params += `&isOffer=${isOffer}`;
  if (isSubPub) params += `&isSubPub=${isSubPub}`; // Corregido: ahora es dinámico
  if (isAdjustment) params += `&isAdjustment=${isAdjustment}`;
  if (clicks) params += `&clicks=${clicks}`;
  if (install) params += `&installs=${install}`;
  if (events) params += `&events=${events}`;
  if (opeClicks) params += `&opeClicks=${opeClicks}`;
  if (opeInstalls) params += `&opeInstalls=${opeInstalls}`;
  if (opeEvents) params += `&opeEvents=${opeEvents}`;
  if (isP2) params += `&isP2=${isP2}`;

  try {
    const response = await axios.get(`${urlBase}${params}`, {
      headers: {
        'HTTP-TOKEN-AUTH': localStorage.getItem('accessToken'),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching campaign total reports:', error);
    throw error;
  }
};