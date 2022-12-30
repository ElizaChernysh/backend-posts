import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { registerValidation, loginValidation } from './validations/auth.js';
import {checkAuth, handleValidationErrors} from './utils/index.js';

import { UserController, PostController } from './controllers/index.js';
import { postCreateValidation } from './validations/post.js';
import cors from 'cors';


mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('DB Ok'))
  .catch(() => console.log('DB error', err));

const app = express();

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.post('/auth/register', registerValidation, handleValidationErrors,UserController.register);
app.post('/auth/login',loginValidation, handleValidationErrors, UserController.login);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  });
});

app.get('/tags', PostController.getLastTags);
app.get('/posts', PostController.getAll);
app.get('/posts/tags', PostController.getLastTags);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, PostController.update);


app.listen(4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server Ok')
});