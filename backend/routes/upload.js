const express = require("express");
const { uploadImages, listImages } = require("../controllers/upload");
const { authUser } = require("../middlewares/auth");
const imagesUpload = require("../middlewares/imagesUpload");
const router = express.Router();

router.post("/uploadImages", authUser, imagesUpload, uploadImages);
router.post("/listImages", authUser, listImages);

module.exports = router;
