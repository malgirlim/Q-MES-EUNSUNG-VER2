const express = require("express");
const router = express.Router();

const stockModalRouter = require("./stock/stockModal");

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

const stockStockLOTRawRouter = require("./stock/stockStockLOTRaw");
const stockStockLOTHalfRouter = require("./stock/stockStockLOTHalf");
const stockStockLOTFinRouter = require("./stock/stockStockLOTFin");

const stockFCLTPartReceiveRouter = require("./stock/stockFCLTPartReceive");
const stockFCLTPartReleaseRouter = require("./stock/stockFCLTPartRelease");
const stockFCLTPartStockRouter = require("./stock/stockFCLTPartStock");
const stockFCLTPartStockLOTRouter = require("./stock/stockFCLTPartStockLOT");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 재고관리 / 모달 - router/stock/stockModal.js
router.use("/modal", stockModalRouter);

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

// 재고관리 / 원부자재 LOT별 재고현황 - router/stock/stockStockLOTRaw.js
router.use("/stock/lot/raw", stockStockLOTRawRouter);
// 재고관리 / 반제품 LOT별 재고현황 - router/stock/stockStockLOTHalf.js
router.use("/stock/lot/half", stockStockLOTHalfRouter);
// 재고관리 / 완제품 LOT별 재고현황 - router/stock/stockStockLOTFin.js
router.use("/stock/lot/fin", stockStockLOTFinRouter);

// 재고관리 / 설비부품 입고 조회 - router/stock/stockFCLTPartReceive.js
router.use("/fcltpart/receive", stockFCLTPartReceiveRouter);
// 재고관리 / 설비부품 출고 조회 - router/stock/stockFCLTPartRelease.js
router.use("/fcltpart/release", stockFCLTPartReleaseRouter);
// 재고관리 / 설비부품 재고 조회 - router/stock/stockFCLTPartStock.js
router.use("/fcltpart/stock", stockFCLTPartStockRouter);
// 재고관리 / 설비부품 LOT재고 조회 - router/stock/stockFCLTPartStockLOT.js
router.use("/fcltpart/stock/lot", stockFCLTPartStockLOTRouter);

module.exports = router;
