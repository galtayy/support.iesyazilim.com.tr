require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

// Admin kullanıcı bilgileri
const adminUser = {
  id: uuidv4(),
  firstName: 'Admin',
  lastName: 'Kullanıcı',
  email: 'admin@iesyazilim.com.tr',
  password: 'admin123', // Bu şifre hashlenmeden önce
  role: 'admin',
  active: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Veritabanı bağlantısı kurulumu
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: console.log
  }
);

// Admin kullanıcısını oluştur
async function createAdminUser() {
  try {
    await sequelize.authenticate();
    console.log('Veritabanı bağlantısı başarılı.');

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminUser.password, salt);
    adminUser.password = hashedPassword;

    // Kullanıcı tablosunu kontrol et
    const [results] = await sequelize.query('SHOW TABLES LIKE "users"');
    
    if (results.length === 0) {
      console.error('Users tablosu bulunamadı! Önce modelleri oluşturmak için ana uygulamayı çalıştırın.');
      process.exit(1);
    }

    // Email ile kullanıcı var mı kontrol et
    const [existingUsers] = await sequelize.query(
      'SELECT * FROM users WHERE email = :email',
      {
        replacements: { email: adminUser.email },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (existingUsers && existingUsers.length > 0) {
      console.log('Admin kullanıcısı zaten mevcut!');
      process.exit(0);
    }

    // Admin kullanıcısını ekle
    await sequelize.query(
      `INSERT INTO users (id, firstName, lastName, email, password, role, active, createdAt, updatedAt) 
       VALUES (:id, :firstName, :lastName, :email, :password, :role, :active, :createdAt, :updatedAt)`,
      {
        replacements: adminUser,
        type: Sequelize.QueryTypes.INSERT
      }
    );

    console.log('Admin kullanıcısı başarıyla oluşturuldu:');
    console.log('----------------------------------------');
    console.log('Email: ' + adminUser.email);
    console.log('Şifre: admin123');
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await sequelize.close();
  }
}

// Fonksiyonu çalıştır
createAdminUser();