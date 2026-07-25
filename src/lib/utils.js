export function cn(...values) {
  return values.filter(Boolean).join(' ');
}

export function formatMoney(value, symbol = '৳') {
  const number = Number(value || 0);
  return `${symbol}${number.toLocaleString('en-BD', { maximumFractionDigits: 2 })}`;
}

export function safeNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function makeId(prefix = 'id') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const DEFAULT_ADMIN_LOGIN_SLUG = 'store-admin';

export const RESERVED_ADMIN_LOGIN_SLUGS = new Set([
  'admin',
  'admin-access',
  'shop',
  'cart',
  'checkout',
  'track-order',
  'order-success',
  'page',
  'product',
]);

export function getAdminLoginSlug(settings) {
  return String(settings?.adminLoginSlug || DEFAULT_ADMIN_LOGIN_SLUG).trim() || DEFAULT_ADMIN_LOGIN_SLUG;
}

export function getAdminLoginPath(settings) {
  return `/${getAdminLoginSlug(settings)}`;
}

export function isReservedAdminLoginSlug(slug) {
  return RESERVED_ADMIN_LOGIN_SLUGS.has(String(slug || '').trim().toLowerCase());
}

export function selectedOptionLabels(product, selectedOptions = {}) {
  return Object.entries(selectedOptions).reduce((result, [optionId, value]) => {
    const option = product?.options?.find(item => item.id === optionId);
    const optionValue = option?.values?.find(item => item.value === value);
    if (option) result[option.name] = optionValue?.label || value;
    return result;
  }, {});
}
