import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/ui/Header';
import CollectionHero from './components/CollectionHero';
import DesignerSpotlight from './components/DesignerSpotlight';
import FilterSidebar from './components/FilterSidebar';
import SortAndView from './components/SortAndView';
import ProductGrid from './components/ProductGrid';
import StyleItSection from './components/StyleItSection';
import SustainabilityInfo from './components/SustainabilityInfo';
import { convertUSDToINR } from '../../utils/currency';
import { apiFetch } from '../../utils/api';

const CollectionUniverse = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    category: [],
    size: [],
    color: [],
    price: [],
    sustainability: []
  });
  
  // State for backend products
  const [isLoading, setIsLoading] = useState(true);
  
  // Polling interval reference
  const pollingIntervalRef = useRef(null);

  // Mock collection data
  const collectionData = {
    name: "Modest Elegance",
    season: "Timeless Collection",
    description: "When two hearts with one vision come together, beautiful things happen. Our goal is to offer clothing that allows women to express their individuality while staying true to their beliefs. Every item in our store is handpicked with care, and we're proud to offer you something special, created with love by friends for friends.",
    heroImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=800&fit=crop"
  };

  // Mock designer data
  const designerData = {
    name: "Suha & Rameesa",
    bio: `We are two best friends, bound by a shared vision of combining modesty with style. Our journey began with countless late-night conversations about our passion for fashion and our desire to create a space where modesty meets style.

With love, laughter, and lots of hard work, we've brought this vision to life. Welcome to our modest wear clothing line, where each piece is a reflection of our friendship and dedication to timeless fashion.

Our commitment extends beyond just beautiful clothing – we believe in sustainable practices that honor both our customers and our planet. Every piece is thoughtfully designed to be versatile, durable, and ethically made, ensuring that your wardrobe choices reflect your values.`,
    quote: "Fashion should empower women to express their individuality while staying true to their beliefs. We design for the woman who values both style and substance.",
    location: "Founded with Love",
    founded: "2023",
    awards: "Friendship & Vision",
    specialties: ["Modest Fashion", "Sustainable Practices", "Ethical Production", "Timeless Design"],
    image: "https://images.unsplash.com/photo-1494790108755-2616c9c0b8e3?w=500&h=600&fit=crop"
  };

  // Mock collection data
  const productsData = [
    {
      id: 1,
      name: "Cashmere Wrap Coat",
      designer: "Isabella Marchetti",
      price: 2480,
      originalPrice: 3200,
      rating: 4.8,
      reviews: 24,
      description: "Luxurious cashmere coat with an elegant wrap silhouette, perfect for transitional weather.",
      images: [
        "images/images/sandbreeze.jpg"
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
      price: 1420,
      rating: 4.9,
      reviews: 18,
      description: "Flowing silk dress with delicate pleating and a flattering midi length.",
      images: [
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop"
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
        "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop"
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
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop"
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
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop"
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
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop"
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
        "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=500&fit=crop"
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
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=500&fit=crop",
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop"
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

  const [backendProducts, setBackendProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch products from backend
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/product/list');
      setBackendProducts(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and setup polling for auto-updates
  useEffect(() => {
    fetchProducts();
    
    // Set up polling to check for new products every 30 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchProducts();
    }, 30000);
    
    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [fetchProducts]);

  // Debug function to clear cart and localStorage
  const clearCartDebug = () => {
    localStorage.removeItem('cart');
    localStorage.removeItem('wishlist');
    console.log('Cart and wishlist cleared from localStorage');
    window.location.reload();
  };

  // Debug function to show what products are being displayed
  useEffect(() => {
    console.log('Filtered products:', filteredProducts.map(p => p.name));
    console.log('Backend products with categories:', backendProducts.map(p => ({ name: p.name, category: p.category })));
  }, [filteredProducts, backendProducts]);


  // Apply filters when filters or backend products change
  useEffect(() => {
    // Start with the backend products
    let filtered = backendProducts.map(product => ({
      ...product,
      id: product._id, // Ensure id is available for consistency
      images: [
        product.image1, 
        product.image2, 
        product.image3, 
        product.image4
      ].filter(Boolean), // Handle multiple images from backend
      sizes: product.sizes ?
        (Array.isArray(product.sizes) ?
          product.sizes.map(size =>
            typeof size === 'string' ?
              { size: size, available: true } :
              size
          ) :
          [{ size: 'S', available: true }, { size: 'M', available: true }, { size: 'L', available: true }]
        ) :
        [{ size: 'S', available: true }, { size: 'M', available: true }, { size: 'L', available: true }], // Default sizes if not provided
      category: product.category || '', // Ensure category is available for filtering
      sustainability: product.sustainability || false,
      popularity: product.popularity || 50,
      createdAt: product.createdAt || new Date().toISOString()
    }));

    // Apply filters
    Object.keys(filters).forEach(filterType => {
      if (filters[filterType].length > 0) {
        filtered = filtered.filter(product => {
          switch (filterType) {
            case 'category':
              // Check if product has a category field, otherwise fallback to name
              if (product.category) {
                return filters[filterType].some(cat => 
                  product.category.toLowerCase() === cat.toLowerCase()
                );
              } else {
                // Fallback to name-based filtering if category is not available
                return filters[filterType].some(cat => 
                  product.name.toLowerCase().includes(cat.toLowerCase())
                );
              }
            case 'size':
              if (!product.sizes || !Array.isArray(product.sizes)) return false;

              return product.sizes.some(size => {
                // Handle both string format ["XS", "S", "M"] and object format [{size: "XS", available: true}]
                const sizeValue = typeof size === 'string' ? size : size.size;
                const isAvailable = typeof size === 'string' ? true : size.available;

                return sizeValue && isAvailable && filters[filterType].some(selectedSize =>
                  selectedSize && selectedSize.toLowerCase() === sizeValue.toLowerCase()
                );
              });
            case 'color':
              // Mock color filtering logic
              return true; // Simplified for demo
            case 'price':
              return filters[filterType].some(priceRange => {
                const priceInINR = convertUSDToINR(product.price);
                switch (priceRange) {
                  case 'under-100':
                    return priceInINR < convertUSDToINR(100);
                  case '100-250':
                    return priceInINR >= convertUSDToINR(100) && priceInINR <= convertUSDToINR(250);
                  case '250-500':
                    return priceInINR >= convertUSDToINR(250) && priceInINR <= convertUSDToINR(500);
                  case '500-1000':
                    return priceInINR >= convertUSDToINR(500) && priceInINR <= convertUSDToINR(1000);
                  case 'over-1000':
                    return priceInINR > convertUSDToINR(1000);
                  default:
                    return true;
                }
              });
            case 'sustainability':
              return filters[filterType].length === 0 || product.sustainability;
            default:
              return true;
          }
        });
      }
    });

    console.log('Applied filters:', filters);
    console.log('Filtered products count:', filtered.length);
    console.log('Sample product sizes:', backendProducts.slice(0, 2).map(p => ({ name: p.name, sizes: p.sizes })));
    setFilteredProducts(filtered);
  }, [filters, backendProducts]);

  const handleFilterChange = (filterType, value, checked) => {
    console.log('Filter change:', { filterType, value, checked });

    if (filterType === 'clear') {
      setFilters({
        category: [],
        size: [],
        color: [],
        price: [],
        sustainability: []
      });
      return;
    }

    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }));
  };

  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Collection Hero */}
      <CollectionHero collection={collectionData} />
      
      {/* Designer Spotlight */}
      <DesignerSpotlight designer={designerData} />
      
      {/* Main Content */}
      <div className="flex">
        {/* Filter Sidebar */}
        <FilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
        
        {/* Products Section */}
        <div className="flex-1 lg:ml-80">
          {/* Sort and View Controls */}
          <SortAndView
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterToggle={toggleFilter}
            totalProducts={filteredProducts.length}
          />
          
          {/* Debug Section - Remove in production */}
          
          {/* Product Grid */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ProductGrid
              products={filteredProducts}
              viewMode={viewMode}
              sortBy={sortBy}
            />
          </div>
        </div>
      </div>
      
      {/* Sustainability Info */}
      <SustainabilityInfo />
    </div>
  );
};

export default CollectionUniverse;