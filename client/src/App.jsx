import React, { useEffect } from 'react'
import Home from './pages/Home';
import Cart from './pages/Cart';
import Login from './components/Login';
import MyOrders from './pages/MyOrders';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Orders from './pages/seller/Orders';
import AddAddress from './pages/AddAddress';
import AllProducts from './pages/AllProducts';
import toast, { Toaster } from 'react-hot-toast';
import AddProduct from './pages/seller/AddProduct';
import ProductDetails from './pages/ProductDetails';
import ProductList from './pages/seller/ProductList';
import ProductCategory from './pages/ProductCategory';
import { useDispatch, useSelector } from 'react-redux';
import SellerLayout from './pages/seller/SellerLayout';
import SellerLogin from './components/seller/SellerLogin';
import { Route, Routes, useLocation } from 'react-router-dom'
import { axiosReq, fetchProducts, fetchSeller, fetchUser, updateCartSummary } from './context/appReducer';

const App = () => {

  const isSellerPath = useLocation().pathname.includes("seller");
  const {user,showUserLogin,cartItems,isSeller} = useSelector(({store})=> (store));
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(fetchProducts());
    dispatch(fetchUser());
    dispatch(fetchSeller());
  },[])

  // update database cart items
  useEffect(()=>{
    dispatch(updateCartSummary());
    const updateCart = async()=>{
      try {
        const {data} = await axiosReq.post("/api/cart/update", {cartItems})
        if(!data.success){
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    if(user){
      updateCart()
    }

  },[cartItems])

  return (
    <div className='text-default min-h-screen text-gray-700 bg-white'>
      
      { isSellerPath ? null : <Navbar />}
      {showUserLogin ? <Login /> : null}
      
      <Toaster />
      
      <div className={`${ isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/products" element={<AllProducts />} />  
          <Route path="/add-address" element={<AddAddress />} />
          <Route path="/products/:category" element={<ProductCategory />} />  
          <Route path="/products/:category/:id" element={<ProductDetails />} />  
          <Route path='/seller' element={isSeller ? <SellerLayout /> : <SellerLogin />}>
            <Route index element={<AddProduct />} />
            <Route path='orders' element={isSeller ? <Orders /> : null} />
            <Route path='product-list' element={isSeller ? <ProductList /> : null} />
          </Route>
        </Routes>
      </div>
      {!isSellerPath && <Footer />}
    </div>
  )
}

export default App