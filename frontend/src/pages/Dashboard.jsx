import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../components/StatCard';
import NetMoveModal from '../components/NetMoveModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [filters, setFilters] = useState({ baseId: '', equipmentTypeId: '', startDate: '', endDate: '' });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/assets/bases'),
      api.get('/assets/equipment-types'),
    ]).then(([basesRes, typesRes]) => {
      setBases(basesRes.data);
      setEquipmentTypes(typesRes.data);
      if (user?.role === 'BASE_COMMANDER' && user.baseId) {
        setFilters((f) => ({ ...f, baseId: String(user.baseId) }));
      }
    });
  }, [user]);

  useEffect(() => {
    fetchMetrics();
  }, [filters]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.baseId) params.baseId = filters.baseId;
      if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      const res = await api.get('/assets/dashboard', { params });
      setMetrics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = metrics
    ? [
        { name: 'Purchases', value: metrics.purchases, fill: '#3b82f6' },
        { name: 'Transfers In', value: metrics.transfersIn, fill: '#10b981' },
        { name: 'Transfers Out', value: metrics.transfersOut, fill: '#ef4444' },
        { name: 'Assigned', value: metrics.assigned, fill: '#f59e0b' },
        { name: 'Expended', value: metrics.expended, fill: '#8b5cf6' },
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500 text-sm">Real-time asset inventory metrics</p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-wrap gap-4">
        {user?.role !== 'BASE_COMMANDER' && (
          <select
            value={filters.baseId}
            onChange={(e) => setFilters({ ...filters, baseId: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">All Bases</option>
            {bases.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
        <select
          value={filters.equipmentTypeId}
          onChange={(e) => setFilters({ ...filters, equipmentTypeId: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        >
          <option value="">All Equipment</option>
          {equipmentTypes.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading metrics...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Opening Balance" value={metrics?.openingBalance} borderColor="border-blue-600" />
            <StatCard
              title="Net Movement (Click for detail)"
              value={metrics?.netMovement}
              borderColor="border-emerald-600"
              clickable
              onClick={() => setShowModal(true)}
            />
            <StatCard title="Assigned" value={metrics?.assigned} borderColor="border-amber-500" />
            <StatCard title="Closing Balance" value={metrics?.closingBalance} borderColor="border-purple-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Asset Flow Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Balance Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Expended</span>
                  <span className="font-semibold text-red-600">{metrics?.expended?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-slate-600">Net Movement</span>
                  <span className="font-semibold text-emerald-600">{metrics?.netMovement?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 bg-slate-50 px-3 rounded-lg">
                  <span className="font-medium">Closing Balance</span>
                  <span className="font-bold text-lg">{metrics?.closingBalance?.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-4">
                Closing = Opening + Net Movement − Assigned − Expended
              </p>
            </div>
          </div>
        </>
      )}

      {showModal && <NetMoveModal metrics={metrics} onClose={() => setShowModal(false)} />}
    </div>
  );
}
