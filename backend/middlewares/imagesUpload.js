// this middleware check the uploaded file to make sure that only the images are uploaded.

const fs = require("fs");
const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      throw err;
    }
  });
};

module.exports = async function (req, res, next) {
  try {
    if (!req.files || Object.values(req.files).flat().length === 0) {
      return res.status(400).json({ message: "No files selected." });
    }
    let files = Object.values(req.files).flat(); // makes the uploaded files into an array
    files.forEach((file) => {
      // first check the file format must be image
      if (
        file.mimetype !== "image/jpeg" &&
        file.mimetype !== "image/png" &&
        file.mimetype !== "image/gif" &&
        file.mimetype !== "image/webp"
      ) {
        removeTmp(file.tempFilePath); // if format error happens, remove the file inside the tmp folder
        return res.status(400).json({ message: "Unsupported format." });
      }

      //   then check the file size, if larger than 5 megabyte
      if (file.size > 1024 * 1024 * 5) {
        removeTmp(file.tempFilePath); // if size error happens, remove the file inside the tmp folder
        return res.status(400).json({ message: "File size is too large." });
      }
    });
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
