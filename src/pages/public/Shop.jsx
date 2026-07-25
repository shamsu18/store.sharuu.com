import {
  ChevronDown,
  Search,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { useStore } from '../../contexts/StoreContext';

export default function Shop() {
  const {
    publicProducts = [],
    categories = [],
  } = useStore();

  const [params, setParams] =
    useSearchParams();

  const query = params.get('q') || '';
  const category =
    params.get('category') || '';
  const sort =
    params.get('sort') || 'featured';

  const [search, setSearch] =
    useState(query);

  useEffect(() => {
    setSearch(query);
  }, [query]);

  const selectedCategory = useMemo(
    () =>
      categories.find(
        item =>
          String(item.id) ===
          String(category),
      ),
    [categories, category],
  );

  const topCategories = useMemo(
    () =>
      categories
        .filter(
          item =>
            !item.parentId &&
            item.active &&
            item.showInMenu !== false,
        )
        .sort(
          (a, b) =>
            Number(a.sortOrder || 0) -
              Number(b.sortOrder || 0) ||
            String(a.name || '').localeCompare(
              String(b.name || ''),
            ),
        ),
    [categories],
  );

  /*
   * Main category select থাকলে:
   * Main category এবং তার subcategory-এর product দেখাবে।
   *
   * Subcategory select থাকলে:
   * শুধু selected subcategory-এর product দেখাবে।
   */
  const categoryIds = useMemo(() => {
    if (
      !category ||
      !selectedCategory
    ) {
      return [];
    }

    if (selectedCategory.parentId) {
      return [
        String(selectedCategory.id),
      ];
    }

    return [
      String(selectedCategory.id),

      ...categories
        .filter(
          item =>
            item.active &&
            String(item.parentId) ===
              String(
                selectedCategory.id,
              ),
        )
        .map(item =>
          String(item.id),
        ),
    ];
  }, [
    category,
    selectedCategory,
    categories,
  ]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    let result = publicProducts.filter(
      product => {
        const searchableText = `
          ${product.name || ''}
          ${product.productCode || ''}
          ${product.brand || ''}
          ${product.description || ''}
        `.toLowerCase();

        const matchesSearch =
          searchableText.includes(
            normalizedSearch,
          );

        const matchesCategory =
          !category ||
          categoryIds.includes(
            String(product.categoryId),
          ) ||
          categoryIds.includes(
            String(
              product.subcategoryId,
            ),
          );

        return (
          matchesSearch &&
          matchesCategory
        );
      },
    );

    if (sort === 'price-low') {
      result = [...result].sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0),
      );
    }

    if (sort === 'price-high') {
      result = [...result].sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0),
      );
    }

    if (sort === 'newest') {
      result = [...result].sort(
        (a, b) =>
          new Date(
            b.createdAt,
          ).getTime() -
          new Date(
            a.createdAt,
          ).getTime(),
      );
    }

    return result;
  }, [
    publicProducts,
    search,
    category,
    categoryIds,
    sort,
  ]);

  const updateParam = (
    key,
    value,
  ) => {
    const next =
      new URLSearchParams(params);

    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }

    setParams(next);
  };

  const handleSearch = event => {
    const value =
      event.target.value;

    setSearch(value);

    updateParam(
      'q',
      value.trim(),
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#faf9f6] pb-20 text-slate-950">
      <style>
        {`
          @keyframes categoryProductsTranslate {
            0% {
              opacity: 0;
              transform: translateX(28px);
            }

            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .category-products-translate {
            animation:
              categoryProductsTranslate
              480ms
              cubic-bezier(0.22, 1, 0.36, 1)
              both;
            will-change: transform, opacity;
          }

          @keyframes productCardTranslate {
            0% {
              opacity: 0;
              transform: translateX(20px);
            }

            100% {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .product-card-translate {
            opacity: 0;
            animation:
              productCardTranslate
              450ms
              cubic-bezier(0.22, 1, 0.36, 1)
              forwards;
            will-change: transform, opacity;
          }

          .mobile-category-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .mobile-category-scroll::-webkit-scrollbar {
            display: none;
          }

          @media (
            prefers-reduced-motion: reduce
          ) {
            .category-products-translate,
            .product-card-translate {
              opacity: 1;
              animation: none;
              transform: none;
            }
          }
        `}
      </style>

      <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14">
        {/* Mobile-only category strip: four items are visible at a time. */}
        {topCategories.length > 0 && (
          <section
            aria-label="Product categories"
            className="mb-3 rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_16px_45px_rgba(15,23,42,0.06)] md:hidden"
          >
            <div
              className="mobile-category-scroll flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain"
            >
              <button
                type="button"
                onClick={() =>
                  updateParam('category', '')
                }
                aria-pressed={!category}
                className={[
                  'w-[calc((100%-1.5rem)/4)] shrink-0 snap-start rounded-xl px-1 py-2 text-center text-[10px] font-black transition',
                  !category
                    ? 'bg-[var(--secondary-color)] text-[var(--on-secondary)] shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                ].join(' ')}
              >
                All
              </button>

              {topCategories.map(item => {
                const isActive =
                  String(category) ===
                  String(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      updateParam(
                        'category',
                        isActive ? '' : item.id,
                      )
                    }
                    aria-pressed={isActive}
                    title={item.name}
                    className={[
                      'w-[calc((100%-1.5rem)/4)] shrink-0 snap-start rounded-xl px-1 py-2 text-center text-[10px] font-black transition',
                      isActive
                        ? 'bg-[var(--secondary-color)] text-[var(--on-secondary)] shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    <span className="block truncate">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Search and Sort */}
        <section className="grid gap-3 rounded-[26px] border border-slate-200 bg-white p-3 shadow-[0_20px_55px_rgba(15,23,42,0.08)] sm:p-4 md:grid-cols-[minmax(0,1fr)_220px]">
          {/* Search Bar */}
          <label className="group flex min-h-14 items-center gap-3 rounded-2xl bg-slate-100 px-4 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-500/30">
            <Search
              size={19}
              className="shrink-0 text-slate-400 transition group-focus-within:text-amber-600"
            />

            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search product, SKU or brand..."
              className="min-w-0 flex-1 border-0 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          {/* Sort Dropdown */}
          <div className="relative hidden overflow-hidden rounded-2xl border border-slate-200 bg-white transition focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 md:block">
            <select
              value={sort}
              onChange={event =>
                updateParam(
                  'sort',
                  event.target.value,
                )
              }
              className="h-14 w-full appearance-none border-0 bg-transparent px-4 pr-11 text-sm font-bold text-slate-700 outline-none"
            >
              <option value="featured">
                Featured
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="price-low">
                Price low to high
              </option>

              <option value="price-high">
                Price high to low
              </option>
            </select>

            <ChevronDown
              size={17}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </section>

        {/*
         * Category/subcategory change হলে key পরিবর্তন হবে।
         * ফলে translate animation আবার চালু হবে।
         *
         * এখানে কোনো scroll ব্যবহার করা হয়নি।
         */}
        <div
          key={
            category ||
            'all-products'
          }
          className="category-products-translate"
        >
          {filteredProducts.length >
          0 ? (
            <section className="grid grid-cols-2 gap-3 py-8 sm:gap-5 sm:py-10 lg:grid-cols-4">
              {filteredProducts.map(
                (product, index) => (
                  <div
                    key={product.id}
                    className="product-card-translate min-w-0"
                    style={{
                      animationDelay: `${Math.min(
                        index * 55,
                        330,
                      )}ms`,
                    }}
                  >
                    <ProductCard
                      product={product}
                    />
                  </div>
                ),
              )}
            </section>
          ) : (
            <section className="mt-8 grid min-h-[380px] place-items-center rounded-[30px] border border-dashed border-slate-300 bg-white px-6 text-center">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-400">
                  <Search size={25} />
                </span>

                <h2 className="mt-5 font-serif text-3xl font-semibold text-slate-950">
                  No products found
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  Try another search or
                  category.
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
