import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Order } from '../types';

export default function OrderLookup() {
  const [email, setEmail] = useState('');
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    const id = orderId.trim();
    const emailTrimmed = email.trim();
    if (!id) {
      setError('Please enter your order ID.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.getOrder(id, emailTrimmed || undefined);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>View your order</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Enter your order ID to view order details. Email is optional and can help verify the order.
      </p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '24rem' }}>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Email (optional)
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={loading}
            style={{ display: 'block', marginTop: '0.25rem', padding: '0.5rem', width: '100%', boxSizing: 'border-box' }}
            aria-label="Email address"
          />
        </label>
        <label style={{ display: 'block', marginBottom: '1rem' }}>
          Order ID
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. ord_abc123def456"
            required
            disabled={loading}
            style={{ display: 'block', marginTop: '0.25rem', padding: '0.5rem', width: '100%', boxSizing: 'border-box' }}
            aria-label="Order ID"
          />
        </label>
        {error && (
          <p role="alert" style={{ color: 'crimson', marginBottom: '0.75rem' }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          aria-busy={loading}
          style={{
            marginBottom: '1.5rem',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'wait' : 'pointer',
          }}
        >
          {loading ? 'Looking up…' : 'View order'}
        </button>
      </form>

      {order && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1.25rem',
            maxWidth: '32rem',
            background: '#fafafa',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Order #{order.id}</h2>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Email:</strong> {order.customerEmail}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Status:</strong> {order.status}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}
          </p>
          <ul style={{ margin: '1rem 0', paddingLeft: '1.25rem' }}>
            {order.items.map((item, i) => (
              <li key={`${item.productId}-${i}`}>
                {item.productId} × {item.quantity} @ ${item.unitPrice.toFixed(2)} = $
                {(item.quantity * item.unitPrice).toFixed(2)}
              </li>
            ))}
          </ul>
          <p style={{ margin: '0.5rem 0 0', fontWeight: 'bold', fontSize: '1.1rem' }}>
            Total: ${order.totalAmount.toFixed(2)}
          </p>
        </div>
      )}

      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/">← Back to shop</Link>
      </p>
    </div>
  );
}
