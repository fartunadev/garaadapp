// // GaraadApp/services/authApi.ts
// import axios from 'axios';
// import { API_BASE_URL } from '../config';
// import { LoginData, SignUpDataAPI, AuthResponse } from '../types/auth';

// const apiClient = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// export const signup = async (payload: SignUpDataAPI): Promise<AuthResponse> => {
//   try {
//     console.log('Signing up with payload:', JSON.stringify(payload, null, 2));
//     const response = await apiClient.post<AuthResponse>('/api/auth/signup/', payload);
//     console.log('Signup response:', response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error('Signup API error:', error.response?.data || error.message);
//     const errorMessage =
//       error.response?.data?.detail ||
//       error.response?.data?.message ||
//       (typeof error.response?.data === 'object' ? JSON.stringify(error.response.data) : 'Signup failed. Please try again.');
//     throw new Error(errorMessage);
//   }
// };

// export const login = async (payload: LoginData): Promise<AuthResponse> => {
//   try {
//     console.log('Logging in with payload:', payload);
//     const response = await apiClient.post<AuthResponse>('/api/auth/signin/', payload);
//     console.log('Login response:', response.data);
//     return response.data;
//   } catch (error: any) {
//     console.error('Login API error:', error.response?.data || error.message);
//     const errorMessage =
//       error.response?.data?.detail ||
//       error.response?.data?.message ||
//       (typeof error.response?.data === 'object' ? JSON.stringify(error.response.data) : 'Login failed. Please check your credentials.');
//     throw new Error(errorMessage);
//   }
// };
// GaraadApp/services/authApi.ts
import axios, { AxiosError } from 'axios'; // Import AxiosError
import { API_BASE_URL } from '../config';
import { LoginData, SignUpDataAPI, AuthResponse } from '../types/auth';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor for auth token if not already present in apiClient.ts
// (Assuming it's handled if you have a central apiClient.ts)

const parseApiError = (error: AxiosError): string => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Status:', error.response.status);
    console.error('API Error Data:', JSON.stringify(error.response.data, null, 2)); // Log the full error data
    const responseData = error.response.data as any; // Type assertion

    if (responseData.non_field_errors && Array.isArray(responseData.non_field_errors)) {
      return responseData.non_field_errors.join(' ');
    }
    if (responseData.detail) {
      return responseData.detail;
    }
    if (responseData.message) {
      return responseData.message;
    }
    if (typeof responseData === 'object') {
      // Try to find error messages in nested fields (common in Django Rest Framework validation)
      const fieldErrors = Object.values(responseData).flat().join(' ');
      if (fieldErrors) return fieldErrors;
      return JSON.stringify(responseData);
    }
    return 'An unknown server error occurred.';
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API No Response:', error.request);
    return 'No response from server. Please check your network connection.';
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Request Setup Error:', error.message);
    return 'Error setting up request. Please try again.';
  }
};

export const signup = async (payload: SignUpDataAPI): Promise<AuthResponse> => {
  try {
    console.log('Signing up with payload:', JSON.stringify(payload, null, 2));
    const response = await apiClient.post<AuthResponse>('/api/auth/signup/', payload);
    console.log('Signup response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Signup API error caught:', axiosError);
    throw new Error(parseApiError(axiosError));
  }
};

export const login = async (payload: LoginData): Promise<AuthResponse> => {
  try {
    console.log('Logging in with payload:', payload);
    const response = await apiClient.post<AuthResponse>('/api/auth/signin/', payload);
    console.log('Login response:', response.data);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error('Login API error caught:', axiosError); // Log the original Axios error
    throw new Error(parseApiError(axiosError));
  }
};