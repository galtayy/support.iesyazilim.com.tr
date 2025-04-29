import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import ticketService from '../../services/ticketService';
import customerService from '../../services/customerService';
import categoryService from '../../services/categoryService';

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [filters, setFilters] = useState({
    customerId: '',
    categoryId: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get tickets with filters
        const ticketsResponse = await ticketService.getTickets({
          ...filters,
          page: currentPage,
          limit: 10
        });
        
        // Get customers for filter dropdown
        const customersResponse = await customerService.getActiveCustomers();
        
        // Get categories for filter dropdown
        const categoriesResponse = await categoryService.getCategories();
        
        setTickets(ticketsResponse.data.tickets || []);
        setTotalPages(ticketsResponse.data.totalPages || 1);
        setCustomers(customersResponse.data || []);
        setCategories(categoriesResponse.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, currentPage]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      customerId: '',
      categoryId: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  // Get status label
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
        title="Destek Kayıtları"
        description="Tüm destek kayıtlarını görüntüleyin ve yönetin"
        breadcrumbItems={[{ label: 'Destek Kayıtları' }]}
        actions={
          <Link to="/tickets/create" className="btn btn-primary flex items-center w-full sm:w-auto justify-center">
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Yeni Kayıt
          </Link>
        }
      />

      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          className="mb-4"
        />
      )}

      <Card className="mt-6">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <button
            type="button"
            className="flex items-center text-sm text-gray-600 hover:text-primary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="mr-2 h-5 w-5" />
            {showFilters ? 'Filtreleri Gizle' : 'Filtreleri Göster'}
          </button>
          
          {showFilters && (
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-primary"
              onClick={handleClearFilters}
            >
              Filtreleri Temizle
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <div>
              <label htmlFor="customerId" className="block text-sm font-medium text-gray-700">
                Müşteri
              </label>
              <select
                id="customerId"
                name="customerId"
                value={filters.customerId}
                onChange={handleFilterChange}
                className="form-select mt-1 w-full"
              >
                <option value="">Tümü</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
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
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="form-select mt-1 w-full"
              >
                <option value="">Tümü</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
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
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select mt-1 w-full"
              >
                <option value="">Tümü</option>
                <option value="pending">Onay Bekliyor</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-input mt-1 w-full"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                Bitiş Tarihi
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-input mt-1 w-full"
              />
            </div>
          </div>
        )}

        {/* Ticket List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title="Destek kaydı bulunamadı"
            description="Aradığınız kriterlere uygun destek kaydı bulunamadı."
            actionText="Yeni Destek Kaydı"
            actionLink="/tickets/create"
          />
        ) : (
          <>
            {/* Desktop Table - Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto">
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
                      Süre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => {
                    // Calculate duration
                    const startTime = new Date(ticket.startTime);
                    const endTime = new Date(ticket.endTime);
                    const durationHours = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);
                    
                    return (
                      <tr key={ticket.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(ticket.startTime), 'dd MMM yyyy', { locale: tr })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ticket.Customer?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${ticket.Category?.color}20`, 
                              color: ticket.Category?.color 
                            }}
                          >
                            {ticket.Category?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {durationHours} saat
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge status={ticket.status} label={getStatusLabel(ticket.status)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="text-primary hover:text-primary/80 mr-4"
                          >
                            Görüntüle
                          </Link>
                          <Link
                            to={`/tickets/${ticket.id}/edit`}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Düzenle
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards - Visible only on Mobile */}
            <div className="block md:hidden">
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  // Calculate duration
                  const startTime = new Date(ticket.startTime);
                  const endTime = new Date(ticket.endTime);
                  const durationHours = ((endTime - startTime) / (1000 * 60 * 60)).toFixed(1);
                  
                  return (
                    <div key={ticket.id} className="bg-white border rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">{ticket.Customer?.name}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(ticket.startTime), 'dd MMM yyyy', { locale: tr })}
                          </p>
                        </div>
                        <Badge status={ticket.status} label={getStatusLabel(ticket.status)} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 my-3">
                        <div>
                          <p className="text-xs text-gray-500">Kategori:</p>
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                            style={{ 
                              backgroundColor: `${ticket.Category?.color}20`, 
                              color: ticket.Category?.color 
                            }}
                          >
                            {ticket.Category?.name}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Süre:</p>
                          <p className="text-sm">{durationHours} saat</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-gray-100">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          className="btn btn-sm btn-outline flex-1"
                        >
                          Görüntüle
                        </Link>
                        <Link
                          to={`/tickets/${ticket.id}/edit`}
                          className="btn btn-sm btn-outline flex-1"
                        >
                          Düzenle
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 sm:px-6 gap-3">
                <div className="flex justify-between w-full sm:w-auto sm:hidden">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Önceki
                  </button>
                  <button
                    onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Sonraki
                  </button>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-center justify-between w-full gap-3">
                  <div>
                    <p className="text-sm text-gray-700 text-center sm:text-left">
                      Toplam <span className="font-medium">{tickets.length}</span> kayıt,{' '}
                      <span className="font-medium">{totalPages}</span> sayfa
                    </p>
                  </div>
                  <div className="overflow-x-auto max-w-full">
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        Önceki
                      </button>
                      {/* Limit shown page numbers for better mobile appearance */}
                      {[...Array(totalPages).keys()]
                        .filter(page => {
                          // Show first, last, current and adjacent pages
                          const pageNum = page + 1;
                          return pageNum === 1 || 
                                 pageNum === totalPages || 
                                 Math.abs(pageNum - currentPage) <= 1;
                        })
                        .reduce((acc, page, idx, arr) => {
                          // Add ellipsis between non-consecutive pages
                          const pageNum = page + 1;
                          if (idx > 0 && arr[idx-1] + 1 !== page) {
                            acc.push('ellipsis' + idx);
                          }
                          acc.push(pageNum);
                          return acc;
                        }, [])
                        .map(page => {
                          if (typeof page === 'string' && page.startsWith('ellipsis')) {
                            return (
                              <span
                                key={page}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`relative inline-flex items-center px-4 py-2 border ${
                                currentPage === page
                                  ? 'bg-primary/10 text-primary border-primary/20'
                                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                              } text-sm font-medium`}
                            >
                              {page}
                            </button>
                          );
                        })
                      }
                      <button
                        onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        Sonraki
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default TicketList;