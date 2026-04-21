import { Filter } from 'lucide-react';

interface FilterBarProps {
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function FilterBar({ currentCategory, onCategoryChange }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between w-full">
      <div className="flex items-center gap-2 text-gray-700">
        <Filter className="w-5 h-5" />
        <span className="font-medium text-sm">Filter by Category</span>
      </div>
      
      <div className="relative w-full sm:w-64">
        <select
          value={currentCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="Food">Food & Dining</option>
          <option value="Transport">Transportation</option>
          <option value="Shopping">Shopping</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Bills">Bills & Utilities</option>
          <option value="Other">Other</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </div>
  );
}
