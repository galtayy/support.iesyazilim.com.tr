const { Category } = require('../models');
const { validationResult } = require('express-validator');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(categories);
  } catch (error) {
    console.error('Get all categories error:', error);
    res.status(500).json({ error: 'Kategoriler alınırken bir hata oluştu.' });
  }
};

// Get single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı.' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Get category by id error:', error);
    res.status(500).json({ error: 'Kategori alınırken bir hata oluştu.' });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color } = req.body;
    
    // Check if name already exists
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ error: 'Bu kategori adı zaten kullanılıyor.' });
    }
    
    // Create new category
    const category = await Category.create({
      name,
      description,
      color: color || '#3A7BD5'
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Kategori oluşturulurken bir hata oluştu.' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, color, active } = req.body;
    
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı.' });
    }
    
    // Check if name is being changed and already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({ error: 'Bu kategori adı zaten kullanılıyor.' });
      }
    }
    
    // Update category
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (color) category.color = color;
    if (active !== undefined) category.active = active;
    
    await category.save();
    
    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Kategori güncellenirken bir hata oluştu.' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Kategori bulunamadı.' });
    }
    
    await category.destroy();
    
    res.json({ message: 'Kategori başarıyla silindi.' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Kategori silinirken bir hata oluştu.' });
  }
};