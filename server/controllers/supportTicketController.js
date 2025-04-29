const { SupportTicket, Customer, Category, User, TicketImage, sequelize } = require('../models');
const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Setup file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', process.env.UPLOAD_PATH || 'uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFileName);
  }
});

// Setup upload options
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // Default 5MB
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Yalnızca resim dosyaları yüklenebilir.'), false);
    }
    cb(null, true);
  }
});

// Get all tickets
exports.getAllTickets = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { status, startDate, endDate, customerId, categoryId, supportStaffId } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Build where clause for filtering
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (startDate && endDate) {
      whereClause.startTime = {
        [sequelize.Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.startTime = {
        [sequelize.Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.startTime = {
        [sequelize.Op.lte]: new Date(endDate)
      };
    }
    
    if (customerId) {
      whereClause.customerId = customerId;
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    
    if (supportStaffId) {
      whereClause.supportStaffId = supportStaffId;
    }
    
    // If not admin, only show user's own tickets
    if (req.user.role !== 'admin') {
      whereClause.supportStaffId = req.user.id;
    }
    
    // Get tickets with pagination and filtering
    const { count, rows: tickets } = await SupportTicket.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          attributes: ['id', 'name']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'supportStaff',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: TicketImage,
          attributes: ['id', 'imagePath', 'description']
        }
      ],
      order: [['startTime', 'DESC']],
      limit,
      offset
    });
    
    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      tickets
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({ error: 'Destek kayıtları alınırken bir hata oluştu.' });
  }
};

// Get ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id, {
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
          attributes: ['id', 'imagePath', 'description']
        }
      ]
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Destek kaydı bulunamadı.' });
    }
    
    // Check if user has permission to view this ticket
    if (req.user.role !== 'admin' && ticket.supportStaffId !== req.user.id) {
      return res.status(403).json({ error: 'Bu destek kaydını görüntüleme yetkiniz yok.' });
    }
    
    res.json(ticket);
  } catch (error) {
    console.error('Get ticket by id error:', error);
    res.status(500).json({ error: 'Destek kaydı alınırken bir hata oluştu.' });
  }
};

// Create new ticket
exports.createTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId, categoryId, description, startTime, endTime, location } = req.body;
    
    // Create ticket
    const ticket = await SupportTicket.create({
      supportStaffId: req.user.id,
      customerId,
      categoryId,
      description,
      startTime,
      endTime,
      location,
      status: 'pending'
    });
    
    // Return created ticket
    const createdTicket = await SupportTicket.findByPk(ticket.id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'supportStaff',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    res.status(201).json(createdTicket);
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ error: 'Destek kaydı oluşturulurken bir hata oluştu.' });
  }
};

// Update ticket
exports.updateTicket = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerId, categoryId, description, startTime, endTime, location } = req.body;
    
    const ticket = await SupportTicket.findByPk(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Destek kaydı bulunamadı.' });
    }
    
    // Check if user has permission to update this ticket
    if (req.user.role !== 'admin' && ticket.supportStaffId !== req.user.id) {
      return res.status(403).json({ error: 'Bu destek kaydını güncelleme yetkiniz yok.' });
    }
    
    // Check if ticket is already approved/rejected
    if (ticket.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ error: 'Onaylanmış veya reddedilmiş destek kaydı güncellenemez.' });
    }
    
    // Update ticket
    if (customerId) ticket.customerId = customerId;
    if (categoryId) ticket.categoryId = categoryId;
    if (description) ticket.description = description;
    if (startTime) ticket.startTime = startTime;
    if (endTime) ticket.endTime = endTime;
    if (location !== undefined) ticket.location = location;
    
    await ticket.save();
    
    // Return updated ticket
    const updatedTicket = await SupportTicket.findByPk(ticket.id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'supportStaff',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: TicketImage,
          attributes: ['id', 'imagePath', 'description']
        }
      ]
    });
    
    res.json(updatedTicket);
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ error: 'Destek kaydı güncellenirken bir hata oluştu.' });
  }
};

