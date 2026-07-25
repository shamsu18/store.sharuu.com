import { Boxes, DollarSign, PackageCheck, ShoppingCart, TriangleAlert } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { formatMoney } from '../../lib/utils';

export default function Dashboard() {
  const { products,orders,settings,loadAdmin,adminLoaded }=useStore();
  useEffect(()=>{if(!adminLoaded)loadAdmin().catch(()=>{});},[adminLoaded,loadAdmin]);
  const revenue=orders.filter(order=>order.status!=='cancelled').reduce((sum,order)=>sum+Number(order.total||0),0);
  const cards=[["Products",products.length,Boxes],["Orders",orders.length,ShoppingCart],["Revenue",formatMoney(revenue,settings?.currencySymbol),DollarSign],["Low Stock",products.filter(item=>item.stock<=Number(item.lowStockThreshold||3)).length,TriangleAlert]];
  return <div><div className="admin-page-heading"><div><span className="eyebrow">Overview</span><h1>Store Dashboard</h1><p>Live products, orders and inventory summary.</p></div></div><div className="dashboard-cards">{cards.map(([label,value,Icon])=><article key={label}><Icon/><span><small>{label}</small><strong>{value}</strong></span></article>)}</div><div className="admin-grid-two"><section className="admin-panel"><h2>Recent Orders</h2>{orders.slice(0,6).map(order=><div className="simple-row" key={order.id}><span><strong>{order.orderNumber}</strong><small>{order.customer?.name} · {order.status}</small></span><b>{formatMoney(order.total,settings?.currencySymbol)}</b></div>)}</section><section className="admin-panel"><h2>Low Stock Products</h2>{products.filter(item=>item.stock<=Number(item.lowStockThreshold||3)).slice(0,8).map(product=><div className="simple-row" key={product.id}><span><strong>{product.name}</strong><small>{product.productCode}</small></span><b>{product.stock}</b></div>)}</section></div></div>;
}
