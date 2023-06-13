const express = require("express");
const router = express.Router();

var request = require("request");

const kakaoSendData = {
  수신번호: "010-3258-2466",
  수주코드: "RES111002231",
  거래처명: "TEST거래처",
  품명: "TEST품명",
  수량: "100",
  납기일: "2023-06-09",
  납기경과일: "3",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/ordernotify/send",
  method: "POST",
  body: kakaoSendData,
  json: true,
};

request.post(options, function (err, res, body) {
  console.log(res.body.result);
});

module.exports = router;
