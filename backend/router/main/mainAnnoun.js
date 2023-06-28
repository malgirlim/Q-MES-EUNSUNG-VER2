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
    .input("menu", "메인_공지사항") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [NOTC_PK] AS NO
        ,[NOTC_DIV] AS 구분
        ,[NOTC_TITLE] AS 제목
        ,[NOTC_CONTENT] AS 내용
        ,[NOTC_NOTE] AS 비고
        ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [NOTC_REGIST_NM]) AS 등록자
        ,CONVERT(varchar,[NOTC_REGIST_DT],20) AS 등록일시
      FROM [QMES2022].[dbo].[SHARE_NOTICE_TB]
      ORDER BY [NOTC_REGIST_DT] DESC
    `);

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
    if (req.body.searchKey == "구분") {
      sql = `
        SELECT
          NO AS NO, 구분 AS 구분, 제목 AS 제목, 내용 AS 내용, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [NOTC_PK] AS NO
            ,[NOTC_DIV] AS 구분
            ,[NOTC_TITLE] AS 제목
            ,[NOTC_CONTENT] AS 내용
            ,[NOTC_NOTE] AS 비고
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [NOTC_REGIST_NM]) AS 등록자
            ,CONVERT(varchar,[NOTC_REGIST_DT],20) AS 등록일시
          FROM [QMES2022].[dbo].[SHARE_NOTICE_TB]
        ) AS RESULT
        WHERE (1=1)
        AND 구분 = @input
        ORDER BY 등록일시 DESC
      `;
    } else {
      sql = `
        SELECT
          [NOTC_PK] AS NO
          ,[NOTC_DIV] AS 구분
          ,[NOTC_TITLE] AS 제목
          ,[NOTC_CONTENT] AS 내용
          ,[NOTC_NOTE] AS 비고
          ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [NOTC_REGIST_NM]) AS 등록자
          ,CONVERT(varchar,[NOTC_REGIST_DT],20) AS 등록일시
        FROM [QMES2022].[dbo].[SHARE_NOTICE_TB]
        ORDER BY [NOTC_REGIST_DT] DESC
      `;
    }

    const Pool = await pool;
    const result = await Pool.request()
      .input("input", req.body.searchInput)
      .query(sql);

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
