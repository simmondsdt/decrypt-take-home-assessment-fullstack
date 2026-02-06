import type { Order } from '../types';

const SESSION_ORDERS_KEY = 'decrypt_recent_orders';

export function saveOrderToSession(order: Order): void {
  try {
    const existing = getOrdersFromSession();
    const updated = [order, ...existing];
    sessionStorage.setItem(SESSION_ORDERS_KEY, JSON.stringify(updated));
  } catch {
    // sessionStorage may be full or unavailable
  }
}

export function getOrdersFromSession(): Order[] {
  try {
    const raw = sessionStorage.getItem(SESSION_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
