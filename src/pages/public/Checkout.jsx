import { Minus, Plus, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { useStore } from "../../contexts/StoreContext";
import { formatMoney } from "../../lib/utils";
import { api } from "../../services/api";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
  shippingAreaId: "",
  paymentMethodId: "",
  transactionId: "",
  note: "",
};

export default function Checkout() {
  const { items, subtotal, updateQuantity, clearCart } = useCart();

  const { settings } = useStore();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const primaryColor = settings?.primaryColor || "#0f172a";
  const secondaryColor = settings?.secondaryColor || "#d97706";

  const themeStyle = {
    "--store-primary": primaryColor,
    "--store-secondary": secondaryColor,
    "--store-secondary-soft": hexToRgba(secondaryColor, 0.08),
    "--store-secondary-ring": hexToRgba(secondaryColor, 0.12),
    "--store-secondary-shadow": hexToRgba(secondaryColor, 0.24),
  };

  const shippingAreas = (settings?.shippingAreas || []).filter(
    (item) => item.active,
  );

  const paymentMethods = (settings?.paymentMethods || []).filter(
    (item) => item.enabled,
  );

  const shippingArea = shippingAreas.find(
    (item) => String(item.id) === String(form.shippingAreaId),
  );

  const paymentMethod = paymentMethods.find(
    (item) => String(item.id) === String(form.paymentMethodId),
  );

  const shippingFee = coupon?.freeShipping
    ? 0
    : Number(shippingArea?.charge || 0);

  const discount = Number(coupon?.discount || 0);

  const total = Math.max(0, subtotal - discount + shippingFee);

  const missing = useMemo(() => {
    const labels = [];

    if (!form.name.trim()) {
      labels.push("Name");
    }

    if (!form.address.trim()) {
      labels.push("Address");
    }

    if (!form.phone.trim()) {
      labels.push("Phone number");
    }

    if (!form.shippingAreaId) {
      labels.push("Shipping area");
    }

    if (!form.paymentMethodId) {
      labels.push("Payment method");
    }

    return labels;
  }, [form]);

  const updateForm = (key, value) => {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const applyCoupon = async () => {
    try {
      setError("");

      const result = await api.validateCoupon({
        code: couponCode,
        subtotal,
        shippingAreaId: form.shippingAreaId,
      });

      setCoupon(result);
    } catch (requestError) {
      setCoupon(null);
      setError(requestError.message);
    }
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    if (missing.length) {
      setError(`Required: ${missing.join(", ")}.`);
      return;
    }

    if (paymentMethod?.requiresTransactionId && !form.transactionId.trim()) {
      setError("Transaction ID is required for this payment method.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const result = await api.createOrder({
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
        },
        shippingAreaId: form.shippingAreaId,
        paymentMethodId: form.paymentMethodId,
        transactionId: form.transactionId.trim(),
        note: form.note.trim(),
        couponCode: coupon?.code || couponCode.trim(),
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });

      clearCart();

      navigate(
        `/order-success/${result.order.id}?token=${encodeURIComponent(
          result.order.publicToken,
        )}`,
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (!items.length) {
    return (
      <main style={themeStyle} className="min-h-[70vh] bg-[#f7f5f0] px-4 py-16">
        <div className="mx-auto grid min-h-[420px] w-full max-w-[900px] place-items-center rounded-[32px] border border-slate-200 bg-white px-6 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div>
            <h1 className="font-serif text-4xl font-semibold tracking-[-0.03em] text-[var(--store-primary)] sm:text-5xl">
              Your cart is empty
            </h1>

            <p className="mt-4 text-sm text-slate-500">
              Add products before checkout.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={themeStyle}
      className="min-h-screen bg-[#f7f5f0] pb-20 text-[var(--store-primary)]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        {/* Page Heading */}
        <header className="mb-9 max-w-3xl sm:mb-12">
          <span className="inline-block border-l-2 border-[var(--store-secondary)] pl-3 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--store-secondary)]">
            Secure checkout
          </span>

          <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.04em] text-[var(--store-primary)] sm:text-5xl lg:text-6xl">
            Complete your order
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
            Quantity and selected Color, Size, Age or other options can be
            reviewed here.
          </p>
        </header>

        <form
          onSubmit={submit}
          className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_370px]"
        >
          {/* Checkout Content */}
          <section className="min-w-0 space-y-6">
            {/* Order Items */}
            <CheckoutSection title="Order items">
              <div className="space-y-3">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="grid grid-cols-[82px_minmax(0,1fr)] gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:border-slate-300 sm:grid-cols-[100px_minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:p-4"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-[105px] w-[82px] rounded-xl object-cover sm:h-[125px] sm:w-[100px] sm:rounded-2xl"
                    />

                    <div className="min-w-0">
                      <h3 className="text-sm font-black leading-5 text-[var(--store-primary)] sm:text-base">
                        {item.name}
                      </h3>

                      {Object.keys(item.selectedOptionLabels || {}).length >
                        0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {Object.entries(item.selectedOptionLabels || {}).map(
                            ([label, value]) => (
                              <span
                                key={label}
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-600"
                              >
                                <strong className="text-slate-900">
                                  {label}:
                                </strong>{" "}
                                {value}
                              </span>
                            ),
                          )}
                        </div>
                      )}

                      <strong className="mt-4 block text-sm font-black text-[var(--store-primary)]">
                        {formatMoney(item.unitPrice, settings?.currencySymbol)}
                      </strong>
                    </div>

                    <div className="col-start-2 flex w-max items-center overflow-hidden rounded-full border border-slate-200 bg-white sm:col-start-auto">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="grid h-10 w-10 place-items-center text-slate-500 transition hover:bg-[var(--store-primary)] hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>

                      <b className="min-w-10 text-center text-sm font-black text-[var(--store-primary)]">
                        {item.quantity}
                      </b>

                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="grid h-10 w-10 place-items-center text-slate-500 transition hover:bg-[var(--store-primary)] hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </CheckoutSection>

            {/* Customer Information */}
            <CheckoutSection title="Customer information">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name" required>
                  <input
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Phone Number" required>
                  <input
                    value={form.phone}
                    onChange={(event) =>
                      updateForm("phone", event.target.value)
                    }
                    required
                    className={inputClassName}
                  />
                </FormField>

                <FormField label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm("email", event.target.value)
                    }
                    className={inputClassName}
                  />
                </FormField>

                <div className="sm:col-span-2">
                  <FormField label="Full Address" required>
                    <textarea
                      rows="3"
                      value={form.address}
                      onChange={(event) =>
                        updateForm("address", event.target.value)
                      }
                      required
                      className={`${inputClassName} resize-y`}
                    />
                  </FormField>
                </div>
              </div>
            </CheckoutSection>

            {/* Shipping Area */}
            <CheckoutSection title="Shipping Area" required>
              <div
                className="grid gap-2 sm:gap-3"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(
                    shippingAreas.length,
                    1,
                  )}, minmax(0, 1fr))`,
                }}
              >
                {shippingAreas.map((area) => {
                  const selected =
                    String(form.shippingAreaId) === String(area.id);

                  return (
                    <label
                      key={area.id}
                      className={[
                        "relative flex min-w-0 cursor-pointer flex-col",
                        "items-center justify-center rounded-xl border",
                        "px-1.5 py-3 text-center transition duration-200",
                        "sm:rounded-2xl sm:px-4 sm:py-4",
                        selected
                          ? "border-[var(--store-secondary)] bg-[var(--store-secondary-soft)] shadow-[0_12px_35px_var(--store-secondary-ring)]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="shippingArea"
                        value={area.id}
                        checked={selected}
                        onChange={() => updateForm("shippingAreaId", area.id)}
                        className="mb-2 h-4 w-4 shrink-0 accent-[var(--store-secondary)]"
                      />

                      <strong className="w-full truncate text-[10px] font-black leading-tight text-[var(--store-primary)] sm:text-sm">
                        {area.name}
                      </strong>

                      {area.estimate && (
                        <small className="mt-1 hidden text-xs text-slate-500 sm:block">
                          {area.estimate}
                        </small>
                      )}

                      <b className="mt-1 block text-[10px] font-black text-[var(--store-primary)] sm:mt-2 sm:text-sm">
                        {formatMoney(area.charge, settings?.currencySymbol)}
                      </b>
                    </label>
                  );
                })}
              </div>
            </CheckoutSection>

            {/* Payment Method */}
            <CheckoutSection title="Payment Method" required>
              <div
                className="grid gap-2 sm:gap-3"
                style={{
                  gridTemplateColumns: `repeat(${Math.max(
                    paymentMethods.length,
                    1,
                  )}, minmax(0, 1fr))`,
                }}
              >
                {paymentMethods.map((method) => {
                  const selected =
                    String(form.paymentMethodId) === String(method.id);

                  return (
                    <label
                      key={method.id}
                      className={[
                        "relative flex min-w-0 cursor-pointer flex-col",
                        "items-center justify-center rounded-xl border",
                        "px-1.5 py-4 text-center transition duration-200",
                        "sm:rounded-2xl sm:px-4 sm:py-5",
                        selected
                          ? "border-[var(--store-secondary)] bg-[var(--store-secondary-soft)] shadow-[0_12px_35px_var(--store-secondary-ring)]"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selected}
                        onChange={() =>
                          updateForm("paymentMethodId", method.id)
                        }
                        className="mb-2 h-4 w-4 shrink-0 accent-[var(--store-secondary)]"
                      />

                      <strong className="w-full truncate text-[10px] font-black leading-tight text-[var(--store-primary)] sm:text-sm">
                        {method.name}
                      </strong>

                      {method.instructions && (
                        <small className="mt-1 hidden text-xs leading-5 text-slate-500 sm:line-clamp-2 sm:block">
                          {method.instructions}
                        </small>
                      )}
                    </label>
                  );
                })}
              </div>

              {paymentMethod?.accountNumber && (
                <div className="mt-4 rounded-2xl border border-[var(--store-secondary)] bg-[var(--store-secondary-soft)] px-4 py-3 text-sm text-[var(--store-primary)]">
                  Account: <strong>{paymentMethod.accountNumber}</strong>
                </div>
              )}

              {paymentMethod?.requiresTransactionId && (
                <div className="mt-4">
                  <FormField label="Transaction ID" required>
                    <input
                      value={form.transactionId}
                      onChange={(event) =>
                        updateForm("transactionId", event.target.value)
                      }
                      required
                      className={inputClassName}
                    />
                  </FormField>
                </div>
              )}
            </CheckoutSection>

            {/* Order Note */}
            <CheckoutSection>
              <FormField label="Order Note">
                <textarea
                  rows="3"
                  value={form.note}
                  onChange={(event) => updateForm("note", event.target.value)}
                  className={`${inputClassName} resize-y`}
                />
              </FormField>
            </CheckoutSection>
          </section>

          {/* Order Summary */}
          <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.09)] sm:p-6 lg:sticky lg:top-[145px]">
            <h2 className="font-serif text-3xl font-semibold tracking-[-0.03em] text-[var(--store-primary)]">
              Order Summary
            </h2>

            <div className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
              <SummaryRow
                label="Subtotal"
                value={formatMoney(subtotal, settings?.currencySymbol)}
              />

              <SummaryRow
                label="Shipping"
                value={
                  form.shippingAreaId
                    ? formatMoney(shippingFee, settings?.currencySymbol)
                    : "Select area"
                }
              />

              {discount > 0 && (
                <div className="flex items-center justify-between gap-4 py-4 text-sm text-emerald-700">
                  <span>Coupon {coupon?.code}</span>

                  <strong>
                    -{formatMoney(discount, settings?.currencySymbol)}
                  </strong>
                </div>
              )}
            </div>

            {/* Coupon */}
            <div className="mt-5 flex overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 transition focus-within:border-[var(--store-secondary)] focus-within:bg-white focus-within:ring-4 focus-within:ring-[var(--store-secondary-ring)]">
              <input
                value={couponCode}
                onChange={(event) =>
                  setCouponCode(event.target.value.toUpperCase())
                }
                placeholder="Coupon Code"
                className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-sm font-bold uppercase text-slate-900 outline-none placeholder:font-medium placeholder:normal-case placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={applyCoupon}
                className="shrink-0 bg-[var(--store-secondary)] px-5 text-xs font-black text-white transition hover:brightness-110"
              >
                Apply
              </button>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-[var(--store-primary)] px-5 py-5 text-white">
              <span className="text-sm font-bold">Total</span>

              <strong className="text-xl font-black">
                {formatMoney(total, settings?.currencySymbol)}
              </strong>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[var(--store-secondary)] px-6 text-sm font-black text-white shadow-[0_18px_40px_var(--store-secondary-shadow)] transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Placing order..." : "Place Order"}
            </button>

            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0 text-[var(--store-secondary)]"
              />

              <span>
                Required fields must be completed before order placement.
              </span>
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}

const inputClassName = [
  "w-full rounded-2xl border border-slate-200",
  "bg-slate-50 px-4 py-3.5 text-sm",
  "text-slate-900 outline-none transition",
  "placeholder:text-slate-400",
  "focus:border-[var(--store-secondary)] focus:bg-white",
  "focus:ring-4 focus:ring-[var(--store-secondary-ring)]",
].join(" ");

function CheckoutSection({ title, required = false, children }) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(15,23,42,0.06)] sm:p-6 lg:p-7">
      {title && (
        <div className="mb-5 flex items-center gap-2 border-b border-slate-100 pb-4">
          <h2 className="font-serif text-2xl font-semibold tracking-[-0.02em] text-[var(--store-primary)]">
            {title}
          </h2>

          {required && (
            <em className="font-sans text-sm not-italic text-red-600">*</em>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

function FormField({ label, required = false, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black text-slate-700">
        {label}

        {required && <em className="ml-1 not-italic text-red-600">*</em>}
      </span>

      {children}
    </label>
  );
}

function hexToRgba(hex, alpha = 1) {
  const cleaned = String(hex || "")
    .replace("#", "")
    .trim();

  const normalized =
    cleaned.length === 3
      ? cleaned
          .split("")
          .map((character) => character + character)
          .join("")
      : cleaned;

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return `rgba(217, 119, 6, ${alpha})`;
  }

  const number = Number.parseInt(normalized, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 text-sm">
      <span className="text-slate-500">{label}</span>

      <strong className="text-[var(--store-primary)]">{value}</strong>
    </div>
  );
}