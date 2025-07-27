import apiClient from '@/libs/axiosConfig';

export const updateValuesRequestOffer = async (method: string, params: any) => {
    try {
      let queryUrl = ""

      queryUrl =  "Offer=" + params.Offer
      queryUrl += "&OfferID=" + params.OfferID
      queryUrl += "&Proxy=" + params.Proxy
      queryUrl += "&SupplierID=" + params.Supplier.SupplierID
      queryUrl += "&CampaignID=" + params.Campaign.CampaignID
      queryUrl += "&URL_New=" + params.Campaign.URL
      queryUrl += "&Cost=" + params.Cost
      queryUrl += "&DailyCap=" + params.DailyCap
      queryUrl += "&DailyCapClick=" + params.DailyCapClick

      const response = await apiClient({
          method: method, 
          url: `/pub/v2.0/offers?${queryUrl}`,
          headers: {
            'Content-Type': 'application/json',
            'Access-Token': localStorage.getItem('accessToken'),
          },
      });
      
        return response.data;
    } catch (error) {
      console.error('Error creating or updating request offer:', error);
      throw error;
    }
};

export const aceptRequestOffer = async (params: any) => {
  try {
    const queryUrl = `OfferID=${params.OfferID}&SupplierID=${params.Supplier.SupplierID}`;

    const response = await apiClient({
        method: 'PUT', 
        url: `/pub/v2.0/add-request-offer?${queryUrl}`,
        headers: {
          'Content-Type': 'application/json',
          'Access-Token': localStorage.getItem('accessToken'),
        },
    });
    
      return response.data;
  } catch (error) {
    console.error('Error creating or updating request offer:', error);
    throw error;
  }
};
