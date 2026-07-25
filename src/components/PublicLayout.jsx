import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Facebook,
  Home,
  Instagram,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  PackageSearch,
  Phone,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
} from 'react-router-dom';

import { useCart } from '../contexts/CartContext';
import { useStore } from '../contexts/StoreContext';

export default function PublicLayout() {
  const {
    settings,
    categories = [],
    pages = [],
  } = useStore();

  const { count } = useCart();
  const location = useLocation();

  const footerRef = useRef(null);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [
    openMobileCategory,
    setOpenMobileCategory,
  ] = useState(null);

  const [
    footerVisible,
    setFooterVisible,
  ] = useState(false);

  const activeCategoryId =
    new URLSearchParams(
      location.search,
    ).get('category');

  const homeIsActive =
    location.pathname === '/';

  const allProductsIsActive =
    location.pathname === '/shop' &&
    !activeCategoryId;

  /*
   * Admin panel থেকে যেকোনো primary বা secondary
   * color select করলেও readable text color তৈরি হবে।
   */
  const primaryColor =
    normalizeHexColor(
      settings?.primaryColor,
      '#0f172a',
    );

  const secondaryColor =
    normalizeHexColor(
      settings?.secondaryColor,
      '#d97706',
    );

  const themeVariables = useMemo(
    () =>
      createThemeVariables(
        primaryColor,
        secondaryColor,
      ),
    [
      primaryColor,
      secondaryColor,
    ],
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
            Number(
              a.sortOrder || 0,
            ) -
            Number(
              b.sortOrder || 0,
            ),
        ),
    [categories],
  );

  const publishedPages = useMemo(
    () =>
      pages
        .filter(
          page =>
            page.status ===
            'published',
        )
        .slice(0, 6),
    [pages],
  );

  const socials =
    settings?.socialLinks || {};

  const whatsappNumber =
    socials.whatsapp
      ? socials.whatsapp.replace(
          /\D/g,
          '',
        )
      : '';

  const currentYear =
    new Date().getFullYear();

  const getSubcategories =
    parentId =>
      categories
        .filter(
          item =>
            String(
              item.parentId,
            ) ===
              String(parentId) &&
            item.active,
        )
        .sort(
          (a, b) =>
            Number(
              a.sortOrder || 0,
            ) -
            Number(
              b.sortOrder || 0,
            ),
        );

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setOpenMobileCategory(null);
  };

  const toggleMobileCategory =
    categoryId => {
      setOpenMobileCategory(
        current =>
          String(current) ===
          String(categoryId)
            ? null
            : categoryId,
      );
    };

  useEffect(() => {
    setMenuOpen(false);
    setOpenMobileCategory(null);
  }, [
    location.pathname,
    location.search,
  ]);

  useEffect(() => {
    document.body.style.overflow =
      menuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow =
        '';
    };
  }, [menuOpen]);

  /*
   * পুরোনো global CSS-এ body/html margin
   * অথবা bottom padding থাকলেও
   * footer-এর পরে extra space আসবে না।
   */
  useEffect(() => {
    const html =
      document.documentElement;

    const body = document.body;

    const previous = {
      htmlMargin:
        html.style.margin,

      htmlPadding:
        html.style.padding,

      bodyMargin:
        body.style.margin,

      bodyPadding:
        body.style.padding,

      bodyMinHeight:
        body.style.minHeight,

      bodyOverflowX:
        body.style.overflowX,
    };

    html.style.margin = '0';
    html.style.padding = '0';

    body.style.margin = '0';
    body.style.padding = '0';
    body.style.minHeight = '100%';
    body.style.overflowX =
      'hidden';

    return () => {
      html.style.margin =
        previous.htmlMargin;

      html.style.padding =
        previous.htmlPadding;

      body.style.margin =
        previous.bodyMargin;

      body.style.padding =
        previous.bodyPadding;

      body.style.minHeight =
        previous.bodyMinHeight;

      body.style.overflowX =
        previous.bodyOverflowX;
    };
  }, []);

  /*
   * Footer screen-এ দেখা শুরু করলে
   * mobile bottom navigation hide হবে।
   */
  useEffect(() => {
    const footerElement =
      footerRef.current;

    if (
      !footerElement ||
      typeof IntersectionObserver ===
        'undefined'
    ) {
      return undefined;
    }

    const observer =
      new IntersectionObserver(
        entries => {
          const [entry] = entries;

          setFooterVisible(
            entry.isIntersecting,
          );
        },
        {
          threshold: 0.01,

          rootMargin:
            '0px 0px 70px 0px',
        },
      );

    observer.observe(
      footerElement,
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  const mobileBottomLinkClass = ({
    isActive,
  }) =>
    [
      'relative flex flex-col items-center',
      'justify-center gap-1 rounded-2xl',
      'px-2 py-1.5 text-[10px]',
      'font-semibold',
      'transition duration-200',

      isActive
        ? 'bg-[var(--secondary-color)] text-[var(--on-secondary)]'
        : 'text-[var(--on-primary-dark)] hover:bg-[var(--footer-surface)]',
    ].join(' ');

  return (
    <div
      style={themeVariables}
      className="flex min-h-[100dvh] flex-col overflow-x-hidden bg-white text-slate-900"
    >
      {/* Announcement */}
      {settings?.announcement && (
        <div className="relative overflow-hidden bg-[var(--primary-dark)] px-4 py-2.5 text-center text-xs font-semibold tracking-wide text-[var(--on-primary-dark)]">
          <span className="relative z-10">
            {settings.announcement}
          </span>

          <span className="absolute -left-16 top-0 h-full w-24 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto grid min-h-[72px] w-full max-w-[1440px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 lg:min-h-[88px] lg:gap-3 xl:gap-5">
          {/* Mobile Menu */}
          <button
            type="button"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-800 transition hover:border-[var(--secondary-color)] hover:text-[var(--secondary-ink)] lg:hidden"
          >
            <Menu size={22} />
          </button>

          {/* Brand */}
          <Link
            to="/"
            aria-label="Go to home"
            className="flex min-w-0 items-center gap-3"
          >
            {settings?.logo ? (
              <img
                src={settings.logo}
                alt={
                  settings?.storeName ||
                  'Sharuu Universal Store'
                }
                className="h-11 w-11 shrink-0 object-contain lg:h-12 lg:w-12"
              />
            ) : (
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-color)] font-serif text-xl font-bold text-[var(--on-primary)] shadow-lg lg:h-12 lg:w-12">
                S
              </span>
            )}

            <span className="min-w-0">
              <strong className="block max-w-[150px] truncate text-sm font-black tracking-tight text-slate-950 lg:max-w-[160px] lg:text-base xl:max-w-[210px]">
                {settings?.storeName ||
                  'Sharuu Universal Store'}
              </strong>

              {settings?.slogan && (
                <small className="hidden max-w-[190px] truncate text-[11px] text-slate-500 xl:block">
                  {settings.slogan}
                </small>
              )}
            </span>
          </Link>

          {/* Desktop Categories */}
          <nav className="hidden min-w-0 flex-wrap items-center justify-center gap-1 lg:flex">
            {/* Home Button */}
<Link
  to="/"
  className={[
    'relative inline-flex min-h-10',
    'shrink-0 items-center gap-1.5',
    'rounded-xl border',
    'px-3 py-2',
    'text-[11px] font-extrabold',
    'transition duration-200',
    'xl:gap-2 xl:px-4 xl:text-xs',

    homeIsActive
      ? [
          'border-[var(--primary-color)]',
          'bg-white',
          'text-[var(--primary-ink)]',
          'shadow-sm',
        ].join(' ')
      : [
          'border-slate-200',
          'bg-white',
          'text-slate-600',
          'hover:border-[var(--primary-border)]',
          'hover:bg-[var(--primary-soft)]',
          'hover:text-[var(--on-primary-soft)]',
        ].join(' '),
  ].join(' ')}
>
  <Home
    size={16}
    className="shrink-0 text-current"
  />

  <span className="text-current">
    Home
  </span>

  {/* Active underline */}
  <span
    className={[
      'absolute bottom-0',
      'left-3 right-3 h-0.5',
      'origin-center rounded-full',
      'bg-[var(--primary-color)]',
      'transition-transform duration-200',

      homeIsActive
        ? 'scale-x-100'
        : 'scale-x-0',
    ].join(' ')}
  />
</Link>

            {/* All Products Button */}
            <Link
              to="/shop"
              className={[
                'mr-1 inline-flex min-h-10',
                'shrink-0 items-center gap-1.5',
                'rounded-xl border',
                'px-3 py-2',
                'text-[11px] font-black',
                'transition duration-200',
                'xl:gap-2 xl:px-4 xl:text-xs',

                allProductsIsActive
                  ? 'border-[var(--secondary-color)] bg-[var(--secondary-color)] text-[var(--on-secondary)] shadow-md'
                  : 'border-[var(--secondary-border)] bg-[var(--secondary-soft)] text-[var(--on-secondary-soft)] hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-[var(--on-secondary)]',
              ].join(' ')}
            >
              <Store
                size={16}
                className="shrink-0 text-current"
              />

              <span className="text-current">
                All Products
              </span>
            </Link>

            {/* Main Categories */}
            {topCategories.map(
              category => {
                const subcategories =
                  getSubcategories(
                    category.id,
                  );

                const categoryIsActive =
                  String(
                    activeCategoryId,
                  ) ===
                    String(
                      category.id,
                    ) ||
                  subcategories.some(
                    child =>
                      String(
                        child.id,
                      ) ===
                      String(
                        activeCategoryId,
                      ),
                  );

                return (
                  <div
                    key={category.id}
                    className="group relative"
                  >
                    {/* Category Link */}
                    <Link
                      to={`/shop?category=${category.id}`}
                      className={[
                        'relative flex min-h-10',
                        'shrink-0 items-center',
                        'gap-1 rounded-xl',
                        'px-2.5 py-2',
                        'text-[11px]',
                        'font-extrabold',
                        'transition duration-200',
                        'xl:gap-1.5',
                        'xl:px-3 xl:text-xs',

                        categoryIsActive
                          ? 'bg-[var(--secondary-soft)] text-[var(--on-secondary-soft)]'
                          : 'text-slate-600 hover:bg-[var(--secondary-soft)] hover:text-[var(--on-secondary-soft)]',
                      ].join(' ')}
                    >
                      <span>
                        {
                          category.name
                        }
                      </span>

                      {subcategories.length >
                        0 && (
                        <ChevronDown
                          size={14}
                          className="shrink-0 transition-transform duration-200 group-hover:rotate-180"
                        />
                      )}

                      <span
                        className={[
                          'absolute bottom-0',
                          'left-3 right-3 h-0.5',
                          'origin-center rounded-full',
                          'bg-[var(--secondary-color)]',
                          'transition-transform duration-200',

                          categoryIsActive
                            ? 'scale-x-100'
                            : 'scale-x-0 group-hover:scale-x-100',
                        ].join(
                          ' ',
                        )}
                      />
                    </Link>

                    {/* Category Dropdown */}
                    {subcategories.length >
                      0 && (
                      <div className="invisible absolute left-1/2 top-full z-[100] w-[200px] -translate-x-1/2 translate-y-3 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_25px_70px_rgba(15,23,42,0.18)]">
                          <div className="relative overflow-hidden rounded-2xl bg-[var(--primary-color)] p-5 text-[var(--on-primary)]">
                            <h3 className="relative z-10 break-words font-serif text-xl font-bold leading-tight">
                              {
                                category.name
                              }
                            </h3>

                            <span className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[var(--secondary-color)] opacity-20" />
                          </div>

                          <Link
                            to={`/shop?category=${category.id}`}
                            className="mt-2 flex items-center justify-between gap-2 border-b border-slate-100 px-3 py-3 text-xs font-black text-[var(--secondary-ink)] transition hover:bg-[var(--secondary-soft)] hover:text-[var(--on-secondary-soft)]"
                          >
                            <span className="min-w-0 break-words">
                              View all{' '}
                              {
                                category.name
                              }
                            </span>

                            <ArrowRight
                              size={16}
                              className="shrink-0"
                            />
                          </Link>

                          <div className="mt-1 max-h-80 space-y-1 overflow-y-auto">
                            {subcategories.map(
                              child => {
                                const childIsActive =
                                  String(
                                    activeCategoryId,
                                  ) ===
                                  String(
                                    child.id,
                                  );

                                return (
                                  <Link
                                    key={
                                      child.id
                                    }
                                    to={`/shop?category=${child.id}`}
                                    className={[
                                      'flex items-center',
                                      'justify-between gap-2',
                                      'rounded-xl px-3',
                                      'py-3 text-sm',
                                      'font-bold transition',
                                      'duration-200',

                                      childIsActive
                                        ? 'bg-[var(--secondary-soft)] pl-4 text-[var(--on-secondary-soft)]'
                                        : 'text-slate-600 hover:bg-[var(--secondary-soft)] hover:pl-4 hover:text-[var(--on-secondary-soft)]',
                                    ].join(
                                      ' ',
                                    )}
                                  >
                                    <span className="min-w-0 break-words">
                                      {
                                        child.name
                                      }
                                    </span>

                                    <ChevronRight
                                      size={15}
                                      className="shrink-0"
                                    />
                                  </Link>
                                );
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )}
          </nav>

          {/* Header Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/track-order"
              className="hidden items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-[var(--secondary-soft)] hover:text-[var(--on-secondary-soft)] sm:flex xl:px-3"
            >
              <PackageSearch
                size={20}
              />

              <span className="hidden 2xl:inline">
                Track
              </span>
            </Link>

            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-bold text-slate-700 transition hover:bg-[var(--secondary-soft)] hover:text-[var(--on-secondary-soft)] xl:px-3"
            >
              <ShoppingBag
                size={21}
              />

              <span className="hidden 2xl:inline">
                Cart
              </span>

              {count > 0 && (
                <b className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--secondary-color)] px-1 text-[10px] font-black text-[var(--on-secondary)] shadow">
                  {count}
                </b>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={[
          'fixed inset-0 z-[100] lg:hidden',

          menuOpen
            ? 'pointer-events-auto'
            : 'pointer-events-none',
        ].join(' ')}
      >
        <button
          type="button"
          onClick={closeMobileMenu}
          aria-label="Close menu"
          className={[
            'absolute inset-0',
            'bg-slate-950/60',
            'backdrop-blur-sm',
            'transition-opacity duration-300',

            menuOpen
              ? 'opacity-100'
              : 'opacity-0',
          ].join(' ')}
        />

        <aside
          className={[
            'absolute inset-y-0 left-0',
            'flex w-[min(90vw,390px)]',
            'flex-col bg-white shadow-2xl',
            'transition-transform duration-300',

            menuOpen
              ? 'translate-x-0'
              : '-translate-x-full',
          ].join(' ')}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <Link
              to="/"
              onClick={
                closeMobileMenu
              }
              className="flex min-w-0 items-center gap-3"
            >
              {settings?.logo ? (
                <img
                  src={
                    settings.logo
                  }
                  alt={
                    settings?.storeName ||
                    'Store'
                  }
                  className="h-11 w-11 shrink-0 object-contain"
                />
              ) : (
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[var(--primary-color)] font-serif text-xl font-bold text-[var(--on-primary)]">
                  S
                </span>
              )}

              <span className="min-w-0">
                <strong className="block truncate text-sm font-black text-slate-950">
                  {settings?.storeName ||
                    'Sharuu Universal Store'}
                </strong>

                {settings?.slogan && (
                  <small className="block truncate text-[11px] text-slate-500">
                    {
                      settings.slogan
                    }
                  </small>
                )}
              </span>
            </Link>

            <button
              type="button"
              onClick={
                closeMobileMenu
              }
              aria-label="Close menu"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-red-50 hover:text-red-600"
            >
              <X size={21} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Main Links */}
            <div className="space-y-1">
              <NavLink
                to="/"
                onClick={
                  closeMobileMenu
                }
                className={({
                  isActive,
                }) =>
                  [
                    'flex items-center gap-3',
                    'rounded-xl px-3 py-3',
                    'text-sm font-extrabold',
                    'transition',

                    isActive
                      ? 'bg-[var(--primary-soft)] text-[var(--on-primary-soft)]'
                      : 'text-slate-700 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                <Home size={18} />
                Home
              </NavLink>

              <NavLink
                to="/shop"
                onClick={
                  closeMobileMenu
                }
                className={({
                  isActive,
                }) =>
                  [
                    'flex items-center gap-3',
                    'rounded-xl px-3 py-3',
                    'text-sm font-extrabold',
                    'transition',

                    isActive &&
                    !activeCategoryId
                      ? 'bg-[var(--secondary-soft)] text-[var(--on-secondary-soft)]'
                      : 'text-slate-700 hover:bg-[var(--secondary-soft)] hover:text-[var(--on-secondary-soft)]',
                  ].join(' ')
                }
              >
                <Store size={18} />
                All Products
              </NavLink>
            </div>

            <div className="mb-2 mt-7 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--secondary-ink)]">
              Shop by category
            </div>

            {/* Mobile Categories */}
            <div className="divide-y divide-slate-100">
              {topCategories.map(
                category => {
                  const subcategories =
                    getSubcategories(
                      category.id,
                    );

                  const isOpen =
                    String(
                      openMobileCategory,
                    ) ===
                    String(
                      category.id,
                    );

                  return (
                    <div
                      key={
                        category.id
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/shop?category=${category.id}`}
                          onClick={
                            closeMobileMenu
                          }
                          className="flex-1 py-3.5 text-sm font-extrabold text-slate-800 transition hover:text-[var(--secondary-ink)]"
                        >
                          {
                            category.name
                          }
                        </Link>

                        {subcategories.length >
                          0 && (
                          <button
                            type="button"
                            onClick={() =>
                              toggleMobileCategory(
                                category.id,
                              )
                            }
                            aria-label={`Toggle ${category.name} subcategories`}
                            aria-expanded={
                              isOpen
                            }
                            className={[
                              'grid h-10 w-10',
                              'place-items-center',
                              'rounded-xl',
                              'transition',

                              isOpen
                                ? 'bg-[var(--secondary-soft)] text-[var(--on-secondary-soft)]'
                                : 'bg-slate-100 text-slate-500',
                            ].join(
                              ' ',
                            )}
                          >
                            <ChevronDown
                              size={18}
                              className={[
                                'transition-transform',
                                'duration-200',

                                isOpen
                                  ? 'rotate-180'
                                  : '',
                              ].join(
                                ' ',
                              )}
                            />
                          </button>
                        )}
                      </div>

                      {subcategories.length >
                        0 && (
                        <div
                          className={[
                            'grid overflow-hidden',
                            'transition-all',
                            'duration-300',
                            'ease-in-out',

                            isOpen
                              ? 'grid-rows-[1fr] pb-3 opacity-100'
                              : 'grid-rows-[0fr] opacity-0',
                          ].join(
                            ' ',
                          )}
                        >
                          <div className="min-h-0 overflow-hidden">
                            <div className="ml-3 space-y-1 border-l-2 border-[var(--secondary-border)] pl-3">
                              <Link
                                to={`/shop?category=${category.id}`}
                                onClick={
                                  closeMobileMenu
                                }
                                className="block rounded-lg px-3 py-2.5 text-xs font-extrabold text-[var(--secondary-ink)] transition hover:bg-[var(--secondary-soft)] hover:text-[var(--on-secondary-soft)]"
                              >
                                View all{' '}
                                {
                                  category.name
                                }
                              </Link>

                              {subcategories.map(
                                child => (
                                  <Link
                                    key={
                                      child.id
                                    }
                                    to={`/shop?category=${child.id}`}
                                    onClick={
                                      closeMobileMenu
                                    }
                                    className="block rounded-lg px-3 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-[var(--secondary-soft)] hover:text-[var(--on-secondary-soft)]"
                                  >
                                    {
                                      child.name
                                    }
                                  </Link>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>

            {/* Mobile Social */}
            <div className="mt-7">
              <p className="mb-3 text-xs font-extrabold text-slate-700">
                Follow us
              </p>

              <div className="flex gap-2">
                {socials.facebook && (
                  <a
                    href={
                      socials.facebook
                    }
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-[var(--on-secondary)]"
                  >
                    <Facebook
                      size={19}
                    />
                  </a>
                )}

                {socials.instagram && (
                  <a
                    href={
                      socials.instagram
                    }
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-[var(--on-secondary)]"
                  >
                    <Instagram
                      size={19}
                    />
                  </a>
                )}

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-[var(--on-secondary)]"
                  >
                    <MessageCircle
                      size={19}
                    />
                  </a>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Page Content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Footer */}
      <footer
        ref={footerRef}
        className="relative mt-0 shrink-0 overflow-hidden bg-[var(--primary-dark)] text-[var(--footer-text)]"
      >
        <span className="pointer-events-none absolute -right-40 top-24 h-96 w-96 rounded-full border border-[var(--footer-border)]" />

        <span className="pointer-events-none absolute -bottom-52 left-1/4 h-96 w-96 rounded-full bg-[var(--secondary-color)] opacity-[0.04]" />

        <div className="relative mx-auto w-full max-w-[1180px] px-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 py-12 sm:gap-x-8 sm:py-14 lg:grid-cols-[1.5fr_.8fr_.9fr_1.15fr] lg:gap-12 lg:py-16">
            {/* Brand */}
            <div className="min-w-0">
              <Link
                to="/"
                className="inline-flex max-w-full items-center gap-2 sm:gap-3"
              >
                {settings?.logo ? (
                  <img
                    src={
                      settings.logo
                    }
                    alt={
                      settings?.storeName ||
                      'Sharuu Universal Store'
                    }
                    className="h-10 w-10 shrink-0 object-contain sm:h-12 sm:w-12"
                  />
                ) : (
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--primary-color)] font-serif text-lg font-bold text-[var(--on-primary)] shadow-xl sm:h-12 sm:w-12 sm:rounded-2xl sm:text-xl">
                    S
                  </span>
                )}

                <span className="min-w-0">
                  <strong className="block break-words text-sm font-black leading-5 text-[var(--on-primary-dark)] sm:text-base">
                    {settings?.storeName ||
                      'Sharuu Universal Store'}
                  </strong>

                  {settings?.slogan && (
                    <small className="mt-1 block break-words text-[10px] leading-4 text-[var(--footer-muted)] sm:text-[11px]">
                      {
                        settings.slogan
                      }
                    </small>
                  )}
                </span>
              </Link>

              <p className="mt-5 break-words text-xs leading-6 text-[var(--footer-text)] sm:mt-6 sm:text-sm sm:leading-7">
                {settings?.footerDescription ||
                  settings?.description ||
                  'Discover carefully selected fashion, lifestyle and everyday products in one trusted destination.'}
              </p>

              <p className="mb-3 mt-5 text-[11px] font-extrabold text-[var(--on-primary-dark)] sm:mt-6 sm:text-xs">
                Follow our journey
              </p>

              <div className="flex flex-wrap gap-2">
                {socials.facebook && (
                  <a
                    href={
                      socials.facebook
                    }
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--footer-border)] bg-[var(--footer-surface)] text-[var(--footer-text)] transition hover:-translate-y-1 hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-[var(--on-secondary)] sm:h-11 sm:w-11"
                  >
                    <Facebook
                      size={17}
                    />
                  </a>
                )}

                {socials.instagram && (
                  <a
                    href={
                      socials.instagram
                    }
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--footer-border)] bg-[var(--footer-surface)] text-[var(--footer-text)] transition hover:-translate-y-1 hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-[var(--on-secondary)] sm:h-11 sm:w-11"
                  >
                    <Instagram
                      size={17}
                    />
                  </a>
                )}

                {whatsappNumber && (
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="WhatsApp"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--footer-border)] bg-[var(--footer-surface)] text-[var(--footer-text)] transition hover:-translate-y-1 hover:border-[var(--secondary-color)] hover:bg-[var(--secondary-color)] hover:text-[var(--on-secondary)] sm:h-11 sm:w-11"
                  >
                    <MessageCircle
                      size={17}
                    />
                  </a>
                )}
              </div>
            </div>

            {/* Shop */}
            <div className="min-w-0">
              <FooterHeading>
                {settings
                  ?.footerColumns?.[0]
                  ?.title || 'Shop'}
              </FooterHeading>

              <FooterLink to="/shop">
                All Products
              </FooterLink>

              {topCategories
                .slice(0, 6)
                .map(item => (
                  <FooterLink
                    key={item.id}
                    to={`/shop?category=${item.id}`}
                  >
                    {item.name}
                  </FooterLink>
                ))}
            </div>

            {/* Information */}
            <div className="min-w-0">
              <FooterHeading>
                {settings
                  ?.footerColumns?.[1]
                  ?.title ||
                  'Information'}
              </FooterHeading>

              <FooterLink to="/track-order">
                Track Order
              </FooterLink>

              <FooterLink to="/cart">
                Shopping Cart
              </FooterLink>

              {publishedPages.map(
                page => (
                  <FooterLink
                    key={page.id}
                    to={`/page/${page.slug}`}
                  >
                    {page.title}
                  </FooterLink>
                ),
              )}
            </div>

            {/* Contact */}
            <div className="min-w-0">
              <FooterHeading>
                {settings
                  ?.footerContactTitle ||
                  'Contact'}
              </FooterHeading>

              <div className="space-y-4">
                {settings?.supportPhone && (
                  <a
                    href={`tel:${settings.supportPhone}`}
                    className="flex min-w-0 items-start gap-2 text-xs text-[var(--footer-text)] transition hover:text-[var(--on-primary-dark)] sm:gap-3 sm:text-sm"
                  >
                    <FooterContactIcon>
                      <Phone
                        size={16}
                      />
                    </FooterContactIcon>

                    <span className="min-w-0">
                      <small className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[var(--footer-muted)] sm:text-[10px]">
                        Phone support
                      </small>

                      <span className="break-all">
                        {
                          settings.supportPhone
                        }
                      </span>
                    </span>
                  </a>
                )}

                {settings?.supportEmail && (
                  <a
                    href={`mailto:${settings.supportEmail}`}
                    className="flex min-w-0 items-start gap-2 text-xs text-[var(--footer-text)] transition hover:text-[var(--on-primary-dark)] sm:gap-3 sm:text-sm"
                  >
                    <FooterContactIcon>
                      <Mail
                        size={16}
                      />
                    </FooterContactIcon>

                    <span className="min-w-0">
                      <small className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[var(--footer-muted)] sm:text-[10px]">
                        Email support
                      </small>

                      <span className="break-all">
                        {
                          settings.supportEmail
                        }
                      </span>
                    </span>
                  </a>
                )}

                {settings?.address && (
                  <div className="flex min-w-0 items-start gap-2 text-xs leading-5 text-[var(--footer-text)] sm:gap-3 sm:text-sm sm:leading-6">
                    <FooterContactIcon>
                      <MapPin
                        size={16}
                      />
                    </FooterContactIcon>

                    <span className="min-w-0 break-words">
                      <small className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[var(--footer-muted)] sm:text-[10px]">
                        Store address
                      </small>

                      {settings.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="grid grid-cols-2 items-center gap-3 border-t border-[var(--footer-border)] py-5 text-[9px] leading-4 text-[var(--footer-muted)] sm:py-7 sm:text-xs">
            <span className="min-w-0 text-left">
              {settings?.footerText ||
                `© ${currentYear} ${
                  settings?.storeName ||
                  'Sharuu Universal Store'
                }. All rights reserved.`}
            </span>

            <span className="min-w-0 text-right">
              {settings?.footerBottomText ||
                'Secure shopping · Fast delivery · Easy support'}
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <nav
        className={[
          'fixed bottom-2 left-2 right-2',
          'z-50 grid grid-cols-5',
          'rounded-3xl border',
          'border-[var(--footer-border)]',
          'bg-[var(--primary-dark)]',
          'p-2 text-[var(--on-primary-dark)] shadow-2xl',
          'backdrop-blur-xl',
          'transition-all duration-300',
          'lg:hidden',

          footerVisible
            ? 'pointer-events-none translate-y-[140%] opacity-0'
            : 'translate-y-0 opacity-100',
        ].join(' ')}
      >
        <NavLink
          to="/"
          className={
            mobileBottomLinkClass
          }
        >
          <Home
            size={20}
            className="text-current"
          />

          <span className="text-current">
            Home
          </span>
        </NavLink>

        <NavLink
          to="/shop"
          className={
            mobileBottomLinkClass
          }
        >
          <Store
            size={20}
            className="text-current"
          />

          <span className="text-current">
            Shop
          </span>
        </NavLink>

        <button
          type="button"
          onClick={() =>
            setMenuOpen(true)
          }
          className="flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-[10px] font-semibold text-[var(--on-primary-dark)] transition hover:bg-[var(--footer-surface)]"
        >
          <Menu
            size={20}
            className="text-current"
          />

          <span className="text-current">
            Menu
          </span>
        </button>

        <NavLink
          to="/track-order"
          className={
            mobileBottomLinkClass
          }
        >
          <PackageSearch
            size={20}
            className="text-current"
          />

          <span className="text-current">
            Track
          </span>
        </NavLink>

        <NavLink
          to="/cart"
          className={({
            isActive,
          }) =>
            `${mobileBottomLinkClass({
              isActive,
            })} relative`
          }
        >
          <ShoppingBag
            size={20}
            className="text-current"
          />

          <span className="text-current">
            Cart
          </span>

          {count > 0 && (
            <b className="absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--secondary-color)] px-1 text-[9px] font-black text-[var(--on-secondary)]">
              {count}
            </b>
          )}
        </NavLink>
      </nav>
    </div>
  );
}

function FooterHeading({
  children,
}) {
  return (
    <h4 className="relative mb-5 break-words pb-3 font-serif text-base font-bold text-[var(--on-primary-dark)] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-8 after:rounded-full after:bg-[var(--secondary-on-dark)] sm:mb-6 sm:text-lg sm:after:w-9">
      {children}
    </h4>
  );
}

function FooterLink({
  to,
  children,
}) {
  return (
    <Link
      to={to}
      className="group flex min-w-0 items-start gap-1 py-1.5 text-xs text-[var(--footer-text)] transition hover:translate-x-1 hover:text-[var(--on-primary-dark)] sm:gap-1.5 sm:py-2 sm:text-sm"
    >
      <ChevronRight
        size={14}
        className="mt-0.5 shrink-0 text-[var(--secondary-on-dark)]"
      />

      <span className="min-w-0 break-words">
        {children}
      </span>
    </Link>
  );
}

function FooterContactIcon({
  children,
}) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--footer-border)] bg-[var(--footer-surface)] text-[var(--secondary-on-dark)] sm:h-10 sm:w-10 sm:rounded-xl">
      {children}
    </span>
  );
}

function normalizeHexColor(
  color,
  fallback = '#0f172a',
) {
  if (
    typeof color !== 'string' ||
    !color.trim()
  ) {
    return fallback;
  }

  let hex = color
    .trim()
    .replace('#', '');

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map(
        character =>
          character + character,
      )
      .join('');
  }

  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }

  if (
    hex.length !== 6 ||
    !/^[0-9a-fA-F]{6}$/.test(
      hex,
    )
  ) {
    return fallback;
  }

  return `#${hex.toLowerCase()}`;
}

function hexToRgb(color) {
  const hex =
    normalizeHexColor(
      color,
      '#000000',
    ).slice(1);

  return {
    red: parseInt(
      hex.slice(0, 2),
      16,
    ),

    green: parseInt(
      hex.slice(2, 4),
      16,
    ),

    blue: parseInt(
      hex.slice(4, 6),
      16,
    ),
  };
}

function rgbToHex({
  red,
  green,
  blue,
}) {
  const channelToHex =
    channel =>
      Math.round(
        Math.min(
          255,
          Math.max(
            0,
            channel,
          ),
        ),
      )
        .toString(16)
        .padStart(2, '0');

  return `#${channelToHex(
    red,
  )}${channelToHex(
    green,
  )}${channelToHex(blue)}`;
}

function mixHexColors(
  firstColor,
  secondColor,
  amount = 0.5,
) {
  const first =
    hexToRgb(firstColor);

  const second =
    hexToRgb(secondColor);

  const ratio = Math.min(
    1,
    Math.max(
      0,
      Number(amount) || 0,
    ),
  );

  return rgbToHex({
    red:
      first.red +
      (second.red -
        first.red) *
        ratio,

    green:
      first.green +
      (second.green -
        first.green) *
        ratio,

    blue:
      first.blue +
      (second.blue -
        first.blue) *
        ratio,
  });
}

function channelLuminance(
  channel,
) {
  const value = channel / 255;

  return value <= 0.03928
    ? value / 12.92
    : ((value + 0.055) /
        1.055) **
        2.4;
}

function relativeLuminance(
  color,
) {
  const {
    red,
    green,
    blue,
  } = hexToRgb(color);

  return (
    0.2126 *
      channelLuminance(red) +
    0.7152 *
      channelLuminance(
        green,
      ) +
    0.0722 *
      channelLuminance(blue)
  );
}

function contrastRatio(
  firstColor,
  secondColor,
) {
  const firstLuminance =
    relativeLuminance(
      firstColor,
    );

  const secondLuminance =
    relativeLuminance(
      secondColor,
    );

  const lighter = Math.max(
    firstLuminance,
    secondLuminance,
  );

  const darker = Math.min(
    firstLuminance,
    secondLuminance,
  );

  return (
    (lighter + 0.05) /
    (darker + 0.05)
  );
}

function getBestTextColor(
  backgroundColor,
) {
  const darkText = '#0f172a';
  const lightText = '#ffffff';

  return contrastRatio(
    darkText,
    backgroundColor,
  ) >=
    contrastRatio(
      lightText,
      backgroundColor,
    )
    ? darkText
    : lightText;
}

function ensureReadableColor(
  foregroundColor,
  backgroundColor,
  targetRatio = 4.5,
) {
  const foreground =
    normalizeHexColor(
      foregroundColor,
      '#0f172a',
    );

  const background =
    normalizeHexColor(
      backgroundColor,
      '#ffffff',
    );

  if (
    contrastRatio(
      foreground,
      background,
    ) >= targetRatio
  ) {
    return foreground;
  }

  const darkTarget = '#0f172a';
  const lightTarget = '#ffffff';

  const adjustmentTarget =
    contrastRatio(
      darkTarget,
      background,
    ) >=
    contrastRatio(
      lightTarget,
      background,
    )
      ? darkTarget
      : lightTarget;

  for (
    let step = 0.05;
    step <= 1;
    step += 0.05
  ) {
    const adjustedColor =
      mixHexColors(
        foreground,
        adjustmentTarget,
        step,
      );

    if (
      contrastRatio(
        adjustedColor,
        background,
      ) >= targetRatio
    ) {
      return adjustedColor;
    }
  }

  return adjustmentTarget;
}

function createThemeVariables(
  primaryColor,
  secondaryColor,
) {
  const primary =
    normalizeHexColor(
      primaryColor,
      '#0f172a',
    );

  const secondary =
    normalizeHexColor(
      secondaryColor,
      '#d97706',
    );

  const primaryDark =
    mixHexColors(
      primary,
      '#000000',
      0.22,
    );

  const secondaryDark =
    mixHexColors(
      secondary,
      '#000000',
      0.18,
    );

  const primarySoft =
    mixHexColors(
      primary,
      '#ffffff',
      0.9,
    );

  const secondarySoft =
    mixHexColors(
      secondary,
      '#ffffff',
      0.88,
    );

  const primaryBorder =
    mixHexColors(
      primary,
      '#ffffff',
      0.7,
    );

  const secondaryBorder =
    mixHexColors(
      secondary,
      '#ffffff',
      0.66,
    );

  const onPrimary =
    getBestTextColor(primary);

  const onSecondary =
    getBestTextColor(
      secondary,
    );

  const onPrimaryDark =
    getBestTextColor(
      primaryDark,
    );

  const onSecondaryDark =
    getBestTextColor(
      secondaryDark,
    );

  const onPrimarySoft =
    ensureReadableColor(
      primary,
      primarySoft,
      4.5,
    );

  const onSecondarySoft =
    ensureReadableColor(
      secondary,
      secondarySoft,
      4.5,
    );

  const primaryInk =
    ensureReadableColor(
      primary,
      '#ffffff',
      4.5,
    );

  const secondaryInk =
    ensureReadableColor(
      secondary,
      '#ffffff',
      4.5,
    );

  const secondaryOnDark =
    ensureReadableColor(
      secondary,
      primaryDark,
      4.5,
    );

  const footerTextBase =
    mixHexColors(
      onPrimaryDark,
      primaryDark,
      0.18,
    );

  const footerMutedBase =
    mixHexColors(
      onPrimaryDark,
      primaryDark,
      0.32,
    );

  const footerText =
    ensureReadableColor(
      footerTextBase,
      primaryDark,
      4.5,
    );

  const footerMuted =
    ensureReadableColor(
      footerMutedBase,
      primaryDark,
      4.5,
    );

  const footerBorder =
    mixHexColors(
      primaryDark,
      onPrimaryDark,
      0.18,
    );

  const footerSurface =
    mixHexColors(
      primaryDark,
      onPrimaryDark,
      0.08,
    );

  return {
    '--primary-color':
      primary,

    '--secondary-color':
      secondary,

    '--on-primary':
      onPrimary,

    '--on-secondary':
      onSecondary,

    '--primary-dark':
      primaryDark,

    '--secondary-dark':
      secondaryDark,

    '--on-primary-dark':
      onPrimaryDark,

    '--on-secondary-dark':
      onSecondaryDark,

    '--primary-soft':
      primarySoft,

    '--secondary-soft':
      secondarySoft,

    '--on-primary-soft':
      onPrimarySoft,

    '--on-secondary-soft':
      onSecondarySoft,

    '--primary-border':
      primaryBorder,

    '--secondary-border':
      secondaryBorder,

    '--primary-ink':
      primaryInk,

    '--secondary-ink':
      secondaryInk,

    '--secondary-on-dark':
      secondaryOnDark,

    '--footer-text':
      footerText,

    '--footer-muted':
      footerMuted,

    '--footer-border':
      footerBorder,

    '--footer-surface':
      footerSurface,
  };
}