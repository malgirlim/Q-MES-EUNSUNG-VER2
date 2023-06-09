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
    .input("menu", "메인_작업공수(KPI)") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        년월 AS 년월
        ,CONVERT(NUMERIC(15,1) ,ROUND(SUM(생산시간),1)) AS 총작업시간
        ,CONVERT(NUMERIC(15,1) ,ROUND(SUM(비가동시간),1)) AS 총비가동시간
        ,CONVERT(NUMERIC(5,1) ,ROUND((SUM(생산시간) - SUM(비가동시간)),1)) AS 작업공수
        ,280 AS 목표
      FROM
      (
        SELECT
          LEFT(CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 23),7) AS 년월
          ,COALESCE(DATEDIFF(minute,CONVERT(varchar, [PDRS_START_DT], 20),CONVERT(varchar, [PDRS_END_DT], 20)),0)/60.0 AS 생산시간
          ,(SELECT COALESCE(SUM(DATEDIFF(minute, CONVERT(varchar, [PDNW_START_DT], 20) ,CONVERT(varchar, [PDNW_END_DT], 20))),0)/60.0
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_NONWORK_TB] WHERE [PDNW_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 비가동시간
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
        WHERE ( 1 = 1 )
        AND LEFT(CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 23),4) = LEFT(CONVERT(varchar, CONVERT(datetime, GETDATE()), 23),4)
      ) AS RESULT
      GROUP BY 년월
      ORDER BY 년월 ASC
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

// ########################################   나머지 기능   #############################################################

module.exports = router;
