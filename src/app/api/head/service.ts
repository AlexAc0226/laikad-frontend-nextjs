import apiClient from '@/libs/axiosConfig';

// Obtener datos de Suppliers
export const getHeadByAdvertiserID = async (advertiserID: number) => {
  try {
    const response = await apiClient.get(`/campaignshead?CampaignHeadID=&AdvertiserID=${advertiserID}&StatusID=&consultaAll=0`, {
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

export const createOrUpdateCampaignHead = async (parameters: any) => {
  const {
    metodo,
    CampaignHeadID,
    CampaignHead,
    CampaignTypeID,
    CampaignType,
    AdvertiserID,
    CampaignCategoryID,
    CampaignCategory,
    DeviceID,
    Device,
    DeviceVersion,
    DeviceVersionDesc,
    StatusID,
    Status,
    DailyAmount,
    DailyQuantity,
    PackageName,
    Icon72,
    MarketURL, 
    CR,
    CRMin,
    TimeInstall,
    TimeInstallMin,
    Prepay,
    PrepayTerms,
    VPNCheck,
    LanguageCheck,
    accionApps
  } = parameters;

  let params = '';

  // Construcción de la cadena de parámetros
  params += `CampaignHeadID=${CampaignHeadID}&`;
  params += `CampaignTypeID=${CampaignTypeID}&`;
  params += `CampaignType=${CampaignType}&`;
  params += `AdvertiserID=${AdvertiserID}&`;
  params += `CampaignCategoryID=${CampaignCategoryID}&`;
  params += `CampaignCategory=${CampaignCategory}&`;
  params += `DeviceID=${DeviceID}&`;
  params += `Device=${Device}&`;
  params += `DeviceVersion=${DeviceVersion}&`;
  params += `DeviceVersionDesc=${DeviceVersionDesc}&`;
  params += `StatusID=${StatusID}&`;
  params += `Status=${Status}&`;
  params += `DailyAmount=${DailyAmount}&`;
  params += `DailyQuantity=${DailyQuantity}&`;
  params += `PackageName=${PackageName}&`;
  params += `Icon72=${Icon72}&`;

  // Codificación de MarketURL y CampaignHead
  const encodedMarketURL = encodeURIComponent(MarketURL || '');
  params += `MarcketURL=${encodedMarketURL}&`;

  params += `CR=${CR}&`;
  params += `CRMin=${CRMin}&`;
  params += `TimeInstall=${TimeInstall}&`;
  params += `TimeInstallMin=${TimeInstallMin}&`;
  params += `Prepay=${Prepay}&`;
  params += `PrepayTerms=${PrepayTerms}&`;
  params += `VPNCheck=${VPNCheck}&`;
  params += `LanguageCheck=${LanguageCheck}&`;
  params += `accionApps=${accionApps}&`;

  const strFromatCampaignHead = btoa(encodeURIComponent(CampaignHead));
  params += `CampaignHead=${strFromatCampaignHead}`;

  try {
    const response = await apiClient({
      method: metodo || 'POST', // Por defecto POST si no se especifica
      url: `/campaignshead?${params}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Access-Token': localStorage.getItem('accessToken'),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating/updating campaign head:', error);
    throw error;
  }
};
