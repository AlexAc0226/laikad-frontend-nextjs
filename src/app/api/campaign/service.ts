import apiClient from '@/libs/axiosConfig';

export const createOrUpdateCampaign = async (CampaignParams: any, CampaignHeadParams: any, method: string) => {
  const {
    metodo, CampaignID, CampaignHeadID, AdvertiserID, Campaign, CountryID, Countrys,
    Languages, CampaignTypeID, URL, Revenue, DeviceID, DeviceVersion, CampaignCategoryID,
    DailyQuantity, DailyAmount, Strictly, Cost, Proxy, Comments, CarrierTypeID, Banners,
    StatusID, CarriersTypes, CitiesTypes, DeviceIdentifier, Restrictions, Featured,
    ForeignCampaignID, isAppName, DailyQuantityClick, LeadsGoal, EventsGoal, Incent,
    isFraude, isAppsFlyer, eventsName1, eventPayOut1, eventCost1, eventProxy1,
    eventOptimizarInstall1, eventOptimizarEvent1, eventsName2, eventPayOut2, eventCost2,
    eventProxy2, eventOptimizarEvent11, eventOptimizarEvent2, eventsName3, eventPayOut3,
    eventCost3, eventProxy3, eventOptimizarEvent21, eventOptimizarEvent3,
    AccountManagerUpdated, isClone, CreationByAccounManagerID, Device, AppIDAppsflyer, Geo
  } = CampaignParams;

  let params = '';

  // Manejo de valores por defecto (como en AngularJS)
  const safeCarriersTypes = CarriersTypes ?? '';
  const safeCitiesTypes = CitiesTypes ?? '';
  const safeDeviceIdentifier = DeviceIdentifier ?? 0;
  const safeForeignCampaignID = ForeignCampaignID ?? '';
  const safeIsAppName = isAppName ?? 0;
  const safeDailyQuantityClick = DailyQuantityClick ?? 0;
  const safeLeadsGoal = LeadsGoal ?? 0;
  const safeEventsGoal = EventsGoal ?? 0;
  const safeIncent = Incent ?? 0;
  const safeIsFraude = isFraude ?? 0;
  const safeIsAppsFlyer = isAppsFlyer ?? 0;
  const safeEventsName1 = eventsName1 ?? '';
  const safeEventPayOut1 = eventPayOut1 ?? 0;
  const safeEventCost1 = eventCost1 ?? 0;
  const safeEventProxy1 = eventProxy1 ?? 0;
  const safeEventOptimizarInstall1 = eventOptimizarInstall1 ?? 0;
  const safeEventOptimizarEvent1 = eventOptimizarEvent1 ?? 0;
  const safeEventsName2 = eventsName2 ?? '';
  const safeEventPayOut2 = eventPayOut2 ?? 0;
  const safeEventCost2 = eventCost2 ?? 0;
  const safeEventProxy2 = eventProxy2 ?? 0;
  const safeEventOptimizarEvent11 = eventOptimizarEvent11 ?? 0;
  const safeEventOptimizarEvent2 = eventOptimizarEvent2 ?? 0;
  const safeEventsName3 = eventsName3 ?? '';
  const safeEventPayOut3 = eventPayOut3 ?? 0;
  const safeEventCost3 = eventCost3 ?? 0;
  const safeEventProxy3 = eventProxy3 ?? 0;
  const safeEventOptimizarEvent21 = eventOptimizarEvent21 ?? 0;
  const safeEventOptimizarEvent3 = eventOptimizarEvent3 ?? 0;
  const safeDailyAmount = DailyAmount ?? 0;
  const safeDailyQuantity = DailyQuantity ?? 0;
  const safeComments = Comments ?? '';
  const safeBanners = Banners ?? '';
  const safeIsClone = isClone ?? false;
  const safeAppIDAppsflyer = AppIDAppsflyer ?? '';

  // Codificación de la URL
  const encodedURL = encodeURIComponent(URL || '');

  // Construcción de la cadena de parámetros
  params += `CampaignID=${CampaignID}&`;
  params += `CampaignHeadID=${CampaignHeadParams.CampaignHeadID}&`;
  params += `AdvertiserID=${CampaignHeadParams.AdvertiserID}&`;
  params += `Campaign=${Campaign}&`;
  params += `CountryID=${CountryID ?? null}&`;
  params += `Countrys=${Countrys}&`;
  params += `Languages=${Languages}&`;
  params += `CampaignTypeID=${CampaignHeadParams.CampaignTypeID}&`;
  params += `URL=${encodedURL}&`;
  params += `DailyAmount=${safeDailyAmount}&`;
  params += `DailyQuantity=${safeDailyQuantity}&`;
  params += `EventsGoal=${safeEventsGoal}&`;
  params += `LeadsGoal=${safeLeadsGoal}&`;
  params += `Revenue=${Revenue}&`;
  params += `Cost=${Cost}&`;
  params += `Proxy=${Proxy}&`;
  params += `Restrictions=${Restrictions}&`;
  params += `CarrierTypeID=${CarrierTypeID}&`;
  params += `Banners=${CampaignParams.Banners}&`;
  params += `CarriersTypes=ALL-WIFI-SI&`;
  params += `CitiesTypes=${safeCitiesTypes}&`;
  params += `DeviceIdentifier=${safeDeviceIdentifier}&`;
  params += `Featured=${Featured}&`;
  params += `ForeignCampaignID=${safeForeignCampaignID}&`;
  params += `isAppName=${safeIsAppName}&`;
  params += `DailyQuantityClick=${CampaignParams.DailyQuantityClick}&`;
  params += `StatusID=${StatusID}&`;
  params += `Incent=${safeIncent}&`;
  params += `isFraude=${safeIsFraude}&`;
  params += `isAppsFlyer=${safeIsAppsFlyer}&`;
  params += `eventsName1=${safeEventsName1}&`;
  params += `eventPayOut1=${safeEventPayOut1}&`;
  params += `eventCost1=${safeEventCost1}&`;
  params += `eventProxy1=${safeEventProxy1}&`;
  params += `eventOptimizarInstall1=${safeEventOptimizarInstall1}&`;
  params += `eventOptimizarEvent1=${safeEventOptimizarEvent1}&`;
  params += `eventsName2=${safeEventsName2}&`;
  params += `eventPayOut2=${safeEventPayOut2}&`;
  params += `eventCost2=${safeEventCost2}&`;
  params += `eventProxy2=${safeEventProxy2}&`;
  params += `eventOptimizarEvent11=${safeEventOptimizarEvent11}&`;
  params += `eventOptimizarEvent2=${safeEventOptimizarEvent2}&`;
  params += `eventsName3=${safeEventsName3}&`;
  params += `eventPayOut3=${safeEventPayOut3}&`;
  params += `eventCost3=${safeEventCost3}&`;
  params += `eventProxy3=${safeEventProxy3}&`;
  params += `eventOptimizarEvent21=${safeEventOptimizarEvent21}&`;
  params += `eventOptimizarEvent3=${safeEventOptimizarEvent3}&`;
  params += `isClone=${safeIsClone}&`;
  params += `DeviceVersion=${DeviceVersion}&`;
  params += `AppIDAppsflyer=${safeAppIDAppsflyer}&`;
  params += `DeviceID=${CampaignParams.DeviceID}&Device=${CampaignParams.Device}&`;

  // Lógica para isCampaignAF
  if (safeAppIDAppsflyer && encodedURL.includes('app.appsflyer.com')) params += 'isCampaignAF=true&';
  else params += 'isCampaignAF=false&';
  
  // Preparar el cuerpo de la solicitud
  const campaign_comments = { comments: safeComments };
  
  const body = {
    campaign_comments,
    Geo: CampaignParams.Geo
  };
  
  try {
    const response = await apiClient({
      method: method,
      url: `/campaigns?${params}`,
      data: body,
      headers: {
        'Access-Token': localStorage.getItem('accessToken'),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating/updating campaign:', error);
    throw error;
  }
};

export const deleteCampaign = async (CampaignID: number) => {
  try {
    const response = await apiClient({
      method: 'DELETE',
      url: `/campaigns?CampaignID=${CampaignID}`,
      headers: {
        'Access-Token': localStorage.getItem('accessToken'),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting campaign:', error);
    throw error;
  }
}

export const getCampaignsByAdvertiserID = async (AdvertiserID: number) => {
  try {
    const response = await apiClient({
      method: 'GET',
      url: `/campaigns?AdvertiserID=${AdvertiserID}`,
      headers: {
        'Access-Token': localStorage.getItem('accessToken'),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns by Advertiser ID:', error);
    throw error;
  }
}

export const getCampaignByCampaignID = async(CampaignID: number) => {
  try {
    const response = await apiClient({
      method: 'GET',
      url: `/campaigns/findByCampaignID?CampaignID=${CampaignID}`,
      headers: {
        'Access-Token': localStorage.getItem('accessToken'),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching campaign by Campaign ID:', error);
    throw error;
  }
}

export const getAllCampaigns = async () => {
  try {
    const response = await apiClient({
      method: 'GET',
      url: '/campaigns/campaign-status?StatusID=A',
      headers: {
        'Access-Token': localStorage.getItem('accessToken'),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching all campaigns:', error);
    throw error;
  }
}

export const changeStatusCampaign = async (CampaignID: number, StatusID: string) => {
  try {
    const response = await apiClient({
      method: 'PUT',
      url: `/campaigns/status?CampaignID=${CampaignID}&StatusID=${StatusID}`,
      headers: {
        'Access-Token': localStorage.getItem('accessToken'),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error changing campaign status:', error);
    throw error;
  }
};

