const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate PDF for a ticket
const generateTicketPDF = async (ticket, outputStream) => {
  try {
    // Şirket bilgilerini al
    const { Setting } = require('../models');
    let companyName = 'IES YAZILIM VE DANIŞMANLIK SAN. TİC. LTD. ŞTİ.';
    let companyShortName = 'IES Yazılım';
    
    try {
      // Veritabanından şirket bilgilerini al
      const companyInfoSetting = await Setting.findByPk('companyInfo');
      if (companyInfoSetting) {
        const companyInfo = JSON.parse(companyInfoSetting.value);
        if (companyInfo.name) companyName = companyInfo.name;
        if (companyInfo.shortName) companyShortName = companyInfo.shortName;
      }
    } catch (error) {
      console.error('Şirket bilgileri alınamadı:', error);
      // Varsayılan değerleri kullan
    }
    
    return new Promise((resolve, reject) => {
      try {
        // PDF belgesi oluştur
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40, // Kenar boşluklarını azalt
          bufferPages: true,
          autoFirstPage: true,
          compress: true, // Dosya boyutunu sıkıştır
          layout: 'portrait',
          info: {
            Title: `${companyShortName} Servis Kaydi #${ticket.id}`,
            Author: companyShortName,
            Subject: 'Servis Kaydi Belgesi',
            Keywords: 'servis, destek, rapor'
          }
        });
        
        // Font yollarını belirle
        const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts', 'roboto');
        const REGULAR_FONT = path.join(FONTS_DIR, 'Roboto-Regular.ttf');
        const BOLD_FONT = path.join(FONTS_DIR, 'Roboto-Bold.ttf');
        
        // Fontları kaydet
        doc.registerFont('Roboto', REGULAR_FONT);
        doc.registerFont('Roboto-Bold', BOLD_FONT);
        
        // Pipe the PDF to the output stream
        doc.pipe(outputStream);
        
        // Stream events for file output
        if (outputStream instanceof fs.WriteStream) {
          outputStream.on('finish', () => {
            resolve({
              filePath: outputStream.path,
              fileName: path.basename(outputStream.path)
            });
          });
          
          outputStream.on('error', (err) => {
            reject(err);
          });
        } else {
          // For direct response streaming, use doc.end event
          doc.on('end', () => {
            resolve();
          });
        }
      
        // Başlık ekle (daha kompakt)
        doc.font('Roboto-Bold')
           .fontSize(14)
           .text(companyName, { align: 'center' })
           .fontSize(12)
           .text('Servis Formu Raporu', { align: 'center' });
        
        // Yatay çizgi
        doc.moveTo(40, doc.y + 5)
           .lineTo(doc.page.width - 40, doc.y + 5)
           .stroke();
        doc.moveDown(0.5);
        
        // Add ticket information
        doc.font('Roboto-Bold')
           .fontSize(12)
           .text('Servis Bilgileri', { underline: true })
           .moveDown();
        
        // Simple tablular data with labels and values
        const addField = (label, value) => {
          doc.fontSize(10)
             .font('Roboto-Bold')
             .text(`${label}: `, { continued: true })
             .font('Roboto')
             .text(value !== null && value !== undefined ? String(value) : 'N/A')
             .moveDown(0.3);
        };
        
        // Servis No gösterme
        // addField('Servis No', ticket.id);
        addField('Tarih', new Date(ticket.createdAt).toLocaleDateString('tr-TR'));
        addField('Durum', getStatusText(ticket.status));
        addField('Kategori', ticket.Category.name);
        addField('Müşteri', ticket.Customer?.name || '');
        
        if (ticket.Customer?.contactPerson) {
          addField('İlgili Kişi', ticket.Customer.contactPerson);
        }
        
        // Destek personeli bilgisini ekle
        if (ticket.supportStaff) {
          addField('Destek Personeli', `${ticket.supportStaff.firstName} ${ticket.supportStaff.lastName}`);
        }
        
        doc.moveDown(0.3);
        
        // Time information  
        doc.font('Roboto-Bold')
           .fontSize(12)
           .text('Zaman Bilgileri', { underline: true })
           .moveDown();
        
        const formatDateTime = (date) => {
          const d = new Date(date);
          return `${d.toLocaleDateString('tr-TR')} ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
        };
        
        const start = new Date(ticket.startTime);
        const end = new Date(ticket.endTime);
        const durationHours = ((end - start) / (1000 * 60 * 60)).toFixed(1);
        
        addField('Başlangıç', formatDateTime(ticket.startTime));
        addField('Bitiş', formatDateTime(ticket.endTime));
        addField('Toplam Süre', `${durationHours} saat`);
        
        doc.moveDown(0.3);
        
        // Service Details
        doc.font('Roboto-Bold')
           .fontSize(12)
           .text('Servis Detayları', { underline: true })
           .moveDown();
        
        if (ticket.subject) {
          doc.fontSize(10)
             .font('Roboto-Bold')
             .text('İş Konusu:')
             .moveDown(0.2)
             .font('Roboto')
             .text(ticket.subject, { width: 500 })
             .moveDown(0.3);
        }
        
        doc.fontSize(10)
           .font('Roboto-Bold')
           .text('İş Açıklaması:')
           .moveDown(0.2)
           .font('Roboto')
           .text(ticket.description, { width: 500 })
           .moveDown(0.3);
        
        if (ticket.location) {
          doc.fontSize(10)
             .font('Roboto-Bold')
             .text('Konum:')
             .moveDown(0.2);
          
          if (ticket.location.includes('https://maps.google.com')) {
            doc.font('Roboto')
               .text('Google Maps Konumu', { width: 500 })
               .fillColor('blue')
               .text(ticket.location, { 
                 link: ticket.location,
                 underline: true,
                 width: 500
               })
               .fillColor('black');
          } else {
            doc.font('Roboto')
               .text(ticket.location, { width: 500 });
          }
          
          doc.moveDown(0.3);
        }
        
        // İçeriğin kalan tüm yüksekliğini hesaplayalım
        let remainingContentHeight = 0;
        
        // Görsel eklenecekse yükseklik hesabına ekleyelim
        const hasImages = ticket.TicketImages && ticket.TicketImages.length > 0 && 
          fs.existsSync(path.join(__dirname, '..', ticket.TicketImages[0].imagePath));
          
        if (hasImages) {
          remainingContentHeight += 250; // Başlık + resim + açıklama
        }
        
        // Onay bilgileri eklenecekse yükseklik hesabına ekleyelim
        if (ticket.status !== 'pending') {
          remainingContentHeight += 150; // Onay bilgileri için gereken yaklaşık yükseklik
          
          // Onay notları varsa ek yükseklik hesaplama
          if (ticket.approvalNotes) {
            // Her 100 karakter için yaklaşık 20px
            const approvalNotesHeight = Math.min(200, 20 * (ticket.approvalNotes.length / 100));
            remainingContentHeight += approvalNotesHeight;
          }
        }
        
        // Kalan içerik için yeterli alan yoksa ve içerik varsa, yeni sayfa ekle
        const availableSpace = doc.page.height - doc.y - 40; // 40px alt boşluk
        
        // İçerik yüksekliği çok fazlaysa ve yeterli alan yoksa yeni sayfa ekle
        if (remainingContentHeight > 100 && remainingContentHeight > availableSpace) {
          doc.addPage();
        }
        
        // Görsel bölümü
        if (hasImages) {
          doc.moveDown(0.5);
          doc.font('Roboto-Bold')
             .fontSize(12)
             .text('Servis Görüntüleri', { underline: true })
             .moveDown();
          
          // Sadece ilk görseli göster
          const image = ticket.TicketImages[0];
          const imagePath = path.join(__dirname, '..', image.imagePath);
          
          // Görsel açıklaması varsa ekle
          if (image.description) {
            doc.fontSize(10)
               .font('Roboto-Bold')
               .text(image.description)
               .moveDown(0.2);
          }
          
          // Görsel varlığını kontrol et ve log yaz
          try {
            // Görsel dosyasının var olup olmadığını kontrol et
            if (fs.existsSync(imagePath)) {
              console.log(`Görsel dosyası bulundu: ${imagePath}`);
              
              // Görseli PDF'e ekle
              doc.image(imagePath, {
                fit: [300, 200], // Daha büyük boyut
                align: 'center',
              });
              
              console.log('Görsel PDF\'e eklendi');
            } else {
              console.error(`Görsel dosyası bulunamadı: ${imagePath}`);
              doc.fontSize(10)
                 .font('Roboto')
                 .text(`Görsel dosyası bulunamadı: ${path.basename(imagePath)}`, { align: 'center' });
            }
          } catch (imgErr) {
            console.error('Görsel yükleme hatası:', imgErr);
            doc.fontSize(10)
               .font('Roboto')
               .text('Görsel yüklenirken hata oluştu.', { align: 'center' });
          }
          
          doc.moveDown(0.5);
        } else {
          console.log('Gösterilecek görsel bulunamadı');
        }
        
        // Onay bilgileri
        if (ticket.status !== 'pending') {
          doc.moveDown(0.5);
          doc.font('Roboto-Bold')
             .fontSize(12)
             .text(ticket.status === 'approved' ? 'Onay Bilgileri' : 'Red Bilgileri', { underline: true })
             .moveDown();
          
          addField('Tarih', formatDateTime(ticket.approvalDate));
          addField('Onaylayan', ticket.externalApproval 
            ? 'Müşteri (E-posta ile)' 
            : `${ticket.approver?.firstName || ''} ${ticket.approver?.lastName || ''}`);
          
          if (ticket.approvalNotes) {
            doc.fontSize(10)
               .font('Roboto-Bold')
               .text('Notlar:')
               .moveDown(0.2)
               .font('Roboto')
               .text(ticket.approvalNotes, { width: 500 });
          }
        }
        
        // Finalize the PDF
        doc.end();
      } catch (error) {
        console.error('PDF Generation Error:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('PDF Generation Outer Error:', error);
    throw error;
  }
};

// Helper function for status text
function getStatusText(status) {
  switch (status) {
    case 'approved': return 'Onaylandı';
    case 'rejected': return 'Reddedildi';
    default: return 'Onay Bekliyor';
  }
}

// PDF'i doğrudan buffer olarak oluştur - tamamen yeni bir yaklaşım
const generateTicketPDFToBuffer = async (ticket) => {
  try {
    // Şirket bilgilerini al
    const { Setting } = require('../models');
    let companyName = 'IES YAZILIM VE DANIŞMANLIK SAN. TİC. LTD. ŞTİ.';
    let companyShortName = 'IES Yazılım';
    
    try {
      // Veritabanından şirket bilgilerini al
      const companyInfoSetting = await Setting.findByPk('companyInfo');
      if (companyInfoSetting) {
        const companyInfo = JSON.parse(companyInfoSetting.value);
        if (companyInfo.name) companyName = companyInfo.name;
        if (companyInfo.shortName) companyShortName = companyInfo.shortName;
      }
    } catch (error) {
      console.error('Şirket bilgileri alınamadı:', error);
      // Varsayılan değerleri kullan
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Ticket kontrolü
        if (!ticket) {
          return reject(new Error('Geçerli ticket bilgisi bulunamadı'));
        }
        
        console.log('PDF oluşturuluyor (doğrudan buffer)...');
        
        // Yeni PDFDocument oluştur
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          bufferPages: true,
          compress: true,
          info: {
            Title: `${companyShortName} Servis Kaydi #${ticket.id}`,
            Author: companyShortName,
            Subject: 'Servis Kaydi Belgesi',
            Keywords: 'servis, destek, rapor'
          }
        });
        
        // Buffer'a toplama için
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          console.log(`PDF buffer oluşturuldu, boyut: ${pdfBuffer.length} bytes`);
          resolve(pdfBuffer);
        });
        
        // PDF içeriği
        // Başlık
        doc.font('Helvetica-Bold')
           .fontSize(14)
           .text(companyName, { align: 'center' })
           .fontSize(12)
           .text('Servis Formu Raporu', { align: 'center' })
           .moveDown();
        
        // Çizgi
        doc.moveTo(40, doc.y)
           .lineTo(doc.page.width - 40, doc.y)
           .stroke();
        doc.moveDown();
        
        // Ticket bilgileri
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .text('Servis Bilgileri')
           .moveDown();
        
        // Temel bilgiler
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text('Tarih: ', { continued: true })
           .font('Helvetica')
           .text(new Date(ticket.createdAt).toLocaleDateString('tr-TR'))
           .moveDown(0.5);
           
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text('Kategori: ', { continued: true })
           .font('Helvetica')
           .text(ticket.Category?.name || 'N/A')
           .moveDown(0.5);
           
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text('Müşteri: ', { continued: true })
           .font('Helvetica')
           .text(ticket.Customer?.name || 'N/A')
           .moveDown(0.5);
           
        doc.font('Helvetica-Bold')
           .fontSize(10)
           .text('Destek Personeli: ', { continued: true })
           .font('Helvetica')
           .text(ticket.supportStaff ? `${ticket.supportStaff.firstName} ${ticket.supportStaff.lastName}` : 'N/A')
           .moveDown(0.5);
           
        // Açıklama
        doc.font('Helvetica-Bold')
           .fontSize(12)
           .text('Açıklama')
           .moveDown();
           
        doc.font('Helvetica')
           .fontSize(10)
           .text(ticket.description || 'Açıklama bulunmamaktadır.', { width: 500 })
           .moveDown();
        
        // PDF dosyasını sonlandır
        doc.end();
        
      } catch (error) {
        console.error('PDF buffer oluşturma hatası:', error);
        reject(error);
      }
    });
  } catch (error) {
    console.error('PDF buffer generation outer error:', error);
    throw error;
  }
};

module.exports = {
  generateTicketPDF,
  generateTicketPDFToBuffer
};