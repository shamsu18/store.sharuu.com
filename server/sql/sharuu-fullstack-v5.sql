CREATE DATABASE IF NOT EXISTS `sharuu_universal_store` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `sharuu_universal_store`;

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` VARCHAR(80) PRIMARY KEY,
  `name` VARCHAR(190) NOT NULL,
  `email` VARCHAR(190) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(80) NOT NULL DEFAULT 'super_admin',
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(80) PRIMARY KEY,
  `parent_id` VARCHAR(80) NULL,
  `slug` VARCHAR(190) NOT NULL UNIQUE,
  `name` VARCHAR(190) NOT NULL,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `show_in_menu` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_categories_parent` (`parent_id`,`active`,`sort_order`),
  CONSTRAINT `fk_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(80) PRIMARY KEY,
  `slug` VARCHAR(190) NOT NULL UNIQUE,
  `product_code` VARCHAR(190) NOT NULL UNIQUE,
  `category_id` VARCHAR(80) NOT NULL,
  `subcategory_id` VARCHAR(80) NULL,
  `status` ENUM('active','draft','archived') NOT NULL DEFAULT 'draft',
  `price` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `stock` INT NOT NULL DEFAULT 0,
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_products_public` (`status`,`category_id`,`subcategory_id`),
  KEY `idx_products_stock` (`stock`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_products_subcategory` FOREIGN KEY (`subcategory_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `coupons` (
  `id` VARCHAR(80) PRIMARY KEY,
  `code` VARCHAR(120) NOT NULL UNIQUE,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  `used_count` INT NOT NULL DEFAULT 0,
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cms_pages` (
  `id` VARCHAR(80) PRIMARY KEY,
  `slug` VARCHAR(190) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `status` ENUM('published','draft') NOT NULL DEFAULT 'draft',
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `store_settings` (
  `id` TINYINT UNSIGNED PRIMARY KEY,
  `data` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(80) PRIMARY KEY,
  `order_number` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(190) NOT NULL,
  `status` ENUM('pending','confirmed','processing','completed','cancelled','refunded') NOT NULL DEFAULT 'pending',
  `payment_status` ENUM('unpaid','pending','paid','failed','refunded') NOT NULL DEFAULT 'unpaid',
  `shipping_status` ENUM('unfulfilled','processing','packed','shipped','in_transit','delivered','returned','cancelled') NOT NULL DEFAULT 'unfulfilled',
  `total` DECIMAL(14,2) NOT NULL DEFAULT 0,
  `public_token` VARCHAR(100) NOT NULL UNIQUE,
  `data` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_orders_phone` (`phone`,`created_at`),
  KEY `idx_orders_status` (`status`,`payment_status`,`shipping_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` VARCHAR(80) NOT NULL,
  `variant_id` VARCHAR(80) NULL,
  `order_id` VARCHAR(80) NULL,
  `quantity_change` INT NOT NULL,
  `reason` VARCHAR(190) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_inventory_product` (`product_id`,`variant_id`,`created_at`),
  KEY `idx_inventory_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
