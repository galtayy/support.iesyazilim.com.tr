import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoImage from '../../assets/images/iesyazilim-logo.png';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();

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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-grow items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src={logoImage} alt="Şirket Logo" className="h-12 mx-auto mb-4" />
            <h2 className="text-lg text-gray-600">
              Destek portalına hoş geldiniz
            </h2>
          </div>
          
          <div className="card p-8">
            {/* Render auth pages (login, forgot password, etc.) */}
            <Outlet />
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Şirketinizin Adı. Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;