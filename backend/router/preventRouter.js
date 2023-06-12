const express = require("express");
const router = express.Router();

const preventModalRouter = require("./prevent/preventModal");

const preventPreventPlanRouter = require("./prevent/preventPreventPlan");
const preventDailyPlanRouter = require("./prevent/preventDailyPlan");
const preventDailyCheckRouter = require("./prevent/preventDailyCheck");
const preventRepairPlanRouter = require("./prevent/preventRepairPlan");
const preventLifePlanRouter = require("./prevent/preventLifePlan");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 예방보전 / 모달 - router/prevent/modal.js
router.use("/modal", preventModalRouter);

// 예방보전 / 예방보전계획 - router/prevent/preventPreventPlan.js
router.use("/preventplan", preventPreventPlanRouter);

// 예방보전 / 일상점검계획 - router/prevent/preventDailyPlan.js
router.use("/dailyplan", preventDailyPlanRouter);
// 예방보전 / 일상점검확인 - router/prevent/preventDailyCheck.js
router.use("/dailycheck", preventDailyCheckRouter);

// 예방보전 / 설비수리계획 - router/prevent/preventRepairPlan.js
router.use("/repairplan", preventRepairPlanRouter);

// 예방보전 / 설비부품수명계획 - router/prevent/preventLifePlan.js
router.use("/lifeplan", preventLifePlanRouter);

module.exports = router;
