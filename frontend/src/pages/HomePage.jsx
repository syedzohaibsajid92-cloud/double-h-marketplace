import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Hammer, Shield, Zap } from 'lucide-react';
import client from '../api/client';
import { useCartStore } from '../store/store';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await client.get('/products?limit=6');
        setFeaturedProducts(response.data.data || response.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Quality Hardware & Industrial Tools
            </h1>
            <p className="text-lg text-primary-100 mb-10 leading-relaxed">
              Your trusted marketplace for professional-grade tools, equipment, and hardware supplies. Serving builders, contractors, and DIY professionals nationwide.
            </p>
            <div className="flex gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition shadow-lg"
              >
                Browse Products <ChevronRight size={20} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:bg-opacity-10 transition"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Why Choose Double H Hardware?
            </h2>
            <p className="text-lg text-slate-600">
              Industry-leading expertise and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center hover:border-primary-300 transition">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Hammer className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Premium Quality</h3>
              <p className="text-slate-600 leading-relaxed">
                We source only the highest quality tools and equipment from trusted, verified manufacturers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center hover:border-primary-300 transition">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Fast Delivery</h3>
              <p className="text-slate-600 leading-relaxed">
                Quick shipping across Pakistan with real-time tracking on all orders.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center hover:border-primary-300 transition">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Expert Support</h3>
              <p className="text-slate-600 leading-relaxed">
                Dedicated customer service team ready to help with any questions or technical support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <Link
            to="/products"
            className="text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1"
          >
            View All <ChevronRight size={20} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading products...</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={product.images?.[0] || product.image || 'https://via.placeholder.com/400x300'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                <div className="p-4">
                  <p className="text-xs text-gray-500 uppercase mb-2">
                    {product.category || 'Tools'}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {product.description}
                  </p>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary-500">
                        Rs. {product.price?.toLocaleString()}
                      </p>
                      {product.rating && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600">
                            {product.rating} ({product.reviews || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full mt-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded transition"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            No products available yet.
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary-500 text-white py-12 my-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Find Products Faster with AI
          </h2>
          <p className="text-lg mb-8 text-gray-100 max-w-2xl mx-auto">
            Use our Smart Recommendations feature to upload a photo and instantly find matching products in our marketplace.
          </p>
          <p className="text-gray-200">Click the camera icon in the bottom-right corner to get started!</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
