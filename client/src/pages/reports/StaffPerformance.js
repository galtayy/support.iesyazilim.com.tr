import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import reportService from '../../services/reportService';
import userService from '../../services/userService';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const StaffPerformance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: format(new Date(new Date().setDate(1)), 'yyyy-MM-dd'), // First day of current month
    endDate: format(new Date(), 'yyyy-MM-dd'), // Today
    staffId: '' // All staff
  });

  // Load staff list
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        
        // Get users
        const usersResponse = await userService.getUsers();
        
        // Filter only support staff and active users
        const supportStaff = usersResponse.data?.filter(user => 
          (user.role === 'support' || user.role === 'admin') && user.active
        ) || [];
        
        setUsers(supportStaff);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError('Personel listesi yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
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
      const response = await reportService.getStaffPerformance(filters);
      setReport(response.data || null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError('Rapor yüklenirken bir hata oluştu.');
      setReport(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // Prepare chart data for staff hours
  const getStaffHoursChartData = () => {
    if (!report || !report.staffPerformance || report.staffPerformance.length === 0) {
      return null;
    }

    // Sort staff by total hours
    const sortedStaff = [...report.staffPerformance].sort((a, b) => b.totalHours - a.totalHours);
    
    const labels = sortedStaff.map(staff => staff.name);
    const data = sortedStaff.map(staff => staff.totalHours);

    return {
      labels,
      datasets: [
        {
          label: 'Toplam Saat',
          data,
          backgroundColor: '#3A7BD5',
          borderColor: '#3A7BD5',
          borderWidth: 1
        }
      ]
    };
  };

  // Prepare chart data for average hours per day
  const getAvgHoursChartData = () => {
    if (!report || !report.staffPerformance || report.staffPerformance.length === 0) {
      return null;
    }

    // Sort staff by average hours per day
    const sortedStaff = [...report.staffPerformance].sort((a, b) => b.avgHoursPerDay - a.avgHoursPerDay);
    
    const labels = sortedStaff.map(staff => staff.name);
    const data = sortedStaff.map(staff => staff.avgHoursPerDay);

    return {
      labels,
      datasets: [
        {
          label: 'Günlük Ortalama Saat',
          data,
          backgroundColor: '#61C28C',
          borderColor: '#61C28C',
          borderWidth: 1
        }
      ]
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} saat`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Saat'
        }
      }
    }
  };

  return (
    <div>
      <PageHeader
        title="Personel Performans Raporu"
        description="Destek personeli performans ve faaliyet raporu"
        breadcrumbItems={[
          { label: 'Raporlar', to: '/reports' },
          { label: 'Personel Performansı' }
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
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            <label htmlFor="staffId" className="block text-sm font-medium text-gray-700">
              Personel
            </label>
            <select
              id="staffId"
              name="staffId"
              className="form-select mt-1"
              value={filters.staffId}
              onChange={handleFilterChange}
            >
              <option value="">Tüm Personel</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
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
                <h3 className="text-sm font-medium text-gray-500">Personel Sayısı</h3>
                <p className="mt-2 text-3xl font-semibold text-primary">
                  {report.overall?.totalStaff || 0}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-500">Toplam Kayıt Sayısı</h3>
                <p className="mt-2 text-3xl font-semibold text-primary">
                  {report.overall?.totalTickets || 0}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-500">Toplam Destek Saati</h3>
                <p className="mt-2 text-3xl font-semibold text-primary">
                  {report.overall?.totalHours || 0}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-500">Tarih Aralığı</h3>
                <p className="mt-2 text-lg font-medium text-gray-900">
                  {format(new Date(report.period?.startDate), 'dd/MM/yyyy', { locale: tr })} - {' '}
                  {format(new Date(report.period?.endDate), 'dd/MM/yyyy', { locale: tr })}
                  <span className="block text-sm text-gray-500">
                    ({report.period?.totalDays || 0} gün)
                  </span>
                </p>
              </div>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Total Hours Chart */}
            <Card title="Toplam Destek Saati">
              <div className="h-80">
                {getStaffHoursChartData() ? (
                  <Bar data={getStaffHoursChartData()} options={chartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">Veri bulunamadı</p>
                  </div>
                )}
              </div>
            </Card>
            
            {/* Average Hours Chart */}
            <Card title="Günlük Ortalama Saat">
              <div className="h-80">
                {getAvgHoursChartData() ? (
                  <Bar data={getAvgHoursChartData()} options={chartOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">Veri bulunamadı</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Staff Performance Table */}
          <Card title="Personel Performans Detayları">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personel
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kayıt Sayısı
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Toplam Saat
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gün. Ort. Kayıt
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gün. Ort. Saat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {report.staffPerformance?.sort((a, b) => b.totalHours - a.totalHours).map(staff => (
                    <tr key={staff.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {staff.totalTickets}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {staff.totalHours}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {staff.avgTicketsPerDay}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                        {staff.avgHoursPerDay}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Category Distribution for Each Staff */}
          <Card title="Kategori Dağılımı">
            <div className="space-y-8">
              {report.staffPerformance?.map(staff => (
                <div key={staff.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{staff.name}</h3>
                  
                  {staff.categoryBreakdown?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kategori
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Kayıt Sayısı
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Toplam Saat
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Oran (%)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {staff.categoryBreakdown.sort((a, b) => b.hours - a.hours).map(cat => (
                            <tr key={cat.id}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                {cat.name}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-500">
                                {cat.ticketCount}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                                {cat.hours}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-right text-sm text-gray-500">
                                {((cat.hours / staff.totalHours) * 100).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Veri bulunamadı</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffPerformance;