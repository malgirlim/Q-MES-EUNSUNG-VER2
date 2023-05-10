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
  apikey: "6nmulsjffp1tdf801ib37h0wps6qnrv6",
  // (알리고셋팅 - IdenTifier)
  userid: "malgirlim",
};

const 설비명 = "테스트 1호기";
const 날짜 = "2023-04-11";
const 시간 = "15:32:12";
const 부서 = "스마트사업부";
const 이름 = "윤호상";
const 직책 = "차장";
const 연락처 = "010-3258-2466";
var token_result = "";

async function alimtalkSend(req, res, cellPhone) {
  var result = false;

  req.body = {
    type: "d",
    time: 1,
  };

  await aligoapi
    .token(req, AuthData)
    .then((r) => {
      token_result = r.token;
    })
    .catch((e) => {
      console.log(e);
    });
  req.body = {
    token: token_result,
    senderkey: "5695e9e99227766b6b56587fd220c5098b0e6ac4",
    tpl_code: "TM_6890",
    sender: "0415531569",
    receiver_1: `${cellPhone}`,
    subject_1: "가동중단",
    emtitle_1: 설비명 + " 중요 알림",
    message_1:
      "설비의 가동이 중단되었습니다.\n" +
      "\n설비명 : " +
      설비명 +
      "\n발생일시 : " +
      날짜 +
      " " +
      시간 +
      "\n설비 담당자 : \n" +
      부서 +
      " " +
      이름 +
      " " +
      직책 +
      "\n" +
      연락처,
    failover: "Y",
    fsubject_1: "실패제목",
    fmessage_1: "실패내용",
  };

  aligoapi
    .alimtalkSend(req, AuthData)
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

router.post("/send", async (req, res) => {
  //console.log("req.body.phone : " + JSON.stringify(req.body.phone));
  var phone = JSON.stringify(req.body.phone);

  var kakaoSend = alimtalkSend(req, res, phone);

  if (kakaoSend) {
    res.send({ result: "success" });
  } else {
    res.send({ result: "fail" });
  }
});

module.exports = router;
