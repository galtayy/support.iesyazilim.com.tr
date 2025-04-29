import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  TagIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import logoImage from '../../assets/images/iesyazilim-logo.png';

const Sidebar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Navigation items
  const navigation = [
    { name: 'Genel Bakış', to: '/', icon: HomeIcon },
    { name: 'Destek Kayıtları', to: '/tickets', icon: DocumentDuplicateIcon },
  ];

  // Admin only navigation items
  const adminNavigation = [
    { name: 'Müşteriler', to: '/customers', icon: UserGroupIcon },
    { name: 'Kategoriler', to: '/categories', icon: TagIcon },
    { name: 'Kullanıcılar', to: '/users', icon: UserIcon },
    { name: 'Raporlar', to: '/reports', icon: ChartBarIcon },
  ];

  // Function to render a nav item
  const renderNavItem = (item) => {
    return (
      <NavLink
        key={item.name}
        to={item.to}
        className={({ isActive }) =>
          classNames(
            isActive
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-primary',
            'group flex items-center px-4 py-2 text-sm rounded-md mx-2'
          )
        }
      >
        <item.icon
          className="mr-3 h-5 w-5 flex-shrink-0"
          aria-hidden="true"
        />
        {item.name}
      </NavLink>
    );
  };

  return (
    <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <NavLink to="/">
              <img src={logoImage} alt="Şirket Logo" className="h-10" />
            </NavLink>
          </div>
          
          <div className="mt-8 px-2">
            <div className="space-y-1">
              {/* Main navigation */}
              {navigation.map(renderNavItem)}
              
              {/* Admin navigation */}
              {isAdmin && (
                <>
                  <div className="mt-6 mb-2 px-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Yönetim
                    </h3>
                  </div>
                  {adminNavigation.map(renderNavItem)}
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* User info */}
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <div className="flex flex-1 items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role === 'admin' ? 'Yönetici' : 'Destek Personeli'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to join class names
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default Sidebar;