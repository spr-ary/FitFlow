export default function StatCard({ label, value, trend, trendUp }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-pink-100">
      <div className="text-3xl font-medium text-gray-700 mb-1">{value}</div>
      <div className="text-xs text-gray-400 mb-2">{label}</div>
      {trend && (
        <div className={`text-xs ${trendUp ? 'text-green-600' : 'text-pink-500'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      )}
    </div>
  );
}