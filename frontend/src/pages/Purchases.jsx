import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Purchases() {
  const { canAccess } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [form, setForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '', date: '' });
  const [loading, setLoading] = useState(false);
  const canCreate = canAccess(['ADMIN', 'LOGISTICS_OFFICER']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [purchasesRes, basesRes, typesRes] = await Promise.all([
      api.get('/purchases'),
      api.get('/assets/bases'),
      api.get('/assets/equipment-types'),
    ]);
    setPurchases(purchasesRes.data);
    setBases(basesRes.data);
    setEquipmentTypes(typesRes.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/purchases', {
        baseId: Number(form.baseId),
        equipmentTypeId: Number(form.equipmentTypeId),
        quantity: Number(form.quantity),
        date: form.date || undefined,
      });
      setForm({ baseId: '', equipmentTypeId: '', quantity: '', date: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Purchases</h2>
        <p className="text-slate-500 text-sm">Log incoming asset stock to bases</p>
      </div>

      {canCreate && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-emerald-600" /> New Purchase
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={form.baseId}
              onChange={(e) => setForm({ ...form, baseId: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select Base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select
              value={form.equipmentTypeId}
              onChange={(e) => setForm({ ...form, equipmentTypeId: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select Equipment</option>
              {equipmentTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Record Purchase'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">Base</th>
              <th className="text-left px-4 py-3 font-semibold">Equipment</th>
              <th className="text-right px-4 py-3 font-semibold">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3">{new Date(p.date).toLocaleDateString()}</td>
                <td className="px-4 py-3">{p.base.name}</td>
                <td className="px-4 py-3">{p.equipmentType.name}</td>
                <td className="px-4 py-3 text-right font-medium">{p.quantity.toLocaleString()}</td>
              </tr>
            ))}
            {purchases.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">No purchases recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
