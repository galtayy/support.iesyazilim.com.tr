import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
      <div className="mx-auto max-w-max">
        <main className="sm:flex">
          <p className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">404</p>
          <div className="sm:ml-6">
            <div className="sm:border-l sm:border-gray-200 sm:pl-6">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl font-poppins">
                Sayfa Bulunamadı
              </h1>
              <p className="mt-3 text-base text-gray-500">
                Üzgünüz, aradığınız sayfayı bulamadık.
              </p>
            </div>
            <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
              <Link
                to="/"
                className="btn btn-primary"
              >
                Ana Sayfaya Dön
              </Link>
              <Link
                to="/tickets"
                className="btn btn-outline"
              >
                Destek Kayıtlarına Git
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFound;