const RecentTransactions = ({ transactions }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
        <span className="text-sm text-gray-500">{transactions.length} transactions</span>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-lg">No transactions yet</p>
          <p className="text-gray-500 text-sm mt-2">Start by adding your first expense or income</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(transactions).map((transaction) => (
            <div
              key={transaction._id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    transaction.type === 'expense'
                      ? 'bg-red-100'
                      : 'bg-green-100'
                  }`}
                >
                  {transaction.type === 'expense' ? '💸' : '💰'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{transaction.description}</p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className="text-sm text-gray-600">
                      {transaction.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{formatDate(transaction.date)}</span>
                  </div>
                </div>
              </div>
              <div
                className={`text-xl font-bold ${
                  transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                }`}
              >
                {transaction.type === 'expense' ? '-' : '+'}₹
                {transaction.amount.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;