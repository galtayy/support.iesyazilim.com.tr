import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

/**
 * PDF Yönlendirme Bileşeni
 * 
 * E-postaadaki PDF linki ile hizmet servis formu detayındaki PDF indirme butonunun
 * aynı görevi görmesini sağlamak için yönlendirme yapar.
 */
const PDFRedirect = () => {
  const { id, token } = useParams();

  useEffect(() => {
    // PDF indirme URL'ini oluştur
    const apiBaseUrl = window.location.origin;
    const pdfUrl = `${apiBaseUrl}/api/tickets/${id}/pdf/${token}`;
    
    // PDF indirme işlemini başlat
    window.location.href = pdfUrl;
    
    // Doğrudan URL'i debug için konsola yazdır
    console.log(`PDF indiriliyor: ${pdfUrl}`);
  }, [id, token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-800 mt-4 mb-2">PDF İndiriliyor</h2>
        <p className="text-gray-600">Lütfen bekleyin, PDF dosyanız hazırlanıyor...</p>
      </div>
    </div>
  );
};

// Export the component
export default PDFRedirect;