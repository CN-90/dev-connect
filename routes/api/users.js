const express = require('express');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys')
const passport = require('passport');

const validateRegister = require('../../validation/register');
const validateLogin = require('../../validation/login');

const router = express.Router();
router.get('/test', (req, res) => {
    res.json({
        msg: 'This is the user page...'
    })
})

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegister(req.body);

    if (!isValid) {
        return res.status(400).json(errors);
    }
  
    User.findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                errors.email = 'Email or password is incorrect.';
                return res.status(400).json(errors);
            } else {
                const avatar = gravatar.url(req.body.email, {
                    s: '200', //size
                    r: 'pg', //rating
                    d: 'mm' //default
                });
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    avatar,
                    password: req.body.password,
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save()
                            .then(user => res.json(user))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
})

router.post('/login', (req, res) => {
    const { errors, isValid } = validateLogin(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email })
        .then(user => {
            //check for user
            if (!user) {
                errors.email = 'Email or password is incorrect';
                return res.status(404).json(errors);
            }
            // check password
            bcrypt.compare(password, user.password)
                .then( isMatch => {
                    if (isMatch) {
                        // user login successful
                        const payload = { id: user.id, name: user.name, avatar: user.avatar } // create JWT payload
                        jwt.sign(payload, keys.secretKey, { expiresIn: 3600 }, (err, token) => {
                            res.json({
                                success: true,
                                token: 'Bearer ' + token
                            })
                        })
                    } else {
                        errors.password = 'Email was not found or password is incorrect.';
                        return res.status(404).json(errors);
                    }
                })
        })
})

// private current user route
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    })
})


module.exports = router;