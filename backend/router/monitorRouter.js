const express = require("express");
const router = express.Router();

const monitorKpiStockCostRouter = require("./monitor/monitorKpiStockCost");
const monitorKpiReturnCostRouter = require("./monitor/monitorKpiReturnCost");
const monitorKpiOEERouter = require("./monitor/monitorKpiOEE");
const monitorKpiFacilityRateRouter = require("./monitor/monitorKpiFacilityRate");
const monitorKpiBadRateRouter = require("./monitor/monitorKpiBadRate");
const monitorKpiManHourRouter = require("./monitor/monitorKpiManHour");
const monitorKpiProductHourRouter = require("./monitor/monitorKpiProductHour");

const monitorPreventRouter = require("./monitor/monitorPrevent");
const monitorDailyRouter = require("./monitor/monitorDaily");

const monitorMTBFRouter = require("./monitor/monitorMTBF");
const monitorMTTRRouter = require("./monitor/monitorMTTR");
const monitorOEERouter = require("./monitor/monitorOEE");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 모니터링 / kpi / 재고비용 - router/monitor/monitorKpiStockCost.js
router.use("/kpi/stockcost", monitorKpiStockCostRouter);
// 모니터링 / kpi / 반품금액 - router/monitor/monitorKpiReturnCost.js
router.use("/kpi/returncost", monitorKpiReturnCostRouter);
// 모니터링 / kpi / 설비종합효율(OEE) - router/monitor/monitorKpiOEE.js
router.use("/kpi/oee", monitorKpiOEERouter);
// 모니터링 / kpi / 설비가동률 - router/monitor/monitorKpiFacilityRate.js
router.use("/kpi/facilityrate", monitorKpiFacilityRateRouter);
// 모니터링 / kpi / 공정불량률 - router/monitor/monitorKpiBadRate.js
router.use("/kpi/badrate", monitorKpiBadRateRouter);
// 모니터링 / kpi / 작업공수 - router/monitor/monitorKpiManHour.js
router.use("/kpi/manhour", monitorKpiManHourRouter);
// 모니터링 / kpi / 시간당생산량 - router/monitor/monitorKpiProductHour.js
router.use("/kpi/producthour", monitorKpiProductHourRouter);

// 모니터링 / 예방보전 현황 - router/monitor/monitorPrevent.js
router.use("/prevent", monitorPreventRouter);
// 모니터링 / 일상점검 현황 - router/monitor/monitorDaily.js
router.use("/daily", monitorDailyRouter);

// 모니터링 / MTBF 현황 - router/monitor/monitorMTBF.js
router.use("/mtbf", monitorMTBFRouter);
// 모니터링 / MTTR 현황 - router/monitor/monitorMTTR.js
router.use("/mttr", monitorMTTRRouter);
// 모니터링 / OEE 현황 - router/monitor/monitorOEE.js
router.use("/oee", monitorOEERouter);

module.exports = router;
