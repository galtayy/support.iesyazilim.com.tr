import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  DocumentPlusIcon, 
  ChartBarIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import ticketService from '../services/ticketService';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get recent tickets
        const response = await ticketService.getTickets({
          limit: 5,
          page: 1
        });
        
        const tickets = response.data.tickets || [];
        setRecentTickets(tickets);
        
        // Calculate stats
        const pendingCount = tickets.filter(ticket => ticket.status === 'pending').length;
        const approvedCount = tickets.filter(ticket => ticket.status === 'approved').length;
        const rejectedCount = tickets.filter(ticket => ticket.status === 'rejected').length;
        
        setStats({
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
          total: tickets.length
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats cards
  const statCards = [
    {
      title: 'Toplam Kayıt',
      value: stats.total,
      icon: DocumentPlusIcon,
      color: 'bg-primary/10 text-primary'
    },
    {
      title: 'Onay Bekleyen',
      value: stats.pending,
      icon: ClockIcon,
      color: 'bg-warning/10 text-warning'
    },
    {
      title: 'Onaylanan',
      value: stats.approved,
      icon: CheckCircleIcon,
      color: 'bg-success/10 text-success'
    },
    {
      title: 'Reddedilen',
      value: stats.rejected,
      icon: XCircleIcon,
      color: 'bg-danger/10 text-danger'
    }
  ];

  // Status badge styles
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  // Status labels
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
        title={`Hoş Geldiniz, ${user?.firstName}`}
        description="Destek kaydı yönetim sistemi kontrol paneli"
        actions={
          <Link to="/tickets/create" className="btn btn-primary">
            Yeni Servis Kaydı
          </Link>
        }
      />

      {/* Stats Section */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{card.title}</p>
                <p className="mt-1 text-xl sm:text-2xl font-semibold text-gray-900">{card.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Tickets Section */}
      <div className="mt-8">
        <Card
          title="Son Destek Kayıtları"
          description="Son eklenen destek kayıtlarının listesi"
          footer={
            <div className="text-center">
              <Link to="/tickets" className="text-sm font-medium text-primary hover:text-primary/90">
                Tüm Destek Kayıtlarını Görüntüle
              </Link>
            </div>
          }
        >
          {loading ? (
            <div className="flex justify-center py-6">
              <Spinner />
            </div>
          ) : recentTickets.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              Henüz servis kaydı bulunmuyor.
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
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
                        Durum
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTickets.map((ticket) => {
                      // Format date
                      const startTime = new Date(ticket.startTime);
                      
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
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[ticket.status]}`}>
                              {getStatusLabel(ticket.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link
                              to={`/tickets/${ticket.id}`}
                              className="text-primary hover:text-primary/80"
                            >
                              Görüntüle
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="sm:hidden responsive-card-list">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="responsive-card">
                    <div className="flex justify-between items-center mb-2">
                      <span 
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: `${ticket.Category?.color}20`, 
                          color: ticket.Category?.color 
                        }}
                      >
                        {ticket.Category?.name}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[ticket.status]}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </div>
                    
                    <div className="responsive-card-row">
                      <span className="responsive-card-label">Müşteri</span>
                      <span className="responsive-card-value">{ticket.Customer?.name}</span>
                    </div>
                    
                    <div className="responsive-card-row">
                      <span className="responsive-card-label">Tarih</span>
                      <span className="responsive-card-value">
                        {format(new Date(ticket.startTime), 'dd MMM yyyy', { locale: tr })}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Görüntüle
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Admin Only Section */}
      {isAdmin && (
        <div className="mt-8">
          <Card
            title="Yönetici Araçları"
            description="Sistem yönetimi ve raporlama"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Link
                to="/reports/monthly"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Aylık Özet</h3>
                  <p className="text-sm text-gray-500">Aylık destek faaliyeti özeti</p>
                </div>
              </Link>
              
              <Link
                to="/reports/detailed"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="p-3 rounded-full bg-success/10 text-success">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Detaylı Rapor</h3>
                  <p className="text-sm text-gray-500">Detaylı servis kaydı raporu</p>
                </div>
              </Link>
              
              <Link
                to="/reports/staff"
                className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="p-3 rounded-full bg-warning/10 text-warning">
                  <ChartBarIcon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Personel Performansı</h3>
                  <p className="text-sm text-gray-500">Personel performans raporu</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;