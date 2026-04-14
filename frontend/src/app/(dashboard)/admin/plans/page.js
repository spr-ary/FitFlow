'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import api from '@/lib/axios';

export default function PlansPage() {
  const [plans, setPlans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState({ name:'', duration:'monthly', price:'', description:'' });
  const [error, setError]     = useState('');
  const [saving, setSaving]   = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/membership/plans');
      setPlans(res.data.plans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openEdit = (plan) => {
    setEditing(plan);
    setForm({ name: plan.name, duration: plan.duration, price: plan.price, description: plan.description || '' });
    setShowAdd(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/membership/plans/${editing.id}`, form);
      } else {
        await api.post('/membership/plans', form);
      }
      setShowAdd(false);
      setEditing(null);
      setForm({ name:'', duration:'monthly', price:'', description:'' });
      fetchPlans();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/membership/plans/${id}/toggle`);
      fetchPlans();
    } catch (err) {
      alert('Failed to toggle plan.');
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-700">Membership Plans</h1>
        <button
          onClick={() => { setEditing(null); setForm({ name:'', duration:'monthly', price:'', description:'' }); setShowAdd(true); }}
          className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition"
        >
          + New Plan
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Plan','Duration','Price','Members','Status',''].map(h => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Loading...</td></tr>}
            {plans.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-pink-50/30 transition">
                <td className="px-5 py-3 text-sm font-medium text-gray-700">{p.name}</td>
                <td className="px-5 py-3 text-sm text-gray-500 capitalize">{p.duration}</td>
                <td className="px-5 py-3 text-sm font-medium text-pink-500">฿{Number(p.price).toLocaleString()}</td>
                <td className="px-5 py-3 text-sm text-gray-500">—</td>
                <td className="px-5 py-3"><Badge status={p.is_active ? 'active' : 'inactive'} /></td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)}
                      className="text-xs border border-gray-200 px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-50 transition">
                      Edit
                    </button>
                    <button onClick={() => handleToggle(p.id)}
                      className="text-xs border border-gray-200 px-2 py-1 rounded-lg text-gray-500 hover:bg-gray-50 transition">
                      {p.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={showAdd}
        onClose={() => { setShowAdd(false); setEditing(null); }}
        title={editing ? 'Edit Plan' : 'New Membership Plan'}
      >
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Plan Name</label>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
              placeholder="e.g. Premium" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Duration</label>
              <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 bg-white">
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Price (฿)</label>
              <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                placeholder="0.00" required />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 resize-none"
              rows={3} placeholder="What's included..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Plan'}
            </button>
            <button type="button" onClick={() => { setShowAdd(false); setEditing(null); }}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}