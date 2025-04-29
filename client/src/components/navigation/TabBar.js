import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  PlusCircleIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const TabBar = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Check if a path is active with custom logic
  const isPathActive = (path) => {
    const currentPath = window.location.pathname;
    
    // New ticket route should only match exactly
    if (path === '/tickets/new') {
      return currentPath === '/tickets/new';
    }
    
    // Tickets route should not match if we're on the new ticket page
    if (path === '/tickets') {
      return currentPath.startsWith('/tickets') && currentPath !== '/tickets/new';
    }
    
    // For other routes, use simple matching
    return currentPath === path || (path !== '/' && currentPath.startsWith(path));
  };

  // Tabs for non-admin users
  const tabs = [
    { name: 'Ana Sayfa', to: '/', icon: HomeIcon },
    { name: 'Destek Kayıtları', to: '/tickets', icon: DocumentDuplicateIcon },
    { name: 'Yeni Kayıt', to: '/tickets/new', exact: true, icon: PlusCircleIcon },
    { name: 'Profil', to: '/profile', icon: UserCircleIcon },
  ];

  // Additional tab for admin users
  const adminTab = { name: 'Yönetim', to: '/admin', icon: Cog6ToothIcon };

  // If admin, insert the admin tab before the profile tab
  const finalTabs = isAdmin 
    ? [...tabs.slice(0, 3), adminTab, tabs[3]] 
    : tabs;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 py-3" style={{ position: 'fixed', bottom: 0, width: '100%', borderTopWidth: '1px', borderTopColor: '#E5E7EB', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
      <div className="flex justify-evenly items-center max-w-md mx-auto px-2">
        {finalTabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.to}
            className={() => {
              const active = isPathActive(tab.to);
              return `flex flex-col items-center justify-center py-2 px-1 rounded-md w-full ${active ? 'text-primary' : 'text-gray-600'}`;
            }}
          >
            {() => {
              const active = isPathActive(tab.to);
              
              return (
                <div className={`flex flex-col items-center transition duration-200 ${active ? 'scale-110' : ''}`}>
                  <tab.icon 
                    className={`h-7 w-7 transition-colors duration-200 ${active ? 'text-primary' : 'text-gray-500'}`} 
                    aria-hidden="true" 
                  />
                  {active && <div className="h-1 w-5 bg-primary rounded-t-full mt-1"></div>}
                </div>
              );
            }}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default TabBar;