import React from "react";
import toast from "react-hot-toast";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../context/appReducer";

const ProductCard = ({product}) => {
    const navigate = useNavigate();
    const {currency,cartItems} = useSelector(({store})=>(store));

    const dispatch = useDispatch();

    return product && (
        <div onClick={()=> {navigate(`/products/${product.category.toLowerCase()}/${product._id}`); scrollTo(0,0)}} className="border border-gray-500/20 rounded-md md:px-4 px-3 py-2 bg-white max-w-56 w-full">
            <div className="group cursor-pointer flex items-center justify-center px-2">
                <img className="group-hover:scale-105 transition max-w-26 md:max-w-36" src={product.image[0]} alt={product.name} />
            </div>
            <div className="text-gray-500/60 text-sm">
                <p>{product.category}</p>
                <p className="text-gray-700 font-medium text-lg truncate w-full">{product.name}</p>
                <div className="flex items-center gap-0.5">
                    {Array(5).fill('').map((_, i) => (
                            <img key={i} className="md:w-3.5 w-3" src={i < 4 ? assets.star_icon : assets.star_dull_icon} />
                    ))}
                    <p>(4)</p>
                </div>
                <div className="flex items-end justify-between mt-3">
                    <p className="md:text-xl text-base font-medium text-primary">
                        {currency}{product.offerPrice}{" "} <span className="text-gray-500/60 md:text-sm text-xs line-through">{currency}{product.price}</span>
                    </p>
                    <div onClick={e=>{e.stopPropagation();}} className="text-primary">
                        {!cartItems[product._id] ? (
                            <button className="flex items-center justify-center gap-1 bg-primary/10 border border-primary/40 md:w-[80px] w-[64px] h-[34px] rounded font-medium cursor-pointer" onClick={() => {
                                dispatch(addToCart({itemId:product._id})) 
                                toast.success("Added to Cart")
                                }} >
                                <img src={assets.cart_icon} alt="cart_icon" />
                                Add
                            </button>
                        ) : (
                            <div className="flex items-center justify-center gap-2 md:w-20 w-16 h-[34px] bg-primary/25 rounded select-none">
                                <button onClick={() =>{
                                    dispatch(removeFromCart({itemId:product._id}))
                                    toast.success("Removed from Cart")
                                    } } className="cursor-pointer text-md px-2 h-full" >
                                    -
                                </button>
                                <span className="w-5 text-center">{cartItems[product._id]}</span>
                                <button onClick={() =>{
                                    dispatch(addToCart({itemId:product._id}))
                                    toast.success("Added to Cart")
                                    }} className="cursor-pointer text-md px-2 h-full" >
                                    +
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(ProductCard);