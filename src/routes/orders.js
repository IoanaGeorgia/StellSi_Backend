import express from 'express';
import { sequelize } from '../config/db.js';
import { Product, Order, OrderItem, Voucher, UserVoucher } from '../models/index.js'; 

const router = express.Router();


router.post("/", async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const sessionUserId = req.session?.user?.id || null;
        
        const { totalSum, billingAddress, shippingAddress, items, voucherId } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Coșul de cumpărături este gol.' });
        }

        let calculatedTotal = Number(totalSum);
        let appliedVoucher = null;

        if (voucherId) {
            appliedVoucher = await Voucher.findByPk(voucherId, { transaction });

            if (!appliedVoucher) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Voucher-ul introdus nu există.' });
            }

            if (!appliedVoucher.active) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Voucher-ul introdus nu mai este activ.' });
            }

            if (appliedVoucher.expirationDate && new Date(appliedVoucher.expirationDate) < new Date()) {
                await transaction.rollback();
                return res.status(400).json({ error: 'Voucher-ul introdus a expirat.' });
            }

            if (appliedVoucher.percent) {
                const discount = (calculatedTotal * Number(appliedVoucher.sum)) / 100;
                calculatedTotal = calculatedTotal - discount;
            } else {
                calculatedTotal = calculatedTotal - Number(appliedVoucher.sum);
            }

            calculatedTotal = Math.max(0, calculatedTotal);
        }

        const orderItemsToCreate = [];

        for (const item of items) {
            const star = item.starDetails || {};

            const [product] = await Product.findOrCreate({
                where: { name: star.name || item.name || 'Stea Unică' },
                defaults: {
                    name: star.name || item.name || 'Stea Unică',
                    description: `Steaua ${star.name || item.name || ''}`, 
                    price: item.price || 20000,
                    stock: 1,
                    constellation: star.constellation || null,
                    rightAscension: star.right_ascension || null,
                    declination: star.declination || null,
                    apparentMagnitude: star.apparent_magnitude || null,
                    absoluteMagnitude: star.absolute_magnitude || null,
                    distanceLightYear: star.distance_light_year || null,
                    spectralClass: star.spectral_class || null
                },
                transaction
            });

            const qty = item.quantity || 1;
            const itemPrice = item.price || product.price || 20000;

            orderItemsToCreate.push({
                productId: product.id,
                quantity: qty,
                priceAtPurchase: itemPrice
            });
        }

        const formatAddress = (addr) => {
            if (!addr) return '';
            return typeof addr === 'object' ? JSON.stringify(addr) : String(addr);
        };

        const newOrder = await Order.create({
            userId: sessionUserId,
            totalSum: calculatedTotal,
            shippingAddress: formatAddress(shippingAddress),
            billingAddress: formatAddress(billingAddress),
            status: 'pending'
        }, { transaction });

        const itemsWithOrderId = orderItemsToCreate.map(item => ({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.priceAtPurchase
        }));

        await OrderItem.bulkCreate(itemsWithOrderId, { transaction });

        if (appliedVoucher && sessionUserId) {
            await UserVoucher.create({
                userId: sessionUserId,
                voucherId: appliedVoucher.id,
                orderId: newOrder.id,
                code: appliedVoucher.code
            }, { transaction });
        }

        await transaction.commit();

        return res.status(201).json({
            message: 'Comanda a fost plasată cu succes!',
            orderId: newOrder.id,
            totalSum: newOrder.totalSum,
            discountApplied: Boolean(appliedVoucher)
        });

    } catch (error) {
        await transaction.rollback();
        console.error("ORDER CREATION ERROR:", error);

        return res.status(500).json({ 
            error: "Internal Server Error",
            details: error.message 
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