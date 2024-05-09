const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const { registerValidation } = require('./validations/auth.js');
const UserModel = require('./models/User.js')
const bcrypt = require('bcrypt')

const connect = "mongodb+srv://dias:dias@mongojs.jeituux.mongodb.net/blog?retryWrites=true&w=majority&appName=MongoJS";
mongoose.connect(connect).then(() => console.log("DB OK")).catch((err) => console.log("DB Error", err));

const app = express();

app.use(express.json());

app.post('/login', async (req, res) => {
    try{
        const user = await UserModel.findOne({email: req.body.email})

        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        const isVailidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)
        if(!isVailidPass){
            return res.status(404).json({
                message: "Incorrect login or password"
            })
        }

        const token = jwt.sign({
            _id: user._id
        }, 'sercet000', {
            expiresIn: '30d'
        })

        res.status(200).json({
            message: "Success!"
        })
    } catch(err){
        console.log(err)
        res.status(500).json({
            message: "Cannot to login"
        })
    }
})

app.post('/register', registerValidation, async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()){
            return res.status(400).json(errors.array());
        }

        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        const doc = new UserModel({
            email: req.body.email,
            username: req.body.email,
            avatarUrl: req.body.avatarUrl,
            passwordHash: hash
        })

    const user = await doc.save()

    const token = jwt.sign({
        _id: user._id,
    }, 'secret000', {
        expiresIn: '30d'
    })

    const { passwordHash, ...userData} = user._doc
    
    res.status(500).json({
        ...user._doc,
        token
    });
    } catch(err){
        console.log(err)
        res.json({
            message: "Cannot to register"
        })
    }
});

const port = 3030;
app.listen(port, (err) => {
    if(err){
        return console.log(err);
    }
    return console.log(`Server is running on http://localhost:${port}`);
});
