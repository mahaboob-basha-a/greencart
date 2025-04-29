import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;
axios.defaults.withCredentials = true;
export const axiosReq = axios;

// load razor script
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};
 

export const fetchProducts = createAsyncThunk("getProducts",async()=>{
    const {data} = await axiosReq.get('/api/product/list')
    return data;
})

export const fetchSeller = createAsyncThunk('fetchSeller',async()=>{
    const {data} = await axiosReq.get('/api/seller/is-auth');
    return data;
})
// fetch user ,user data and cart items
export const fetchUser = createAsyncThunk('fetchUser',async()=>{
    const {data} = await axiosReq.get('/api/user/is-auth');
    return data;
})

export const appReducer = createSlice({
    name: "appReducer",
    initialState:{
        user: null,
        isSeller: false,
        showUserLogin: false,
        products:[],
        currency: import.meta.env.VITE_CURRENCY,
        cartItems: {},
        searchQuery: "",
        cartCount: 0,
        cartAmount: 0
    },
    reducers: {
        setUser:(state,action)=>{
            state.user = action.payload
        },
        setIsSeller:(state,action)=>{
            state.isSeller = action.payload;
        },
        setShowUserLogin:(state,action)=>{
            state.showUserLogin = action.payload;
        },
        addToCart:(state,action)=>{
            
            let itemId = action.payload.itemId;
            let cartData = {...state.cartItems};

            if(cartData[itemId]){
                cartData[itemId] += 1;
            }else{
                cartData[itemId] = 1;
            }

            state.cartItems = cartData;
        },
        updateCartItem: (state,action)=>{
            let itemId = action.payload.itemId;
            let cartData = {...state.cartItems}
            cartData[itemId] = action.payload.quantity;
            state.cartItems = cartData;
        },
        setCartItems:(state,action)=>{
            state.cartItems = action.payload
        },
        removeFromCart: (state,action)=>{
            let itemId = action.payload.itemId;
            
            let cartData = {...state.cartItems};
            if(cartData[itemId]){
                cartData[itemId] -= 1;
                if(cartData[itemId] === 0){
                    delete cartData[itemId];
                }
            }
            state.cartItems = cartData;
        },
        setSearchQuery:(state,action)=>{
            state.searchQuery = action.payload;
        },
        updateCartSummary: (state) => {
            let totalCount = 0;
            let totalAmount = 0;
        
            for (const itemId in state.cartItems) {
                const quantity = state.cartItems[itemId];
                const itemInfo = state.products.find(product => product._id === itemId);
        
                if (itemInfo && quantity > 0) {
                    totalCount += quantity;
                    totalAmount += itemInfo.offerPrice * quantity;
                }
            }
        
            state.cartCount = totalCount;
            state.cartAmount = Math.floor(totalAmount * 100) / 100;
        }
    },
    extraReducers: builder =>{
        // fetch products
        builder.addCase(fetchProducts.fulfilled,(state,action)=>{

            if(action.payload.success){
                state.products = action.payload.products;
            }else{
                state.products = [];
            }
            
        }).addCase(fetchProducts.rejected,(state,action)=>{
            state.products = [];
        });
        // fetch seller auth
        builder.addCase(fetchSeller.fulfilled,(state,action)=>{
            if(action.payload.success){
                state.isSeller = true;
            }else{
                state.isSeller = false;
            }
        }).addCase(fetchSeller.rejected,(state,action)=>{
            state.isSeller = false;
        })
        // fetch user auth
        builder.addCase(fetchUser.fulfilled,(state,action)=>{
            if(action.payload.success){
                state.user = action.payload.user;
                state.cartItems = action.payload.user.cartItems
            }else{
                state.user = null
            }
        }).addCase(fetchUser.rejected,(state,action)=>{
            state.user = null;
        })
    }
})

export const { setUser,setIsSeller,setShowUserLogin,addToCart,updateCartItem,removeFromCart,setSearchQuery,updateCartSummary,setCartItems } = appReducer.actions;
