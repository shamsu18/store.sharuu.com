import {
  FileText,
  Search,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { formatMoney } from '../../lib/utils';

const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'completed',
  'cancelled',
  'refunded',
];

const PAYMENT_STATUSES = [
  'unpaid',
  'pending',
  'paid',
  'failed',
  'refunded',
];

const SHIPPING_STATUSES = [
  'unfulfilled',
  'processing',
  'packed',
  'shipped',
  'in_transit',
  'delivered',
  'returned',
  'cancelled',
];

const labelFor = value =>
  String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, letter =>
      letter.toUpperCase(),
    );

export default function Orders() {
  const {
    orders,
    settings,
    loadAdmin,
    adminLoaded,
    updateOrder,
  } = useStore();

  const [query, setQuery] =
    useState('');
  const [status, setStatus] =
    useState('');
  const [updating, setUpdating] =
    useState('');
  const [error, setError] =
    useState('');

  useEffect(() => {
    if (!adminLoaded) {
      loadAdmin().catch(() => {});
    }
  }, [
    adminLoaded,
    loadAdmin,
  ]);

  const rows = useMemo(
    () =>
      orders.filter(order => {
        const text =
          `${order.orderNumber} ${order.customer?.name} ${order.customer?.phone}`
            .toLowerCase();

        return (
          text.includes(
            query.toLowerCase(),
          ) &&
          (!status ||
            order.status === status)
        );
      }),
    [
      orders,
      query,
      status,
    ],
  );

  const change = async (
    order,
    key,
    value,
  ) => {
    const updateKey =
      `${order.id}:${key}`;

    setUpdating(updateKey);
    setError('');

    try {
      await updateOrder(order.id, {
        [key]: value,
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdating('');
    }
  };

  const statusSelect = (
    order,
    key,
    value,
    options,
  ) => (
    <div
      className={`order-status-control status-${value}`}
    >
      <span
        className="order-status-dot"
        aria-hidden="true"
      />
      <select
        value={value}
        disabled={
          updating ===
          `${order.id}:${key}`
        }
        onChange={event =>
          change(
            order,
            key,
            event.target.value,
          )
        }
        aria-label={`${labelFor(key)} for ${order.orderNumber}`}
      >
        {options.map(option => (
          <option
            key={option}
            value={option}
          >
            {labelFor(option)}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">
            Fulfilment
          </span>
          <h1>Orders</h1>
          <p>
            Status changes continue to
            update immediately.
          </p>
        </div>
      </div>

      {error && (
        <div className="error-box">
          {error}
        </div>
      )}

      <div className="admin-toolbar">
        <label className="search-field">
          <Search size={17} />
          <input
            value={query}
            onChange={event =>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Order number, name or phone..."
          />
        </label>

        <select
          value={status}
          onChange={event =>
            setStatus(
              event.target.value,
            )
          }
        >
          <option value="">
            All status
          </option>
          {ORDER_STATUSES.map(
            option => (
              <option
                key={option}
                value={option}
              >
                {labelFor(option)}
              </option>
            ),
          )}
        </select>
      </div>

      <section className="admin-panel table-panel orders-panel">
        <div className="admin-table-wrap">
          <table className="admin-table orders-table">
            <thead>
              <tr>
                <th className="number-heading">
                  #
                </th>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>
                  <span className="order-heading-pill order">
                    Order Status
                  </span>
                </th>
                <th>
                  <span className="order-heading-pill payment">
                    Payment
                  </span>
                </th>
                <th>
                  <span className="order-heading-pill shipping">
                    Shipping
                  </span>
                </th>
                <th>Invoice</th>
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (order, index) => (
                  <tr key={order.id}>
                    <td>
                      <span className="order-row-number">
                        {index + 1}
                      </span>
                    </td>
                    <td>
                      <strong className="order-number">
                        {
                          order.orderNumber
                        }
                      </strong>
                      <small>
                        {new Date(
                          order.createdAt,
                        ).toLocaleString()}
                      </small>
                    </td>
                    <td>
                      <strong>
                        {
                          order.customer
                            ?.name
                        }
                      </strong>
                      <small>
                        {
                          order.customer
                            ?.phone
                        }
                      </small>
                    </td>
                    <td>
                      <strong>
                        {formatMoney(
                          order.total,
                          settings?.currencySymbol,
                        )}
                      </strong>
                    </td>
                    <td>
                      {statusSelect(
                        order,
                        'status',
                        order.status,
                        ORDER_STATUSES,
                      )}
                    </td>
                    <td>
                      {statusSelect(
                        order,
                        'paymentStatus',
                        order.paymentStatus,
                        PAYMENT_STATUSES,
                      )}
                    </td>
                    <td>
                      {statusSelect(
                        order,
                        'shippingStatus',
                        order.shippingStatus,
                        SHIPPING_STATUSES,
                      )}
                    </td>
                    <td>
                      <Link
                        className="btn btn-primary btn-small"
                        to={`/admin/orders/${order.id}/invoice`}
                      >
                        <FileText
                          size={15}
                        />
                        Invoice
                      </Link>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
