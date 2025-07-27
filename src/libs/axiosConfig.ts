import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.laikad.com/api',
  timeout: 10000,
});

// Configurar el interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
