export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-400 rounded-full animate-spin mx-auto mb-3"></div>
        <div className="text-sm text-gray-400">{message}</div>
      </div>
    </div>
  );
}