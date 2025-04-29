import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { axiosReq, setSearchQuery, setShowUserLogin, setUser } from "../context/appReducer";

const Navbar = () => {
    const [open, setOpen] = useState(false);
    const {user,searchQuery,cartCount} = useSelector(({store})=> store);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logout = async ()=>{
        dispatch(setUser(null))
        navigate('/')
        try {
            const {data} = await axiosReq.post('/api/user/logout')
            if(data.success){
                toast.success(data.message)
                setOpen(false)
                dispatch(setUser(null))
                navigate('/')
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleSearchQuery = e =>{
        dispatch(setSearchQuery(e.target.value))
    }

    useEffect(()=>{
        if(searchQuery.length > 0){
            navigate("/products")
        }
    },[searchQuery])

    return (
        <nav className="flex items-center justify-between px-6 md:px-16 lg:px-24 xl:px-32 py-4 border-b border-gray-300 bg-white relative transition-all z-10">

            <NavLink to="/" onClick={()=> setOpen(false)}>
                <img className="h-9" src={assets.logo} alt="logo" />
            </NavLink>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
                <NavLink className="text-xs border py-1 px-2 rounded-full border-gray-300 text-gray-500" to="/seller">Seller Dashboard</NavLink>
                <NavLink to="/">Home</NavLink>
                <NavLink to="/products">All Product</NavLink>

                <div className="hidden lg:flex items-center text-sm gap-2 border border-gray-300 px-3 rounded-full">
                    <input onChange={handleSearchQuery} className="py-1.5 w-full bg-transparent outline-none placeholder-gray-500" type="text" placeholder="Search products" />
                    <img src={assets.search_icon} alt="Search" className="w-4 h-4" />
                </div>

                <div onClick={()=> {setOpen(false); navigate("/cart");}} className="relative cursor-pointer">
                    <img src={assets.nav_cart_icon} alt="cart" className="w-6 opacity-80" />
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{cartCount}</button>
                </div>

                {!user ? ( <button onClick={()=> dispatch(setShowUserLogin(true))} className="cursor-pointer px-8 py-2 bg-primary hover:bg-primary-dull transition text-white rounded-full">
                    Login
                </button>) : (
                    <div className="relative group">
                        <img src={assets.profile_icon} className="w-10" alt="" />
                        <ul className="hidden group-hover:block absolute top-10 right-0 bg-white shadow border border-gray-200 py-2.5 w-30 rounded-md text-sm z-40">
                            <li onClick={()=> navigate("my-orders")} className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer">My Orders</li>
                            <li onClick={logout} className="p-1.5 pl-3 hover:bg-primary/10 cursor-pointer">Logout</li>
                        </ul>
                    </div>
                )}
            </div>
            {/* mobile */}
            <div className="flex items-center gap-6 md:hidden">
                <div onClick={()=> {setOpen(false); navigate("/cart");}} className="relative cursor-pointer">
                    <img src={assets.nav_cart_icon} alt="cart" className="w-6 opacity-80" />
                    <button className="absolute -top-2 -right-3 text-xs text-white bg-primary w-[18px] h-[18px] rounded-full">{cartCount}</button>
                </div>
                <button onClick={() => open ? setOpen(false) : setOpen(true)} aria-label="Menu">
                {/* Menu Icon */}
                    <img src={assets.menu_icon} alt="menu" />
                </button>
            </div>

            {/* Mobile Menu */}
            {open && 
            <div className={`${open ? 'flex' : 'hidden'} absolute top-[60px] left-0 w-full bg-white shadow-md py-4 flex-col items-start gap-2 px-5 text-lg md:hidden`}>
                <NavLink to="/" onClick={()=> setOpen(false)}>Home</NavLink>
                <NavLink to="/products" onClick={()=> setOpen(false)}>All Product</NavLink>
                {user && 
                <NavLink to="/my-orders" onClick={()=> setOpen(false)}>My Orders</NavLink>
            }
            <NavLink to="/" onClick={()=> setOpen(false)}>Contact</NavLink>

            {!user ? (
                <button onClick={()=>{
                    setOpen(false)
                    dispatch(setShowUserLogin(true))
                }} className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
                Login
            </button>
            ) : (
                <button onClick={logout} className="cursor-pointer px-6 py-2 mt-2 bg-primary hover:bg-primary-dull transition text-white rounded-full text-sm">
                    Logout
                </button>
                )}
            </div>
            }

        </nav>
    )
}

export default Navbar;