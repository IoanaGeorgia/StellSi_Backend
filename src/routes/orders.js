import express from 'express';
import { Product, Order, OrderItem, Voucher } from '../models/index.js'; 

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { userId, totalSum, billingAddress, shippingAddress, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Coșul de cumpărături este gol.' });
        }

        const orderItemsToCreate = [];

        for (const item of items) {
            const star = item.starDetails || {};

            const [product] = await Product.findOrCreate({
                where: { name: star.name || 'Stea Unică' },
                defaults: {
                    name: star.name || 'Stea Unică',
                    description: `Steaua ${star.name || ''}`, 
                    price: item.price || 20000,
                    stock: 1,
                    constellation: star.constellation || null,
                    rightAscension: star.right_ascension || null,
                    declination: star.declination || null,
                    apparentMagnitude: star.apparent_magnitude || null,
                    absoluteMagnitude: star.absolute_magnitude || null,
                    distanceLightYear: star.distance_light_year || null,
                    spectralClass: star.spectral_class || null
                }
            });

            const qty = item.quantity || 1;
            const itemPrice = item.price || product.price || 20000;

            orderItemsToCreate.push({
                productId: product.id,
                quantity: qty,
                priceAtPurchase: itemPrice
            });
        }

        const newOrder = await Order.create({
            userId: userId || null,
            totalSum: Number(totalSum),
            shippingAddress: typeof shippingAddress === 'object' ? JSON.stringify(shippingAddress) : (shippingAddress || ''),
            billingAddress: typeof billingAddress === 'object' ? JSON.stringify(billingAddress) : (billingAddress || ''),
            status: 'pending'
        });

        const itemsWithOrderId = orderItemsToCreate.map(item => ({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price:item.priceAtPurchase
        }));


        await OrderItem.bulkCreate(itemsWithOrderId);

        return res.status(201).json({
            message: 'Comanda a fost plasată cu succes!',
            orderId: newOrder.id,
            totalAmount: newOrder.totalAmount
        });

    } catch (error) {
        
        return res.status(500).json({ 
            error: "Internal Server Error"
        });
    }
});


router.post('/voucher', async (req, res)=>{
    try{
        const {voucherCode} = req.body

        if(!voucherCode){
            return res.status(400).json({error:"Voucher is missing"})
        }

         if (!req.session || !req.session.user) {
            return res.status(401).json({ message: "Neautorizat. Te rugăm să te autentifici." });
        }

        const voucher = await Voucher.findOne({where:{code: voucherCode}})
        if(!voucher){
            return res.status(200).json({error:"No voucher found!", code:"NO_VOUCHER"})
        }

        if(!voucher.active){
            return res.status(400).json({error:"Voucher is not active"})
        }

        const now = new Date();
        const expiry = new Date(voucher.expirationDate);

        if(!(expiry >= now)){
            return res.status(200).json({error:"Voucher has expired!", code:"VOUCHER_EXPIRED"})
        }
        
        return res.status(200).json({message:"Voucher successfully returned", data:voucher})


    }catch(error){
        return res.status(400).json({error:"Internal Server Error"})
    }
})
export default router;