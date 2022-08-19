const React = require("../models/React");
const User = require("../models/User");
const mongoose = require("mongoose");

exports.reactPost = async (req, res) => {
  try {
    const { postId, react } = req.body;
    const check = await React.findOne({
      postRef: postId,
      reactBy: mongoose.Types.ObjectId(req.user.id), // convert the string to ObjectId
    });
    // if the person has never reacted to the post before then create a new document.
    if (check == null) {
      const newReact = new React({
        react: react,
        postRef: postId,
        reactBy: mongoose.Types.ObjectId(req.user.id),
      });
      await newReact.save();
    } else {
      // if the new react to the same post is same to the former one, then remove the react
      // else then update the new react to the React database.
      if (check.react == react) {
        await React.findByIdAndRemove(check._id);
      } else {
        await React.findByIdAndUpdate(check._id, { react: react });
      }
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getReacts = async (req, res) => {
  try {
    const reactsArray = await React.find({ postRef: req.params.id });
    const newReacts = reactsArray.reduce((group, react) => {
      // group is by default the first element of the react array
      // react is every item inside the array
      let key = react.react;
      // traverse all the element inside the array, if the group has the
      // type, then push the elemnt into the specific type array, otherwise
      // create a new array and then push it.
      group[key] = group[key] || [];
      group[key].push(react);
      return group;
    }, {});
    // then count the number of reacts of every type
    const reacts = [
      {
        react: "like",
        count: newReacts.like ? newReacts.like.length : 0,
      },
      {
        react: "love",
        count: newReacts.love ? newReacts.love.length : 0,
      },
      {
        react: "wow",
        count: newReacts.wow ? newReacts.wow.length : 0,
      },
      {
        react: "sad",
        count: newReacts.sad ? newReacts.sad.length : 0,
      },
      {
        react: "angry",
        count: newReacts.angry ? newReacts.angry.length : 0,
      },
      {
        react: "haha",
        count: newReacts.haha ? newReacts.haha.length : 0,
      },
    ];
    const check = await React.findOne({
      postRef: req.params.id,
      reactBy: req.user.id,
    });
    const user = await User.findById(req.user.id);
    // check if the specific post is saved or not by the user
    const checkSaved = user?.savedPost.find(
      (post) => post.post.toString() === req.params.id
    );
    res.json({
      reacts,
      check: check?.react,
      total: reactsArray.length,
      checkSaved: checkSaved ? true : false,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};
