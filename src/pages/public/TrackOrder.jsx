import { PackageSearch, Search } from 'lucide-react';
import { useState } from 'react';
import { api } from '../../services/api';
import { useStore } from '../../contexts/StoreContext';
import { formatMoney } from '../../lib/utils';

export default function TrackOrder() {
  const { settings } = useStore();
  const [query,setQuery] = useState('');
  const [orders,setOrders] = useState([]);
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const search = async event => { event.preventDefault(); if(!query.trim()) return; setLoading(true); setError(''); try { const result=await api.trackOrder(query.trim()); setOrders(Array.isArray(result)?result:[result]); } catch(requestError) { setOrders([]); setError(requestError.message); } finally { setLoading(false); } };
  return <main className="page container narrow-page"><div className="page-heading centered"><PackageSearch size={42}/><span className="eyebrow">Order status</span><h1>Track Your Order</h1><p>Enter either your Order Number or Phone Number.</p></div><form className="track-form" onSubmit={search}><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Example: SH-123456789 or 017XXXXXXXX"/><button className="btn btn-primary"><Search size={17}/>{loading?'Searching...':'Track Order'}</button></form>{error&&<div className="error-box">{error}</div>}<div className="tracked-orders">{orders.map(order => <article key={order.id} className="tracked-order"><div className="tracked-heading"><span><small>Order Number</small><strong>{order.orderNumber}</strong></span><b>{order.status}</b></div><div className="order-status-grid"><span><small>Payment</small><strong>{order.paymentStatus}</strong></span><span><small>Shipping</small><strong>{order.shippingStatus}</strong></span><span><small>Total</small><strong>{formatMoney(order.total,settings?.currencySymbol)}</strong></span><span><small>Date</small><strong>{new Date(order.createdAt).toLocaleDateString()}</strong></span></div><div>{order.items?.map(item => <div className="tracked-item" key={item.id || `${order.id}-${item.sku}`}><img src={item.image} alt={item.name}/><span><strong>{item.name}</strong><small>{Object.entries(item.selectedOptionLabels || {}).map(([label,value]) => `${label}: ${value}`).join(' · ')} · Qty {item.quantity}</small></span></div>)}</div></article>)}</div></main>;
}
