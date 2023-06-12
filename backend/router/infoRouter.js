const express = require("express");
const router = express.Router();

const infoLogRouter = require("./info/infoLog");

const infoAnnounRouter = require("./info/infoAnnoun");

const orderForecastRouter = require("./info/orderForecast");
const orderNotifyRouter = require("./info/orderNotify");

const stockSafeNotifyRouter = require("./info/stockSafeNotify");

const preventPreventForecastRouter = require("./info/preventPreventForecast");
const preventPreventNotifyRouter = require("./info/preventPreventNotify");

const preventErrorNotifyRouter = require("./info/preventErrorNotify");

const preventDailyNotifyRouter = require("./info/preventDailyNotify");

const preventRepairForecastRouter = require("./info/preventRepairForecast");
const preventRepairNotifyRouter = require("./info/preventRepairNotify");

const preventChangeNotifyRouter = require("./info/preventChangeNotify");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 정보 / 로그 - router/info/infoLog.js
router.use("/log", infoLogRouter);

// 공유정보 / 공지사항 - router/info/infoAnnoun.js
router.use("/announ", infoAnnounRouter);

// 주문관리 / 수주대비납품 예보 - router/info/orderForecast.js
router.use("/order/forecast", orderForecastRouter);
// 주문관리 / 수주대비납품 통보 - router/info/orderNotify.js
router.use("/order/notify", orderNotifyRouter);

// 재고관리 / 안전재고미달 통보 - router/info/stockSafeNotify.js
router.use("/stock/safe/notify", stockSafeNotifyRouter);

// 예방보전 / 예방보전 예보 - router/info/preventPreventForecast.js
router.use("/prevent/prevent/forecast", preventPreventForecastRouter);
// 예방보전 / 예방보전 통보 - router/info/preventPreventNotify.js
router.use("/prevent/prevent/notify", preventPreventNotifyRouter);

// 예방보전 / 설비고장 통보 - router/info/preventErrorNotify.js
router.use("/prevent/error/notify", preventErrorNotifyRouter);

// 예방보전 / 일상점검 통보 - router/info/preventDailyNotify.js
router.use("/prevent/daily/notify", preventDailyNotifyRouter);

// 예방보전 / 설비수리 예보 - router/info/preventRepairForecast.js
router.use("/prevent/repair/forecast", preventRepairForecastRouter);
// 예방보전 / 설비수리 통보 - router/info/preventRepairNotify.js
router.use("/prevent/repair/notify", preventRepairNotifyRouter);

// 예방보전 / 설비부품교체 통보 - router/info/preventChangeNotify.js
router.use("/prevent/change/notify", preventChangeNotifyRouter);

module.exports = router;
