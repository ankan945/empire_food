const express=require('express')
const router = express.Router()
const User = require('../models/User')
const { body, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const jwtSecret = "tdrfgvhgddrfcgytrsdfghbnpokbvgb"

router.post("/createuser",[
body('email').isEmail(),
body('password','password must contain atleast 5 charectes').isLength({ min: 5 })]
,async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const salt = await bcrypt.genSalt(10);
    let secuPassword = await bcrypt.hash(req.body.password,salt);
    try{
       await User.create({
            name: req.body.name,
            password:secuPassword,
            email:req.body.email,
            location:req.body.location
        })
        res.json({success:true});
    }catch(error){
        console.log(error)
        res.json({success:false});
    }
})

router.post("/loginuser",[
    body('email').isEmail(),
    body('password','password must contain atleast 5 charectes').isLength({ min: 5 })],async(req,res)=>{

        const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let email = req.body.email;
    let pass=req.body.password;
        try{
           let userData = await User.findOne({email});
           if(!userData){
            return res.status(400).json({ errors:"Username and password doest'nt matched" });
           }
           const pwdCompare = await bcrypt.compare(pass,userData.password);
           if(!pwdCompare){
            return res.status(400).json({ errors:"Username and password doest'nt matched" });
          }
           const data = {
            user:{
                id:userData.id
            }
           }
           const authToken = jwt.sign(data,jwtSecret)
           res.json({success:true,authToken:authToken});
        }catch(error){
            console.log(error)
            res.json({success:false});
        }
    })
    

module.exports=router;