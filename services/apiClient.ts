// GaraadApp/services/apiClient.ts
import axios from 'axios';
import { API_BASE_URL } from '../config'; // Your http://localhost:8000 or https://api.garaad.org
import { getAccessToken } from '../utils/storage'; // To retrieve the stored token

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the access token to requests
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;