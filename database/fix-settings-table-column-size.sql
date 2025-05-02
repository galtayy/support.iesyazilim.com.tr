-- Settings tablosundaki value sütununu LONGTEXT olarak değiştir
-- Bu, base64 kodlanmış büyük resimleri saklayabilmek için gereklidir
use supportdb

ALTER TABLE `Settings` 
MODIFY COLUMN `value` LONGTEXT;

-- Doğrulama mesajı
SELECT 'Settings tablosu başarıyla güncellendi. Value sütunu artık LONGTEXT tipinde.' as 'Bilgi';