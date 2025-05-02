import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import categoryService from '../../services/categoryService';

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState(null);
  const [error, setError] = useState(null);
  
  // 10 distinct colors palette
  const colorOptions = [
    { name: 'Ana Mavi', value: '#3A7BD5' },
    { name: 'Yeşil', value: '#10B981' },
    { name: 'Turuncu', value: '#F97316' },
    { name: 'Kırmızı', value: '#EF4444' },
    { name: 'Mor', value: '#8B5CF6' },
    { name: 'Pembe', value: '#EC4899' },
    { name: 'Sarı', value: '#FBBF24' },
    { name: 'Lacivert', value: '#1E40AF' },
    { name: 'Kahverengi', value: '#92400E' },
    { name: 'Turkuaz', value: '#06B6D4' }
  ];
  
  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Kategori adı zorunludur'),
    color: Yup.string()
      .matches(/^#([0-9A-F]{6})$/i, 'Geçerli bir hex renk kodu giriniz (#RRGGBB)')
      .required('Renk seçimi zorunludur')
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      color: '#3A7BD5',
      active: true
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Update category
        await categoryService.updateCategory(id, values);
        
        // Show success message
        toast.success('Kategori başarıyla güncellendi.');
        
        // Navigate to category list
        navigate('/categories');
      } catch (err) {
        console.error('Error updating category:', err);
        setError('Kategori güncellenirken bir hata oluştu.');
      } finally {
        setSubmitting(false);
      }
    }
  });
  
  // Load category data
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await categoryService.getCategory(id);
        setCategory(response.data);
        
        // Initialize form with category data
        formik.setValues({
          name: response.data.name,
          description: response.data.description || '',
          color: response.data.color,
          active: response.data.active
        });
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Kategori bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!category && !loading) {
    return (
      <Alert
        type="error"
        title="Hata"
        message="Kategori bulunamadı."
        className="mt-6"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Kategori Düzenle"
        description="Kategori bilgilerini güncelleyin"
        breadcrumbItems={[
          { label: 'Kategoriler', to: '/categories' },
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

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Kategori Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className={`form-input mt-1 ${
                  formik.touched.name && formik.errors.name
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.name && formik.errors.name && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Açıklama
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="form-input mt-1"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Renk *
              </label>
              <div className="mt-2 grid grid-cols-5 gap-4">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className="relative focus:outline-none"
                    onClick={() => formik.setFieldValue('color', color.value)}
                  >
                    <div
                      className={`relative h-10 w-10 rounded-full mx-auto transition-all duration-200 border-2 ${
                        formik.values.color === color.value 
                          ? 'border-gray-700' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {formik.values.color === color.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-6 h-6">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {formik.touched.color && formik.errors.color && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.color}</p>
              )}
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
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Aktif
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pasif kategoriler, yeni hizmet servis formu oluşturmada görüntülenmez.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/categories')}
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

export default EditCategory;