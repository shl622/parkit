import bcrypt from 'bcryptjs';
import { Search, User } from './db.mjs';

const startAuthenticatedSession = (req, user, cb) => {
    req.session.regenerate((err)=>{
      if(!err){
        req.session.user = {username: user.username, email: user.email,_id:user._id};
        console.log(req.session);
      }else{
        console.log(err.message);
      }
      cb(err);
    })
};

const endAuthenticatedSession = (req,cb) => {
  if (!req.session){
    cb();
  }
  else{
    req.sesion.destroy((err)=> {cb(err);})
  }
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
    const {email,username} = newUser;
    successCallback({email,username});
    }).catch(error=>{
    console.log("error:",error)
    console.log("DOCUMENT SAVE ERROR");
    errorCallback({message:"DOCUMENT SAVE ERROR"});
    });
} catch(err){
    console.log(err.message);
    errorCallback({message: err.message});
    return;
}
};

//login
const login = async (username, password, errorCallback, successCallback) => {
    try{
      const user = await User.findOne({username});
      if (!user){
        console.log("USER NOT FOUND");
        errorCallback({message:"USER OR PASSWORD NOT FOUND"});
        return;
      }
      const compareHash = await bcrypt.compare(password, user.password);
      if (!compareHash){
        console.log("PASSWORD DO NOT MATCH");
        errorCallback({message:"USER OR PASSWORD NOT FOUND"});
        return;
      }
      successCallback(user);
    } catch(err){
      console.log(err.message);
      errorCallback({message: err.message});
      return;
    }
  };

//check session for login
function loginSession(){
  if (req.session.user){
    return true;
  }
  else{
   return false;
  }
}

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
    login,
    loginSession,
    authRequired
}