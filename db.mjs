/*Mongoose Scehma*/
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true, unique: true},
})

const SearchSchema = new Schema({
    address : {type: String},
    time: {type: String},
    userid: {type : Schema.Types.ObjectId, ref: 'User'},
    usercoordinate: {type: Number}
})

export const User = mongoose.model("User", UserSchema);
export const Data = mongoose.model("Article", SearchSchema);

async function connectDB(){
   try{
    await mongoose.connect('mongodb://localhost');
   }catch(err){
    console.log(error.message);
   }
}

connectDB();

