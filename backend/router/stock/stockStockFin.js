const express = require("express");
const moment = require("moment-timezone");
const bodyParser = require("body-parser");
// const database = require("./database");
const { sql, pool } = require("../../mssql");

const router = express.Router();
router.use(bodyParser.json());

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// #### *** 로그기록 저장함수 *** ####
const logSend = async (type, ct, amount, user) => {
  const Pool = await pool;
  await Pool.request() // 로그기록 저장
    .input("type", type)
    .input("menu", "재고관리_완제품 재고현황") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        NO AS 품목NO
        ,품목구분 AS 품목구분
        ,품번 AS 품번
        ,품명 AS 품명
        ,규격 AS 규격
        ,단위 AS 단위
        ,기초재고 AS 기초재고
        ,입고 AS 입고
        ,출하 AS 출하
        ,기말재고 AS 기말재고
        ,안전재고 AS 안전재고
      FROM
      (
        SELECT
          [ITEM_PK] AS NO
          ,[ITEM_DIV] AS 품목구분
          ,[ITEM_PRODUCT_NUM] AS 품번
          ,[ITEM_NAME] AS 품명
          ,[ITEM_SIZE] AS 규격
          ,[ITEM_UNIT] AS 단위
          ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
          ,SUM(RESULT_MIDDLE.입고수량) AS 입고
          ,SUM(RESULT_MIDDLE.출하수량) AS 출하
          ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
          ,[ITEM_SAFE] AS 안전재고
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
		LEFT JOIN
        (
          SELECT
            입고_MIDDLE.품목NO AS 품목NO
            ,0 AS 기초재고
            ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
            ,COALESCE(출하_MIDDLE.출하수량,0) AS 출하수량
            ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출하_MIDDLE.출하수량,0) AS 기말재고
          FROM
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) >= '000101'
            AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) <= '990101'
            GROUP BY [ITRC_ITEM_PK]
          ) AS 입고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [DLVR_ITEM_PK] AS 품목NO
              ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
            FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) >= '000101'
            AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) <= '990101'
            AND [DLVR_RESULT] = '합격'
            GROUP BY [DLVR_ITEM_PK]
          ) AS 출하_MIDDLE ON 출하_MIDDLE.품목NO = 입고_MIDDLE.품목NO

          UNION

          SELECT
            입고_기초재고_MIDDLE.품목NO AS 품목NO
            ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기초재고
            ,0 AS 입고수량
            ,0 AS 출하수량
            ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기말재고
          FROM
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) < '000101'
            GROUP BY [ITRC_ITEM_PK]
          ) AS 입고_기초재고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [DLVR_ITEM_PK] AS 품목NO
              ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
            FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) < '000101'
            AND [DLVR_RESULT] = '합격'
            GROUP BY [DLVR_ITEM_PK]
          ) AS 출하_기초재고_MIDDLE ON 출하_기초재고_MIDDLE.품목NO = 입고_기초재고_MIDDLE.품목NO
        ) AS RESULT_MIDDLE ON RESULT_MIDDLE.품목NO = [ITEM_PK]
        WHERE [ITEM_DIV] = '완제품'
        GROUP BY [ITEM_PK],[ITEM_DIV],[ITEM_PRODUCT_NUM],[ITEM_NAME],[ITEM_SIZE],[ITEM_UNIT],[ITEM_SAFE]
      ) AS RESULT
      ORDER BY 품목NO DESC
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
          NO AS 품목NO
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,출하 AS 출하
          ,기말재고 AS 기말재고
          ,안전재고 AS 안전재고
        FROM
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고수량) AS 입고
            ,SUM(RESULT_MIDDLE.출하수량) AS 출하
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
            ,[ITEM_SAFE] AS 안전재고
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          LEFT JOIN
          (
            SELECT
              입고_MIDDLE.품목NO AS 품목NO
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
              ,COALESCE(출하_MIDDLE.출하수량,0) AS 출하수량
              ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출하_MIDDLE.출하수량,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [DLVR_ITEM_PK] AS 품목NO
                ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
              FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) <= ` +
        req.body.endDate +
        `
              AND [DLVR_RESULT] = '합격'
              GROUP BY [DLVR_ITEM_PK]
            ) AS 출하_MIDDLE ON 출하_MIDDLE.품목NO = 입고_MIDDLE.품목NO

            UNION

            SELECT
              입고_기초재고_MIDDLE.품목NO AS 품목NO
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기초재고
              ,0 AS 입고수량
              ,0 AS 출하수량
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [ITRC_ITEM_PK]
            ) AS 입고_기초재고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [DLVR_ITEM_PK] AS 품목NO
                ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
              FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) < ` +
        req.body.startDate +
        `
              AND [DLVR_RESULT] = '합격'
              GROUP BY [DLVR_ITEM_PK]
            ) AS 출하_기초재고_MIDDLE ON 출하_기초재고_MIDDLE.품목NO = 입고_기초재고_MIDDLE.품목NO
          ) AS RESULT_MIDDLE ON RESULT_MIDDLE.품목NO = [ITEM_PK]
          WHERE [ITEM_DIV] = '완제품'
          GROUP BY [ITEM_PK],[ITEM_DIV],[ITEM_PRODUCT_NUM],[ITEM_NAME],[ITEM_SIZE],[ITEM_UNIT],[ITEM_SAFE]
        ) AS RESULT
        WHERE (1=1)
        AND ( 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 기초재고 like concat('%',@input,'%')
        OR 입고 like concat('%',@input,'%')
        OR 출하 like concat('%',@input,'%')
        OR 기말재고 like concat('%',@input,'%'))
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
          NO AS 품목NO
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,출하 AS 출하
          ,기말재고 AS 기말재고
          ,안전재고 AS 안전재고
        FROM
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고수량) AS 입고
            ,SUM(RESULT_MIDDLE.출하수량) AS 출하
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
            ,[ITEM_SAFE] AS 안전재고
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          LEFT JOIN
          (
            SELECT
              입고_MIDDLE.품목NO AS 품목NO
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
              ,COALESCE(출하_MIDDLE.출하수량,0) AS 출하수량
              ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출하_MIDDLE.출하수량,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [DLVR_ITEM_PK] AS 품목NO
                ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
              FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) <= ` +
        req.body.endDate +
        `
              AND [DLVR_RESULT] = '합격'
              GROUP BY [DLVR_ITEM_PK]
            ) AS 출하_MIDDLE ON 출하_MIDDLE.품목NO = 입고_MIDDLE.품목NO

            UNION

            SELECT
              입고_기초재고_MIDDLE.품목NO AS 품목NO
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기초재고
              ,0 AS 입고수량
              ,0 AS 출하수량
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [ITRC_ITEM_PK]
            ) AS 입고_기초재고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [DLVR_ITEM_PK] AS 품목NO
                ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
              FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) < ` +
        req.body.startDate +
        `
              AND [DLVR_RESULT] = '합격'
              GROUP BY [DLVR_ITEM_PK]
            ) AS 출하_기초재고_MIDDLE ON 출하_기초재고_MIDDLE.품목NO = 입고_기초재고_MIDDLE.품목NO
          ) AS RESULT_MIDDLE ON RESULT_MIDDLE.품목NO = [ITEM_PK]
          WHERE [ITEM_DIV] = '완제품'
          GROUP BY [ITEM_PK],[ITEM_DIV],[ITEM_PRODUCT_NUM],[ITEM_NAME],[ITEM_SIZE],[ITEM_UNIT],[ITEM_SAFE]
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
        "' 을 조회."),
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
