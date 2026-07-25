import {
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';

import { useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ProductCard from '../../components/ProductCard';
import { useCart } from '../../contexts/CartContext';
import { useStore } from '../../contexts/StoreContext';

import {
  discountPercent,
  effectiveOriginalPrice,
  effectivePrice,
  findMatchingVariant,
  firstAvailableSelection,
  galleryImages,
  optionValueAvailable,
} from '../../lib/product';

import { cn, formatMoney } from '../../lib/utils';

/**
 * Remove duplicate, empty and invalid image URLs.
 */
function uniqueImages(images = []) {
  return [
    ...new Set(
      images.filter(
        (image) =>
          typeof image === 'string' &&
          image.trim().length > 0,
      ),
    ),
  ];
}

/**
 * Find the primary image selected from the admin panel.
 *
 * Priority:
 * 1. media item with isPrimary: true
 * 2. product.image
 * 3. first media image
 * 4. first product.images image
 */
function getProductPrimaryImage(product) {
  if (!product) {
    return '';
  }

  const media = Array.isArray(product.media)
    ? product.media
    : [];

  const primaryMedia = media.find(
    (item) => item?.isPrimary && item?.url,
  );

  return (
    primaryMedia?.url ||
    product.image ||
    media[0]?.url ||
    product.images?.[0] ||
    ''
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    publicProducts,
    categories,
    settings,
  } = useStore();

  const { addToCart } = useCart();

  const product = publicProducts.find(
    (item) =>
      item.slug === slug ||
      item.id === slug,
  );

  const [selectedOptions, setSelectedOptions] =
    useState({});

  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState('');

  const [zoom, setZoom] = useState({
    active: false,
    x: 50,
    y: 50,
  });

  const [message, setMessage] = useState('');

  const variant = product
    ? findMatchingVariant(
        product,
        selectedOptions,
      )
    : undefined;

  /**
   * Admin panel selected primary image.
   */
  const primaryImage = useMemo(() => {
    return getProductPrimaryImage(product);
  }, [product]);

  /**
   * Create gallery with primary image first.
   */
  const images = useMemo(() => {
    if (!product) {
      return [];
    }

    const generatedGallery =
      galleryImages(product, variant) || [];

    const sortedMedia = Array.isArray(
      product.media,
    )
      ? [...product.media].sort(
          (first, second) => {
            const primaryDifference =
              Number(Boolean(second.isPrimary)) -
              Number(Boolean(first.isPrimary));

            if (primaryDifference !== 0) {
              return primaryDifference;
            }

            return (
              Number(first.sortOrder || 0) -
              Number(second.sortOrder || 0)
            );
          },
        )
      : [];

    const mediaImages = sortedMedia.map(
      (item) => item.url,
    );

    const productImages = Array.isArray(
      product.images,
    )
      ? product.images
      : [];

    return uniqueImages([
      primaryImage,
      ...mediaImages,
      ...generatedGallery,
      ...productImages,
      product.image,
    ]);
  }, [product, variant, primaryImage]);

  const stock = product
    ? product.hasVariants
      ? Number(variant?.stock || 0)
      : Number(product.stock || 0)
    : 0;

  const price = product
    ? effectivePrice(product, variant)
    : 0;

  const original = product
    ? effectiveOriginalPrice(
        product,
        variant,
      )
    : 0;

  const discount = product
    ? discountPercent(product, variant)
    : 0;

  /**
   * Reset options when product changes.
   */
  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedOptions(
      firstAvailableSelection(product),
    );

    setQuantity(1);
    setMessage('');
  }, [product?.id]);

  /**
   * Show admin-selected primary image as main image.
   */
  useEffect(() => {
    if (!product) {
      setMainImage('');
      return;
    }

    setMainImage(
      primaryImage || images[0] || '',
    );

    setZoom({
      active: false,
      x: 50,
      y: 50,
    });
  }, [
    product?.id,
    primaryImage,
    images,
  ]);

  if (!product) {
    return (
      <main className="page container">
        <div className="empty-state">
          <h1>Product not found</h1>

          <Link
            className="btn btn-primary"
            to="/shop"
          >
            Back to shop
          </Link>
        </div>
      </main>
    );
  }

  const category = categories.find(
    (item) =>
      item.id === product.categoryId,
  );

  const subcategory = categories.find(
    (item) =>
      item.id === product.subcategoryId,
  );

  const related = publicProducts
    .filter((item) => {
      if (item.id === product.id) {
        return false;
      }

      if (product.subcategoryId) {
        return (
          item.subcategoryId ===
          product.subcategoryId
        );
      }

      return (
        item.categoryId ===
        product.categoryId
      );
    })
    .slice(0, 4);

  const selectionComplete =
    !product.hasVariants ||
    (product.options || []).every(
      (option) =>
        Boolean(selectedOptions[option.id]),
    );

  const available = product.hasVariants
    ? Boolean(
        variant &&
          (Number(variant.stock || 0) > 0 ||
            variant.allowBackorder),
      )
    : Number(product.stock || 0) > 0;

  const add = (goCart) => {
    if (!selectionComplete) {
      setMessage(
        'Please select every required option.',
      );
      return;
    }

    if (!available) {
      setMessage(
        'This combination is unavailable.',
      );
      return;
    }

    const result = addToCart({
      product,
      variant,
      selectedOptions,
      quantity,
    });

    setMessage(
      result.ok
        ? 'Product added to cart.'
        : result.message,
    );

    if (result.ok && goCart) {
      navigate('/cart');
    }
  };

  const move = (event) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    setZoom({
      active: true,

      x:
        ((event.clientX - rect.left) /
          rect.width) *
        100,

      y:
        ((event.clientY - rect.top) /
          rect.height) *
        100,
    });
  };

  const grouped = (
    product.specifications || []
  ).reduce((result, item) => {
    const groupName =
      item.group || 'General';

    return {
      ...result,

      [groupName]: [
        ...(result[groupName] || []),
        item,
      ],
    };
  }, {});

  return (
    <main className="product-page container">
      {/*
        This CSS guarantees that the complete image is shown.
        It also overrides any old object-fit: cover rules.
      */}
      <style>
        {`
          .product-primary-image.full-image-view {
            width: 100%;
            aspect-ratio: 1 / 1;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative;
            overflow: hidden !important;
            background: #f8fafc;
            border-radius: inherit;
          }

          .product-primary-image.full-image-view > img {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            display: block !important;
            object-fit: contain !important;
            object-position: center !important;
          }

          .thumbnail-row.full-thumbnail-row button {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: hidden !important;
            background: #f8fafc;
            aspect-ratio: 1 / 1;
          }

          .thumbnail-row.full-thumbnail-row button img {
            width: 100% !important;
            height: 100% !important;
            max-width: 100% !important;
            max-height: 100% !important;
            display: block !important;
            object-fit: contain !important;
            object-position: center !important;
          }

          .product-image-placeholder {
            width: 100%;
            height: 100%;
            min-height: 320px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            color: #64748b;
            background: #f8fafc;
            text-align: center;
          }

          @media (max-width: 768px) {
            .product-primary-image.full-image-view {
              min-height: 320px;
            }

            .thumbnail-row.full-thumbnail-row button {
              min-width: 68px;
              width: 68px;
              height: 68px;
            }
          }
        `}
      </style>

      <div className="breadcrumbs">
        <Link to="/">Home</Link>

        <span>/</span>

        <Link
          to={`/shop?category=${
            category?.id || ''
          }`}
        >
          {category?.name || 'Shop'}
        </Link>

        {subcategory && (
          <>
            <span>/</span>
            <span>{subcategory.name}</span>
          </>
        )}
      </div>

      <div className="product-detail-grid">
        <section className="product-gallery">
          <div
            className="product-primary-image full-image-view"
            onMouseMove={move}
            onMouseLeave={() =>
              setZoom((previous) => ({
                ...previous,
                active: false,
              }))
            }
          >
            {mainImage ? (
              <img
                src={mainImage}
                alt={product.name}
                draggable="false"
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'block',

                  // পুরো ছবি দেখানোর জন্য
                  objectFit: 'contain',
                  objectPosition: 'center',

                  transform: zoom.active
                    ? 'scale(1.8)'
                    : 'scale(1)',

                  transformOrigin: `${zoom.x}% ${zoom.y}%`,

                  transition:
                    zoom.active
                      ? 'none'
                      : 'transform 0.2s ease',
                }}
              />
            ) : (
              <div className="product-image-placeholder">
                No image available
              </div>
            )}

            {discount > 0 && (
              <span className="discount-badge large">
                -{discount}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="thumbnail-row full-thumbnail-row">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={cn(
                    mainImage === image &&
                      'active',
                  )}
                  onClick={() => {
                    setMainImage(image);

                    setZoom({
                      active: false,
                      x: 50,
                      y: 50,
                    });
                  }}
                  aria-label={`View ${product.name} image ${
                    index + 1
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} thumbnail ${
                      index + 1
                    }`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '100%',
                      maxHeight: '100%',
                      display: 'block',

                      // Thumbnail-এও পুরো ছবি দেখাবে
                      objectFit: 'contain',
                      objectPosition: 'center',
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="product-info">
          <span className="eyebrow">
            {product.brand}

            {product.brand &&
              category?.name &&
              ' · '}

            {category?.name}
          </span>

          <h1>{product.name}</h1>

          <div className="price-row product-price">
            <strong>
              {formatMoney(
                price,
                settings?.currencySymbol,
              )}
            </strong>

            {original > price && (
              <del>
                {formatMoney(
                  original,
                  settings?.currencySymbol,
                )}
              </del>
            )}

            {discount > 0 && (
              <span className="saving">
                Save {discount}%
              </span>
            )}
          </div>

          <p className="product-code">
            SKU:{' '}
            {variant?.sku ||
              product.productCode}
          </p>

          <div className="markdown">
            <Markdown>
              {product.description || ''}
            </Markdown>
          </div>

          {(product.options || []).map(
            (option) => {
              const selectedValue =
                option.values.find(
                  (value) =>
                    value.value ===
                    selectedOptions[
                      option.id
                    ],
                );

              return (
                <div
                  className="option-block"
                  key={option.id}
                >
                  <div className="option-label">
                    <span>{option.name}</span>

                    <strong>
                      {selectedValue?.label ||
                        'Select'}
                    </strong>
                  </div>

                  {option.displayType ===
                  'dropdown' ? (
                    <select
                      value={
                        selectedOptions[
                          option.id
                        ] || ''
                      }
                      onChange={(event) =>
                        setSelectedOptions(
                          (previous) => ({
                            ...previous,

                            [option.id]:
                              event.target.value,
                          }),
                        )
                      }
                    >
                      <option value="">
                        Select {option.name}
                      </option>

                      {option.values.map(
                        (value) => (
                          <option
                            key={value.id}
                            value={value.value}
                          >
                            {value.label}
                          </option>
                        ),
                      )}
                    </select>
                  ) : (
                    <div className="option-values">
                      {option.values.map(
                        (value) => {
                          const possible =
                            optionValueAvailable(
                              product,
                              option.id,
                              value.value,
                              selectedOptions,
                            );

                          const selected =
                            selectedOptions[
                              option.id
                            ] === value.value;

                          return (
                            <button
                              key={value.id}
                              type="button"
                              disabled={!possible}
                              className={cn(
                                option.displayType ===
                                  'color' &&
                                  'color-option',

                                selected &&
                                  'selected',
                              )}
                              onClick={() =>
                                setSelectedOptions(
                                  (previous) => ({
                                    ...previous,

                                    [option.id]:
                                      value.value,
                                  }),
                                )
                              }
                            >
                              {option.displayType ===
                                'color' && (
                                <i
                                  style={{
                                    background:
                                      value.hexColor ||
                                      value.value,
                                  }}
                                />
                              )}

                              <span>
                                {value.label}
                              </span>

                              {selected && (
                                <Check size={14} />
                              )}
                            </button>
                          );
                        },
                      )}
                    </div>
                  )}
                </div>
              );
            },
          )}

          <div className="availability">
            <span
              className={
                available
                  ? 'in-stock'
                  : 'out-stock'
              }
            >
              {available
                ? `In stock${
                    stock > 0 &&
                    stock < 6
                      ? ` · Only ${stock} left`
                      : ''
                  }`
                : 'Out of stock'}
            </span>
          </div>

          <div className="quantity-row">
            <span>Quantity</span>

            <div>
              <button
                type="button"
                onClick={() =>
                  setQuantity((value) =>
                    Math.max(
                      1,
                      value - 1,
                    ),
                  )
                }
              >
                <Minus size={16} />
              </button>

              <strong>{quantity}</strong>

              <button
                type="button"
                onClick={() =>
                  setQuantity((value) => {
                    if (
                      variant?.allowBackorder
                    ) {
                      return value + 1;
                    }

                    return Math.min(
                      stock || 1,
                      value + 1,
                    );
                  })
                }
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {message && (
            <div className="notice">
              {message}
            </div>
          )}

          <div className="purchase-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => add(false)}
              disabled={!available}
            >
              <ShoppingBag size={19} />
              Add to Cart
            </button>

            <button
              type="button"
              className="btn btn-accent"
              onClick={() => add(true)}
              disabled={!available}
            >
              Buy Now
            </button>

            <button
              type="button"
              className="icon-btn large"
              aria-label="Add to wishlist"
            >
              <Heart />
            </button>
          </div>

          <div className="trust-row">
            <div>
              <Truck />

              <span>
                <strong>Delivery</strong>

                <small>
                  {product.shippingInfo
                    ?.deliveryNote ||
                    '2–5 working days'}
                </small>
              </span>
            </div>

            <div>
              <ShieldCheck />

              <span>
                <strong>
                  Secure order
                </strong>

                <small>
                  Stock-aware checkout
                </small>
              </span>
            </div>
          </div>

          <div className="accordion">
            <details open>
              <summary>
                Product Details
                <ChevronDown />
              </summary>

              <div className="markdown">
                <Markdown>
                  {product.productDetails ||
                    product.description ||
                    ''}
                </Markdown>
              </div>
            </details>

            {Object.keys(grouped).length >
              0 && (
              <details>
                <summary>
                  Specifications
                  <ChevronDown />
                </summary>

                <div>
                  {Object.entries(
                    grouped,
                  ).map(
                    ([group, items]) => (
                      <div
                        className="spec-group"
                        key={group}
                      >
                        <h4>{group}</h4>

                        {items.map(
                          (item) => (
                            <div
                              key={item.id}
                            >
                              <span>
                                {item.label}
                              </span>

                              <strong>
                                {item.value}
                              </strong>
                            </div>
                          ),
                        )}
                      </div>
                    ),
                  )}
                </div>
              </details>
            )}

            {product.sizeChart?.rows
              ?.length > 0 && (
              <details>
                <summary>
                  {product.sizeChart
                    .title ||
                    'Size Chart'}

                  <ChevronDown />
                </summary>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        {product.sizeChart.columns.map(
                          (column) => (
                            <th key={column}>
                              {column}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {product.sizeChart.rows.map(
                        (row, index) => (
                          <tr key={index}>
                            {product.sizeChart.columns.map(
                              (column) => (
                                <td key={column}>
                                  {row[column]}
                                </td>
                              ),
                            )}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </details>
            )}
          </div>
        </section>
      </div>

      {related.length > 0 && (
        <section className="section related-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                Same collection
              </span>

              <h2>You May Also Like</h2>
            </div>
          </div>

          <div className="product-grid">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}