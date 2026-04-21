const groupExpensesByDate = (expenses) => {
  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  const groups = {};
  expenses.forEach((expense) => {
    let groupLabel = expense.date;
    if (expense.date === today) groupLabel = 'TODAY';
    else if (expense.date === yesterday) groupLabel = 'YESTERDAY';
    else {
      const d = new Date(expense.date + 'T00:00:00');
      groupLabel = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }

    if (!groups[groupLabel]) groups[groupLabel] = [];
    groups[groupLabel].push(expense);
  });

  return groups;
};

const getCategoryColor = (category) => {
  const colors = {
    'Food': 'bg-red-500',
    'Transport': 'bg-blue-500',
    'Shopping': 'bg-purple-500',
    'Health': 'bg-green-500',
    'Entertainment': 'bg-yellow-500',
    'Other': 'bg-gray-500'
  };
  return colors[category] || 'bg-gray-500';
};

const getCategoryEmoji = (category) => {
  const emojis = {
    'Food': '🍜',
    'Transport': '🚗',
    'Shopping': '🛍',
    'Health': '💊',
    'Entertainment': '🎬',
    'Other': '📌'
  };
  return emojis[category] || '📌';
};

export const ExpenseList = ({ expenses, loading }) => {
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container rounded-lg p-4 animate-pulse h-16" />
          ))}
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-16 text-center">
        <p className="text-on-surface-variant">No expenses yet. Start tracking.</p>
      </div>
    );
  }

  const grouped = groupExpensesByDate(expenses);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="space-y-6">
        {Object.entries(grouped).map(([dateLabel, items]) => (
          <div key={dateLabel}>
            <h3 className="text-xs font-semibold text-on-surface-variant mb-3 uppercase tracking-wide">
              {dateLabel}
            </h3>
            <div className="space-y-2">
              {items.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-surface-container border border-outline-variant border-opacity-20 rounded-lg p-4 flex justify-between items-center hover:bg-surface-container-high transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg ${getCategoryColor(expense.category)} flex items-center justify-center text-xl`}>
                      {getCategoryEmoji(expense.category)}
                    </div>
                    <div>
                      <p className="text-on-surface font-medium">{expense.description || expense.category}</p>
                      <p className="text-on-surface-variant text-sm">{expense.category}</p>
                    </div>
                  </div>
                  <p className="font-mono text-on-surface font-semibold text-lg">
                    ₹{expense.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};