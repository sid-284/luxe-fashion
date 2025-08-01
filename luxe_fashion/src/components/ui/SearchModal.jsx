import React, { useState, useEffect, useRef } from 'react';
import { apiFetch } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { convertUSDToINR, formatINR } from '../../utils/currency';

// Dummy data from collection-universe/index.jsx
const productsData = [
  {
    id: 1,
    name: "Cashmere Wrap Coat",
    designer: "Isabella Marchetti",
    price: 1280,
    originalPrice: 1600,
    rating: 4.8,
    reviews: 24,
    description: "Luxurious cashmere coat with an elegant wrap silhouette, perfect for transitional weather.",
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop"
    ],
    sizes: [
      { size: 'XS', available: true },
      { size: 'S', available: true },
      { size: 'M', available: false },
      { size: 'L', available: true },
      { size: 'XL', available: true }
    ],
    isNew: true,
    onSale: true,
    sustainability: true,
    isWishlisted: false,
    popularity: 95,
    createdAt: "2024-07-10"
  },
  {
    id: 2,
    name: "Silk Midi Dress",
    designer: "Isabella Marchetti",
    price: 680,
    rating: 4.9,
    reviews: 18,
    description: "Flowing silk dress with delicate pleating and a flattering midi length.",
    images: [
      "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?w=400&h=500&fit=crop",
      "https://images.pexels.com/photos/1488464/pexels-photo-1488464.jpeg?w=400&h=500&fit=crop"
    ],
    sizes: [
      { size: 'XS', available: true },
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
      { size: 'XL', available: false }
    ],
    isNew: true,
    sustainability: true,
    isWishlisted: true,
    popularity: 88,
    createdAt: "2024-07-08"
  },
  {
    id: 3,
    name: "Merino Wool Sweater",
    designer: "Isabella Marchetti",
    price: 420,
    rating: 4.7,
    reviews: 32,
    description: "Soft merino wool sweater with a relaxed fit and subtle texture details.",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop"
    ],
    sizes: [
      { size: 'XS', available: false },
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
      { size: 'XL', available: true }
    ],
    sustainability: true,
    isWishlisted: false,
    popularity: 76,
    createdAt: "2024-07-05"
  },
  {
    id: 4,
    name: "Tailored Blazer",
    designer: "Isabella Marchetti",
    price: 890,
    rating: 4.6,
    reviews: 15,
    description: "Impeccably tailored blazer with structured shoulders and a modern silhouette.",
    images: [
      "https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?w=400&h=500&fit=crop",
      "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?w=400&h=500&fit=crop"
    ],
    sizes: [
      { size: 'XS', available: true },
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: false },
      { size: 'XL', available: true }
    ],
    isWishlisted: false,
    popularity: 82,
    createdAt: "2024-07-03"
  },
  {
    id: 5,
    name: "Pleated Midi Skirt",
    designer: "Isabella Marchetti",
    price: 520,
    rating: 4.8,
    reviews: 28,
    description: "Elegant pleated skirt in luxurious fabric with a timeless midi length.",
    images: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop",
      "https://images.pexels.com/photos/1488464/pexels-photo-1488464.jpeg?w=400&h=500&fit=crop"
    ],
    sizes: [
      { size: 'XS', available: true },
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
      { size: 'XL', available: true }
    ],
    sustainability: true,
    isWishlisted: true,
    popularity: 91,
    createdAt: "2024-07-01"
  },
  {
    id: 6,
    name: "Cashmere Turtleneck",
    designer: "Isabella Marchetti",
    price: 380,
    rating: 4.9,
    reviews: 41,
    description: "Ultra-soft cashmere turtleneck in a classic fit, perfect for layering.",
    images: [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop"
    ],
    sizes: [
      { size: 'XS', available: true },
      { size: 'S', available: false },
      { size: 'M', available: true },
      { size: 'L', available: true },
      { size: 'XL', available: true }
    ],
    sustainability: true,
    isWishlisted: false,
    popularity: 94,
    createdAt: "2024-06-28"
  },
  {
    id: 7,
    name: "Wide-Leg Trousers",
    designer: "Isabella Marchetti",
    price: 620,
    rating: 4.5,
    reviews: 19,
    description: "Sophisticated wide-leg trousers with a high waist and flowing silhouette.",
    images: [
      "https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?w=400&h=500&fit=crop",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop"
    ],
    sizes: [
      { size: 'XS', available: true },
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
      { size: 'XL', available: false }
    ],
    isWishlisted: false,
    popularity: 73,
    createdAt: "2024-06-25"
  },
  {
    id: 8,
    name: "Silk Blouse",
    designer: "Isabella Marchetti",
    price: 480,
    rating: 4.7,
    reviews: 26,
    description: "Elegant silk blouse with subtle draping and mother-of-pearl buttons.",
    images: [
      "https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?w=400&h=500&fit=crop",
      "https://images.pexels.com/photos/1488464/pexels-photo-1488464.jpeg?w=400&h=500&fit=crop"
    ],
    sizes: [
      { size: 'XS', available: false },
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
      { size: 'XL', available: true }
    ],
    sustainability: true,
    isWishlisted: true,
    popularity: 86,
    createdAt: "2024-06-22"
  }
];

