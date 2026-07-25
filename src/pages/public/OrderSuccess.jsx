import {
  CheckCircle2,
  Printer,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom';

import { useStore } from '../../contexts/StoreContext';
import { formatMoney } from '../../lib/utils';
import { api } from '../../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { settings } = useStore();

  const [order, setOrder] =
    useState(null);

  const [error, setError] =
    useState('');

  const token =
    params.get('token') || '';

  useEffect(() => {
    api
      .getOrder(id, token)
      .then(setOrder)
      .catch(error =>
        setError(
          error.message ||
            'Unable to load order.',
        ),
      );
  }, [id, token]);

  const handlePrint = () => {
    window.print();
  };

  if (error) {
    return (
      <main className="page container">
        <div className="error-box">
          {error}
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <div className="screen-loader">
        Loading order...
      </div>
    );
  }

  return (
    <>
      {/* শুধুমাত্র order section print করার CSS */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 14mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
            }

            /*
             * Website-এর সব element hide থাকবে।
             */
            body * {
              visibility: hidden !important;
            }

            /*
             * শুধু order print section এবং
             * তার ভেতরের element visible থাকবে।
             */
            #print-order-section,
            #print-order-section * {
              visibility: visible !important;
            }

            #print-order-section {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              max-width: none !important;
              min-height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              border: 0 !important;
              background: #ffffff !important;
              box-shadow: none !important;
              transform: none !important;
            }

            #print-order-section .order-success {
              width: 100% !important;
              max-width: 760px !important;
              margin: 0 auto !important;
              padding: 28px !important;
              border: 1px solid #e2e8f0 !important;
              border-radius: 18px !important;
              background: #ffffff !important;
              box-shadow: none !important;
            }

            /*
             * Print-এর সময় buttons hide থাকবে।
             */
            #print-order-section .no-print {
              display: none !important;
            }

            /*
             * Background এবং color print করার জন্য।
             */
            #print-order-section,
            #print-order-section * {
              print-color-adjust: exact !important;
              -webkit-print-color-adjust: exact !important;
            }

            #print-order-section a {
              text-decoration: none !important;
            }
          }
        `}
      </style>

      <main
        id="print-order-section"
        className="page container narrow-page"
      >
        <div className="order-success">
          <CheckCircle2 size={58} />

          <span className="eyebrow">
            Order confirmed
          </span>

          <h1>
            Thank you,{' '}
            {order.customer?.name}!
          </h1>

          <p>
            Your order has been placed
            successfully. Save the order
            number below for tracking.
          </p>

          {/* Large Order Number */}
          <div
            style={{
              margin: '28px auto',
              maxWidth: '520px',
              padding: '22px 18px',
              border:
                '2px dashed var(--secondary-color, #d97706)',
              borderRadius: '20px',
              background:
                'var(--secondary-soft, #fff7ed)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                display: 'block',
                marginBottom: '8px',
                color: '#64748b',
                fontSize: '11px',
                fontWeight: '800',
                letterSpacing:
                  '0.16em',
                textTransform:
                  'uppercase',
              }}
            >
              Your Order Number
            </span>

            <strong
              style={{
                display: 'block',
                overflowWrap:
                  'anywhere',
                color:
                  'var(--secondary-ink, #92400e)',
                fontSize:
                  'clamp(26px, 6vw, 42px)',
                fontWeight: '950',
                lineHeight: '1.1',
                letterSpacing:
                  '0.04em',
              }}
            >
              {order.orderNumber}
            </strong>

            <small
              style={{
                display: 'block',
                marginTop: '10px',
                color: '#64748b',
                fontSize: '12px',
              }}
            >
              Keep this number for
              tracking your order.
            </small>
          </div>

          {/* Order Summary */}
          <div className="success-summary">
            <div>
              <span>Total</span>

              <strong>
                {formatMoney(
                  order.total,
                  settings?.currencySymbol,
                )}
              </strong>
            </div>

            <div>
              <span>Payment</span>

              <strong>
                {order.paymentMethodName ||
                  'Not specified'}
              </strong>
            </div>

            <div>
              <span>
                Shipping Area
              </span>

              <strong>
                {order.shippingAreaName ||
                  'Not specified'}
              </strong>
            </div>
          </div>

          {/* Print-এর সময় এই buttons দেখাবে না */}
          <div className="button-row centered no-print">
            <Link
              className="btn btn-primary"
              to="/track-order"
            >
              Track Order
            </Link>

            <button
              type="button"
              className="btn btn-light"
              onClick={handlePrint}
              aria-label="Print order"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>
      </main>
    </>
  );
}