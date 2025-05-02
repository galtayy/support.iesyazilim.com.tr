/**
 * Resim boyutunu küçültmek için yardımcı fonksiyonlar
 */

/**
 * Base64 kodlanmış bir resmi belirtilen maksimum boyuta kadar küçültür
 * @param {string} base64Image - Base64 formatında resim verisi
 * @param {number} maxWidth - Maksimum genişlik (piksel)
 * @param {number} maxHeight - Maksimum yükseklik (piksel)
 * @param {number} quality - Resim kalitesi (0-1 arası)
 * @returns {Promise<string>} - Küçültülmüş base64 formatında resim
 */
export const resizeBase64Image = (base64Image, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Base64 formatını kontrol et
    if (!base64Image || !base64Image.startsWith('data:image')) {
      return resolve(base64Image);
    }

    const img = new Image();
    img.src = base64Image;
    
    img.onload = () => {
      // Eğer resim belirlenen boyuttan küçükse, doğrudan döndür
      if (img.width <= maxWidth && img.height <= maxHeight) {
        return resolve(base64Image);
      }

      // Oranları koru
      let newWidth = img.width;
      let newHeight = img.height;
      
      if (newWidth > maxWidth) {
        newHeight = Math.round(newHeight * (maxWidth / newWidth));
        newWidth = maxWidth;
      }
      
      if (newHeight > maxHeight) {
        newWidth = Math.round(newWidth * (maxHeight / newHeight));
        newHeight = maxHeight;
      }

      // Canvas üzerine çiz
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // MIME tipini belirle
      const mime = base64Image.match(/data:([^;]+);/)[1] || 'image/jpeg';
      
      // Yeni base64 verisi oluştur
      const resizedBase64 = canvas.toDataURL(mime, quality);
      
      resolve(resizedBase64);
    };
    
    img.onerror = (error) => {
      console.error('Resim küçültülürken hata oluştu:', error);
      // Hata durumunda orijinal resmi döndür
      resolve(base64Image);
    };
  });
};

/**
 * Base64 formatındaki resmin boyutunu kontrol eder ve gerekirse küçültür
 * @param {string} base64Image - Base64 formatında resim verisi
 * @param {number} maxSizeKB - Maksimum KB boyutu
 * @returns {Promise<string>} - Küçültülmüş resim
 */
export const optimizeBase64Image = async (base64Image, maxSizeKB = 800) => {
  if (!base64Image) return null;
  
  // Orijinal boyutu hesapla
  const originalSizeKB = Math.round((base64Image.length * 3) / 4 / 1024);
  
  if (originalSizeKB <= maxSizeKB) {
    return base64Image;
  }
  
  // Boyutu aşıldıysa, küçültmeyi başlat
  let quality = 0.8;
  let width = 800;
  let height = 600;
  let optimizedImage = base64Image;
  
  // Üç kez deneme yap, her seferinde kaliteyi düşür
  for (let attempt = 0; attempt < 3; attempt++) {
    optimizedImage = await resizeBase64Image(optimizedImage, width, height, quality);
    
    const newSizeKB = Math.round((optimizedImage.length * 3) / 4 / 1024);
    
    if (newSizeKB <= maxSizeKB) {
      break;
    }
    
    // Sonraki deneme için daha düşük kalite ve boyut
    quality -= 0.2;
    width = Math.round(width * 0.8);
    height = Math.round(height * 0.8);
  }
  
  return optimizedImage;
};

export default {
  resizeBase64Image,
  optimizeBase64Image
};