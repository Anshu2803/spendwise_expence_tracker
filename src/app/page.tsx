'use client';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import FilterBar from '@/components/FilterBar';
import TotalBar from '@/components/TotalBar';
import { PlusCircle, Wallet } from 'lucide-react';

export default function Home() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append('category', filterCategory);
      params.append('sort', sort);
      
      const { data } = await axios.get(`/api/expenses?${params.toString()}`);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, sort]);

  const handleDelete = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Spendwise</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Add Expense */}
        <section className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-800">Add Expense</h2>
            </div>
            <ExpenseForm onExpenseAdded={fetchExpenses} />
          </div>
        </section>

        {/* Right Column: List and Filters */}
        <section className="md:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50">
              <FilterBar 
                currentCategory={filterCategory} 
                onCategoryChange={setFilterCategory} 
              />
            </div>
            <div className="p-4">
              <ExpenseList expenses={expenses} loading={loading} onDelete={handleDelete} />
            </div>
          </div>
        </section>
      </main>

      <TotalBar expenses={expenses} />
    </div>
  );
}
