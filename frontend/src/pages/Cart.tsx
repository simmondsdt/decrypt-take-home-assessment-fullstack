import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { saveOrderToSession } from '../storage/ordersStorage';
import type { Product } from '../types';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface LineItem {
  productId: string;
  quantity: number;
  product: Product | null;
  unitPrice: number;
  lineTotal: number;
}

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  const productIdsKey = useMemo(
    () =>
      items
        .map(i => i.productId)
        .sort()
        .join(','),
    [items],
  );

  useEffect(() => {
    if (items.length > 0) setOrderSuccessMessage(null);
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      setProducts([]);
      return;
    }

    let cancelled = false;

    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProducts();
        if (!cancelled) {
          setProducts(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [productIdsKey, items.length]);

  const lineItems: LineItem[] = items.map(item => {
    const product = products.find(p => p.id === item.productId) ?? null;
    const unitPrice = product?.price ?? 0;
    const lineTotal = item.quantity * unitPrice;
    return {
      productId: item.productId,
      quantity: item.quantity,
      product,
      unitPrice,
      lineTotal,
    };
  });

  const cartTotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0);
  const currency = lineItems.find(li => li.product?.currency)?.product?.currency ?? 'USD';

  const emailTrimmed = customerEmail.trim();
  const emailInvalid = emailTrimmed !== '' && !isValidEmail(emailTrimmed);

  async function handlePlaceOrder() {
    setOrderError(null);
    if (emailInvalid) {
      setOrderError('Please enter a valid email address.');
      return;
    }
    if (items.length === 0) return;
    setPlacingOrder(true);
    try {
      const order = await api.createOrder({
        customerEmail: emailTrimmed || undefined,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      saveOrderToSession(order);
      clearCart();
      setOrderSuccessMessage(`Your order has been placed successfully! Here is your order id for reference: #${order.id}.`);
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <h1>Cart</h1>
        {orderSuccessMessage ? (
          <>
            <p role="status" style={{ color: 'green' }}>
              {orderSuccessMessage}
            </p>
            <Link to="/products">Continue shopping</Link>
          </>
        ) : (
          <>
            <p>Your cart is empty.</p>
            <Link to="/products">Browse products</Link>
          </>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1>Cart</h1>
        <p>Loading cart…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Cart</h1>
        <p role="alert">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Cart</h1>
      <p style={{ margin: '0.25rem 0 1rem', fontSize: '0.875rem' }}>
        <Link to="/products">← Keep shopping</Link>
      </p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {lineItems.map(li => (
          <li
            key={li.productId}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 0',
              borderBottom: '1px solid #eee',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {li.product ? (
                <Link to={`/products/${li.productId}`}>
                  <strong>{li.product.name}</strong>
                </Link>
              ) : (
                <span>Product unavailable</span>
              )}
              <div style={{ fontSize: '0.9rem', color: '#666' }}>
                {li.product?.currency ?? 'USD'} {li.unitPrice.toFixed(2)} × {li.quantity} = {li.product?.currency ?? 'USD'}{' '}
                {li.lineTotal.toFixed(2)}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label>
                Qty{' '}
                <input
                  type="number"
                  min={1}
                  value={li.quantity}
                  onChange={e => {
                    const n = parseInt(e.target.value, 10);
                    if (!Number.isNaN(n)) updateQuantity(li.productId, n);
                  }}
                  style={{ width: '6ch' }}
                />
              </label>
              <button
                type="button"
                onClick={() => removeItem(li.productId)}
                aria-label={`Remove ${li.product?.name ?? li.productId} from cart`}
                style={{ padding: '0.35rem', lineHeight: 0, border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: '#c0392b', display: 'block' }}
                  aria-hidden
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p style={{ marginTop: '1.5rem', fontSize: '1.25rem' }}>
        <strong>
          Cart total: {currency} {cartTotal.toFixed(2)}
        </strong>
      </p>

      <div style={{ marginTop: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Email (optional)
          <input
            type="email"
            value={customerEmail}
            onChange={e => setCustomerEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ display: 'block', marginTop: '0.25rem', padding: '0.5rem', minWidth: '16rem' }}
            aria-label="Customer email for order"
          />
        </label>
        {(orderError || emailInvalid) && (
          <p role="alert" style={{ color: 'crimson', marginBottom: '0.5rem' }}>
            {orderError || 'Please enter a valid email address.'}
          </p>
        )}
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placingOrder || items.length === 0 || emailInvalid}
          style={{ marginTop: '0.5rem' }}
        >
          {placingOrder ? 'Placing order…' : 'Place order'}
        </button>
      </div>
    </div>
  );
}
