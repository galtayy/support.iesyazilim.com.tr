import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import customerService from '../../services/customerService';

const CreateCustomer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Müşteri adı zorunludur'),
    contactEmail: Yup.string().email('Geçerli bir email adresi giriniz'),
    contactPhone: Yup.string().matches(
      /^(\+90|0)?\s*(\(\d{3}\)|\d{3})\s*\d{3}\s*\d{2}\s*\d{2}$/,
      'Geçerli bir telefon numarası giriniz (örn: 0555 123 45 67)'
    ).nullable()
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      name: '',
      address: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        
        // Create customer
        await customerService.createCustomer(values);
        
        // Show success message
        toast.success('Müşteri başarıyla oluşturuldu.');
        
        // Navigate to customer list
        navigate('/customers');
      } catch (err) {
        console.error('Error creating customer:', err);
        setError('Müşteri oluşturulurken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div>
      <PageHeader
        title="Yeni Müşteri"
        description="Yeni bir müşteri oluşturun"
        breadcrumbItems={[
          { label: 'Müşteriler', to: '/customers' },
          { label: 'Yeni Müşteri' }
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
                Müşteri Adı *
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
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Adres
              </label>
              <textarea
                id="address"
                name="address"
                rows={3}
                className="form-input mt-1"
                value={formik.values.address}
                onChange={formik.handleChange}
              />
            </div>

            <div>
              <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700">
                Yetkili Kişi
              </label>
              <input
                type="text"
                id="contactPerson"
                name="contactPerson"
                className="form-input mt-1"
                value={formik.values.contactPerson}
                onChange={formik.handleChange}
              />
            </div>

            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                className={`form-input mt-1 ${
                  formik.touched.contactEmail && formik.errors.contactEmail
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.contactEmail}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.contactEmail && formik.errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.contactEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                Telefon
              </label>
              <input
                type="text"
                id="contactPhone"
                name="contactPhone"
                className={`form-input mt-1 ${
                  formik.touched.contactPhone && formik.errors.contactPhone
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                placeholder="0555 123 45 67"
                value={formik.values.contactPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.contactPhone && formik.errors.contactPhone && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.contactPhone}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notlar
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="form-input mt-1"
                value={formik.values.notes}
                onChange={formik.handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/customers')}
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

export default CreateCustomer;