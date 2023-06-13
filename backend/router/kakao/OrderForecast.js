const dayjs = require("dayjs");

const express = require("express");
const router = express.Router();

var request = require("request");

const now = dayjs().format("HH:mm");

const active = true; // 기능 활성화 여부
const time = "16:59"; // 설정 시간

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

request_post(); //최초 즉시 실행

setInterval(() => request_post(), 60000); // 이후 60초마다 실행

function request_post() {
  if (active == true && time == dayjs().format("HH:mm")) {
    request.post(options, function (err, res, body) {
      console.log(
        dayjs().format("YYYY-MM-DD HH:mm:ss") + ": " + res.body.result
      );
    });
  }
}

module.exports = router;
