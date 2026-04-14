'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Modal from '@/components/ui/Modal';
import api from '@/lib/axios';

export default function TrainersPage() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ name:'', email:'', password:'', phone:'' });
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/users/trainers');
      setTrainers(res.data.trainers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrainers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/users', { ...form, role: 'trainer' });
      setShowAdd(false);
      setForm({ name:'', email:'', password:'', phone:'' });
      fetchTrainers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add trainer.');
    } finally {
      setSaving(false);
    }
  };

  const colors = ['bg-pink-200 text-pink-600','bg-green-200 text-green-700','bg-yellow-200 text-yellow-700','bg-blue-200 text-blue-700'];

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-700">Trainers</h1>
        <button onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition">
          + Add Trainer
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}

      <div className="grid grid-cols-2 gap-4">
        {trainers.map((t, i) => (
          <div key={t.id} className="bg-white rounded-2xl border border-pink-100 p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium ${colors[i % colors.length]}`}>
                {t.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div>
                <div className="text-base font-medium text-gray-700">{t.name}</div>
                <div className="text-xs text-gray-400">{t.email}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-400">Sessions</div>
                <div className="text-xl font-medium text-gray-700">{t.total_sessions}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Status</div>
                <div className="text-sm text-green-600 font-medium mt-1">Active</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Trainer">
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleAdd} className="space-y-4">
          {[
            { label:'Full Name', name:'name',     type:'text',     placeholder:'Trainer name' },
            { label:'Email',     name:'email',    type:'email',    placeholder:'trainer@fitflow.com' },
            { label:'Password',  name:'password', type:'password', placeholder:'Min 6 characters' },
            { label:'Phone',     name:'phone',    type:'text',     placeholder:'+66 89 000 0000' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
              <input type={f.type} value={form[f.name]}
                onChange={e => setForm({...form, [f.name]: e.target.value})}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                required={f.name !== 'phone'} />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition disabled:opacity-50">
              {saving ? 'Adding...' : 'Add Trainer'}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-sm rounded-xl hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}