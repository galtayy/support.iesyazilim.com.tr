import React, { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Spinner from '../components/ui/Spinner';
import Tabs from '../components/ui/Tabs';
import { UserIcon, KeyIcon, ShieldCheckIcon, CameraIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, changePassword, updateProfile } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const fileInputRef = useRef(null);

  // Get avatar from auth context
  const { avatar, updateAvatar } = useAuth();
  
  // Get user initials for avatar placeholder
  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : '?';

  // Trigger the hidden file input when camera button is clicked
  const handleAvatarButtonClick = () => {
    fileInputRef.current.click();
  };

  // Handle avatar file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setAvatarError(null);
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('Lütfen geçerli bir resim dosyası seçin (JPEG, PNG, GIF)');
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Resim dosyası 2MB\'dan küçük olmalıdır');
      return;
    }
    
    setAvatarLoading(true);
    
    // Read the file and convert to data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageDataUrl = e.target.result;
      
      // In a real implementation, you would upload this to your server
      // For now, we'll just set it in the auth context which will handle localStorage
      updateAvatar(imageDataUrl);
      setAvatarLoading(false);
    };
    
    reader.onerror = () => {
      setAvatarError('Resim yüklenirken bir hata oluştu');
      setAvatarLoading(false);
    };
    
    reader.readAsDataURL(file);
  };

  // Remove the avatar
  const handleRemoveAvatar = () => {
    updateAvatar(null);
  };

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

  // Form input component for reusability
  const FormInput = ({
    id,
    name,
    label,
    type = 'text',
    formik,
    placeholder = '',
    icon = null
  }) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          className={`form-input ${icon ? 'pl-12' : ''} ${
            formik.touched[name] && formik.errors[name]
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
              : ''
          }`}
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
      </div>
      {formik.touched[name] && formik.errors[name] && (
        <p className="mt-1 text-sm text-red-600">{formik.errors[name]}</p>
      )}
    </div>
  );

  // Profile form content
  const ProfileForm = (
    <div className="px-1 py-2">
      {profileSuccess && (
        <Alert
          type="success"
          message="Profil bilgileriniz başarıyla güncellendi."
          className="mb-4 sm:mb-6"
          onClose={() => setProfileSuccess(false)}
        />
      )}

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 mb-6 md:mb-8 items-center md:items-start">
        {/* Avatar section - Centered on mobile */}
        <div className="w-full md:w-1/4 flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-primary-light flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden">
              {avatarLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner color="white" />
                </div>
              ) : avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userInitials
              )}
            </div>
            
            {/* Camera button to trigger file selector */}
            <button 
              className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 sm:p-2 shadow-md border border-gray-200"
              type="button"
              onClick={handleAvatarButtonClick}
              title="Profil fotoğrafı yükle"
            >
              <CameraIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            </button>
            
            {/* Remove avatar button (only shown when avatar exists) */}
            {avatar && (
              <button 
                className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200"
                type="button"
                onClick={handleRemoveAvatar}
                title="Profil fotoğrafını kaldır"
              >
                <XCircleIcon className="h-4 w-4 text-red-500" />
              </button>
            )}
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/png, image/jpeg, image/jpg, image/gif"
              onChange={handleFileChange}
            />
          </div>
          
          {/* Error message */}
          {avatarError && (
            <div className="text-red-500 text-xs text-center mb-2 max-w-[200px]">
              {avatarError}
            </div>
          )}
          
          <h3 className="text-base sm:text-lg font-medium text-gray-800 text-center">{user?.firstName} {user?.lastName}</h3>
          <p className="text-xs sm:text-sm text-gray-500 text-center">{user?.role || 'Kullanıcı'}</p>
          <p className="text-xs text-primary mt-1 text-center cursor-pointer hover:underline" onClick={handleAvatarButtonClick}>
            Profil fotoğrafını değiştir
          </p>
        </div>

        {/* Form section */}
        <div className="w-full md:w-3/4 mt-4 md:mt-0">
          <form onSubmit={profileFormik.handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <FormInput
                id="firstName"
                name="firstName"
                label="Ad"
                formik={profileFormik}
              />

              <FormInput
                id="lastName"
                name="lastName"
                label="Soyad"
                formik={profileFormik}
              />

              <div className="sm:col-span-2">
                <FormInput
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  formik={profileFormik}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto btn btn-primary"
                disabled={profileLoading || !profileFormik.isValid}
              >
                {profileLoading ? (
                  <div className="flex items-center justify-center">
                    <Spinner size="sm" color="white" className="mr-2" /> Güncelleniyor...
                  </div>
                ) : (
                  'Profili Güncelle'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Password form content
  const PasswordForm = (
    <div className="px-1 py-2">
      {passwordSuccess && (
        <Alert
          type="success"
          message="Şifreniz başarıyla değiştirildi."
          className="mb-4 sm:mb-6"
          onClose={() => setPasswordSuccess(false)}
        />
      )}

      <div className="w-full mx-auto">
        <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6 flex items-start">
          <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500 mt-0.5 mr-2 sm:mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1">Güvenlik İpucu</h4>
            <p className="text-xs sm:text-sm text-blue-700">
              Güçlü bir şifre oluşturmak için büyük harf, küçük harf, rakam ve özel karakter içeren en az 8 
              karakterlik bir şifre kullanın. Şifrenizi düzenli olarak değiştirmeyi unutmayın.
            </p>
          </div>
        </div>

        <form onSubmit={passwordFormik.handleSubmit} className="space-y-4 sm:space-y-5">
          <FormInput
            id="currentPassword"
            name="currentPassword"
            label="Mevcut Şifre"
            type="password"
            formik={passwordFormik}
          />

          <FormInput
            id="newPassword"
            name="newPassword"
            label="Yeni Şifre"
            type="password"
            formik={passwordFormik}
          />

          <FormInput
            id="confirmPassword"
            name="confirmPassword"
            label="Yeni Şifre (Tekrar)"
            type="password"
            formik={passwordFormik}
          />

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto btn btn-primary"
              disabled={passwordLoading || !passwordFormik.isValid}
            >
              {passwordLoading ? (
                <div className="flex items-center justify-center">
                  <Spinner size="sm" color="white" className="mr-2" /> Değiştiriliyor...
                </div>
              ) : (
                'Şifreyi Değiştir'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Tab config with icons
  const tabs = [
    {
      label: 'Profil Bilgileri',
      icon: <UserIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />,
      content: ProfileForm
    },
    {
      label: 'Şifre Değiştir',
      icon: <KeyIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />,
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

      <div className="mt-4 sm:mt-6 px-3 sm:px-0">
        <Card className="shadow-lg border border-gray-100">
          <Tabs tabs={tabs} />
        </Card>
      </div>
    </div>
  );
};

export default Profile;