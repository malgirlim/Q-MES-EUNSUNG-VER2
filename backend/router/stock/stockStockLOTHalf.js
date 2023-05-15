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
    .input("menu", "재고관리_반제품 LOT별 재고현황") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        품목NO AS 품목No
		    ,LOT코드 AS LOT코드
        ,품목구분 AS 품목구분
        ,품번 AS 품번
        ,품명 AS 품명
        ,규격 AS 규격
        ,단위 AS 단위
        ,기초재공재고 AS 기초재공재고
        ,기초재고 AS 기초재고
        ,입고 AS 입고
        ,재공 AS 재공
        ,사용 AS 사용
        ,기말재공재고 AS 기말재공재고
        ,기말재고 AS 기말재고
      FROM
      (
        SELECT
          입고_MIDDLE.품목NO AS 품목NO
			    ,입고_MIDDLE.LOT코드 AS LOT코드
          ,MASTER_ITEM.품목구분 AS 품목구분
          ,MASTER_ITEM.품번 AS 품번
          ,MASTER_ITEM.품명 AS 품명
          ,MASTER_ITEM.규격 AS 규격
          ,MASTER_ITEM.단위 AS 단위
          ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
          ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
          ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
          ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
          ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
          ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
          ,COALESCE(기초재고_MIDDLE.기초재고수,0) + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
        FROM
		    (
          SELECT
            [ITRC_ITEM_PK] AS 품목NO
			      ,[ITRC_CODE] AS LOT코드
            ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
          FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
          WHERE (1=1)
          AND CONVERT(VARCHAR, [ITRC_DT], 12) >= '000101'
          AND CONVERT(VARCHAR, [ITRC_DT], 12) <= '990101'
          GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
        ) AS 입고_MIDDLE
        LEFT JOIN
        (
          SELECT
            [ISPCI_ITEM_PK] AS 품목NO
			      ,[ISPCI_LOTCODE] AS LOT코드
            ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
          FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
          WHERE (1=1)
          AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= '000101'
          AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= '990101'
          GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
        ) AS 재공_MIDDLE ON 재공_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
        LEFT JOIN
        (
          SELECT
            [PDUI_ITEM_PK] AS 품목NO
			      ,[PDUI_LOTCODE] AS LOT코드
            ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
          WHERE (1=1)
          AND CONVERT(VARCHAR, [PDUI_DT], 12) >= '000101'
          AND CONVERT(VARCHAR, [PDUI_DT], 12) <= '990101'
          GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
        ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
        LEFT JOIN
        (
          SELECT
            기초재고_입고_MIDDLE.품목NO AS 품목NO
			      ,기초재고_입고_MIDDLE.LOT코드 AS LOT코드
            ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
            ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
          FROM
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
				      ,[ITRC_CODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ITRC_DT], 12) < '000101'
            GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
          ) AS 기초재고_입고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPCI_ITEM_PK] AS 품목NO
				      ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) < '000101'
            GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
          ) AS 기초재고_재공_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              [PDUI_ITEM_PK] AS 품목NO
				      ,[PDUI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [PDUI_DT], 12) < '000101'
            GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
          ) AS 기초재고_사용_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
        ) AS 기초재고_MIDDLE ON 기초재고_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 기초재고_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
		    LEFT JOIN
		    (
			    SELECT
			      [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
			    FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
		    ) AS MASTER_ITEM ON MASTER_ITEM.NO = 입고_MIDDLE.품목NO
      ) AS RESULT
      WHERE RESULT.품목구분 = '반제품'
      ORDER BY RESULT.LOT코드 DESC
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
          NO AS 품목No
          ,LOT코드 AS LOT코드
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재공재고 AS 기초재공재고
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,재공 AS 재공
          ,사용 AS 사용
          ,기말재공재고 AS 기말재공재고
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            입고_MIDDLE.품목NO AS NO
            ,입고_MIDDLE.LOT코드 AS LOT코드
            ,MASTER_ITEM.품목구분 AS 품목구분
            ,MASTER_ITEM.품번 AS 품번
            ,MASTER_ITEM.품명 AS 품명
            ,MASTER_ITEM.규격 AS 규격
            ,MASTER_ITEM.단위 AS 단위
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
            ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
            ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
            ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
          FROM
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,[ITRC_CODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ITRC_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(VARCHAR, [ITRC_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
          ) AS 입고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
          ) AS 재공_MIDDLE ON 재공_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              [PDUI_ITEM_PK] AS 품목NO
              ,[PDUI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(VARCHAR, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
          ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              기초재고_입고_MIDDLE.품목NO AS 품목NO
              ,기초재고_입고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
              ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) < ` +
        req.body.startDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 기초재고_입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) < ` +
        req.body.startDate +
        `
              GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
            ) AS 기초재고_재공_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) < ` +
        req.body.startDate +
        `
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 기초재고_사용_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
          ) AS 기초재고_MIDDLE ON 기초재고_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 기초재고_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS MASTER_ITEM ON MASTER_ITEM.NO = 입고_MIDDLE.품목NO
        ) AS RESULT
        WHERE (1=1)
        AND RESULT.품목구분 = '반제품'
        AND ( 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%'))
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
          NO AS 품목No
          ,LOT코드 AS LOT코드
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재공재고 AS 기초재공재고
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,재공 AS 재공
          ,사용 AS 사용
          ,기말재공재고 AS 기말재공재고
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            입고_MIDDLE.품목NO AS NO
            ,입고_MIDDLE.LOT코드 AS LOT코드
            ,MASTER_ITEM.품목구분 AS 품목구분
            ,MASTER_ITEM.품번 AS 품번
            ,MASTER_ITEM.품명 AS 품명
            ,MASTER_ITEM.규격 AS 규격
            ,MASTER_ITEM.단위 AS 단위
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
            ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
            ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
            ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
          FROM
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,[ITRC_CODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ITRC_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(VARCHAR, [ITRC_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
          ) AS 입고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
          ) AS 재공_MIDDLE ON 재공_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              [PDUI_ITEM_PK] AS 품목NO
              ,[PDUI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(VARCHAR, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
          ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              기초재고_입고_MIDDLE.품목NO AS 품목NO
              ,기초재고_입고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
              ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) < ` +
        req.body.startDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 기초재고_입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) < ` +
        req.body.startDate +
        `
              GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
            ) AS 기초재고_재공_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) < ` +
        req.body.startDate +
        `
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 기초재고_사용_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
          ) AS 기초재고_MIDDLE ON 기초재고_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 기초재고_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS MASTER_ITEM ON MASTER_ITEM.NO = 입고_MIDDLE.품목NO
        ) AS RESULT
        WHERE (1=1)
        AND RESULT.품목구분 = '반제품'
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
