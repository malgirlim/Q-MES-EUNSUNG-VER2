const express = require("express");
const router = express.Router();

const kioskWorkRouter = require("./kiosk/kioskWork");
const kioskItemRouter = require("./kiosk/kioskItem");
const kioskDefectRouter = require("./kiosk/kioskDefect");
const kioskNonworkRouter = require("./kiosk/kioskNonwork");

const kioskWorklistRouter = require("./kiosk/kioskWorklist");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 키오스크 / 작업관리 - router/kiosk/kioskWork.js
router.use("/work", kioskWorkRouter);
// 키오스크 / 투입자재관리 - router/kiosk/kioskItem.js
router.use("/item", kioskItemRouter);
// 키오스크 / 불량관리 - router/kiosk/kioskDefect.js
router.use("/defect", kioskDefectRouter);
// 키오스크 / 비가동관리 - router/kiosk/kioskNonwork.js
router.use("/nonwork", kioskNonworkRouter);

// 키오스크 / 작업지시목록 - router/kiosk/kioskWorklist.js
router.use("/worklist", kioskWorklistRouter);

module.exports = router;
