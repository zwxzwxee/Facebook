const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const reactSchema = new mongoose.Schema({
  react: {
    type: String,
    enum: ["like", "love", "haha", "sad", "angry", "wow"],
    required: true,
  },
  postRef: {
    type: ObjectId,
    ref: "post",
  },
  reactBy: {
    type: ObjectId,
    ref: "user",
  },
});

module.exports = mongoose.model("react", reactSchema);
