export const TotalBar = ({ expenses }) => {
  const total = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

  return (
    <div className="sticky bottom-0 bg-surface-container border-t border-outline-variant border-opacity-20 px-6 py-6 mt-12">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wide">
          Total This Month
        </p>
        <p className="font-mono text-on-surface font-bold text-3xl">
          ₹{total.toFixed(2)}
        </p>
      </div>
    </div>
  );
};