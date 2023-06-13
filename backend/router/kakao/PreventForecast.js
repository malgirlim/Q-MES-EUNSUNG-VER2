const express = require("express");
const router = express.Router();

var request = require("request");

const kakaoSendData = {
  수신번호: "010-3258-2466",
  잔여일: "3",
  계획일: "2023-06-15",
  설비명: "인쇄1호기",
  구분: "테스트 구분",
  내용: "테스트 내용",
  담당자: "고범석",
  직급: "주임",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/preventforecast/send",
  method: "POST",
  body: kakaoSendData,
  json: true,
};

request.post(options, function (err, res, body) {
  console.log(res.body.result);
});

module.exports = router;
