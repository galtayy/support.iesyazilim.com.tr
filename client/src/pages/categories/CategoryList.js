import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import categoryService from '../../services/categoryService';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Kategoriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle delete category
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleteLoading(true);
      await categoryService.deleteCategory(categoryToDelete.id);
      
      // Update state
      setCategories(categories.filter(c => c.id !== categoryToDelete.id));
      
      // Close modal
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
      // Show success message
      toast.success('Kategori başarıyla silindi.');
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error('Kategori silinirken bir hata oluştu.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Kategoriler"
        description="Destek kayıtları için kategori listesi ve yönetimi"
        breadcrumbItems={[{ label: 'Kategoriler' }]}
        actions={
          <Link to="/categories/create" className="btn btn-primary flex items-center w-full sm:w-auto justify-center">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Yeni Kategori
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
        ) : categories.length === 0 ? (
          <EmptyState
            title="Kategori bulunamadı"
            description="Henüz eklenmiş kategori bulunmuyor."
            actionText="Yeni Kategori"
            actionLink="/categories/create"
          />
        ) : (
          <>
            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori Adı
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
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
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="h-6 w-6 rounded" 
                            style={{ backgroundColor: category.color }}
                          ></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 line-clamp-2">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.active ? (
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
                          to={`/categories/${category.id}/edit`}
                          className="text-primary hover:text-primary/80 mr-4"
                        >
                          <PencilIcon className="h-5 w-5 inline" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(category)}
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
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div 
                          className="h-8 w-8 rounded mr-3 flex-shrink-0" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <div>
                          <h3 className="font-medium text-gray-900">{category.name}</h3>
                        </div>
                      </div>
                      <div>
                        {category.active ? (
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
                    
                    {category.description && (
                      <div className="mt-3 mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-gray-100">
                      <Link
                        to={`/categories/${category.id}/edit`}
                        className="btn btn-sm btn-outline flex-1 flex items-center justify-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" /> Düzenle
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(category)}
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
          setCategoryToDelete(null);
        }}
        title="Kategoriyi Sil"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setShowDeleteModal(false);
                setCategoryToDelete(null);
              }}
              disabled={deleteLoading}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-danger ml-3"
              onClick={handleDeleteCategory}
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
            <span className="font-medium">{categoryToDelete?.name}</span> kategorisini silmek istediğinizden emin misiniz?
          </p>
          <p className="mt-2 font-medium">Bu işlem geri alınamaz ve bu kategoriye ait tüm hizmet servis formları etkilenecektir.</p>
        </div>
      </Modal>
    </div>
  );
};

export default CategoryList;