const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    // Disable certificate validation since there's a mismatch
    rejectUnauthorized: false
  }
});

// E-posta gönderimi (düz dosya yolu desteği ile)
const sendEmail = async (options) => {
  try {
    console.log('E-posta gönderimi başlıyor...');
    
    // Eklentileri kontrol et
    const hasAttachments = options.attachments && options.attachments.length > 0;
    
    if (hasAttachments) {
      console.log(`E-posta eklentileri: ${options.attachments.length} adet`);
      options.attachments.forEach((attachment, idx) => {
        if (attachment.path) {
          const fs = require('fs');
          // Dosya var mı ve okunabilir mi kontrol et
          try {
            const stats = fs.statSync(attachment.path);
            console.log(`- Eklenti ${idx+1}: "${attachment.filename}" (dosya: ${attachment.path}, boyut: ${stats.size} bytes)`);
          } catch (err) {
            console.error(`- Eklenti ${idx+1}: "${attachment.filename}" (dosya bulunamadı veya okunamadı: ${attachment.path})`);
          }
        } else if (Buffer.isBuffer(attachment.content)) {
          console.log(`- Eklenti ${idx+1}: "${attachment.filename}" (buffer, boyut: ${attachment.content.length} bytes)`);
        } else {
          console.log(`- Eklenti ${idx+1}: "${attachment.filename}"`);
        }
      });
    }
    
    // E-posta ayarları
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || []
    };
    
    console.log('E-posta gönderiliyor...');
    const info = await transporter.sendMail(mailOptions);
    
    if (info.messageId) {
      console.log('✅ E-posta başarıyla gönderildi!');
      console.log('- Message ID:', info.messageId);
      console.log('- Alıcı:', options.to);
      if (hasAttachments) {
        console.log('- Eklentiler: Gönderildi');
      }
    }
    
    return info;
  } catch (error) {
    console.error('❌ E-posta gönderme hatası:', error.message);
    console.error('Hata detayları:', error);
    throw error;
  }
};

module.exports = { sendEmail };