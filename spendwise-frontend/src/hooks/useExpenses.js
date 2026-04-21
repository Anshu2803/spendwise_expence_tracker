import { useState, useEffect } from 'react';
import { getExpenses } from '../services/api';

export const useExpenses = (selectedCategory = '') => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses({
        category: selectedCategory,
        sort: 'date_desc'
      });
      setExpenses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCategory]);

  return { expenses, loading, error, refetch: fetchExpenses };
};