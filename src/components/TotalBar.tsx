import { Calculator, IndianRupee } from 'lucide-react';

interface TotalBarProps {
  expenses: { amount: number | string }[];
}

export default function TotalBar({ expenses }: TotalBarProps) {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg z-20 transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Calculator className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Expenses</h3>
            <p className="text-xs text-gray-400 hidden sm:block">Filtered view</p>
          </div>
        </div>
        
        <div className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center">
          <IndianRupee className="w-6 h-6 sm:w-8 sm:h-8 mr-1 text-gray-500" />
          {total.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
    </div>
  );
}
