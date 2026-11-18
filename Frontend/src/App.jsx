import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home/Home'
import Seller_Login from "./Seller/Seller_Login";
import Seller_Register from "./Seller/Seller_Register";
import Seller_Profile from "./Seller/Seller_Profile";
import Seller_StoreSetup from "./Seller/Seller_StoreSetup";
import Seller_Products from "./Seller/Seller_Products";
import Seller_Home from "./Seller/Seller_Home";
import Seller_Orders from "./Seller/Seller_Orders";
import Seller_Inventory from "./Seller/Seller_Inventory";
import Seller_Reports from "./Seller/Seller_Reports";
import Seller_Settings from "./Seller/Seller_Settings";
import Seller_AddProduct from "./Seller/Seller_AddProduct";
import Seller_EditProduct from "./Seller/Seller_EditProduct";
import Customer_Home from './Customer/Customer_Home'
import View_all_Category_product from './Customer/View_all_Category_product'
import Category_Product_type from './Customer/Category_Product_types'
import Product_detail from './Customer/Product_detail'
import Add_to_card from './Customer/Add_to_card';
import Checkout from './Customer/Checkout';
import Orders from './Customer/Orders';
import Profile from './Customer/Profile';
import Wishlist from './Customer/Wishlist';
import Wallet from './Customer/Wallet';
import Wallet_History from './Customer/Wallet_History';
import Customer_Rewards from './Customer/Customer_Rewards';
import Customer_Reviews from './Customer/Customer_Reviews';
import Customer_Offers from './Customer/Customer_Offers';
import Customer_Movie_Tickets from './Customer/Customer_Movie_Tickets';
import Customer_Movie_Details from './Customer/Customer_Movie_Details';
import Customer_Movie_Booking from './Customer/Customer_Movie_Booking';
// import Customer_Movie_Food from './Customer/Customer_Movie_Food';
import Customer_Movie_Payment from './Customer/Customer_Movie_Payment';
import Customer_Movie_Showtimes from './Customer/Customer_Movie_Showtimes';
import Customer_Movie_Confirmation from './Customer/Customer_Movie_Confirmation';
import Customer_My_Tickets from './Customer/Customer_My_Tickets';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/customer" element={<Customer_Home />} />

      {/* ---- seller pages Roters ---*/}

      <Route path="/seller" element={<Navigate to="/seller/login" replace />} />
      <Route path="/seller/login" element={<Seller_Login />} />
      <Route path="/seller/register" element={<Seller_Register />} />
      <Route path="/seller/profile" element={<Seller_Profile />} />
      <Route path="/seller/store-setup" element={<Seller_StoreSetup />} />
      <Route path="/seller/dashboard" element={<Seller_Home />} />
      <Route path="/seller/home" element={<Navigate to="/seller/dashboard" replace />} />
      <Route path="/seller/products" element={<Seller_Products />} />
      <Route path="/seller/add-product" element={<Seller_AddProduct />} />
      <Route path="/seller/products/edit/:id" element={<Seller_EditProduct />} />
      <Route path="/seller/orders" element={<Seller_Orders />} />
      <Route path="/seller/inventory" element={<Seller_Inventory />} />
      <Route path="/seller/reports" element={<Seller_Reports />} />
      <Route path="/seller/settings" element={<Seller_Settings />} />

      {/* --- customer pages Roters -----*/}
      <Route path="/" element={<Home />} />
      <Route path="/customer" element={<Customer_Home />} />
      <Route path="/seller" element={<Seller_Home />} />
      <Route path="/Category_product" element={<View_all_Category_product />} />
      <Route path="/category/:slug" element={< Category_Product_type />} />
      <Route path="/category/:slug/product/:id" element={<Product_detail />} />
      <Route path="/Add_to_card" element={<Add_to_card />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/wallet/history" element={<Wallet_History />} />
      <Route
        path="/customer/rewards"
        element={<Customer_Rewards />}
      />
      <Route
        path="/customer/reviews"
        element={<Customer_Reviews />}
      />
      <Route
        path="/customer/offers"
        element={<Customer_Offers />}
      />
      <Route
        path="/customer/movies"
        element={<Customer_Movie_Tickets />}
      />
      <Route
        path="/customer/movie/:id"
        element={<Customer_Movie_Details />}
      />
      <Route
        path="/customer/movie/:id/showtimes"
        element={<Customer_Movie_Showtimes />}
      />

      <Route
        path="/customer/movie/:id/booking"
        element={<Customer_Movie_Booking />}
      />
      {/* <Route
        path="/customer/movie/:id/food"
        element={<Customer_Movie_Food />}
      /> */}
      <Route
        path="/customer/movie/:id/payment"
        element={<Customer_Movie_Payment />}
      />
      <Route
        path="/customer/movie/:id/confirmation"
        element={<Customer_Movie_Confirmation />}
      />
      <Route
        path="/customer/my-tickets"
        element={<Customer_My_Tickets />}
      />



    </Routes>

  )
}

export default App







