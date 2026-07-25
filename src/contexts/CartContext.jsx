import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { availableStock, effectivePrice, primaryImage } from '../lib/product';
import { selectedOptionLabels } from '../lib/utils';

const CartContext = createContext(null);
const KEY = 'sharuu-cart-v5';

function readCart() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(items)), [items]);

  const addToCart = ({ product, variant, selectedOptions = {}, quantity = 1 }) => {
    const stock = availableStock(product, variant);
    if (product.status !== 'active') return { ok: false, message: 'Product is unavailable.' };
    if (product.hasVariants && !variant) return { ok: false, message: 'Select an available combination.' };
    if (quantity > stock && !variant?.allowBackorder) return { ok: false, message: 'Not enough stock.' };
    const id = `${product.id}:${variant?.id || 'simple'}`;
    const labels = selectedOptionLabels(product, selectedOptions);
    const nextItem = {
      id,
      productId: product.id,
      variantId: variant?.id || '',
      name: product.name,
      slug: product.slug,
      sku: variant?.sku || product.productCode,
      image: variant?.image || primaryImage(product),
      selectedOptions,
      selectedOptionLabels: labels,
      quantity,
      unitPrice: effectivePrice(product, variant),
      availableStock: stock
    };
    setItems(previous => {
      const existing = previous.find(item => item.id === id);
      if (!existing) return [...previous, nextItem];
      return previous.map(item => item.id === id
        ? { ...item, quantity: Math.min(item.quantity + quantity, item.availableStock || stock) }
        : item);
    });
    return { ok: true };
  };

  const updateQuantity = (id, quantity) => setItems(previous => previous.map(item => item.id === id
    ? { ...item, quantity: Math.max(1, Math.min(Number(quantity) || 1, item.availableStock || Number(quantity) || 1)) }
    : item));
  const removeItem = id => setItems(previous => previous.filter(item => item.id !== id));
  const clearCart = () => setItems([]);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const value = useMemo(() => ({ items, count, subtotal, addToCart, updateQuantity, removeItem, clearCart }), [items, count, subtotal]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider.');
  return context;
}
