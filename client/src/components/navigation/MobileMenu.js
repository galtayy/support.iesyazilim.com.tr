import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserGroupIcon,
  TagIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const MobileMenu = ({ open, setOpen }) => {
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

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-40 md:hidden" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="translate-y-full"
            enterTo="translate-y-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-y-0"
            leaveTo="translate-y-full"
          >
            <Dialog.Panel className="relative flex w-full h-auto max-h-[90vh] flex-col bg-white pb-4 rounded-t-xl shadow-xl">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="flex justify-center w-full pt-4 pb-2">
                  <div className="w-10 h-1 bg-gray-300 rounded-full mb-4"></div>
                  <button
                    type="button"
                    className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Kapat</span>
                    <XMarkIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              
              <div className="flex flex-shrink-0 items-center justify-center px-4">
                <h1 className="text-xl font-bold text-primary font-poppins">
                  IES Yazılım Destek
                </h1>
              </div>
              
              <div className="mt-4 flex-1 overflow-y-auto">
                <nav className="px-4">
                  <div className="space-y-1">
                    {/* Main navigation */}
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.to}
                        className={({ isActive }) =>
                          classNames(
                            isActive
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-primary',
                            'group flex items-center px-3 py-2 text-base rounded-md'
                          )
                        }
                        onClick={() => setOpen(false)}
                      >
                        <item.icon
                          className="mr-4 h-6 w-6 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    ))}
                    
                    {/* Admin navigation */}
                    {isAdmin && (
                      <>
                        <div className="mt-8 mb-2 px-3">
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Yönetim
                          </h3>
                        </div>
                        {adminNavigation.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.to}
                            className={({ isActive }) =>
                              classNames(
                                isActive
                                  ? 'bg-primary/10 text-primary font-medium'
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary',
                                'group flex items-center px-3 py-2 text-base rounded-md'
                              )
                            }
                            onClick={() => setOpen(false)}
                          >
                            <item.icon
                              className="mr-4 h-6 w-6 flex-shrink-0"
                              aria-hidden="true"
                            />
                            {item.name}
                          </NavLink>
                        ))}
                      </>
                    )}
                  </div>
                </nav>
              </div>
              
              {/* User info */}
              <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                <div className="flex flex-1 items-center">
                  <div>
                    <p className="text-base font-medium text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">
                      {user?.role === 'admin' ? 'Yönetici' : 'Destek Personeli'}
                    </p>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>

        </div>
      </Dialog>
    </Transition.Root>
  );
};

// Helper function to join class names
function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default MobileMenu;