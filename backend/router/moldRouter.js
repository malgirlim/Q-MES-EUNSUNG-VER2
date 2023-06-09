const express = require("express");
const router = express.Router();

const moldModalRouter = require("./mold/moldModal");

const moldMoldRouter = require("./mold/moldMold");
const moldItemRouter = require("./mold/moldItem");
const moldInspectRouter = require("./mold/moldInspect");

const moldUseRouter = require("./mold/moldUse");
const moldRepairRouter = require("./mold/moldRepair");
const moldCheckRouter = require("./mold/moldCheck");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 금형관리 모달 - router/mold/moldModal.js
router.use("/modal", moldModalRouter);

// 기준정보 / 금형 관리 - router/mold/moldMold.js
router.use("/mold", moldMoldRouter);
// 기준정보 / 금형 제품 관리 - router/mold/moldItem.js
router.use("/item", moldItemRouter);
// 기준정보 / 금형 점검 관리 - router/mold/moldInspect.js
router.use("/inspect", moldInspectRouter);

// 금형관리 / 금형 사용 관리 - router/mold/moldUse.js
router.use("/use", moldUseRouter);
// 금형관리 / 금형 수선 관리 - router/mold/moldRepair.js
router.use("/repair", moldRepairRouter);
// 금형관리 / 금형 점검내역 관리 - router/mold/moldCheck.js
router.use("/check", moldCheckRouter);

module.exports = router;
