import { ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { discountPercent, primaryImage } from '../lib/product';
import { formatMoney } from '../lib/utils';
import { useStore } from '../contexts/StoreContext';

export default function ProductCard({ product }) {
  const { settings } = useStore();
  const discount = discountPercent(product);
  return <article className="product-card">
    <Link className="product-card-media" to={`/product/${product.slug}`}>
      <img src={primaryImage(product)} alt={product.name}/>
      {discount > 0 && <span className="discount-badge">-{discount}%</span>}
      {product.newArrival && <span className="product-tag">New</span>}
    </Link>
    <div className="product-card-body">
      <span className="muted-label">{product.brand || 'Sharuu'}</span>
      <Link to={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
      <div className="price-row"><strong>{formatMoney(product.price, settings?.currencySymbol)}</strong>{product.originalPrice > product.price && <del>{formatMoney(product.originalPrice, settings?.currencySymbol)}</del>}</div>
      <Link className="product-card-link" to={`/product/${product.slug}`}>View product <ArrowRight size={15}/></Link>
    </div>
  </article>;
}
