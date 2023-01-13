import express from 'express';
import mongoose from 'mongoose';
import fs from "fs";
import multer from 'multer';
import path from 'path';
import bodyParser from 'body-parser';
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

app.use(bodyParser.urlencoded(
  { extended:true }
))

app.set("view engine","ejs");

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  },
});

const upload = multer({ storage: storage });
const __dirname = path.resolve();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// const imgModel = ('./model');

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

// app.get('/', (req, res) => {
//   ImgModel.find({}, (err, items) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send('An error occurred', err);
//     }
//     else {
//       res.render('imagesPage', { items: items });
//     }
//   });
// });

app.post('/auth/login', loginValidation, handleValidationErrors, login);
app.post('/auth/register', registerValidation, handleValidationErrors, register);
app.get('/auth/me', checkAuth, getMe);

// app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
//   res.json({
//     url: `/uploads/${req.file.originalname}`,
//   });

//   res.send({
//     url: `/uploads/${req.file.originalname}`,
//   })
// });

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

app.post("/upload", checkAuth, upload.single('myImage'),(req,res)=>{
  const img = fs.readFileSync(req.file.path);
  const encode_img = img.toString('base64');
  const final_img = {
      contentType: req.file.mimetype,
      image: new Buffer(encode_img, 'base64')
  };
  ImgModel.create(final_img, function(err,result){
      if(err){
          console.log(err);
      }else{
          console.log(result.img.Buffer);
          console.log("Saved To database");
          res.contentType(final_img.contentType);
          res.send(final_img.image);
      }
  })
});

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
