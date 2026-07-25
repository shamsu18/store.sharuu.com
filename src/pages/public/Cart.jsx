import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';
import { formatMoney } from '../../lib/utils';

function Options({ item }) {
  const entries = Object.entries(item.selectedOptionLabels || {});
  if (!entries.length) return null;
  return <div className="cart-options">{entries.map(([label,value]) => <span key={label}><strong>{label}:</strong> {value}</span>)}</div>;
}

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const { settings } = useStore();
  if (!items.length) return <main className="page container"><div className="empty-state"><h1>Your cart is empty</h1><p>Add something you love to continue.</p><Link className="btn btn-primary" to="/shop">Shop now</Link></div></main>;
  return <main className="page container"><div className="page-heading"><span className="eyebrow">Shopping bag</span><h1>Your Cart</h1><p>Review quantities and selected options.</p></div><div className="cart-layout"><section className="cart-list">{items.map(item => <article key={item.id} className="cart-item"><Link to={`/product/${item.slug}`}><img src={item.image} alt={item.name}/></Link><div className="cart-item-info"><Link to={`/product/${item.slug}`}><h3>{item.name}</h3></Link><p>{item.sku}</p><Options item={item}/><strong>{formatMoney(item.unitPrice,settings?.currencySymbol)}</strong></div><div className="cart-controls"><div className="quantity-control"><button onClick={() => updateQuantity(item.id,item.quantity-1)}><Minus size={15}/></button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.id,item.quantity+1)}><Plus size={15}/></button></div><button className="icon-btn danger" onClick={() => removeItem(item.id)}><Trash2 size={18}/></button></div></article>)}</section><aside className="summary-card"><h2>Order Summary</h2><div><span>Subtotal</span><strong>{formatMoney(subtotal,settings?.currencySymbol)}</strong></div><p>Shipping and coupon discounts are calculated at checkout.</p><Link className="btn btn-primary full" to="/checkout">Proceed to Checkout</Link><Link className="text-link" to="/shop">Continue shopping</Link></aside></div></main>;
}
