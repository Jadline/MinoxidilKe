import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import './App.css';
import Layout from './Components/Layout';
import ProtectedRoute from './Pages/ProtectedRoute';

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

function App() {
  return (
    <BrowserRouter>
      <Layout>
        {/* Suspense wrapper shows fallback while lazy components load */}
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='about' element={<About />} />
            <Route path='contact' element={<Contact />} />
            <Route path='blog' element={<Blog />} />
            <Route path='cart' element={<ShoppingCart />} />
            <Route path='account' element={<Account />} />
            <Route path='login' element={<Login />} />
            <Route
              path='checkout'
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path='order-history' element={<OrderHistory />} />
            <Route path='order-confirmation' element={<Order />} />
            <Route path='products' element={<Shop />} />
            <Route path='product-details' element={<ProductDetails />} />
            <Route path='orders' element={<OrderHistory />} />
            <Route path='orders/:orderId' element={<ProductDetails />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
