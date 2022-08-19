const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    const post = await new Post(req.body);
    post.save();
    await post.populate("user", "first_name last_name username picture cover");
    res.json(post);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const followingTemp = await User.findById(req.user.id).select("following");
    const following = followingTemp.following;
    const promises = following.map((user) => {
      return Post.find({ user: user })
        .populate("user", "first_name last_name username picture cover")
        .populate("comments.commentBy", "first_name last_name username picture")
        .sort({ createdAt: -1 });
    });
    // we do not use await in every single find post of user, but useing Promis.all()
    const followingPosts = await (await Promise.all(promises)).flat();

    const userPosts = await Post.find({ user: req.user.id })
      .populate("user", "first_name last_name username picture cover")
      .populate("comments.commentBy", "first_name last_name username picture")
      .sort({ createdAt: -1 });
    followingPosts.push(...[...userPosts]);
    followingPosts.sort((a, b) => {
      return b.createdAt - a.createdAt;
    });
    // send back the array to the frontend
    res.json(followingPosts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.comment = async (req, res) => {
  try {
    const { comment, image, postId } = req.body;
    let newComments = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: {
            comment: comment,
            image: image,
            commentBy: req.user.id,
            commentAt: new Date(),
          },
        },
      },
      {
        new: true, // to make sure that return the updated record
      }
    ).populate("comments.commentBy", "picture first_name last_name username");
    res.json(newComments.comments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const user = await User.findById(req.user.id);
    // first check if the post we wanna save is already existing
    const check = user?.savedPost.find(
      (post) => post.post.toString() == postId
    );
    if (check) {
      // if exists then remove
      await User.findByIdAndUpdate(req.user.id, {
        $pull: {
          savedPost: {
            _id: check._id,
          },
        },
      });
    } else {
      // if not then store it
      await User.findByIdAndUpdate(req.user.id, {
        $push: {
          savedPost: {
            post: postId,
            savedAt: new Date(),
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.params.id);
    res.json({ status: "ok" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
