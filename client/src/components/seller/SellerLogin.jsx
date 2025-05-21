import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'
import { axiosReq, setIsSeller } from '../../context/appReducer';

const SellerLogin = () => {

    const {isSeller} = useSelector(({store})=> store);
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onSubmitHandler = async (e)=>{
        try {
            e.preventDefault();
            const res = await axiosReq.post('/api/seller/login',{email,password})
            // prevent bypass attacks for admin login
            if(res.data.success && res.status === 200 && email === import.meta.env.VITE_SELLER_EMAIL && password === import.meta.env.VITE_SELLER_PASSWORD){
                toast.success(res.data.message)
                dispatch(setIsSeller(true));
                navigate("/seller");
            }else{
                toast.error(res.data.message);
            }
            
        } catch (error) {
            toast.error(error.message)
        }
    }

    useEffect(()=>{
        if(isSeller){
            navigate("/seller");
        }
    },[isSeller])
  return !isSeller && (
    <form onSubmit={onSubmitHandler} className='min-h-screen flex items-center text-sm text-gray-600'>

        <div className='flex flex-col gap-5 m-auto items-start p-8 py-12 min-w-80 sm:min-w-88 rounded-lg shadow-xl border border-gray-200'>
            <p className='text-2xl font-medium m-auto'>
                <span className='text-primary'>Seller </span>
                Login
            </p>
            <div className='w-full'>
                <p>Email</p>
                <input onChange={e=> setEmail(e.target.value)} value={email} type="email" placeholder='enter your email' className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary' required autoComplete='off' />
            </div>
            <div className='w-full'>
                <p>Password</p>
                <input onChange={e=>setPassword(e.target.value)} value={password} type="password" placeholder='enter your password' className='border border-gray-200 rounded w-full p-2 mt-1 outline-primary' required autoComplete='off' />
            </div>
            <button type='submit' className='bg-primary text-white w-full py-2 rounded-md cursor-pointer'>Login</button>
        </div>

    </form>
  )
}

export default SellerLogin