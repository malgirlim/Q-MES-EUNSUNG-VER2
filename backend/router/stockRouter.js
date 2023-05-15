const express = require("express");
const router = express.Router();

const stockReceiveRawRouter = require("./stock/stockReceiveRaw");
const stockReceiveHalfRouter = require("./stock/stockReceiveHalf");
const stockReceiveFinRouter = require("./stock/stockReceiveFin");

const stockProcessRawRouter = require("./stock/stockProcessRaw");
const stockProcessHalfRouter = require("./stock/stockProcessHalf");

const stockProcessStockRawRouter = require("./stock/stockProcessStockRaw");
const stockProcessStockHalfRouter = require("./stock/stockProcessStockHalf");

const stockReleaseRawRouter = require("./stock/stockReleaseRaw");
const stockReleaseHalfRouter = require("./stock/stockReleaseHalf");

const stockStockRawRouter = require("./stock/stockStockRaw");
const stockStockHalfRouter = require("./stock/stockStockHalf");
const stockStockFinRouter = require("./stock/stockStockFin");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 재고관리 / 원부자재 입고 조회 - router/stock/stockReceiveRaw.js
router.use("/receive/raw", stockReceiveRawRouter);
// 재고관리 / 반제품 입고 조회 - router/stock/stockReceiveHalf.js
router.use("/receive/half", stockReceiveHalfRouter);
// 재고관리 / 완제품 입고 조회 - router/stock/stockReceiveFin.js
router.use("/receive/fin", stockReceiveFinRouter);

// 재고관리 / 원부자재 재공 조회 - router/stock/stockProcessRaw.js
router.use("/process/raw", stockProcessRawRouter);
// 재고관리 / 반제품 재공 조회 - router/stock/stockProcessHalf.js
router.use("/process/half", stockProcessHalfRouter);

// 재고관리 / 원부자재 재공현황 - router/stock/stockProcessStockRaw.js
router.use("/processstock/raw", stockProcessStockRawRouter);
// 재고관리 / 반제품 재공현황 - router/stock/stockProcessStockHalf.js
router.use("/processstock/half", stockProcessStockHalfRouter);

// 재고관리 / 원부자재 사용 - router/stock/stockReleaseRaw.js
router.use("/release/raw", stockReleaseRawRouter);
// 재고관리 / 반제품 사용 - router/stock/stockReleaseHalf.js
router.use("/release/half", stockReleaseHalfRouter);

// 재고관리 / 원부자재 재고현황 - router/stock/stockStockRaw.js
router.use("/stock/raw", stockStockRawRouter);
// 재고관리 / 반제품 재고현황 - router/stock/stockStockHalf.js
router.use("/stock/half", stockStockHalfRouter);
// 재고관리 / 완제품 재고현황 - router/stock/stockStockFin.js
router.use("/stock/fin", stockStockFinRouter);

module.exports = router;
