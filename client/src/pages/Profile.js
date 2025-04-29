import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import Tabs from '../components/ui/Tabs';

const Profile = () => {
  const { user, changePassword, updateProfile } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile form validation schema
  const profileValidationSchema = Yup.object({
    firstName: Yup.string().required('Ad gereklidir'),
    lastName: Yup.string().required('Soyad gereklidir'),
    email: Yup.string().email('Geçerli bir email giriniz').required('Email gereklidir')
  });

  // Password form validation schema
  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string().required('Mevcut şifre gereklidir'),
    newPassword: Yup.string()
      .min(6, 'Şifre en az 6 karakter olmalıdır')
      .required('Yeni şifre gereklidir'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor')
      .required('Şifre onayı gereklidir')
  });

  // Initialize profile form
  const profileFormik = useFormik({
    initialValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        setProfileLoading(true);
        
        // Simulate update API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update context
        updateProfile({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email
        });
        
        setProfileSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setProfileSuccess(false);
        }, 3000);
      } catch (error) {
        console.error('Update profile error:', error);
      } finally {
        setProfileLoading(false);
      }
    }
  });

  // Initialize password form
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        setPasswordLoading(true);
        
        await changePassword(values.currentPassword, values.newPassword);
        
        // Reset form
        passwordFormik.resetForm();
        
        setPasswordSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setPasswordSuccess(false);
        }, 3000);
      } catch (error) {
        console.error('Change password error:', error);
      } finally {
        setPasswordLoading(false);
      }
    }
  });

  // Profile form content
  const ProfileForm = (
    <form onSubmit={profileFormik.handleSubmit}>
      {profileSuccess && (
        <Alert
          type="success"
          message="Profil bilgileriniz başarıyla güncellendi."
          className="mb-4"
          onClose={() => setProfileSuccess(false)}
        />
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Ad
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="form-input mt-1"
            value={profileFormik.values.firstName}
            onChange={profileFormik.handleChange}
            onBlur={profileFormik.handleBlur}
          />
          {profileFormik.touched.firstName && profileFormik.errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{profileFormik.errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Soyad
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="form-input mt-1"
            value={profileFormik.values.lastName}
            onChange={profileFormik.handleChange}
            onBlur={profileFormik.handleBlur}
          />
          {profileFormik.touched.lastName && profileFormik.errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{profileFormik.errors.lastName}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="form-input mt-1"
            value={profileFormik.values.email}
            onChange={profileFormik.handleChange}
            onBlur={profileFormik.handleBlur}
          />
          {profileFormik.touched.email && profileFormik.errors.email && (
            <p className="mt-1 text-sm text-red-600">{profileFormik.errors.email}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={profileLoading || !profileFormik.isValid}
        >
          {profileLoading ? (
            <div className="flex items-center">
              <Spinner size="sm" color="white" className="mr-2" /> Güncelleniyor...
            </div>
          ) : (
            'Profili Güncelle'
          )}
        </button>
      </div>
    </form>
  );

  // Password form content
  const PasswordForm = (
    <form onSubmit={passwordFormik.handleSubmit}>
      {passwordSuccess && (
        <Alert
          type="success"
          message="Şifreniz başarıyla değiştirildi."
          className="mb-4"
          onClose={() => setPasswordSuccess(false)}
        />
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Mevcut Şifre
          </label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            className="form-input mt-1"
            value={passwordFormik.values.currentPassword}
            onChange={passwordFormik.handleChange}
            onBlur={passwordFormik.handleBlur}
          />
          {passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword && (
            <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.currentPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
            Yeni Şifre
          </label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            className="form-input mt-1"
            value={passwordFormik.values.newPassword}
            onChange={passwordFormik.handleChange}
            onBlur={passwordFormik.handleBlur}
          />
          {passwordFormik.touched.newPassword && passwordFormik.errors.newPassword && (
            <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.newPassword}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Yeni Şifre (Tekrar)
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="form-input mt-1"
            value={passwordFormik.values.confirmPassword}
            onChange={passwordFormik.handleChange}
            onBlur={passwordFormik.handleBlur}
          />
          {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{passwordFormik.errors.confirmPassword}</p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={passwordLoading || !passwordFormik.isValid}
        >
          {passwordLoading ? (
            <div className="flex items-center">
              <Spinner size="sm" color="white" className="mr-2" /> Değiştiriliyor...
            </div>
          ) : (
            'Şifreyi Değiştir'
          )}
        </button>
      </div>
    </form>
  );

  // Tab config
  const tabs = [
    {
      label: 'Profil Bilgileri',
      content: ProfileForm
    },
    {
      label: 'Şifre Değiştir',
      content: PasswordForm
    }
  ];

  return (
    <div>
      <PageHeader
        title="Profil ve Ayarlar"
        description="Kişisel bilgilerinizi ve hesap ayarlarınızı yönetin"
        breadcrumbItems={[{ label: 'Profil ve Ayarlar' }]}
      />

      <div className="mt-6">
        <Card>
          <Tabs tabs={tabs} />
        </Card>
      </div>
    </div>
  );
};

export default Profile;