import axios from 'axios';
import { supabase } from '@/lib/supabase-client';

const API_URL = '/api';

async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

interface ApiOptions {
  category?: string;
  sort?: string;
}

export const api = {
  async getExpenses(options: ApiOptions = {}) {
    const token = await getAuthToken();
    const params = new URLSearchParams();
    if (options.category) params.append('category', options.category);
    params.append('sort', options.sort || 'date_desc');
    
    const { data } = await axios.get(`${API_URL}/expenses?${params.toString()}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return data || [];
  },

  async createExpense(payload: any) {
    const token = await getAuthToken();
    const response = await axios.post(`${API_URL}/expenses`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteExpense(id: string) {
    const token = await getAuthToken();
    await axios.delete(`${API_URL}/expenses?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};