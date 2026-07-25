-- Run only this upgrade section on an existing Sharuu V5 database.
-- No new table or column is required:
--   1) dynamic social links are stored in store_settings.data JSON
--   2) uploaded image paths and direct image URLs are stored in products.data JSON

USE `sharuu_universal_store`;

START TRANSACTION;

-- Keep existing Facebook/Instagram/WhatsApp values unchanged.
-- If socialLinks is missing, initialize it as an empty dynamic list.
UPDATE `store_settings`
SET `data` = JSON_SET(
  `data`,
  '$.socialLinks',
  CASE
    WHEN JSON_TYPE(JSON_EXTRACT(`data`, '$.socialLinks')) IN ('OBJECT', 'ARRAY')
      THEN JSON_EXTRACT(`data`, '$.socialLinks')
    ELSE JSON_ARRAY()
  END
)
WHERE `id` = 1
  AND JSON_VALID(`data`);

COMMIT;

SELECT 'Dynamic social links and product image URL support are ready' AS message;
