import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [state, setState] = useState({ products: [], categories: [], coupons: [], pages: [], orders: [], settings: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminLoaded, setAdminLoaded] = useState(false);

  const applyTheme = settings => {
    if (!settings) return;
    document.documentElement.style.setProperty('--primary', settings.primaryColor || '#0f172a');
    document.documentElement.style.setProperty('--secondary', settings.secondaryColor || '#d97706');
    document.title = settings.storeName || 'Sharuu Universal Store';
  };

  const loadPublic = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.publicBootstrap();
      setState(previous => ({ ...previous, ...data }));
      applyTheme(data.settings);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdmin = useCallback(async () => {
    const data = await api.adminBootstrap();
    setState(previous => ({ ...previous, ...data }));
    applyTheme(data.settings);
    setAdminLoaded(true);
    return data;
  }, []);

  useEffect(() => { loadPublic(); }, [loadPublic]);

  const replace = (key, item) => setState(previous => ({
    ...previous,
    [key]: previous[key].some(existing => existing.id === item.id)
      ? previous[key].map(existing => existing.id === item.id ? item : existing)
      : [item, ...previous[key]]
  }));

  const remove = (key, id) => setState(previous => ({ ...previous, [key]: previous[key].filter(item => item.id !== id) }));

  const actions = {
    saveProduct: async product => { const saved = await api.saveProduct(product); replace('products', saved); return saved; },
    deleteProduct: async id => { await api.deleteProduct(id); remove('products', id); },
    saveCategory: async category => { const saved = await api.saveCategory(category); replace('categories', saved); return saved; },
    reorderCategories: async categories => {
      const saved = await api.reorderCategories(categories);
      setState(previous => ({ ...previous, categories: saved }));
      return saved;
    },
    deleteCategory: async id => { await api.deleteCategory(id); remove('categories', id); },
    saveCoupon: async coupon => { const saved = await api.saveCoupon(coupon); replace('coupons', saved); return saved; },
    deleteCoupon: async id => { await api.deleteCoupon(id); remove('coupons', id); },
    savePage: async page => { const saved = await api.savePage(page); replace('pages', saved); return saved; },
    deletePage: async id => { await api.deletePage(id); remove('pages', id); },
    saveSettings: async settings => {
      const saved = await api.saveSettings(settings);
      setState(previous => ({ ...previous, settings: saved }));
      applyTheme(saved);
      return saved;
    },
    updateOrder: async (id, patch) => {
      const saved = await api.updateOrder(id, patch);
      replace('orders', saved);
      return saved;
    }
  };

  const value = useMemo(() => ({
    ...state,
    publicProducts: state.products.filter(product => product.status === 'active'),
    loading,
    error,
    adminLoaded,
    loadPublic,
    loadAdmin,
    ...actions
  }), [state, loading, error, adminLoaded, loadPublic, loadAdmin]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider.');
  return context;
}
