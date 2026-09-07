import express from 'express';
import { Product, Order, OrderItem } from '../models/index.js'; 

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
            error: "Internal Server Error", 
            message: error.message,
            sqlDetail: error.original?.detail || null 
        });
    }
});

export default router;