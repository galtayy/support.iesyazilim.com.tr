import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../assets/images/iesyazilim-logo.png';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <Link to="/" className="md:hidden">
            <img src={logoImage} alt="Şirket Logo" className="h-10" />
          </Link>
        </div>
        
        <div className="ml-4 flex items-center gap-4">
          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary items-center gap-1 px-1">
                <span className="sr-only">Kullanıcı menüsü</span>
                <UserCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
                <span className="hidden text-sm text-gray-700 sm:block">
                  {user?.firstName} {user?.lastName}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="border-b border-gray-100 px-4 py-2 text-sm text-gray-500">
                  <div className="font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs">{user?.email}</div>
                  <div className="mt-1 text-xs capitalize">
                    {user?.role === 'admin' ? 'Yönetici' : 'Destek Personeli'}
                  </div>
                </div>
                
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'flex items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Profil ve Ayarlar
                    </Link>
                  )}
                </Menu.Item>
                
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={logout}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'flex w-full items-center px-4 py-2 text-sm text-gray-700'
                      )}
                    >
                      <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
                      Çıkış Yap
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </header>
  );
};

export default Header;