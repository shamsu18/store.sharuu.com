import {
  ArrowLeft,
  Printer,
  ShoppingBag
} from 'lucide-react';
import { useEffect, useMemo } from 'react';
import {
  Link,
  useParams
} from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

import { useStore } from '../../contexts/StoreContext';
import { formatMoney } from '../../lib/utils';

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function getProductOptions(item) {
  return Object.entries(
    item?.selectedOptionLabels || {}
  );
}

function getProductSummary(items = []) {
  return items
    .map(item => {
      const options = getProductOptions(item)
        .map(
          ([label, value]) =>
            `${label}: ${value}`
        )
        .join(', ');

      return `${item.name} × ${item.quantity}${
        options ? ` (${options})` : ''
      }`;
    })
    .join(' • ');
}

function StoreLogo({
  settings,
  small = false
}) {
  const logo = String(
    settings?.logo || ''
  ).trim();

  const storeName =
    settings?.storeName ||
    'Sharuu Universal Store';

  const imageSize = small
    ? 'h-12 w-12 rounded-xl'
    : 'h-16 w-16 rounded-2xl';

  const fallbackSize = small
    ? 'h-12 w-12 rounded-xl text-xl'
    : 'h-16 w-16 rounded-2xl text-2xl';

  if (logo) {
    return (
      <img
        src={logo}
        alt={storeName}
        className={`
          ${imageSize}
          shrink-0
          border
          border-slate-200
          bg-white
          object-contain
          p-1.5
        `}
      />
    );
  }

  return (
    <span
      className={`
        ${fallbackSize}
        flex
        shrink-0
        items-center
        justify-center
        bg-slate-900
        font-black
        text-white
      `}
    >
      {storeName.charAt(0).toUpperCase()}
    </span>
  );
}

function WebsiteQr({
  homeUrl,
  compact = false
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0 border border-slate-200 bg-white p-1.5">
        <QRCodeSVG
          value={homeUrl}
          size={compact ? 72 : 92}
          level="M"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#0f172a"
          title="Scan to visit our website"
        />
      </div>

      <div className="grid min-w-0 gap-1">
        <strong className="text-xs font-black text-slate-900">
          Scan to visit
        </strong>

        <small className="max-w-[210px] break-all text-[9px] leading-4 text-slate-500">
          {homeUrl}
        </small>
      </div>
    </div>
  );
}

