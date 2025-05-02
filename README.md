# IES Yazılım Destek Uygulaması

## Proje Hakkında

Bu proje, IES Yazılım çalışanlarının müşteri saha ziyaretleri sırasında hizmet servis formlarını tutmak, onaylamak ve raporlamak için geliştirilmiş bir web uygulamasıdır.

### Temel Özellikler

- Saha hizmet servis formları oluşturma ve yönetme
- Müşteri yönetimi
- İş kategorileri yönetimi
- Kullanıcı yönetimi (Destek Personeli ve Yönetici rolleri)
- Onay mekanizması
- Raporlama ve filtreleme
- Mobil öncelikli tasarım

## Teknoloji Stack

### Backend

- Node.js ve Express.js
- MySQL veritabanı
- Sequelize ORM
- JWT authentication

### Frontend

- React.js
- TailwindCSS
- Formik ve Yup form yönetimi
- React Router
- Chart.js (veri görselleştirme için)
- Axios (HTTP istekleri için)

## Kurulum

### Gereksinimler

- Node.js (v14 veya üzeri)
- MySQL (v5.7 veya üzeri)
- npm veya yarn

### Kurulum Adımları

1. Projeyi klonlayın
```
git clone <repo-url>
cd support.iesyazilim.com.tr
```

2. Backend için gerekli paketleri yükleyin
```
cd server
npm install
```

3. MySQL'de veritabanı oluşturun
```
CREATE DATABASE ies_support_db;
```

4. `.env` dosyasını düzenleyin (örnek için .env.example dosyasını kullanabilirsiniz)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=<your-password>
DB_NAME=ies_support_db
```

5. Backend'i başlatın
```
npm run dev
```

6. Frontend için gerekli paketleri yükleyin
```
cd ../client
npm install
```

7. Frontend'i başlatın
```
npm start
```

## Kullanım

### Kullanıcı Rolleri

- **Destek Personeli**: Destek kayıtları oluşturabilir, düzenleyebilir ve görüntüleyebilir
- **Yönetici**: Tüm özelliklere erişebilir, hizmet servis formlarını onaylayabilir/reddedebilir, müşterileri, kategorileri ve kullanıcıları yönetebilir, raporları görüntüleyebilir

### Temel İş Akışı

1. Destek personeli müşteri ziyareti yaparak ilgili işleri gerçekleştirir
2. Uygulama üzerinden hizmet servis formu oluşturur:
   - Müşteri seçimi
   - Kategori seçimi
   - İş açıklaması
   - Giriş/çıkış saatleri
   - İsteğe bağlı fotoğraf ekleme
3. Yönetici kayıtları inceler ve onaylar/reddeder
4. Raporlar üzerinden tüm destek faaliyetleri analiz edilebilir

## Kurumsal Kimlik

- Ana renk: #3A7BD5 (mavi)
- Yardımcı renkler: #61C28C (yeşil), #FFA84B (turuncu), #E05A5A (kırmızı)
- Arka plan: #FFFFFF (beyaz) ve #2E2E2E (antrasit gri)
- Yazı tipleri: Poppins/Inter (başlıklar), Roboto (içerik)

## Katkıda Bulunma

Projede değişiklik yapmak isterseniz:

1. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
2. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
3. Branch'inizi push edin (`git push origin feature/amazing-feature`)
4. Pull Request oluşturun

## Lisans

IES Yazılım'a aittir. Tüm hakları saklıdır.

---

©  IES Yazılım. Bu uygulama IES Yazılım tarafından geliştirilmiştir.