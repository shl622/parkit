import mongoose, { Schema } from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const UserSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true, unique: true},
})

const SearchSchema = new Schema({
    address : {type: String},
    time: {type: String},
    userid: {type : Schema.Types.ObjectId, ref: 'User'},
    userlat: {type:Number},
    userlng: {type:Number}
})

export const User = mongoose.model("User", UserSchema);
export const Search = mongoose.model("Search", SearchSchema);


