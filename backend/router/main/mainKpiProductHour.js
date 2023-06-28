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
    .input("menu", "메인_시간당생산량(KPI)") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        년월 AS 년월
        ,ROUND(SUM(생산시간),1) AS 총생산시간
        ,ROUND(SUM(생산수 - 불량수),1) AS 총생산수
        ,CASE WHEN (SUM(생산시간) > 0) THEN ROUND((SUM(생산수*1.0 - 불량수*1.0)/SUM(생산시간*1.0)),1) ELSE 0 END AS 시간당생산수
        ,2750 AS 목표
      FROM
      (
        SELECT
          LEFT(CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 23), 7) AS 년월
          ,COALESCE(DATEDIFF(minute,CONVERT(varchar, [PDRS_START_DT], 20),CONVERT(varchar, [PDRS_END_DT], 20)),0)/60.0 AS 생산시간
          ,COALESCE([PDRS_PRODUCE_AMT],0) AS 생산수
          ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
        WHERE ( 1 = 1 )
        AND LEFT(CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 23), 4) = LEFT(CONVERT(varchar, CONVERT(datetime, GETDATE()), 23), 4)
      ) AS RESULT
      GROUP BY 년월
      ORDER BY 년월 ASC
    `
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

// ########################################   나머지 기능   #############################################################

module.exports = router;
