const express = require("express");
const router = express.Router();

var request = require("request");

const kakaoSendData = {
  수신번호: "010-3258-2466",
  설비명: "인쇄1호기",
  발생일시: "2023-06-11 14:56:20",
  부서: "스마트사업부",
  담당자: "고범석",
  직급: "주임",
  연락처: "010-1234-5678",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/preventerrornotify/send",
  method: "POST",
  body: kakaoSendData,
  json: true,
};

request.post(options, function (err, res, body) {
  console.log(res.body.result);
});

module.exports = router;
