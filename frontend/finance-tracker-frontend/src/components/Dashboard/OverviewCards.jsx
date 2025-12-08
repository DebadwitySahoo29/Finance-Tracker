const OverviewCards = ({ summary }) => {
  const balance = (summary?.totalIncome || 0) - (summary?.totalExpenses || 0);

  const cards = [
    {
      title: 'Total Income',
      amount: summary?.totalIncome || 0,
      icon: '💰',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300',
    },
    {
      title: 'Total Expenses',
      amount: summary?.totalExpenses || 0,
      icon: '💸',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300',
    },
    {
      title: 'Balance',
      amount: balance,
      icon: '💼',
      bgColor: balance >= 0 ? 'bg-blue-100' : 'bg-orange-100',
      textColor: balance >= 0 ? 'text-blue-700' : 'text-orange-700',
      borderColor: balance >= 0 ? 'border-blue-300' : 'border-orange-300',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} ${card.borderColor} border-2 rounded-xl p-6 shadow-md hover:shadow-lg transition`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-1">{card.title}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                ₹{card.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-5xl">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OverviewCards;