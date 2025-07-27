import { AxiosResponse } from 'axios';

import apiClient from '@/libs/axiosConfig'; // Importa apiClient desde axiosConfig.js

interface AuthenticationResponse {
  status: string;
  result: {
    access_token: string;
    [key: string]: any;
  };
}

interface Credentials {
  email: string;
  password: string;
}

export const authenticateUser = async (credentials: Credentials): Promise<boolean> => {
  try {
    const response: AxiosResponse<AuthenticationResponse> = await apiClient.post('/auth', credentials);
    const user = response.data?.result;

    if (user?.access_token) {
      localStorage.setItem('accessToken', user.access_token);
      localStorage.setItem('RoleID', String(user.RoleID));
      localStorage.setItem('UserID', String(response.data.result.UserID));
      localStorage.setItem('user', JSON.stringify(user)); 
      return true;
    }

    throw new Error('Error en la autenticación: Token no encontrado');
  } catch (error) {
    console.error('Error al autenticar:', error);
    throw error;
  }
};