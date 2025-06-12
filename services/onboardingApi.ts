import axios from 'axios';
import { API_BASE_URL } from '../config';

export const fetchOnboardingData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/onboarding/`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching onboarding data:', error);
    throw new Error('Unable to load onboarding info');
  }
};
