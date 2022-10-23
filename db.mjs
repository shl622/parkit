/*
Mongoose Scehma
*/
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {type: String, required: true},
  password: {type: String, required: true},
  list: {
    address : {type: String},
    time: {type: String},
    userid: {type: String},
    usercoordinate: {type: Number}
  }
})
