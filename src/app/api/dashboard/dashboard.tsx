import apiClient from '@/libs/axiosConfig';

export const getDashboardData = async (params: Record<string, any> = {}) => {
  try {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0].replace(/-/g, ''); // Formato YYYYMMDD

    const localUserID = localStorage.getItem("UserID");
    let admins = [2, 4, 55, 160, 194, 242, 279, 281, 282, 283, 284, 303, 322, 350, 368, 371, 372, 438].filter((item) => item == parseInt(localUserID));
   
    // Configurar parámetros predeterminados
    const defaultParams = {
      datefrom: formattedDate,
      dateto: formattedDate,
      Adjustment: 0,
      accountmanager: admins.length >= 1 ? '' : localUserID,
    };

    // Combinar parámetros predeterminados con los proporcionados
    const finalParams = { ...defaultParams, ...params };

    // Convertir todos los valores del objeto a strings
    const finalParamsAsStrings = Object.keys(finalParams).reduce((acc, key) => {
      const typedKey = key as keyof typeof finalParams; // Forzar tipo de clave
      acc[key] = String(finalParams[typedKey]);
      return acc;
    }, {} as Record<string, string>);

    // Crear query string
    const queryString = new URLSearchParams(finalParamsAsStrings).toString();

    // Realizar la solicitud
    const response = await apiClient.get(`/reports/dashboard?${queryString}`, {
      headers: {
        'Access-Token': localStorage.getItem('accessToken'),
      },
    });

    return response;
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw error;
  }
};
