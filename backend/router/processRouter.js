const express = require("express");
const router = express.Router();

// const qualityQualityStandRouter = require("./quality/qualityQualityStand");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 품질관리 / 품질기준정보 관리 - router/quality/qualityQualityStand.js
// router.use("/qualitystand", qualityQualityStandRouter);

module.exports = router;
