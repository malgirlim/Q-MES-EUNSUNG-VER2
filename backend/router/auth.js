const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { sql, pool } = require("../mssql");
const moment = require("moment-timezone");

router.use(bodyParser.json());
router.use(cookieParser());

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

const jwtKey = "abc1234567";

// #### *** 로그기록 저장함수 *** ####
const logSend = async (type, ct, amount, user) => {
  const Pool = await pool;
  await Pool.request() // 로그기록 저장
    .input("type", type)
    .input("menu", "로그인") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
    .input("content", ct.substr(0, 500))
    .input("amount", amount)
    .input("user", user)
    .input("dt", moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"))
    .query(`
      INSERT INTO [QMES2022].[dbo].[MANAGE_LOG_TB]
      ([LOG_TYPE],[LOG_MENU],[LOG_CONTENT],[LOG_DATA_AMT],[LOG_REGIST_NM],[LOG_REGIST_DT])
      VALUES (@type,@menu,@content,@amount,@user,@dt)
    `);
};

// const members = [
//   {
//     id: 1,
//     name: "황병구",
//     part: "품질개발부",
//     rank: "부장",
//     loginId: "admin",
//     loginPw: "1234",
//   },
//   {
//     id: 2,
//     name: "홍길동",
//     part: "영업팀",
//     rank: "사원",
//     loginId: "a",
//     loginPw: "1",
//   },
// ];

// 토큰 확인
router.get("/", (req, res) => {
  if (req.cookies && req.cookies.token) {
    jwt.verify(req.cookies.token, jwtKey, (err, decoded) => {
      if (err) {
        return res.sendStatus(401);
      }
      res.send(decoded);
    });
  } else {
    res.sendStatus(401);
  }
});

// 로그인
router.post("/", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request()
      .input("loginId", req.body.loginId)
      .input("loginPw", req.body.loginPw).query(`
      SELECT
        [USER_ID] AS id,
        [USER_PW] AS 비밀번호,
        [USER_NAME] AS name,
        [USER_PHONE] AS 연락처,
        [USER_EMAIL] AS 이메일,
        [USER_DEPART] AS part,
        [USER_POSITION] AS 직책,
        [USER_RANK] AS rank,
        [USER_REGIST_NM] AS 등록자,
        [USER_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_USER_TB]
      WHERE [USER_ID] = @loginId
      AND [USER_PW] = @loginPw
    `);

    if (result.recordset.length) {
      const options = {
        path: "/",
        httpOnly: true,
      };

      const token = jwt.sign(
        {
          id: result.recordset[0].id,
          name: result.recordset[0].name,
          part: result.recordset[0].part,
          rank: result.recordset[0].rank,
        },
        jwtKey,
        {
          expiresIn: "24h",
          issuer: "malgirlim",
        }
      );
      res.cookie("token", token, options);
      res.send(JSON.stringify(result.recordset[0]));

      logSend(
        (type = "로그인"),
        (ct = result.recordset[0].id + "가 로그인 되었습니다."),
        (amount = 0),
        (user = result.recordset[0].id)
      );
    } else {
      logSend(
        (type = "실패"),
        (ct =
          req.body.loginId +
          "로 로그인을 시도하였지만 없는 데이터로 실패하였습니다."),
        (amount = 0),
        (user = "")
      );
      res.sendStatus(404);
    }
  } catch (err) {
    // 로그기록 저장
    await logSend(
      (type = "에러"),
      (ct = err.message ?? ""),
      (amount = 0),
      (user = "")
    );
    res.status(500);
    res.send(err.message);
  }
  // const loginId = req.body.loginId;
  // const loginPw = req.body.loginPw;
  // const member = members.find(
  //   (m) => m.loginId === loginId && m.loginPw === loginPw
  // );

  // if (member) {
  //   const options = {
  //     path: "/",
  //     httpOnly: true,
  //   };

  //   const token = jwt.sign(
  //     {
  //       id: member.id,
  //       name: member.name,
  //       part: member.part,
  //       rank: member.rank,
  //     },
  //     jwtKey,
  //     {
  //       expiresIn: "24h",
  //       issuer: "malgirlim",
  //     }
  //   );
  //   res.cookie("token", token, options);
  //   res.send(member);
  // } else {
  //   res.sendStatus(404);
  // }
});

// 로그아웃
router.delete("/", (req, res) => {
  if (req.cookies && req.cookies.token) {
    res.clearCookie("token");
  }
  logSend(
    (type = "로그아웃"),
    (ct = req.query.user + "가 로그아웃 되었습니다."),
    (amount = 0),
    (user = req.query.user)
  );
  res.sendStatus(200);
});

module.exports = router;
