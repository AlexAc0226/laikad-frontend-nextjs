import apiClient from '@/libs/axiosConfig';

// Obtener datos de Suppliers
export const getCountriesAndCities = async (name: string, code: string) => {
    let params = '';
  
    if (name !== undefined) params += `name=${name}`;
    else params += `name=`;
    
    if (code!== undefined) params += `&code2=${code}`;
    else params += `&code2=`;

    try {
    const response = await apiClient.get(`/countries?${params}`, {
      
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
