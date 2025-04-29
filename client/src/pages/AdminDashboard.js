import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  TagIcon,
  UserIcon,
  ChartBarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  // Admin navigation options
  const adminOptions = [
    { name: 'Müşteriler', to: '/customers', icon: UserGroupIcon, description: 'Müşteri firmalarınızı yönetin' },
    { name: 'Kategoriler', to: '/categories', icon: TagIcon, description: 'Destek kategorilerini düzenleyin' },
    { name: 'Kullanıcılar', to: '/users', icon: UserIcon, description: 'Kullanıcı hesaplarını yönetin' },
    { name: 'Raporlar', to: '/reports', icon: ChartBarIcon, description: 'Destek istatistiklerine göz atın' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link to="/" className="text-gray-500 hover:text-primary mr-3">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Yönetim Araçları</h1>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminOptions.map((option) => (
          <Link
            key={option.name}
            to={option.to}
            className="bg-white rounded-lg shadow p-5 flex items-start hover:shadow-md transition-shadow"
          >
            <div className="bg-primary/10 p-3 rounded-lg mr-4">
              <option.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{option.name}</h2>
              <p className="text-gray-600 mt-1">{option.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
