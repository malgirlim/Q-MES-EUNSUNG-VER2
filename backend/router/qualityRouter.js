const express = require("express");
const router = express.Router();

const qualityIncomingRouter = require("./quality/qualityIncoming");
const qualityProcessRouter = require("./quality/qualityProcess");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 품질관리 / 수입검사 관리 - router/quality/qualityIncoming.js
router.use("/incoming", qualityIncomingRouter);

// 품질관리 / 공정검사 관리 - router/quality/qualityProcess.js
router.use("/process", qualityProcessRouter);

module.exports = router;
