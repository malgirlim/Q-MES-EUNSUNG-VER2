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
    .input("menu", "모니터링_MTBF(설비고장간격)현황") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
    const result = await Pool.request().query(
      `
      SELECT
        설비NO AS 설비NO
        ,설비명 AS 설비명
        ,COALESCE(SUM(COALESCE(DATEDIFF(minute, 이전고장일시,시작일시),0)),0) AS 고장간격시간
        ,SUM(1) AS 고장내역건수
        ,COALESCE(SUM(COALESCE(DATEDIFF(minute, 이전고장일시,시작일시),0)),0)/SUM(1) AS MTBF
        ,10000 AS 목표
      FROM
      (
        SELECT
          NO AS NO
          ,설비NO AS 설비NO
          ,설비명 AS 설비명
          ,시작일시 AS 시작일시
          ,(SELECT MAX(CONVERT(VARCHAR, [FCER_START_DT], 20)) FROM [QMES2022].[dbo].[MANAGE_FACILITY_ERROR_TB]
            WHERE [FCER_PK] < RESULT_MIDDLE.NO AND [FCER_FACILITY_PK] = RESULT_MIDDLE.설비NO) AS 이전고장일시
        FROM
        (
          SELECT
            [FCER_PK] AS NO
            ,[FCER_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCER_FACILITY_PK]) AS 설비명
            ,CONVERT(VARCHAR, [FCER_START_DT], 20) AS 시작일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_ERROR_TB]
          WHERE ( 1 = 1 )
        AND CONVERT(varchar, CONVERT(datetime, [FCER_START_DT]), 12) >= '000101'
        AND CONVERT(varchar, CONVERT(datetime, [FCER_START_DT]), 12) <= '990101'
        ) AS RESULT_MIDDLE
      ) AS RESULT
      GROUP BY 설비NO, 설비명
      ORDER BY [설비명] ASC
    `
    );

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
    sql =
      `
      SELECT
        설비NO AS 설비NO
        ,설비명 AS 설비명
        ,COALESCE(SUM(COALESCE(DATEDIFF(minute, 이전고장일시,시작일시),0)),0) AS 고장간격시간
        ,SUM(1) AS 고장내역건수
        ,COALESCE(SUM(COALESCE(DATEDIFF(minute, 이전고장일시,시작일시),0)),0)/SUM(1) AS MTBF
        ,10000 AS 목표
      FROM
      (
        SELECT
          NO AS NO
          ,설비NO AS 설비NO
          ,설비명 AS 설비명
          ,시작일시 AS 시작일시
          ,(SELECT MAX(CONVERT(VARCHAR, [FCER_START_DT], 20)) FROM [QMES2022].[dbo].[MANAGE_FACILITY_ERROR_TB]
            WHERE [FCER_PK] < RESULT_MIDDLE.NO AND [FCER_FACILITY_PK] = RESULT_MIDDLE.설비NO) AS 이전고장일시
        FROM
        (
          SELECT
            [FCER_PK] AS NO
            ,[FCER_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCER_FACILITY_PK]) AS 설비명
            ,CONVERT(VARCHAR, [FCER_START_DT], 20) AS 시작일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_ERROR_TB]
          WHERE ( 1 = 1 )
        AND CONVERT(varchar, CONVERT(datetime, [FCER_START_DT]), 12) >= ` +
      req.body.startDate +
      `
        AND CONVERT(varchar, CONVERT(datetime, [FCER_START_DT]), 12) <= ` +
      req.body.endDate +
      `
        ) AS RESULT_MIDDLE
      ) AS RESULT
      GROUP BY 설비NO, 설비명
      ORDER BY [설비명] ASC
    `;

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
