const express = require("express");
const router = express.Router();

var request = require("request");

const kakaoSendData = {
  수신번호: "010-3258-2466",
  미달건수: "5",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/stocksafenotify/send",
  method: "POST",
  body: kakaoSendData,
  json: true,
};

request.post(options, function (err, res, body) {
  console.log(res.body.result);
});

module.exports = router;
