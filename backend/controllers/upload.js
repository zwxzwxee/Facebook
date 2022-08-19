const cloudinary = require("cloudinary");
const fs = require("fs");
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});
const removeTmp = (path) => {
  fs.unlink(path, (err) => {
    if (err) {
      throw err;
    }
  });
};

const uploadToCloudinary = async (file, path) => {
  // return a promise to make it await
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file.tempFilePath, // the image we wanna upload, that is the path of the image inside the temp folder
      {
        folder: path, // the folder the image is gonna stored inside the cloudinary
      },
      (err, res) => {
        // if error happens, then delete the image from the temp folder
        if (err) {
          removeTmp(file.tempFilePath);
          return res.status(400).json({ message: "Upload image failed." });
        }
        // return the url object, if succeed
        resolve({
          url: res.secure_url,
        });
      }
    );
  });
};

exports.uploadImages = async (req, res) => {
  try {
    const { path } = req.body; // used to differentiate the usage of images
    let files = Object.values(req.files).flat(); // makes images into array
    let images = [];
    for (const file of files) {
      const url = await uploadToCloudinary(file, path);
      images.push(url);
      removeTmp(file.tempFilePath);
    }
    res.json(images);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.listImages = async (req, res) => {
  try {
    // path is the path of images we wanna list,
    // and max is the max number of returned results,
    // sort is "desc" or "asc"
    const { path, max, sort } = req.body;
    cloudinary.v2.search
      .expression(`${path}`)
      .sort_by("public_id", `${sort}`)
      .max_results(max)
      .execute()
      .then((result) => res.json(result))
      .catch((err) => console.log(err.error.message));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
