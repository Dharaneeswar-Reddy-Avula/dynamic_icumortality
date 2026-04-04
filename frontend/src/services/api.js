import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const predictRisk = async (payload) => {
  try {
    const response = await api.post('/predict', payload);
    return response.data;
  } catch (error) {
    console.error('API Error details:', error);
    throw error.response?.data?.detail || error.message || 'An error occurred during prediction.';
  }
};

export default api;
