import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const createExpense = async (payload) => {
  try {
    const response = await apiClient.post('/expenses', payload);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to create expense');
  }
};

export const getExpenses = async ({ category = '', sort = 'date_desc' } = {}) => {
  try {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (sort === 'date_desc') params.append('sort', 'date_desc');
    
    const response = await apiClient.get(`/expenses?${params.toString()}`);
    return response.data || [];
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to fetch expenses');
  }
};