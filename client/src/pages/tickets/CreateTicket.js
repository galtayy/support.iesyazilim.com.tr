import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import ticketService from '../../services/ticketService';
import customerService from '../../services/customerService';
import categoryService from '../../services/categoryService';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form validation schema
  const validationSchema = Yup.object({
    customerId: Yup.string().required('Müşteri seçimi zorunludur'),
    categoryId: Yup.string().required('Kategori seçimi zorunludur'),
    description: Yup.string().required('İş açıklaması zorunludur'),
    startTime: Yup.date().required('Başlangıç saati zorunludur'),
    endTime: Yup.date()
      .required('Bitiş saati zorunludur')
      .test('is-greater', 'Bitiş saati başlangıç saatinden sonra olmalıdır', function (value) {
        const { startTime } = this.parent;
        return !startTime || !value || new Date(value) > new Date(startTime);
      }),
    location: Yup.string()
  });

  // Load customers and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get active customers
        const customersResponse = await customerService.getActiveCustomers();
        
        // Get categories
        const categoriesResponse = await categoryService.getCategories();
        
        setCustomers(customersResponse.data || []);
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      }
    };

    fetchData();
  }, []);

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      customerId: '',
      categoryId: '',
      description: '',
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      location: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Create ticket
        const response = await ticketService.createTicket(values);
        const ticketId = response.data.id;
        
        // Upload image if selected
        if (selectedFile && ticketId) {
          await uploadImage(ticketId);
        }
        
        // Show success message
        toast.success('Destek kaydı başarıyla oluşturuldu.');
        
        // Navigate to ticket detail
        navigate(`/tickets/${ticketId}`);
      } catch (err) {
        console.error('Error creating ticket:', err);
        setError('Destek kaydı oluşturulurken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
  });

  // Handle file change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Upload image
  const uploadImage = async (ticketId) => {
    if (!selectedFile) return;

    try {
      setUploadLoading(true);
      
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      await ticketService.uploadImage(ticketId, formData);
      
      toast.success('Resim başarıyla yüklendi.');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Resim yüklenirken bir hata oluştu.');
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Yeni Destek Kaydı"
        description="Yeni bir destek kaydı oluşturun"
        breadcrumbItems={[
          { label: 'Destek Kayıtları', to: '/tickets' },
          { label: 'Yeni Kayıt' }
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
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                Müşteri *
              </label>
              <select
                id="customerId"
                name="customerId"
                className={`form-select mt-1 ${
                  formik.touched.customerId && formik.errors.customerId
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.customerId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Müşteri Seçin</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {formik.touched.customerId && formik.errors.customerId && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.customerId}</p>
              )}
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
                Kategori *
              </label>
              <select
                id="categoryId"
                name="categoryId"
                className={`form-select mt-1 ${
                  formik.touched.categoryId && formik.errors.categoryId
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.categoryId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                <option value="">Kategori Seçin</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {formik.touched.categoryId && formik.errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.categoryId}</p>
              )}
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Başlangıç Saati *
              </label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                className={`form-input mt-1 ${
                  formik.touched.startTime && formik.errors.startTime
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.startTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.startTime && formik.errors.startTime && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.startTime}</p>
              )}
            </div>

            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                Bitiş Saati *
              </label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                className={`form-input mt-1 ${
                  formik.touched.endTime && formik.errors.endTime
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.endTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.endTime && formik.errors.endTime && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.endTime}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Konum
              </label>
              <input
                type="text"
                id="location"
                name="location"
                className="form-input mt-1"
                value={formik.values.location}
                onChange={formik.handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                İş Açıklaması *
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className={`form-input mt-1 ${
                  formik.touched.description && formik.errors.description
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Fotoğraf (Opsiyonel)
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-primary/10 file:text-primary
                    hover:file:bg-primary/20"
                />
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-500">
                  Seçilen dosya: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/tickets')}
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

export default CreateTicket;