import { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Transfers() {
  const { canAccess } = useAuth();
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [form, setForm] = useState({
    sourceBaseId: '',
    destinationBaseId: '',
    equipmentTypeId: '',
    quantity: '',
  });
  const [loading, setLoading] = useState(false);
  const canCreate = canAccess(['ADMIN', 'LOGISTICS_OFFICER']);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [transfersRes, basesRes, typesRes] = await Promise.all([
      api.get('/transfers'),
      api.get('/assets/bases'),
      api.get('/assets/equipment-types'),
    ]);
    setTransfers(transfersRes.data);
    setBases(basesRes.data);
    setEquipmentTypes(typesRes.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/transfers', {
        sourceBaseId: Number(form.sourceBaseId),
        destinationBaseId: Number(form.destinationBaseId),
        equipmentTypeId: Number(form.equipmentTypeId),
        quantity: Number(form.quantity),
      });
      setForm({ sourceBaseId: '', destinationBaseId: '', equipmentTypeId: '', quantity: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || err.response?.data?.message || 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Transfers</h2>
        <p className="text-slate-500 text-sm">Cross-base asset movement with atomic transactions</p>
      </div>

      {canCreate && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-600" /> Initiate Transfer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={form.sourceBaseId}
              onChange={(e) => setForm({ ...form, sourceBaseId: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Source Base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select
              value={form.destinationBaseId}
              onChange={(e) => setForm({ ...form, destinationBaseId: e.target.value })}
              className="px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Destination Base</option>
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
              <option value="">Equipment Type</option>
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
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Complete Transfer'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold">Date</th>
              <th className="text-left px-4 py-3 font-semibold">From</th>
              <th className="text-left px-4 py-3 font-semibold">To</th>
              <th className="text-left px-4 py-3 font-semibold">Equipment</th>
              <th className="text-right px-4 py-3 font-semibold">Qty</th>
              <th className="text-left px-4 py-3 font-semibold">Status</th>
              <th className="text-left px-4 py-3 font-semibold">By</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3">{new Date(t.timestamp).toLocaleDateString()}</td>
                <td className="px-4 py-3">{t.sourceBase.name}</td>
                <td className="px-4 py-3">{t.destinationBase.name}</td>
                <td className="px-4 py-3">{t.equipmentType.name}</td>
                <td className="px-4 py-3 text-right font-medium">{t.quantity.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">{t.status}</span>
                </td>
                <td className="px-4 py-3">{t.initiator.username}</td>
              </tr>
            ))}
            {transfers.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No transfers recorded</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
