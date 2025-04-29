const { Customer } = require('../models');
const { validationResult } = require('express-validator');

// Get all customers
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(customers);
  } catch (error) {
    console.error('Get all customers error:', error);
    res.status(500).json({ error: 'Müşteriler alınırken bir hata oluştu.' });
  }
};

// Get active customers
exports.getActiveCustomers = async (req, res) => {
  try {
    const customers = await Customer.findAll({
      where: { active: true },
      order: [['name', 'ASC']]
    });
    
    res.json(customers);
  } catch (error) {
    console.error('Get active customers error:', error);
    res.status(500).json({ error: 'Aktif müşteriler alınırken bir hata oluştu.' });
  }
};

// Get single customer by ID
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı.' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Get customer by id error:', error);
    res.status(500).json({ error: 'Müşteri alınırken bir hata oluştu.' });
  }
};

// Create new customer
exports.createCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, contactPerson, contactEmail, contactPhone, notes } = req.body;
    
    // Check if customer name already exists
    const existingCustomer = await Customer.findOne({ where: { name } });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Bu müşteri adı zaten kullanılıyor.' });
    }
    
    // Create new customer
    const customer = await Customer.create({
      name,
      address,
      contactPerson,
      contactEmail,
      contactPhone,
      notes
    });
    
    res.status(201).json(customer);
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Müşteri oluşturulurken bir hata oluştu.' });
  }
};

// Update customer
exports.updateCustomer = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, contactPerson, contactEmail, contactPhone, notes, active } = req.body;
    
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı.' });
    }
    
    // Check if name is being changed and already exists
    if (name && name !== customer.name) {
      const existingCustomer = await Customer.findOne({ where: { name } });
      if (existingCustomer) {
        return res.status(400).json({ error: 'Bu müşteri adı zaten kullanılıyor.' });
      }
    }
    
    // Update customer
    if (name) customer.name = name;
    if (address !== undefined) customer.address = address;
    if (contactPerson !== undefined) customer.contactPerson = contactPerson;
    if (contactEmail !== undefined) customer.contactEmail = contactEmail;
    if (contactPhone !== undefined) customer.contactPhone = contactPhone;
    if (notes !== undefined) customer.notes = notes;
    if (active !== undefined) customer.active = active;
    
    await customer.save();
    
    res.json(customer);
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Müşteri güncellenirken bir hata oluştu.' });
  }
};

// Delete customer
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ error: 'Müşteri bulunamadı.' });
    }
    
    await customer.destroy();
    
    res.json({ message: 'Müşteri başarıyla silindi.' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Müşteri silinirken bir hata oluştu.' });
  }
};