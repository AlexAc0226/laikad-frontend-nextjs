import apiClient from '@/libs/axiosConfig';

export interface LoggedUser {
  Name: string;
  EMail: string;   // viene como EMail en la API
  Phone: string;
  Image?: string;
  CoverImage?: string;
}

export const getLoggedUser = async (): Promise<LoggedUser> => {
  const res = await apiClient.post(
    '/auth',
    {}, // el body puede ir vacío
    {
      headers: { 'Access-Token': localStorage.getItem('accessToken') || '' },
    }
  );
  // la API devuelve el usuario dentro de "result"
  const r = res.data?.result ?? {};
  return {
    Name: r?.Name ?? '',
    EMail: r?.EMail ?? r?.Email ?? '',
    Phone: r?.Phone ?? '',
    Image: r?.Image ?? '',
    CoverImage: r?.CoverImage ?? '',
  };
};
