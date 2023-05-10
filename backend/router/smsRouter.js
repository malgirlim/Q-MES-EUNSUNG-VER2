var express = require("express");
const bodyParser = require("body-parser");
const aligoapi = require("aligoapi");
const router = express.Router();

//router.use(bodyParser.urlencoded({ extends: true }));
router.use(bodyParser.json());

router.use((req, res, next) => {
  next();
});

var AuthData = {
  // (알리고셋팅 - 발급키)
  key: "6nmulsjffp1tdf801ib37h0wps6qnrv6",

  // (알리고셋팅 - IdenTifier)
  user_id: "malgirlim",
};

async function sendAction(req, res, cellPhone, authenticationCode) {
  var result = false;
  req.body = {
    /*** 필수값입니다 START ***/
    sender: "0415531569", // (최대 16bytes) 발신번호(알리고셋팅에서 설정한 발신번호)
    receiver: `${cellPhone}`, // 컴마()분기 입력으로 최대 1천명
    msg: `[Q-MES] 테스트 발송 [${authenticationCode}]`, // (1~2,000Byte)
    /*** 필수값입니다 END ***/
    //   msg_type: SMS(단문), LMS(장문), MMS(그림문자)
    //   title: 문자제목(LMS, MMS만 허용) // (1~44Byte)
    //   destination: %고객명% 치환용 입력
    //   rdate: 예약일(현재일이상) // YYYYMMDD
    //   rtime: 예약시간-현재시간기준 10분이후 // HHMM
    //   image: 첨부이미지 // JPEG, PNG, GIF
  };
  // req.body 요청값 예시입니다.

  await aligoapi
    .send(req, AuthData)
    .then((r) => {
      console.log(r);
      if (r.result_code == 1) {
        result = true;
      } else {
        result = false;
      }
    })
    .catch((e) => {
      console.log(r);
      result = false;
    });

  return result;
}

/*  */
router.post("/send", async (req, res) => {
  console.log("req.body.phone : " + JSON.stringify(req.body.phone));
  var phone = JSON.stringify(req.body.phone);
  console.log(phone);

  // var phone = "01032582466";
  var authentication_code = Math.floor(Math.random() * 90000) + 1;
  var smsSend = sendAction(req, res, phone, authentication_code);

  if (smsSend) {
    res.send({ result: "success" });
  } else {
    res.send({ result: "fail" });
  }
});

module.exports = router;
