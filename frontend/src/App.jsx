import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css';
import Layout from './Components/Layout';
import ProtectedRoute from './Pages/ProtectedRoute';
import AdminRoute from './Pages/AdminRoute';
import AdminLayout from './Components/AdminLayout';

// Lazy-loaded pages
const Home = lazy(() => import('./Pages/Home'));
const About = lazy(() => import('./Pages/About'));
const Contact = lazy(() => import('./Pages/Contact'));
const ShoppingCart = lazy(() => import('./Pages/Cart'));
const Shop = lazy(() => import('./Pages/Shop'));
const ProductDetails = lazy(() => import('./Pages/ProductDetails'));
const Checkout = lazy(() => import('./Pages/Checkout'));
const OrderHistory = lazy(() => import('./Pages/OrderHistory'));
const Blog = lazy(() => import('./Pages/Blog'));
const Order = lazy(() => import('./Pages/Order'));
const Account = lazy(() => import('./Pages/Account'));
const Login = lazy(() => import('./Pages/Login'));
const OrderConfirmation = lazy(() => import('./Components/OrderConfirmation'));
const AdminDashboard = lazy(() => import('./Pages/AdminDashboard'));
const AdminAddProduct = lazy(() => import('./Pages/AdminAddProduct'));
const AdminProductsList = lazy(() => import('./Pages/AdminProductsList'));
const AdminEditProduct = lazy(() => import('./Pages/AdminEditProduct'));
const AdminPackagesList = lazy(() => import('./Pages/AdminPackagesList'));
const AdminAddPackage = lazy(() => import('./Pages/AdminAddPackage'));
const AdminEditPackage = lazy(() => import('./Pages/AdminEditPackage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
        <Routes>
          {/* Public routes with main layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="blog" element={<Blog />} />
            <Route path="cart" element={<ShoppingCart />} />
            <Route path="account" element={<Account />} />
            <Route path="login" element={<Login />} />
            <Route
              path="checkout"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="order-history" element={<OrderHistory />} />
            <Route path="order-confirmation" element={<Order />} />
            <Route path="products" element={<Shop />} />
            <Route path="product-details" element={<ProductDetails />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="orders/:orderId" element={<ProductDetails />} />
          </Route>

          {/* Admin routes: separate layout, admin-only */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="add-product" element={<AdminAddProduct />} />
            <Route path="products" element={<AdminProductsList />} />
            <Route path="products/:id/edit" element={<AdminEditProduct />} />
            <Route path="packages" element={<AdminPackagesList />} />
            <Route path="add-package" element={<AdminAddPackage />} />
            <Route path="packages/:id/edit" element={<AdminEditPackage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
