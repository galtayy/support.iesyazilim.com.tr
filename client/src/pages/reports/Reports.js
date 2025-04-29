import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ChartBarIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';

const Reports = () => {
  // Report card data
  const reportCards = [
    {
      title: 'Aylık Özet Raporu',
      description: 'Aylık destek faaliyetlerinin özet raporu.',
      icon: CalendarIcon,
      color: 'bg-primary/10 text-primary',
      link: '/reports/monthly'
    },
    {
      title: 'Detaylı Rapor',
      description: 'Belirli tarih aralığı ve filtrelere göre detaylı rapor.',
      icon: DocumentTextIcon,
      color: 'bg-success/10 text-success',
      link: '/reports/detailed'
    },
    {
      title: 'Personel Performans Raporu',
      description: 'Destek personeli performans ve faaliyet raporu.',
      icon: UserGroupIcon,
      color: 'bg-warning/10 text-warning',
      link: '/reports/staff'
    }
  ];

  return (
    <div>
      <PageHeader
        title="Raporlar"
        description="Destek faaliyetleri raporları ve istatistikleri"
        breadcrumbItems={[{ label: 'Raporlar' }]}
      />

      <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2 lg:grid-cols-3">
        {reportCards.map((report, index) => (
          <Link key={index} to={report.link} className="block h-full">
            <Card className="h-full transition-shadow hover:shadow-md">
              <div className="flex items-start">
                <div className={`p-3 rounded-full ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <span className="text-sm font-medium text-primary">Raporu Görüntüle →</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Card title="Raporlama Hakkında">
          <div className="prose max-w-none">
            <p>
              Raporlama modülü, destek faaliyetlerinizin analiz edilmesi ve performans ölçümü için gerekli araçları sunar.
              Çeşitli rapor türleri ile destek operasyonlarınızı farklı açılardan değerlendirebilirsiniz.
            </p>
            
            <h3>Rapor Türleri</h3>
            <ul>
              <li>
                <strong>Aylık Özet Raporu:</strong> Belirli bir ay veya yıl için toplam destek saatleri, müşteri ve 
                kategorilere göre dağılım gibi özet bilgileri görüntüleyebilirsiniz.
              </li>
              <li>
                <strong>Detaylı Rapor:</strong> Belirli bir tarih aralığı için müşteri, kategori, personel veya
                durum bazlı filtrelemeler ile detaylı rapor oluşturabilirsiniz.
              </li>
              <li>
                <strong>Personel Performans Raporu:</strong> Destek personelinin performansını, toplam destek saatleri,
                ortalama destek süresi ve kategori bazlı dağılım gibi metrikleri görüntüleyebilirsiniz.
              </li>
            </ul>
            
            <h3>Raporları Dışa Aktarma</h3>
            <p>
              Tüm raporlar, Excel ve PDF formatlarında dışa aktarılabilir. Raporları görüntülerken sağ üst köşedeki
              "Dışa Aktar" butonunu kullanabilirsiniz.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;