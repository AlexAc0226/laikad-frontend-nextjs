import apiClient from '@/libs/axiosConfig';

export const getBlacklist = async (
  BlackListID: string,
  OfferID: string,
  SubPubID: string,
  DateFrom: string,
  DateTo: string,
  AdvertiserID: string,
  CampaignID: string,
  SupplierID: string,
  StatusID: string,
  ListType: string,
  isIP: number,
  accessToken: string
) => {
  const params = new URLSearchParams();
  params.append('ListType', ListType || 'BL');
  if (OfferID) params.append('OfferID', OfferID);
  if (CampaignID) params.append('CampaignID', CampaignID);
  if (AdvertiserID) params.append('AdvertiserID', AdvertiserID);
  if (SupplierID) params.append('SupplierID', SupplierID);
  if (SubPubID) params.append('SubPubID', SubPubID);
  if (StatusID) params.append('StatusID', StatusID);
  if (BlackListID) params.append('BlackListID', BlackListID);

  try {
    const response = await apiClient({
      method: 'GET',
      url: `https://api.laikad.com/api/blacklist?${params.toString()}`,
      headers: {
        'Access-Token': accessToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching blacklist:', error);
    throw error;
  }
};

export const createOrUpdateBlacklist = async (
  metodo: string,
  BlackListID: string = '',
  OfferID: string = '',
  SubPubID: string = '',
  DateFrom: string = '',
  DateTo: string = '',
  AdvertiserID: string = '',
  CampaignID: string = '',
  SupplierID: string = '',
  StatusID: string = '',
  ListType: string = 'BL',
  isIP: number = 0,
  Status: number = 0,
  Reason: string = '',
  accessToken: string
) => {
  const params = new URLSearchParams();
  params.append('ListType', ListType || 'BL');
  params.append('Status', Status.toString());
  if (OfferID) params.append('OfferID', OfferID);
  if (CampaignID) params.append('CampaignID', CampaignID);
  if (AdvertiserID) params.append('AdvertiserID', AdvertiserID);
  if (SupplierID) params.append('SupplierID', SupplierID);
  if (SubPubID) params.append('SubPubID', SubPubID);
  if (BlackListID) params.append('BlackListID', BlackListID);
  if (StatusID) params.append('StatusID', StatusID);
  if (metodo) params.append('action', metodo.toLowerCase());
  params.append('Reason', Reason || '');

  const httpMethod = metodo.toUpperCase() === 'POST' || metodo.toUpperCase() === 'PUT' ? 'POST' : metodo.toUpperCase() === 'DELETE' || metodo.toUpperCase() === 'PAUSE' ? 'DELETE' : metodo;

  try {
    const response = await apiClient({
      method: httpMethod,
      url: `/blacklist?${params.toString()}`,
      headers: {
        'Access-Token': accessToken,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error processing blacklist:', error);
    throw error;
  }
};