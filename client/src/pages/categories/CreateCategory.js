import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import categoryService from '../../services/categoryService';

const CreateCategory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      color: '#3A7BD5', // Default primary color
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Create category
        await categoryService.createCategory(values);
        
        // Show success message
        toast.success('Kategori başarıyla oluşturuldu.');
        
        // Navigate to category list
        navigate('/categories');
      } catch (err) {
        console.error('Error creating category:', err);
        setError('Kategori oluşturulurken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div>
      <PageHeader
        title="Yeni Kategori"
        description="Yeni bir kategori oluşturun"
        breadcrumbItems={[
          { label: 'Kategoriler', to: '/categories' },
          { label: 'Yeni Kategori' }
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

export default CreateCategory;