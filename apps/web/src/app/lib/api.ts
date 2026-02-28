import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API functions
export const captureItem = async (content: string) => {
  const response = await api.post('/capture/', { content });
  return response.data;
};

export const searchKnowledge = async (query: string) => {
  const response = await api.get('/search/', { params: { q: query } });
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};