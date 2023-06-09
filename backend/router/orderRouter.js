const express = require("express");
const router = express.Router();

const orderAcceptRouter = require("./order/orderAccept");
const orderDeliveryRouter = require("./order/orderDelivery");
const orderOrderRouter = require("./order/orderOrder");
const orderFacilityPartRouter = require("./order/orderFacilityPart");

const orderProfitRouter = require("./order/orderProfit");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 주문관리 / 수주 관리 - router/order/orderAccept.js
router.use("/accept", orderAcceptRouter);

// 주문관리 / 납품 관리 - router/order/orderDelivery.js
router.use("/delivery", orderDeliveryRouter);

// 주문관리 / 발주 관리 - router/order/orderOrder.js
router.use("/order", orderOrderRouter);

// 주문관리 / 설비부품발주 관리 - router/order/orderFacilityPart.js
router.use("/facilitypart", orderFacilityPartRouter);

// 해담솔 사업관리 / 품목별이익 관리 - router/order/orderProfit.js
router.use("/profit", orderProfitRouter);

module.exports = router;
