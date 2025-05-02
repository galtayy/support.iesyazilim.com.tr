import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLogo } from '../../context/LogoContext';
import defaultLogoImage from '../../assets/images/iesyazilim-logo.png';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const { getLogoUrl, handleLogoUpdated } = useLogo();
  const [logoSrc, setLogoSrc] = useState('');
  const [logoKey, setLogoKey] = useState(1); // Logo bileşenini yeniden render etmek için key

  // Logo güncellemeleri için bir efekt
  useEffect(() => {
    // Logo URL'ini al ve önbellek önleme için timestamp ekle
    setLogoSrc(getLogoUrl(true));

    // Logo güncelleme olayını dinle
    const updateLogoImage = () => {
      console.log('AuthLayout: Logo güncelleme olayı algılandı');
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

  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="w-full flex flex-col items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <img 
              key={logoKey} // Yeniden render için key ekle
              src={logoSrc} 
              alt="Şirket Logo" 
              className="h-14 mx-auto company-logo" 
              onError={(e) => {
                console.log('Logo yüklenme hatası - varsayılan logo kullanılıyor');
                e.target.onerror = null; 
                e.target.src = defaultLogoImage;
              }}
              onLoad={() => console.log('AuthLayout: Logo başarıyla yüklendi')}
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            {/* Render auth pages (login, forgot password, etc.) */}
            <Outlet />
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} <span className="font-medium">IES Yazılım.</span> Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;