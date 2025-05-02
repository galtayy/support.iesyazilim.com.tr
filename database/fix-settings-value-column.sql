-- Settings tablosu value alanını LONGTEXT olarak değiştir ve karakter seti UTF8MB4 olarak ayarla
-- Bu, büyük base64 kodlanmış resimleri saklayabilmek için gereklidir
use supportdb

ALTER TABLE `Settings` 
MODIFY COLUMN `value` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bu değişiklik yeterince büyük değilse, alternatif olarak MEDIUMTEXT veya LONGBLOB kullanılabilir:
-- ALTER TABLE `Settings` MODIFY COLUMN `value` MEDIUMTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ALTER TABLE `Settings` MODIFY COLUMN `value` LONGBLOB;

-- Maksimum paket boyutunu artır (MySQL bağlantı ayarlarında da değişiklik gerektirebilir)
SET GLOBAL max_allowed_packet = 1073741824; -- 1GB

-- Doğrulama mesajı
SELECT 'Settings tablosu başarıyla güncellendi. Value sütunu LONGTEXT UTF8MB4 olarak değiştirildi ve max_allowed_packet değeri artırıldı.' as 'Bilgi';