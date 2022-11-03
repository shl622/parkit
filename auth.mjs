/*import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Data, User } from './db.mjs';

const startAuthenticatedSession = (req, user, cb) => {
    req.session.regenerate((err)=>{
      if(!err){
        req.session.user = {username: user.username, email: user.email, _id:user._id};
      }else{
        console.log(err.message);
      }
      cb(err);
    })
  };

const endAuthenticatedSession = (req,cb) => {
    req.sesion.destroy((err)=> {cb(err);})
};

const register = async (username, email, password, errorCallback, successCallback) => {
if (username.length < 8 || password.length < 8){
    console.log("USERNAME PASSWORD TOO SHORT");
    errorCallback({message: "USERNAME PASSWORD TOO SHORT"});
    return;
}
try {
    const user = await User.findOne({username});
    if (user){
    console.log("USERNAME ALREADY EXISTS");
    errorCallback({message:"USERNAME ALREADY EXISTS"});
    return;
    }
    const hash = await bcrypt.hash(password, 10);
    User.create({username,email,password:hash}).then(newUser=>{
    successCallback(newUser);
    }).catch(error=>{
    console.log("DOCUMENT SAVE ERROR");
    errorCallback({message:"DOCUMENT SAVE ERROR"});
    });
} catch(err){
    console.log(err.message);
    errorCallback({message: err.message});
    return;
}
};

// creates middleware that redirects to login if path is included in authRequiredPaths
const authRequired = authRequiredPaths => {
return (req, res, next) => {
    if(authRequiredPaths.includes(req.path)) {
    if(!req.session.user) {
        res.redirect('/login'); 
    } else {
        next(); 
    }
    } else {
    next(); 
    }
};
};

export {
    startAuthenticatedSession,
    endAuthenticatedSession,
    register,
    authRequired
}*/