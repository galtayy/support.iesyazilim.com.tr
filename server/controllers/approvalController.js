const { SupportTicket, Customer, Category, User, TicketImage } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/email/emailService');
const { getApprovalRequestEmail, getApprovalCompletedEmail } = require('../utils/email/emailTemplates');
const { generateTicketPDF, generateTicketPDFToBuffer } = require('../utils/simplePdfGenerator');

// Send approval email
exports.sendApprovalEmail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get ticket with customer, category, and support staff details
    const ticket = await SupportTicket.findByPk(id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'contactPerson', 'contactEmail']
        },
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'supportStaff',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Hizmet servis formu bulunamadı.' });
    }
    
    // Check if ticket is already approved/rejected
    if (ticket.status !== 'pending') {
      return res.status(400).json({ error: 'Bu hizmet servis formu zaten onaylanmış veya reddedilmiş.' });
    }
    
    // Check if customer has contact email
    if (!ticket.Customer.contactEmail) {
      return res.status(400).json({ error: 'Müşteri için e-posta adresi bulunamadı.' });
    }
    
    // Generate approval token
    const approvalToken = uuidv4();
    
    // Generate PDF URL token for authentication
    const pdfToken = uuidv4();
    
    // Update ticket with both tokens together in a single update
    await ticket.update({
      approvalToken,
      pdfToken,
      emailSent: true
    });
    
    // Debug log
    console.log('Token generation for ticket #' + id, { approvalToken, pdfToken });
    
    // Create approval and reject links
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.APP_URL || 'https://support.iesyazilim.com.tr' 
      : process.env.APP_URL || 'https://support.iesyazilim.com.tr';
    const approvalLink = `${baseUrl}/ticket-approval/${approvalToken}/approve`;
    const rejectLink = `${baseUrl}/ticket-approval/${approvalToken}/reject`;
    
    // API ve client base URL'lerini ayarla
    const apiBaseUrl = process.env.NODE_ENV === 'production'
      ? process.env.API_URL || 'https://api.support.iesyazilim.com.tr/api'
      : process.env.API_URL || 'http://localhost:5051/api';
      
    // PDF oluştur ve e-posta ekine ekle
    try {
      console.log('PDF oluşturma başlıyor...');
      
      // NodeJS modülleri
      const fs = require('fs');
      const path = require('path');
      
      // Projedeki uploads klasörü
      const uploadDir = path.join(__dirname, '..', 'uploads');
      
      // Klasörün varlığını kontrol et, yoksa oluştur
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Detaylı ticket verisini al (resimler dahil)
      const detailedTicket = await SupportTicket.findByPk(id, {
        include: [
          {
            model: Customer,
            attributes: ['id', 'name', 'contactPerson', 'contactEmail', 'contactPhone']
          },
          {
            model: Category,
            attributes: ['id', 'name', 'color']
          },
          {
            model: User,
            as: 'supportStaff',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: TicketImage,
            attributes: ['id', 'imagePath', 'description', 'uploadedAt', 'ticketId']
          }
        ]
      });
      
      if (!detailedTicket) {
        throw new Error('Servis kaydı bulunamadı');
      }
      
      // Görseller hakkında log ve kontrol
      if (detailedTicket.TicketImages && detailedTicket.TicketImages.length > 0) {
        console.log(`Görseller bulundu: ${detailedTicket.TicketImages.length} adet`);
        detailedTicket.TicketImages.forEach((img, idx) => {
          const imgPath = path.join(__dirname, '..', img.imagePath);
          const imgExists = fs.existsSync(imgPath);
          console.log(`- Görsel ${idx+1}: ${img.imagePath} ${img.description ? `(${img.description})` : ''} - ${imgExists ? 'Dosya mevcut' : 'DOSYA BULUNAMADI'}`);
          
          // Görsel bulundu ama dosya yoksa, yol sorununu logla
          if (!imgExists) {
            console.error(`  Görsel dosyası bulunamadı: ${imgPath}`);
          }
        });
      } else {
        console.log('Servis kaydında görsel bulunamadı');
      }
      
      // PDF dosya yolu
      const pdfFileName = `servis-kaydi-${detailedTicket.id}.pdf`;
      const pdfFilePath = path.join(uploadDir, pdfFileName);
      
      console.log('PDF dosyaya yazılıyor:', pdfFilePath);
      
      // PDF dosyasını oluştur ve geçici dosyaya yaz
      const pdfStream = fs.createWriteStream(pdfFilePath);
      
      // PDF oluşturma işlemi tamamlanana kadar bekle
      await new Promise((resolve, reject) => {
        pdfStream.on('finish', resolve);
        pdfStream.on('error', reject);
        
        // PDF oluştur (detaylı veriyi kullanarak)
        generateTicketPDF(detailedTicket, pdfStream)
          .then(() => console.log('PDF başarıyla oluşturuldu'))
          .catch(err => {
            console.error('PDF oluşturma hatası:', err);
            reject(err);
          });
      });
      
      console.log('PDF başarıyla oluşturuldu, e-posta hazırlanıyor...');
      
      // E-posta içeriğini hazırla (detaylı ticket bilgilerini kullanarak)
      const emailHTML = await getApprovalRequestEmail(detailedTicket, approvalLink, rejectLink);
      
      console.log('E-posta gönderiliyor (PDF eki ile)...');
      
      // E-posta gönder (dosyadan PDF eki ile)
      await sendEmail({
        to: ticket.Customer.contactEmail,
        subject: 'Servis Formu Onay Talebi',
        html: emailHTML,
        attachments: [
          {
            filename: pdfFileName,
            path: pdfFilePath  // Doğrudan dosya yolu kullanılıyor
          }
        ]
      });
      
      console.log('E-posta başarıyla gönderildi, PDF temizleniyor...');
      
      // İşlem bitince PDF dosyasını sil
      try {
        fs.unlinkSync(pdfFilePath);
        console.log('Geçici PDF dosyası silindi');
      } catch (cleanupErr) {
        console.warn('Geçici dosya silinirken hata:', cleanupErr.message);
      }
      
      // E-posta gönderiminin başarılı olduğunu kaydet
      await ticket.update({ emailSent: true });
      
      console.log(`Onay e-postası ${ticket.Customer.contactEmail} adresine PDF ekiyle başarıyla gönderildi.`);
    } catch (pdfError) {
      console.error('PDF attachment creation error:', pdfError);
      console.error('Hata stack trace:', pdfError.stack);
      
      // PDF hatası olsa bile e-postayı göndermeye devam et
      console.log('PDF eki olmadan e-posta gönderiliyor...');
      const emailHTML = await getApprovalRequestEmail(ticket, approvalLink, rejectLink);
      
      await sendEmail({
        to: ticket.Customer.contactEmail,
        subject: 'Servis Formu Onay Talebi',
        html: emailHTML
      });
    }
    
    res.json({ 
      message: 'Onay e-postası başarıyla gönderildi.',
      sentTo: ticket.Customer.contactEmail
    });
  } catch (error) {
    console.error('Send approval email error:', error);
    res.status(500).json({ error: 'E-posta gönderilirken bir hata oluştu.' });
  }
};

