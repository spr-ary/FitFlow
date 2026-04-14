'use client';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Badge from '@/components/ui/Badge';
import api from '@/lib/axios';

export default function AttendancePage() {
  const [sessions, setSessions]     = useState([]);
  const [selected, setSelected]     = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [message, setMessage]       = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/scheduling/trainer/my');
        setSessions(res.data.sessions);
        if (res.data.sessions.length > 0) {
          loadAttendance(res.data.sessions[0].id);
          setSelected(res.data.sessions[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const loadAttendance = async (sessionId) => {
    try {
      const res = await api.get(`/attendance/session/${sessionId}`);
      setAttendance(res.data.attendance);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (sessionId) => {
    setSelected(sessionId);
    loadAttendance(sessionId);
    setMessage('');
  };

  const handleMark = (id, status) => {
    setAttendance(prev =>
      prev.map(a => a.id === id ? { ...a, status } : a)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const records = attendance.map(a => ({
        attendance_id: a.id,
        status: a.status
      }));
      await api.post('/attendance/bulk', {
        session_id: selected,
        records
      });
      setMessage('Attendance saved successfully!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const present  = attendance.filter(a => a.status === 'present').length;
  const absent   = attendance.filter(a => a.status === 'absent').length;
  const unmarked = attendance.filter(a => a.status === 'unmarked').length;

  return (
    <DashboardLayout allowedRoles={['trainer']}>
      <h1 className="text-2xl font-serif text-gray-700 mb-6">Mark Attendance</h1>

      {/* Session selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 mb-2">Select Session</label>
        <select
          value={selected || ''}
          onChange={e => handleSelect(Number(e.target.value))}
          className="w-full max-w-sm px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-pink-300 bg-white">
          {sessions.map(s => (
            <option key={s.id} value={s.id}>
              {s.name} — {new Date(s.session_date).toLocaleDateString()} {s.start_time}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-xl text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-medium text-green-700">{present}</div>
          <div className="text-xs text-green-600">Present</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-medium text-red-600">{absent}</div>
          <div className="text-xs text-red-500">Absent</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <div className="text-2xl font-medium text-gray-500">{unmarked}</div>
          <div className="text-xs text-gray-400">Unmarked</div>
        </div>
      </div>

      {/* Attendance list */}
      <div className="bg-white rounded-2xl border border-pink-100 mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Attendees ({attendance.length})
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-pink-400 hover:bg-pink-500 text-white text-xs rounded-xl transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>

        {attendance.length === 0 && (
          <div className="px-5 py-6 text-sm text-gray-400">No bookings for this session.</div>
        )}

        {attendance.map(a => (
          <div key={a.id} className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-200 text-pink-600 flex items-center justify-center text-xs font-medium">
                {a.member_name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div className="text-sm font-medium text-gray-700">{a.member_name}</div>
            </div>
            <div className="flex gap-2">
              {['present','absent','unmarked'].map(status => (
                <button
                  key={status}
                  onClick={() => handleMark(a.id, status)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition capitalize ${
                    a.status === status
                      ? status === 'present'
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : status === 'absent'
                        ? 'bg-red-100 text-red-600 border-red-300'
                        : 'bg-gray-100 text-gray-500 border-gray-300'
                      : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                  }`}>
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}