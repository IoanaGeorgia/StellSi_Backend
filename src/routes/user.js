import express from 'express';
import { Product, Order, OrderItem, User } from '../models/index.js';

const router = express.Router();

router.get("/history", async (req, res) => {
    try {

        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: "Neautorizat. Te rugăm să te autentifici." });
        }

        const userId = req.session.user.id;

        let user = await User.findOne({ where: { id: userId } })

        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }

        let userOrders = await Order.findAll({ where: { userId } }) || [];
        let ordersWithItems = [];

        if (userOrders.length > 0) {
            for (let order of userOrders) {
                let plainOrder = order.get({ plain: true });

                let orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
                let detailedItems = [];
                
                for (let item of orderItems) {
                    let plainItem = item.get({ plain: true });
                    let productItem = await Product.findOne({ where: { id: plainItem.productId } });
                    
                    detailedItems.push({
                        ...plainItem,
                        product: productItem ? productItem.get({ plain: true }) : null
                    });
                }

                plainOrder.items = detailedItems;
                ordersWithItems.push(plainOrder);
            }
        }

        const userToReturn = {
            userInfo: user,
            userHistory: ordersWithItems
        }

        res.status(200).json({ message: "Scissor me timbers", data: userToReturn })



    } catch (error) {
        res.status(400).json({ error: "Internal Server Error" })
    }
});


router.get('/delete', async (req, res) =>{
    try{

        const userId = req.session.user.id;

        let user = await User.findOne({ where: { id: userId } })

        if (!user) {
            return res.status(400).json({ error: "User not found" })
        }

        await user.destroy();

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ error: "User deleted, but session cleanup failed" });
            }
            res.clearCookie('connect.sid');
            return res.status(200).json({ message: "User account deleted successfully" });
        });


    }catch(error){
        res.status(400).json({ error: "Internal Server Error" })
    }
})

export default router;