export default function Invoice() {
  const { id } = useParams();

  const {
    orders,
    settings,
    loadAdmin,
    adminLoaded
  } = useStore();

  useEffect(() => {
    if (!adminLoaded) {
      loadAdmin().catch(() => {});
    }
  }, [adminLoaded, loadAdmin]);

  const order = orders.find(
    item => String(item.id) === String(id)
  );

  const homeUrl = useMemo(
    () => window.location.origin,
    []
  );

  const productSummary = useMemo(
    () =>
      getProductSummary(
        order?.items || []
      ),
    [order?.items]
  );

  if (!order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm font-bold text-slate-500">
        Loading invoice...
      </div>
    );
  }

  const currencySymbol =
    settings?.currencySymbol || '৳';

  const paymentMethod =
    order.paymentMethodName ||
    order.paymentMethod ||
    'Not specified';

  const normalizedPaymentMethod =
    String(paymentMethod).toLowerCase();

  const isCashOnDelivery =
    normalizedPaymentMethod.includes('cash') ||
    normalizedPaymentMethod.includes('cod');

  const totalItems = (
    order.items || []
  ).reduce(
    (total, item) =>
      total +
      Number(item.quantity || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-100 px-3 py-5 sm:px-6 sm:py-8">
      {/* A4 print rules */}
      <style>
        {`
          @page {
            size: A4;
            margin: 0;
          }

          @media print {
            html,
            body,
            #root {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body * {
              visibility: hidden !important;
            }

            .invoice-print-root,
            .invoice-print-root * {
              visibility: visible !important;
            }

            .invoice-print-root {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
            }

            .invoice-print-page {
              width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              max-height: 297mm !important;
              margin: 0 !important;
              overflow: hidden !important;
              box-shadow: none !important;
              page-break-after: always !important;
              break-after: page !important;
            }

            .invoice-print-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }
        `}
      </style>

      {/* Action buttons */}
      <div className="mx-auto mb-5 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          to="/admin/orders"
          className="
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-300
            bg-white
            px-4
            py-2
            text-sm
            font-bold
            text-slate-700
            shadow-sm
            transition
            hover:-translate-y-0.5
            hover:border-slate-400
            hover:bg-slate-50
          "
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <button
          type="button"
          onClick={() => window.print()}
          className="
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            border-0
            bg-slate-900
            px-5
            py-2
            text-sm
            font-black
            text-white
            shadow-lg
            shadow-slate-900/15
            transition
            hover:-translate-y-0.5
            hover:bg-slate-800
          "
        >
          <Printer size={16} />
          Print / Save PDF
        </button>
      </div>

      <div className="invoice-print-root space-y-7 print:space-y-0">
        {/* =====================================
            PAGE 1: CUSTOMER INVOICE
        ====================================== */}
        <article
          className="
            invoice-print-page
            mx-auto
            flex
            min-h-[297mm]
            w-full
            max-w-[210mm]
            flex-col
            bg-white
            p-5
            text-slate-900
            shadow-2xl
            shadow-slate-900/10
            sm:p-10
            print:p-[12mm]
          "
        >
          {/* Header */}
          <header className="flex flex-col gap-6 border-b-2 border-slate-900 pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <StoreLogo settings={settings} />

              <div className="min-w-0">
                <h1 className="m-0 text-xl font-black leading-tight text-slate-900 sm:text-2xl">
                  {settings?.storeName ||
                    'Sharuu Universal Store'}
                </h1>

                {settings?.address && (
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    {settings.address}
                  </p>
                )}

                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  {settings?.supportPhone || ''}

                  {settings?.supportPhone &&
                    settings?.supportEmail &&
                    ' · '}

                  {settings?.supportEmail || ''}
                </p>
              </div>
            </div>

            <div className="grid justify-items-start text-left sm:justify-items-end sm:text-right">
              <span className="text-xs font-black tracking-[0.2em] text-slate-500">
                INVOICE
              </span>

              <strong className="mt-2 text-lg font-black text-slate-900">
                {order.orderNumber}
              </strong>

              <small className="mt-1 text-xs text-slate-500">
                {formatDate(order.createdAt)}
              </small>
            </div>
          </header>

          {/* Billing and order information */}
          <section className="grid grid-cols-1 gap-8 py-7 sm:grid-cols-2 sm:gap-12">
            <div>
              <span className="mb-2 block text-[10px] font-black tracking-[0.15em] text-slate-500">
                BILL TO
              </span>

              <h3 className="m-0 text-lg font-black text-slate-900">
                {order.customer?.name ||
                  'Customer'}
              </h3>

              {order.customer?.phone && (
                <p className="mt-1.5 text-xs leading-5 text-slate-600">
                  {order.customer.phone}
                </p>
              )}

              {order.customer?.email && (
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {order.customer.email}
                </p>
              )}

              {order.customer?.address && (
                <p className="mt-1 max-w-md text-xs leading-5 text-slate-600">
                  {order.customer.address}
                </p>
              )}
            </div>

            <div>
              <span className="mb-2 block text-[10px] font-black tracking-[0.15em] text-slate-500">
                ORDER DETAILS
              </span>

              <div className="grid gap-2">
                <div className="flex items-start justify-between gap-5 text-xs">
                  <span className="text-slate-500">
                    Status
                  </span>

                  <strong className="text-right capitalize text-slate-900">
                    {order.status}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-5 text-xs">
                  <span className="text-slate-500">
                    Payment
                  </span>

                  <strong className="text-right text-slate-900">
                    {paymentMethod}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-5 text-xs">
                  <span className="text-slate-500">
                    Payment Status
                  </span>

                  <strong className="text-right capitalize text-slate-900">
                    {order.paymentStatus ||
                      'Unpaid'}
                  </strong>
                </div>

                <div className="flex items-start justify-between gap-5 text-xs">
                  <span className="text-slate-500">
                    Shipping Area
                  </span>

                  <strong className="text-right text-slate-900">
                    {order.shippingAreaName ||
                      'Not specified'}
                  </strong>
                </div>
              </div>
            </div>
          </section>

          {/* Product table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50">
                  <th className="px-2.5 py-3 text-left text-[10px] font-black uppercase tracking-wide text-slate-600">
                    Item
                  </th>

                  <th className="px-2.5 py-3 text-left text-[10px] font-black uppercase tracking-wide text-slate-600">
                    Options
                  </th>

                  <th className="px-2.5 py-3 text-right text-[10px] font-black uppercase tracking-wide text-slate-600">
                    Qty
                  </th>

                  <th className="px-2.5 py-3 text-right text-[10px] font-black uppercase tracking-wide text-slate-600">
                    Unit
                  </th>

                  <th className="px-2.5 py-3 text-right text-[10px] font-black uppercase tracking-wide text-slate-600">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody>
                {(order.items || []).map(
                  (item, index) => {
                    const options =
                      getProductOptions(item);

                    return (
                      <tr
                        key={
                          item.id ||
                          item.sku ||
                          `${item.name}-${index}`
                        }
                        className="border-b border-slate-200"
                      >
                        <td className="px-2.5 py-3 align-middle text-xs">
                          <div className="flex items-center gap-2.5">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name || ''}
                                className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-cover"
                              />
                            ) : (
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500">
                                <ShoppingBag
                                  size={18}
                                />
                              </span>
                            )}

                            <span className="grid min-w-0 gap-1">
                              <strong className="font-bold text-slate-900">
                                {item.name}
                              </strong>

                              {item.sku && (
                                <small className="text-[10px] text-slate-500">
                                  {item.sku}
                                </small>
                              )}
                            </span>
                          </div>
                        </td>

                        <td className="px-2.5 py-3 align-middle text-[11px] leading-5 text-slate-600">
                          {options.length > 0 ? (
                            options.map(
                              ([label, value]) => (
                                <div key={label}>
                                  <strong className="text-slate-800">
                                    {label}:
                                  </strong>{' '}
                                  {value}
                                </div>
                              )
                            )
                          ) : (
                            <span>—</span>
                          )}
                        </td>

                        <td className="px-2.5 py-3 text-right align-middle text-xs font-bold text-slate-800">
                          {item.quantity}
                        </td>

                        <td className="px-2.5 py-3 text-right align-middle text-xs text-slate-700">
                          {formatMoney(
                            item.unitPrice,
                            currencySymbol
                          )}
                        </td>

                        <td className="px-2.5 py-3 text-right align-middle text-xs font-bold text-slate-900">
                          {formatMoney(
                            Number(
                              item.unitPrice || 0
                            ) *
                              Number(
                                item.quantity || 0
                              ),
                            currencySymbol
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* QR and totals */}
          <section className="mt-7 grid grid-cols-1 items-end gap-7 sm:grid-cols-[minmax(0,1fr)_280px]">
            <WebsiteQr
              homeUrl={homeUrl}
              compact
            />

            <div className="grid gap-2.5">
              <div className="flex justify-between gap-5 text-xs text-slate-600">
                <span>Subtotal</span>

                <strong className="text-slate-900">
                  {formatMoney(
                    order.subtotal,
                    currencySymbol
                  )}
                </strong>
              </div>

              <div className="flex justify-between gap-5 text-xs text-slate-600">
                <span>Shipping</span>

                <strong className="text-slate-900">
                  {formatMoney(
                    order.shippingFee,
                    currencySymbol
                  )}
                </strong>
              </div>

              {Number(order.discount || 0) >
                0 && (
                <div className="flex justify-between gap-5 text-xs text-slate-600">
                  <span>
                    Discount{' '}
                    {order.couponCode &&
                      `(${order.couponCode})`}
                  </span>

                  <strong className="text-slate-900">
                    -
                    {formatMoney(
                      order.discount,
                      currencySymbol
                    )}
                  </strong>
                </div>
              )}

              <div className="mt-1 flex justify-between gap-5 border-t-2 border-slate-900 pt-3 text-base font-black text-slate-900">
                <span>Grand Total</span>

                <strong>
                  {formatMoney(
                    order.total,
                    currencySymbol
                  )}
                </strong>
              </div>
            </div>
          </section>

          {/* Invoice footer */}
          <footer className="mt-auto pt-10 text-center">
            <p className="m-0 text-xs font-bold text-slate-800">
              {settings?.invoiceNote ||
                'Thank you for shopping with us.'}
            </p>

            <small className="mt-1.5 block text-[10px] text-slate-500">
              {settings?.footerText || ''}
            </small>
          </footer>
        </article>

        {/* =====================================
            PAGE 2: PARCEL / PRODUCT LABEL
        ====================================== */}
        <article
          className="
            invoice-print-page
            mx-auto
            flex
            min-h-[297mm]
            w-full
            max-w-[210mm]
            items-center
            justify-center
            bg-white
            p-4
            shadow-2xl
            shadow-slate-900/10
            sm:p-10
            print:p-[12mm]
          "
        >
          <div className="w-full rounded-2xl border-2 border-dashed border-slate-400 p-3 sm:p-8 print:p-[9mm]">
            <section className="overflow-hidden rounded-xl border-[3px] border-slate-900 bg-white text-slate-900">
              {/* Label header */}
              <header className="flex flex-col gap-5 bg-slate-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <StoreLogo
                    settings={settings}
                    small
                  />

                  <div className="min-w-0">
                    <h2 className="m-0 text-lg font-black leading-tight sm:text-xl">
                      {settings?.storeName ||
                        'Sharuu Universal Store'}
                    </h2>

                    <p className="mt-1 text-[11px] text-slate-500">
                      {settings?.supportPhone ||
                        settings?.supportEmail ||
                        ''}
                    </p>
                  </div>
                </div>

                <div className="grid min-w-[185px] gap-1 rounded-xl border-2 border-slate-900 px-4 py-2.5 text-center">
                  <small className="text-[9px] font-black tracking-[0.16em]">
                    ORDER NO.
                  </small>

                  <strong className="text-base font-black">
                    {order.orderNumber}
                  </strong>
                </div>
              </header>

              <div className="h-0.5 bg-slate-900" />

              {/* Customer address and QR */}
              <section className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_165px] sm:p-6">
                <div>
                  <span className="mb-2.5 block text-[10px] font-black tracking-[0.16em] text-slate-500">
                    DELIVER TO
                  </span>

                  <h1 className="m-0 text-2xl font-black leading-tight sm:text-3xl">
                    {order.customer?.name ||
                      'Customer'}
                  </h1>

                  <p className="mt-2.5 text-lg font-black text-slate-900">
                    {order.customer?.phone ||
                      'No phone provided'}
                  </p>

                  <p className="mt-2 max-w-lg text-sm font-semibold leading-6 text-slate-700 sm:text-[15px]">
                    {order.customer?.address ||
                      'No delivery address provided'}
                  </p>

                  {order.shippingAreaName && (
                    <span className="mt-3 inline-flex rounded-full bg-slate-900 px-3 py-1.5 text-[10px] font-black text-white">
                      {order.shippingAreaName}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center border-t border-slate-300 pt-5 text-center sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                  <div className="border border-slate-200 bg-white p-1.5">
                    <QRCodeSVG
                      value={homeUrl}
                      size={116}
                      level="M"
                      includeMargin={false}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      title="Scan to visit our website"
                    />
                  </div>

                  <strong className="mt-2 text-[10px] font-black tracking-[0.1em]">
                    SCAN WEBSITE
                  </strong>

                  <small className="mt-1 max-w-[140px] break-all text-[7px] leading-3 text-slate-500">
                    {homeUrl}
                  </small>
                </div>
              </section>

              <div className="h-0.5 bg-slate-900" />

              {/* Product information */}
              <section className="p-5">
                <span className="mb-3 block text-[10px] font-black tracking-[0.16em] text-slate-500">
                  PRODUCT DETAILS
                </span>

                <div className="grid gap-3">
                  {(order.items || []).map(
                    (item, index) => {
                      const options =
                        getProductOptions(item);

                      return (
                        <div
                          key={
                            item.id ||
                            item.sku ||
                            `${item.name}-${index}`
                          }
                          className="flex items-start justify-between gap-5 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0"
                        >
                          <div className="grid gap-1">
                            <strong className="text-[13px] font-black text-slate-900">
                              {item.name}
                            </strong>

                            {options.length > 0 && (
                              <small className="text-[10px] leading-4 text-slate-500">
                                {options
                                  .map(
                                    ([
                                      label,
                                      value
                                    ]) =>
                                      `${label}: ${value}`
                                  )
                                  .join(' · ')}
                              </small>
                            )}

                            {item.sku && (
                              <small className="text-[10px] text-slate-500">
                                SKU: {item.sku}
                              </small>
                            )}
                          </div>

                          <span className="shrink-0 text-[13px] font-black">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                {productSummary && (
                  <p className="mt-4 rounded-lg bg-slate-50 p-2.5 text-[9px] leading-4 text-slate-600">
                    {productSummary}
                  </p>
                )}
              </section>

              <div className="h-0.5 bg-slate-900" />

              {/* Payment */}
              <section className="grid grid-cols-1 items-center gap-6 p-5 sm:grid-cols-[minmax(0,1fr)_230px]">
                <div className="grid gap-1">
                  <span className="mb-1 block text-[10px] font-black tracking-[0.16em] text-slate-500">
                    PAYMENT METHOD
                  </span>

                  <strong className="text-[15px] font-black text-slate-900">
                    {paymentMethod}
                  </strong>

                  <small className="text-xs capitalize text-slate-500">
                    Status:{' '}
                    {order.paymentStatus ||
                      'Unpaid'}
                  </small>
                </div>

                <div className="grid gap-1 rounded-xl border-[3px] border-slate-900 px-4 py-3 text-center">
                  <span className="text-[10px] font-black tracking-[0.1em]">
                    {isCashOnDelivery
                      ? 'COLLECT AMOUNT'
                      : 'ORDER TOTAL'}
                  </span>

                  <strong className="text-2xl font-black">
                    {formatMoney(
                      order.total,
                      currencySymbol
                    )}
                  </strong>
                </div>
              </section>

              {/* Label footer */}
              <footer className="grid grid-cols-1 border-t-2 border-slate-900 bg-slate-50 sm:grid-cols-3">
                <div className="grid gap-1 border-b border-slate-300 p-3.5 text-center sm:border-b-0">
                  <span className="text-[9px] uppercase text-slate-500">
                    Order date
                  </span>

                  <strong className="text-[11px] font-black">
                    {formatDate(order.createdAt)}
                  </strong>
                </div>

                <div className="grid gap-1 border-b border-slate-300 p-3.5 text-center sm:border-b-0 sm:border-l">
                  <span className="text-[9px] uppercase text-slate-500">
                    Shipping status
                  </span>

                  <strong className="text-[11px] font-black capitalize">
                    {order.shippingStatus ||
                      'Unfulfilled'}
                  </strong>
                </div>

                <div className="grid gap-1 p-3.5 text-center sm:border-l sm:border-slate-300">
                  <span className="text-[9px] uppercase text-slate-500">
                    Items
                  </span>

                  <strong className="text-[11px] font-black">
                    {totalItems}
                  </strong>
                </div>
              </footer>
            </section>

            <p className="mb-0 mt-3 text-center text-[10px] text-slate-500">
              Cut along the dotted line and attach
              this label securely to the parcel.
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}