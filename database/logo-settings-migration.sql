-- Logo ayarlarını kaydetmek için Settings tablosundaki gerekli kaydı oluştur
-- Not: Bu script, önceki settings-migration.sql dosyasından sonra çalıştırılmalıdır.

-- Settings tablosunun var olduğunu doğrula
use supportdb
CREATE TABLE IF NOT EXISTS `Settings` (
  `key` VARCHAR(255) NOT NULL,
  `value` LONGTEXT, -- Logo base64 olarak saklanacağı için LONGTEXT kullanıyoruz
  `description` VARCHAR(255),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Logo ayarları kaydını oluştur veya güncelle (logoSettings)
INSERT INTO `Settings` (`key`, `value`, `description`)
VALUES ('logoSettings', '{"companyLogo":null}', 'Logo ayarları')
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`);

-- Şirket bilgileri için varsayılan ayarları ekle
INSERT INTO `Settings` (`key`, `value`, `description`)
VALUES ('companyInfo', '{"name":"IES YAZILIM VE DANIŞMANLIK SAN. TİC. LTD. ŞTİ.","shortName":"IES Yazılım"}', 'Şirket bilgileri')
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`);