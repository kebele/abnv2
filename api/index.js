import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import imageDownloader from "image-downloader";
import { dirname } from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import * as fs from "fs";
import Place from "./models/Place.js";
import Booking from "./models/Booking.js";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";

// const bcrypt = require("bcryptjs");

dotenv.config();

const app = express();

// kriptolamak
const bcryptSalt = bcrypt.genSaltSync(12); // ms cinsinden
const jwtSecret = "asdasdasd"; // kafamızdan bir string sallayalım, jwt'de kullanmak için
const bucket = "kemal-booking-app"; // S3'ten aldığımız

// json için parser yapalım, ver alıp verirken ...

// app.use(
//   cors({
//     credentials: true,
//     origin: "http://127.0.0.1:5173/",
//   })
// );
// app.use(cors());
app.use(express.json());
app.use(cookieParser());
// photolar için dosya konumu middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    credentials: true,
    origin: "http://127.0.0.1:5173",
  })
);

// mongoose.connect(process.env.MONGO_URL);
// mongodaki db'miz ile bağlatı kurmak için, db dashboard connect, connect yur application, verdiği kodu aşağı koyup istediği bilgileri yerleştir, password, bunu .env dosyasına yerleştir,
// console.log(process.env.MONGO_URL);
// mongoose.connect(process.env.MONGO_URL);
// mongoDB ile bağlantıyı her endpointte kurmamız lazım açıklama aşapıda bi yerlerde

// S3 konuları
async function uploadToS3(path, originalFilename, mimetype) {
  const client = new S3Client({
    // region: "us-east-1",
    region: "eu-north-1",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  });
  // console.log({path, originalFilename, mimetype})
  const parts = originalFilename.split(".");
  const ext = parts[parts.length - 1];
  const newFilename = Date.now() + "." + ext;
  // console.log({path, mimetype, ext, newFilename})
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Body: fs.readFileSync(path),
      Key: newFilename,
      ContentType: mimetype,
      ACL: "public-read",
    })
  );
  return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
}

// token'dan user data alma konusu
function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

// test için endpoint
app.get("/test", (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  // her endpointe (logout hariç onun DB ile alakası yok) monggose ile mongo db ye erişim sağlamamız lazım, çünkü db'miz mongo
  res.json("test ok");
});

// register için endpoint
// fe'de Register.jsx'de RegisterUser func içinde axios ile bir post oluşturduk bu postun içinde name, email ve password state'leri var, bunları burada oluşturduğumuz endpointe yollayacağız ve buradan da body içine console'da network içinde bakacağız gelmiş mi? ...Başarılı
app.post("/register", async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { name, email, password } = req.body;
  // fe'den gelen nesneyi DB'ye kaydedelim, bunun için model yapısına ihtiyacımız var, ./api/models/User.js oluştur, kullanıcı bilgisini burada tutacağız, User.js içinde UserModel'i hazırladık burada import et,
  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    // fe'de register sayfasında denemsini yaptığımmızda console network'den sonuçları görebiliriz, başarılı olup olmadığı burada her denemede mail'i farklı olması önemli çünkü o şekilde ayarladık, mail unique olmalı
    //   res.json({ name, email, password });
    res.json(userDoc);
  } catch (error) {
    res.status(422).json(error);
  }
});

// login için endpoint
app.post("/login", async (req, res) => {
  //req.body içinden email,password'u çek
  mongoose.connect(process.env.MONGO_URL);
  const { email, password } = req.body;
  // bunu db içinde var mı diye bakalım
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    // res.json("found");
    // password kontrol edelim
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      //   res.json("password ok");
      jwt.sign(
        { email: userDoc.email, id: userDoc._id },
        jwtSecret,
        {},
        (err, token) => {
          if (err) throw err;
          // buradan cookie hazırlar
          //   res.cookie("token", token).json("password ok");
          // userDoc cookie'de userDoc bilgileri olsun, bunlar fe'ye gitsin, fe'den de buradaki userDoc olan bilgiyi userInfo olarak context'deki user'a koysun
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("password not ok");
    }
  } else {
    res.json("not found");
  }
});

