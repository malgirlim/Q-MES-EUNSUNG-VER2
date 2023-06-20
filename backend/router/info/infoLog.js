const express = require("express");
const moment = require("moment-timezone");
const bodyParser = require("body-parser");
// const database = require("./database");
const { sql, pool } = require("../../mssql");

const multer = require("multer"); // 파일 업로드에 필요
const path = require("path"); // 파일 업로드에 필요

const router = express.Router();

router.use(bodyParser.json());

router.use(express.urlencoded({ extended: false })); // 파일 업로드에 필요
router.use(express.json()); // 파일 업로드에 필요
router.use(express.static(`${__dirname}/public`)); // 파일 업로드에 필요

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// #### *** 로그기록 저장함수 *** ####
const logSend = async (type, ct, amount, user) => {
  const Pool = await pool;
  await Pool.request() // 로그기록 저장
    .input("type", type)
    .input("menu", "관리자메뉴_Log조회") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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

// 조회
router.get("/", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [LOG_PK] AS NO
        ,[LOG_TYPE] AS 타입
        ,[LOG_MENU] AS 메뉴
        ,[LOG_CONTENT] AS 내용
        ,[LOG_DATA_AMT] AS 데이터사용량
        ,[LOG_REGIST_NM] AS 등록자
        ,[LOG_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_LOG_TB]
      ORDER BY [LOG_PK] DESC
    `);

    // 로그기록 저장
    await logSend(
      (type = "메뉴열람"),
      (ct = "메뉴를 열람함."),
      (amount = result.recordset.length ?? 0),
      (user = req.query.user ?? "")
    );

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    // 로그기록 저장
    await logSend(
      (type = "에러"),
      (ct = err.message ?? ""),
      (amount = 0),
      (user = req.query.user ?? "")
    );
    res.status(500);
    res.send(err.message);
  }
});

router.post("/", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 타입 AS 타입, 메뉴 AS 메뉴, 내용 AS 내용, 데이터사용량 AS 데이터사용량,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [LOG_PK] AS NO
            ,[LOG_TYPE] AS 타입
            ,[LOG_MENU] AS 메뉴
            ,[LOG_CONTENT] AS 내용
            ,[LOG_DATA_AMT] AS 데이터사용량
            ,[LOG_REGIST_NM] AS 등록자
            ,[LOG_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_LOG_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 타입 like concat('%',@input,'%')
        OR 메뉴 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
        OR 데이터사용량 like concat('%',@input,'%')
        OR 등록자 like concat('%',@input,'%')
        OR 등록일시 like concat('%',@input,'%'))
        ORDER BY ` +
        req.body.sortKey +
        ` ` +
        req.body.sortOrder +
        `
      `;
    } else {
      sql =
        `
        SELECT
          NO AS NO, 타입 AS 타입, 메뉴 AS 메뉴, 내용 AS 내용, 데이터사용량 AS 데이터사용량,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [LOG_PK] AS NO
            ,[LOG_TYPE] AS 타입
            ,[LOG_MENU] AS 메뉴
            ,[LOG_CONTENT] AS 내용
            ,[LOG_DATA_AMT] AS 데이터사용량
            ,[LOG_REGIST_NM] AS 등록자
            ,[LOG_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_LOG_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ` +
        req.body.searchKey +
        ` like concat('%',@input,'%')
        ORDER BY ` +
        req.body.sortKey +
        ` ` +
        req.body.sortOrder +
        `
      `;
    }

    const Pool = await pool;
    const result = await Pool.request()
      .input("input", req.body.searchInput)
      .query(sql);

    // 로그기록 저장
    await logSend(
      (type = "조회"),
      (ct =
        req.body.searchKey +
        " 조건으로 '" +
        req.body.searchInput +
        "' 을 조회. (" +
        req.body.startDate +
        "-" +
        req.body.endDate +
        ")"),
      (amount = result.recordset.length ?? 0),
      (user = req.body.user ?? "")
    );

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    // 로그기록 저장
    await logSend(
      (type = "에러"),
      (ct = err.message ?? ""),
      (amount = 0),
      (user = req.body.user ?? "")
    );
    res.status(500);
    res.send(err.message);
  }
});

// ########################################   나머지 기능   #############################################################

module.exports = router;
