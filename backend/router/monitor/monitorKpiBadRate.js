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
    .input("menu", "모니터링_공정불량률(KPI)") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        공정NO AS 공정NO
        ,공정명 AS 공정명
        ,SUM(생산수) AS 총생산수
        ,SUM(불량수) AS 총불량수
        ,CASE WHEN (SUM(생산수) > 0) THEN CONVERT(NUMERIC(5,1) ,ROUND(SUM(불량수)/SUM(생산수)*100.0,1)) ELSE 0 END AS 불량률
        ,1.5 AS 목표
      FROM
      (
        SELECT
          INSTRUCT_PROCESS.공정NO AS 공정NO
          ,INSTRUCT_PROCESS.공정명 AS 공정명
          ,COALESCE([PDRS_PRODUCE_AMT],0) AS 생산수
          ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
        LEFT JOIN
        (
          SELECT
            [ISPC_PK] AS NO
            ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
            ,[ISPC_PROCESS_PK] AS 공정NO
            ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
          FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
        ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = [PDRS_INST_PROCESS_PK]
        WHERE ( 1 = 1 )
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) >= '000101'
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) <= '990101'
      ) AS RESULT
      GROUP BY 공정NO, 공정명
      ORDER BY 공정명 ASC
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
    if (req.body.searchKey == "설비별") {
      sql =
        `
      SELECT
        공정NO AS 공정NO
        ,공정명 AS 공정명
        ,SUM(생산수) AS 총생산수
        ,SUM(불량수) AS 총불량수
        ,CASE WHEN (SUM(생산수) > 0) THEN CONVERT(NUMERIC(5,1) ,ROUND(SUM(불량수)/SUM(생산수)*100.0,1)) ELSE 0 END AS 불량률
        ,1.5 AS 목표
      FROM
      (
        SELECT
          INSTRUCT_PROCESS.공정NO AS 공정NO
          ,INSTRUCT_PROCESS.공정명 AS 공정명
          ,COALESCE([PDRS_PRODUCE_AMT],0) AS 생산수
          ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
        LEFT JOIN
        (
          SELECT
            [ISPC_PK] AS NO
            ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
            ,[ISPC_PROCESS_PK] AS 공정NO
            ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
          FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
        ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = [PDRS_INST_PROCESS_PK]
        WHERE ( 1 = 1 )
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) <= ` +
        req.body.endDate +
        `
      ) AS RESULT
      GROUP BY 공정NO, 공정명
      ORDER BY 공정명 ASC
    `;
    } else if (req.body.searchKey == "월별") {
      sql =
        `
      SELECT
        년월 AS 년월
        ,SUM(생산수) AS 총생산수
        ,SUM(불량수) AS 총불량수
        ,CASE WHEN (SUM(생산수) > 0) THEN CONVERT(NUMERIC(5,1) ,ROUND(SUM(불량수*1.0)/SUM(생산수*1.0)*100.0,1)) ELSE 0 END AS 불량률
        ,1.5 AS 목표
      FROM
      (
        SELECT
          LEFT(CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 23),7) AS 년월
          ,COALESCE([PDRS_PRODUCE_AMT],0) AS 생산수
          ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
        WHERE ( 1 = 1 )
        AND LEFT(CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 23),4) = ` +
        req.body.searchInput +
        `
      ) AS RESULT
      GROUP BY 년월
      ORDER BY 년월 ASC
    `;
    } else {
      sql =
        `
      SELECT
        공정NO AS 공정NO
        ,공정명 AS 공정명
        ,SUM(생산수) AS 총생산수
        ,SUM(불량수) AS 총불량수
        ,CASE WHEN (SUM(생산수) > 0) THEN CONVERT(NUMERIC(5,1) ,ROUND(SUM(불량수)/SUM(생산수)*100.0,1)) ELSE 0 END AS 불량률
        ,1.5 AS 목표
      FROM
      (
        SELECT
          INSTRUCT_PROCESS.공정NO AS 공정NO
          ,INSTRUCT_PROCESS.공정명 AS 공정명
          ,COALESCE([PDRS_PRODUCE_AMT],0) AS 생산수
          ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
        LEFT JOIN
        (
          SELECT
            [ISPC_PK] AS NO
            ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
            ,[ISPC_PROCESS_PK] AS 공정NO
            ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
          FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
        ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = [PDRS_INST_PROCESS_PK]
        WHERE ( 1 = 1 )
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) <= ` +
        req.body.endDate +
        `
      ) AS RESULT
      GROUP BY 공정NO, 공정명
      ORDER BY 공정명 ASC
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
