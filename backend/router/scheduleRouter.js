const express = require("express");
const router = express.Router();

// 오전 00시 마다 일상점검 등록
const ScheduleDailyInspect = require("./schedule/ScheduleDailyInspect");

// 5분 마다 LOG를 등록
const ScheduleInsertLog = require("./schedule/ScheduleInsertLog");
// 10분 마다 API 전송
const ScheduleSendAPI = require("./schedule/ScheduleSendAPI");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

module.exports = router;
