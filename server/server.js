import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import connectDb from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import sellerRouter from "./routes/sellerRoute.js";
import connectCloudinary from "./config/cloudinary.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import addressRouter from "./routes/addressRoute.js";
import orderRouter from "./routes/orderRoute.js";
import helmet from "helmet";
import "dotenv/config"

const app = express();
const port = process.env.PORT || 4000;

await connectDb();
await connectCloudinary();

// Allow multiple origins
const allowedOrigins = ["http://localhost:5173", "https://greencart-inky.vercel.app"]

// Middleware configuration
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowedOrigins, credentials: true}))

app.get('/',(req,res)=>{
    res.json({message:"Api is working"})
})

app.use('/api/user',userRouter)
app.use('/api/seller',sellerRouter)
app.use('/api/product',productRouter)
app.use('/api/cart',cartRouter)
app.use('/api/address',addressRouter)
app.use('/api/order',orderRouter)


app.listen(port,()=>console.log(`Server is running on http://localhost:${port}`))