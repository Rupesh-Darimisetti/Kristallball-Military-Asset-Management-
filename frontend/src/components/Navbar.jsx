import { Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roleLabels = {
  ADMIN: 'Administrator',
  BASE_COMMANDER: 'Base Commander',
  LOGISTICS_OFFICER: 'Logistics Officer',
};

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-emerald-400" />
        <div>
          <h1 className="text-lg font-bold tracking-wide">Kristallball</h1>
          <p className="text-xs text-slate-400">Military Asset Management</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">{user?.username}</p>
          <p className="text-xs text-slate-400">{roleLabels[user?.role]}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-800 hover:bg-slate-700 transition text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </header>
  );
}
