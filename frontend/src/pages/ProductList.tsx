import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { sortProducts, type SortOption } from '../utils/productSort';
import type { Product, Category } from '../types';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [tagsOpen, setTagsOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const tagsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tagsOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target as Node)) {
        setTagsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [tagsOpen]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [products]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(),
          api.getCategories().catch(() => [] as Category[]),
        ]);
        if (!cancelled) {
          setProducts(Array.isArray(productsData) ? productsData : []);
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
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

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId);
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((p) =>
        p.tags?.some((t) => selectedTags.includes(t))
      );
    }
    return sortProducts(filtered, sortBy);
  }, [products, categoryId, selectedTags, sortBy]);

  const activeCategory = categories.find((c) => c.id === categoryId);
  const hasActiveFilters = !!categoryId || selectedTags.length > 0;

  const clearAllFilters = () => {
    setCategoryId('');
    setSelectedTags([]);
  };

  const filterControlStyle: CSSProperties = {
    padding: '2px 8px',
    height: '1.5rem',
    boxSizing: 'border-box',
    border: '1px solid #767676',
    borderRadius: '2px',
    background: '#fff',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    minWidth: '8rem',
  };

  if (loading) {
    return (
      <div>
        <h1>Products</h1>
        <p>Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Products</h1>
        <p role="alert">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Products</h1>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Category
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            aria-label="Filter by category"
            style={filterControlStyle}
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
        </label>
        <div ref={tagsDropdownRef} style={{ position: 'relative' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Tags
            <button
              type="button"
              onClick={() => setTagsOpen((open) => !open)}
              aria-expanded={tagsOpen}
              aria-haspopup="listbox"
              aria-label="Filter by tags"
              style={{
                ...filterControlStyle,
                textAlign: 'left',
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              {selectedTags.length === 0 ? 'All' : `${selectedTags.length} selected`}
            </button>
          </label>
          {tagsOpen && (
            <div
              role="listbox"
              aria-multiselectable
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '0.25rem',
                padding: '0.5rem',
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 10,
                maxHeight: '16rem',
                overflowY: 'auto',
                minWidth: '10rem',
              }}
            >
              {allTags.map((tag) => (
                <label
                  key={tag}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.35rem 0',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                    aria-label={tag}
                  />
                  {tag}
                </label>
              ))}
            </div>
          )}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Sort by
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort products"
            style={filterControlStyle}
          >
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name-asc">Name: A–Z</option>
            <option value="name-desc">Name: Z–A</option>
          </select>
        </label>
      </div>

      {hasActiveFilters && (
        <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#666', marginRight: '0.25rem' }}>
            Active filters:
          </span>
          <button
            type="button"
            onClick={clearAllFilters}
            style={{
              fontSize: '0.875rem',
              padding: '0.2rem 0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              background: '#fff',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            Clear all
          </button>
          {activeCategory && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.5rem',
                background: '#e8e8e8',
                borderRadius: '999px',
                fontSize: '0.875rem',
              }}
            >
              Category: {activeCategory.name}
              <button
                type="button"
                onClick={() => setCategoryId('')}
                aria-label={`Remove category filter ${activeCategory.name}`}
                style={{
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  lineHeight: 1,
                  color: '#666',
                  fontSize: '1rem',
                }}
              >
                ×
              </button>
            </span>
          )}
          {selectedTags.map((tag) => (
            <span
              key={tag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.5rem',
                background: '#e8e8e8',
                borderRadius: '999px',
                fontSize: '0.875rem',
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                aria-label={`Remove tag filter ${tag}`}
                style={{
                  margin: 0,
                  padding: 0,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  lineHeight: 1,
                  color: '#666',
                  fontSize: '1rem',
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1.25rem',
          gridAutoRows: '1fr',
        }}
      >
        {filteredAndSortedProducts.map((product) => (
          <li key={product.id} style={{ display: 'flex', minHeight: 0 }}>
            <Link
              to={`/products/${product.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                padding: '1rem',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                background: '#fff',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                transition: 'box-shadow 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
              }}
            >
              <strong
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  marginBottom: '0.5rem',
                  fontSize: '1rem',
                  minHeight: '2.5em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {product.name}
              </strong>
              <div
                style={{
                  width: '100%',
                  height: '140px',
                  marginBottom: '0.5rem',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: '#f5f5f5',
                }}
              >
                {product.imageUrl && !imageErrors[product.id] ? (
                  <img
                    src={product.imageUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={() => setImageErrors((prev) => ({ ...prev, [product.id]: true }))}
                  />
                ) : null}
              </div>
              <span style={{ fontSize: '0.95rem', color: '#333', marginTop: 'auto' }}>
                {product.currency} {product.price.toFixed(2)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {filteredAndSortedProducts.length === 0 && (
        <p>No products match the selected filters.</p>
      )}
    </div>
  );
}
