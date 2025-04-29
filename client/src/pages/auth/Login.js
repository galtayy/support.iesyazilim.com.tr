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
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">
          Giriş Yap
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Destek portalına giriş yapmak için bilgilerinizi giriniz
        </p>
      </div>

      {error && (
        <Alert
          type="error"
          message={error}
          className="mb-4"
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`form-input ${
                formik.touched.email && formik.errors.email
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : ''
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Şifre
          </label>
          <div className="mt-1">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`form-input ${
                formik.touched.password && formik.errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : ''
              }`}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="form-checkbox"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Beni hatırla
            </label>
          </div>

          <div className="text-sm">
            <Link to="/forgot-password" className="font-medium text-primary hover:text-primary/90">
              Şifremi unuttum
            </Link>
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading || !formik.isValid}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner size="sm" color="white" className="mr-2" /> Giriş yapılıyor...
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