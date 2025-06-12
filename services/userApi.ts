// GaraadApp/services/userApi.ts
import apiClient from './apiClient';
import { User } from '../types/auth';

// VV असाइनमेंटVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
// REPLACE THIS WITH THE ACTUAL ENDPOINT FROM YOUR BACKEND
const USER_PROFILE_ENDPOINT = '/api/users/me/'; // Example: Change this!
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

export const fetchMyProfile = async (): Promise<User> => {
  try {
    console.log(`Fetching profile from: ${apiClient.defaults.baseURL}${USER_PROFILE_ENDPOINT}`);
    const response = await apiClient.get<User>(USER_PROFILE_ENDPOINT);
    console.log('Profile API Response:', JSON.stringify(response.data, null, 2)); // Log the actual data
    return response.data;
  } catch (error: any) {
    // Log the full error object for more details
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Fetch My Profile API Error - Status:', error.response.status);
      console.error('Fetch My Profile API Error - Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Fetch My Profile API Error - Headers:', error.response.headers);
      throw new Error(error.response.data.detail || `Request failed with status ${error.response.status}. Failed to fetch profile.`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Fetch My Profile API Error - No response:', error.request);
      throw new Error('No response from server while fetching profile. Check network connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Fetch My Profile API Error - Request setup:', error.message);
      throw new Error('Error setting up request to fetch profile.');
    }
  }
};