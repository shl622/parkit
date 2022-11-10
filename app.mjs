import express from 'express';
import path from 'path';
import { User, Search} from './db.mjs';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


app.post('/api/save-search', async (req,res)=>{
    const {address,usercoordinate} = req.body
    try {
    const time = Date.now();
    const userid = "1";
    const recentSearch = await Search.create({address,time,userid,usercoordinate});
    res.status(200).json({recentSearch,success:true});
    }
    catch(err){
    res.status(500).json({recentSearch:null,success:false});
    console.log(err.message);
    }
});

app.listen(process.env.PORT || 3000,()=>{
    console.log(`Server listening`)});
