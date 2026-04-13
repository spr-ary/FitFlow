'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import api from '@/lib/axios';

export default function MembersPage() {
  const [members, setMembers]   = useState([]);
  const [plans, setPlans]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ name:'', email:'', password:'', phone:'' });
  const [error, setError]       = useState('');
  const [saving, setSaving]     = useState(false);

  const fetchMembers = async () => {
    try {
      const [mRes, pRes] = await Promise.all([
        api.get('/users/members'),
        api.get('/membership/plans'),
      ]);
      setMembers(mRes.data.members);
      setPlans(pRes.data.plans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/users', { ...form, role: 'member' });
      setShowAdd(false);
      setForm({ name:'', email:'', password:'', phone:'' });
      fetchMembers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await api.delete(`/users/${id}`);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif text-gray-700">Members</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition"
        >
          + Add Member
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full max-w-sm px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Member','Email','Plan','Membership','Joined',''].map(h => (
                <th key={h} className="text-left text-xs text-gray-400 font-medium uppercase tracking-wide px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No members found.</td></tr>
            )}
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-gray-50 hover:bg-pink-50/30 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-xs font-medium">
                      {m.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{m.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-sm text-gray-400">{m.email}</td>
                <td className="px-5 py-3 text-sm text-gray-600">{m.plan_name || '—'}</td>
                <td className="px-5 py-3"><Badge status={m.membership_status || 'inactive'} /></td>
                <td className="px-5 py-3 text-sm text-gray-400">
                  {new Date(m.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => handleDelete(m.id, m.name)}
                    className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2 py-1 rounded-lg transition"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Member">
        {error && <div className="mb-3 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <form onSubmit={handleAdd} className="space-y-4">
          {[
            { label:'Full Name', name:'name',     type:'text',     placeholder:'Full name' },
            { label:'Email',     name:'email',    type:'email',    placeholder:'email@example.com' },
            { label:'Password',  name:'password', type:'password', placeholder:'Min 6 characters' },
            { label:'Phone',     name:'phone',    type:'text',     placeholder:'+66 89 000 0000' },
          ].map(f => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
              <input
                type={f.type}
                value={form[f.name]}
                onChange={e => setForm({...form, [f.name]: e.target.value})}
                placeholder={f.placeholder}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300"
                required={f.name !== 'phone'}
              />
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-pink-400 hover:bg-pink-500 text-white text-sm rounded-xl transition disabled:opacity-50">
              {saving ? 'Adding...' : 'Add Member'}
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