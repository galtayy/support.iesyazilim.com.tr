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
  
  // Default colors from corporate identity
  const colorOptions = [
    { name: 'Ana Mavi', value: '#3A7BD5' },
    { name: 'Yeşil', value: '#61C28C' },
    { name: 'Turuncu', value: '#FFA84B' },
    { name: 'Kırmızı', value: '#E05A5A' }
  ];
  
  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Kategori adı zorunludur'),
    color: Yup.string()
      .matches(/^#([0-9A-F]{6})$/i, 'Geçerli bir hex renk kodu giriniz (#RRGGBB)')
      .required('Renk seçimi zorunludur')
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
  }, [id]);

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
              <div className="mt-2 flex flex-wrap gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    className={`p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                      formik.values.color === color.value
                        ? 'ring-2 ring-offset-2 ring-primary'
                        : ''
                    }`}
                    onClick={() => formik.setFieldValue('color', color.value)}
                  >
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    ></div>
                  </button>
                ))}
                
                <div className="flex items-center">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formik.values.color}
                    onChange={formik.handleChange}
                    className="h-8 w-8 rounded-full cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {formik.values.color}
                  </span>
                </div>
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
                Pasif kategoriler, yeni destek kaydı oluşturmada görüntülenmez.
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