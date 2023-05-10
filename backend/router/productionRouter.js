const express = require("express");
const router = express.Router();

const productionPlanRouter = require("./production/productionPlan");

const productionTaskRouter = require("./production/productionTask");
const productionTaskModalRouter = require("./production/productionTaskModal");
const productionTaskProcessRouter = require("./production/productionTaskProcess");
const productionTaskProcessItemRouter = require("./production/productionTaskProcessItem");

const productionTaskCurrentRouter = require("./production/productionTaskCurrent");

const productionResultRouter = require("./production/productionResult");
const productionResultUseitemRouter = require("./production/productionResultUseitem");
const productionResultDefectRouter = require("./production/productionResultDefect");
const productionResultNonworkRouter = require("./production/productionResultNonwork");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 주문관리 / 생산계획 관리 - router/production/productionPlan.js
router.use("/plan", productionPlanRouter);

// 주문관리 / 작업지시 관리 - router/production/productionTask.js
router.use("/task", productionTaskRouter);
// 주문관리 / 작업지시 등록모달 - router/production/productionTaskModal.js
router.use("/task/modal", productionTaskModalRouter);
// 주문관리 / 작업지시 / 공정 - router/production/productionTaskProcess.js
router.use("/task/process", productionTaskProcessRouter);
// 주문관리 / 작업지시 / 공정 / 자재 - router/production/productionTaskProcessItem.js
router.use("/task/process/item", productionTaskProcessItemRouter);

// 주문관리 / 작업현황 - router/production/productionTaskCurrent.js
router.use("/task/current", productionTaskCurrentRouter);

// 주문관리 / 생산실적집계 - router/production/productionResult.js
router.use("/result", productionResultRouter);
// 주문관리 / 생산실적집계 / 투입자재 - router/production/productionResultUseitem.js
router.use("/result/useitem", productionResultUseitemRouter);
// 주문관리 / 생산실적집계 / 불량 - router/production/productionResultDefect.js
router.use("/result/defect", productionResultDefectRouter);
// 주문관리 / 생산실적집계 / 비가동 - router/production/productionResultNonwork.js
router.use("/result/nonwork", productionResultNonworkRouter);

module.exports = router;