// Process approval from email link
exports.processExternalApproval = async (req, res) => {
  try {
    const { token, action } = req.params;
    
    if (!token || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Geçersiz istek.' });
    }
    
    // Find ticket by approval token
    const ticket = await SupportTicket.findOne({
      where: { approvalToken: token },
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'contactPerson', 'contactEmail']
        },
        {
          model: Category,
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'supportStaff',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Geçersiz veya süresi dolmuş onay linki.' });
    }
    
    // Check if ticket is already approved/rejected
    if (ticket.status !== 'pending') {
      return res.json({
        message: 'Bu hizmet servis formu zaten işlendi.',
        ticket: {
          id: ticket.id,
          status: ticket.status,
          customer: ticket.Customer.name,
          approvalDate: ticket.approvalDate
        }
      });
    }
    
    // Get reject reason if action is reject
    const rejectReason = req.body.reason || 'Onay reddedildi.';
    
    // Update ticket
    const status = action === 'approve' ? 'approved' : 'rejected';
    await ticket.update({
      status,
      approvalDate: new Date(),
      approvalNotes: status === 'rejected' ? rejectReason : '',
      externalApproval: true,
      approvalToken: null  // Geçersiz kıl token'ı, aynı link tekrar kullanılamasın
    });
    
    // Send confirmation email
    if (ticket.Customer.contactEmail) {
      const emailHTML = await getApprovalCompletedEmail(ticket, status);
      
      await sendEmail({
        to: ticket.Customer.contactEmail,
        subject: `Servis Formu ${status === 'approved' ? 'Onaylandı' : 'Reddedildi'}`,
        html: emailHTML
      });
    }
    
    // Return success
    res.json({
      message: `Hizmet servis formu başarıyla ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`,
      ticket: {
        id: ticket.id,
        status,
        customer: ticket.Customer.name,
        approvalDate: new Date()
      }
    });
  } catch (error) {
    console.error('Process approval error:', error);
    res.status(500).json({ error: 'İşlem sırasında bir hata oluştu.' });
  }
};

