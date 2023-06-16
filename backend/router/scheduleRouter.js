const express = require("express");
const router = express.Router();

// 오전 00시 마다 일상점검 등록
// const ScheduleDailyInspect = require("./schedule/ScheduleDailyInspect");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

module.exports = router;
