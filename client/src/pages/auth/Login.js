import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';

const Login = () => {
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Login form validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Geçerli bir email adresi giriniz')
      .required('Email adresi gereklidir'),
    password: Yup.string().required('Şifre gereklidir')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        await login(values.email, values.password);
      } catch (err) {
        // Error is handled in AuthContext and shown via toast
        setError('Giriş yapılamadı. Lütfen email ve şifrenizi kontrol edin.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div>
      <div className="mb-5 text-center">
        <h2 className="text-xl font-bold text-gray-800 font-poppins">
          Giriş Yap
        </h2>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-5"
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-700">
              E-posta
            </label>
            {formik.touched.email && formik.errors.email && (
              <span className="text-xs text-red-500">{formik.errors.email}</span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="E-posta adresiniz"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`pl-10 pr-4 py-2.5 w-full text-gray-700 bg-white border ${formik.touched.email && formik.errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-blue-200'} rounded-lg focus:outline-none focus:ring-4 transition-colors`}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-700">
              Şifre
            </label>
            {formik.touched.password && formik.errors.password && (
              <span className="text-xs text-red-500">{formik.errors.password}</span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Şifreniz"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`pl-10 pr-4 py-2.5 w-full text-gray-700 bg-white border ${formik.touched.password && formik.errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-primary focus:ring-blue-200'} rounded-lg focus:outline-none focus:ring-4 transition-colors`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary rounded transition duration-150 ease-in-out"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Beni hatırla
            </label>
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary focus:ring-opacity-20 transition-colors ${isLoading || !formik.isValid ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading || !formik.isValid}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner size="sm" color="white" className="mr-2" /> 
                <span>Giriş yapılıyor...</span>
              </div>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;