import React, { Fragment, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
  UserCircleIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useLogo } from '../../context/LogoContext';
import defaultLogoImage from '../../assets/images/iesyazilim-logo.png';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const Header = () => {
  const { user, logout, avatar } = useAuth();
  const { getLogoUrl } = useLogo();
  const [logoSrc, setLogoSrc] = useState('');
  const [logoKey, setLogoKey] = useState(1); // Logo bileşenini yeniden render etmek için key

  // Logo güncellemeleri için bir efekt
  useEffect(() => {
    // Logo URL'ini al ve önbellek önleme için timestamp ekle
    setLogoSrc(getLogoUrl(true));

    // Logo güncelleme olayını dinle
    const updateLogoImage = () => {
      console.log('Header: Logo güncelleme olayı algılandı');
      // Logoyu güncel URL ile güncelle
      setLogoSrc(getLogoUrl(true));
      // Bileşeni yeniden render etmek için key'i güncelle
      setLogoKey(prevKey => prevKey + 1);
    };

    // Event listener ekle
    window.addEventListener('logoUpdated', updateLogoImage);

    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener('logoUpdated', updateLogoImage);
    };
  }, [getLogoUrl]);

  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <Link to="/" className="md:hidden">
            <img 
              key={logoKey} // Yeniden render için key ekle
              src={logoSrc} 
              alt="Şirket Logo" 
              className="h-10 company-logo" 
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = defaultLogoImage;
              }}
            />
          </Link>
        </div>
        
        <div className="ml-4 flex items-center gap-4">
          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="flex rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary items-center gap-1 px-1">
                <span className="sr-only">Kullanıcı menüsü</span>
                {avatar ? (
                  <div className="h-8 w-8 rounded-full overflow-hidden">
                    <img src={avatar} alt="Profil" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white text-sm font-bold">
                    {user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : <UserCircleIcon className="h-8 w-8 text-white" aria-hidden="true" />}
                  </div>
                )}
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
                <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-500">
                  <div className="flex items-center gap-3 mb-2">
                    {avatar ? (
                      <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                        <img src={avatar} alt="Profil" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-light flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {user?.firstName && user?.lastName ? `${user.firstName[0]}${user.lastName[0]}` : '?'}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-700">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="text-xs">{user?.email}</div>
                    </div>
                  </div>
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
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