import {
  ArrowLeft,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  WandSparkles,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useStore } from '../../contexts/StoreContext';
import {
  makeId,
  safeNumber,
  slugify,
} from '../../lib/utils';

import { api } from '../../services/api';

const emptyProduct = () => ({
  id: makeId('product'),
  name: '',
  slug: '',
  productCode: '',
  productType: 'simple',
  status: 'draft',
  categoryId: '',
  subcategoryId: '',
  brand: '',
  tags: [],
  shortDescription: '',
  description: '',
  productDetails: '',
  price: 0,
  originalPrice: 0,
  costPrice: 0,
  discount: 0,
  stock: 0,
  lowStockThreshold: 3,
  trackInventory: true,
  hasVariants: false,

  // Primary image compatibility
  image: '',
  images: [],
  media: [],

  options: [],
  variants: [],
  specifications: [],

  shippingInfo: {
    deliveryNote:
      'Delivery within 2–5 working days.',
  },

  returnPolicy:
    'Unused items can be returned within 7 days.',

  warrantyInfo: '',
  safetyInformation: '',
  featured: false,
  newArrival: false,
  bestSeller: false,

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

function combinations(
  options,
  index = 0,
  current = {},
  result = [],
) {
  if (index >= options.length) {
    result.push({ ...current });
    return result;
  }

  const option = options[index];

  option.values.forEach((value) => {
    combinations(
      options,
      index + 1,
      {
        ...current,
        [option.id]: value.value,
      },
      result,
    );
  });

  return result;
}

/**
 * একটি image-ই primary রাখে।
 * Primary না থাকলে প্রথম image primary হবে।
 */
function normalizeMedia(media = []) {
  if (!Array.isArray(media) || !media.length) {
    return [];
  }

  const primary =
    media.find(
      (item) =>
        item?.isPrimary && item?.url,
    ) || media.find((item) => item?.url);

  return media
    .filter((item) => item?.url)
    .map((item, index) => ({
      ...item,
      isPrimary:
        item.id === primary?.id,
      sortOrder: index,
    }));
}

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    products,
    categories,
    loadAdmin,
    adminLoaded,
    saveProduct,
  } = useStore();

  const [product, setProduct] =
    useState(emptyProduct);

  const [tab, setTab] =
    useState('basic');

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [imageUrl, setImageUrl] =
    useState('');

  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!adminLoaded) {
      loadAdmin().catch(() => {});
    }
  }, [adminLoaded, loadAdmin]);

  /**
   * Existing product load
   */
  useEffect(() => {
    if (!id || id === 'new') {
      return;
    }

    const found = products.find(
      (item) => item.id === id,
    );

    if (!found) {
      return;
    }

    const clonedProduct = JSON.parse(
      JSON.stringify(found),
    );

    let normalizedMedia =
      normalizeMedia(
        clonedProduct.media || [],
      );

    /**
     * পুরোনো product-এ media না থাকলে
     * product.image এবং product.images থেকে
     * media তৈরি করবে।
     */
    if (!normalizedMedia.length) {
      const legacyImages = [
        clonedProduct.image,

        ...(Array.isArray(
          clonedProduct.images,
        )
          ? clonedProduct.images
          : []),
      ].filter(
        (url, index, array) =>
          Boolean(url) &&
          array.indexOf(url) === index,
      );

      normalizedMedia =
        legacyImages.map(
          (url, index) => ({
            id: makeId('media'),
            url,
            altText:
              clonedProduct.name || '',
            type: 'image',
            isPrimary: index === 0,
            sortOrder: index,
          }),
        );
    }

    const primaryImage =
      normalizedMedia.find(
        (item) => item.isPrimary,
      )?.url ||
      normalizedMedia[0]?.url ||
      clonedProduct.image ||
      '';

    setProduct({
      ...emptyProduct(),
      ...clonedProduct,

      media: normalizedMedia,
      image: primaryImage,

      images: normalizedMedia.map(
        (item) => item.url,
      ),
    });
  }, [id, products]);

  const roots = categories.filter(
    (item) => !item.parentId,
  );

  const children = categories.filter(
    (item) =>
      item.parentId ===
      product.categoryId,
  );

  const update = (key, value) => {
    setProduct((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  /**
   * Uploaded files এবং direct URL—দুটোকেই একই media
   * structure-এ যোগ করে, যাতে save/primary/delete behavior
   * সব source-এর জন্য একই থাকে।
   */
  const appendMediaUrls = (urls) => {
    setProduct((previous) => {
      const oldMedia = normalizeMedia(
        previous.media || [],
      );

      const existingUrls = new Set(
        oldMedia.map((item) =>
          String(item.url).trim(),
        ),
      );

      const uniqueUrls = urls
        .map((url) => String(url || '').trim())
        .filter(
          (url) =>
            url && !existingUrls.has(url),
        );

      const alreadyHasPrimary =
        oldMedia.some(
          (item) => item.isPrimary,
        );

      const newMedia = uniqueUrls.map(
        (url, index) => ({
          id: makeId('media'),
          url,
          altText:
            previous.name ||
            'Product image',
          type: 'image',
          isPrimary:
            !alreadyHasPrimary &&
            oldMedia.length === 0 &&
            index === 0,
          sortOrder:
            oldMedia.length + index,
        }),
      );

      const updatedMedia =
        normalizeMedia([
          ...oldMedia,
          ...newMedia,
        ]);

      const primaryImage =
        updatedMedia.find(
          (item) => item.isPrimary,
        )?.url ||
        updatedMedia[0]?.url ||
        '';

      return {
        ...previous,
        media: updatedMedia,
        image: primaryImage,
        images: updatedMedia.map(
          (item) => item.url,
        ),
      };
    });
  };

  /**
   * Upload images
   */
  const upload = async (files) => {
    if (
      !files?.length ||
      uploading
    ) {
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploaded =
        await api.uploadImages(
          Array.from(files),
        );

      appendMediaUrls(
        uploaded
          .filter((item) => item?.url)
          .map((item) => item.url),
      );
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Image upload failed.',
      );
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    const value = imageUrl.trim();

    try {
      const parsed = new URL(value);

      if (
        !['http:', 'https:'].includes(
          parsed.protocol,
        )
      ) {
        throw new Error(
          'Unsupported URL protocol.',
        );
      }
    } catch {
      setError(
        'Enter a valid image URL starting with http:// or https://.',
      );
      return;
    }

    if (
      (product.media || []).some(
        (item) =>
          String(item.url).trim() ===
          value,
      )
    ) {
      setError(
        'This image URL is already added.',
      );
      return;
    }

    appendMediaUrls([value]);
    setImageUrl('');
    setError('');
  };

  /**
   * Set primary image
   */
  const setPrimaryImage = (
    mediaId,
  ) => {
    setProduct((previous) => {
      const updatedMedia = (
        previous.media || []
      ).map((item, index) => ({
        ...item,
        isPrimary:
          item.id === mediaId,
        sortOrder: index,
      }));

      const selectedImage =
        updatedMedia.find(
          (item) =>
            item.id === mediaId,
        )?.url || '';

      return {
        ...previous,
        media: updatedMedia,

        // Main image হিসেবে save
        image: selectedImage,

        images: updatedMedia.map(
          (item) => item.url,
        ),
      };
    });
  };

  /**
   * Delete image
   */
  const removeImage = (mediaId) => {
    setProduct((previous) => {
      const removedImage = (
        previous.media || []
      ).find(
        (item) =>
          item.id === mediaId,
      );

      const remainingMedia = (
        previous.media || []
      ).filter(
        (item) =>
          item.id !== mediaId,
      );

      if (!remainingMedia.length) {
        return {
          ...previous,
          media: [],
          image: '',
          images: [],
        };
      }

      let updatedMedia;

      /**
       * Primary image delete হলে
       * প্রথম remaining image primary হবে।
       */
      if (removedImage?.isPrimary) {
        updatedMedia =
          remainingMedia.map(
            (item, index) => ({
              ...item,
              isPrimary:
                index === 0,
              sortOrder: index,
            }),
          );
      } else {
        updatedMedia =
          normalizeMedia(
            remainingMedia,
          );
      }

      const nextPrimaryImage =
        updatedMedia.find(
          (item) => item.isPrimary,
        )?.url ||
        updatedMedia[0]?.url ||
        '';

      return {
        ...previous,
        media: updatedMedia,
        image: nextPrimaryImage,

        images: updatedMedia.map(
          (item) => item.url,
        ),
      };
    });
  };

  const addOption = () => {
    update('options', [
      ...(product.options || []),

      {
        id: makeId('option'),
        name: 'Option',
        displayType: 'buttons',
        required: true,
        values: [],
      },
    ]);
  };

  const addOptionValue = (
    optionId,
  ) => {
    update(
      'options',

      product.options.map((option) =>
        option.id === optionId
          ? {
              ...option,

              values: [
                ...option.values,

                {
                  id: makeId('value'),
                  label: 'Value',

                  value: `value-${
                    option.values.length +
                    1
                  }`,

                  sortOrder:
                    option.values.length,
                },
              ],
            }
          : option,
      ),
    );
  };

  const generateVariants = () => {
    const combos = combinations(
      product.options.filter(
        (option) =>
          option.values.length,
      ),
    );

    const existing = new Map(
      (product.variants || []).map(
        (item) => [
          JSON.stringify(
            item.optionValues,
          ),
          item,
        ],
      ),
    );

    update(
      'variants',

      combos.map(
        (optionValues, index) => {
          const oldVariant =
            existing.get(
              JSON.stringify(
                optionValues,
              ),
            );

          if (oldVariant) {
            return oldVariant;
          }

          return {
            id: makeId('variant'),

            sku: `${
              product.productCode ||
              'SKU'
            }-${String(
              index + 1,
            ).padStart(3, '0')}`,

            optionValues,

            price: safeNumber(
              product.price,
            ),

            originalPrice:
              safeNumber(
                product.originalPrice,
              ),

            stock: 0,
            status: 'active',
            image: '',
            images: [],
            allowBackorder: false,
          };
        },
      ),
    );
  };

  const totalVariantStock =
    useMemo(() => {
      if (!product.hasVariants) {
        return safeNumber(
          product.stock,
        );
      }

      return (
        product.variants || []
      )
        .filter(
          (item) =>
            item.status === 'active',
        )
        .reduce(
          (sum, item) =>
            sum +
            safeNumber(item.stock),
          0,
        );
    }, [
      product.hasVariants,
      product.stock,
      product.variants,
    ]);

  /**
   * Save product
   */
  const submit = async (event) => {
    event.preventDefault();

    if (
      !product.name.trim() ||
      !product.categoryId ||
      !product.media.length
    ) {
      setError(
        'Product name, category and at least one image are required.',
      );

      return;
    }

    setSaving(true);
    setError('');

    try {
      const normalizedMedia =
        normalizeMedia(
          product.media,
        );

      const primaryMedia =
        normalizedMedia.find(
          (item) => item.isPrimary,
        ) || normalizedMedia[0];

      const payload = {
        ...product,

        slug:
          product.slug ||
          slugify(product.name),

        productCode:
          product.productCode ||
          `PRD-${Date.now()
            .toString()
            .slice(-6)}`,

        price: safeNumber(
          product.price,
        ),

        originalPrice:
          safeNumber(
            product.originalPrice,
          ),

        costPrice: safeNumber(
          product.costPrice,
        ),

        discount: safeNumber(
          product.discount,
        ),

        stock: totalVariantStock,

        media: normalizedMedia,

        // Selected primary image
        image:
          primaryMedia?.url || '',

        images:
          normalizedMedia.map(
            (item) => item.url,
          ),

        updatedAt:
          new Date().toISOString(),
      };

      await saveProduct(payload);

      navigate('/admin/products');
    } catch (requestError) {
      setError(
        requestError?.message ||
          'Product save failed.',
      );
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    'basic',
    'pricing',
    'media',
    'options',
    'specifications',
    'shipping',
  ];

  return (
    <form onSubmit={submit}>
      <div className="admin-page-heading sticky-editor-heading">
        <div className="editor-heading-left">
          <Link
            className="icon-btn"
            to="/admin/products"
          >
            <ArrowLeft />
          </Link>

          <div>
            <span className="eyebrow">
              Product editor
            </span>

            <h1>
              {id === 'new' || !id
                ? 'Add Product'
                : 'Edit Product'}
            </h1>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={
            saving || uploading
          }
        >
          <Save size={17} />

          {saving
            ? 'Saving...'
            : 'Save Product'}
        </button>
      </div>

      <div className="editor-tabs">
        {tabs.map((item) => (
          <button
            type="button"
            key={item}
            className={
              tab === item
                ? 'active'
                : ''
            }
            onClick={() =>
              setTab(item)
            }
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <section className="admin-panel editor-panel">
        {tab === 'basic' && (
          <div className="form-grid">
            <label>
              Product Name

              <input
                value={product.name}
                onChange={(event) => {
                  const productName =
                    event.target.value;

                  setProduct(
                    (previous) => ({
                      ...previous,
                      name: productName,

                      slug:
                        previous.slug ||
                        slugify(
                          productName,
                        ),

                      media: (
                        previous.media ||
                        []
                      ).map((item) => ({
                        ...item,

                        altText:
                          item.altText ||
                          productName,
                      })),
                    }),
                  );
                }}
                required
              />
            </label>

            <label>
              Slug

              <input
                value={product.slug}
                onChange={(event) =>
                  update(
                    'slug',
                    slugify(
                      event.target.value,
                    ),
                  )
                }
              />
            </label>

            <label>
              Product Code

              <input
                value={
                  product.productCode
                }
                onChange={(event) =>
                  update(
                    'productCode',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Brand

              <input
                value={product.brand}
                onChange={(event) =>
                  update(
                    'brand',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Category

              <select
                value={
                  product.categoryId
                }
                onChange={(event) =>
                  setProduct(
                    (previous) => ({
                      ...previous,

                      categoryId:
                        event.target
                          .value,

                      subcategoryId:
                        '',
                    }),
                  )
                }
                required
              >
                <option value="">
                  Select category
                </option>

                {roots.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Subcategory

              <select
                value={
                  product.subcategoryId
                }
                onChange={(event) =>
                  update(
                    'subcategoryId',
                    event.target.value,
                  )
                }
              >
                <option value="">
                  None
                </option>

                {children.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.name}
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Status

              <select
                value={product.status}
                onChange={(event) =>
                  update(
                    'status',
                    event.target.value,
                  )
                }
              >
                <option value="active">
                  Active
                </option>

                <option value="draft">
                  Draft
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>
            </label>

            <label>
              Product Type

              <select
                value={
                  product.productType
                }
                onChange={(event) =>
                  update(
                    'productType',
                    event.target.value,
                  )
                }
              >
                <option value="simple">
                  Simple
                </option>

                <option value="variable">
                  Variable
                </option>
              </select>
            </label>

            <label className="full-field">
              Short Description

              <textarea
                rows="2"
                value={
                  product.description
                }
                onChange={(event) =>
                  update(
                    'description',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="full-field">
              Product Details

              <textarea
                rows="5"
                value={
                  product.productDetails
                }
                onChange={(event) =>
                  update(
                    'productDetails',
                    event.target.value,
                  )
                }
              />
            </label>

            <div className="check-grid full-field">
              {[
                [
                  'featured',
                  'Featured',
                ],

                [
                  'newArrival',
                  'New arrival product flag',
                ],

                [
                  'bestSeller',
                  'Best seller',
                ],
              ].map(
                ([key, label]) => (
                  <label
                    className="check-card"
                    key={key}
                  >
                    <input
                      type="checkbox"

                      checked={Boolean(
                        product[key],
                      )}

                      onChange={(
                        event,
                      ) =>
                        update(
                          key,
                          event.target
                            .checked,
                        )
                      }
                    />

                    <span>
                      {label}
                    </span>
                  </label>
                ),
              )}
            </div>
          </div>
        )}

        {tab === 'pricing' && (
          <div className="form-grid">
            <label>
              Base Price

              <input
                type="number"
                min="0"
                value={product.price}
                onChange={(event) =>
                  update(
                    'price',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Original Price

              <input
                type="number"
                min="0"

                value={
                  product.originalPrice
                }

                onChange={(event) =>
                  update(
                    'originalPrice',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Cost Price

              <input
                type="number"
                min="0"

                value={
                  product.costPrice
                }

                onChange={(event) =>
                  update(
                    'costPrice',
                    event.target.value,
                  )
                }
              />
            </label>

            <label>
              Discount %

              <input
                type="number"
                min="0"
                max="100"

                value={
                  product.discount
                }

                onChange={(event) =>
                  update(
                    'discount',
                    event.target.value,
                  )
                }
              />
            </label>

            {!product.hasVariants && (
              <label>
                Stock

                <input
                  type="number"
                  min="0"

                  value={
                    product.stock
                  }

                  onChange={(event) =>
                    update(
                      'stock',
                      event.target.value,
                    )
                  }
                />
              </label>
            )}

            <label>
              Low Stock Threshold

              <input
                type="number"
                min="0"

                value={
                  product.lowStockThreshold
                }

                onChange={(event) =>
                  update(
                    'lowStockThreshold',
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        )}

        {tab === 'media' && (
          <div>
            <div className="media-source-grid">
              <section className="media-source-card">
                <div>
                  <strong>
                    Upload from device
                  </strong>

                  <small>
                    JPG, PNG, WEBP or GIF ·
                    maximum 5 MB each
                  </small>
                </div>

                <label className="btn btn-light">
                  <ImagePlus size={17} />

                  {uploading
                    ? 'Uploading...'
                    : 'Choose Images'}

                  <input
                    hidden
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={uploading}
                    onChange={(event) => {
                      upload(
                        event.target.files,
                      );

                      event.target.value =
                        '';
                    }}
                  />
                </label>
              </section>

              <section className="media-source-card">
                <div>
                  <strong>
                    Add from image URL
                  </strong>

                  <small>
                    Paste a direct public image
                    link
                  </small>
                </div>

                <div className="media-url-row">
                  <input
                    type="url"
                    placeholder="https://example.com/product.jpg"
                    value={imageUrl}
                    onChange={(event) =>
                      setImageUrl(
                        event.target.value,
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === 'Enter'
                      ) {
                        event.preventDefault();
                        addImageUrl();
                      }
                    }}
                  />

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={addImageUrl}
                    disabled={!imageUrl.trim()}
                  >
                    <Plus size={17} />
                    Add URL
                  </button>
                </div>
              </section>
            </div>

            <div className="media-admin-grid">
              {(product.media || []).map(
                (media) => (
                  <article
                    key={media.id}
                    style={{
                      overflow:
                        'hidden',
                    }}
                  >
                    {/* Full image preview */}
                    <div
                      style={{
                        width: '100%',
                        height: '240px',
                        display: 'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        overflow:
                          'hidden',
                        background:
                          '#f8fafc',
                        borderRadius:
                          '12px',
                        border:
                          '1px solid #e5e7eb',
                      }}
                    >
                      <img
                        src={media.url}

                        alt={
                          media.altText ||
                          product.name ||
                          'Product image'
                        }

                        style={{
                          width: '100%',
                          height: '100%',

                          // পুরো image দেখাবে
                          objectFit:
                            'contain',

                          objectPosition:
                            'center',

                          display: 'block',
                          maxWidth:
                            '100%',
                          maxHeight:
                            '100%',
                        }}
                      />
                    </div>

                    <div>
                      <button
                        type="button"

                        className={
                          media.isPrimary
                            ? 'btn btn-primary btn-small'
                            : 'btn btn-light btn-small'
                        }

                        onClick={() =>
                          setPrimaryImage(
                            media.id,
                          )
                        }

                        disabled={
                          media.isPrimary
                        }
                      >
                        {media.isPrimary
                          ? 'Primary'
                          : 'Set Primary'}
                      </button>

                      <button
                        type="button"
                        className="icon-btn danger"

                        onClick={() =>
                          removeImage(
                            media.id,
                          )
                        }

                        aria-label="Delete image"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>
                    </div>
                  </article>
                ),
              )}
            </div>
          </div>
        )}

        {tab === 'options' && (
          <div>
            <label className="check-card inline-check">
              <input
                type="checkbox"

                checked={
                  product.hasVariants
                }

                onChange={(event) =>
                  setProduct(
                    (previous) => ({
                      ...previous,

                      hasVariants:
                        event.target
                          .checked,

                      productType:
                        event.target
                          .checked
                          ? 'variable'
                          : 'simple',
                    }),
                  )
                }
              />

              <span>
                Enable product options and
                variants
              </span>
            </label>

            {product.hasVariants && (
              <>
                <div className="button-row">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={addOption}
                  >
                    <Plus size={16} />
                    Add Option
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary"

                    onClick={
                      generateVariants
                    }
                  >
                    <WandSparkles
                      size={16}
                    />
                    Generate Variants
                  </button>
                </div>

                {product.options.map(
                  (option) => (
                    <div
                      className="option-admin-card"
                      key={option.id}
                    >
                      <div className="form-grid three">
                        <label>
                          Option Name

                          <input
                            value={
                              option.name
                            }

                            onChange={(
                              event,
                            ) =>
                              update(
                                'options',

                                product.options.map(
                                  (item) =>
                                    item.id ===
                                    option.id
                                      ? {
                                          ...item,

                                          name:
                                            event
                                              .target
                                              .value,
                                        }
                                      : item,
                                ),
                              )
                            }
                          />
                        </label>

                        <label>
                          Display

                          <select
                            value={
                              option.displayType
                            }

                            onChange={(
                              event,
                            ) =>
                              update(
                                'options',

                                product.options.map(
                                  (item) =>
                                    item.id ===
                                    option.id
                                      ? {
                                          ...item,

                                          displayType:
                                            event
                                              .target
                                              .value,
                                        }
                                      : item,
                                ),
                              )
                            }
                          >
                            <option value="buttons">
                              Buttons
                            </option>

                            <option value="color">
                              Color
                            </option>

                            <option value="dropdown">
                              Dropdown
                            </option>

                            <option value="age">
                              Age
                            </option>
                          </select>
                        </label>

                        <button
                          type="button"
                          className="icon-btn danger align-end"

                          onClick={() =>
                            update(
                              'options',

                              product.options.filter(
                                (item) =>
                                  item.id !==
                                  option.id,
                              ),
                            )
                          }
                        >
                          <Trash2 />
                        </button>
                      </div>

                      <div className="option-value-list">
                        {option.values.map(
                          (value) => (
                            <div
                              key={value.id}
                            >
                              <input
                                value={
                                  value.label
                                }

                                onChange={(
                                  event,
                                ) =>
                                  update(
                                    'options',

                                    product.options.map(
                                      (
                                        item,
                                      ) =>
                                        item.id ===
                                        option.id
                                          ? {
                                              ...item,

                                              values:
                                                item.values.map(
                                                  (
                                                    entry,
                                                  ) =>
                                                    entry.id ===
                                                    value.id
                                                      ? {
                                                          ...entry,

                                                          label:
                                                            event
                                                              .target
                                                              .value,

                                                          value:
                                                            slugify(
                                                              event
                                                                .target
                                                                .value,
                                                            ) ||
                                                            entry.value,
                                                        }
                                                      : entry,
                                                ),
                                            }
                                          : item,
                                    ),
                                  )
                                }
                              />

                              {option.displayType ===
                                'color' && (
                                <input
                                  type="color"

                                  value={
                                    value.hexColor ||
                                    '#111827'
                                  }

                                  onChange={(
                                    event,
                                  ) =>
                                    update(
                                      'options',

                                      product.options.map(
                                        (
                                          item,
                                        ) =>
                                          item.id ===
                                          option.id
                                            ? {
                                                ...item,

                                                values:
                                                  item.values.map(
                                                    (
                                                      entry,
                                                    ) =>
                                                      entry.id ===
                                                      value.id
                                                        ? {
                                                            ...entry,

                                                            hexColor:
                                                              event
                                                                .target
                                                                .value,
                                                          }
                                                        : entry,
                                                  ),
                                              }
                                            : item,
                                      ),
                                    )
                                  }
                                />
                              )}

                              <button
                                type="button"
                                className="icon-btn danger"

                                onClick={() =>
                                  update(
                                    'options',

                                    product.options.map(
                                      (
                                        item,
                                      ) =>
                                        item.id ===
                                        option.id
                                          ? {
                                              ...item,

                                              values:
                                                item.values.filter(
                                                  (
                                                    entry,
                                                  ) =>
                                                    entry.id !==
                                                    value.id,
                                                ),
                                            }
                                          : item,
                                    ),
                                  )
                                }
                              >
                                <Trash2
                                  size={14}
                                />
                              </button>
                            </div>
                          ),
                        )}
                      </div>

                      <button
                        type="button"
                        className="text-link"

                        onClick={() =>
                          addOptionValue(
                            option.id,
                          )
                        }
                      >
                        + Add Value
                      </button>
                    </div>
                  ),
                )}

                {product.variants.length >
                  0 && (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>
                            Variant
                          </th>

                          <th>SKU</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {product.variants.map(
                          (variant) => (
                            <tr
                              key={
                                variant.id
                              }
                            >
                              <td>
                                {Object.values(
                                  variant.optionValues,
                                ).join(
                                  ' / ',
                                )}
                              </td>

                              <td>
                                <input
                                  value={
                                    variant.sku
                                  }

                                  onChange={(
                                    event,
                                  ) =>
                                    update(
                                      'variants',

                                      product.variants.map(
                                        (
                                          item,
                                        ) =>
                                          item.id ===
                                          variant.id
                                            ? {
                                                ...item,

                                                sku:
                                                  event
                                                    .target
                                                    .value,
                                              }
                                            : item,
                                      ),
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="number"

                                  value={
                                    variant.price
                                  }

                                  onChange={(
                                    event,
                                  ) =>
                                    update(
                                      'variants',

                                      product.variants.map(
                                        (
                                          item,
                                        ) =>
                                          item.id ===
                                          variant.id
                                            ? {
                                                ...item,

                                                price:
                                                  event
                                                    .target
                                                    .value,
                                              }
                                            : item,
                                      ),
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <input
                                  type="number"

                                  value={
                                    variant.stock
                                  }

                                  onChange={(
                                    event,
                                  ) =>
                                    update(
                                      'variants',

                                      product.variants.map(
                                        (
                                          item,
                                        ) =>
                                          item.id ===
                                          variant.id
                                            ? {
                                                ...item,

                                                stock:
                                                  safeNumber(
                                                    event
                                                      .target
                                                      .value,
                                                  ),
                                              }
                                            : item,
                                      ),
                                    )
                                  }
                                />
                              </td>

                              <td>
                                <select
                                  value={
                                    variant.status
                                  }

                                  onChange={(
                                    event,
                                  ) =>
                                    update(
                                      'variants',

                                      product.variants.map(
                                        (
                                          item,
                                        ) =>
                                          item.id ===
                                          variant.id
                                            ? {
                                                ...item,

                                                status:
                                                  event
                                                    .target
                                                    .value,
                                              }
                                            : item,
                                      ),
                                    )
                                  }
                                >
                                  <option value="active">
                                    Active
                                  </option>

                                  <option value="draft">
                                    Draft
                                  </option>

                                  <option value="archived">
                                    Archived
                                  </option>
                                </select>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {tab ===
          'specifications' && (
          <div>
            <button
              type="button"
              className="btn btn-light"

              onClick={() =>
                update(
                  'specifications',

                  [
                    ...product.specifications,

                    {
                      id: makeId('spec'),
                      group: 'General',
                      label: '',
                      value: '',

                      sortOrder:
                        product
                          .specifications
                          .length,
                    },
                  ],
                )
              }
            >
              <Plus size={16} />
              Add Specification
            </button>

            <div className="spec-admin-list">
              {product.specifications.map(
                (spec) => (
                  <div
                    className="form-grid spec-admin-row"
                    key={spec.id}
                  >
                    <input
                      placeholder="Group"
                      value={spec.group}

                      onChange={(event) =>
                        update(
                          'specifications',

                          product.specifications.map(
                            (item) =>
                              item.id ===
                              spec.id
                                ? {
                                    ...item,

                                    group:
                                      event
                                        .target
                                        .value,
                                  }
                                : item,
                          ),
                        )
                      }
                    />

                    <input
                      placeholder="Label"
                      value={spec.label}

                      onChange={(event) =>
                        update(
                          'specifications',

                          product.specifications.map(
                            (item) =>
                              item.id ===
                              spec.id
                                ? {
                                    ...item,

                                    label:
                                      event
                                        .target
                                        .value,
                                  }
                                : item,
                          ),
                        )
                      }
                    />

                    <input
                      placeholder="Value"
                      value={spec.value}

                      onChange={(event) =>
                        update(
                          'specifications',

                          product.specifications.map(
                            (item) =>
                              item.id ===
                              spec.id
                                ? {
                                    ...item,

                                    value:
                                      event
                                        .target
                                        .value,
                                  }
                                : item,
                          ),
                        )
                      }
                    />

                    <button
                      type="button"
                      className="icon-btn danger"

                      onClick={() =>
                        update(
                          'specifications',

                          product.specifications.filter(
                            (item) =>
                              item.id !==
                              spec.id,
                          ),
                        )
                      }
                    >
                      <Trash2 />
                    </button>
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {tab === 'shipping' && (
          <div className="form-grid">
            <label className="full-field">
              Delivery Note

              <textarea
                rows="3"

                value={
                  product.shippingInfo
                    ?.deliveryNote ||
                  ''
                }

                onChange={(event) =>
                  update(
                    'shippingInfo',

                    {
                      ...(product.shippingInfo ||
                        {}),

                      deliveryNote:
                        event.target.value,
                    },
                  )
                }
              />
            </label>

            <label className="full-field">
              Return Policy

              <textarea
                rows="3"

                value={
                  product.returnPolicy
                }

                onChange={(event) =>
                  update(
                    'returnPolicy',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="full-field">
              Warranty

              <textarea
                rows="3"

                value={
                  product.warrantyInfo
                }

                onChange={(event) =>
                  update(
                    'warrantyInfo',
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="full-field">
              Safety Information

              <textarea
                rows="3"

                value={
                  product.safetyInformation
                }

                onChange={(event) =>
                  update(
                    'safetyInformation',
                    event.target.value,
                  )
                }
              />
            </label>
          </div>
        )}
      </section>
    </form>
  );
}
