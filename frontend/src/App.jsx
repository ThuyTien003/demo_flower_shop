import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Chatbot from '@/components/Chatbot'
import Home from '@/pages/Home'
import Products from '@/pages/Products'
import ProductDetail from '@/pages/ProductDetail'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Profile from '@/pages/Profile'
import Wishlist from '@/pages/Wishlist'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import OrderDetail from '@/pages/OrderDetail'
import PaymentCallback from '@/pages/PaymentCallback'
import Blog from '@/pages/Blog'
import BlogDetail from '@/pages/BlogDetail'
import Contact from '@/pages/Contact'
import PaymentPolicy from '@/pages/policy/PaymentPolicy'
import ShippingPolicy from '@/pages/policy/ShippingPolicy'
import PrivacyPolicy from '@/pages/policy/PrivacyPolicy'
import WarrantyPolicy from '@/pages/policy/WarrantyPolicy'
import TermsOfUse from '@/pages/policy/TermsOfUse'
import AdminRoute from '@/components/AdminRoute'
import AdminLayout from '@/pages/admin/AdminLayout'
import Dashboard from '@/pages/admin/Dashboard'
import Logs from '@/pages/admin/Logs'
import ProductHistory from '@/pages/admin/ProductHistory'
import Sliders from '@/pages/admin/Sliders'
import Users from '@/pages/admin/Users'
import Categories from '@/pages/admin/Categories'
import AdminProducts from '@/pages/admin/AdminProducts'
import AdminOrders from '@/pages/admin/AdminOrders'

export default function App() {
  return (
    <div>
      <Navbar />
      <Chatbot />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/payment/callback" element={<PaymentCallback />} />
          <Route path="/news" element={<Blog />} />
          <Route path="/news/:id" element={<BlogDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/policies/payment" element={<PaymentPolicy />} />
          <Route path="/policies/shipping" element={<ShippingPolicy />} />
          <Route path="/policies/privacy" element={<PrivacyPolicy />} />
          <Route path="/policies/warranty" element={<WarrantyPolicy />} />
          <Route path="/policies/terms" element={<TermsOfUse />} />

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="categories" element={<Categories />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="logs" element={<Logs />} />
              <Route path="product-history" element={<ProductHistory />} />
              <Route path="sliders" element={<Sliders />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
