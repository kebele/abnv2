import mongoose from "mongoose";

// burada bize bir schema lazım
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const UserModel = mongoose.model("User", UserSchema);

export default UserModel;

// UserModel hazırladık, export ettik, bunu index.js'de import edip kullanacağız
