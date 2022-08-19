const express = require("express");
// limit the access website
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const fileUpload = require("express-fileupload");
// return all the file inside the input folder.
const { readdirSync } = require("fs");

dotenv.config();
app.use(cors());
app.use(express.json());
// all the uploaded images will be stored inside the tmp folder
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// routes
readdirSync("./routes").map((r) => app.use("/", require("./routes/" + r)));

// database
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("database connected successfully"))
  .catch((err) => console.log("error connecting to mongoDB", err));

const PORT = process.env.PORT || 8000;

app.listen(PORT, function () {
  console.log("server is listening");
});
