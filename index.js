const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const app = express();
const port = 5000;

app.use(cors());

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });
// Express Routes

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use("/upload", express.static("upload"));

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  res.send("https://ai-be-ap65.onrender.com/upload/" + req.file.filename);
});
// Start the server

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
