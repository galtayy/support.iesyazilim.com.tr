import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import reportService from '../../services/reportService';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MonthlySummary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-indexed

  // Available years for selection
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  
  // Month names
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  // Load report data
  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await reportService.getMonthlySummary(selectedYear, selectedMonth);
        setReport(response.data || null);
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Rapor yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [selectedYear, selectedMonth]);

  // Prepare chart data for categories
  const getCategoryChartData = () => {
    if (!report || !report.categorySummary || report.categorySummary.length === 0) {
      return null;
    }

    const labels = report.categorySummary.map(cat => cat.name);
    const data = report.categorySummary.map(cat => cat.hours);
    const backgroundColor = report.categorySummary.map(cat => cat.color || '#3A7BD5');

    return {
      labels,
      datasets: [
        {
          label: 'Saat',
          data,
          backgroundColor,
          borderWidth: 1
        }
      ]
    };
  };

  // Prepare chart data for customers
  const getCustomerChartData = () => {
    if (!report || !report.customerSummary || report.customerSummary.length === 0) {
      return null;
    }

    // Sort by hours descending
    const sortedCustomers = [...report.customerSummary].sort((a, b) => b.hours - a.hours);
    
    // Take top 10 customers
    const topCustomers = sortedCustomers.slice(0, 10);
    
    const labels = topCustomers.map(cust => cust.name);
    const data = topCustomers.map(cust => cust.hours);

    return {
      labels,
      datasets: [
        {
          label: 'Saat',
          data,
          backgroundColor: '#3A7BD5',
          borderColor: '#3A7BD5',
          borderWidth: 1
        }
      ]
    };
  };

  // Prepare chart data for staff
  const getStaffChartData = () => {
    if (!report || !report.staffSummary || report.staffSummary.length === 0) {
      return null;
    }

    const labels = report.staffSummary.map(staff => staff.name);
    const data = report.staffSummary.map(staff => staff.hours);

    return {
      labels,
      datasets: [
        {
          label: 'Saat',
          data,
          backgroundColor: '#61C28C',
          borderColor: '#61C28C',
          borderWidth: 1
        }
      ]
    };
  };

  // Bar chart options
  const barOptions = {
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

  // Pie chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value} saat (${percentage}%)`;
          }
        }
      }
    }
  };

  // Handle month change
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  // Handle year change
  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  return (
    <div>
      <PageHeader
        title="Aylık Özet Raporu"
        description="Aylık destek faaliyetlerinin özet raporu"
        breadcrumbItems={[
          { label: 'Raporlar', to: '/reports' },
          { label: 'Aylık Özet' }
        ]}
      />

      {/* Period Selector */}
      <Card className="mt-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">
              Ay
            </label>
            <select
              id="month"
              name="month"
              className="form-select mt-1"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              <option value="">Tüm Yıl</option>
              {monthNames.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Yıl
            </label>
            <select
              id="year"
              name="year"
              className="form-select mt-1"
              value={selectedYear}
              onChange={handleYearChange}
            >
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <Alert type="error" message={error} className="mt-6" />
      ) : report ? (
        <div className="mt-6 space-y-6">
          {/* Summary Card */}
          <Card title="Özet Bilgiler">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-500">Toplam Destek Kaydı</h3>
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
                <h3 className="text-sm font-medium text-gray-500">Dönem</h3>
                <p className="mt-2 text-lg font-medium text-gray-900">
                  {report.period?.month 
                    ? `${monthNames[report.period.month - 1]} ${report.period.year}` 
                    : `${report.period.year} Yılı`}
                </p>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-500">Rapor Tarihi</h3>
                <p className="mt-2 text-lg font-medium text-gray-900">
                  {new Date().toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </Card>

          {/* Category Distribution */}
          <Card title="Kategori Dağılımı">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="h-80">
                {getCategoryChartData() ? (
                  <Pie data={getCategoryChartData()} options={pieOptions} />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-gray-500">Veri bulunamadı</p>
                  </div>
                )}
              </div>
              <div>
                <h3 className="mb-4 text-lg font-medium">Kategori Detayları</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kategori
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kayıt Sayısı
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toplam Saat
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.categorySummary?.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div 
                                className="h-4 w-4 rounded mr-2" 
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span className="text-sm text-gray-900">{category.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {category.ticketCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                            {category.hours}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Customers */}
          <Card title="Müşteri Dağılımı">
            <div className="h-80">
              {getCustomerChartData() ? (
                <Bar data={getCustomerChartData()} options={barOptions} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">Veri bulunamadı</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-medium">Müşteri Detayları</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Müşteri
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kayıt Sayısı
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Toplam Saat
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.customerSummary?.sort((a, b) => b.hours - a.hours).map((customer) => (
                      <tr key={customer.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {customer.ticketCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                          {customer.hours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>

          {/* Staff Performance */}
          <Card title="Personel Performansı">
            <div className="h-80">
              {getStaffChartData() ? (
                <Bar data={getStaffChartData()} options={barOptions} />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-gray-500">Veri bulunamadı</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-medium">Personel Detayları</h3>
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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {report.staffSummary?.sort((a, b) => b.hours - a.hours).map((staff) => (
                      <tr key={staff.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {staff.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                          {staff.ticketCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 font-medium">
                          {staff.hours}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="mt-6">
          <Alert type="info" message="Seçilen dönem için veri bulunamadı." />
        </div>
      )}
    </div>
  );
};

export default MonthlySummary;