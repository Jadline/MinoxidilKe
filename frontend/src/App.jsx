import { BrowserRouter,Routes,Route } from 'react-router-dom'
import './App.css'
import Home from './Pages/Home'
import About from './Pages/About'
import Contact from './Pages/Contact'
import ShoppingCart from './Pages/Cart'
import Shop from './Pages/Shop'
import ProductDetails from './Pages/ProductDetails'
import Checkout from './Pages/Checkout'
import OrderDetails from './Pages/OrderHistory'
import Blog from './Pages/Blog'
import OrderConfirmation from './Components/OrderConfirmation'
import Order from './Pages/Order'
import Layout from './Components/Layout'
import Account from './Pages/Account'
import Login from './Pages/Login'

import OrderHistory from './Pages/OrderHistory'
import ProtectedRoute from './Pages/ProtectedRoute'


function App() {
  

 
  return (
    <>
   
    <BrowserRouter>
    <Layout>
        <Routes>

      <Route path='/' element={<Home/>} />
      <Route path='about' element={<About/>}/>
      <Route path='contact' element={<Contact/>}/>
      <Route path='blog' element={<Blog/>}/>
      <Route path='cart' element={<ShoppingCart/>}/>
      <Route path='account' element={<Account/>}/>
      <Route path='login' element={<Login/>}/>
      <Route
       path='checkout'
      element={<ProtectedRoute>
        <Checkout/>
      </ProtectedRoute>}/>
      <Route path='order-history' element={<OrderHistory/>}/>
      <Route
       path='order-confirmation' 
      element={<Order />}/>
      <Route 
      path='products'
       element={<Shop/>}/>
      
     
      <Route
       path='product-details' 
      element={<ProductDetails/>}/>
      <Route path='orders' element={<OrderHistory/>}/>
      <Route path="orders/:orderId" element={<ProductDetails/>} />
    </Routes>
    </Layout>
      
    </BrowserRouter>
    </>
  )
}

export default App
