import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createExpense } from '../services/api';

const CATEGORIES = [
  { label: 'Food', emoji: '🍜' },
  { label: 'Transport', emoji: '🚗' },
  { label: 'Shopping', emoji: '🛍' },
  { label: 'Health', emoji: '💊' },
  { label: 'Entertainment', emoji: '🎬' },
  { label: 'Other', emoji: '📌' }
];

export const ExpenseForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: ''
  });

  const [idempotencyKey, setIdempotencyKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setIdempotencyKey(uuidv4());
  }, []);

  const validateForm = () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.date) {
      setError('Please select a date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      await createExpense({
        idempotency_key: idempotencyKey,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description || '',
        date: formData.date
      });

      setSuccess('Expense added!');
      setFormData({ amount: '', category: '', description: '', date: '' });
      setIdempotencyKey(uuidv4()); // NEW UUID after success
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError(err.message);
      // DO NOT change UUID on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <form onSubmit={handleSubmit} className="bg-surface-container rounded-lg p-8 border border-outline-variant border-opacity-20">
        <h2 className="font-h2 text-2xl font-semibold text-on-surface mb-6">
          Add Expense
        </h2>

        {error && (
          <div className="bg-error/10 border border-error/30 rounded-md p-3 mb-4 text-error text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-secondary/10 border border-secondary/30 rounded-md p-3 mb-4 text-secondary text-sm">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
              Amount (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-surface border border-outline-variant border-opacity-30 rounded-md px-4 py-2 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary font-mono text-lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full bg-surface border border-outline-variant border-opacity-30 rounded-md px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.label} value={cat.label}>
                  {cat.emoji} {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
              Description (optional)
            </label>
            <input
              type="text"
              placeholder="What was this for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-surface border border-outline-variant border-opacity-30 rounded-md px-4 py-2 text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wide">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-surface border border-outline-variant border-opacity-30 rounded-md px-4 py-2 text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary font-semibold py-3 rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? 'Saving...' : '+ Add Expense'}
        </button>
      </form>
    </div>
  );
};