// Verify approval token (for frontend to check token validity)
exports.verifyApprovalToken = async (req, res) => {
try {
const { token } = req.params;

// Find ticket by approval token
const ticket = await SupportTicket.findOne({
where: { approvalToken: token },
include: [
{
model: Customer,
attributes: ['id', 'name']
},
{
model: Category,
attributes: ['id', 'name']
},
{
model: User,
as: 'supportStaff',
attributes: ['id', 'firstName', 'lastName']
}
]
});

// Kontrol et: token null veya ticket bulunamadıysa
if (!ticket) {
  // İlk durumda token geçersiz olabilir, ancak ticket ID'si ile bulunabilir mi diye kontrol edelim
  // Bu, onaylanmış veya reddedilmiş bir bilet token'ının kullanılmaya çalışıldığı durumları yakalar
  const processedTicket = await SupportTicket.findOne({
  where: { 
    approvalToken: null,
  status: ['approved', 'rejected'] 
},
include: [
  {
    model: Customer,
    attributes: ['id', 'name']
  },
  {
    model: Category,
    attributes: ['id', 'name']
    },
      {
          model: User,
        as: 'supportStaff',
        attributes: ['id', 'firstName', 'lastName']
        }
        ]
      });
      
      if (processedTicket) {
        return res.json({
          valid: false,
          processed: true,
          message: `Bu hizmet servis formu zaten ${processedTicket.status === 'approved' ? 'onaylanmış' : 'reddedilmiş'}.`,
          ticket: {
            id: processedTicket.id,
            status: processedTicket.status,
            customer: processedTicket.Customer.name,
            approvalDate: processedTicket.approvalDate
          }
        });
      }
      
      return res.status(404).json({ valid: false, error: 'Geçersiz veya süresi dolmuş onay linki.' });
    }
    
    // Bilet zaten onaylanmış veya reddedilmiş mi?
    if (ticket.status !== 'pending') {
      return res.json({
        valid: false,
        processed: true,
        message: `Bu hizmet servis formu zaten ${ticket.status === 'approved' ? 'onaylanmış' : 'reddedilmiş'}.`,
        ticket: {
          id: ticket.id,
          status: ticket.status,
          customer: ticket.Customer.name,
          approvalDate: ticket.approvalDate
        }
      });
    }
    
    res.json({
      valid: true,
      ticket: {
        id: ticket.id,
        status: ticket.status,
        customer: ticket.Customer.name,
        startTime: ticket.startTime,
        endTime: ticket.endTime,
        category: ticket.Category.name,
        supportStaff: `${ticket.supportStaff.firstName} ${ticket.supportStaff.lastName}`,
        subject: ticket.subject || '',
        description: ticket.description,
        location: ticket.location || ''
      }
    });
  } catch (error) {
    console.error('Verify approval token error:', error);
    res.status(500).json({ valid: false, error: 'Token doğrulanırken bir hata oluştu.' });
  }
};