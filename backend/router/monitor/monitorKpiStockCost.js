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
    .input("menu", "모니터링_재고비용 (KPI)") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        t1.년월
        ,SUM(t2.입고비용) AS 누적입고비용
        ,SUM(t2.사용비용) AS 누적사용비용
        ,SUM(t2.출하비용) AS 누적출하비용
        ,SUM(t2.재고비용) AS 누적재고비용
        ,12000000 AS 목표
      FROM
      (
        SELECT
          RESULT.년월 AS 년월
          ,SUM(입고비용) AS 입고비용
          ,SUM(사용비용) AS 사용비용
          ,SUM(출하비용) AS 출하비용
          ,SUM(재고비용) AS 재고비용
        FROM
        (
          SELECT
            MASTER_ITEM.[ITEM_PK] AS 품목NO
            ,RESULT_MIDDEL.년월 AS 년월
            ,SUM(RESULT_MIDDEL.입고수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 입고비용
            ,SUM(RESULT_MIDDEL.사용수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 사용비용
            ,SUM(RESULT_MIDDEL.출하수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 출하비용
            ,SUM(RESULT_MIDDEL.입고수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) -
            SUM(RESULT_MIDDEL.사용수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) -
            SUM(RESULT_MIDDEL.출하수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 재고비용
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB] AS MASTER_ITEM
          LEFT JOIN
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),7) AS 년월
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              ,0 AS 사용수
              ,0 AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),4) <= '9999'
            GROUP BY [ITRC_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),7)

            UNION

            SELECT
              [PDUI_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),7) AS 년월
              ,0 AS 입고수
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              ,0 AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),4) <= '9999'
            GROUP BY [PDUI_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),7)

            UNION

            SELECT
              [DLVR_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),7) AS 년월
              ,0 AS 입고수
              ,0 AS 사용수
              ,COALESCE(SUM(CONVERT(numeric, [DLVR_AMOUNT])),0) AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
            WHERE (1 = 1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),4) <= '9999'
            AND [DLVR_RESULT] = '합격'
            GROUP BY [DLVR_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),7)
          ) AS RESULT_MIDDEL ON RESULT_MIDDEL.품목NO = MASTER_ITEM.ITEM_PK
          GROUP BY [ITEM_PK],[ITEM_COST],RESULT_MIDDEL.년월
        ) AS RESULT
        GROUP BY RESULT.년월
      ) AS t1
      JOIN (
        SELECT
          RESULT.년월 AS 년월
          ,SUM(입고비용) AS 입고비용
          ,SUM(사용비용) AS 사용비용
          ,SUM(출하비용) AS 출하비용
          ,SUM(재고비용) AS 재고비용
        FROM
        (
          SELECT
            MASTER_ITEM.[ITEM_PK] AS 품목NO
            ,RESULT_MIDDEL.년월 AS 년월
            ,SUM(RESULT_MIDDEL.입고수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 입고비용
            ,SUM(RESULT_MIDDEL.사용수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 사용비용
            ,SUM(RESULT_MIDDEL.출하수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 출하비용
            ,SUM(RESULT_MIDDEL.입고수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) -
            SUM(RESULT_MIDDEL.사용수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) -
            SUM(RESULT_MIDDEL.출하수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 재고비용
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB] AS MASTER_ITEM
          LEFT JOIN
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),7) AS 년월
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              ,0 AS 사용수
              ,0 AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),4) <= '9999'
            GROUP BY [ITRC_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),7)

            UNION

            SELECT
              [PDUI_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),7) AS 년월
              ,0 AS 입고수
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              ,0 AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),4) <= '9999'
            GROUP BY [PDUI_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),7)

            UNION

            SELECT
              [DLVR_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),7) AS 년월
              ,0 AS 입고수
              ,0 AS 사용수
              ,COALESCE(SUM(CONVERT(numeric, [DLVR_AMOUNT])),0) AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
            WHERE (1 = 1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),4) <= '9999'
            AND [DLVR_RESULT] = '합격'
            GROUP BY [DLVR_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),7)
          ) AS RESULT_MIDDEL ON RESULT_MIDDEL.품목NO = MASTER_ITEM.ITEM_PK
          GROUP BY [ITEM_PK],[ITEM_COST],RESULT_MIDDEL.년월
        ) AS RESULT
        GROUP BY RESULT.년월
      ) t2 ON t2.년월 <= t1.년월
      GROUP BY t1.년월
      ORDER BY t1.년월
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
        t1.년월
        ,SUM(t2.입고비용) AS 누적입고비용
        ,SUM(t2.사용비용) AS 누적사용비용
        ,SUM(t2.출하비용) AS 누적출하비용
        ,SUM(t2.재고비용) AS 누적재고비용
        ,12000000 AS 목표
      FROM
      (
        SELECT
          RESULT.년월 AS 년월
          ,SUM(입고비용) AS 입고비용
          ,SUM(사용비용) AS 사용비용
          ,SUM(출하비용) AS 출하비용
          ,SUM(재고비용) AS 재고비용
        FROM
        (
          SELECT
            MASTER_ITEM.[ITEM_PK] AS 품목NO
            ,RESULT_MIDDEL.년월 AS 년월
            ,SUM(RESULT_MIDDEL.입고수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 입고비용
            ,SUM(RESULT_MIDDEL.사용수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 사용비용
            ,SUM(RESULT_MIDDEL.출하수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 출하비용
            ,SUM(RESULT_MIDDEL.입고수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) -
            SUM(RESULT_MIDDEL.사용수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) -
            SUM(RESULT_MIDDEL.출하수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 재고비용
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB] AS MASTER_ITEM
          LEFT JOIN
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),7) AS 년월
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              ,0 AS 사용수
              ,0 AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),4) <= ` +
      req.body.searchInput +
      `
            GROUP BY [ITRC_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),7)

            UNION

            SELECT
              [PDUI_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),7) AS 년월
              ,0 AS 입고수
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              ,0 AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),4) <= ` +
      req.body.searchInput +
      `
            GROUP BY [PDUI_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),7)

            UNION

            SELECT
              [DLVR_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),7) AS 년월
              ,0 AS 입고수
              ,0 AS 사용수
              ,COALESCE(SUM(CONVERT(numeric, [DLVR_AMOUNT])),0) AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
            WHERE (1 = 1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),4) <= ` +
      req.body.searchInput +
      `
            AND [DLVR_RESULT] = '합격'
            GROUP BY [DLVR_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),7)
          ) AS RESULT_MIDDEL ON RESULT_MIDDEL.품목NO = MASTER_ITEM.ITEM_PK
          GROUP BY [ITEM_PK],[ITEM_COST],RESULT_MIDDEL.년월
        ) AS RESULT
        GROUP BY RESULT.년월
      ) AS t1
      JOIN (
        SELECT
          RESULT.년월 AS 년월
          ,SUM(입고비용) AS 입고비용
          ,SUM(사용비용) AS 사용비용
          ,SUM(출하비용) AS 출하비용
          ,SUM(재고비용) AS 재고비용
        FROM
        (
          SELECT
            MASTER_ITEM.[ITEM_PK] AS 품목NO
            ,RESULT_MIDDEL.년월 AS 년월
            ,SUM(RESULT_MIDDEL.입고수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 입고비용
            ,SUM(RESULT_MIDDEL.사용수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 사용비용
            ,SUM(RESULT_MIDDEL.출하수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 출하비용
            ,SUM(RESULT_MIDDEL.입고수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) -
            SUM(RESULT_MIDDEL.사용수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) -
            SUM(RESULT_MIDDEL.출하수)*COALESCE(MASTER_ITEM.[ITEM_COST],0) AS 재고비용
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB] AS MASTER_ITEM
          LEFT JOIN
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),7) AS 년월
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              ,0 AS 사용수
              ,0 AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),4) <= ` +
      req.body.searchInput +
      `
            GROUP BY [ITRC_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [ITRC_DT]), 23),7)

            UNION

            SELECT
              [PDUI_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),7) AS 년월
              ,0 AS 입고수
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              ,0 AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),4) <= ` +
      req.body.searchInput +
      `
            GROUP BY [PDUI_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [PDUI_DT]), 23),7)

            UNION

            SELECT
              [DLVR_ITEM_PK] AS 품목NO
              ,LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),7) AS 년월
              ,0 AS 입고수
              ,0 AS 사용수
              ,COALESCE(SUM(CONVERT(numeric, [DLVR_AMOUNT])),0) AS 출하수
            FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
            WHERE (1 = 1)
            AND LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),4) <= ` +
      req.body.searchInput +
      `
            AND [DLVR_RESULT] = '합격'
            GROUP BY [DLVR_ITEM_PK], LEFT(CONVERT(varchar, CONVERT(datetime, [DLVR_DT]), 23),7)
          ) AS RESULT_MIDDEL ON RESULT_MIDDEL.품목NO = MASTER_ITEM.ITEM_PK
          GROUP BY [ITEM_PK],[ITEM_COST],RESULT_MIDDEL.년월
        ) AS RESULT
        GROUP BY RESULT.년월
      ) t2 ON t2.년월 <= t1.년월
      GROUP BY t1.년월
      ORDER BY t1.년월
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
