import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Form validation schema
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Geçerli bir email adresi giriniz')
      .required('Email adresi gereklidir')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        setSuccess(true);
      } catch (err) {
        setError('Şifre sıfırlama isteği gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  if (success) {
    return (
      <div>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 font-poppins">
            Şifre Sıfırlama
          </h2>
        </div>
        
        <Alert
          type="success"
          title="Şifre sıfırlama bağlantısı gönderildi"
          message={
            <div>
              <p>
                {formik.values.email} adresine şifre sıfırlama talimatları içeren bir email gönderdik.
                Lütfen email'inizi kontrol edin ve talimatları izleyin.
              </p>
              <p className="mt-3">
                Email almadıysanız spam klasörünüzü kontrol edin veya geçerli bir email adresi girdiğinizden emin olun.
              </p>
            </div>
          }
          className="mb-6"
        />
        
        <div className="mt-6 text-center">
          <Link to="/login" className="btn btn-primary">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">
          Şifre Sıfırlama
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Şifrenizi sıfırlamak için kayıtlı email adresinizi girin
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
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading || !formik.isValid}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spinner size="sm" color="white" className="mr-2" /> Gönderiliyor...
              </div>
            ) : (
              'Şifre Sıfırlama Bağlantısı Gönder'
            )}
          </button>
        </div>

        <div className="text-center">
          <Link to="/login" className="text-sm font-medium text-primary hover:text-primary/90">
            Giriş sayfasına dön
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;