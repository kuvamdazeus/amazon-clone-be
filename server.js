require('dotenv').config()
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const users = require('./models/user.js');
const products = require('./models/product.js');

const app = express();
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.use(cors());
app.use(express.json());

app.get('/', (_, res) => {
    res.status(200).json({ status: true, message: 'Server working' });
});

app.get('/get-products', async (req, res) => {
    let docs = await products.find();
    let response = jwt.sign({ products: docs }, process.env.JWT_SECRET);
    
    res.status(200).send(response);
});

app.post('/update-user', async (req, res) => {
    try {
        let update = jwt.verify(req.body.encrypted, process.env.JWT_SECRET);
        delete update.iat;

        let dbResponse = await users.updateOne({ email: update.email }, update);
        console.log(dbResponse, update);
        res.status(201).json({ status: true });
    }

    catch {
        res.status(200).json({ status: false, message: 'Error occured while decoding!' });

    }
});

// What if someone just posted random emails, this endpoint could create infinite documents
// which makes this endpoint vulnerable to db flooding requests
// thus, frontend will send coded string which will be decoded here
app.post('/auth', async (req, res) => {
    try {
        let check = jwt.verify(req.body.encrypted, process.env.JWT_SECRET);
        let user = await users.findOne({ email: check.email });

        if (user) {
            res.status(200).json(user);

        } else {
            user = await users.create({ name: check.name, email: check.email,
                cartItems: [], orders: [], addresses: [] });

            res.status(200).json(user);

        }
    
    } catch (err) {
        console.log('\n', JSON.stringify(req.socket.address()), 
            'This request was blocked due to incorrect code, check origin\n');

    }
});

app.listen(process.env.PORT, () => console.log('Server listening'));