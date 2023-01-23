import PostModel from '../models/Post.js';

export const getAll = async (req, res) => {
  try {
    const posts = await PostModel.find().populate('user').exec();

    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не вдалося отримати статті'
    })
  }
};

export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndUpdate({
      _id: postId,
    },
      {
        $inc: { viewsCount: 1 }
      },
      {
        returnDocument: 'after'
      },
      (err, doc) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            message: 'Не вдалося повернути статтю'
          });
        }

        if (!doc) {
          return res.status(404).json({
            message: 'Стаття не знайдена'
          });
        }

        res.json(doc);
      }
    ).populate('user');

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не вдалося отримати статтю'
    });
  }
};

// export const create = async (req, res) => {
//   try {
//     const doc = new PostModel({
//       title: req.body.title,
//       text: req.body.text,
//       imageUrl: req.body.imageUrl,
//       tags: req.body.tags.split(', '),
//       user: req.userId,
//     });

//     const post = await doc.save();

//     res.json(post);

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       message: 'Не вдалося створити статтю'
//     })
//   }
// };

export const create = async (req, res) => {
  try {

    const { title, text, tags } = req.body;
    const user = await User.findById(req.userId);

    if (req.files) {
      let fileName = Date.now().toString() + req.files.image.name;
      const __dirname = dirname(fileURLToPath(import.meta.url));
      req.files.image.mv(path.join(__dirname, '..', 'uploads', fileName));

    const newPostWithImage = new PostModel({
      title,
      text,
      imageUrl: fileName,
      tags: tags.split(', '),
      user: req.userId,
    });

    await newPostWithImage.save();
    await User.findByIdAndUpdate(req.userId, {
      $push: { posts: newPostWithImage }
    });

    return res.json(newPostWithImage);
  }

  const newPostWithoutImage = new Post({
    username: user.username,
    title,
    text,
    imgUrl: '',
    author: req.userId
  });
  await newPostWithoutImage.save();
  await User.findByIdAndUpdate(req.userId, {
    $push: { posts: newPostWithoutImage}
  });

  return res.json(newPostWithoutImage);



  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не вдалося створити статтю'
    })
  }
};

export const remove = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findByIdAndDelete({
      _id: postId,
    }, (err, doc) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: 'Не вдалося видалити статтю'
        });
      }

      if (!doc) {
        return res.status(404).json({
          message: 'Стаття не знайдена'
        });
      }

      res.json({
        success: true,
      })
    }
    );


  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не вдалося отримати статтю'
    });
  }
};

export const update = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne({
      _id: postId,
    }, {
      title: req.body.title,
      text: req.body.text,
      imageUrl: req.body.imageUrl,
      tags: req.body.tags.split(', '),
      user: req.userId
    });

    res.json({
      success: true,
    })
  } catch (error) {
    console.log(err);
    res.status(500).json({
      message: 'Не вдалося оновити статтю'
    });
  }
};

export const getLastTags = async (req, res) => {
  try {
    const posts = await PostModel.find().limit(5).exec();

    const tags = posts.map(obj => obj.tags).flat().slice(0, 5);

    res.json(tags);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: 'Не вдалося отримати статті'
    })
  }
};