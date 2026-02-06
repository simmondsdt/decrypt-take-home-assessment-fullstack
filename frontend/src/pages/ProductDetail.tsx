import { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [id]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('No product ID');
      return;
    }

    const productId = id;
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProduct(productId);
        if (!cancelled) {
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load product');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = useCallback(() => {
    if (!product || !product.inStock) return;
    setAddedToCart(false);
    setAddingToCart(true);
    addItem(product.id, 1);
    setTimeout(() => {
      setAddingToCart(false);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }, 400);
  }, [product, addItem]);

  if (loading) {
    return (
      <div>
        <h1>Product Detail</h1>
        <p>Loading…</p>
      </div>
    );
  }

  if (error) {
    const isNotFound = error === 'Product not found';
    return (
      <div>
        <h1>Product Detail</h1>
        <p role="alert">{isNotFound ? 'Product not found.' : `Error: ${error}`}</p>
        <Link to="/products">Back to products</Link>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const buttonLabel = !product.inStock
    ? 'Out of stock'
    : addingToCart
      ? 'Adding…'
      : addedToCart
        ? 'Added to cart'
        : 'Add to cart';

  return (
    <div>
      <p>
        <Link to="/products">← Back to products</Link>
      </p>
      <h1>{product.name}</h1>
      {product.imageUrl && !imageError && (
        <p>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ maxWidth: '300px' }}
            onError={() => setImageError(true)}
          />
        </p>
      )}
      <p>{product.description}</p>
      <p>
        <strong>Price:</strong> {product.currency} {product.price.toFixed(2)}
      </p>
      <p>
        <strong>In stock:</strong> {product.inStock ? 'Yes' : 'No'}
      </p>
      {product.tags.length > 0 && (
        <p>
          <strong>Tags:</strong> {product.tags.join(', ')}
        </p>
      )}
      <p>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={addingToCart || !product.inStock}
          aria-live="polite"
        >
          {buttonLabel}
        </button>
      </p>
    </div>
  );
}
