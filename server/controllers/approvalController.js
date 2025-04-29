const { SupportTicket, Customer, Category, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { sendEmail } = require('../utils/email/emailService');
const { getApprovalRequestEmail, getApprovalCompletedEmail } = require('../utils/email/emailTemplates');

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
      return res.status(400).json({ error: 'Bu destek kaydı zaten onaylanmış veya reddedilmiş.' });
    }
    
    // Check if customer has contact email
    if (!ticket.Customer.contactEmail) {
      return res.status(400).json({ error: 'Müşteri için e-posta adresi bulunamadı.' });
    }
    
    // Generate approval token
    const approvalToken = uuidv4();
    
    // Update ticket with approval token
    await ticket.update({
      approvalToken,
      emailSent: true
    });
    
    // Create approval and reject links
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const approvalLink = `${baseUrl}/ticket-approval/${approvalToken}/approve`;
    const rejectLink = `${baseUrl}/ticket-approval/${approvalToken}/reject`;
    
    // Prepare email
    const emailHTML = getApprovalRequestEmail(ticket, approvalLink, rejectLink);
    
    // Send email
    await sendEmail({
      to: ticket.Customer.contactEmail,
      subject: 'IES Yazılım Destek Kaydı Onay Talebi',
      html: emailHTML
    });
    
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
        message: 'Bu destek kaydı zaten işlendi.',
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
      externalApproval: true
    });
    
    // Send confirmation email
    if (ticket.Customer.contactEmail) {
      const emailHTML = getApprovalCompletedEmail(ticket, status);
      
      await sendEmail({
        to: ticket.Customer.contactEmail,
        subject: `IES Yazılım Destek Kaydı ${status === 'approved' ? 'Onaylandı' : 'Reddedildi'}`,
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
    
    if (!ticket) {
      return res.status(404).json({ valid: false, error: 'Geçersiz veya süresi dolmuş onay linki.' });
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
        description: ticket.description
      }
    });
  } catch (error) {
    console.error('Verify approval token error:', error);
    res.status(500).json({ valid: false, error: 'Token doğrulanırken bir hata oluştu.' });
  }
};