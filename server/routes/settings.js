const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Setting } = require('../models');

// Şirket bilgilerini getir (herkes)
router.get('/company/info', async (req, res) => {
  try {
    const setting = await Setting.findByPk('companyInfo');
    
    if (!setting) {
      // Varsayılan değerler
      return res.status(200).json({
        name: 'IES YAZILIM VE DANIŞMANLIK SAN. TİC. LTD. ŞTİ.',
        shortName: 'IES Yazılım'
      });
    }
    
    let companyInfo;
    try {
      companyInfo = JSON.parse(setting.value);
    } catch (e) {
      companyInfo = {
        name: 'IES YAZILIM VE DANIŞMANLIK SAN. TİC. LTD. ŞTİ.',
        shortName: 'IES Yazılım'
      };
    }
    
    res.status(200).json(companyInfo);
  } catch (error) {
    console.error('Şirket bilgileri getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Şirket bilgileri getirilirken bir hata oluştu', error: error.message });
  }
});

// Şirket bilgilerini güncelle (admin)
router.put('/company/info', auth.authenticate, async (req, res) => {
  try {
    const { name, shortName } = req.body;
    
    if (!name || !shortName) {
      return res.status(400).json({ message: 'name ve shortName alanları gereklidir' });
    }
    
    const companyInfo = { name, shortName };
    
    // Ayar var mı kontrol et
    const [setting, created] = await Setting.findOrCreate({
      where: { key: 'companyInfo' },
      defaults: {
        value: JSON.stringify(companyInfo),
        description: 'Şirket bilgileri'
      }
    });
    
    // Eğer ayar varsa güncelle
    if (!created) {
      await setting.update({
        value: JSON.stringify(companyInfo)
      });
    }
    
    res.status(200).json({ 
      message: created ? 'Şirket bilgileri oluşturuldu' : 'Şirket bilgileri güncellendi',
      companyInfo
    });
  } catch (error) {
    console.error('Şirket bilgileri güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Şirket bilgileri güncellenirken bir hata oluştu', error: error.message });
  }
});

// Logo ayarlarını getir (herkes)
router.get('/company/logo', async (req, res) => {
  try {
    const setting = await Setting.findByPk('logoSettings');
    
    if (!setting) {
      return res.status(200).json({
        companyLogo: null
      });
    }
    
    let logoSettings;
    try {
      logoSettings = JSON.parse(setting.value);
    } catch (e) {
      logoSettings = {
        companyLogo: null
      };
    }
    
    res.status(200).json(logoSettings);
  } catch (error) {
    console.error('Logo ayarları getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Logo ayarları getirilirken bir hata oluştu', error: error.message });
  }
});

// Logo ayarlarını güncelle (admin)
router.put('/company/logo', auth.authenticate, async (req, res) => {
  try {
    const { companyLogo } = req.body;
    
    const logoSettings = { companyLogo };
    
    // Ayar var mı kontrol et
    const [setting, created] = await Setting.findOrCreate({
      where: { key: 'logoSettings' },
      defaults: {
        value: JSON.stringify(logoSettings),
        description: 'Logo ayarları'
      }
    });
    
    // Eğer ayar varsa güncelle
    if (!created) {
      await setting.update({
        value: JSON.stringify(logoSettings)
      });
    }
    
    res.status(200).json({ 
      message: created ? 'Logo ayarları oluşturuldu' : 'Logo ayarları güncellendi',
      logoSettings
    });
  } catch (error) {
    console.error('Logo ayarları güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Logo ayarları güncellenirken bir hata oluştu', error: error.message });
  }
});

// Tüm ayarları getir (admin)
router.get('/', auth.authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
    }

    const settings = await Setting.findAll();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Ayarlar getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Ayarlar getirilirken bir hata oluştu', error: error.message });
  }
});

// Belirli bir ayarı getir (admin)
router.get('/:key', auth.authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
    }

    const { key } = req.params;
    const setting = await Setting.findByPk(key);
    
    if (!setting) {
      return res.status(404).json({ message: 'Ayar bulunamadı' });
    }
    
    res.status(200).json(setting);
  } catch (error) {
    console.error('Ayar getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Ayar getirilirken bir hata oluştu', error: error.message });
  }
});

// Ayar güncelle (admin)
router.put('/:key', auth.authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu işlemi yapma yetkiniz yok' });
    }

    const { key } = req.params;
    const { value, description } = req.body;
    
    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: {
        key,
        value,
        description: description || `${key} ayarı`
      }
    });
    
    if (!created) {
      setting.value = value;
      if (description) setting.description = description;
      await setting.save();
    }
    
    res.status(200).json({ 
      message: created ? 'Ayar oluşturuldu' : 'Ayar güncellendi', 
      setting 
    });
  } catch (error) {
    console.error('Ayar güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Ayar güncellenirken bir hata oluştu', error: error.message });
  }
});

module.exports = router;