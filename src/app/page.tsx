'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import ExpenseForm from '@/components/ExpenseForm';
import ExpenseList from '@/components/ExpenseList';
import FilterBar from '@/components/FilterBar';
import TotalBar from '@/components/TotalBar';
import AuthPage from '@/components/AuthPage';
import { PlusCircle, Wallet, LogOut } from 'lucide-react';

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [sort, setSort] = useState('date_desc');
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getExpenses({ category: filterCategory, sort });
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setLoading(false);
    }
  }, [user, filterCategory, sort]);

  const handleDelete = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, fetchExpenses]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Spendwise</h1>
          </div>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        <section className="md:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center gap-2 mb-6">
              <PlusCircle className="w-5 h-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-800">Add Expense</h2>
            </div>
            <ExpenseForm onExpenseAdded={fetchExpenses} />
          </div>
        </section>

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