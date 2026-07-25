import {
  Copy,
  Edit3,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { primaryImage } from '../../lib/product';
import {
  formatMoney,
  makeId,
} from '../../lib/utils';

const sortCategories = (a, b) =>
  Number(a.sortOrder || 0) -
    Number(b.sortOrder || 0) ||
  String(a.name || '').localeCompare(
    String(b.name || ''),
  );

export default function Products() {
  const {
    products,
    categories,
    settings,
    loadAdmin,
    adminLoaded,
    saveProduct,
    deleteProduct,
  } = useStore();

  const [query, setQuery] =
    useState('');
  const [category, setCategory] =
    useState('');

  useEffect(() => {
    if (!adminLoaded) {
      loadAdmin().catch(() => {});
    }
  }, [
    adminLoaded,
    loadAdmin,
  ]);

  const topCategories = useMemo(
    () =>
      categories
        .filter(
          item => !item.parentId,
        )
        .sort(sortCategories),
    [categories],
  );

  const categoryById = useMemo(
    () =>
      new Map(
        categories.map(item => [
          String(item.id),
          item,
        ]),
      ),
    [categories],
  );

  const rows = useMemo(
    () =>
      products.filter(product => {
        const matchesSearch =
          `${product.name} ${product.productCode} ${product.brand || ''}`
            .toLowerCase()
            .includes(
              query.toLowerCase(),
            );

        const matchesCategory =
          !category ||
          String(
            product.categoryId,
          ) === String(category);

        return (
          matchesSearch &&
          matchesCategory
        );
      }),
    [
      products,
      query,
      category,
    ],
  );

  const duplicate = async product => {
    const id = makeId('product');

    await saveProduct({
      ...product,
      id,
      slug: `${product.slug}-copy-${Date.now()}`,
      name: `${product.name} Copy`,
      productCode: `${product.productCode}-COPY`,
      createdAt:
        new Date().toISOString(),
      updatedAt:
        new Date().toISOString(),
      variants: (
        product.variants || []
      ).map(item => ({
        ...item,
        id: makeId('variant'),
        sku: `${item.sku}-COPY`,
      })),
    });
  };

  const categoryLabel = product => {
    const parent =
      categoryById.get(
        String(product.categoryId),
      );
    const child =
      categoryById.get(
        String(
          product.subcategoryId || '',
        ),
      );

    if (parent && child) {
      return (
        <>
          <strong>
            {parent.name}
          </strong>
          <small>
            {child.name}
          </small>
        </>
      );
    }

    return (
      <strong>
        {parent?.name ||
          child?.name ||
          'Unassigned'}
      </strong>
    );
  };

  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">
            Catalogue
          </span>
          <h1>Products</h1>
          <p>
            Manage simple and variable
            products.
          </p>
        </div>

        <Link
          className="btn btn-primary"
          to="/admin/products/new"
        >
          <Plus size={17} />
          Add Product
        </Link>
      </div>

      <section
        className="admin-category-filter"
        aria-label="Filter products by category"
      >
        <button
          type="button"
          className={
            !category ? 'active' : ''
          }
          onClick={() =>
            setCategory('')
          }
        >
          All
        </button>

        {topCategories.map(item => (
          <button
            type="button"
            key={item.id}
            className={
              String(category) ===
              String(item.id)
                ? 'active'
                : ''
            }
            title={item.name}
            onClick={() =>
              setCategory(
                String(category) ===
                  String(item.id)
                  ? ''
                  : item.id,
              )
            }
          >
            <span>{item.name}</span>
          </button>
        ))}
      </section>

      <div className="admin-toolbar products-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={event =>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Search products..."
          />
        </label>

        <span className="admin-result-count">
          {rows.length}{' '}
          {rows.length === 1
            ? 'product'
            : 'products'}
        </span>
      </div>

      <section className="admin-panel table-panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="table-product">
                      <img
                        src={primaryImage(
                          product,
                        )}
                        alt=""
                      />
                      <span>
                        <strong>
                          {product.name}
                        </strong>
                        <small>
                          {
                            product.productCode
                          }{' '}
                          ·{' '}
                          {product.variants
                            ?.length ||
                            0}{' '}
                          variants
                        </small>
                      </span>
                    </div>
                  </td>
                  <td className="product-category-cell">
                    {categoryLabel(
                      product,
                    )}
                  </td>
                  <td>
                    {formatMoney(
                      product.price,
                      settings?.currencySymbol,
                    )}
                  </td>
                  <td>
                    {product.stock}
                  </td>
                  <td>
                    <span
                      className={`status-pill ${product.status}`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Link
                        className="icon-btn"
                        to={`/admin/products/${product.id}`}
                        aria-label={`Edit ${product.name}`}
                      >
                        <Edit3 size={16} />
                      </Link>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() =>
                          duplicate(product)
                        }
                        aria-label={`Duplicate ${product.name}`}
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-btn danger"
                        onClick={() =>
                          confirm(
                            `Delete ${product.name}?`,
                          ) &&
                          deleteProduct(
                            product.id,
                          )
                        }
                        aria-label={`Delete ${product.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
