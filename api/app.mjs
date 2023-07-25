import express from 'express';
import path from 'path';
import { User, Search, Feedback} from './db.mjs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import * as auth from './auth.mjs'
import session from 'express-session';
import * as dotenv from 'dotenv';
import cors from 'cors'; //cors--check later

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: true, credentials: true })); //cors--check later
app.use(session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: true,
    maxAge: 7*24*60*60*1000 //week
}))

//----------------------------------------Signup and Login------------------------------------------------//
app.get('/signup',(req,res)=>{
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});

app.post('/signup', (req,res)=>{
    console.log(req.body);
    function success(newUser){
        auth.startAuthenticatedSession(req, newUser, (err)=>{
            if (!err){
                res.cookie("username",newUser.username,{maxAge:604800});
                res.cookie("email",newUser.email,{maxAge:604800});
                res.cookie("auth","true",{maxAge:604800, httpOnly:true});
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
    res.sendFile(path.join(__dirname,'../public/welcome.html'));
});

app.get('/login',(req,res)=>{
    if (auth.loginSession(req.session)){
        res.cookie("username",req.session.user.username,{maxAge:604800});
        res.cookie("email",req.session.user.email,{maxAge:604800});
        res.redirect('/'); //might be problem
    }
    else{
        res.sendFile(path.join(__dirname, '../public/login.html'));
    }
});

app.get('/api/checkauth', (req,res)=>{
    if (req.session.user){
        res.cookie("username",req.session.user.username,{maxAge:604800});
        res.cookie("email",req.session.user.email,{maxAge:604800});
        res.json({success:true});
    }
    else{
        res.json({succes:false});
    }
});


app.post('/api/login', async (req,res)=>{
    function success(user) {
        auth.startAuthenticatedSession(req, user, (err)=>{
            if(!err){
                res.cookie("username",user.username,{maxAge:604800});
                res.cookie("email",user.email,{maxAge:604800});
                res.cookie("auth","true",{maxAge:604800, httpOnly:true});
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

app.post('/api/logout', (req,res)=>{
    auth.endAuthenticatedSession(req,err=>{
        console.log(err);
        if (!err){
            res.clearCookie("username");
            res.clearCookie("email");
            res.clearCookie("auth");
            res.json({success:true});
        }
    });
});
//----------------------------------------save user search on DB------------------------------------------------//
app.post('/api/save-search', async (req,res)=>{
    const {address,userlat,userlng} = req.body;
    if (!req.session.user){
        res.status(401).json({success:false, error: "Not logged in"});
        res.end();
        return;
    }
    try {
    const time = new Date().toISOString();
    const userid = req.session.user._id;
    const recentSearch = await Search.create({address,time,userid,userlat,userlng});
    res.status(200).json({recentSearch,success:true});
    }
    catch(err){
    res.status(500).json({recentSearch:null,success:false});
    console.log(err.message);
    }
});

//----------------------------------------feedback save on DB --------------------------------------------------------//
app.post('/api/save-feedback',async (req,res)=>{
    if (!auth.loginSession){
        res.status(401).json({success:false, message: "Not Authenticated"});
        res.end();
        return;
    }
    try{
        // const {category,comment} = req.body;
        const feedback = await Feedback.create({category:req.body.category,
            comment:req.body.comment,
            location:req.body.location,
            pathData: req.body.pathData,
            userid:req.session.user._id})
        res.json({ data: feedback.toJSON(),success: true, message: "Successfully uploaded comment" });
    }
    catch(err){
        res.status(500).json({success:false, error: "Please Login to Report Issues"});
        console.log(err.message);
    }
});

//----------------------------------------Recent Search --------------------------------------------------------//
app.get('/recent', (req,res)=>{
    res.sendFile(path.join(__dirname, '../public/recent.html'));
});
app.get('/api/recent',async(req,res)=>{
    if (!req.session.user){
        res.status(401).json({success:false, message:"Not logged in", data: []});
        res.end();
        return;
    }
    try{
        const recentSearch = await Search.find({"userid": req.session.user._id}).sort({time: -1}).limit(3);
        res.status(200).json({success:true, data: recentSearch})
    }catch(err){
        res.status(500).json({success:false, data: []});
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
 

