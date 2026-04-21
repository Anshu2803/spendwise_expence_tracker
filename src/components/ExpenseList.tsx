import { format, parseISO, isToday, isYesterday } from 'date-fns';
import { IndianRupee, Tag, Info, Trash2 } from 'lucide-react';
import axios from 'axios';

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface ExpenseListProps {
  expenses: Expense[];
  loading: boolean;
  onDelete: (id: string) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Food: 'bg-orange-100 text-orange-800 border-orange-200',
    Transport: 'bg-blue-100 text-blue-800 border-blue-200',
    Shopping: 'bg-pink-100 text-pink-800 border-pink-200',
    Entertainment: 'bg-purple-100 text-purple-800 border-purple-200',
    Bills: 'bg-red-100 text-red-800 border-red-200',
    Other: 'bg-gray-100 text-gray-800 border-gray-200'
  };
  return colors[category] || colors.Other;
};

const formatDateGroup = (dateString: string) => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'TODAY';
  if (isYesterday(date)) return 'YESTERDAY';
  return format(date, 'MMM d, yyyy').toUpperCase();
};

export default function ExpenseList({ expenses, loading, onDelete }: ExpenseListProps) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axios.delete(`/api/expenses?id=${id}`);
      onDelete(id);
    } catch (error) {
      console.error('Failed to delete expense', error);
    }
  };
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-gray-500">
        <Info className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses found</h3>
        <p className="text-sm">Try adjusting your filters or add a new expense.</p>
      </div>
    );
  }

  // Group by date
  const grouped = expenses.reduce((acc: Record<string, Expense[]>, curr) => {
    const group = formatDateGroup(curr.date);
    if (!acc[group]) acc[group] = [];
    acc[group].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([dateLabel, items]) => (
        <div key={dateLabel}>
          <h3 className="text-xs font-bold text-gray-400 tracking-wider mb-3 px-2 flex items-center gap-2">
            <span>{dateLabel}</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </h3>
          
          <ul className="space-y-3">
            {items.map(expense => (
              <li key={expense.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-4 flex-1 overflow-hidden">
                  <div className={`p-2 rounded-lg border shrink-0 ${getCategoryColor(expense.category)}`}>
                    <Tag className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {expense.category}
                    </p>
                    {expense.description && (
                      <p className="text-sm text-gray-500 truncate" title={expense.description}>
                        {expense.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right shrink-0 flex items-center gap-3">
                  <div className="flex items-center text-lg font-bold text-gray-900">
                    <IndianRupee className="w-4 h-4 mr-0.5 text-gray-500" />
                    {Number(expense.amount).toFixed(2)}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(expense.id); }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete expense"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
