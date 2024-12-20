const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const userModel = require('./modal/user.cjs');  

const app = express();


app.use(cors());
app.use(bodyParser.json());


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const isPass = await bcrypt.compare(password, user.password);
        if (!isPass) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        res.status(200).json({ message: 'Login successful', user: { email: user.email } });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});


app.post('/signup', async (req, res) => {
    let { name, contact, email, password } = req.body;
    try {
        const exist = await userModel.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashPass = await bcrypt.hash(password, 12);
        const newUser = new userModel({
            name,
            contact,
            email,
            password: hashPass,
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
