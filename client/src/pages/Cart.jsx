import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { axiosReq, loadRazorpayScript, removeFromCart, setCartItems, updateCartItem } from "../context/appReducer";
import Loader from "../components/Loader";

const Cart = () => {
    const [showAddress, setShowAddress] = useState(false)
    const [cartArray,setCartArray] = useState([])
    const [addresses,setAddresses] = useState([])
    const [selectedAddress,setSelectedAddress] = useState(null)
    const [paymentOption,setPaymentOption] = useState("COD")
    
    const {products,currency,cartItems,cartCount,cartAmount,user} = useSelector(({store})=>(store))
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getCart = ()=>{
        let tempArray = []
        for(const key in cartItems){
            const product = products.find(item=> item._id === key)
            tempArray.push({...product,quantity: cartItems[key]})
        }
        setCartArray(tempArray);
    }

    const getUserAddress = async()=>{
        try {
            const {data} = await axiosReq.get('/api/address/get');
            if(data.success){
                setAddresses(data.addresses)
                if(data.addresses.length > 0){
                    setSelectedAddress(data.addresses[0])
                }
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const placeOrder = async()=>{
        try {
            if(!user){
                return toast.error("Please login to place order");
            }
            
            if(!selectedAddress){
                return toast.error("Please select an address");
            }

            // place order with COD
            if(paymentOption === 'COD'){
                const {data} = await axiosReq.post('/api/order/cod',{
                    userId: user._id,
                    items: cartArray.map(item=> ({product: item._id, quantity: item.quantity})),
                    address: selectedAddress._id
                })

                if(data.success){
                    toast.success(data.message)
                    dispatch(setCartItems({}))
                    navigate('/my-orders')
                }else{
                    toast.error(data.message)
                }
            }else {
                const { data } = await axiosReq.post('/api/order/razor', {
                    userId: user._id,
                    items: cartArray.map(item => ({ product: item._id, quantity: item.quantity })),
                    address: selectedAddress._id
                });
            
                if (data.success) {
                    // 1. Load Razorpay script
                    const res = await loadRazorpayScript();
                    if (!res) {
                        toast.error('Razorpay SDK failed to load. Are you online?');
                        return;
                    }
            
                    // 2. Open Razorpay payment popup
                    const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                        amount: data.amount,  // from backend (in paise)
                        currency: data.currency, // "INR"
                        name: "GreenCart",
                        description: "Order Payment",
                        order_id: data.orderId,  // from backend (razorpay order id)
                        handler: async function (response) {
                            // Payment successful!
                             // 1. Send payment data to backend to verify and update order
                             try {
                                 const verifyRes = await axiosReq.post('/api/order/verify', {
                                     razorpay_order_id: response.razorpay_order_id,
                                     razorpay_payment_id: response.razorpay_payment_id,
                                     razorpay_signature: response.razorpay_signature
                                 });
     
                                 if (verifyRes.data.success) {
                                     window.location.href = "/my-orders";
                                 } else {
                                     toast.error('Payment verification failed!');
                                 }
                             } catch (error) {
                                toast.error(error.message)
                             }
                        },
                        prefill: {
                            name: user.name,
                            email: user.email,
                            contact: user.phone,
                        },
                        theme: {
                            color: "#3399cc"
                        }
                    };
            
                    const paymentObject = new window.Razorpay(options);
                    paymentObject.open();
                } else {
                    toast.error(data.message);
                }
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(products.length > 0 && cartItems){
            getCart();
        }
    },[products,cartItems])
    useEffect(()=>{
        if(user){
            getUserAddress();
        }
    },[user])

    return (products.length > 0 && cartItems ) ? (
        <div className="flex flex-col md:flex-row mt-16">
            <div className='flex-1 max-w-4xl'>
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart <span className="text-sm text-primary">{cartCount} Items</span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div key={index} className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3">
                        <div className="flex items-center md:gap-6 gap-3">
                            <div onClick={()=>{
                                navigate(`/products/${product.category.toLowerCase()}/${product._id}`);
                                scrollTo(0,0);
                            }} className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded">
                                <img className="max-w-full h-full object-cover" src={product.image[0]} alt={product.name} />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">{product.name}</p>
                                <div className="font-normal text-gray-500/70">
                                    <p>Weight: <span>{product.weight || "N/A"}</span></p>
                                    <div className='flex items-center'>
                                        <p>Qty:</p>
                                        <select onChange={e=>{
                                            dispatch(updateCartItem({itemId:product._id,quantity:Number(e.target.value)}));
                                            toast.success("Cart updated")
                                        }} value={cartItems[product._id]} className='outline-none'>
                                            {Array(cartItems[product._id] > 9 ? cartItems[product._id] : 9 ).fill('').map((_, index) => (
                                                <option key={index} value={index + 1}>{index + 1}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">{currency}{product.offerPrice * product.quantity}</p>
                        <button onClick={()=> {
                            dispatch(removeFromCart({itemId: product._id}));
                            toast.success("Removed from cart")
                        }} className="cursor-pointer mx-auto">
                            <img src={assets.remove_icon} alt="remove" className="inline-block w-6 h-6" />
                        </button>
                    </div>)
                )}

                <button onClick={()=>{
                    navigate("/products");
                    scrollTo(0,0);
                }} className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium">
                    <img src={assets.arrow_right_icon_colored} alt="arrow" className="group-hover:-translate-x-1 transition" />
                    Continue Shopping
                </button>

            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70">
                <h2 className="text-xl md:text-xl font-medium">Order Summary</h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">Delivery Address</p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500">{ selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}` :"No address found"}</p>
                        <button onClick={() => setShowAddress(!showAddress)} className="text-primary hover:underline cursor-pointer">
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-12 py-1 bg-white border border-gray-300 text-sm w-full">
                                {addresses.map((address,index)=>(
                                    <p key={index} onClick={() => {
                                        setSelectedAddress(address);
                                        setShowAddress(false);
                                        }} className="text-gray-500 p-2 hover:bg-gray-100">
                                    {address.street},{address.state}, {address.country}
                                </p>
                                ))}
                                <p onClick={() => navigate("/add-address")} className="text-primary text-center cursor-pointer p-2 hover:bg-indigo-500/10">
                                    Add address
                                </p>
                            </div>
                        )}
                    </div>

                    <p className="text-sm font-medium uppercase mt-6">Payment Method</p>

                    <select onChange={e=> setPaymentOption(e.target.value)} className="w-full border border-gray-300 bg-white px-3 py-2 mt-2 outline-none">
                        <option value="COD">Cash On Delivery</option>
                        <option value="Online">Online Payment</option>
                    </select>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span><span>{currency}{cartAmount}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span><span className="text-green-600">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span><span>{currency}{cartAmount * 2/100}</span>
                    </p>
                    <p className="flex justify-between text-lg font-medium mt-3">
                        <span>Total Amount:</span><span>{currency}{cartAmount + cartAmount * 2/100}</span>
                    </p>
                </div>

                <button onClick={placeOrder} className="w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition">
                    {paymentOption === "COD" ? "Place Order" : "Proceed to Checkout"}
                </button>
            </div>
        </div>
    ) : <Loader />
}

export default Cart;