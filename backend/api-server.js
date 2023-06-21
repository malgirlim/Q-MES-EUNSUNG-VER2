const express = require("express");
const app = express();
const port = 3000;

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const authRouter = require("./router/auth");
const infoRouter = require("./router/infoRouter");

const masterRouter = require("./router/masterRouter");
const orderRouter = require("./router/orderRouter");
const productionRouter = require("./router/productionRouter");
const processRouter = require("./router/processRouter");
const stockRouter = require("./router/stockRouter");
const qualityRouter = require("./router/qualityRouter");
const moldRouter = require("./router/moldRouter");
const monitorRouter = require("./router/monitorRouter");
const preventRouter = require("./router/preventRouter");

const kioskRouter = require("./router/kioskRouter");

const uploadRouter = require("./router/uploadRouter");
const kakaoRouter = require("./router/kakaoRouter");

const scheduleRouter = require("./router/scheduleRouter");

app.use(
  express.json({
    limit: "10mb",
  })
);
app.use(
  express.urlencoded({
    limit: "10mb",
    extended: false,
  })
);

// 로그인 - router/auth.js
app.use("/api/auth", authRouter);

// 로그 또는 알림,공지사항정보 - router/info.js
app.use("/api/info", infoRouter);

// 기준정보 - router/masterRouter.js
app.use("/api/master", masterRouter);

// 주문관리 - router/orderRouter.js
app.use("/api/order", orderRouter);

// 생산관리 - router/productionrRouter.js
app.use("/api/production", productionRouter);

// 공정관리 - router/processRouter.js
app.use("/api/process", processRouter);

// 재고관리 - router/stockRouter.js
app.use("/api/stock", stockRouter);

// 품질관리 - router/qualityRouter.js
app.use("/api/quality", qualityRouter);

// 금형관리 - router/moldRouter.js
app.use("/api/mold", moldRouter);

// 모니터링 - router/monitorRouter.js
app.use("/api/monitor", monitorRouter);

// 예방보전 - router/preventRouter.js
app.use("/api/prevent", preventRouter);

// 키오스크 - router/kioskRouter.js
app.use("/api/kiosk", kioskRouter);

// 파일 업로드 - uploadRouter.js
app.use("/api/upload", uploadRouter);

// 카카오알림톡 전송 - kakaoRouter.js
app.use("/api/kakao", kakaoRouter);

// 예약 작업 - scheduleRouter.js
app.use("/api/schedule", scheduleRouter);

app.listen(port, () => {
  console.log(`Q-MES app listening on port ${port}`);
});
