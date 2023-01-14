import express from 'express';
import mongoose from 'mongoose';
import fs from "fs";
import multer from 'multer';
import path from 'path';
import bodyParser from 'body-parser';
import { GridFsStorage } from "multer-gridfs-storage";
import { registerValidation, loginValidation } from './validations/auth.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';
import { getAll, getLastTags, getOne, create, remove, update } from './controllers/PostController.js';
import { login, register, getMe } from './controllers/UserController.js';
import { postCreateValidation } from './validations/post.js';
import ImgModel from './models/Image.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

mongoose.set('strictQuery', false);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  myImage: (req, file) => {
    const match = ["image/png", "image/jpeg"];

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-any-name-${file.originalname}`;
      return filename;
    }

    return {
      bucketName: "photos",
      filename: `${Date.now()}-any-name-${file.originalname}`,
    };
  },
});

const upload = multer({ storage: storage });

// app.use(bodyParser.urlencoded(
//   { extended:true }
// ))

// app.set("view engine","ejs");


// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())

app.use(express.json());
app.use(cors());


// const imgModel = ('./model');

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.post('/auth/login', loginValidation, handleValidationErrors, login);
app.post('/auth/register', registerValidation, handleValidationErrors, register);
app.get('/auth/me', checkAuth, getMe);

app.post("/upload", upload.single("myImage"), async (req, res) => {
  if (req.body === undefined) {
    return res.send("you must select a file.");
  } else {
    console.log(req.body);
    console.log(req.myImage);
    const port = process.env.PORT || 'https://localhost:4444';
    const imgUrl = `${port}/${req.file.filename}`;
    return res.send(imgUrl);
  }
});

// const conn = mongoose.connection;
// conn.once("open", function () {
//     gfs = Grid(conn.db, mongoose.mongo);
//     gfs.collection("photos");
// });

// app.use("/", upload);

// app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
//   if (req.file == null) {
//     // If Submit was accidentally clicked with no file selected...
//     res.send('boo');
// } else {
//     // read the img file from tmp in-memory location
//     const newImg = fs.readFileSync(req.file.path);
//     // encode the file as a base64 string.
//     const encImg = newImg.toString('base64');
//     // define your new document
//     const newItem = {
//         description: req.body.description,
//         contentType: req.file.mimetype,
//         size: req.file.size,
//         img: Buffer(encImg, 'base64')
//     };

//     newItem.save();

//     res.json({newItem});
// }
// });

// app.post("/upload", checkAuth, upload.single('myImage'),(req,res)=>{
//   const img = fs.readFileSync(req.file.path);
//   const encode_img = img.toString('base64');
//   const final_img = {
//       contentType: req.file.mimetype,
//       image: new Buffer(encode_img, 'base64')
//   };
//   ImgModel.create(final_img, function(err, result){
//       if(err){
//           console.log(err);
//       } else{
//           console.log(result.img.Buffer);
//           console.log("Saved To database");
//           console.log(img);
//           res.contentType(final_img.contentType);
//           // res.save(final_img.image);
//           res.send(final_img.image);
//           // res.json({
//           //   myImage: final_img.image,
//           // })

//       }
//   })
// });

app.get('/tags', getLastTags);

app.get('/posts', getAll);
app.get('/posts/tags', getLastTags);
app.get('/posts/:id', getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, create);
app.delete('/posts/:id', checkAuth, remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  update,
);

app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server OK');
});
