import express from 'express';
import path from 'path';
import { User, Search} from './db.mjs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import * as auth from './auth.mjs'
import session from 'express-session';
import * as dotenv from 'dotenv';

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
}))

const loginMessages = {"PASSWORDS DO NOT MATCH": 'Incorrect password', "USER NOT FOUND": 'User doesn\'t exist'};
const registrationMessages = {"USERNAME ALREADY EXISTS": "Username already exists", "USERNAME PASSWORD TOO SHORT": "Username or password is too short"};

//----------------------------------------Signup and Login------------------------------------------------//
app.get('/signup',(req,res)=>{
    console.log("hit");
    res.sendFile(path.join(__dirname, '/public/signup.html'));
});

app.post('/signup', (req,res)=>{
    console.log(req.body);
    function success(newUser){
        auth.startAuthenticatedSession(req, newUser, (err)=>{
            if (!err){
                res.cookie("username",newUser.username,{maxAge:604800});
                res.cookie("email",newUser.email,{maxAge:604800});
                res.json({newUser,success: true});
            }else{
                res.json({newUser, success: false});
                console.log(err.message);
            }
        });
    }
    function error(err) {
        res.json({newUser: {}, success: false});
    }

    auth.register(req.body.username, req.body.email, req.body.password, error, success);
});

app.get('/welcome',(req,res)=>{
    res.sendFile(path.join(__dirname,'/public/welcome.html'));
});

app.get('/login',(req,res)=>{
    if (auth.loginSession){
       res.redirect('/');
    }
    else{
        res.sendFile(path.join(__dirname, '/public/login.html'));
    }
});

app.post('/login', async (req,res)=>{
    function success(user) {
        auth.startAuthenticatedSession(req, user, (err)=>{
            if(!err){
                res.cookie("username",user.username,{maxAge:604800});
                res.cookie("email",user.email,{maxAge:604800});
                res.json({user, success:true});
            }else{
                res.json({user, success:false});
                console.log(err.message);
            }
        });
    }
    function error(err){
        res.json({user:{}, success:false});
    }
    await auth.login(req.body.username, req.body.password, error, success);
});

app.post('/logout', (req,res)=>{
    auth.endAuthenticatedSession(req,err=>{
        console.log(err.message);
        if (!err){
            res.clearCookie("username");
            res.clearCookie("email");
            res.json({success:true});
        }
    });
});
//----------------------------------------save user search on DB------------------------------------------------//
app.post('/api/save-search', async (req,res)=>{
    const {address,userlat,userlng} = req.body
    try {
    const time = new Date().toISOString();
    const userid = "507f1f77bcf86cd799439011";
    const recentSearch = await Search.create({address,time,userid,userlat,userlng});
    res.status(200).json({recentSearch,success:true});
    }
    catch(err){
    res.status(500).json({recentSearch:null,success:false});
    console.log(err.message);
    }
});

//----------------------------------------app listener --------------------------------------------------------//
async function runApp(){
    try{
     await mongoose.connect(process.env.mongoURI);
     app.listen(process.env.PORT || 3000,()=>{
        console.log(`Server listening`)});
    }catch(err){
     console.log(err.message);
    }
 }
 
runApp();
 

