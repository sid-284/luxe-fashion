import Order from "../model/orderModel.js";
import User from "../model/userModel.js";
import razorpay from 'razorpay'
import dotenv from 'dotenv'
dotenv.config()
const currency = 'inr'

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// for User
export const placeOrder = async (req,res) => {

     try {
         const {items , amount , address} = req.body;
         const userId = req.userId;
         const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:'COD',
            payment:false,
            date: Date.now()
         }

         const newOrder = new Order(orderData)
         await newOrder.save()

         await User.findByIdAndUpdate(userId,{cartData:{}})

         return res.status(201).json({message:'Order Place'})
    } catch (error) {
        console.log(error)
        res.status(500).json({message:'Order Place error'})
    }
    
}


export const placeOrderRazorpay = async (req,res) => {
    try {
        
         const {items , amount , address} = req.body;
         const userId = req.userId;
         const orderData = {
            items,
            amount,
            userId,
            address,
            paymentMethod:'Razorpay',
            payment:false,
            date: Date.now()
         }

         const newOrder = new Order(orderData)
         await newOrder.save()

         const options = {
            amount: Math.round(amount * 100), // Ensure amount is in paise and is an integer
            currency: currency.toUpperCase(),
            receipt: newOrder._id.toString(),
            payment_capture: 1, // Auto capture payment
            notes: {
                order_id: newOrder._id.toString(),
                user_id: userId.toString()
            }
         }
         
         try {
            const razorpayOrder = await razorpayInstance.orders.create(options);
            res.status(200).json(razorpayOrder);
         } catch (razorpayError) {
            console.log('Razorpay order creation error:', razorpayError);
            res.status(500).json({ message: 'Failed to create payment order' });
         }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: error.message})
    }
}


export const verifyRazorpay = async (req,res) =>{
    try {
        const userId = req.userId
        const {razorpay_order_id} = req.body
        
        try {
            const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
            if(orderInfo.status === 'paid'){
                await Order.findByIdAndUpdate(orderInfo.receipt,{payment:true});
                await User.findByIdAndUpdate(userId , {cartData:{}})
                res.status(200).json({message:'Payment Successful'})
            }
            else{
                res.status(400).json({message:'Payment Failed'})
            }
        } catch (razorpayError) {
            console.log('Razorpay verification error:', razorpayError);
            res.status(500).json({ message: 'Payment verification failed' });
        }
    } catch (error) {
        console.log(error)
         res.status(500).json({message: error.message})
    }
}






export const userOrders = async (req,res) => {
      try {
        const userId = req.userId;
        const orders = await Order.find({userId})
        return res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"userOrders error"})
    }
    
}




//for Admin



    
export const allOrders = async (req,res) => {
    try {
        const orders = await Order.find({})
        res.status(200).json(orders)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:"adminAllOrders error"})
        
    }
    
}
    
export const updateStatus = async (req,res) => {
    
try {
    const {orderId , status} = req.body

    await Order.findByIdAndUpdate(orderId , { status })
    return res.status(201).json({message:'Status Updated'})
} catch (error) {
     return res.status(500).json({message:error.message
            })
}
}