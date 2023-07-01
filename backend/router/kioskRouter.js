const express = require("express");
const router = express.Router();

const kioskModalRouter = require("./kiosk/kioskModal");

const kioskWorkRouter = require("./kiosk/kioskWork");
const kioskItemRouter = require("./kiosk/kioskItem");
const kioskDefectRouter = require("./kiosk/kioskDefect");
const kioskNonworkRouter = require("./kiosk/kioskNonwork");

const kioskChecklistRouter = require("./kiosk/kioskChecklist");
const kioskWorklistRouter = require("./kiosk/kioskWorklist");
const kioskTaskAcceptRouter = require("./kiosk/kioskTaskAccept");
const kioskTaskStartRouter = require("./kiosk/kioskTaskStart");

const kioskTaskCancleRouter = require("./kiosk/kioskTaskCancle");
const kioskAlertRouter = require("./kiosk/kioskAlert");

const kioskWorkerChangeRouter = require("./kiosk/kioskWorkerChange");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 키오스크 / 모달 - router/kiosk/kioskModal.js
router.use("/modal", kioskModalRouter);

// 키오스크 / 작업관리 - router/kiosk/kioskWork.js
router.use("/work", kioskWorkRouter);
// 키오스크 / 투입자재관리 - router/kiosk/kioskItem.js
router.use("/item", kioskItemRouter);
// 키오스크 / 불량관리 - router/kiosk/kioskDefect.js
router.use("/defect", kioskDefectRouter);
// 키오스크 / 비가동관리 - router/kiosk/kioskNonwork.js
router.use("/nonwork", kioskNonworkRouter);

// 키오스크 / 일상점검 - router/kiosk/kioskChecklist.js
router.use("/checklist", kioskChecklistRouter);
// 키오스크 / 작업지시목록 - router/kiosk/kioskWorklist.js
router.use("/worklist", kioskWorklistRouter);
// 키오스크 / 작업수락 - router/kiosk/kioskTaskAccept.js
router.use("/taskaccept", kioskTaskAcceptRouter);
// 키오스크 / 작업시작 - router/kiosk/kioskTaskStart.js
router.use("/taskstart", kioskTaskStartRouter);

// 키오스크 / 작업반려 - router/kiosk/kioskTaskCancle.js
router.use("/taskcancle", kioskTaskCancleRouter);
// 키오스크 / 고장발생 - router/kiosk/kioskAlert.js
router.use("/alert", kioskAlertRouter);

// 키오스크 / 작업자변경 - router/kiosk/kioskWorkerChange.js
router.use("/workerchange", kioskWorkerChangeRouter);

module.exports = router;
