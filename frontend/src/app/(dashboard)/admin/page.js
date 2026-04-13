'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminDashboard() {
  return (
    <DashboardLayout allowedRoles={['admin']}>
      <div>
        <h1 className="text-2xl font-serif text-gray-700 mb-6">Dashboard</h1>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label:'Total Members',  value:'248' },
            { label:'Classes Today',  value:'4'   },
            { label:'Attendance Rate',value:'89%' },
            { label:'Active Trainers',value:'6'   },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 border border-pink-100">
              <div className="text-3xl font-medium text-gray-700 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-5 border border-pink-100">
          <p className="text-gray-400 text-sm">
            Admin dashboard 
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}