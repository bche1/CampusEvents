const router = require("express").Router();
const User = require('../models/User');
const bcrypt = require('bcrypt')

console.log("AUTH ROUTE LOADED");

//registering an account 
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        /*const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(400).json({
                message: "User aleady exists"
            });
        }*/
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "User created",
            user
        })
    } catch (err) {
        res.status(500).json({
            error: err.message
        })
    }
})

module.exports = router;