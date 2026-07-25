export function primaryImage(product) {
  return product?.media?.find(item => item.isPrimary)?.url || product?.media?.[0]?.url || product?.image || '';
}

export function galleryImages(product, variant) {
  return [...new Set([
    variant?.image,
    ...(variant?.images || []),
    ...(product?.media || []).map(item => item.url),
    product?.image,
    ...(product?.extraImages || []),
    ...(product?.images || [])
  ].filter(Boolean))];
}

export function findMatchingVariant(product, selectedOptions = {}) {
  if (!product?.hasVariants) return undefined;
  return (product.variants || []).find(variant => {
    if (variant.status !== 'active') return false;
    return (product.options || []).every(option => variant.optionValues?.[option.id] === selectedOptions[option.id]);
  });
}

export function effectivePrice(product, variant) {
  return Number(variant?.price ?? product?.price ?? 0);
}

export function effectiveOriginalPrice(product, variant) {
  return Number(variant?.originalPrice ?? product?.originalPrice ?? effectivePrice(product, variant));
}

export function discountPercent(product, variant) {
  const price = effectivePrice(product, variant);
  const original = effectiveOriginalPrice(product, variant);
  if (original <= price || original <= 0) return Number(variant?.discount ?? product?.discount ?? 0);
  return Math.round(((original - price) / original) * 100);
}

export function availableStock(product, variant) {
  return product?.hasVariants ? Number(variant?.stock || 0) : Number(product?.stock || 0);
}

export function firstAvailableSelection(product) {
  if (!product?.hasVariants) return {};
  const first = (product.variants || []).find(item => item.status === 'active' && (item.stock > 0 || item.allowBackorder));
  return first?.optionValues || {};
}

export function optionValueAvailable(product, optionId, value, selectedOptions = {}) {
  return (product?.variants || []).some(variant => {
    if (variant.status !== 'active' || (variant.stock <= 0 && !variant.allowBackorder)) return false;
    if (variant.optionValues?.[optionId] !== value) return false;
    return Object.entries(selectedOptions).every(([selectedId, selectedValue]) => {
      if (selectedId === optionId || !selectedValue) return true;
      return variant.optionValues?.[selectedId] === selectedValue;
    });
  });
}
