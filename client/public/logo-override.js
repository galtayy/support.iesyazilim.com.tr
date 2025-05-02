/**
 * LOGO OVERRIDE
 * 
 * Bu script, hardcoded logoyu geçersiz kılar ve doğrudan iesyazilim-logo.png 
 * isteklerini localStorage'daki logoya yönlendirir.
 * 
 * URL engelleme ve yönlendirme için bir Service Worker kullanır.
 */
(function() {
  // Servis worker kaydı
  if ('serviceWorker' in navigator) {
    // Önce önceki service worker'ı kaldır
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
      }
      
      // Yeni service worker'ı kaydet
      registerServiceWorker();
    });
  } else {
    console.error('Service Worker desteklenmiyor! Logo otomatik değiştirilemiyor.');
    // Alternatif olarak, manuel düzenli taramaya geç
    setInterval(replaceDynamically, 500);
  }
  
  // Service Worker'ı kaydet
  function registerServiceWorker() {
    // Service Worker kodunu doğrudan oluştur
    const swCode = `
      // Logo isteklerini engelle ve localStorage'daki logoyu döndür
      self.addEventListener('fetch', function(event) {
        const url = event.request.url;
        
        // İlgili logo dosyası isteklerini yakala
        if (url.includes('iesyazilim-logo.png')) {
          event.respondWith(
            caches.open('logo-cache').then(function(cache) {
              // Önce localStorage'dan logo al
              return clients.matchAll().then(function(clients) {
                if (clients.length === 0) return fetch(event.request);
                
                // Eğer ilk istemci varsa, ondan localStorage bilgisini al
                return clients[0].evaluate(function() {
                  return localStorage.getItem('companyLogo');
                }).then(function(logoData) {
                  if (logoData) {
                    // Logo verisi varsa, base64'ten bir yanıt oluştur
                    const response = new Response(
                      fetch(logoData).then(r => r.blob()),
                      { headers: { 'Content-Type': 'image/png' } }
                    );
                    return response;
                  } else {
                    // Yoksa orijinal isteği devam ettir
                    return fetch(event.request);
                  }
                });
              });
            })
          );
        }
      });
      
      // Service Worker'ı aktif et
      self.addEventListener('activate', function(event) {
        event.waitUntil(clients.claim());
      });
    `;
    
    // Service Worker kodunu Blob olarak oluştur
    const blob = new Blob([swCode], {type: 'application/javascript'});
    const swUrl = URL.createObjectURL(blob);
    
    // Service Worker'ı kaydet
    navigator.serviceWorker.register(swUrl, {scope: '/'})
      .then(function(registration) {
        console.log('Logo Override: Service Worker başarıyla kaydedildi!', registration);
      })
      .catch(function(error) {
        console.error('Logo Override: Service Worker kaydı sırasında hata:', error);
        // Service Worker başarısız olursa manuel düzenli taramaya geç
        setInterval(replaceDynamically, 500);
      });
  }
  
  // Service Worker yoksa manuel olarak DOM'u tarayarak değiştir
  function replaceDynamically() {
    const logoUrl = localStorage.getItem('companyLogo');
    if (!logoUrl) return;
    
    document.querySelectorAll('img').forEach(img => {
      if (img.src.includes('iesyazilim-logo.png')) {
        const newLogoUrl = logoUrl + '?t=' + Date.now(); // Önbelleği engellemek için
        if (img.dataset.originalSrc !== 'replaced') {
          img.dataset.originalSrc = 'replaced';
          img.src = newLogoUrl;
          console.log('Logo Override: Logo değiştirildi', img);
        }
      }
    });
  }
  
  // Logo güncellemelerini dinle
  window.addEventListener('logoUpdated', function() {
    // Sayfayı yenile - en basit çözüm
    window.location.reload();
  });
  
  // Storage olaylarını dinle
  window.addEventListener('storage', function(e) {
    if (e.key === 'companyLogo') {
      window.location.reload();
    }
  });
})();