const SearchModal = ({ open, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  // Escape key closes modal
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setLoading(true);
      apiFetch('/product/list')
        .then(data => {
          // Merge backend and dummy data, remove duplicates by id
          const backendProducts = Array.isArray(data) ? data : [];
          const merged = [...productsData, ...backendProducts.filter(p => !productsData.some(d => (d.id || d._id) === (p.id || p._id)) )];
          setAllProducts(merged);
          setLoading(false);
        })
        .catch(() => {
          setAllProducts(productsData);
          setLoading(false);
        });
    }
  }, [open]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    setResults(
      allProducts.filter(
        p =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.designer && p.designer.toLowerCase().includes(q))
      )
    );
  }, [query, allProducts]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fadeIn" onClick={onClose} />
      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-lg mx-auto rounded-xl shadow-2xl border border-border bg-card px-6 py-8 animate-slideDown"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          position: 'fixed',
          width: '90vw',
          maxWidth: '32rem',
          minWidth: '0',
        }}
      >
        <button
          className="absolute top-4 right-4 text-muted-foreground hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
          onClick={onClose}
          aria-label="Close search"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <h2 className="text-xl font-serif font-semibold text-foreground mb-4 text-center">Search Luxe</h2>
        <input
          ref={inputRef}
          type="text"
          className="w-full border border-border rounded-md px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-accent bg-background"
          placeholder="Search for products, brands, or categories..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <svg className="animate-spin h-6 w-6 text-accent" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
            </div>
          ) : query && results.length === 0 ? (
            <div className="text-muted-foreground text-center text-sm py-8">No products found.</div>
          ) : results.length > 0 ? (
            <ul className="divide-y divide-border max-h-72 overflow-y-auto">
              {results.map(product => (
                <li
                  key={product._id || product.id}
                  className="flex items-center gap-4 py-3 cursor-pointer hover:bg-muted/50 rounded transition"
                  onClick={() => {
                    onClose();
                    navigate(`/product?id=${product._id || product.id}`);
                  }}
                >
                  <img
                    src={product.image1 || product.images?.[0] || '/assets/images/no_image.png'}
                    alt={product.name}
                    className="w-12 h-16 object-cover rounded border border-border bg-muted"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground truncate">{product.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{product.brand || product.category || product.designer}</div>
                  </div>
                  <div className="font-semibold text-accent">{formatINR(convertUSDToINR(product.price))}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground text-center text-sm py-8">Start typing to search our collection.</div>
          )}
        </div>
      </div>
      {/* Animations */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.2s; }
        @keyframes slideDown { from { transform: translateY(-32px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slideDown { animation: slideDown 0.25s cubic-bezier(.4,1.7,.7,1) forwards; }
      `}</style>
    </div>
  );
};

export default SearchModal; 