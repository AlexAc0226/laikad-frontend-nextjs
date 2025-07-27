import apiClient from '@/libs/axiosConfig';

// Obtener datos de Suppliers
export const getCategories = async () => {
  try {
    const response = await apiClient.get(`/campaignshead/categories-head?`, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': localStorage.getItem('accessToken'),
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
};
