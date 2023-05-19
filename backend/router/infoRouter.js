const express = require("express");
const router = express.Router();

const infoLogRouter = require("./info/infoLog");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 정보 / 로그 - router/info/infoLog.js
router.use("/log", infoLogRouter);

module.exports = router;
