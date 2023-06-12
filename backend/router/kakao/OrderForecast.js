const dayjs = require("dayjs");

const express = require("express");
const router = express.Router();

var request = require("request");

const active = true;
const time = dayjs().format("YYYY-MM-DD HH:mm:ss");
const receive_num = "";

const kakaoSendData = {
  수신번호: "010-3258-2466",
  납기잔여일: "3",
  수주코드: "RES111003323",
  거래처명: "TEST거래처",
  품명: "TEST품명",
  수량: "100",
  납기일: "2023-06-15",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/orderforecast/send",
  method: "POST",
  body: kakaoSendData,
  json: true,
};

setInterval(() => {
  // request.post(options, function (err, res, body) {
  //   console.log(res.body.result);
  // });
}, 60000);

module.exports = router;
