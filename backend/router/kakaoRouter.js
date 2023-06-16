const express = require("express");
const router = express.Router();

const OrderForecast = require("./kakao/OrderForecast");
const OrderNotify = require("./kakao/OrderNotify");
const PreventChangeNotify = require("./kakao/PreventChangeNotify");
const PreventDailyNotify = require("./kakao/PreventDailyNotify");
const PreventErrorNotify = require("./kakao/PreventErrorNotify");
const PreventForecast = require("./kakao/PreventForecast");
const PreventNotice = require("./kakao/PreventNotice");
const PreventRepairForecast = require("./kakao/PreventRepairForecast");
const PreventRepairNotify = require("./kakao/PreventRepairNotify");
const StockSafeNotify = require("./kakao/StockSafeNotify");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

module.exports = router;
