const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate PDF for a ticket
const generateTicketPDF = async (ticket, outputStream) => {
  return new Promise((resolve, reject) => {
    try {
      // PDF ayarlarını genişletilmiş başlık bilgileriyle oluştur
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `IES Yazilim Servis Kaydi #${ticket.id}`,
          Author: 'IES Yazilim',
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
      
      // Add header
      doc.font('Roboto-Bold')
         .fontSize(16)
         .text('IES YAZILIM VE DANIŞMANLIK SAN. TİC. LTD. ŞTİ.', { align: 'center' })
         .fontSize(14)
         .text('Servis Kaydı Raporu', { align: 'center' })
         .moveDown();
      
      // Add horizontal line
      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke();
      doc.moveDown();
      
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
      
      // Resim (Görüntü) ekleme kısmı
      if (ticket.TicketImages && ticket.TicketImages.length > 0) {
        doc.moveDown(0.3);
        doc.font('Roboto-Bold')
           .fontSize(12)
           .text('Servis Görüntüleri', { underline: true })
           .moveDown();
        
        // İlk resmi ekle (sadece ilk resmi göster)
        const image = ticket.TicketImages[0];
        if (image) {
          const imagePath = path.join(__dirname, '..', image.imagePath);
          if (fs.existsSync(imagePath)) {
            // Resim açıklaması varsa ekle
            if (image.description) {
              doc.fontSize(10)
                 .font('Roboto-Bold')
                 .text(image.description)
                 .moveDown(0.2);
            }
            
            // Resmi PDF'e ekle (küçük boyutlarda)
            doc.image(imagePath, {
              fit: [300, 200], // Daha küçük boyut
              align: 'center',
            });
            
            doc.moveDown(0.3);
          } else {
            doc.fontSize(10)
               .font('Roboto')
               .text('Resim bulunamadı.')
               .moveDown(0.3);
          }
        }
      }
      
      // Approval info
      if (ticket.status !== 'pending') {
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
      
      // Footer ekle
      doc.font('Roboto')
         .fontSize(8)
         .text(
           'IES Yazılım ve Danışmanlık San. Tic. Ltd. Şti. • www.iesyazilim.com.tr',
           50,
           doc.page.height - 50,
           { align: 'center' }
         );
      
      // Finalize the PDF
      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};

// Helper function for status text
function getStatusText(status) {
  switch (status) {
    case 'approved': return 'Onaylandı';
    case 'rejected': return 'Reddedildi';
    default: return 'Onay Bekliyor';
  }
}

// Generate PDF as buffer and return it
const generateTicketPDFToBuffer = async (ticket) => {
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      const bufferStream = new require('stream').PassThrough();
      
      bufferStream.on('data', chunk => chunks.push(chunk));
      bufferStream.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      
      // Use the existing function to generate PDF to our buffer stream
      generateTicketPDF(ticket, bufferStream).catch(reject);
    } catch (error) {
      console.error('PDF to buffer generation error:', error);
      reject(error);
    }
  });
};

module.exports = {
  generateTicketPDF,
  generateTicketPDFToBuffer
};