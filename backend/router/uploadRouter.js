const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const router = express.Router();
router.use(express.urlencoded({ extended: false }));
router.use(express.json());
router.use(express.static(`${__dirname}/public`));
router.use(bodyParser.json());

router.get("/", (req, res, next) => {
  return res.render("index");
});

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => {
      console.log(file);
      done(null, "uploads/");
    },
    filename: (req, file, done) => {
      file.originalname = Buffer.from(file.originalname, "latin1").toString(
        "utf8"
      );
      const ext = path.extname(file.originalname);
      done(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/", upload.single("file"), (req, res) => {
  console.log(req.file);
});

module.exports = router;
