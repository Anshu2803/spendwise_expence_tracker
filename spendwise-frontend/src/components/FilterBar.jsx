const CATEGORIES = [
  { label: 'All', emoji: '📊' },
  { label: 'Food', emoji: '🍜' },
  { label: 'Transport', emoji: '🚗' },
  { label: 'Shopping', emoji: '🛍' },
  { label: 'Health', emoji: '💊' },
  { label: 'Entertainment', emoji: '🎬' },
  { label: 'Other', emoji: '📌' }
];

export const FilterBar = ({ selectedCategory, onCategoryChange }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.label || (cat.label === 'All' && !selectedCategory);
          return (
            <button
              key={cat.label}
              onClick={() => onCategoryChange(cat.label === 'All' ? '' : cat.label)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-outline-variant border-opacity-30 text-on-surface hover:bg-surface-container-high'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          );
        })}
      </div>
      <div className="text-on-surface-variant text-sm whitespace-nowrap hidden md:block">↓ Newest First</div>
    </div>
  );
};