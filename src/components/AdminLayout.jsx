import {
  Boxes,
  CircleGauge,
  ExternalLink,
  FileText,
  FolderTree,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  Store,
  Tags,
  X,
} from 'lucide-react';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useStore } from '../contexts/StoreContext';
import { getAdminLoginPath } from '../lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: CircleGauge,
  },
  {
    label: 'Products',
    path: '/admin/products',
    icon: Boxes,
  },
  {
    label: 'Categories',
    path: '/admin/categories',
    icon: FolderTree,
  },
  {
    label: 'Coupons',
    path: '/admin/coupons',
    icon: Tags,
  },
  {
    label: 'Orders',
    path: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    label: 'CMS Pages',
    path: '/admin/pages',
    icon: FileText,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
  },
];

const DEFAULT_PRIMARY = '#0f172a';
const DEFAULT_SECONDARY = '#d97706';

export default function AdminLayout() {
  const [open, setOpen] = useState(false);

  const { admin, logout } = useAdminAuth();
  const { settings } = useStore();

  const navigate = useNavigate();
  const location = useLocation();

  const primaryColor = normalizeHexColor(
    settings?.primaryColor,
    DEFAULT_PRIMARY,
  );

  const secondaryColor = normalizeHexColor(
    settings?.secondaryColor,
    DEFAULT_SECONDARY,
  );

  const storeName =
    settings?.storeName || 'Sharuu';

  const storeInitial =
    storeName
      .trim()
      .charAt(0)
      .toUpperCase() || 'S';

  /*
   * Admin panel থেকে যে primary এবং secondary
   * color দেওয়া হবে, তার উপর ভিত্তি করে সব
   * readable color automatically তৈরি হবে।
   */
  const themeVariables = useMemo(
    () =>
      createAdminThemeVariables(
        primaryColor,
        secondaryColor,
      ),
    [
      primaryColor,
      secondaryColor,
    ],
  );

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow =
      open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const exit = async () => {
    await logout();

    navigate(getAdminLoginPath(settings), {
      replace: true,
    });
  };

  return (
    <div
      className="admin-shell premium-admin-shell"
      style={themeVariables}
    >
      <style>
        {`
          .premium-admin-shell {
            min-height: 100vh;
            display: block;
            background:
              radial-gradient(
                circle at top right,
                var(--admin-secondary-glow),
                transparent 34%
              ),
              var(--admin-page-background);
          }

          /*
           * Sidebar
           */
          .premium-admin-shell .admin-sidebar {
            position: fixed;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 100;
            width: 280px;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            border-right: 1px solid
              var(--admin-primary-border);
            background: var(--admin-primary);
            padding: 20px 16px 16px;
            color: var(--admin-on-primary);
            box-shadow:
              18px 0 50px
              rgba(15, 23, 42, 0.12);
          }

          /*
           * Sidebar scrollbar
           */
          .premium-admin-shell
          .admin-sidebar::-webkit-scrollbar {
            width: 5px;
          }

          .premium-admin-shell
          .admin-sidebar::-webkit-scrollbar-track {
            background: transparent;
          }

          .premium-admin-shell
          .admin-sidebar::-webkit-scrollbar-thumb {
            border-radius: 999px;
            background:
              var(--admin-primary-border);
          }

          /*
           * Brand
           */
          .premium-admin-shell .admin-brand {
            min-height: 64px;
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 4px 4px 20px;
            border-bottom: 1px solid
              var(--admin-primary-border);
          }

          .premium-admin-shell
          .admin-brand-link {
            min-width: 0;
            flex: 1;
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--admin-on-primary);
            text-decoration: none;
          }

          .premium-admin-shell .brand-mark {
            width: 48px;
            height: 48px;
            flex: 0 0 48px;
            display: grid;
            place-items: center;
            overflow: hidden;
            border-radius: 16px;
            background:
              var(--admin-secondary);
            color:
              var(--admin-on-secondary);
            font-size: 20px;
            font-weight: 900;
            box-shadow:
              0 12px 26px
                var(--admin-secondary-shadow),
              inset 0 1px
                rgba(255, 255, 255, 0.2);
          }

          .premium-admin-shell
          .brand-mark img {
            width: 100%;
            height: 100%;
            display: block;
            padding: 4px;
            object-fit: contain;
          }

          .premium-admin-shell
          .admin-brand-copy {
            min-width: 0;
          }

          .premium-admin-shell
          .admin-brand-copy strong {
            display: block;
            overflow: hidden;
            color:
              var(--admin-on-primary);
            font-size: 15px;
            font-weight: 900;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .premium-admin-shell
          .admin-brand-copy small {
            display: block;
            margin-top: 5px;
            color:
              var(--admin-on-primary-muted);
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .premium-admin-shell
          .admin-close-button {
            display: none;
            width: 38px;
            height: 38px;
            flex: 0 0 38px;
            place-items: center;
            border: 1px solid
              var(--admin-primary-border);
            border-radius: 12px;
            background:
              var(--admin-primary-surface);
            color:
              var(--admin-on-primary);
            cursor: pointer;
            transition:
              background 180ms ease,
              transform 180ms ease;
          }

          .premium-admin-shell
          .admin-close-button:hover {
            background:
              var(--admin-primary-surface-strong);
            transform: scale(1.04);
          }

          /*
           * Store preview card
           */
          .premium-admin-shell
          .admin-store-card {
            margin: 18px 0 16px;
            border: 1px solid
              var(--admin-card-border);
            border-radius: 18px;
            background:
              var(--admin-card-background);
            padding: 14px;
            color: var(--admin-on-card);
          }

          .premium-admin-shell
          .admin-store-card-top {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .premium-admin-shell
          .admin-store-icon {
            width: 40px;
            height: 40px;
            flex: 0 0 40px;
            display: grid;
            place-items: center;
            border-radius: 13px;
            background:
              var(--admin-secondary);
            color:
              var(--admin-on-secondary);
            box-shadow:
              0 10px 22px
              var(--admin-secondary-shadow);
          }

          .premium-admin-shell
          .admin-store-card small,
          .premium-admin-shell
          .admin-store-card strong {
            display: block;
          }

          .premium-admin-shell
          .admin-store-card small {
            color:
              var(--admin-on-card-muted);
            font-size: 9px;
            font-weight: 700;
          }

          .premium-admin-shell
          .admin-store-card strong {
            margin-top: 3px;
            color:
              var(--admin-on-card);
            font-size: 12px;
            font-weight: 900;
          }

          .premium-admin-shell
          .admin-view-store {
            min-height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            margin-top: 13px;
            border-radius: 12px;
            background:
              var(--admin-secondary);
            color:
              var(--admin-on-secondary);
            font-size: 11px;
            font-weight: 900;
            text-decoration: none;
            box-shadow:
              0 10px 23px
              var(--admin-secondary-shadow);
            transition:
              transform 180ms ease,
              filter 180ms ease,
              box-shadow 180ms ease;
          }

          .premium-admin-shell
          .admin-view-store:hover {
            filter: brightness(
              var(--admin-secondary-hover-brightness)
            );
            transform: translateY(-1px);
            box-shadow:
              0 14px 28px
              var(--admin-secondary-shadow);
          }

          /*
           * Navigation
           */
          .premium-admin-shell
          .admin-menu-title {
            display: block;
            margin: 6px 12px 10px;
            color:
              var(--admin-on-primary-muted);
            font-size: 9px;
            font-weight: 900;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          .premium-admin-shell
          .admin-sidebar nav {
            flex: 1;
          }

          .premium-admin-shell
          .admin-sidebar nav a {
            min-height: 52px;
            display: flex;
            align-items: center;
            gap: 11px;
            margin-bottom: 5px;
            border: 1px solid transparent;
            border-radius: 15px;
            padding: 8px 11px;
            color:
              var(--admin-on-primary-muted);
            text-decoration: none;
            transition:
              background 180ms ease,
              color 180ms ease,
              border-color 180ms ease,
              transform 180ms ease,
              box-shadow 180ms ease;
          }

          .premium-admin-shell
          .admin-sidebar nav a:hover {
            border-color:
              var(--admin-primary-border);
            background:
              var(--admin-primary-surface);
            color:
              var(--admin-on-primary);
            transform: translateX(2px);
          }

          .premium-admin-shell
          .admin-sidebar nav a.active {
            border-color:
              var(--admin-active-border);
            background:
              var(--admin-active-background);
            color:
              var(--admin-on-active);
            box-shadow:
              inset 3px 0
                var(--admin-secondary),
              0 10px 24px
                rgba(0, 0, 0, 0.12);
          }

          .premium-admin-shell
          .admin-nav-icon {
            width: 38px;
            height: 38px;
            flex: 0 0 38px;
            display: grid;
            place-items: center;
            border-radius: 12px;
            background:
              var(--admin-primary-surface);
            color:
              var(--admin-on-primary-muted);
            transition:
              background 180ms ease,
              color 180ms ease,
              transform 180ms ease;
          }

          .premium-admin-shell
          .admin-sidebar nav a:hover
          .admin-nav-icon {
            background:
              var(--admin-primary-surface-strong);
            color:
              var(--admin-on-primary);
          }

          .premium-admin-shell
          .admin-sidebar nav a.active
          .admin-nav-icon {
            background:
              var(--admin-secondary);
            color:
              var(--admin-on-secondary);
            box-shadow:
              0 9px 20px
              var(--admin-secondary-shadow);
          }

          .premium-admin-shell
          .admin-nav-label {
            flex: 1;
            min-width: 0;
            font-size: 12px;
            font-weight: 850;
          }

          /*
           * Admin user section
           */
          .premium-admin-shell
          .admin-user {
            display: grid;
            grid-template-columns:
              42px minmax(0, 1fr) 39px;
            align-items: center;
            gap: 10px;
            margin-top: 16px;
            border-top: 1px solid
              var(--admin-primary-border);
            padding: 16px 4px 0;
          }

          .premium-admin-shell
          .admin-user-avatar {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            border-radius: 14px;
            background:
              var(--admin-on-primary);
            color:
              var(--admin-avatar-text);
            font-size: 14px;
            font-weight: 900;
            box-shadow:
              0 8px 18px
              rgba(0, 0, 0, 0.12);
          }

          .premium-admin-shell
          .admin-user-info {
            min-width: 0;
          }

          .premium-admin-shell
          .admin-user-info strong,
          .premium-admin-shell
          .admin-user-info small {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .premium-admin-shell
          .admin-user-info strong {
            color:
              var(--admin-on-primary);
            font-size: 11px;
            font-weight: 900;
          }

          .premium-admin-shell
          .admin-user-info small {
            margin-top: 4px;
            color:
              var(--admin-on-primary-muted);
            font-size: 9px;
          }

          .premium-admin-shell
          .admin-logout-button {
            width: 39px;
            height: 39px;
            display: grid;
            place-items: center;
            border: 1px solid
              rgba(239, 68, 68, 0.35);
            border-radius: 12px;
            background:
              rgba(239, 68, 68, 0.12);
            color: #ef4444;
            cursor: pointer;
            transition:
              background 180ms ease,
              color 180ms ease,
              transform 180ms ease;
          }

          .premium-admin-shell
          .admin-logout-button:hover {
            background: #ef4444;
            color: #ffffff;
            transform: scale(1.04);
          }

          /*
           * Main content
           */
          .premium-admin-shell .admin-main {
            min-height: 100vh;
            width: calc(100% - 280px);
            margin-left: 280px;
            background: transparent;
          }

          .premium-admin-shell
          .admin-topbar {
            position: sticky;
            top: 0;
            z-index: 50;
            min-height: 72px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            border-bottom: 1px solid
              rgba(148, 163, 184, 0.2);
            background:
              rgba(255, 255, 255, 0.9);
            padding: 12px 26px;
            backdrop-filter: blur(18px);
          }

          .premium-admin-shell
          .admin-topbar-title {
            min-width: 0;
          }

          .premium-admin-shell
          .admin-topbar-title span {
            display: block;
            color: #64748b;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .premium-admin-shell
          .admin-topbar-title strong {
            display: block;
            overflow: hidden;
            margin-top: 4px;
            color:
              var(--admin-primary-ink);
            font-size: 18px;
            font-weight: 900;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .premium-admin-shell
          .admin-topbar-store {
            min-height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            border: 1px solid
              var(--admin-secondary-soft-border);
            border-radius: 13px;
            background:
              var(--admin-secondary-soft);
            padding: 0 14px;
            color:
              var(--admin-on-secondary-soft);
            font-size: 11px;
            font-weight: 900;
            text-decoration: none;
            transition:
              background 180ms ease,
              color 180ms ease,
              border-color 180ms ease,
              transform 180ms ease;
          }

          .premium-admin-shell
          .admin-topbar-store:hover {
            border-color:
              var(--admin-secondary);
            background:
              var(--admin-secondary);
            color:
              var(--admin-on-secondary);
            transform: translateY(-1px);
          }

          .premium-admin-shell
          .admin-content {
            padding: 25px;
          }

          /*
           * Mobile menu button
           */
          .premium-admin-shell
          .admin-mobile-toggle {
            position: fixed;
            top: 14px;
            left: 14px;
            z-index: 80;
            display: none;
            width: 44px;
            height: 44px;
            place-items: center;
            border: 1px solid
              var(--admin-primary-border);
            border-radius: 13px;
            background:
              var(--admin-primary);
            color:
              var(--admin-on-primary);
            cursor: pointer;
            box-shadow:
              0 12px 28px
              rgba(15, 23, 42, 0.22);
          }

          .premium-admin-shell
          .admin-overlay {
            position: fixed;
            inset: 0;
            z-index: 90;
            border: 0;
            background:
              rgba(2, 6, 23, 0.62);
            backdrop-filter: blur(3px);
            cursor: pointer;
          }

          /*
           * General admin buttons using theme colors
           */
          .premium-admin-shell
          .btn-primary {
            background:
              var(--admin-primary);
            color:
              var(--admin-on-primary);
          }

          .premium-admin-shell
          .btn-primary:hover {
            filter: brightness(
              var(--admin-primary-hover-brightness)
            );
          }

          .premium-admin-shell
          .btn-accent {
            background:
              var(--admin-secondary);
            color:
              var(--admin-on-secondary);
          }

          .premium-admin-shell
          .btn-accent:hover {
            filter: brightness(
              var(--admin-secondary-hover-brightness)
            );
          }

          /*
           * Responsive
           */
          @media (max-width: 1024px) {
            .premium-admin-shell
            .admin-sidebar {
              transform:
                translateX(-105%);
              transition:
                transform 220ms ease;
            }

            .premium-admin-shell
            .admin-sidebar.open {
              transform:
                translateX(0);
            }

            .premium-admin-shell
            .admin-close-button {
              display: grid;
            }

            .premium-admin-shell
            .admin-mobile-toggle {
              display: grid;
            }

            .premium-admin-shell
            .admin-main {
              width: 100%;
              margin-left: 0;
            }

            .premium-admin-shell
            .admin-topbar {
              padding-left: 72px;
            }
          }

          @media (max-width: 640px) {
            .premium-admin-shell
            .admin-sidebar {
              width: min(88vw, 300px);
            }

            .premium-admin-shell
            .admin-content {
              padding: 15px;
            }

            .premium-admin-shell
            .admin-topbar {
              padding-right: 14px;
            }

            .premium-admin-shell
            .admin-topbar-store span {
              display: none;
            }

            .premium-admin-shell
            .admin-topbar-store {
              width: 42px;
              padding: 0;
            }

            .premium-admin-shell
            .admin-topbar-title strong {
              font-size: 15px;
            }
          }

          @media (
            prefers-reduced-motion: reduce
          ) {
            .premium-admin-shell *,
            .premium-admin-shell *::before,
            .premium-admin-shell *::after {
              scroll-behavior: auto !important;
              transition-duration:
                0.01ms !important;
              animation-duration:
                0.01ms !important;
              animation-iteration-count:
                1 !important;
            }
          }
        `}
      </style>

      {/* Mobile menu button */}
      <button
        type="button"
        className="admin-mobile-toggle"
        onClick={() => setOpen(true)}
        aria-label="Open admin menu"
      >
        <Menu size={21} />
      </button>

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${
          open ? 'open' : ''
        }`}
      >
        {/* Brand */}
        <div className="admin-brand">
          <Link
            to="/"
            className="admin-brand-link"
            onClick={() => setOpen(false)}
          >
            <span className="brand-mark">
              {settings?.logo ? (
                <img
                  src={settings.logo}
                  alt={storeName}
                />
              ) : (
                storeInitial
              )}
            </span>

            <span className="admin-brand-copy">
              <strong>
                {storeName}
              </strong>

              <small>
                Admin Workspace
              </small>
            </span>
          </Link>

          <button
            type="button"
            className="admin-close-button"
            onClick={() =>
              setOpen(false)
            }
            aria-label="Close admin menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* Store preview */}
        <div className="admin-store-card">
          <div className="admin-store-card-top">
            <span className="admin-store-icon">
              <Store size={18} />
            </span>

            <div>
              <small>
                Public website
              </small>

              <strong>
                View your storefront
              </strong>
            </div>
          </div>

          <Link
            to="/"
            className="admin-view-store"
            onClick={() =>
              setOpen(false)
            }
          >
            View Store
            <ExternalLink size={15} />
          </Link>
        </div>

        {/* Navigation */}
        <nav>
          <span className="admin-menu-title">
            Management
          </span>

          {navItems.map(item => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path === '/admin'
                }
                onClick={() =>
                  setOpen(false)
                }
                className={({
                  isActive,
                }) =>
                  isActive
                    ? 'active'
                    : ''
                }
              >
                <span className="admin-nav-icon">
                  <Icon size={19} />
                </span>

                <span className="admin-nav-label">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Admin user */}
        <div className="admin-user">
          <span className="admin-user-avatar">
            {(
              admin?.name ||
              admin?.email ||
              'A'
            )
              .charAt(0)
              .toUpperCase()}
          </span>

          <span className="admin-user-info">
            <strong>
              {admin?.name ||
                'Administrator'}
            </strong>

            <small>
              {admin?.email ||
                'Admin account'}
            </small>
          </span>

          <button
            type="button"
            className="admin-logout-button"
            onClick={exit}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <span>
              Store Management
            </span>

            <strong>
              {storeName} Admin
            </strong>
          </div>

          <Link
            to="/"
            className="admin-topbar-store"
          >
            <Store size={17} />

            <span>View Store</span>

            <ExternalLink size={14} />
          </Link>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          className="admin-overlay"
          onClick={() =>
            setOpen(false)
          }
          aria-label="Close admin menu"
        />
      )}
    </div>
  );
}

/**
 * Color value-কে valid 6 digit hex color-এ
 * convert করে।
 */
function normalizeHexColor(
  value,
  fallback = DEFAULT_PRIMARY,
) {
  if (typeof value !== 'string') {
    return fallback;
  }

  let hex = value
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

  /*
   * 8 digit hex color হলে alpha channel
   * বাদ দিয়ে RGB রাখা হবে।
   */
  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }

  if (
    hex.length !== 6 ||
    !/^[0-9a-fA-F]{6}$/.test(hex)
  ) {
    return fallback;
  }

  return `#${hex.toLowerCase()}`;
}

function hexToRgb(color) {
  const hex = normalizeHexColor(
    color,
    '#000000',
  ).slice(1);

  return {
    red: Number.parseInt(
      hex.slice(0, 2),
      16,
    ),

    green: Number.parseInt(
      hex.slice(2, 4),
      16,
    ),

    blue: Number.parseInt(
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
  const channelToHex = channel =>
    Math.round(
      Math.min(
        255,
        Math.max(0, channel),
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

/**
 * amount:
 * 0 = প্রথম color
 * 1 = দ্বিতীয় color
 */
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

function hexToRgba(
  color,
  opacity,
) {
  const {
    red,
    green,
    blue,
  } = hexToRgb(color);

  const alpha = Math.min(
    1,
    Math.max(
      0,
      Number(opacity) || 0,
    ),
  );

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
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
      channelLuminance(green) +
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

/**
 * Background-এর জন্য black অথবা white-এর
 * মধ্যে সবচেয়ে readable color return করে।
 */
function getBestTextColor(
  backgroundColor,
) {
  const darkText = '#0f172a';
  const lightText = '#ffffff';

  const darkContrast =
    contrastRatio(
      darkText,
      backgroundColor,
    );

  const lightContrast =
    contrastRatio(
      lightText,
      backgroundColor,
    );

  return darkContrast >=
    lightContrast
    ? darkText
    : lightText;
}

/**
 * Foreground color readable না হলে black অথবা
 * white-এর দিকে adjust করে readable বানায়।
 */
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
    let amount = 0.05;
    amount <= 1;
    amount += 0.05
  ) {
    const adjusted =
      mixHexColors(
        foreground,
        adjustmentTarget,
        amount,
      );

    if (
      contrastRatio(
        adjusted,
        background,
      ) >= targetRatio
    ) {
      return adjusted;
    }
  }

  return adjustmentTarget;
}

/**
 * Background light হলে hover-এ একটু dark হবে।
 * Background dark হলে hover-এ একটু light হবে।
 */
function getHoverBrightness(
  backgroundColor,
) {
  return relativeLuminance(
    backgroundColor,
  ) > 0.45
    ? '0.92'
    : '1.1';
}

/**
 * সম্পূর্ণ Admin theme variables তৈরি করে।
 */
function createAdminThemeVariables(
  primaryColor,
  secondaryColor,
) {
  const primary =
    normalizeHexColor(
      primaryColor,
      DEFAULT_PRIMARY,
    );

  const secondary =
    normalizeHexColor(
      secondaryColor,
      DEFAULT_SECONDARY,
    );

  /*
   * Direct color backgrounds
   */
  const onPrimary =
    getBestTextColor(primary);

  const onSecondary =
    getBestTextColor(secondary);

  /*
   * Sidebar-এর light transparent surface।
   * White primary হলে dark surface,
   * dark primary হলে light surface তৈরি হবে।
   */
  const primarySurface =
    mixHexColors(
      primary,
      onPrimary,
      0.08,
    );

  const primarySurfaceStrong =
    mixHexColors(
      primary,
      onPrimary,
      0.14,
    );

  const primaryBorder =
    mixHexColors(
      primary,
      onPrimary,
      0.2,
    );

  const onPrimaryMuted =
    ensureReadableColor(
      mixHexColors(
        onPrimary,
        primary,
        0.32,
      ),
      primary,
      3.2,
    );

  /*
   * Sidebar store card
   */
  const cardBackground =
    mixHexColors(
      primary,
      secondary,
      0.16,
    );

  const onCard =
    getBestTextColor(
      cardBackground,
    );

  const onCardMuted =
    ensureReadableColor(
      mixHexColors(
        onCard,
        cardBackground,
        0.34,
      ),
      cardBackground,
      3.2,
    );

  const cardBorder =
    mixHexColors(
      cardBackground,
      onCard,
      0.18,
    );

  /*
   * Active navigation item
   */
  const activeBackground =
    mixHexColors(
      primary,
      secondary,
      0.24,
    );

  const onActive =
    getBestTextColor(
      activeBackground,
    );

  const activeBorder =
    mixHexColors(
      activeBackground,
      secondary,
      0.42,
    );

  /*
   * White/light page-এর উপর primary এবং
   * secondary text readable হবে।
   */
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

  /*
   * Secondary soft background
   */
  const secondarySoft =
    mixHexColors(
      secondary,
      '#ffffff',
      0.88,
    );

  const onSecondarySoft =
    ensureReadableColor(
      secondary,
      secondarySoft,
      4.5,
    );

  const secondarySoftBorder =
    mixHexColors(
      secondary,
      '#ffffff',
      0.58,
    );

  /*
   * User avatar-এর background হচ্ছে onPrimary।
   * তাই avatar text সেই background অনুযায়ী হবে।
   */
  const avatarText =
    ensureReadableColor(
      primary,
      onPrimary,
      4.5,
    );

  return {
    '--admin-primary':
      primary,

    '--admin-secondary':
      secondary,

    '--admin-on-primary':
      onPrimary,

    '--admin-on-secondary':
      onSecondary,

    '--admin-on-primary-muted':
      onPrimaryMuted,

    '--admin-primary-surface':
      primarySurface,

    '--admin-primary-surface-strong':
      primarySurfaceStrong,

    '--admin-primary-border':
      primaryBorder,

    '--admin-primary-ink':
      primaryInk,

    '--admin-secondary-ink':
      secondaryInk,

    '--admin-secondary-soft':
      secondarySoft,

    '--admin-on-secondary-soft':
      onSecondarySoft,

    '--admin-secondary-soft-border':
      secondarySoftBorder,

    '--admin-secondary-shadow':
      hexToRgba(
        secondary,
        0.28,
      ),

    '--admin-secondary-glow':
      hexToRgba(
        secondary,
        0.13,
      ),

    '--admin-card-background':
      cardBackground,

    '--admin-card-border':
      cardBorder,

    '--admin-on-card':
      onCard,

    '--admin-on-card-muted':
      onCardMuted,

    '--admin-active-background':
      activeBackground,

    '--admin-active-border':
      activeBorder,

    '--admin-on-active':
      onActive,

    '--admin-avatar-text':
      avatarText,

    '--admin-page-background':
      mixHexColors(
        primary,
        '#f8fafc',
        0.97,
      ),

    '--admin-primary-hover-brightness':
      getHoverBrightness(primary),

    '--admin-secondary-hover-brightness':
      getHoverBrightness(
        secondary,
      ),
  };
}