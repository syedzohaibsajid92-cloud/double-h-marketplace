import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Search, ShoppingCart, Loader } from 'lucide-react';
import { useCartStore } from '../store/store';
import client from '../api/client';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:border-primary-300 hover:shadow-md transition-all">
      <div className="relative w-full h-48 bg-slate-100 overflow-hidden group">
        <img
          src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        {product.discount && (
          <div className="absolute top-3 right-3 bg-primary-600 text-white px-2 py-1 rounded text-sm font-semibold">
            -{product.discount}%
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
          {product.vendor || 'Double H Hardware'}
        </p>
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2">
          {product.name}
        </h3>

        {product.rating && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex text-yellow-400">
              {'★'.repeat(Math.floor(product.rating || 0))}
              {'☆'.repeat(5 - Math.floor(product.rating || 0))}
            </div>
            <span className="text-xs text-slate-600">({product.reviews || 0})</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-slate-900">
            Rs. {(product.price || 0).toLocaleString()}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-slate-400 line-through">
              Rs. {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mb-4">
          <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className={`w-full py-2 px-4 rounded font-semibold transition flex items-center justify-center gap-2 ${
            product.stock > 0
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-slate-300 text-slate-600 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>

        {product.matchConfidence && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-600">
              Match Confidence: <span className="font-semibold">{product.matchConfidence}%</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const SmartRecommendations = ({ isOpen, onClose }) => {
  const [stage, setStage] = useState('entry');
  const [selectedImage, setSelectedImage] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { addToCart } = useCartStore();

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      setError('Please select or capture an image first');
      return;
    }

    setStage('loading');
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      const blob = await fetch(selectedImage).then(r => r.blob());
      formData.append('image', blob, 'image.png');

      const response = await client.post('/smartRecommend/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data?.products) {
        setRecommendations(response.data.products);
        setStage('results');
      } else {
        throw new Error(response.data?.message || 'Failed to analyze image');
      }
    } catch (err) {
      console.error('Error analyzing image:', err);
      setError(err.response?.data?.message || 'Failed to analyze image. Please try again.');
      setStage('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCartClick = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleClose = () => {
    setStage('entry');
    setSelectedImage(null);
    setRecommendations([]);
    setError(null);
    onClose?.();
  };

  // Entry point
  if (stage === 'entry' && !isOpen) {
    return (
      <button
        onClick={() => setStage('upload')}
        className="fixed bottom-6 right-6 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 z-40"
        title="Smart Recommendations - Upload Product Image"
      >
        <Camera size={24} />
      </button>
    );
  }

  // Upload modal
  if (stage === 'upload') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full shadow-xl border border-slate-200">
          <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Camera size={20} />
              Smart Recommendations
            </h2>
            <button onClick={handleClose} className="hover:bg-slate-700 p-1 rounded transition">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {selectedImage ? (
              <div className="space-y-4">
                <div className="relative w-full bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300">
                  <img
                    src={selectedImage}
                    alt="Selected"
                    className="w-full h-auto max-h-96 object-contain"
                  />
                </div>

                <button
                  onClick={() => setSelectedImage(null)}
                  className="w-full py-2 px-4 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition"
                >
                  Choose Different Image
                </button>

                <button
                  onClick={handleAnalyzeImage}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      Find Similar Products
                    </>
                  )}
                </button>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                    {error}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-700 text-center font-medium">
                  Upload a photo of a tool or product to find similar items in our marketplace.
                </p>

                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="w-full py-4 px-4 border-2 border-dashed border-primary-500 rounded-lg hover:bg-primary-50 transition flex items-center justify-center gap-3"
                >
                  <Camera className="text-primary-600" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Take Photo</p>
                    <p className="text-xs text-slate-600">Use your camera</p>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-4 border-2 border-dashed border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center justify-center gap-3"
                >
                  <Upload className="text-slate-600" size={24} />
                  <div className="text-left">
                    <p className="font-semibold text-slate-800">Upload Photo</p>
                    <p className="text-xs text-slate-600">From your gallery</p>
                  </div>
                </button>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                    {error}
                  </div>
                )}

                <p className="text-xs text-slate-500 text-center mt-4">
                  Supported formats: JPG, PNG, WebP (max 10MB)
                </p>
              </div>
            )}
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // Loading
  if (stage === 'loading') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full shadow-xl p-8 text-center border border-slate-200">
          <div className="flex justify-center mb-4">
            <Loader className="w-16 h-16 text-primary-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Analyzing Your Image</h3>
          <p className="text-slate-600 text-sm">
            Our AI is finding the best matching products from our marketplace...
          </p>
        </div>
      </div>
    );
  }

  // Results
  if (stage === 'results') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-6xl w-full shadow-xl my-8 border border-slate-200">
          <div className="bg-slate-800 text-white px-6 py-4 flex items-center justify-between sticky top-0">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Search size={20} />
                Recommended Products
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                {recommendations.length} similar items found
              </p>
            </div>
            <button
              onClick={handleClose}
              className="hover:bg-slate-700 p-1 rounded transition"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCartClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No products found</p>
                <p className="text-slate-500 text-sm">Try uploading a different image</p>
              </div>
            )}
          </div>

          <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end border-t border-slate-200">
            <button
              onClick={() => setStage('upload')}
              className="px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-100 transition"
            >
              Try Another Image
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default SmartRecommendations;
