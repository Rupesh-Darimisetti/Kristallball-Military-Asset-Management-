import { useState, useEffect } from 'react';
import { UserPlus, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [assignForm, setAssignForm] = useState({ baseId: '', equipmentTypeId: '', personnelName: '', quantity: '' });
  const [expendForm, setExpendForm] = useState({ baseId: '', equipmentTypeId: '', quantity: '', reason: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [assignRes, expendRes, basesRes, typesRes] = await Promise.all([
      api.get('/operations/assignments'),
      api.get('/operations/expenditures'),
      api.get('/assets/bases'),
      api.get('/assets/equipment-types'),
    ]);
    setAssignments(assignRes.data);
    setExpenditures(expendRes.data);
    setBases(basesRes.data);
    setEquipmentTypes(typesRes.data);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/operations/assignments', {
        baseId: Number(assignForm.baseId),
        equipmentTypeId: Number(assignForm.equipmentTypeId),
        personnelName: assignForm.personnelName,
        quantity: Number(assignForm.quantity),
      });
      setAssignForm({ baseId: '', equipmentTypeId: '', personnelName: '', quantity: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExpend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/operations/expenditures', {
        baseId: Number(expendForm.baseId),
        equipmentTypeId: Number(expendForm.equipmentTypeId),
        quantity: Number(expendForm.quantity),
        reason: expendForm.reason || undefined,
      });
      setExpendForm({ baseId: '', equipmentTypeId: '', quantity: '', reason: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Expenditure failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Assignments & Expenditures</h2>
        <p className="text-slate-500 text-sm">Track personnel assignments and consumed assets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <form onSubmit={handleAssign} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" /> New Assignment
          </h3>
          <div className="space-y-3">
            <select
              value={assignForm.baseId}
              onChange={(e) => setAssignForm({ ...assignForm, baseId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select Base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select
              value={assignForm.equipmentTypeId}
              onChange={(e) => setAssignForm({ ...assignForm, equipmentTypeId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select Equipment</option>
              {equipmentTypes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Personnel Name"
              value={assignForm.personnelName}
              onChange={(e) => setAssignForm({ ...assignForm, personnelName: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="number"
              min="1"
              placeholder="Quantity"
              value={assignForm.quantity}
              onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50">
            Record Assignment
          </button>
        </form>

        <form onSubmit={handleExpend} className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-600" /> Record Expenditure
          </h3>
          <div className="space-y-3">
            <select
              value={expendForm.baseId}
              onChange={(e) => setExpendForm({ ...expendForm, baseId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="">Select Base</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <select
              value={expendForm.equipmentTypeId}
              onChange={(e) => setExpendForm({ ...expendForm, equipmentTypeId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
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
              value={expendForm.quantity}
              onChange={(e) => setExpendForm({ ...expendForm, quantity: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Reason (optional)"
              value={expendForm.reason}
              onChange={(e) => setExpendForm({ ...expendForm, reason: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <button type="submit" disabled={loading} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            Record Expenditure
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h3 className="px-4 py-3 font-semibold bg-slate-50 border-b">Assignments</h3>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Personnel</th>
                <th className="text-left px-4 py-2">Equipment</th>
                <th className="text-right px-4 py-2">Qty</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="border-b">
                  <td className="px-4 py-2">{new Date(a.assignedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{a.personnelName}</td>
                  <td className="px-4 py-2">{a.equipmentType.name}</td>
                  <td className="px-4 py-2 text-right">{a.quantity}</td>
                </tr>
              ))}
              {assignments.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No assignments</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h3 className="px-4 py-3 font-semibold bg-slate-50 border-b">Expenditures</h3>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-left px-4 py-2">Equipment</th>
                <th className="text-right px-4 py-2">Qty</th>
                <th className="text-left px-4 py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {expenditures.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="px-4 py-2">{new Date(e.expendedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{e.equipmentType.name}</td>
                  <td className="px-4 py-2 text-right">{e.quantity}</td>
                  <td className="px-4 py-2 text-slate-500">{e.reason || '—'}</td>
                </tr>
              ))}
              {expenditures.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No expenditures</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
