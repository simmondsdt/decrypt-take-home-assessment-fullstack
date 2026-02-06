import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersFromSession } from '../storage/ordersStorage';
import type { Order } from '../types';

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(getOrdersFromSession());
  }, []);

  return (
    <div>
      <h1>Recent orders</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>Recently placed orders.</p>
      {orders.length === 0 ? (
        <p>No orders yet. Place an order from the cart to see it here.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map(order => (
            <li
              key={order.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem 1.25rem',
                marginBottom: '1rem',
                background: '#fafafa',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <strong>Order #{order.id}</strong>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem' }}>Email: {order.customerEmail}</p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>Status: {order.status}</p>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                {order.items.map((item, i) => (
                  <li key={`${item.productId}-${i}`}>
                    {item.productId} × {item.quantity} @ {item.unitPrice.toFixed(2)} ={' '}
                    {(item.quantity * item.unitPrice).toFixed(2)}
                  </li>
                ))}
              </ul>
              <p style={{ margin: '0.5rem 0 0', fontWeight: 'bold' }}>Total: ${order.totalAmount.toFixed(2)}</p>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/">← Back to shop</Link>
      </p>
    </div>
  );
}
