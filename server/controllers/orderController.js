import Order from "../models/order.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import Razorpay from 'razorpay';
import crypto from 'crypto';


// Place order COD : /api/order/cod
export const placeOrderCOD = async(req,res)=>{
    try {
        const {userId,items,address} = req.body;
        if(!address || items.length === 0){
            return res.json({success: false, message: "Invalid data"})
        }

        // calculate amount using items
        let amount = await items.reduce(async (acc,item)=>{
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        },0)

        // add tax charge (2%)
        amount += Math.floor(amount * 0.02);         

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD"
        })

        return res.json({success: true, message: "Order Placed Successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message});
    }
}
// Place order Razor : /api/order/razor

export const placeOrderRazor = async (req, res) => {
    try {
        const { userId, items, address } = req.body;

        if (!address || items.length === 0) {
            return res.json({ success: false, message: "Invalid data" });
        }

        let productData = [];

        // calculate amount using items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            });
            return (await acc) + product.offerPrice * item.quantity;
        }, 0);

        // add tax charge (2%)
        amount += Math.floor(amount * 0.02);

        // Razorpay initialize
        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        // create Razorpay order
        const options = {
            amount: amount * 100, // amount in paisa
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`, // better unique receipt
            notes: {
                userId: userId.toString()
            }
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        // Now create order in DB after Razorpay order is created
        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online",
            razorpayOrderId: razorpayOrder.id
        });

        return res.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            message: "Order Placed Successfully"
        });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


// verify order razor : /api/order/verify
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: "Invalid payment signature" });
        }

        // ✅ Signature matched, update order in DB
        const order = await Order.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            { isPaid: true, paymentId: razorpay_payment_id }, 
        );
        // clear user cart
        await User.findByIdAndUpdate(order.userId,{cartItems: {}})

        return res.json({ success: true, message: "Payment verified and order updated" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

// get orders by userid : /api/order/user
export const getUserOrders = async(req,res)=>{
    try {
        const {userId} = req.body;
        const orders = await Order.find({
            userId,
            $or: [{paymentType: "COD"},{isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1});
        res.json({success: true, orders})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message});
    }
}

// get all orders (for seller /adimin ): /api/order/seller
export const getAllOrders = async(req,res)=>{
    try {
        const orders = await Order.find({
            $or: [{paymentType: "COD"},{isPaid: true}]
        }).populate("items.product address").sort({createdAt: -1})
        res.json({success: true, orders})
    } catch (error) {
        console.log(error.message)
        res.json({success: false, message: error.message});
    }
}

