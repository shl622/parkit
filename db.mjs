import mongoose, { Schema } from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const UserSchema = new Schema({
  username: {type: String, required: true},
  email : {type:String},
  password: {type: String, required: true, unique: true},
});

const SearchSchema = new Schema({
    address : {type: String},
    time: {type: String},
    userid: {type : Schema.Types.ObjectId, ref: 'User'},
    userlat: {type:Number},
    userlng: {type:Number}
});

const FeedbackSchema = new Schema({
  userid: {type : Schema.Types.ObjectId, ref: 'User'},
  category: {type:String},
  comment : {type:String},
  images: [{type:String}]
}, {
  timestamps: true
});

export const User = mongoose.model("User", UserSchema);
export const Search = mongoose.model("Search", SearchSchema);
export const Feedback = mongoose.model("Feedback",FeedbackSchema);


