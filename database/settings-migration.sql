-- Create Settings table
use supportdb
CREATE TABLE IF NOT EXISTS `Settings` (
  `key` VARCHAR(255) NOT NULL,
  `value` TEXT,
  `description` VARCHAR(255),
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO `Settings` (`key`, `value`, `description`)
VALUES 
  ('companyInfo', '{"name":"IES YAZILIM VE DANIŞMANLIK SAN. TİC. LTD. ŞTİ.","shortName":"IES Yazılım"}', 'Şirket bilgileri'),
  ('logoSettings', '{"companyLogo":null}', 'Logo ayarları')
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`);