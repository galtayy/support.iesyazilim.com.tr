import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import approvalService from '../../services/approvalService';

const TicketApproval = () => {
  const { token, action } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [result, setResult] = useState(null);

  // Verify token and get ticket details
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true);
        const response = await approvalService.verifyApprovalToken(token);
        
        if (response.data.valid) {
          setTicket(response.data.ticket);
          
          // If action is reject, show reject reason modal
          if (action === 'reject') {
            setShowModal(true);
          }
        } else {
          setError('Geçersiz veya süresi dolmuş onay linki.');
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        setError('Onay linki doğrulanırken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError('Geçersiz onay linki.');
      setLoading(false);
    }
  }, [token, action]);

  // Process approval or rejection
  const processApproval = async (actionType, reason = '') => {
    try {
      setSubmitting(true);
      const response = await approvalService.processApproval(token, actionType, reason);
      setResult(response.data);
      setSuccess(true);
    } catch (err) {
      console.error('Error processing approval:', err);
      setError('İşlem sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false);
      setShowModal(false);
    }
  };

  // Handle approval click
  const handleApprove = () => {
    processApproval('approve');
  };

  // Handle reject submit
  const handleRejectSubmit = () => {
    processApproval('reject', rejectReason);
  };

  // Calculate duration
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return ((end - start) / (1000 * 60 * 60)).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary font-poppins">
            IES Yazılım Destek
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Destek kaydı onay sistemi
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Bilgiler yükleniyor...</p>
          </div>
        ) : error ? (
          <Alert type="error" title="Hata" message={error} />
        ) : success ? (
          <Card>
            <div className="text-center py-6">
              {result.ticket.status === 'approved' ? (
                <CheckCircleIcon className="h-16 w-16 text-success mx-auto" />
              ) : (
                <XCircleIcon className="h-16 w-16 text-danger mx-auto" />
              )}
              
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                {result.ticket.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
              </h2>
              
              <p className="mt-2 text-gray-600">
                {result.message}
              </p>
              
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Teşekkür ederiz.
                </p>
              </div>
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <div className="mb-4 text-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Destek Kaydı Onayı
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Lütfen aşağıdaki destek kaydını onaylayın veya reddedin.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Müşteri</h3>
                  <p className="mt-1 text-gray-900">{ticket.customer}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Tarih ve Saat</h3>
                  <p className="mt-1 text-gray-900">
                    {format(new Date(ticket.startTime), 'dd MMMM yyyy', { locale: tr })},&nbsp;
                    {format(new Date(ticket.startTime), 'HH:mm', { locale: tr })} - 
                    {format(new Date(ticket.endTime), 'HH:mm', { locale: tr })}
                    &nbsp;({calculateDuration(ticket.startTime, ticket.endTime)} saat)
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Kategori</h3>
                  <p className="mt-1 text-gray-900">{ticket.category}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Destek Personeli</h3>
                  <p className="mt-1 text-gray-900">{ticket.supportStaff}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Açıklama</h3>
                  <p className="mt-1 text-gray-900">{ticket.description}</p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                {action === 'approve' ? (
                  <button
                    type="button"
                    className="btn btn-success w-full sm:w-auto"
                    onClick={handleApprove}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <Spinner size="sm" color="white" className="mr-2" /> İşleniyor...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <CheckCircleIcon className="mr-2 h-5 w-5" /> Onayla
                      </div>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-danger w-full sm:w-auto"
                    onClick={() => setShowModal(true)}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <Spinner size="sm" color="white" className="mr-2" /> İşleniyor...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <XCircleIcon className="mr-2 h-5 w-5" /> Reddet
                      </div>
                    )}
                  </button>
                )}
              </div>
            </Card>
            
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center text-gray-500 text-sm">
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>Bu işlem birkaç saniye sürebilir.</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Reject Reason Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Red Nedeni"
        footer={
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              İptal
            </button>
            <button
              type="button"
              className="btn btn-danger ml-3"
              onClick={handleRejectSubmit}
              disabled={submitting}
            >
              {submitting ? (
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
        <p className="text-gray-700 mb-4">
          Lütfen destek kaydını reddetme nedeninizi belirtin.
        </p>
        <textarea
          className="form-input w-full"
          rows={4}
          placeholder="Red nedeni..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default TicketApproval;