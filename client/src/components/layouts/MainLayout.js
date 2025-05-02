import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../navigation/Sidebar';
import Header from '../navigation/Header';
import TabBar from '../navigation/TabBar';

const MainLayout = () => {
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

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex flex-1 flex-col md:pl-64 overflow-auto">
        <Header />
        
        <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-4">
          <Outlet />
        </main>
        
        {/* Mobile TabBar */}
        <TabBar />
        
        <footer className="bg-white shadow-inner py-4 px-6 text-center text-sm text-gray-600 hidden md:block">
          &copy; {new Date().getFullYear()}  Tüm hakları saklıdır.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;