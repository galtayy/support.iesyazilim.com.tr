import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import userService from '../../services/userService';

const CreateUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required('Ad alanı zorunludur'),
    lastName: Yup.string().required('Soyad alanı zorunludur'),
    email: Yup.string().email('Geçerli bir email adresi giriniz').required('Email alanı zorunludur'),
    role: Yup.string().oneOf(['admin', 'support'], 'Geçerli bir rol seçiniz').required('Rol seçimi zorunludur'),
    password: Yup.string().min(6, 'Şifre en az 6 karakter olmalıdır').required('Şifre alanı zorunludur'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Şifreler eşleşmiyor')
      .required('Şifre onayı zorunludur')
  });

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    formik.setFieldValue('password', password);
    formik.setFieldValue('confirmPassword', password);
  };

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'support',
      password: '',
      confirmPassword: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Create user (exclude confirmPassword)
        const { confirmPassword, ...userData } = values;
        await userService.createUser(userData);
        
        // Show success message
        toast.success('Kullanıcı başarıyla oluşturuldu.');
        
        // Navigate to user list
        navigate('/users');
      } catch (err) {
        console.error('Error creating user:', err);
        
        // Check if error is email already exists
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Kullanıcı oluşturulurken bir hata oluştu.');
        }
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div>
      <PageHeader
        title="Yeni Kullanıcı"
        description="Yeni bir sistem kullanıcısı oluşturun"
        breadcrumbItems={[
          { label: 'Kullanıcılar', to: '/users' },
          { label: 'Yeni Kullanıcı' }
        ]}
      />

      <Card className="mt-6">
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Ad *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                className={`form-input mt-1 ${
                  formik.touched.firstName && formik.errors.firstName
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.firstName}</p>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Soyad *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                className={`form-input mt-1 ${
                  formik.touched.lastName && formik.errors.lastName
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.lastName}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-input mt-1 ${
                  formik.touched.email && formik.errors.email
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Rol *
              </label>
              <select
                id="role"
                name="role"
                className={`form-select mt-1 ${
                  formik.touched.role && formik.errors.role
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.role}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="support">Destek Personeli</option>
                <option value="admin">Yönetici</option>
              </select>
              {formik.touched.role && formik.errors.role && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.role}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formik.values.role === 'admin' 
                  ? 'Yöneticiler tüm işlemleri yapabilir, onay verebilir ve raporları görüntüleyebilir.' 
                  : 'Destek personeli sadece kendi hizmet servis formlarını yönetebilir.'}
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre *
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-input flex-1 rounded-none rounded-l-md ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-300 focus:ring-red-500'
                      : ''
                  }`}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 hover:bg-gray-100"
                  onClick={generateRandomPassword}
                >
                  Rastgele
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Şifre Onayı *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input mt-1 ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/users')}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formik.isValid}
            >
              {loading ? (
                <div className="flex items-center">
                  <Spinner size="sm" color="white" className="mr-2" /> Kaydediliyor...
                </div>
              ) : (
                'Kaydet'
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateUser;