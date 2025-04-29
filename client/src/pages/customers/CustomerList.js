import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import customerService from '../../services/customerService';

const CustomerList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await customerService.getCustomers();
        setCustomers(response.data || []);
      } catch (err) {
        console.error('Error fetching customers:', err);
        setError('Müşteriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Handle delete customer
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;

    try {
      setDeleteLoading(true);
      await customerService.deleteCustomer(customerToDelete.id);
      
      // Update state
      setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      
      // Close modal
      setShowDeleteModal(false);
      setCustomerToDelete(null);
      
      // Show success message
      toast.success('Müşteri başarıyla silindi.');
    } catch (err) {
      console.error('Error deleting customer:', err);
      toast.error('Müşteri silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Müşteriler"
        description="Müşteri listesi ve yönetimi"
        breadcrumbItems={[{ label: 'Müşteriler' }]}
        actions={
          <Link to="/customers/create" className="btn btn-primary flex items-center w-full sm:w-auto justify-center">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Yeni Müşteri
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
        ) : customers.length === 0 ? (
          <EmptyState
            title="Müşteri bulunamadı"
            description="Henüz eklenmiş müşteri bulunmuyor."
            actionText="Yeni Müşteri"
            actionLink="/customers/create"
          />
        ) : (
          <>
            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yetkili Kişi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İletişim
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
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.contactPerson || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{customer.contactEmail || '-'}</div>
                        <div className="text-sm text-gray-500">{customer.contactPhone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.active ? (
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
                        <Link
                          to={`/customers/${customer.id}/edit`}
                          className="text-primary hover:text-primary/80 mr-4"
                        >
                          <PencilIcon className="h-5 w-5 inline" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(customer)}
                          className="text-danger hover:text-danger/80"
                        >
                          <TrashIcon className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Visible only on Mobile */}
            <div className="block md:hidden">
              <div className="space-y-4">
                {customers.map((customer) => (
                  <div key={customer.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-gray-900">{customer.name}</h3>
                        {customer.contactPerson && (
                          <p className="text-sm text-gray-600 mt-1">{customer.contactPerson}</p>
                        )}
                      </div>
                      <div>
                        {customer.active ? (
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
                    
                    {(customer.contactEmail || customer.contactPhone) && (
                      <div className="mt-3 mb-4">
                        {customer.contactEmail && (
                          <div className="flex items-center text-sm text-gray-600 mb-1">
                            <span className="font-medium mr-2">Email:</span> {customer.contactEmail}
                          </div>
                        )}
                        {customer.contactPhone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <span className="font-medium mr-2">Telefon:</span> {customer.contactPhone}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-gray-100">
                      <Link
                        to={`/customers/${customer.id}/edit`}
                        className="btn btn-sm btn-outline flex-1 flex items-center justify-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" /> Düzenle
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(customer)}
                        className="btn btn-sm btn-danger flex-1 flex items-center justify-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" /> Sil
                      </button>
                    </div>
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
          setCustomerToDelete(null);
        }}
        title="Müşteriyi Sil"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowDeleteModal(false);
                setCustomerToDelete(null);
              }}
              disabled={deleteLoading}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-danger ml-3"
              onClick={handleDeleteCustomer}
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
            <span className="font-medium">{customerToDelete?.name}</span> müşterisini silmek istediğinizden emin misiniz?
          </p>
          <p className="mt-2 font-medium">Bu işlem geri alınamaz ve müşteriye ait tüm destek kayıtları da silinecektir.</p>
        </div>
      </Modal>
    </div>
  );
};

export default CustomerList;