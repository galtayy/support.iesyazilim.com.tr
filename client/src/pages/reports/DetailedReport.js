import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import reportService from '../../services/reportService';
import customerService from '../../services/customerService';
import categoryService from '../../services/categoryService';
import userService from '../../services/userService';

const DetailedReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'), // First day of current month
    endDate: format(new Date(), 'yyyy-MM-dd'), // Today
    customerId: '',
    categoryId: '',
    supportStaffId: '',
    status: ''
  });

  // Load filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        
        // Get customers
        const customersResponse = await customerService.getCustomers();
        
        // Get categories
        const categoriesResponse = await categoryService.getCategories();
        
        // Get users
        const usersResponse = await userService.getUsers();
        
        setCustomers(customersResponse.data || []);
        setCategories(categoriesResponse.data || []);
        setUsers(usersResponse.data || []);
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setError('Filtre seçenekleri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search
  const handleSearch = async () => {
    try {
      setSearchLoading(true);
      setError(null);
      
      // Validate dates
      if (!filters.startDate || !filters.endDate) {
        setError('Başlangıç ve bitiş tarihleri gereklidir.');
        return;
      }
      
      // Get report
      const response = await reportService.getDetailedReport(filters);
      setReport(response.data || null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Rapor yüklenirken bir hata oluştu.');
      setReport(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // Format status
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Onay Bekliyor';
      case 'approved': return 'Onaylandı';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  return (
    <div>
      <PageHeader
        title="Detaylı Rapor"
        description="Tarih aralığı ve filtrelere göre detaylı servis kaydı raporu"
        breadcrumbItems={[
          { label: 'Raporlar', to: '/reports' },
          { label: 'Detaylı Rapor' }
        ]}
      />

      {/* Filter Card */}
      <Card className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Rapor Kriterleri</h3>
        
        {error && (
          <Alert 
            type="error" 
            message={error} 
            onClose={() => setError(null)} 
            className="mb-4" 
          />
        )}
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Başlangıç Tarihi *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              className="form-input mt-1"
              value={filters.startDate}
              onChange={handleFilterChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Bitiş Tarihi *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              className="form-input mt-1"
              value={filters.endDate}
              onChange={handleFilterChange}
              required
            />
          </div>
          
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
              Müşteri
            </label>
            <select
              id="customerId"
              name="customerId"
              className="form-select mt-1"
              value={filters.customerId}
              onChange={handleFilterChange}
            >
              <option value="">Tümü</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
              Kategori
            </label>
            <select
              id="categoryId"
              name="categoryId"
              className="form-select mt-1"
              value={filters.categoryId}
              onChange={handleFilterChange}
            >
              <option value="">Tümü</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="supportStaffId" className="block text-sm font-medium text-gray-700">
              Destek Personeli
            </label>
            <select
              id="supportStaffId"
              name="supportStaffId"
              className="form-select mt-1"
              value={filters.supportStaffId}
              onChange={handleFilterChange}
            >
              <option value="">Tümü</option>
              {users.filter(user => user.role === 'support' || user.role === 'admin').map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Durum
            </label>
            <select
              id="status"
              name="status"
              className="form-select mt-1"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Tümü</option>
              <option value="pending">Onay Bekliyor</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={searchLoading || !filters.startDate || !filters.endDate}
          >
            {searchLoading ? (
              <div className="flex items-center">
                <Spinner size="sm" color="white" className="mr-2" /> Rapor Oluşturuluyor...
              </div>
            ) : (
              'Raporu Oluştur'
            )}
          </button>
        </div>
      </Card>

      {/* Report Result */}
      {report && (
        <div className="mt-6 space-y-6">
          {/* Summary Card */}
          <Card title="Özet Bilgiler">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-500">Toplam Servis Kaydı</h3>
                <p className="mt-2 text-3xl font-semibold text-primary">
                  {report.summary?.totalTickets || 0}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-500">Toplam Destek Saati</h3>
                <p className="mt-2 text-3xl font-semibold text-primary">
                  {report.summary?.totalHours || 0}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-500">Tarih Aralığı</h3>
                <p className="mt-2 text-lg font-medium text-gray-900">
                  {format(new Date(report.period?.startDate), 'dd/MM/yyyy', { locale: tr })} - {' '}
                  {format(new Date(report.period?.endDate), 'dd/MM/yyyy', { locale: tr })}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-500">Durum Dağılımı</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {report.summary?.byStatus && Object.entries(report.summary.byStatus).map(([status, data]) => (
                    data.count > 0 && (
                      <div key={status} className="flex items-center">
                        <Badge status={status} label={`${getStatusLabel(status)}: ${data.count}`} />
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
            
            {/* Breakdown Stats */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* By Category */}
              <div>
                <h3 className="text-lg font-medium mb-3">Kategori Dağılımı</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kayıt
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Saat
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.summary?.byCategoryHours?.map(cat => (
                        <tr key={cat.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <div className="flex items-center">
                              <div 
                                className="h-3 w-3 rounded-full mr-2" 
                                style={{ backgroundColor: cat.color || '#3A7BD5' }}
                              ></div>
                              {cat.name}
                            </div>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                            {cat.count}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-sm">
                            {cat.hours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* By Customer */}
              <div>
                <h3 className="text-lg font-medium mb-3">Müşteri Dağılımı</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Müşteri
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kayıt
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Saat
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.summary?.byCustomerHours?.slice(0, 5).map(cust => (
                        <tr key={cust.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            {cust.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right text-sm">
                            {cust.count}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-right font-medium text-sm">
                            {cust.hours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>

          {/* Tickets List */}
          <Card title="Destek Kayıtları Listesi">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Müşteri
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Açıklama
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Süre
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.tickets?.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(ticket.startTime), 'dd/MM/yyyy', { locale: tr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.customer?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span 
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: `${ticket.category?.color}20`, 
                            color: ticket.category?.color 
                          }}
                        >
                          {ticket.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.supportStaff?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                        <div className="truncate">{ticket.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {ticket.hours} saat
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge status={ticket.status} label={getStatusLabel(ticket.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {report.tickets?.length === 0 && (
              <div className="py-6 text-center text-gray-500">
                Belirtilen kriterlere uygun servis kaydı bulunamadı.
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

export default DetailedReport;