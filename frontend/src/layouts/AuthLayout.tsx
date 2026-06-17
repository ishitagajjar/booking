import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="BookFlow" className="h-16 w-16 mx-auto" />
          <h1 className="mt-3 text-2xl font-bold text-gray-900">BookFlow</h1>
          <p className="mt-1 text-sm text-gray-500">Booking & invoicing</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
