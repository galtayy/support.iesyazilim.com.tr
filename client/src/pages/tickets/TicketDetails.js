import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { 
  PencilIcon, 
  TrashIcon, 
  CheckIcon, 
  XMarkIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  EnvelopeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ticketService from '../../services/ticketService';
import approvalService from '../../services/approvalService';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Load ticket data
  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true);
        const response = await ticketService.getTicket(id);
        setTicket(response.data);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setError('Destek kaydı yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  // Handle approve ticket
  const handleApprove = async () => {
    try {
      setApprovalLoading(true);
      await ticketService.updateTicketStatus(id, 'approved', approvalNotes);
      
      // Update local state
      setTicket(prev => ({
        ...prev,
        status: 'approved',
        approvalNotes,
        approvalDate: new Date().toISOString(),
        approver: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }));
      
      // Close modal
      setShowApprovalModal(false);
      setApprovalNotes('');
      
      // Show success message
      toast.success('Destek kaydı başarıyla onaylandı.');
    } catch (error) {
      console.error('Error approving ticket:', error);
      toast.error('Destek kaydı onaylanırken bir hata oluştu.');
    } finally {
      setApprovalLoading(false);
    }
  };

  // Handle reject ticket
  const handleReject = async () => {
    try {
      setApprovalLoading(true);
      await ticketService.updateTicketStatus(id, 'rejected', rejectNotes);
      
      // Update local state
      setTicket(prev => ({
        ...prev,
        status: 'rejected',
        approvalNotes: rejectNotes,
        approvalDate: new Date().toISOString(),
        approver: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName
        }
      }));
      
      // Close modal
      setShowRejectModal(false);
      setRejectNotes('');
      
      // Show success message
      toast.success('Destek kaydı reddedildi.');
    } catch (error) {
      console.error('Error rejecting ticket:', error);
      toast.error('Destek kaydı reddedilirken bir hata oluştu.');
    } finally {
      setApprovalLoading(false);
    }
  };

  // Handle delete ticket
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await ticketService.deleteTicket(id);
      
      // Close modal
      setShowDeleteModal(false);
      
      // Show success message
      toast.success('Destek kaydı başarıyla silindi.');
      
      // Navigate to ticket list
      navigate('/tickets');
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error('Destek kaydı silinirken bir hata oluştu.');
      setDeleteLoading(false);
    }
  };

  // Handle image click
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    try {
      setPdfLoading(true);
      
      // PDF'i doğrudan indirmek için ticketService'i kullanıyoruz
      const response = await ticketService.generatePDF(id);
      
      // PDF blobunu oluştur
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // İndirme bağlantısı oluşturma
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `servis-kaydi-${id}.pdf`);
      
      // Uygulamanın tetiklemesi için dökümanı ekleyelim
      document.body.appendChild(link);
      
      // İndirmeyi başlat
      link.click();
      
      // Temizleme
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF başarıyla indirildi.');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setPdfLoading(false);
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

  // Calculate duration in hours
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationHours = ((end - start) / (1000 * 60 * 60)).toFixed(1);
    return durationHours;
  };

  // Send approval email
  const handleSendApprovalEmail = async () => {
    try {
      setEmailLoading(true);
      const response = await approvalService.sendApprovalEmail(id);
      
      // Show success message
      toast.success(`Onay e-postası ${response.data.sentTo} adresine gönderildi.`);
      
      // Update ticket emailSent status
      setTicket(prev => ({
        ...prev,
        emailSent: true
      }));
    } catch (error) {
      console.error('Error sending approval email:', error);
      
      // Show error message
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('E-posta gönderilirken bir hata oluştu.');
      }
    } finally {
      setEmailLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <Alert
        type="error"
        title="Hata"
        message={error || 'Destek kaydı bulunamadı.'}
        className="mt-6"
      />
    );
  }

  // Check if user has permission to edit/delete
  const canEdit = isAdmin || (ticket.supportStaffId === user.id && ticket.status === 'pending');
  const canDelete = isAdmin || (ticket.supportStaffId === user.id && ticket.status === 'pending');
  const canSendEmail = (isAdmin || ticket.supportStaffId === user.id) && 
                       ticket.status === 'pending' && 
                       ticket.Customer?.contactEmail;
  
  return (
    <div>
      <PageHeader
        title="Servis Kaydı Detayı"
        description="Servis kaydı bilgilerini görüntüleyin"
        breadcrumbItems={[
          { label: 'Servis Kayıtları', to: '/tickets' },
          { label: 'Detay' }
        ]}
        actions={
          <div className="flex flex-col sm:flex-row w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-2">
            {canEdit && (
              <Link
                to={`/tickets/${id}/edit`}
                className="btn btn-outline flex items-center justify-center w-full sm:w-auto"
              >
                <PencilIcon className="-ml-1 mr-2 h-5 w-5" />
                Düzenle
              </Link>
            )}
            {canDelete && (
              <button
                type="button"
                className="btn btn-danger flex items-center justify-center w-full sm:w-auto"
                onClick={() => setShowDeleteModal(true)}
              >
                <TrashIcon className="-ml-1 mr-2 h-5 w-5" />
                Sil
              </button>
            )}
            {canSendEmail && (
              <button
                type="button"
                className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
                onClick={handleSendApprovalEmail}
                disabled={emailLoading}
              >
                {emailLoading ? (
                  <div className="flex items-center">
                    <Spinner size="sm" color="white" className="mr-2" /> Gönderiliyor...
                  </div>
                ) : (
                  <>
                    <EnvelopeIcon className="-ml-1 mr-2 h-5 w-5" />
                    E-posta ile Onay İste
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              className="btn btn-outline flex items-center justify-center w-full sm:w-auto"
              onClick={handleExportPDF}
              disabled={pdfLoading}
            >
              {pdfLoading ? (
                <div className="flex items-center">
                  <Spinner size="sm" className="mr-2" /> PDF Hazırlanıyor...
                </div>
              ) : (
                <>
                  <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" />
                  PDF İndir
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Ticket Details */}
        <div className="lg:col-span-2">
          <Card title="Servis Kaydı Bilgileri">
            <div className="border-b border-gray-200 pb-4">
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Müşteri</h4>
                  <p className="mt-1 text-sm text-gray-900">{ticket.Customer?.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Kategori</h4>
                  <div className="mt-1">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ 
                        backgroundColor: `${ticket.Category?.color}20`, 
                        color: ticket.Category?.color 
                      }}
                    >
                      {ticket.Category?.name}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Başlangıç Zamanı</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(ticket.startTime), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Bitiş Zamanı</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(ticket.endTime), 'dd MMMM yyyy HH:mm', { locale: tr })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Toplam Süre</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {calculateDuration(ticket.startTime, ticket.endTime)} saat
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Durum</h4>
                  <div className="mt-1">
                    <Badge status={ticket.status} label={getStatusLabel(ticket.status)} />
                  </div>
                </div>
                {ticket.location && (
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Konum</h4>
                    {ticket.location.includes('https://maps.google.com') ? (
                      <div className="mt-1">
                        <a 
                          href={ticket.location} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary text-sm flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Google Maps'te Görüntüle
                        </a>
                      </div>
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{ticket.location}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="pt-4">
              {ticket.subject && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">İş Konusu</h4>
                  <div className="mt-2 text-sm text-gray-900 font-medium">
                    {ticket.subject}
                  </div>
                </div>
              )}
              <h4 className="text-sm font-medium text-gray-500">İş Açıklaması</h4>
              <div className="mt-2 whitespace-pre-line text-sm text-gray-900">
                {ticket.description}
              </div>
            </div>
          </Card>

          {/* Images */}
          {ticket.TicketImages && ticket.TicketImages.length > 0 && (
            <Card title="Fotoğraflar" className="mt-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {ticket.TicketImages.map((image) => (
                  <div 
                    key={image.id} 
                    className="relative cursor-pointer overflow-hidden rounded-lg group aspect-square"
                    onClick={() => handleImageClick(image)}
                  >
                    <div className="h-full w-full overflow-hidden">
                      <img
                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5051'}/${image.imagePath}`}
                        alt={image.description || 'Destek kaydı fotoğrafı'}
                        className="h-full w-full object-cover object-center transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <div className="text-white">
                        <ArrowDownTrayIcon className="h-6 w-6 mx-auto" />
                        <span className="text-xs">Görüntüle</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Card className="mb-6">
            <div className="flex flex-col space-y-4">
              {/* Creator Info */}
              <div>
                <h4 className="font-medium text-gray-700">Destek Personeli</h4>
                <div className="mt-2 flex items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="text-xl font-medium">
                      {ticket.supportStaff?.firstName.charAt(0)}
                      {ticket.supportStaff?.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {ticket.supportStaff?.firstName} {ticket.supportStaff?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">Destek Personeli</p>
                  </div>
                </div>
              </div>

              {/* Created At */}
              <div>
                <h4 className="font-medium text-gray-700">Oluşturulma Tarihi</h4>
                <p className="mt-1 text-sm text-gray-600">
                  {format(new Date(ticket.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </p>
              </div>

              {/* Customer Contact */}
              {ticket.Customer?.contactPerson && (
                <div>
                  <h4 className="font-medium text-gray-700">Müşteri Yetkilisi</h4>
                  <p className="mt-1 text-sm text-gray-900">{ticket.Customer.contactPerson}</p>
                  {ticket.Customer.contactEmail && (
                    <p className="text-sm text-gray-600">{ticket.Customer.contactEmail}</p>
                  )}
                  {ticket.Customer.contactPhone && (
                    <p className="text-sm text-gray-600">{ticket.Customer.contactPhone}</p>
                  )}
                </div>
              )}

              {/* Approval Info */}
              {ticket.status !== 'pending' && (
                <div>
                  <h4 className="font-medium text-gray-700">
                    {ticket.status === 'approved' ? 'Onay Bilgileri' : 'Red Bilgileri'}
                  </h4>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Tarih: </span>
                      {format(new Date(ticket.approvalDate), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-700">Onaylayan: </span>
                      {ticket.externalApproval ? 'Müşteri (E-posta ile)' : 
                        `${ticket.approver?.firstName} ${ticket.approver?.lastName}`}
                    </p>
                    {ticket.approvalNotes && (
                      <div className="mt-2">
                        <p className="font-medium text-gray-700 text-sm">Notlar:</p>
                        <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                          {ticket.approvalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Buttons */}
              {isAdmin && ticket.status === 'pending' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-3">Yönetici İşlemleri</h4>
                  <div className="flex flex-col space-y-2">
                    <button
                      type="button"
                      className="btn btn-success flex items-center justify-center w-full"
                      onClick={() => setShowApprovalModal(true)}
                    >
                      <CheckIcon className="-ml-1 mr-2 h-5 w-5" />
                      Onayla
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger flex items-center justify-center w-full"
                      onClick={() => setShowRejectModal(true)}
                    >
                      <XMarkIcon className="-ml-1 mr-2 h-5 w-5" />
                      Reddet
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Approval Modal */}
      <Modal
        open={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Destek Kaydını Onayla"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowApprovalModal(false)}
              disabled={approvalLoading}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-success ml-3"
              onClick={handleApprove}
              disabled={approvalLoading}
            >
              {approvalLoading ? (
                <div className="flex items-center">
                  <Spinner size="sm" color="white" className="mr-2" /> Onaylanıyor...
                </div>
              ) : (
                'Onayla'
              )}
            </button>
          </>
        }
      >
        <p className="text-gray-600">
          Bu destek kaydını onaylamak üzeresiniz. Onay sonrası bu işlem geri alınamaz.
        </p>
        <div className="mt-4">
          <label htmlFor="approvalNotes" className="block text-sm font-medium text-gray-700">
            Onay Notları (İsteğe Bağlı)
          </label>
          <textarea
            id="approvalNotes"
            className="mt-1 form-input"
            rows={3}
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
          />
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Destek Kaydını Reddet"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowRejectModal(false)}
              disabled={approvalLoading}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-danger ml-3"
              onClick={handleReject}
              disabled={approvalLoading}
            >
              {approvalLoading ? (
                <div className="flex items-center">
                  <Spinner size="sm" color="white" className="mr-2" /> İşleniyor...
                </div>
              ) : (
                'Reddet'
              )}
            </button>
          </>
        }
      >
        <p className="text-gray-600">
          Bu destek kaydını reddetmek üzeresiniz. Ret sonrası bu işlem geri alınamaz.
        </p>
        <div className="mt-4">
          <label htmlFor="rejectNotes" className="block text-sm font-medium text-gray-700">
            Ret Nedeni
          </label>
          <textarea
            id="rejectNotes"
            className="mt-1 form-input"
            rows={3}
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            required
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Destek Kaydını Sil"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleteLoading}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-danger ml-3"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <div className="flex items-center">
                  <Spinner size="sm" color="white" className="mr-2" /> Siliniyor...
                </div>
              ) : (
                'Sil'
              )}
            </button>
          </>
        }
      >
        <div className="text-gray-600">
          <p>Bu destek kaydını silmek istediğinizden emin misiniz?</p>
          <p className="mt-2 font-medium">Bu işlem geri alınamaz.</p>
        </div>
      </Modal>

      {/* Image View Modal */}
      <Modal
        open={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Fotoğraf Görüntüleme"
        size="lg"
      >
        {selectedImage && (
          <div className="flex flex-col items-center">
            <img
              src={`${process.env.REACT_APP_API_URL || 'http://localhost:5051'}/${selectedImage.imagePath}`}
              alt={selectedImage.description || 'Destek kaydı fotoğrafı'}
              className="max-h-96 max-w-full object-contain"
            />
            {selectedImage.description && (
              <p className="mt-4 text-center text-gray-700">{selectedImage.description}</p>
            )}
            <div className="mt-4">
              <a
                href={`${process.env.REACT_APP_API_URL || 'http://localhost:5051'}/${selectedImage.imagePath}`}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary flex items-center"
              >
                <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" />
                İndir
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TicketDetails;