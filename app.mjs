import express from 'express';
import path from 'path';
import { User, Search} from './db.mjs';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


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

async function runApp(){
    try{
     await mongoose.connect(process.env.mongoURI);
     app.listen(process.env.PORT || 3000,()=>{
        console.log(`Server listening`)});
    }catch(err){
     console.log(error.message);
    }
 }
 
runApp();
 

