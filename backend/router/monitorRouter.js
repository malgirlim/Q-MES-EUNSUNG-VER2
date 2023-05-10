const express = require("express");
const router = express.Router();

const monitorBadRouter = require("./monitor/monitorBad");
const monitorSafeRouter = require("./monitor/monitorSafe");
const monitorStockRouter = require("./monitor/monitorStock");
const monitorKpiProdRouter = require("./monitor/monitorKpiProd");
const monitorKpiStockRouter = require("./monitor/monitorKpiStock");
const monitorPressRouter = require("./monitor/monitorPress");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 재고조회 / 원자재 재고 조회 - router/monitor/monitorStock.js
router.use("/stock", monitorStockRouter);
// 재고조회 / 원자재 불량 조회 - router/monitor/monitorBad.js
router.use("/bad", monitorBadRouter);
// 재고조회 / 안전재고 미달 조회 - router/monitor/monitorSafe.js
router.use("/safe", monitorSafeRouter);
// 재고조회 / kpi_시간당생산량 - router/monitor/monitorSafe.js
router.use("/kpi-prod", monitorKpiProdRouter);
// 재고조회 / kpi_재고비용 - router/monitor/monitorSafe.js
router.use("/kpi-stock", monitorKpiStockRouter);
// 재고조회 / 압력계조립 - router/monitor/monitorSafe.js
router.use("/press", monitorPressRouter);

module.exports = router;
