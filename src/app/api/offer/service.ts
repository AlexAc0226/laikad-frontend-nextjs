import apiClient from '@/libs/axiosConfig';
import axios from 'axios';


export const createOrUpdateOffer = async (metodo: string, params: any) => {
    const urlBase = `https://api.laikad.com/api/offers`;
    const headers = {
        'Content-Type': 'application/json',
        'Access-Token': localStorage.getItem('accessToken'),
    };   

    try {
        const response = await axios({
            method: metodo,
            url: urlBase,
            headers,
            data: params,
        });

        return response.data;
    } catch (error) {
        console.error('Error grabbing offer:', error);
        throw error;
    }
}

export const getOffers = async (params: any) => {
    const { OfferID, CampaignID, SupplierID, StatusID, AdvertiserID } = params;
    const queryParams = new URLSearchParams({
        OfferID: OfferID || '',
        CampaignID: CampaignID || '',
        SupplierID: SupplierID || '',
        StatusID: StatusID || '',
        AdvertiserID: AdvertiserID || '',
    });
    
    try {
        const response = await apiClient({
            method: 'GET',
            url: `/offers?${queryParams}`,
            headers: {
                'Access-Token': localStorage.getItem('accessToken'),
            },
        });
    
        return response.data;
    } catch (error) {
        console.error('Error fetching offers by Supplier ID:', error);
        throw error;
    }
}

export const changeStatusOffer = async (params: any) => {
    const { OfferID, StatusID } = params;
    const queryParams = new URLSearchParams({
        OfferID: OfferID || '',
        StatusID: StatusID || '',
    });
    
    try {
        const response = await apiClient({
            method: 'PUT',
            url: `/offers/status?${queryParams}`,
            headers: {
                'Access-Token': localStorage.getItem('accessToken'),
            },
        });
    
        return response.data;
    } catch (error) {
        console.error('Error changing offer status:', error);
        throw error;
    }
}


// Request offer Supplier
export const requestOfferSupplier = async (apikey: string, campaignID: number) => {
    const queryParams = "ApiKey=" + apikey + "&CampaignID=" + campaignID;
    try {
        const response = await apiClient({
            method: 'POST',
            url: `pub/v2.0/offers?${queryParams}`,
            headers: {
                'Access-Token': localStorage.getItem('accessToken'),
            },
        });
    
        return response.data;
    } catch (error) {
        console.error('Error changing offer status:', error);
        throw error;
    }
}
