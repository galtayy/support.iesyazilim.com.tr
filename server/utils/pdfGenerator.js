const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Generate PDF for a ticket
const generateTicketPDF = async (ticket, outputStream) => {
  return new Promise((resolve, reject) => {
    try {
      // PDF ayarlarını hazırla
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `IES Yazılım Servis Kaydı #${ticket.id}`,
          Author: 'IES Yazılım ve Danışmanlık',
          Subject: 'Servis Kaydı Raporu',
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

      // Set up some colors for the document
      const colors = {
        primary: '#1e40af', // IES Mavi (koyu)
        secondary: '#3b82f6', // IES Mavi (açık)
        accent: '#0284c7',
        text: '#333333',
        lightText: '#6b7280',
        lightGray: '#f3f4f6',
        border: '#e5e7eb'
      };
      
      // Add header with logo and company info
      doc.fillColor(colors.primary)
         .font('Roboto-Bold')
         .fontSize(16)
         .text('IES YAZILIM VE DANIŞMANLIK', 50, 50)
         .fontSize(14)
         .font('Roboto')
         .text('SAN. TİC. LTD. ŞTİ.', 50, 75)
         .fontSize(14)
         .text('Servis Raporu', 50, 95)
         .moveDown();

      // Add document title and info
      doc.roundedRect(50, 125, 495, 70, 5)
         .fillAndStroke(colors.lightGray, colors.border);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Roboto-Bold')
         .text('Tarih:', 70, 140)
         .font('Roboto')
         .text(formatDate(ticket.createdAt), 150, 140, {width: 170})
         .font('Roboto-Bold')
         .text('Kategori:', 330, 140)
         .font('Roboto')
         .text(ticket.Category.name, 380, 140);
      
      doc.font('Roboto-Bold')
         .text('Durum:', 70, 160)
         .font('Roboto')
         .fillColor(getStatusColor(ticket.status))
         .text(getStatusText(ticket.status), 150, 160)
         .fillColor(colors.text)
         .font('Roboto-Bold')
         .text('Müşteri:', 330, 160)
         .font('Roboto')
         .text(ticket.Customer?.name || 'N/A', 380, 160);
      
      // Add a separator line
      doc.strokeColor(colors.border)
         .lineWidth(1)
         .moveTo(50, 205)
         .lineTo(545, 205)
         .stroke();
    
      // Customer Information Section
      doc.font('Roboto-Bold')
         .fontSize(12)
         .fillColor(colors.primary)
         .text('Müşteri Bilgileri', 50, 220);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Roboto-Bold')
         .text('Müşteri:', 50, 240)
         .font('Roboto')
         .text(ticket.Customer?.name || 'N/A', 150, 240, { width: 395 });
      
      if (ticket.Customer?.contactPerson) {
        doc.font('Roboto-Bold')
           .text('İlgili Kişi:', 50, 260)
           .font('Roboto')
           .text(ticket.Customer.contactPerson, 150, 260, { width: 395 });
      }
      
      // Time and Duration
      doc.font('Roboto-Bold')
         .fontSize(12)
         .fillColor(colors.primary)
         .text('Zaman Bilgileri', 50, 290);
      
      // Format dates
      const formatDatetime = (date) => {
        const d = new Date(date);
        return `${d.toLocaleDateString('tr-TR')} ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
      };
      
      // Calculate duration
      const start = new Date(ticket.startTime);
      const end = new Date(ticket.endTime);
      const durationHours = ((end - start) / (1000 * 60 * 60)).toFixed(1);
      
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Roboto-Bold')
         .text('Başlangıç:', 50, 310)
         .font('Roboto')
         .text(formatDatetime(ticket.startTime), 150, 310);
      
      doc.font('Roboto-Bold')
         .text('Bitiş:', 50, 325)
         .font('Roboto')
         .text(formatDatetime(ticket.endTime), 150, 325);
      
      doc.font('Roboto-Bold')
         .text('Toplam Süre:', 50, 340)
         .font('Roboto')
         .text(`${durationHours} saat`, 150, 340);
      
      // Service Details
      doc.font('Roboto-Bold')
         .fontSize(12)
         .fillColor(colors.primary)
         .text('Servis Detayları', 50, 370);
      
      // Draw background for details section
      doc.roundedRect(50, 390, 495, ticket.subject ? 130 : 100, 5)
         .fillAndStroke(colors.lightGray, colors.border);
      
      let yPosition = 400;
      
      // Add subject if exists
      if (ticket.subject) {
        doc.fillColor(colors.text)
           .fontSize(10)
           .font('Roboto-Bold')
           .text('İş Konusu:', 60, yPosition)
           .font('Roboto')
           .text(ticket.subject, 60, yPosition + 15, { width: 475 });
        
        yPosition += 40;
      }
      
      // Add description
      doc.fillColor(colors.text)
         .fontSize(10)
         .font('Roboto-Bold')
         .text('İş Açıklaması:', 60, yPosition)
         .font('Roboto')
         .text(ticket.description, 60, yPosition + 15, { width: 475 });
      
      // Resim (Görüntü) ekleme kısmı
      yPosition = ticket.subject ? 530 : 490;
      
      if (ticket.TicketImages && ticket.TicketImages.length > 0) {
        doc.font('Roboto-Bold')
           .fontSize(12)
           .fillColor(colors.primary)
           .text('Servis Görüntüleri', 50, yPosition);
        
        yPosition += 20;
        
        // İlk resmi ekle (sadece ilk resmi göster)
        const image = ticket.TicketImages[0];
        if (image) {
          const imagePath = path.join(__dirname, '..', image.imagePath);
          if (fs.existsSync(imagePath)) {
            // Resim açıklaması varsa ekle
            if (image.description) {
              doc.fillColor(colors.text)
                 .fontSize(10)
                 .font('Roboto-Bold')
                 .text(image.description, 50, yPosition)
                 .moveDown(0.2);
              
              yPosition += 15;
            }
            
            // Resmi PDF'e ekle (küçük boyutlarda)
            doc.image(imagePath, {
              fit: [300, 150], // Daha küçük boyut
              align: 'center',
              x: 50,
              y: yPosition
            });
            
            yPosition += 160;
          }
        }
      }
      
      // Add location if exists
      if (ticket.location) {
        doc.fillColor(colors.text)
           .fontSize(10)
           .font('Roboto-Bold')
           .text('Konum:', 50, yPosition);
        
        if (ticket.location.includes('https://maps.google.com')) {
          doc.font('Roboto')
             .text('Google Maps Konumu', 150, yPosition)
             .fillColor(colors.secondary)
             .text(ticket.location, 150, yPosition + 15, { 
               link: ticket.location,
               underline: true,
               width: 395
             });
        } else {
          doc.font('Roboto')
             .fillColor(colors.text)
             .text(ticket.location, 150, yPosition, { width: 395 });
        }
        
        yPosition += 35;
      }
      
      // Add approval info if approved/rejected
      if (ticket.status !== 'pending') {
        if (yPosition > 700) {
          yPosition = 700;
        }
        
        doc.fillColor(colors.primary)
          .fontSize(12)
          .font('Roboto-Bold')
          .text(ticket.status === 'approved' ? 'Onay Bilgileri' : 'Red Bilgileri', 50, yPosition);
        
        doc.fillColor(colors.text)
          .fontSize(10);
        
        // Add approval date
        doc.font('Roboto-Bold')
          .text('Tarih:', 50, yPosition + 20)
          .font('Roboto')
          .text(formatDatetime(ticket.approvalDate), 150, yPosition + 20);
        
        // Add approver info
        doc.font('Roboto-Bold')
          .text('Onaylayan:', 50, yPosition + 35)
          .font('Roboto')
          .text(ticket.externalApproval 
          ? 'Müşteri (E-posta ile)' 
          : `${ticket.approver?.firstName} ${ticket.approver?.lastName}`, 
          150, yPosition + 35);
        
        // Notlar için yer kalmazsa ekleme
        if (ticket.approvalNotes && yPosition < 680) {
          doc.font('Roboto-Bold')
            .text('Notlar:', 50, yPosition + 50)
            .font('Roboto')
            .text(ticket.approvalNotes, 50, yPosition + 65, { width: 495 });
        }
      }
      
      // Alt bilgi ekle (footer)
      doc.fillColor(colors.primary)
         .rect(50, 780, 495, 2)
         .fill();
      
      doc.fontSize(8)
         .fillColor(colors.lightText)
         .font('Roboto')
         .text(
           'IES Yazılım ve Danışmanlık San. Tic. Ltd. Şti. • www.iesyazilim.com.tr',
           50, 790,
           { align: 'center', width: 495 }
         );
      
      // End the document
      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      reject(error);
    }
  });
};

// Helper functions
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
}

function getStatusColor(status) {
  switch (status) {
    case 'approved': return '#16a34a';
    case 'rejected': return '#dc2626';
    default: return '#f59e0b';
  }
}

function getStatusText(status) {
  switch (status) {
    case 'approved': return 'Onaylandı';
    case 'rejected': return 'Reddedildi';
    default: return 'Onay Bekliyor';
  }
}

module.exports = {
  generateTicketPDF
};