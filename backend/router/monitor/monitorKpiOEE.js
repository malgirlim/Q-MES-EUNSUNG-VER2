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
    .input("menu", "모니터링_설비종합효율(OEE)(KPI)") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        설비NO AS 설비NO
        ,설비명 AS 설비명
        ,CONVERT(NUMERIC(5,1) ,ROUND(가동효율*100,1)) AS 가동효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(품질효율*100,1)) AS 품질효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(성능효율*100,1)) AS 성능효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(가동효율*품질효율*성능효율*100,1)) AS OEE
        ,95 AS 목표
      FROM
      (
        SELECT
          설비NO AS 설비NO
          ,설비명 AS 설비명
          ,CASE WHEN (SUM(생산시간) > 0) THEN ((SUM(생산시간) - SUM(비가동시간))/SUM(생산시간)) ELSE 0 END AS 가동효율
          ,CASE WHEN (SUM(생산수) > 0) THEN ((SUM(생산수) - SUM(불량수))/SUM(생산수)) ELSE 0 END AS 품질효율
          ,CASE WHEN (SUM(지시수량) > 0) THEN (SUM(생산수)/SUM(지시수량)) ELSE 0 END AS 성능효율
        FROM
        (
          SELECT
            [PDRS_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [PDRS_FACILITY_PK]) AS 설비명
            ,COALESCE(DATEDIFF(minute,CONVERT(varchar, [PDRS_START_DT], 20),CONVERT(varchar, [PDRS_END_DT], 20)),0)/60.0 AS 생산시간
            ,(SELECT COALESCE(SUM(DATEDIFF(minute, CONVERT(varchar, [PDNW_START_DT], 20) ,CONVERT(varchar, [PDNW_END_DT], 20))),0)/60.0
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_NONWORK_TB] WHERE [PDNW_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 비가동시간
            ,(SELECT CONVERT(numeric, COALESCE([ISPC_AMOUNT],0)) FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_PK] = [PDRS_INST_PROCESS_PK]) AS 지시수량
            ,COALESCE([PDRS_PRODUCE_AMT],0) AS 생산수
            ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          WHERE ( 1 = 1 )
          AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) >= '000101'
          AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) <= '990101'
        ) AS RESULT_MIDDLE
        GROUP BY 설비NO, 설비명
      ) AS RESULT
      ORDER BY 설비명 ASC
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
        설비NO AS 설비NO
        ,설비명 AS 설비명
        ,CONVERT(NUMERIC(5,1) ,ROUND(가동효율*100,1)) AS 가동효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(품질효율*100,1)) AS 품질효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(성능효율*100,1)) AS 성능효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(가동효율*품질효율*성능효율*100,1)) AS OEE
        ,95 AS 목표
      FROM
      (
        SELECT
          설비NO AS 설비NO
          ,설비명 AS 설비명
          ,CASE WHEN (SUM(생산시간) > 0) THEN ((SUM(생산시간) - SUM(비가동시간))/SUM(생산시간)) ELSE 0 END AS 가동효율
          ,CASE WHEN (SUM(생산수) > 0) THEN ((SUM(생산수) - SUM(불량수))/SUM(생산수)) ELSE 0 END AS 품질효율
          ,CASE WHEN (SUM(지시수량) > 0) THEN (SUM(생산수)/SUM(지시수량)) ELSE 0 END AS 성능효율
        FROM
        (
          SELECT
            [PDRS_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [PDRS_FACILITY_PK]) AS 설비명
            ,COALESCE(DATEDIFF(minute,CONVERT(varchar, [PDRS_START_DT], 20),CONVERT(varchar, [PDRS_END_DT], 20)),0)/60.0 AS 생산시간
            ,(SELECT COALESCE(SUM(DATEDIFF(minute, CONVERT(varchar, [PDNW_START_DT], 20) ,CONVERT(varchar, [PDNW_END_DT], 20))),0)/60.0
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_NONWORK_TB] WHERE [PDNW_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 비가동시간
            ,(SELECT CONVERT(numeric, COALESCE([ISPC_AMOUNT],0)) FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_PK] = [PDRS_INST_PROCESS_PK]) AS 지시수량
            ,COALESCE([PDRS_PRODUCE_AMT],0) AS 생산수
            ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          WHERE ( 1 = 1 )
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) <= ` +
        req.body.endDate +
        `
        ) AS RESULT_MIDDLE
        GROUP BY 설비NO, 설비명
      ) AS RESULT
      ORDER BY 설비명 ASC
    `;
    } else if (req.body.searchKey == "월별") {
      sql =
        `
      SELECT
        년월 AS 년월
        ,CONVERT(NUMERIC(5,1) ,ROUND(가동효율*100,1)) AS 가동효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(품질효율*100,1)) AS 품질효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(성능효율*100,1)) AS 성능효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(가동효율*품질효율*성능효율*100,1)) AS OEE
        ,95 AS 목표
      FROM
      (
        SELECT
          년월 AS 년월
          ,CASE WHEN (SUM(생산시간) > 0) THEN ((SUM(생산시간) - SUM(비가동시간))/SUM(생산시간)) ELSE 0 END AS 가동효율
          ,CASE WHEN (SUM(생산수) > 0) THEN ((SUM(생산수) - SUM(불량수))/SUM(생산수)) ELSE 0 END AS 품질효율
          ,CASE WHEN (SUM(지시수량) > 0) THEN (SUM(생산수)/SUM(지시수량)) ELSE 0 END AS 성능효율
        FROM
        (
          SELECT
            LEFT(CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 23),7) AS 년월
            ,COALESCE(DATEDIFF(minute,CONVERT(varchar, [PDRS_START_DT], 20),CONVERT(varchar, [PDRS_END_DT], 20)),0)/60.0 AS 생산시간
            ,(SELECT COALESCE(SUM(DATEDIFF(minute, CONVERT(varchar, [PDNW_START_DT], 20) ,CONVERT(varchar, [PDNW_END_DT], 20))),0)/60.0
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_NONWORK_TB] WHERE [PDNW_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 비가동시간
            ,(SELECT CONVERT(numeric, COALESCE([ISPC_AMOUNT],0)) FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_PK] = [PDRS_INST_PROCESS_PK]) AS 지시수량
            ,COALESCE([PDRS_PRODUCE_AMT],0) AS 생산수
            ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          WHERE ( 1 = 1 )
        AND LEFT(CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 23),4) = ` +
        req.body.searchInput +
        `
        ) AS RESULT_MIDDLE
        GROUP BY 년월
      ) AS RESULT
      ORDER BY 년월 ASC
    `;
    } else {
      sql =
        `
      SELECT
        설비NO AS 설비NO
        ,설비명 AS 설비명
        ,CONVERT(NUMERIC(5,1) ,ROUND(가동효율*100,1)) AS 가동효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(품질효율*100,1)) AS 품질효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(성능효율*100,1)) AS 성능효율
        ,CONVERT(NUMERIC(5,1) ,ROUND(가동효율*품질효율*성능효율*100,1)) AS OEE
        ,95 AS 목표
      FROM
      (
        SELECT
          설비NO AS 설비NO
          ,설비명 AS 설비명
          ,CASE WHEN (SUM(생산시간) > 0) THEN ((SUM(생산시간) - SUM(비가동시간))/SUM(생산시간)) ELSE 0 END AS 가동효율
          ,CASE WHEN (SUM(생산수) > 0) THEN ((SUM(생산수) - SUM(불량수))/SUM(생산수)) ELSE 0 END AS 품질효율
          ,CASE WHEN (SUM(지시수량) > 0) THEN (SUM(생산수)/SUM(지시수량)) ELSE 0 END AS 성능효율
        FROM
        (
          SELECT
            [PDRS_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [PDRS_FACILITY_PK]) AS 설비명
            ,COALESCE(DATEDIFF(minute,CONVERT(varchar, [PDRS_START_DT], 20),CONVERT(varchar, [PDRS_END_DT], 20)),0)/60.0 AS 생산시간
            ,(SELECT COALESCE(SUM(DATEDIFF(minute, CONVERT(varchar, [PDNW_START_DT], 20) ,CONVERT(varchar, [PDNW_END_DT], 20))),0)/60.0
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_NONWORK_TB] WHERE [PDNW_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 비가동시간
            ,(SELECT CONVERT(numeric, COALESCE([ISPC_AMOUNT],0)) FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_PK] = [PDRS_INST_PROCESS_PK]) AS 지시수량
            ,COALESCE([PDRS_PRODUCE_AMT],0) AS 생산수
            ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          WHERE ( 1 = 1 )
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, [PDRS_START_DT]), 12) <= ` +
        req.body.endDate +
        `
        ) AS RESULT_MIDDLE
        GROUP BY 설비NO, 설비명
      ) AS RESULT
      ORDER BY 설비명 ASC
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
