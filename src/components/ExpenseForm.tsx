'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { api } from '@/lib/api';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ExpenseFormProps {
  onExpenseAdded: () => void;
}

export default function ExpenseForm({ onExpenseAdded }: ExpenseFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    idempotency_key: ''
  });
  
  const [status, setStatus] = useState<{type: 'idle'|'loading'|'success'|'error', message: string}>({ type: 'idle', message: '' });

  // Generate initial idempotency key on mount
  useEffect(() => {
    setFormData(prev => ({ ...prev, idempotency_key: uuidv4() }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category || !formData.date) return;
    if (parseFloat(formData.amount) <= 0) {
      setStatus({ type: 'error', message: 'Amount must be greater than 0' });
      return;
    }

    setStatus({ type: 'loading', message: 'Saving...' });

    try {
      const response = await api.createExpense(formData);
      
      // On success (201 created or 200 returned existing), generate a NEW idempotency key for the next submission
      setStatus({ type: 'success', message: 'Expense added!' });
      
      setFormData({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        idempotency_key: uuidv4() // Generate new key!
      });
      
      onExpenseAdded();

      setTimeout(() => setStatus({ type: 'idle', message: '' }), 3000);
    } catch (error: any) {
      // On error, DO NOT regenerate the idempotency key. Keep it the same so the user can safely retry.
      setStatus({ type: 'error', message: error.response?.data?.detail || 'Failed to save expense. Please retry.' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status.type === 'error' && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start gap-2 border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{status.message}</p>
        </div>
      )}
      
      {status.type === 'success' && (
        <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm flex items-start gap-2 border border-green-200">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p>{status.message}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          required
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: e.target.value})}
          className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="0.00"
          disabled={status.type === 'loading'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          required
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
          disabled={status.type === 'loading'}
        >
          <option value="" disabled>Select category</option>
          <option value="Food">Food & Dining</option>
          <option value="Transport">Transportation</option>
          <option value="Shopping">Shopping</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Bills">Bills & Utilities</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
        <input
          type="date"
          required
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          disabled={status.type === 'loading'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="What was this for?"
          disabled={status.type === 'loading'}
        />
      </div>

      <button
        type="submit"
        disabled={status.type === 'loading'}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {status.type === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Expense'}
      </button>
    </form>
  );
}
