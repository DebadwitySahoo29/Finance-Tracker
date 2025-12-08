const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
            💸
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {expense.description}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                {expense.category?.name || 'Uncategorized'}
              </span>
              <span className="flex items-center">
                📅 {formatDate(expense.date)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 ml-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-red-600">
              ₹{expense.amount.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => onEdit(expense)}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition text-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(expense._id)}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItem;