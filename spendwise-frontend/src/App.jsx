import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ExpenseForm } from './components/ExpenseForm';
import { FilterBar } from './components/FilterBar';
import { ExpenseList } from './components/ExpenseList';
import { TotalBar } from './components/TotalBar';
import { useExpenses } from './hooks/useExpenses';
import './App.css';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { expenses, loading, error, refetch } = useExpenses(selectedCategory);

  const handleFormSuccess = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col">
      <Header />

      {error && (
        <div className="bg-error/10 border-b border-error/30 px-6 py-4">
          <p className="text-error text-sm max-w-6xl mx-auto">
            Error: {error}
          </p>
        </div>
      )}

      <div className="flex-grow">
        <ExpenseForm onSuccess={handleFormSuccess} />

        <FilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        <ExpenseList expenses={expenses} loading={loading} />
      </div>

      <TotalBar expenses={expenses} />
    </div>
  );
}