import express from 'express';
import {Contact } from '../models/index.js';

const router = express.Router();

router.post("/", async (req, res) => {

    try {
        const {email, message, name} = req.body

        const newContact = await Contact.create({email, message, name})

        if(!newContact){
            return res.status(400).json({error:"Could not save data in database"})
        }

        return res.status(200).json({message:"Answer successfully recorded in the database"})

    } catch (error) {
        res.status(400).json({ error: "Internal Server Error" })
    }
});


export default router;