//profile için endpoint
app.get("/profile", (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  //   res.json("user info");
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await User.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

// logout için endpoint
// token'ı boş string yapacak bu şekilde logout olmuş olacak, deneyelim, sayfayı yenileyince logout olmuş olduğunu gör
app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

// upload by link için endpoint
// console.log({ __dirname });
app.post("/upload-by-link", async (req, res) => {
  // mongoose.connect(process.env.MONGO_URL);
  // burada mongoose'a ihtiyaç yok
  // requestten link'i alalım
  const { link } = req.body;
  const newName = "photo" + Date.now() + ".jpg";
  await imageDownloader.image({
    url: link,
    // dest: __dirname + "/uploads/" + newName,
    dest: "/tmp/" + newName,
  });
  // res.json("/tmp/" + "/uploads/" + newName);
  // S3'e link'in upload'u
  const url = await uploadToS3(
    "/tmp/" + newName,
    newName,
    mime.lookup("/tmp/" + newName)
  );
  // res.json(newName);
  res.json(url);
});

// local machine'den upload photo
// deploy işleminde şu anda uploads adında bir klasörümüz var ve içinde resimler var, vercel buna izin vermiyor, bu yüzden bu mekansizmayı değiştireceğiz, buradaki uploads sistemini aws S3 hizmeti ile değiştireceğiz, S3 konusu google docs'da project development dokuda deploy - 2 başlığında
// const photosMiddleware = multer({ dest: "uploads/" });
// app.post("/upload", photosMiddleware.array("photos", 100), (req, res) => {
const photosMiddleware = multer({ dest: "/tmp" });
// app.post("/upload", async (req, res) => {
app.post("/upload", photosMiddleware.array("photos", 100), async (req, res) => {
  const uploadedFiles = [];
  for (let i = 0; i < req.files.length; i++) {
    const { path, originalname, mimetype } = req.files[i];
    // const parts = originalname.split(".");
    // const ext = parts[parts.length - 1];
    // const newPath = path + "." + ext;
    // fs.renameSync(path, newPath);
    // uploadedFiles.push(newPath.replace("uploads/", ""));
    // bunlar uploadS3 func'a gidecek
    const url = await uploadToS3(path, originalname, mimetype);
    uploadedFiles.push(url);
  }
  // res.json(req.files);
  res.json(uploadedFiles);
});

// add new place için endpoint
// Place adında bir model'imiz var zaten
app.post("/places", (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  const {
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;

    const placeDoc = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
      price,
    });
    res.json(placeDoc);
  });
});

// db'den belli bir user için places'ları alalım
app.get("/user-places", (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const { id } = userData;
    res.json(await Place.find({ owner: id }));
  });
});

// belli bir ilanın id'sini alıp o ilanın sayfasına gitmek
app.get("/places/:id", async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  // res.json(req.params);
  const { id } = req.params;
  res.json(await Place.findById(id));
});

// edit için endpoint
app.put("/places", async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;
  const {
    id,
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
    price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    // console.log(userData.id);
    // console.log(placeDoc.owner);
    // bu ikisi aynı mı diye baktık
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,
        address,
        photos: addedPhotos,
        description,
        perks,
        extraInfo,
        checkIn,
        checkOut,
        maxGuests,
        price,
      });
      await placeDoc.save();
      res.json("ok");
    }
  });
});

// bütün places ları alalım, user ayrımı olmadan
app.get("/places", async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json(await Place.find());
});

// book işlemi için endpoint
app.post("/bookings", async (req, res) => {
  // body'den aşağıdakileri çekelim
  // DB'ye kayıt için bize model lazım onu oluşturalım
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  const { place, checkIn, checkOut, numberOfGuests, name, phone, price } =
    req.body;
  Booking.create({
    place,
    checkIn,
    checkOut,
    numberOfGuests,
    name,
    phone,
    price,
    user: userData.id,
  })
    .then((doc) => {
      res.json(doc);
    })
    .catch((err) => {
      throw err;
    });
});

// bookings getirmek için endpoint
app.get("/bookings", async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  res.json(await Booking.find({ user: userData.id }).populate("place"));
});
app.listen(4000);
