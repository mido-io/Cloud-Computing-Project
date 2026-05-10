// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Contexts
import { CartProvider } from "./pages/contexts/CartContext"; // ✅ import CartProvider

// common components
import Home from "./pages/Home";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ContactAndFeedback from "./pages/ContactAndFeedback";

// auth components
import AuthLogin from "./pages/auth/AuthLogin";
import AuthRegister from "./pages/auth/AuthRegister";
import CustomerProfile from "./pages/auth/CustomerProfile";

// payment management
import Checkout from "./pages/payment/Checkout";

// order management
import OrderHome from "./pages/orderManagement/OrderHome";
import Orders from "./pages/orderManagement/Orders";
import OrderForm from "./components/OrderForm";
import UpdateOrder from "./components/UpdateOrder";  // Import UpdateOrder page
import DeleteOrder from "./components/DeleteOrder";  // Import DeleteOrder page
import OrderDetails from "./components/OrderDetails";

// customer management
import CustomerHome from "./pages/customer/customerHome";
import RestaurentDetails from "./pages/customer/customerHome";
import FoodItemList from "./pages/customer/foodItemList";
import AddToCartPage from "./pages/customer/AddToCartPage";

// restaurant management
import SuperAdminRegister from './pages/restaurant/components/SuperAdminRegister';
import SuperAdminLogin from './pages/restaurant/components/SuperAdminLogin';
import SuperAdminDashboard from './pages/restaurant/pages/SuperAdminDashboard';
import RestaurantRegister from './pages/restaurant/components/RestaurantRegister';
import RestaurantLogin from './pages/restaurant/components/RestaurantLogin';
import RestaurantDashboard from './pages/restaurant/pages/RestaurantDashboard';
import LoginHub from './pages/LoginHub';

// delivery management

function App() {
  const [orders, setOrders] = useState([]);

  const addOrder = (newOrder) => {
    setOrders((prevOrders) => [...prevOrders, newOrder]);
  };

  return (
    <CartProvider> {/* ✅ Wrap everything inside CartProvider */}
      <Router>
        <Routes>
          {/* common routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/contact" element={<ContactAndFeedback />} />

          {/* auth routes */}
          <Route path="/portals" element={<LoginHub />} />
          <Route path="/auth/login" element={<AuthLogin />} />
          <Route path="/auth/register" element={<AuthRegister />} />
          <Route path="/customer/profile" element={<CustomerProfile />} />

          {/* payment management */}
          <Route path="/checkout" element={<Checkout />} />

          {/* order management */}
          <Route path="/orders" element={<OrderHome orders={OrderHome} />} />
          <Route path="/orders/new" element={<OrderForm addOrder={addOrder} />} />
          <Route path="/orders/edit/:id" element={<UpdateOrder addOrder={addOrder} />} />
          <Route path="/orders/delete/:id" element={<DeleteOrder />} />
          <Route path="/orders/details/:id" element={<OrderDetails />} />

          {/* customer dashboard */}
          <Route path="/customer/home" element={<CustomerHome />} />
          <Route path="/customer/restaurant/:id" element={<RestaurentDetails />} />
          <Route path="/customer/restaurant/:restaurantId/foods" element={<FoodItemList />} />
          <Route path="/customer/cart" element={<AddToCartPage />} />

          {/* Redirect missing routes to sensible defaults */}
          <Route path="/restaurants" element={<Navigate to="/customer/home" replace />} />
          <Route path="/wallet" element={<Navigate to="/customer/profile" replace />} />
          <Route path="/faq" element={<Navigate to="/contact" replace />} />
          <Route path="/add-restaurant" element={<Navigate to="/restaurant/register" replace />} />
          <Route path="/signup-delivery" element={<Navigate to="/auth/register" replace />} />
          <Route path="/menu" element={<Navigate to="/customer/home" replace />} />

          {/* restaurant management */}
          <Route path="/superadmin/register" element={<SuperAdminRegister />} />
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/restaurant/register" element={<RestaurantRegister />} />
          <Route path="/restaurant/login" element={<RestaurantLogin />} />
          <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />

          {/* delivery management */}

        </Routes>
      </Router>
    </CartProvider>

    //     <Router>
    //       <Routes>
    //         // common routes
    //         <Route path="/" element={<Home />} />
    //         <Route path="/about" element={<About />} />
    //         <Route path="/privacy" element={<PrivacyPolicy />} />
    //         <Route path="/contact" element={<ContactAndFeedback />} />

    //         // auth routes
    //         <Route path="/auth/login" element={<AuthLogin />} />
    // +       <Route path="/auth/register" element={<AuthRegister />} />
    //         <Route path="/customer/profile" element={<CustomerProfile />} />

    //         // payment management
    //         <Route path="/checkout" element={<Checkout />} />

    //         // order management
    //         <Route path="/orders" element={<OrderHome orders={OrderHome} />} />
    //         <Route path="/orders/new" element={<OrderForm addOrder={addOrder} />} />
    //         <Route path="/orders/edit/:id" element={<UpdateOrder addOrder={addOrder} />} />
    //         <Route path="/orders/delete/:id" element={<DeleteOrder />} />
    //         <Route path="/orders/details/:id" element={<OrderDetails />} />

    //         // restaurant management
    //         <Route path="/superadmin/register" element={<SuperAdminRegister />} />
    //         <Route path="/superadmin/login" element={<SuperAdminLogin />} />
    //         <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
    //         <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
    //         <Route path="/restaurant/register" element={<RestaurantRegister />} />
    //         <Route path="/restaurant/login" element={<RestaurantLogin />} />
    //         <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
    //         <Route path="/restaurant/home" element={<IndexPage />} />

    //         // delivery management

    //       </Routes>
    //     </Router>
  );
}

export default App;
