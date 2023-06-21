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
    .input("menu", "주문관리_품목별이익") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        품목NO AS 품목NO
        ,ITEM.품번 AS 품번
        ,ITEM.품목구분 AS 품목구분
        ,ITEM.품명 AS 품명
        ,ITEM.규격 AS 규격
        ,ITEM.단위 AS 단위
        ,ITEM.단가 AS 단가
        ,총수량 AS 총수량
        ,COALESCE(CONVERT(numeric,COALESCE(ITEM.단가,0)),0) * 총수량 AS 소계
        ,총공급가액 - 총세액 AS 총공급가액
        ,총세액 AS 총세액
        ,총공급가액 AS 총액
      FROM
      (
        SELECT
          품목NO AS 품목NO
          ,SUM(수량) AS 총수량
          ,SUM(공급가액) AS 총공급가액
          ,SUM(세액) AS 총세액
        FROM
        (
          SELECT
            [ACPT_ITEM_PK] AS 품목NO
            ,CASE WHEN ([ACPT_AMOUNT]='' OR [ACPT_AMOUNT]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_AMOUNT]) END AS 수량
            ,CASE WHEN ([ACPT_UNIT_COST]='' OR [ACPT_UNIT_COST]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_UNIT_COST]) END AS 단가
            ,CASE WHEN ([ACPT_SUPPLY_COST]='' OR [ACPT_SUPPLY_COST]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_SUPPLY_COST]) END AS 공급가액
            ,CASE WHEN ([ACPT_TAX_COST]='' OR [ACPT_TAX_COST]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_TAX_COST]) END AS 세액
          FROM [QMES2022].[dbo].[MANAGE_ACCEPT_TB]
        ) AS RESULT_MIDDLE
        GROUP BY 품목NO
      ) AS RESULT
      LEFT JOIN
      (
        SELECT
          [ITEM_PK] AS NO
          ,[ITEM_DIV] AS 품목구분
          ,[ITEM_PRODUCT_NUM] AS 품번
          ,[ITEM_NAME] AS 품명
          ,[ITEM_SIZE] AS 규격
          ,[ITEM_UNIT] AS 단위
          ,[ITEM_COST] AS 단가
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
      ) AS ITEM ON ITEM.NO = 품목NO
      ORDER BY [품번] DESC
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
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          품목NO AS 품목NO
          ,ITEM.품번 AS 품번
          ,ITEM.품목구분 AS 품목구분
          ,ITEM.품명 AS 품명
          ,ITEM.규격 AS 규격
          ,ITEM.단위 AS 단위
          ,ITEM.단가 AS 단가
          ,총수량 AS 총수량
          ,COALESCE(CONVERT(numeric,COALESCE(ITEM.단가,0)),0) * 총수량 AS 소계
          ,총공급가액 - 총세액 AS 총공급가액
          ,총세액 AS 총세액
          ,총공급가액 AS 총액
        FROM
        (
          SELECT
            품목NO AS 품목NO
            ,SUM(수량) AS 총수량
            ,SUM(공급가액) AS 총공급가액
            ,SUM(세액) AS 총세액
          FROM
          (
            SELECT
              [ACPT_ITEM_PK] AS 품목NO
              ,CASE WHEN ([ACPT_AMOUNT]='' OR [ACPT_AMOUNT]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_AMOUNT]) END AS 수량
              ,CASE WHEN ([ACPT_UNIT_COST]='' OR [ACPT_UNIT_COST]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_UNIT_COST]) END AS 단가
              ,CASE WHEN ([ACPT_SUPPLY_COST]='' OR [ACPT_SUPPLY_COST]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_SUPPLY_COST]) END AS 공급가액
              ,CASE WHEN ([ACPT_TAX_COST]='' OR [ACPT_TAX_COST]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_TAX_COST]) END AS 세액
            FROM [QMES2022].[dbo].[MANAGE_ACCEPT_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, CONVERT(datetime, [ACPT_DATE]), 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, CONVERT(datetime, [ACPT_DATE]), 12) <= ` +
        req.body.endDate +
        `
          ) AS RESULT_MIDDLE
          GROUP BY 품목NO
        ) AS RESULT
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
            ,[ITEM_COST] AS 단가
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = 품목NO
        AND ( 품번 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 기준 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 단가 like concat('%',@input,'%')
        OR 총수량 like concat('%',@input,'%')
        OR 소계 like concat('%',@input,'%')
        OR 총공급가액 like concat('%',@input,'%')
        OR 총세액 like concat('%',@input,'%')
        OR 총액 like concat('%',@input,'%'))
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
          품목NO AS 품목NO
          ,ITEM.품번 AS 품번
          ,ITEM.품목구분 AS 품목구분
          ,ITEM.품명 AS 품명
          ,ITEM.규격 AS 규격
          ,ITEM.단위 AS 단위
          ,ITEM.단가 AS 단가
          ,총수량 AS 총수량
          ,COALESCE(CONVERT(numeric,COALESCE(ITEM.단가,0)),0) * 총수량 AS 소계
          ,총공급가액 - 총세액 AS 총공급가액
          ,총세액 AS 총세액
          ,총공급가액 AS 총액
        FROM
        (
          SELECT
            품목NO AS 품목NO
            SUM(수량) AS 총수량
            SUM(공급가액) AS 총공급가액
            SUM(세액) AS 총세액
          FROM
          (
            SELECT
              [ACPT_ITEM_PK] AS 품목NO
              ,CASE WHEN ([ACPT_AMOUNT]='' OR [ACPT_AMOUNT]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_AMOUNT]) END AS 수량
              ,CASE WHEN ([ACPT_UNIT_COST]='' OR [ACPT_UNIT_COST]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_UNIT_COST]) END AS 단가
              ,CASE WHEN ([ACPT_SUPPLY_COST]='' OR [ACPT_SUPPLY_COST]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_SUPPLY_COST]) END AS 공급가액
              ,CASE WHEN ([ACPT_TAX_COST]='' OR [ACPT_TAX_COST]='NaN') THEN 0 ELSE CONVERT(numeric,[ACPT_TAX_COST]) END AS 세액
            FROM [QMES2022].[dbo].[MANAGE_ACCEPT_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, CONVERT(datetime, [ACPT_DATE]), 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, CONVERT(datetime, [ACPT_DATE]), 12) <= ` +
        req.body.endDate +
        `
          ) AS RESULT_MIDDLE
          GROUP BY 품목NO
        ) AS RESULT
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
            ,[ITEM_COST] AS 단가
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = 품목NO
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
