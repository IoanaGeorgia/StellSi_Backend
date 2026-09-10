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

        res.status(200).json({ message: "User info fetched successfully", data: userToReturn })

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


router.post('/edit', async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (username === undefined || email === undefined || password === undefined) {
            return res.status(400).json({ error: "Missing either username, email or password" });
        }

        if (!req.session || !req.session.user || !req.session.user.id) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const userId = req.session.user.id;
        const userToEdit = await User.findOne({ where: { id: userId } });

        if (!userToEdit) {
            return res.status(400).json({ error: "User not found" });
        }

        const userNewInfo = {};

        if (username !== userToEdit.username) {
            userNewInfo.username = username;
        }

        if (email !== userToEdit.email) {
            userNewInfo.email = email;
        }

        if (password && password.trim() !== "") {
            const isPasswordSame = await bcrypt.compare(password, userToEdit.password);
            
            if (!isPasswordSame) {
                const hashedPassword = await bcrypt.hash(password, 10);
                userNewInfo.password = hashedPassword;
            }
        }

        if (Object.keys(userNewInfo).length === 0) {
            return res.status(200).json({ message: "No changes made", data: userToEdit });
        }

        const [affectedRows] = await User.update(userNewInfo, { where: { id: userToEdit.id } });

        if (affectedRows === 0) {
            return res.status(400).json({ error: "Failed to update user" });
        }

        const updatedUser = await User.findOne({ 
            where: { id: userToEdit.id },
            attributes: { exclude: ['password'] }
        });

        return res.status(200).json({ message: "User successfully updated", data: updatedUser });

    } catch (error) {
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;