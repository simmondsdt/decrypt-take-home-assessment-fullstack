import { Routes, Route, Link } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import {
  headerStyle,
  logoStyle,
  navStyle,
  navLinkStyle,
  cartBadgeStyle,
  mainStyle,
} from './styles/layout';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Home from './pages/Home';
import Admin from './pages/Admin';
import OrderLookup from './pages/OrderLookup';

function CartLink() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  return (
    <Link to="/cart" style={{ position: 'relative', ...navLinkStyle }}>
      Cart
      {count > 0 && (
        <span
          style={cartBadgeStyle}
          aria-label={`${count} items in cart`}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}

export default function App() {
  return (
    <CartProvider>
    <>
      <header style={headerStyle}>
        <Link to="/" style={logoStyle}>DecryptCode Shop</Link>
        <nav style={navStyle}>
          <Link to="/" style={navLinkStyle}>Home</Link>
          <Link to="/products" style={navLinkStyle}>Products</Link>
          <Link to="/order" style={navLinkStyle}>Orders</Link>
          <Link to="/admin" style={navLinkStyle}>Admin</Link>
          <CartLink />
        </nav>
      </header>
      <main style={mainStyle}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<OrderLookup />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
    </>
    </CartProvider>
  );
}
