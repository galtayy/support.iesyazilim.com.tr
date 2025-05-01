const { SupportTicket, Customer, Category, User } = require('../models');
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
      return res.status(404).json({ error: 'Destek kaydı bulunamadı.' });
    }
    
    // Check if ticket is already approved/rejected
    if (ticket.status !== 'pending') {
      return res.status(400).json({ error: 'Bu servis kaydı zaten onaylanmış veya reddedilmiş.' });
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
      ? 'https://support.iesyazilim.com.tr' 
      : (process.env.APP_URL || 'http://localhost:3001');
    const approvalLink = `${baseUrl}/ticket-approval/${approvalToken}/approve`;
    const rejectLink = `${baseUrl}/ticket-approval/${approvalToken}/reject`;
    
    // API ve client base URL'lerini ayarla
    const apiBaseUrl = process.env.NODE_ENV === 'production'
      ? 'https://support.iesyazilim.com.tr/api'
      : 'http://localhost:5051/api';
      
    // Generate PDF file and send as attachment to email
    try {
      // PDF buffer oluştur
      const pdfBuffer = await generateTicketPDFToBuffer(ticket);
      
      // PDF dosyası için dosya adı oluştur
      const pdfFileName = `servis-kaydi-${ticket.id}.pdf`;
      
      // Prepare email with PDF attachment
      const emailHTML = getApprovalRequestEmail(ticket, approvalLink, rejectLink);
      
      // Send email with attachment
      await sendEmail({
        to: ticket.Customer.contactEmail,
        subject: 'IES Yazılım Servis Kaydı Onay Talebi',
        html: emailHTML,
        attachments: [
          {
            filename: pdfFileName,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });
    } catch (pdfError) {
      console.error('PDF attachment creation error:', pdfError);
      // PDF hatası olsa bile e-postayı göndermeye devam et
      const emailHTML = getApprovalRequestEmail(ticket, approvalLink, rejectLink);
      
      await sendEmail({
        to: ticket.Customer.contactEmail,
        subject: 'IES Yazılım Servis Kaydı Onay Talebi',
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
        message: 'Bu servis kaydı zaten işlendi.',
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
      const emailHTML = getApprovalCompletedEmail(ticket, status);
      
      await sendEmail({
        to: ticket.Customer.contactEmail,
        subject: `IES Yazılım Servis Kaydı ${status === 'approved' ? 'Onaylandı' : 'Reddedildi'}`,
        html: emailHTML
      });
    }
    
    // Return success
    res.json({
      message: `Destek kaydı başarıyla ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`,
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
          message: `Bu servis kaydı zaten ${processedTicket.status === 'approved' ? 'onaylanmış' : 'reddedilmiş'}.`,
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
        message: `Bu servis kaydı zaten ${ticket.status === 'approved' ? 'onaylanmış' : 'reddedilmiş'}.`,
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