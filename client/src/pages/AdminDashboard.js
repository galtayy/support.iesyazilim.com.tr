import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  TagIcon,
  UserIcon,
  ChartBarIcon,
  ArrowLeftIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import PageHeader from '../components/ui/PageHeader';

const AdminDashboard = () => {
  // Admin navigation options
  const adminOptions = [
    { 
      name: 'Müşteriler', 
      to: '/customers', 
      icon: UserGroupIcon, 
      description: 'Müşteri firmalarınızı yönetin',
      color: 'bg-blue-500'
    },
    { 
      name: 'Kategoriler', 
      to: '/categories', 
      icon: TagIcon, 
      description: 'Destek kategorilerini düzenleyin',
      color: 'bg-emerald-500'
    },
    { 
      name: 'Kullanıcılar', 
      to: '/users', 
      icon: UserIcon, 
      description: 'Kullanıcı hesaplarını yönetin',
      color: 'bg-violet-500'
    },
    { 
      name: 'Raporlar', 
      to: '/reports', 
      icon: ChartBarIcon, 
      description: 'Destek istatistiklerine göz atın',
      color: 'bg-amber-500'
    },
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-5 sm:py-8">
      <PageHeader
        title="Yönetim Araçları"
        description="Sistem yapılandırması ve verilerin yönetimi için araçlar"
        breadcrumbItems={[{ label: 'Yönetim Araçları' }]}
        actions={
          <Link to="/" className="btn btn-outline flex items-center text-sm">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Ana Sayfa</span>
            <span className="inline sm:hidden">Geri</span>
          </Link>
        }
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-5 sm:mt-8">
        {adminOptions.map((option) => (
          <Link
            key={option.name}
            to={option.to}
            className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
          >
            <div className={`${option.color} h-2 w-full`}></div>
            <div className="p-4 sm:p-6">
              <div className="flex items-center sm:items-start">
                <div className={`${option.color} bg-opacity-10 p-3 sm:p-4 rounded-xl mr-3 sm:mr-5 flex-shrink-0`}>
                  <option.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${option.color.replace('bg-', 'text-')}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{option.name}</h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 line-clamp-2">{option.description}</p>
                </div>
                <div className="ml-2 sm:ml-4 opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
