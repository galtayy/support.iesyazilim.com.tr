import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
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
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  // İş açıklamaları için state
  const [workItems, setWorkItems] = useState([{ id: 1, text: '', checked: true }]);
  const [nextWorkItemId, setNextWorkItemId] = useState(2);

  // Form validation schema
  const validationSchema = Yup.object({
    customerId: Yup.string().required('Müşteri seçimi zorunludur'),
    categoryId: Yup.string().required('Kategori seçimi zorunludur'),
    subject: Yup.string().required('İş konusu zorunludur').max(100, 'İş konusu en fazla 100 karakter olabilir'),
    description: Yup.string().test(
      'at-least-one-work-item',
      'En az bir iş açıklaması eklenmelidir',
      function() {
        // workItems state'inde en az bir aktif ve içeriği olan iş var mı kontrol et
        const hasValidWorkItem = workItems.some(item => item.checked && item.text.trim() !== '');
        return hasValidWorkItem;
      }
    ),
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
      subject: '',
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
        
        // İşaretli ve içeriği olan tüm iş öğelerini birleştir
        const formattedDescription = workItems
          .filter(item => item.checked && item.text.trim() !== '')
          .map((item, index) => `#${index + 1}: ${item.text.trim()}`)
          .join('\n\n');
        
        // Description alanını güncelle
        values.description = formattedDescription;
        
        // Create ticket
        const response = await ticketService.createTicket(values);
        const ticketId = response.data.id;
        
        // Upload image if selected
        if (selectedFile && ticketId) {
          await uploadImage(ticketId);
        }
        
        // Show success message
        toast.success('Hizmet servis formu başarıyla oluşturuldu.');
        
        // Navigate to ticket detail
        navigate(`/tickets/${ticketId}`);
      } catch (err) {
        console.error('Error creating ticket:', err);
        setError('Hizmet servis formu oluşturulurken bir hata oluştu.');
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

  // Get current location
  const getLocation = useCallback(async () => {
    // Clear previous errors
    setLocationError(null);
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum hizmetini desteklemiyor.');
      setLocationLoading(false);
      return;
    }
    
    try {
      // Get current position
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Create Google Maps short URL
          const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
          
          // Update form value
          formik.setFieldValue('location', mapsUrl);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('Konum izni reddedildi.');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Konum bilgisi mevcut değil.');
              break;
            case error.TIMEOUT:
              setLocationError('Konum alınırken zaman aşımı oluştu.');
              break;
            default:
              setLocationError('Konum alınırken bir hata oluştu.');
              break;
          }
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } catch (err) {
      console.error('Location error:', err);
      setLocationError('Konum alınırken bir hata oluştu.');
      setLocationLoading(false);
    }
  }, [formik]);

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

  // İş açıklaması ekleme
  const addWorkItem = () => {
    setWorkItems([...workItems, { id: nextWorkItemId, text: '', checked: true }]);
    setNextWorkItemId(nextWorkItemId + 1);
  };

  // İş açıklaması silme
  const removeWorkItem = (id) => {
    setWorkItems(workItems.filter(item => item.id !== id));
    formik.validateForm(); // Formun doğrulamasını tetikle
  };

  // Checkbox değişimini izleme
  const handleCheckboxChange = (id) => {
    setWorkItems(workItems.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
    formik.validateForm(); // Formun doğrulamasını tetikle
  };

  // İş metni değişimini izleme
  const handleWorkItemChange = (id, value) => {
    setWorkItems(workItems.map(item => 
      item.id === id ? { ...item, text: value } : item
    ));
    
    // description alanını güncelle - aktif olan işler için birleştirilmiş metin
    const combinedDescription = workItems
      .filter(item => item.checked)
      .map(item => item.id === id ? value : item.text)
      .filter(text => text.trim() !== '')
      .join('\n\n');
      
    formik.setFieldValue('description', combinedDescription);
  };

  return (
    <div>
      <PageHeader
        title="Yeni Hizmet Servis Formu"
        description="Yeni bir hizmet servis formu oluşturun"
        breadcrumbItems={[
          { label: 'Servis Kayıtları', to: '/tickets' },
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
              <div className="flex mt-1">
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input flex-grow"
                  value={formik.values.location}
                  onChange={formik.handleChange}
                />
                <button
                  type="button"
                  className="ml-2 btn btn-outline btn-sm flex items-center"
                  onClick={getLocation}
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Konum Alınıyor...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Konumu Al
                    </>
                  )}
                </button>
              </div>
              {locationError && (
                <p className="mt-1 text-sm text-red-600">{locationError}</p>
              )}
              {formik.values.location && formik.values.location.includes('https://maps.google.com') && (
                <div className="mt-2">
                  <a
                    href={formik.values.location}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Google Maps'te Aç
                  </a>
                </div>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                İş Konusu *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className={`form-input mt-1 ${
                  formik.touched.subject && formik.errors.subject
                    ? 'border-red-300 focus:ring-red-500'
                    : ''
                }`}
                value={formik.values.subject}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="İşin kısa konusu veya başlığı"
              />
              {formik.touched.subject && formik.errors.subject && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.subject}</p>
              )}
            </div>
            
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  İş Açıklamaları *
                </label>
                <button 
                  type="button" 
                  onClick={addWorkItem}
                  className="text-primary hover:text-primary-dark flex items-center text-sm font-medium"
                >
                  <PlusIcon className="h-4 w-4 mr-1" /> Yeni İş Ekle
                </button>
              </div>
              
              <div className="space-y-3 mt-2">
                {workItems.map((item) => (
                  <div key={item.id} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-md">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleCheckboxChange(item.id)}
                      className="form-checkbox mt-1.5 h-4 w-4 text-primary rounded"
                    />
                    <div className="flex-grow">
                      <textarea
                        rows={2}
                        placeholder="İş detayını girin"
                        value={item.text}
                        onChange={(e) => handleWorkItemChange(item.id, e.target.value)}
                        disabled={!item.checked}
                        className={`form-input w-full ${!item.checked ? 'bg-gray-100 text-gray-500' : ''}`}
                      />
                    </div>
                    {workItems.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeWorkItem(item.id)}
                        className="text-red-500 hover:text-red-700 focus:outline-none mt-1"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <input 
                type="hidden" 
                name="description" 
                value={formik.values.description} 
              />
              
              {formik.touched.description && formik.errors.description && (
                <p className="mt-2 text-sm text-red-600">{formik.errors.description}</p>
              )}
              
              <p className="mt-2 text-xs text-gray-500">
                * Checkbox işaretlendiğinde metin alanı aktif olur. İşaretlenen tüm işler servis formuna eklenecektir.
              </p>
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