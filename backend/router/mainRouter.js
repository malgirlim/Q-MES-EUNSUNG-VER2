const express = require("express");
const router = express.Router();

const mainFacilityStatusRouter = require("./main/mainFacilityStatus");

const mainAnnounRouter = require("./main/mainAnnoun");

const mainKpiBadRateRouter = require("./main/mainKpiBadRate");
const mainKpiFacilityRateRouter = require("./main/mainKpiFacilityRate");
const mainKpiManHourRouter = require("./main/mainKpiManHour");
const mainKpiOEERouter = require("./main/mainKpiOEE");
const mainKpiProductHourRouter = require("./main/mainKpiProductHour");
const mainKpiReturnCostRouter = require("./main/mainKpiReturnCost");
const mainKpiStockCostRouter = require("./main/mainKpiStockCost");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 메인 / 설비상태 - router/main/mainFacilityStatus.js
router.use("/facilitystatus", mainFacilityStatusRouter);

// 메인 / 공지사항 - router/main/mainAnnoun.js
router.use("/announ", mainAnnounRouter);

// 메인 / KPI / 공정불량률 - router/main/mainKpiBadRate.js
router.use("/kpi/badrate", mainKpiBadRateRouter);
// 메인 / KPI / 설비가동률 - router/main/mainKpiFacilityRate.js
router.use("/kpi/facilityrate", mainKpiFacilityRateRouter);
// 메인 / KPI / 작업공수 - router/main/mainKpiManHour.js
router.use("/kpi/manhour", mainKpiManHourRouter);
// 메인 / KPI / OEE - router/main/mainKpiOEE.js
router.use("/kpi/oee", mainKpiOEERouter);
// 메인 / KPI / 시간당생산량 - router/main/mainKpiProductHour.js
router.use("/kpi/producthour", mainKpiProductHourRouter);
// 메인 / KPI / 반품비용 - router/main/mainKpiReturnCost.js
router.use("/kpi/returncost", mainKpiReturnCostRouter);
// 메인 / KPI / 재고비용 - router/main/mainKpiStockCost.js
router.use("/kpi/stockcost", mainKpiStockCostRouter);

module.exports = router;
