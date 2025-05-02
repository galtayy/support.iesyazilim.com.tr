/**
 * Email templates for the application
 */

// Get approval request email template
const getApprovalRequestEmail = async (ticket, approvalLink, rejectLink, pdfUrl = null) => {
  const date = new Date(ticket.startTime).toLocaleDateString('tr-TR');
  const startTime = new Date(ticket.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(ticket.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  
  // Calculate duration
  const start = new Date(ticket.startTime);
  const end = new Date(ticket.endTime);
  const durationHours = ((end - start) / (1000 * 60 * 60)).toFixed(1);
  
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.APP_URL || 'https://support.iesyazilim.com.tr' 
    : process.env.APP_URL || 'https://support.iesyazilim.com.tr';
    
  // Şirket bilgilerini getir
  const { Setting } = require('../../models');
  let companyName = 'IES YAZILIM VE DANIŞMANLIK';
  let companyShortName = 'IES Yazılım';
  
  try {
    // Veritabanından şirket bilgilerini al
    const companyInfoSetting = await Setting.findByPk('companyInfo');
    if (companyInfoSetting) {
      const companyInfo = JSON.parse(companyInfoSetting.value);
      if (companyInfo.name) companyName = companyInfo.name;
      if (companyInfo.shortName) companyShortName = companyInfo.shortName;
    }
  } catch (error) {
    console.error('Şirket bilgileri alınamadı:', error);
    // Varsayılan değerleri kullan
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Servis Formu Onay Talebi</title>
      <style>
        /* Base styles */
        * {
          box-sizing: border-box;
        }
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.65;
          background-color: #f6f9fd;
          color: #333;
        }
        
        /* Layout */
        .container {
          max-width: 680px;
          margin: 0 auto;
          margin-top: 20px;
          margin-bottom: 20px;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
        }

        /* Header with gradient background */
        .header {
          background: linear-gradient(135deg, #2563eb, #3b82f6, #1e40af);
          color: white;
          padding: 35px 40px;
          position: relative;
          overflow: hidden;
        }
        
        .header-bg {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 0;
        }
        
        .header-bg:before, .header-bg:after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .header-bg:before {
          width: 300px;
          height: 300px;
          top: -100px;
          right: -50px;
        }
        
        .header-bg:after {
          width: 200px;
          height: 200px;
          bottom: -70px;
          left: -40px;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.2px;
          line-height: 1.3;
        }
        
        .header p {
          margin: 10px 0 0;
          opacity: 0.9;
          font-size: 16px;
          font-weight: 300;
        }
        
        /* Logo */
        .logo {
          margin-bottom: 20px;
        }
        
        .logo img {
          height: 40px;
        }
        
        /* Content */
        .content {
          padding: 36px 40px;
          background-color: #fff;
        }
        
        .greeting {
          font-size: 20px;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 20px;
        }
        
        .message {
          color: #4a5568;
          margin-bottom: 30px;
          font-size: 16px;
          line-height: 1.6;
        }
        
        /* Card with details */
        .details-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 24px;
          margin-bottom: 30px;
          position: relative;
        }
        
        .card-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e2e8f0;
          position: relative;
        }
        
        .card-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #2563eb;
        }
        
        .card-icon {
          position: absolute;
          right: 0;
          top: 0;
          color: rgba(37, 99, 235, 0.1);
          font-size: 40px;
        }
        
        /* Table Style */
        .detail-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
          border-radius: 10px;
          overflow: hidden;
        }
        
        .detail-table th, .detail-table td {
          text-align: left;
          padding: 14px 16px;
          border: 1px solid #e2e8f0;
        }
        
        .detail-table th {
          background-color: #f1f5f9;
          color: #475569;
          font-weight: 600;
          font-size: 14px;
          width: 35%;
        }
        
        .detail-table td {
          color: #334155;
          font-size: 15px;
          max-width: 65%;
        }
        
        .detail-table tr:nth-child(even) td {
          background-color: #f8fafc;
        }
        
        /* Buttons */
        .button-container {
          text-align: center;
          margin: 38px 0;
        }
        
        .button {
          display: inline-block;
          padding: 14px 36px;
          margin: 0 10px 15px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .button::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0));
          opacity: 0;
          transition: opacity 0.3s;
        }
        
        .button:hover::after {
          opacity: 1;
        }
        
        .approve {
          background-color: #10b981;
          border-bottom: 3px solid #059669;
        }
        
        .reject {
          background-color: #ef4444;
          border-bottom: 3px solid #b91c1c;
        }
        
        /* Info section */
        .info-section {
          background-color: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
        }
        
        .info-section p {
          margin: 0 0 8px;
          font-size: 15px;
          color: #334155;
        }
        
        .info-section p:last-child {
          margin-bottom: 0;
        }
        
        .info-title {
          font-weight: 700;
          color: #1e40af;
          display: inline-block;
          margin-right: 5px;
        }
        
        /* Links */
        a {
          color: #2563eb;
          text-decoration: none;
        }
        
        a:hover {
          text-decoration: underline;
        }
        
        /* Signature */
        .signature {
          border-top: 1px solid #e2e8f0;
          padding-top: 25px;
          margin-top: 30px;
        }
        
        .signature p {
          margin: 0 0 5px;
          color: #4a5568;
          font-size: 15px;
        }
        
        .company-name {
          font-weight: 700;
          color: #2563eb;
          font-size: 16px;
        }
        
        /* Footer */
        .footer {
          padding: 25px 30px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
          margin: 0 0 10px;
        }
        
        /* Responsive */
        @media only screen and (max-width: 680px) {
          .container {
            width: 100%;
            border-radius: 0;
            margin-top: 0;
            margin-bottom: 0;
            box-shadow: none;
          }
          
          .header, .content, .footer {
            padding-left: 25px;
            padding-right: 25px;
          }
          
          .button {
            display: block;
            width: 100%;
            margin-left: 0;
            margin-right: 0;
            margin-bottom: 15px;
          }
          
          .details-card {
            padding: 15px;
          }
          
          .detail-table th, 
          .detail-table td {
            display: block;
            width: 100%;
          }
          
          .detail-table th {
            padding-bottom: 5px;
            border-bottom: none;
          }
          
          .detail-table td {
            padding-top: 5px;
            padding-bottom: 15px;
            border-top: none;
            max-width: 100%;
          }
          
          .detail-table td > div {
            max-height: 200px;
            overflow-y: auto;
            overflow-x: hidden;
            width: 100%;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: break-word;
            text-align: left !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with gradient background and decorative elements -->
        <div class="header">
          <div class="header-bg"></div>
          <div class="header-content">
          <div class="logo">
          <!-- Logo placeholder - in production, use an actual logo image -->
          <span style="color: white; font-size: 24px; font-weight: 700;">${companyShortName}</span>
          </div>
          <h1>Servis Formu Onay Talebi</h1>
          <p>Yapılan servis hizmetini onaylamanız gerekmektedir</p>
          </div>
        </div>
        
        <div class="content">
          <div class="greeting">Sayın Yetkili,</div>
          
          <p class="message">
            Firmanıza yapılan servis ziyareti için onayınızı rica ediyoruz. Aşağıda detayları görebilir, hizmetin uygunluğuna göre onaylayabilir veya reddedebilirsiniz.
          </p>
          
          <div class="details-card">
            <div class="card-header">
              <h2>Servis Formu Detayıları</h2>
              <div class="card-icon">&#9881;</div> <!-- Gear icon for technical support -->
            </div>
            
            <table class="detail-table">
              <tr>
                <th width="35%">Tarih</th>
                <td><strong>${date}</strong></td>
              </tr>
              <tr>
                <th>Saat Aralığı</th>
                <td>${startTime} - ${endTime}</td>
              </tr>
              <tr>
                <th>Toplam Süre</th>
                <td><strong>${durationHours}</strong> saat</td>
              </tr>
              <tr>
                <th>Destek Personeli</th>
                <td>${ticket.supportStaff.firstName} ${ticket.supportStaff.lastName}</td>
              </tr>
              <tr>
                <th>Kategori</th>
                <td>${ticket.Category.name}</td>
              </tr>
              ${ticket.subject ? `
              <tr>
                <th>İş Konusu</th>
                <td><strong>${ticket.subject}</strong></td>
              </tr>` : ''}              
              <tr>
                <th valign="top">Açıklama</th>
                <td align="left" style="text-align: left !important;">
                  ${ticket.description.split('\n').map(line => 
                    `<p style="margin: 0 0 8px 0; padding: 0; text-align: left; font-size: 15px; line-height: 1.6; color: #334155;">${line || '&nbsp;'}</p>`
                  ).join('')}
                </td>
              </tr>
              ${ticket.location && ticket.location.includes('https://maps.google.com') ? `
              <tr>
                <th>Konum</th>
                <td>
                  <a href="${ticket.location}" target="_blank" style="color: #2563eb; text-decoration: none; display: inline-flex; align-items: center;">
                    <img src="https://cdn-icons-png.flaticon.com/512/2991/2991231.png" width="18" height="18" style="margin-right: 5px;"/>
                    Google Maps'te Görüntüle
                  </a>
                </td>
              </tr>
              ` : ticket.location ? `
              <tr>
                <th>Konum</th>
                <td>${ticket.location}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div class="button-container">
            <a href="${approvalLink}" class="button approve">&#10004; ONAYLA</a>
            <a href="${rejectLink}" class="button reject">&#10008; REDDET</a>
          </div>

          <!-- PDF raporu bölümü -->
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f0f9ff; border-radius: 10px; border: 1px solid #bae6fd;">
            <h3 style="margin-top: 0; color: #0284c7; font-size: 18px;">Servis Raporu</h3>
            <p style="margin-bottom: 15px; color: #334155;">Servis kaydına ait PDF dosyası bu e-postaya eklenmiştir. Lütfen e-postanın ekler bölümünden PDF dosyasını indirebilirsiniz.</p>
          </div>
          
          <div class="info-section">
            <p><span class="info-title">Not:</span> Butonların çalışmaması durumunda aşağıdaki linkleri tarayıcınıza kopyalayabilirsiniz:</p>
            <p><span class="info-title">Onaylamak için:</span> <a href="${approvalLink}">${approvalLink}</a></p>
            <p><span class="info-title">Reddetmek için:</span> <a href="${rejectLink}">${rejectLink}</a></p>
          </div>
          
          <div class="signature">
            <p>Teşekkür ederiz,</p>
            <p class="company-name">${companyShortName} Servis Ekibi</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.</p>
          <p>&copy; ${new Date().getFullYear()} ${companyShortName}. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Get approval completed email template
const getApprovalCompletedEmail = async (ticket, status) => {
  const date = new Date(ticket.startTime).toLocaleDateString('tr-TR');
  const statusText = status === 'approved' ? 'Onaylandı' : 'Reddedildi';
  const statusColor = status === 'approved' ? '#10b981' : '#ef4444';
  const statusBgColor = status === 'approved' ? '#ecfdf5' : '#fef2f2';
  const statusIcon = status === 'approved' ? '&#10004;' : '&#10008;';
  const borderColor = status === 'approved' ? '#059669' : '#b91c1c';
  const gradientStart = status === 'approved' ? '#059669' : '#b91c1c';
  const gradientEnd = status === 'approved' ? '#10b981' : '#ef4444';
  
  // Şirket bilgilerini getir
  const { Setting } = require('../../models');
  let companyName = 'IES YAZILIM VE DANIŞMANLIK';
  let companyShortName = 'IES Yazılım';
  
  try {
    // Veritabanından şirket bilgilerini al
    const companyInfoSetting = await Setting.findByPk('companyInfo');
    if (companyInfoSetting) {
      const companyInfo = JSON.parse(companyInfoSetting.value);
      if (companyInfo.name) companyName = companyInfo.name;
      if (companyInfo.shortName) companyShortName = companyInfo.shortName;
    }
  } catch (error) {
    console.error('Şirket bilgileri alınamadı:', error);
    // Varsayılan değerleri kullan
  }
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Servis Formu ${statusText}</title>
      <style>
        /* Base styles */
        * {
          box-sizing: border-box;
        }
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', Arial, sans-serif;
          line-height: 1.65;
          background-color: #f6f9fd;
          color: #333;
        }
        
        /* Layout */
        .container {
          max-width: 680px;
          margin: 0 auto;
          margin-top: 20px;
          margin-bottom: 20px;
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
        }

        /* Header with gradient background */
        .header {
          background: linear-gradient(135deg, ${gradientStart}, ${gradientEnd});
          color: white;
          padding: 35px 40px;
          position: relative;
          overflow: hidden;
        }
        
        .header-bg {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 0;
        }
        
        .header-bg:before, .header-bg:after {
          content: '';
          position: absolute;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .header-bg:before {
          width: 300px;
          height: 300px;
          top: -100px;
          right: -50px;
        }
        
        .header-bg:after {
          width: 200px;
          height: 200px;
          bottom: -70px;
          left: -40px;
        }
        
        .header-content {
          position: relative;
          z-index: 1;
          text-align: center;
        }
        
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.2px;
          line-height: 1.3;
        }
        
        .status-icon {
          font-size: 70px;
          margin-bottom: 15px;
          display: block;
        }
        
        /* Logo */
        .logo {
          margin-bottom: 20px;
          text-align: left;
        }
        
        /* Content */
        .content {
          padding: 36px 40px;
          background-color: #fff;
        }
        
        .greeting {
          font-size: 20px;
          font-weight: 600;
          color: #1a202c;
          margin-bottom: 20px;
        }
        
        .message {
          color: #4a5568;
          margin-bottom: 30px;
          font-size: 16px;
          line-height: 1.6;
        }
        
        /* Status Card */
        .status-card {
          background-color: ${statusBgColor};
          border: 1px solid ${statusColor}30;
          border-left: 5px solid ${statusColor};
          border-radius: 10px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
        }
        
        .status-badge {
          display: inline-block;
          padding: 10px 30px;
          background-color: ${statusColor};
          color: white;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          margin: 10px 0 20px;
          box-shadow: 0 3px 8px ${statusColor}40;
        }
        
        .status-date {
          font-size: 18px;
          color: #4a5568;
          margin-bottom: 15px;
        }
        
        .status-details {
          margin-top: 20px;
          text-align: left;
          background-color: white;
          border-radius: 8px;
          padding: 15px;
          border: 1px solid ${statusColor}20;
        }
        
        /* Info section */
        .info-section {
          background-color: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
          box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
        }
        
        .info-section p {
          margin: 0 0 8px;
          font-size: 15px;
          color: #334155;
        }
        
        .info-section p:last-child {
          margin-bottom: 0;
        }
        
        .info-title {
          font-weight: 700;
          color: #1e40af;
          display: inline-block;
          margin-right: 5px;
        }
        
        /* Signature */
        .signature {
          border-top: 1px solid #e2e8f0;
          padding-top: 25px;
          margin-top: 30px;
        }
        
        .signature p {
          margin: 0 0 5px;
          color: #4a5568;
          font-size: 15px;
        }
        
        .company-name {
          font-weight: 700;
          color: ${statusColor};
          font-size: 16px;
        }
        
        /* Footer */
        .footer {
          padding: 25px 30px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        
        .footer p {
          margin: 0 0 10px;
        }
        
        /* Responsive */
        @media only screen and (max-width: 680px) {
          .container {
            width: 100%;
            border-radius: 0;
            margin-top: 0;
            margin-bottom: 0;
            box-shadow: none;
          }
          
          .header, .content, .footer {
            padding-left: 25px;
            padding-right: 25px;
          }
          
          .status-card {
            padding: 20px 15px;
          }
          
          .status-details {
            padding: 12px;
          }
          
          .status-details .description-container {
            max-height: 200px;
            overflow-y: auto;
            overflow-x: hidden;
            width: 100%;
            white-space: pre-wrap !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }
          
          .status-details .description-text {
            white-space: pre-wrap !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            width: 100%;
            text-align: left !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with gradient background and decorative elements -->
        <div class="header">
          <div class="header-bg"></div>
          <div class="header-content">
            <div class="logo">
              <!-- Logo placeholder - in production, use an actual logo image -->
              <span style="color: white; font-size: 24px; font-weight: 700;">${companyShortName}</span>
            </div>
            <span class="status-icon">${statusIcon}</span>
            <h1>Servis Formu ${statusText}</h1>
          </div>
        </div>
        
        <div class="content">
          <div class="greeting">Sayın Yetkili,</div>
          
          <div class="status-card">
            <div class="status-date">${date} tarihinde yapılan destek ziyareti</div>
            <div class="status-badge">${statusText}</div>
            
            ${status === 'rejected' ? `
              <div class="status-details" style="width: 100%;">
                <h3 style="margin-top: 0; color: #4a5568; font-size: 16px;">Red Açıklaması:</h3>
                <div class="description-container" style="max-height: 300px; overflow-y: auto; overflow-x: hidden; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-top: 10px; background-color: #fafbfc; width: 100%; box-sizing: border-box; text-align: left !important;">
                  ${(ticket.approvalNotes || 'Belirtilmedi').split('\n').map(line => 
                    `<p style="margin: 0 0 8px 0; padding: 0; text-align: left !important; font-size: 14px; line-height: 1.6; color: #475569;">${line || '&nbsp;'}</p>`
                  ).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          
          <div class="info-section">
            <p><span class="info-title">Bilgi:</span> Hizmet servis formu ile ilgili detayları sistemden inceleyebilirsiniz.</p>
          </div>
          
          <div class="signature">
            <p>Desteğiniz için teşekkür ederiz,</p>
            <p class="company-name">${companyShortName} Destek Ekibi</p>
          </div>
        </div>
        
        <div class="footer">
          <p>Bu e-posta otomatik olarak gönderilmiştir. Lütfen cevaplamayınız.</p>
          <p>&copy; ${new Date().getFullYear()} ${companyShortName}. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  getApprovalRequestEmail,
  getApprovalCompletedEmail
};