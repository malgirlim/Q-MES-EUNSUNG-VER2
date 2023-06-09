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
    .input("menu", "모니터링_MTTR(설비수리시간)현황") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        ,SUM(COALESCE(수리시간,0)) AS 설비수리시간
        ,SUM(1) AS 수리내역건수
        ,SUM(COALESCE(수리시간,0)) / SUM(1) AS MTTR
        ,50 AS 목표
      FROM
      (
        SELECT
          [FCFIX_PK] AS NO
          ,[FCFIX_FACILITY_FIX_PLAN_PK] AS 설비수리계획NO
          ,FACILITY_FIX_PLAN.설비NO AS 설비NO
          ,FACILITY_FIX_PLAN.설비명 AS 설비명
          ,[FCFIX_TIME] AS 수리시간
        FROM [QMES2022].[dbo].[MANAGE_FACILITY_FIX_TB]
        LEFT JOIN
        (
          SELECT
            [FCFPL_PK] AS NO
            ,[FCFPL_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCFPL_FACILITY_PK]) AS 설비명
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB]
        ) AS FACILITY_FIX_PLAN ON FACILITY_FIX_PLAN.NO = [FCFIX_FACILITY_FIX_PLAN_PK]
        WHERE ( 1 = 1 )
        AND CONVERT(varchar, CONVERT(datetime, [FCFIX_REGIST_DT]), 12) >= '000101'
        AND CONVERT(varchar, CONVERT(datetime, [FCFIX_REGIST_DT]), 12) <= '990101'
      ) AS RESULT
      GROUP BY 설비NO, 설비명
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
    sql =
      `
      SELECT
        설비NO AS 설비NO
        ,설비명 AS 설비명
        ,SUM(COALESCE(수리시간,0)) AS 설비수리시간
        ,SUM(1) AS 수리내역건수
        ,SUM(COALESCE(수리시간,0)) / SUM(1) AS MTTR
        ,50 AS 목표
      FROM
      (
        SELECT
          [FCFIX_PK] AS NO
          ,[FCFIX_FACILITY_FIX_PLAN_PK] AS 설비수리계획NO
          ,FACILITY_FIX_PLAN.설비NO AS 설비NO
          ,FACILITY_FIX_PLAN.설비명 AS 설비명
          ,[FCFIX_TIME] AS 수리시간
        FROM [QMES2022].[dbo].[MANAGE_FACILITY_FIX_TB]
        LEFT JOIN
        (
          SELECT
            [FCFPL_PK] AS NO
            ,[FCFPL_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCFPL_FACILITY_PK]) AS 설비명
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB]
        ) AS FACILITY_FIX_PLAN ON FACILITY_FIX_PLAN.NO = [FCFIX_FACILITY_FIX_PLAN_PK]
        WHERE ( 1 = 1 )
        AND CONVERT(varchar, CONVERT(datetime, [FCFIX_REGIST_DT]), 12) >= ` +
      req.body.startDate +
      `
        AND CONVERT(varchar, CONVERT(datetime, [FCFIX_REGIST_DT]), 12) <= ` +
      req.body.endDate +
      `
      ) AS RESULT
      GROUP BY 설비NO, 설비명
      ORDER BY 설비명 ASC
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
