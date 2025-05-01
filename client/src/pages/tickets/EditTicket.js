import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const EditTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  
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

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get ticket
        const ticketResponse = await ticketService.getTicket(id);
        
        // Get customers
        const customersResponse = await customerService.getActiveCustomers();
        
        // Get categories
        const categoriesResponse = await categoryService.getCategories();
        
        setTicket(ticketResponse.data);
        setCustomers(customersResponse.data || []);
        setCategories(categoriesResponse.data || []);
        
        // Initialize form with ticket data
        const ticketData = ticketResponse.data;
        
        // Format dates for form
        const startTime = format(new Date(ticketData.startTime), "yyyy-MM-dd'T'HH:mm");
        const endTime = format(new Date(ticketData.endTime), "yyyy-MM-dd'T'HH:mm");
        
        formik.setValues({
          customerId: ticketData.customerId,
          categoryId: ticketData.categoryId,
          description: ticketData.description,
          startTime,
          endTime,
          location: ticketData.location || ''
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      customerId: '',
      categoryId: '',
      description: '',
      startTime: '',
      endTime: '',
      location: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError(null);
        
        // Update ticket
        await ticketService.updateTicket(id, values);
        
        // Show success message
        toast.success('Destek kaydı başarıyla güncellendi.');
        
        // Navigate to ticket detail
        navigate(`/tickets/${id}`);
      } catch (err) {
        console.error('Error updating ticket:', err);
        setError('Destek kaydı güncellenirken bir hata oluştu.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Handle cancel
  const handleCancel = () => {
    navigate(`/tickets/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <Alert
        type="error"
        title="Hata"
        message="Destek kaydı bulunamadı."
        className="mt-6"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Servis Kaydını Düzenle"
        description="Destek kaydı bilgilerini güncelleyin"
        breadcrumbItems={[
          { label: 'Destek Kayıtları', to: '/tickets' },
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
                disabled={ticket.status !== 'pending'}
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
                disabled={ticket.status !== 'pending'}
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
                disabled={ticket.status !== 'pending'}
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
                disabled={ticket.status !== 'pending'}
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
                disabled={ticket.status !== 'pending'}
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
                disabled={ticket.status !== 'pending'}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
              )}
            </div>
          </div>

          {ticket.status !== 'pending' && (
            <Alert
              type="warning"
              title="Bu kayıt düzenlenemez"
              message="Onaylanmış veya reddedilmiş kayıtlar düzenlenemez."
              className="mb-6"
            />
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCancel}
            >
              İptal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !formik.isValid || ticket.status !== 'pending'}
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

export default EditTicket;