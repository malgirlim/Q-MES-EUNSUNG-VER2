const dayjs = require("dayjs");
const express = require("express");
const request = require("request");
const { sql, pool } = require("../../mssql");
const router = express.Router();

const kakaoSendData = {
  수신번호: "010-3258-2466",
  점검수: "20",
  점검항목수: "30",
  설비명: "인쇄1호기",
  담당자: "고범석",
  직급: "주임",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/preventdailynotify/send",
  method: "POST",
  body: kakaoSendData,
  json: true,
};

request.post(options, function (err, res, body) {
  console.log(res.body.result);
});

module.exports = router;
