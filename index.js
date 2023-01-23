import express from 'express';
import mongoose from 'mongoose';
import fs from "fs";
import multer from 'multer';
import path from 'path';
import bodyParser from 'body-parser';
// import { GridFsStorage } from "multer-gridfs-storage";
import { registerValidation, loginValidation } from './validations/auth.js';
import { checkAuth, handleValidationErrors } from './utils/index.js';
import { getAll, getLastTags, getOne, create, remove, update } from './controllers/PostController.js';
import { login, register, getMe } from './controllers/UserController.js';
import { postCreateValidation } from './validations/post.js';
import ImgModel from './models/Image.js';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
dotenv.config();

mongoose.set('strictQuery', false);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express()

app.use(express.json());
app.use(fileUpload());
app.use(cors());
app.use(express.static('uploads'));


app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.post('/auth/login', loginValidation, handleValidationErrors, login);
app.post('/auth/register', registerValidation, handleValidationErrors, register);
app.get('/auth/me', checkAuth, getMe);

// app.post("/upload", upload.single("myImage"), async (req, res) => {
//   if (req.file === undefined) return res.send("you must select a file.");

//     console.log(req.body);
//     console.log(req.myImage);
//     const port = process.env.PORT || 'https://localhost:4444';
//     const imageUrl = `${port}/${req.file.filename}`;
//     return res.send(imageUrl);
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
