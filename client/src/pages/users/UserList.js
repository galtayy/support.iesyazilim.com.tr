import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon, KeyIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import userService from '../../services/userService';

const UserList = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Load users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getUsers();
        setUsers(response.data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Kullanıcılar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle delete user
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setDeleteLoading(true);
      await userService.deleteUser(userToDelete.id);
      
      // Update state
      setUsers(users.filter(u => u.id !== userToDelete.id));
      
      // Close modal
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Show success message
      toast.success('Kullanıcı başarıyla silindi.');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Kullanıcı silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle reset password
  const handleResetPasswordClick = (user) => {
    setUserToResetPassword(user);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

  const handleResetPassword = async () => {
    if (!userToResetPassword || !newPassword) return;

    try {
      setResetLoading(true);
      await userService.resetPassword(userToResetPassword.id, newPassword);
      
      // Close modal
      setShowResetPasswordModal(false);
      setUserToResetPassword(null);
      setNewPassword('');
      
      // Show success message
      toast.success('Kullanıcı şifresi başarıyla sıfırlandı.');
    } catch (err) {
      console.error('Error resetting password:', err);
      toast.error('Şifre sıfırlanırken bir hata oluştu.');
    } finally {
      setResetLoading(false);
    }
  };

  // Generate random password
  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
  };

  // Role label
  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Yönetici';
      case 'support': return 'Destek Personeli';
      default: return role;
    }
  };

  return (
    <div>
      <PageHeader
        title="Kullanıcılar"
        description="Sistem kullanıcıları listesi ve yönetimi"
        breadcrumbItems={[{ label: 'Kullanıcılar' }]}
        actions={
          <Link to="/users/create" className="btn btn-primary flex items-center w-full sm:w-auto justify-center">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Yeni Kullanıcı
          </Link>
        }
      />

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      <Card className="mt-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="Kullanıcı bulunamadı"
            description="Henüz eklenmiş kullanıcı bulunmuyor."
            actionText="Yeni Kullanıcı"
            actionLink="/users/create"
          />
        ) : (
          <>
            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ad Soyad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <span className="text-sm font-medium">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          customClass={`${
                            user.role === 'admin' 
                              ? 'bg-primary/10 text-primary' 
                              : 'bg-success/10 text-success'
                          }`} 
                          label={getRoleLabel(user.role)} 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.active ? (
                          <Badge 
                            customClass="bg-green-100 text-green-800" 
                            label="Aktif" 
                          />
                        ) : (
                          <Badge 
                            customClass="bg-gray-100 text-gray-800" 
                            label="Pasif" 
                          />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {/* Don't show actions for current user */}
                        {user.id !== currentUser.id && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleResetPasswordClick(user)}
                              className="text-warning hover:text-warning/80 mr-3"
                            title="Şifre Sıfırla"
                          >
                            <KeyIcon className="h-5 w-5 inline" />
                          </button>
                          <Link
                            to={`/users/${user.id}/edit`}
                            className="text-primary hover:text-primary/80 mr-3"
                            title="Düzenle"
                          >
                            <PencilIcon className="h-5 w-5 inline" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(user)}
                            className="text-danger hover:text-danger/80"
                            title="Sil"
                          >
                            <TrashIcon className="h-5 w-5 inline" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>

            {/* Mobile Cards - Visible only on Mobile */}
            <div className="block md:hidden">
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex items-start">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mr-3 flex-shrink-0">
                        <span className="text-lg font-medium">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </h3>
                          <div className="flex space-x-1">
                            <Badge 
                              customClass={`${
                                user.role === 'admin' 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-success/10 text-success'
                              }`} 
                              label={getRoleLabel(user.role)} 
                            />
                            
                            {user.active ? (
                              <Badge 
                                customClass="bg-green-100 text-green-800" 
                                label="Aktif" 
                              />
                            ) : (
                              <Badge 
                                customClass="bg-gray-100 text-gray-800" 
                                label="Pasif" 
                              />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{user.email}</p>
                      </div>
                    </div>
                    
                    {/* Don't show actions for current user */}
                    {user.id !== currentUser.id && (
                      <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleResetPasswordClick(user)}
                          className="btn btn-sm btn-warning flex-1 flex items-center justify-center"
                        >
                          <KeyIcon className="h-4 w-4 mr-1" /> Şifre Sıfırla
                        </button>
                        <Link
                          to={`/users/${user.id}/edit`}
                          className="btn btn-sm btn-outline flex-1 flex items-center justify-center"
                        >
                          <PencilIcon className="h-4 w-4 mr-1" /> Düzenle
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(user)}
                          className="btn btn-sm btn-danger flex-1 flex items-center justify-center"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" /> Sil
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        title="Kullanıcıyı Sil"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowDeleteModal(false);
                setUserToDelete(null);
              }}
              disabled={deleteLoading}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-danger ml-3"
              onClick={handleDeleteUser}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <div className="flex items-center">
                  <Spinner size="sm" color="white" className="mr-2" /> Siliniyor...
                </div>
              ) : (
                'Sil'
              )}
            </button>
          </>
        }
      >
        <div className="text-gray-600">
          <p>
            <span className="font-medium">{userToDelete?.firstName} {userToDelete?.lastName}</span> kullanıcısını silmek istediğinizden emin misiniz?
          </p>
          <p className="mt-2 font-medium">Bu işlem geri alınamaz ve kullanıcıya ait tüm veriler silinecektir.</p>
        </div>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        open={showResetPasswordModal}
        onClose={() => {
          setShowResetPasswordModal(false);
          setUserToResetPassword(null);
          setNewPassword('');
        }}
        title="Şifre Sıfırla"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowResetPasswordModal(false);
                setUserToResetPassword(null);
                setNewPassword('');
              }}
              disabled={resetLoading}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-primary ml-3"
              onClick={handleResetPassword}
              disabled={resetLoading || !newPassword}
            >
              {resetLoading ? (
                <div className="flex items-center">
                  <Spinner size="sm" color="white" className="mr-2" /> Sıfırlanıyor...
                </div>
              ) : (
                'Şifreyi Sıfırla'
              )}
            </button>
          </>
        }
      >
        <div className="text-gray-600">
          <p>
            <span className="font-medium">{userToResetPassword?.firstName} {userToResetPassword?.lastName}</span> kullanıcısının şifresini sıfırlamak üzeresiniz.
          </p>
          
          <div className="mt-4">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Yeni Şifre
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="newPassword"
                className="form-input flex-1 rounded-none rounded-l-md"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 hover:bg-gray-100"
                onClick={generateRandomPassword}
              >
                Rastgele
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <Alert
              type="warning"
              message="Şifre sıfırlandıktan sonra kullanıcı bu şifre ile giriş yapabilecektir. Lütfen güvenli bir şifre kullanın."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;