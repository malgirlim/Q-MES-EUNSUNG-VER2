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
const stockRouter = require("./router/stockRouter");
const qualityRouter = require("./router/qualityRouter");
const monitorRouter = require("./router/monitorRouter");

const kioskRouter = require("./router/kioskRouter");

const uploadRouter = require("./router/uploadRouter");
const smsRouter = require("./router/smsRouter");
const kakaoRouter = require("./router/kakaoRouter");

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

// 로그 또는 알림정보 - router/info.js
app.use("/api/info", infoRouter);

// 기준정보 - router/masterRouter.js
app.use("/api/master", masterRouter);

// 주문관리 - router/orderRouter.js
app.use("/api/order", orderRouter);

// 생산관리 - router/productionrRouter.js
app.use("/api/production", productionRouter);

// 재고관리 - router/stockRouter.js
app.use("/api/stock", stockRouter);

// 품질관리 - router/qualityRouter.js
app.use("/api/quality", qualityRouter);

// 모니터링 - router/monitorRouter.js
app.use("/api/monitor", monitorRouter);

// 키오스크 - router/kioskRouter.js
app.use("/api/kiosk", kioskRouter);

// 파일 업로드 - uploadRouter.js
app.use("/api/upload", uploadRouter);

// SMS 전송 - smsRouter.js
app.use("/api/sms", smsRouter);

// 카카오알림톡 전송 - kakaoRouter.js
app.use("/api/kakao", kakaoRouter);

app.listen(port, () => {
  console.log(`Q-MES app listening on port ${port}`);
});