// Approve or reject ticket
exports.updateTicketStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, approvalNotes } = req.body;
    
    const ticket = await SupportTicket.findByPk(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ error: 'Destek kaydı bulunamadı.' });
    }
    
    // Only admin can approve/reject tickets
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Destek kayıtlarını onaylama/reddetme yetkiniz yok.' });
    }
    
    // Update ticket status
    ticket.status = status;
    ticket.approverId = req.user.id;
    ticket.approvalDate = new Date();
    ticket.approvalNotes = approvalNotes || null;
    
    await ticket.save();
    
    // Return updated ticket
    const updatedTicket = await SupportTicket.findByPk(ticket.id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'supportStaff',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    res.json(updatedTicket);
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({ error: 'Destek kaydı durumu güncellenirken bir hata oluştu.' });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findByPk(req.params.id, {
      include: [{ model: TicketImage }]
    });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Destek kaydı bulunamadı.' });
    }
    
    // Check if user has permission to delete this ticket
    if (req.user.role !== 'admin' && ticket.supportStaffId !== req.user.id) {
      return res.status(403).json({ error: 'Bu destek kaydını silme yetkiniz yok.' });
    }
    
    // Check if ticket is already approved
    if (ticket.status === 'approved' && req.user.role !== 'admin') {
      return res.status(400).json({ error: 'Onaylanmış destek kaydı silinemez.' });
    }
    
    // Delete associated images from storage
    if (ticket.TicketImages && ticket.TicketImages.length > 0) {
      ticket.TicketImages.forEach(image => {
        const imagePath = path.join(__dirname, '..', image.imagePath);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      });
    }
    
    // Delete ticket (associated images will be deleted via CASCADE)
    await ticket.destroy();
    
    res.json({ message: 'Destek kaydı başarıyla silindi.' });
  } catch (error) {
    console.error('Delete ticket error:', error);
    res.status(500).json({ error: 'Destek kaydı silinirken bir hata oluştu.' });
  }
};

// Upload image for a ticket
exports.uploadTicketImage = async (req, res) => {
  const uploader = upload.single('image');
  
  uploader(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    try {
      const ticketId = req.params.id;
      const { description } = req.body;
      
      // Check if ticket exists
      const ticket = await SupportTicket.findByPk(ticketId);
      if (!ticket) {
        // Delete uploaded file
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ error: 'Destek kaydı bulunamadı.' });
      }
      
      // Check if user has permission
      if (req.user.role !== 'admin' && ticket.supportStaffId !== req.user.id) {
        // Delete uploaded file
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(403).json({ error: 'Bu destek kaydına resim ekleme yetkiniz yok.' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'Lütfen bir resim yükleyin.' });
      }
      
      // Create image record
      const relativePath = path.join(process.env.UPLOAD_PATH || 'uploads', req.file.filename);
      
      const ticketImage = await TicketImage.create({
        ticketId,
        imagePath: relativePath,
        description: description || null
      });
      
      // Return image details
      res.status(201).json({
        id: ticketImage.id,
        imagePath: relativePath,
        description: ticketImage.description,
        uploadedAt: ticketImage.uploadedAt
      });
    } catch (error) {
      // Delete uploaded file on error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      
      console.error('Upload image error:', error);
      res.status(500).json({ error: 'Resim yüklenirken bir hata oluştu.' });
    }
  });
};

// Delete ticket image
exports.deleteTicketImage = async (req, res) => {
  try {
    const { id: ticketId, imageId } = req.params;
    
    // Find ticket and image
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) {
      return res.status(404).json({ error: 'Destek kaydı bulunamadı.' });
    }
    
    // Check if user has permission
    if (req.user.role !== 'admin' && ticket.supportStaffId !== req.user.id) {
      return res.status(403).json({ error: 'Bu destek kaydından resim silme yetkiniz yok.' });
    }
    
    const image = await TicketImage.findOne({
      where: {
        id: imageId,
        ticketId
      }
    });
    
    if (!image) {
      return res.status(404).json({ error: 'Resim bulunamadı.' });
    }
    
    // Delete image file
    const imagePath = path.join(__dirname, '..', image.imagePath);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // Delete image record
    await image.destroy();
    
    res.json({ message: 'Resim başarıyla silindi.' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Resim silinirken bir hata oluştu.' });
  }
};

module.exports = {
  getAllTickets: exports.getAllTickets,
  getTicketById: exports.getTicketById,
  createTicket: exports.createTicket,
  updateTicket: exports.updateTicket,
  updateTicketStatus: exports.updateTicketStatus,
  deleteTicket: exports.deleteTicket,
  uploadTicketImage: exports.uploadTicketImage,
  deleteTicketImage: exports.deleteTicketImage
};