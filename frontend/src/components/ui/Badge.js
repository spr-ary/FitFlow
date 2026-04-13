export default function Badge({ status }) {
  const styles = {
    active:    'bg-green-50 text-green-700',
    expired:   'bg-red-50 text-red-600',
    expiring:  'bg-yellow-50 text-yellow-700',
    cancelled: 'bg-gray-100 text-gray-500',
    booked:    'bg-pink-50 text-pink-500',
    present:   'bg-green-50 text-green-700',
    absent:    'bg-red-50 text-red-600',
    unmarked:  'bg-gray-100 text-gray-500',
    inactive:  'bg-gray-100 text-gray-500',
    full:      'bg-red-50 text-red-600',
    open:      'bg-green-50 text-green-700',
    admin:     'bg-pink-100 text-pink-600',
    trainer:   'bg-yellow-50 text-yellow-700',
    member:    'bg-blue-50 text-blue-600',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}