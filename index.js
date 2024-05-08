const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { registerValidation } = require('./validations/auth.js');
const UserModel = require('./models/User.js')
const bcrypt = require('bcrypt')

const connect = "mongodb+srv://dias:dias@mongojs.jeituux.mongodb.net/?retryWrites=true&w=majority&appName=MongoJS";
mongoose.connect(connect).then(() => console.log("DB OK")).catch((err) => console.log("DB Error", err));

const app = express();

app.use(express.json());

app.post('/register', registerValidation, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json(errors.array());
    }

    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    const doc = new UserModel({
        email: req.body.email,
        username: req.body.email,
        avatarUrl: req.body.avatarUrl,
        passwordHash
    })

    const user = await doc.save()
    
    res.json(user);
});

const port = 3030;
app.listen(port, (err) => {
    if(err){
        return console.log(err);
    }
    return console.log(`Server is running on http://localhost:${port}`);
});
