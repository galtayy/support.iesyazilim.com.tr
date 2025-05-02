import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  // Form validation schema
  const validationSchema = Yup.object({
    firstName: Yup.string().required('Ad alanı zorunludur'),
    lastName: Yup.string().required('Soyad alanı zorunludur'),
    email: Yup.string().email('Geçerli bir email adresi giriniz').required('Email alanı zorunludur'),
    role: Yup.string().oneOf(['admin', 'support'], 'Geçerli bir rol seçiniz').required('Rol seçimi zorunludur')
  });

  // Load user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await userService.getUser(id);
        setUser(response.data);
        
        // Initialize form with user data
        formik.setValues({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          role: response.data.role,
          active: response.data.active
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: 'support',
      active: true
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Update user
        await userService.updateUser(id, values);
        
        // Show success message
        toast.success('Kullanıcı başarıyla güncellendi.');
        
        // Navigate to user list
        navigate('/users');
      } catch (err) {
        console.error('Error updating user:', err);
        
        // Check if error is email already exists
        if (err.response && err.response.data && err.response.data.error) {
          setError(err.response.data.error);
        } else {
          setError('Kullanıcı güncellenirken bir hata oluştu.');
        }
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Check if editing own account
  const isOwnAccount = currentUser && user && currentUser.id === user.id;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <Alert
        type="error"
        title="Hata"
        message="Kullanıcı bulunamadı."
        className="mt-6"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Kullanıcı Düzenle"
        description="Kullanıcı bilgilerini güncelleyin"
        breadcrumbItems={[
          { label: 'Kullanıcılar', to: '/users' },
          { label: 'Düzenle' }
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

        {isOwnAccount && (
          <Alert
            type="warning"
            message="Kendi hesabınızı düzenliyorsunuz. Bazı ayarlar yalnızca profilinizden değiştirilebilir."
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
                disabled={isOwnAccount} // Can't change own role
              >
                <option value="support">Destek Personeli</option>
                <option value="admin">Yönetici</option>
              </select>
              {formik.touched.role && formik.errors.role && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.role}</p>
              )}
              {isOwnAccount && (
                <p className="mt-1 text-sm text-gray-500 italic">
                  Kendi rolünüzü değiştiremezsiniz.
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formik.values.role === 'admin' 
                  ? 'Yöneticiler tüm işlemleri yapabilir, onay verebilir ve raporları görüntüleyebilir.' 
                  : 'Destek personeli sadece kendi hizmet servis formlarını yönetebilir.'}
              </p>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center">
                <input
                  id="active"
                  name="active"
                  type="checkbox"
                  className="form-checkbox"
                  checked={formik.values.active}
                  onChange={formik.handleChange}
                  disabled={isOwnAccount} // Can't deactivate own account
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Aktif
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pasif kullanıcılar sisteme giriş yapamaz.
              </p>
              {isOwnAccount && (
                <p className="mt-1 text-sm text-gray-500 italic">
                  Kendi hesabınızı devre dışı bırakamazsınız.
                </p>
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
              disabled={submitting || !formik.isValid}
            >
              {submitting ? (
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

export default EditUser;