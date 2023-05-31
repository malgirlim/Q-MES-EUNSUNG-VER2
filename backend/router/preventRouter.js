const express = require("express");
const router = express.Router();

const preventModalRouter = require("./prevent/preventModal");

const preventPreventPlanRouter = require("./prevent/preventPreventPlan");
const preventDailyPlanRouter = require("./prevent/preventDailyPlan");
const preventRepairPlanRouter = require("./prevent/preventRepairPlan");

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

// 예방보전 / 설비수리계획 - router/prevent/preventRepairPlan.js
router.use("/repairplan", preventRepairPlanRouter);

module.exports = router;
