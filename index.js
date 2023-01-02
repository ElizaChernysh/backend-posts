import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { registerValidation, loginValidation } from './validations/auth.js';
import {checkAuth, handleValidationErrors} from './utils/index.js';
import { getAll, getLastTags, getOne, create, remove, update} from './controllers/PostController.js';
import { login, register, getMe} from './controllers/UserController.js';
import { postCreateValidation } from './validations/post.js';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

mongoose.set('strictQuery', false);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('DB Ok'))
  .catch((err) => console.log('DB error', err));

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

app.get("/", (req, res) => {
  res.send("Express on Vercel");
});

app.post('/auth/register', registerValidation, handleValidationErrors,register);
app.post('/auth/login',loginValidation, handleValidationErrors, login);
app.get('/auth/me', checkAuth, getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  });
});

app.get('/tags', getLastTags);
app.get('/posts', getAll);
app.get('/posts/tags', getLastTags);
app.get('/posts/:id', getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, create);
app.delete('/posts/:id', checkAuth, remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, update);


app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server Ok')
});

// module.exports = app;
