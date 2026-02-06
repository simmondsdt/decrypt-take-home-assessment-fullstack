export interface CartItem {
  productId: string;
  quantity: number;
}

const SESSION_CART_KEY = 'decrypt_cart';

export function getCartFromSession(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(SESSION_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CartItem =>
        item != null &&
        typeof item === 'object' &&
        typeof (item as CartItem).productId === 'string' &&
        typeof (item as CartItem).quantity === 'number' &&
        (item as CartItem).quantity > 0
    );
  } catch {
    return [];
  }
}

export function saveCartToSession(items: CartItem[]): void {
  try {
    sessionStorage.setItem(SESSION_CART_KEY, JSON.stringify(items));
  } catch {
    // sessionStorage may be full or unavailable
  }
}
