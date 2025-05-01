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

// Send email
const sendEmail = async (options) => {
  try {
    // Create mail options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments || [] // Dosya ekleri için yeni alan
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = { sendEmail };