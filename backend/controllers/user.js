const {
  validateEmail,
  validateLength,
  validateUsername,
} = require("../helpers/validation");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { generateToken } = require("../helpers/tokens");
const { generateCode } = require("../helpers/generateCode");
const { sendVerificationEmail, sendResetCode } = require("../helpers/mailer");
const jwt = require("jsonwebtoken");
const Code = require("../models/Code");
const Post = require("../models/Post");
const mongoose = require("mongoose");

exports.register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      username,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    // before create a new record inside the database,
    // check the record's validation first.
    // check the email
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "invalid email address",
      });
    }
    // check the existence of email
    const check = await User.findOne({ email });
    if (check) {
      return res.status(400).json({
        message: "This email address already exists, try with a different one.",
      });
    }
    // check the length of text
    if (!validateLength(first_name, 3, 30)) {
      return res.status(400).json({
        message: "First name must between 3 and 30 characters.",
      });
    }
    if (!validateLength(last_name, 3, 30)) {
      return res.status(400).json({
        message: "Last name must between 3 and 30 characters.",
      });
    }
    if (!validateLength(password, 6, 30)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    let tmpUsername = first_name + last_name;
    let newUsername = await validateUsername(tmpUsername);

    // encrypt the password with bcrypt and salting 12 rounds
    const cryptedPassword = await bcrypt.hash(password, 12);

    const user = await new User({
      first_name,
      last_name,
      email,
      password: cryptedPassword,
      username: newUsername,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();

    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    const token = generateToken({ id: user._id.toString() }, "7d");
    res.send({
      id: user._id,
      username: user.username,
      picture: user.picture,
      first_name: user.first_name,
      last_name: user.last_name,
      token: token,
      verified: user.verified,
      message: "Register Success ! please activate your email to start",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const validUser = req.user.id; // the user id decoded from the request header
    const { token } = req.body;
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    const check = await User.findById(user.id);
    if (validUser !== user.id) {
      return res.status(400).json({
        message: "You don't have the authorization to complete the operation.",
      });
    }
    if (check.verified == true) {
      return res
        .status(400)
        .json({ message: "This email is already activated." });
    } else {
      await User.findByIdAndUpdate(user.id, { verified: true });
      return res
        .status(200)
        .json({ message: "The account has been activated successfully!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      let check = await bcrypt.compare(password, user.password);
      if (!check) {
        return res.status(400).json({
          message: "The password is wrong!",
        });
      }
      const token = generateToken({ id: user._id.toString() }, "7d");
      res.send({
        id: user._id,
        username: user.username,
        picture: user.picture,
        first_name: user.first_name,
        last_name: user.last_name,
        token: token,
        verified: user.verified,
      });
    } else {
      return res.status(400).json({ message: "The email is not found!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendVerification = async (req, res) => {
  try {
    const id = req.user.id;
    const user = await User.findById(id);
    if (user.verified === true) {
      return res
        .status(400)
        .json({ message: "This account is already activated." });
    }
    const emailVerificationToken = generateToken(
      { id: user._id.toString() },
      "30m"
    );
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);
    return res
      .status(200)
      .json({ message: "Email verification link is sent to your email." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.findUser = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password"); // not return the password info of the user
    if (!user) {
      return res.status(400).json({ message: "Account does not exist." });
    }
    return res.status(200).json({
      email: user.email,
      picture: user.picture,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.sendResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("-password"); // not return the password info of the user
    await Code.findOneAndRemove({ user: user._id }); // just remove the older code record and update to the new one
    const code = generateCode(5);
    const savedCode = new Code({
      code,
      user: user._id,
    });
    savedCode.save();
    sendResetCode(user.email, user.first_name, code);
    return res.status(200).json({
      message: "Email reset code has been sent to your email.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    const DBcode = await Code.findOne({ user: user._id });
    if (DBcode.code !== code) {
      return res.status(400).json({ message: "Verification code is wrong." });
    }
    return res.status(200).json({ message: "ok" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password, email } = req.body;
    const cryptedPassword = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate(
      { email },
      {
        password: cryptedPassword,
      }
    );
    return res
      .status(200)
      .json({ message: "Successfully change the password." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findById(req.user.id);
    const profile = await User.findOne({ username }).select("-password");
    const friendship = {
      friends: false,
      following: false,
      requestSent: false,
      requestReceived: false,
    };
    if (!profile) {
      return res.json({ ok: false });
    }
    if (
      user.friends.includes(profile._id) &&
      profile.friends.includes(user._id)
    ) {
      friendship.friends = true;
    }

    if (user.following.includes(profile._id)) {
      friendship.following = true;
    }

    if (user.requests.includes(profile._id)) {
      friendship.requestReceived = true;
    }

    if (profile.requests.includes(user._id)) {
      friendship.requestSent = true;
    }

    // also get the posts of the owner of the profile back
    const post = await Post.find({ user: profile._id })
      .populate("user")
      .populate("comments.commentBy", "first_name last_name picture username")
      .sort({ createdAt: -1 });
    await profile.populate("friends", "first_name last_name username picture");
    res.json({ ...profile.toObject(), post, friendship });
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
};

exports.updateProfilePicture = async (req, res) => {
  try {
    const { url } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      picture: url,
    });
    res.json(url);
  } catch (error) {
    return res.status(500).json({ message: error?.message });
  }
};

exports.updateCover = async (req, res) => {
  try {
    const { url } = req.body;
    await User.findByIdAndUpdate(req.user.id, {
      cover: url,
    });
    res.json(url);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateDetails = async (req, res) => {
  try {
    const { info } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user.id,
      {
        details: info,
      },
      {
        new: true, // return the updated user object
      }
    );
    res.json(updated.details);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addFriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      // check if the friend id is myself
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        !receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        // when sent request the sender will be the follower of the receiver
        // if the receiver accept the request, then they become friends
        await receiver.updateOne({ $push: { requests: sender._id } });
        await receiver.updateOne({ $push: { followers: sender._id } });
        await sender.updateOne({ $push: { following: receiver._id } });
        res.json({ message: "Friend request has been sent." });
      } else {
        return res.status(400).json({ message: "Already sent." });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You cannot send a request to yourself." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      // check if the friend id is myself
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        // when sent request the sender will be the follower of the receiver
        // if the receiver accept the request, then they become friends
        await receiver.updateOne({ $pull: { requests: sender._id } });
        await receiver.updateOne({ $pull: { followers: sender._id } });
        await sender.updateOne({ $pull: { following: receiver._id } });
        res.json({ message: "Request has been canceled." });
      } else {
        return res.status(400).json({ message: "Already canceled." });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You cannot cancel a request to yourself." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.follow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      // check if the friend id is myself
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        !receiver.followers.includes(sender._id) &&
        !sender.following.includes(receiver._id)
      ) {
        // when sent request the sender will be the follower of the receiver
        // if the receiver accept the request, then they become friends
        await receiver.updateOne({ $push: { followers: sender._id } });
        await sender.updateOne({ $push: { following: receiver._id } });
        res.json({ message: "Follow Success." });
      } else {
        return res.status(400).json({ message: "Already following." });
      }
    } else {
      return res.status(400).json({ message: "You cannot follow yourself." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.unfollow = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      // check if the friend id is myself
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        receiver.followers.includes(sender._id) &&
        sender.following.includes(receiver._id)
      ) {
        // when sent request the sender will be the follower of the receiver
        // if the receiver accept the request, then they become friends
        await receiver.updateOne({ $pull: { followers: sender._id } });
        await sender.updateOne({ $pull: { following: receiver._id } });
        res.json({ message: "Unfollow Success." });
      } else {
        return res.status(400).json({ message: "Already not following." });
      }
    } else {
      return res.status(400).json({ message: "You cannot unfollow yourself." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      // check if the friend id is myself
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (receiver.requests.includes(sender._id)) {
        // when sent request the sender will be the follower of the receiver
        // if the receiver accept the request, then they become friends
        await receiver.updateOne({ $pull: { requests: sender._id } });
        await receiver.updateOne({ $push: { friends: sender._id } });
        await receiver.updateOne({ $push: { following: sender._id } });
        await sender.updateOne({ $push: { friends: receiver._id } });
        await sender.updateOne({ $push: { followers: receiver._id } });
        res.json({ message: "Friend request accepted success." });
      } else {
        return res.status(400).json({ message: "Already friends." });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You cannot accept a request from yourself." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.unfriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      // check if the friend id is myself
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        receiver.friends.includes(sender._id) &&
        sender.friends.includes(receiver._id)
      ) {
        await receiver.updateOne({ $pull: { friends: sender._id } });
        await receiver.updateOne({ $pull: { follower: sender._id } });
        await receiver.updateOne({ $pull: { following: sender._id } });
        await sender.updateOne({ $pull: { friends: receiver._id } });
        await sender.updateOne({ $pull: { follower: receiver._id } });
        await sender.updateOne({ $pull: { following: receiver._id } });
        res.json({ message: "Unfriend Success." });
      } else {
        return res.status(400).json({ message: "Already not friends." });
      }
    } else {
      return res.status(400).json({ message: "You cannot unfriend yourself." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      // check if the friend id is myself
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (receiver.requests.includes(sender._id)) {
        // when sent request the sender will be the follower of the receiver
        // if the receiver accept the request, then they become friends
        await receiver.updateOne({ $pull: { requests: sender._id } });
        await receiver.updateOne({ $pull: { followers: sender._id } });
        await sender.updateOne({ $pull: { following: receiver._id } });
        res.json({ message: "Friend request deleted success." });
      } else {
        return res.status(400).json({ message: "Already deleted request." });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You cannot delete a request from yourself." });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const searchTerm = req.params.searchTerm;
    // search the text content
    const result = await User.find({ $text: { $search: searchTerm } }).select(
      "first_name last_name username picture"
    );
    res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.addToSearchHistory = async (req, res) => {
  try {
    const { searchUser } = req.body;
    const user = await User.findById(req.user.id);
    // check if the searchUser exists before, if yes, then updated the date
    // if not then add to the searchHistory array
    const check = user.search.find((x) => x.user.toString() === searchUser);
    const search = {
      user: searchUser,
      createdAt: new Date(),
    };
    if (check) {
      await User.updateOne(
        {
          _id: req.user.id,
          "search._id": check._id,
        },
        {
          $set: {
            "search.$.createdAt": new Date(),
          },
        }
      );
    } else {
      await User.findByIdAndUpdate(req.user.id, {
        $push: { search },
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getSearchHistory = async (req, res) => {
  try {
    const result = await User.findById(req.user.id)
      .select("search")
      .populate("search.user", "last_name first_name username picture");
    // return the result in array
    res.json(result.search);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.removeFromSearch = async (req, res) => {
  try {
    const { searchUser } = req.body;
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { search: { user: searchUser } } }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getFriendsPageInfos = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("friends requests")
      .populate("friends", "first_name last_name username picture")
      .populate("requests", "first_name last_name username picture");

    const sentRequests = await User.find({
      requests: mongoose.Types.ObjectId(req.user.id),
    }).select("first_name last_name username picture");

    res.json({
      friends: user.friends,
      requests: user.requests,
      sentRequests: sentRequests,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
