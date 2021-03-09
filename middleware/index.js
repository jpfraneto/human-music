var Recommendation = require("../models/recommendation");
var middlewareObj = {};
const nodemailer    = require('nodemailer');
const cryptoRandomString = require('crypto-random-string');
const { response } = require("express");

middlewareObj.sendVerificationEmail = async function (username, userEmail, verificationCode) {
    const verificationUrl = "https://www.human-music.com/verifyEmail/" + verificationCode;

    const transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: 'Human Music <hola@human-music.com>',
        to: userEmail,
        subject: "Welcome! And Please Verify Your Account",
        html:"Hello "+username+"!,<br> We are so glad that you are travelling this journey with us.<br>Please verify your email by clicking in the following link: <br><a href="+verificationUrl+">Click here to verify</a>"
    }

    transporter.sendMail(mailOptions, (error, info)=>{
        if(error){
            console.log(error);
        } else {
            console.log("The email with the verification code was sent!");
        }
    })
}

middlewareObj.sendResetEmail = async function (username, userEmail, resetCode) {
    console.log("inside the send reset email function");
    const verificationUrl = "https://www.human-music.com/password_reset/" + resetCode;
    console.log(verificationUrl);
    
    const transporter = nodemailer.createTransport({
        host: 'mail.privateemail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: 'Human Music <hola@human-music.com>',
        to: userEmail,
        subject: "Reset password",
        html:"Hello "+username+"!,<br>I'm sorry that you forgot your password, but we are here to help. <br>Please click the following link: <br><a href="+verificationUrl+">Click here to reset password.</a><br>I hope that you have a GREAT day!<br> jp"
    }

    transporter.sendMail(mailOptions, (error, info)=>{
        if(error){
            console.log(error);
        } else {
            console.log("The email with the reset password route was sent!");
        }
    })
}

middlewareObj.validateEmail = function(mail){
    if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)){
        return (true)
    } else {
        return (false)
    }
} 

module.exports = middlewareObj;