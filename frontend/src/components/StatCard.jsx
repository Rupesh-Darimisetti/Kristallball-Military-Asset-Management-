export default function StatCard({ title, value, borderColor = 'border-blue-600', onClick, clickable }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${borderColor} ${
        clickable ? 'cursor-pointer hover:bg-slate-50 transition' : ''
      }`}
    >
      <h3 className="text-gray-500 text-sm font-semibold">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value?.toLocaleString() ?? 0}</p>
    </div>
  );
}
