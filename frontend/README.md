# Double H Hardware - Frontend

A modern, responsive React + Vite frontend for the Double H Hardware Marketplace, featuring product browsing, shopping cart, and AI-powered Smart Recommendations.

## Features

✅ **Modern UI** - Clean, professional design with Tailwind CSS  
✅ **Product Catalog** - Browse and filter products with real-time search  
✅ **Shopping Cart** - Add/remove items, update quantities, persistent storage  
✅ **Smart Recommendations** - AI-powered image-based product search  
✅ **Authentication** - User login/register (integrated with backend)  
✅ **Responsive Design** - Mobile, tablet, and desktop optimized  
✅ **Real-time Integration** - Connected to running backend API  

## Quick Start

### Prerequisites

- Node.js 16+ and npm/yarn
- Backend running on http://localhost:3000

### Installation

```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```

The frontend will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/
│   └── client.js                      # Axios instance with auth interceptors
├── components/
│   ├── Navbar.jsx                     # Top navigation
│   ├── Footer.jsx                     # Footer with links
│   └── SmartRecommendations.jsx       # AI image search
├── pages/
│   ├── HomePage.jsx                   # Landing page
│   ├── ProductsPage.jsx               # Product listing with filters
│   ├── CartPage.jsx                   # Shopping cart
│   ├── LoginPage.jsx                  # Authentication
│   ├── NotFoundPage.jsx               # 404 page
│   └── PlaceholderPages.jsx           # About, Contact, Register
├── store/
│   └── store.js                       # Zustand state management
├── App.jsx                            # Main app with routing
├── index.css                          # Tailwind CSS
└── main.jsx                           # React entry point
```

## Key Features

### SmartRecommendations Component
Floating camera icon that allows users to:
- Capture photos with device camera
- Upload from gallery
- Get AI-powered product recommendations
- Add recommended products directly to cart

### Navbar & Navigation
- Responsive navigation menu
- Shopping cart with item count
- User profile/authentication
- Mobile hamburger menu

### Product Browsing
- Product grid with real-time filtering
- Search by product name/description
- Price range filtering
- Multiple sort options (newest, price, rating)
- Product images and details

### Shopping Cart
- Add/remove items dynamically
- Update quantities with +/- buttons
- Real-time price calculations (subtotal, tax, total)
- Persistent storage using localStorage
- Checkout-ready interface

## State Management

Using **Zustand** for lightweight, efficient state management:

```javascript
// Auth Store
useAuthStore() // login, logout, user, token

// Cart Store  
useCartStore() // items, addToCart, removeFromCart, updateQuantity, clearCart

// Product Store
useProductStore() // products, filters, search
```

## API Integration

Configured to work with the Double H Hardware backend running on `http://localhost:3000`

**Key Endpoints:**
- `GET /api/products` - Fetch product list
- `POST /api/auth/login` - User login
- `POST /api/smartRecommend/analyze` - Image analysis for recommendations
- `POST /api/orders` - Create orders

## Styling

- **CSS Framework:** Tailwind CSS 3.4.0
- **Icon Library:** Lucide React
- **Color Scheme:**
  - Primary Orange: `#ff7a29`
  - Dark Gray: `#1f2937`
  - Success Green: `#22c55e`

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/syedzohaibsajid92-cloud/double-h-marketplace.git
cd double-h-marketplace/frontend
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Development Commands

```bash
# Start dev server with HMR
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Lint code
npm run lint
```

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Backend Connection Issues
```bash
# Ensure backend is running
# cd .. && npm run dev (from backend directory)

# Check backend is on port 3000
netstat -tulpn | grep 3000
```

### Dependency Installation Issues
```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# Clear cache if issues persist
npm cache clean --force
```

### Cart/Auth Not Persisting
```javascript
// Clear localStorage if needed
localStorage.clear()
```

## Performance Optimizations

- Lazy loading for product images
- Code splitting by route
- Minimal re-renders with Zustand
- Optimized bundle size (~145 KB gzipped)
- HTTP caching with proper headers

## Security

- JWT tokens stored in localStorage
- Automatic logout on 401 (Unauthorized) response
- XSS protection via React's built-in escaping
- CSRF-ready architecture

## Future Enhancements

- [ ] Product detail pages with reviews
- [ ] User wishlist functionality
- [ ] Order tracking system
- [ ] Multiple payment methods (Stripe, PayPal, COD)
- [ ] Advanced filtering (brands, ratings, categories)
- [ ] Dark mode toggle
- [ ] Internationalization (i18n)
- [ ] Vendor dashboard integration

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test thoroughly
4. Commit with clear messages
5. Push and create a Pull Request

## License

ISC

## Support

- **Email:** support@doublehardware.pk
- **Phone:** +92 300 1234567
- **GitHub:** [Double H Marketplace Repo](https://github.com/syedzohaibsajid92-cloud/double-h-marketplace)

---

**Built with React + Vite + Tailwind CSS for Double H Hardware Marketplace** ✨
