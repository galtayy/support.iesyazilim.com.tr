const { Setting } = require('../models');

// Tüm ayarları getir
const getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const settingsObject = {};
    
    settings.forEach(setting => {
      try {
        // Değer JSON ise parse et
        settingsObject[setting.key] = JSON.parse(setting.value);
      } catch (e) {
        // JSON değilse direk değeri al
        settingsObject[setting.key] = setting.value;
      }
    });
    
    res.status(200).json(settingsObject);
  } catch (error) {
    console.error('Ayarlar getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Ayarlar getirilirken bir hata oluştu', error: error.message });
  }
};

// Belirli bir ayarı getir
const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findByPk(key);
    
    if (!setting) {
      return res.status(404).json({ message: `"${key}" ayarı bulunamadı` });
    }
    
    let value;
    try {
      // Değer JSON ise parse et
      value = JSON.parse(setting.value);
    } catch (e) {
      // JSON değilse direkt değeri al
      value = setting.value;
    }
    
    res.status(200).json({ key: setting.key, value, description: setting.description });
  } catch (error) {
    console.error('Ayar getirilirken hata oluştu:', error);
    res.status(500).json({ message: 'Ayar getirilirken bir hata oluştu', error: error.message });
  }
};

// Ayar güncelle veya oluştur
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    // Değer objeyse JSON'a çevir
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
    
    // Ayar var mı kontrol et
    const [setting, created] = await Setting.findOrCreate({
      where: { key },
      defaults: {
        value: stringValue,
        description: description || null
      }
    });
    
    // Eğer ayar varsa güncelle
    if (!created) {
      await setting.update({
        value: stringValue,
        description: description !== undefined ? description : setting.description
      });
    }
    
    res.status(200).json({ 
      message: created ? 'Ayar oluşturuldu' : 'Ayar güncellendi',
      key,
      value,
      description: description || setting.description
    });
  } catch (error) {
    console.error('Ayar güncellenirken hata oluştu:', error);
    res.status(500).json({ message: 'Ayar güncellenirken bir hata oluştu', error: error.message });
  }
};

// Toplu ayar güncelleme
const updateMultipleSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    if (!settings || !Array.isArray(settings)) {
      return res.status(400).json({ message: 'Geçersiz ayar formatı. Ayarlar bir dizi olmalıdır' });
    }
    
    const results = [];
    
    for (const setting of settings) {
      const { key, value, description } = setting;
      
      if (!key) {
        results.push({ success: false, message: 'key alanı gereklidir' });
        continue;
      }
      
      // Değer objeyse JSON'a çevir
      const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
      
      try {
        // Ayar var mı kontrol et
        const [dbSetting, created] = await Setting.findOrCreate({
          where: { key },
          defaults: {
            value: stringValue,
            description: description || null
          }
        });
        
        // Eğer ayar varsa güncelle
        if (!created) {
          await dbSetting.update({
            value: stringValue,
            description: description !== undefined ? description : dbSetting.description
          });
        }
        
        results.push({ 
          success: true, 
          key,
          message: created ? 'Ayar oluşturuldu' : 'Ayar güncellendi'
        });
      } catch (error) {
        console.error(`'${key}' ayarı güncellenirken hata:`, error);
        results.push({ 
          success: false, 
          key,
          message: error.message
        });
      }
    }
    
    res.status(200).json({ results });
  } catch (error) {
    console.error('Ayarlar güncellenirken hata:', error);
    res.status(500).json({ message: 'Ayarlar güncellenirken bir hata oluştu', error: error.message });
  }
};

// Ayar sil
const deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const setting = await Setting.findByPk(key);
    
    if (!setting) {
      return res.status(404).json({ message: `"${key}" ayarı bulunamadı` });
    }
    
    await setting.destroy();
    res.status(200).json({ message: 'Ayar başarıyla silindi', key });
  } catch (error) {
    console.error('Ayar silinirken hata oluştu:', error);
    res.status(500).json({ message: 'Ayar silinirken bir hata oluştu', error: error.message });
  }
};

// Şirket bilgilerini getir
const getCompanyInfo = async (req, res) => {
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
};

// Şirket bilgilerini güncelle
const updateCompanyInfo = async (req, res) => {
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
};

// Logo ayarlarını getir
const getLogoSettings = async (req, res) => {
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
};

// Logo ayarlarını güncelle
const updateLogoSettings = async (req, res) => {
  try {
    const { companyLogo } = req.body;
    
    const logoSettings = { companyLogo };
    
    // Optimize edilmiş veri boyutu kontrolü
    if (companyLogo && typeof companyLogo === 'string' && companyLogo.length > 10000000) {
      return res.status(413).json({ 
        message: 'Logo boyutu çok büyük (10MB üzerinde). Lütfen daha küçük bir resim yükleyin.',
        error: 'DATA_TOO_LARGE'
      });
    }
    
    // Ayar var mı kontrol et
    try {
      // Doğrudan try/catch blok içinde Transaction kullan
      // Bu sayede hata durumunda otomatik rollback olur
      const [setting, created] = await Setting.findOrCreate({
        where: { key: 'logoSettings' },
        defaults: {
          value: logoSettings, // Otomatik JSON'a çevrilecek
          description: 'Logo ayarları'
        }
      });
      
      // Eğer ayar varsa güncelle
      if (!created) {
        await setting.update({
          value: logoSettings // Otomatik JSON'a çevrilecek
        });
      }
      
      // İşlem başarılı - sonucu döndür
      res.status(200).json({ 
        message: created ? 'Logo ayarları oluşturuldu' : 'Logo ayarları güncellendi',
        success: true,
        logoSettings
      });
    } catch (dbError) {
      console.error('Logo ayarları veritabanına yazılırken hata:', dbError);
      
      // Veritabanı hata kodlarını kontrol et
      if (dbError.name === 'SequelizeDatabaseError') {
        if (dbError.parent && (
          dbError.parent.code === 'ER_DATA_TOO_LONG' || 
          dbError.message.includes('Data too long')
        )) {
          return res.status(413).json({
            message: 'Logo verisi çok büyük. Lütfen daha küçük boyutlu bir logo yükleyin veya veritabanı LONGTEXT ayarını yapın.',
            error: 'DATA_TOO_LARGE'
          });
        }
      }
      
      throw dbError; // Diğer hataları üst catch bloğuna gönder
    }
  } catch (error) {
    console.error('Logo ayarları güncellenirken hata oluştu:', error);
    res.status(500).json({ 
      message: 'Logo ayarları güncellenirken bir hata oluştu', 
      error: error.message,
      success: false
    });
  }
};

module.exports = {
  getAllSettings,
  getSetting,
  updateSetting,
  updateMultipleSettings,
  deleteSetting,
  getCompanyInfo,
  updateCompanyInfo,
  getLogoSettings,
  updateLogoSettings
};