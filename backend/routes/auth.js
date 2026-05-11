const router = require("express").Router();
const User = require('../models/User');
const bcrypt = require('bcrypt')

console.log("AUTH ROUTE LOADED");

//registering an account 
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = await User.findOne({email})
        if (existingUser) {
            return res.status(400).json({
                message: "User aleady exists"
            });
        }
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

//login for account
router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;
        console.log("BODY:", req.body);

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({message: 'User not found'})
        }

        console.log("INPUT PASSWORD:", password);
        console.log("DB PASSWORD:", user.password);

        const isMatched = await bcrypt.compare(password, user.password)
        if (!isMatched) {
            return res.status(400).json({message: 'Your username or password is incorrect'})
        }

const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
res.json({
    message: "login successful",
    token,
    user: {
        id: user._id,
        username: user.username,
        email: user.email
    }
});
    }catch (err) {
    res.status(500).json({message: err.message})
}
    
})
module.exports = router;
