import { NavLink } from 'react-router-dom';
import Logo from '@/components/Logo';
import {
  HomeIcon,
  UsersIcon,
  WrenchScrewdriverIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/clients', label: 'Clients', icon: UsersIcon },
  { to: '/services', label: 'Services', icon: WrenchScrewdriverIcon },
  { to: '/bookings', label: 'Bookings', icon: CalendarDaysIcon },
  { to: '/invoices', label: 'Invoices', icon: DocumentTextIcon },
  { to: '/settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-6">
          <Logo className="h-9 w-9" showText />
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-gray-800">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-2 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
