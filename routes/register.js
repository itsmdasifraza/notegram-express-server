require('dotenv').config()
var express = require('express');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var bcrypt = require('bcryptjs');
const nodemailer = require("nodemailer");
var jwt = require('jsonwebtoken');
var jwtSecret = process.env.JWT_SECRET;

var noteModel = require('../models/note/note.model');
var listModel = require('../models/list/list.model');
var userModel = require('../models/user/user.model');

const transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com',
	secureConnection: false, // TLS requires secureConnection to be false
    port: 587,
	tls: {
       ciphers:'SSLv3'
    },
    //secure: false,
    //requireTLS: true,
    auth: {
        user: process.env.SENDER_EMAIL,
        pass: process.env.SENDER_PASSWORD
    }
});

router.post('/',
    body('username', 'username must between 4 to 36 character').trim().isLength({ min: 4, max: 36 }),
    body('email', 'email must be valid').isEmail(),
    body('password', 'password must be minimum 8 character').trim().isLength({ min: 8 }),
    async (req, res) => {

        const errors = validationResult(req);

        // throw validation errors
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // enctypting password 
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);

        // creating user object
        let newUser = new userModel({
            username: req.body.username,
            email: req.body.email,
            password: hash
        });
        try {
            //check username already exist or not
            let usernameExist = await userModel.findOne({ username: req.body.username});
            // console.log(usernameExist);
            if (usernameExist && usernameExist.verified == true) {
                return res.status(400).json({
                    error: 'request failed',
                    mssg: "username already in use"
                });
            }
            if (usernameExist && usernameExist.verified == false) {
				let listExist = await listModel.deleteMany({ userid : usernameExist._id });
				let noteExist = await noteModel.deleteMany({ userid : usernameExist._id });
                let reUsernameExist = await userModel.findOneAndDelete({ _id: usernameExist._id , verified: false });
            }
        } catch {
            return res.status(500).json({
                error: '500',
                mssg: "internal server error",
            });
        }
        try {
            //check email already exist or not
            let emailExist = await userModel.findOne({ email: req.body.email });
            if (emailExist && emailExist.verified == true) {
                return res.status(400).json({
                    error: 'request failed',
                    mssg: "email already in use"
                });
            }
            if (emailExist && emailExist.verified == false) {
				let listExist = await listModel.deleteMany({ userid : emailExist._id });
				let noteExist = await noteModel.deleteMany({ userid : emailExist._id });
                let reEmailExist = await userModel.findOneAndDelete({ _id: emailExist._id , verified : false });
            }
        } catch {
            return res.status(500).json({
                error: '500',
                mssg: "internal server error",
            });
        }
        //pushing user object to mongo
        newUser.save(function (err, data) {
            if (err)
                return res.status(400).json({
                    error: 'request failed',
                    mssg: "something went wrong"
                });
            else {
                let jwtData = {
                    email : req.body.email   
				}
                let token = jwt.sign( jwtData, jwtSecret);
                // send mail with defined transport object
                let info = transporter.sendMail({
                   from: `${process.env.APP_NAME} <${process.env.SENDER_EMAIL}>`, // sender address
                    to: req.body.email, // list of receivers
                    subject: `Email confirmation for your account`, // Subject line
                    html:`<p>Hello <b>${req.body.username}</b>!</p>
					<p>A request has been raised for registration on ${process.env.APP_NAME} and you were successfully registered, But your account is currently unsecure. Click the email verification link to secure your account:</p>
					<p><a href="${process.env.FRONTEND_PROTOCOL}://${process.env.FRONTEND_HOST}/verify/email/${token}">${process.env.FRONTEND_PROTOCOL}://${process.env.FRONTEND_HOST}/verify/email/${token}</a></p>
					<p>If you didn't initiate this request, just ignore this letter.</p>
                    <p>With best regards,<br/>${process.env.APP_NAME} Developer.</p>`, // html body
                }, (err, res) => {
                    if (err) {
                         //console.log(err);
                    }
                    else {
                         //console.log(res);
                    }
                });
                return res.status(200).json({
                    success: 'request success',
                    mssg: `Email verification link sent on your email ${data.email}.`,
                    info: { username: data.username, email: data.email }
                });
            }
        });

    });
module.exports = router;