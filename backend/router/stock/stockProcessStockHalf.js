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
    .input("menu", "재고관리_반제품 재공현황") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
          작업지시공정NO AS 작업지시공정NO
          ,작업코드 AS 작업코드
          ,공정 AS 공정
          ,LOT코드 AS LOT코드
          ,품목NO AS 품목NO
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,불출수 AS 불출수
          ,사용수 AS 사용수
          ,재공수 AS 재공수
        FROM
        (
          SELECT
            RESULT_MIDDLE.작업지시공정NO AS 작업지시공정NO
            ,INSTRUCT_PROCESS.작업코드 AS 작업코드
            ,INSTRUCT_PROCESS.공정명 AS 공정
            ,RESULT_MIDDLE.품목NO AS 품목NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,COALESCE(RESULT_MIDDLE.불출수,0) AS 불출수
            ,COALESCE(RESULT_MIDDLE.사용수,0) AS 사용수
            ,COALESCE(RESULT_MIDDLE.재공수,0) AS 재공수
          FROM
          (
            SELECT
              불출.작업지시공정NO AS 작업지시공정NO
              ,불출.품목NO AS 품목NO
              ,불출.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= '000101'
            AND CONVERT(varchar, [ISPCI_DT], 12) <= '990101'
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 불출
            LEFT JOIN
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= '000101'
              AND CONVERT(varchar, [PDUI_DT], 12) <= '990101'
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용 ON 사용.작업지시공정NO = 불출.작업지시공정NO AND 사용.품목NO = 불출.품목NO AND 사용.LOT코드 = 불출.LOT코드

            UNION

            SELECT
              사용.작업지시공정NO AS 작업지시공정NO
              ,사용.품목NO AS 품목NO
              ,사용.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= '000101'
              AND CONVERT(varchar, [PDUI_DT], 12) <= '990101'
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용
            LEFT JOIN
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= '000101'
            AND CONVERT(varchar, [ISPCI_DT], 12) <= '990101'
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
			      ) AS 불출 ON 불출.작업지시공정NO = 사용.작업지시공정NO AND 불출.품목NO = 사용.품목NO AND 불출.LOT코드 = 사용.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPC_PK] AS NO
              ,(SELECT [WKIS_CODE] FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = [ISPC_WORK_INSTRUCT_PK]) AS 작업코드
              ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = RESULT_MIDDLE.작업지시공정NO
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [ITEM_CLIENT_PK]) AS 거래처명
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_CAR] AS 차종
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
              ,[ITEM_SAFE] AS 안전재고
              ,[ITEM_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = RESULT_MIDDLE.품목NO
          WHERE ITEM.품목구분 = '반제품'
        ) AS RESULT
        WHERE 재공수 != 0
        ORDER BY 작업코드 ASC
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
          작업지시공정NO AS 작업지시공정NO
          ,작업코드 AS 작업코드
          ,공정 AS 공정
          ,LOT코드 AS LOT코드
          ,품목NO AS 품목NO
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,불출수 AS 불출수
          ,사용수 AS 사용수
          ,재공수 AS 재공수
        FROM
        (
          SELECT
            RESULT_MIDDLE.작업지시공정NO AS 작업지시공정NO
            ,INSTRUCT_PROCESS.작업코드 AS 작업코드
            ,INSTRUCT_PROCESS.공정명 AS 공정
            ,RESULT_MIDDLE.품목NO AS 품목NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,COALESCE(RESULT_MIDDLE.불출수,0) AS 불출수
            ,COALESCE(RESULT_MIDDLE.사용수,0) AS 사용수
            ,COALESCE(RESULT_MIDDLE.재공수,0) AS 재공수
          FROM
          (
            SELECT
              불출.작업지시공정NO AS 작업지시공정NO
              ,불출.품목NO AS 품목NO
              ,불출.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 불출
            LEFT JOIN
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(varchar, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용 ON 사용.작업지시공정NO = 불출.작업지시공정NO AND 사용.품목NO = 불출.품목NO AND 사용.LOT코드 = 불출.LOT코드

            UNION

            SELECT
              사용.작업지시공정NO AS 작업지시공정NO
              ,사용.품목NO AS 품목NO
              ,사용.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(varchar, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용
            LEFT JOIN
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
			      ) AS 불출 ON 불출.작업지시공정NO = 사용.작업지시공정NO AND 불출.품목NO = 사용.품목NO AND 불출.LOT코드 = 사용.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPC_PK] AS NO
              ,(SELECT [WKIS_CODE] FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = [ISPC_WORK_INSTRUCT_PK]) AS 작업코드
              ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = RESULT_MIDDLE.작업지시공정NO
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [ITEM_CLIENT_PK]) AS 거래처명
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_CAR] AS 차종
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
              ,[ITEM_SAFE] AS 안전재고
              ,[ITEM_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = RESULT_MIDDLE.품목NO
          WHERE ITEM.품목구분 = '반제품'
        ) AS RESULT
        WHERE (1=1)
        AND 재공수 != 0
        AND ( 작업코드 like concat('%',@input,'%')
        OR 공정 like concat('%',@input,'%')
        OR LOT코드 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%'))
        ORDER BY ` +
        (req.body.sortKey == "NO" ? "작업코드" : req.body.sortKey) +
        ` ` +
        req.body.sortOrder +
        `
      `;
    } else {
      sql =
        `
        SELECT
          작업지시공정NO AS 작업지시공정NO
          ,작업코드 AS 작업코드
          ,공정 AS 공정
          ,LOT코드 AS LOT코드
          ,품목NO AS 품목NO
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,불출수 AS 불출수
          ,사용수 AS 사용수
          ,재공수 AS 재공수
        FROM
        (
          SELECT
            RESULT_MIDDLE.작업지시공정NO AS 작업지시공정NO
            ,INSTRUCT_PROCESS.작업코드 AS 작업코드
            ,INSTRUCT_PROCESS.공정명 AS 공정
            ,RESULT_MIDDLE.품목NO AS 품목NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,COALESCE(RESULT_MIDDLE.불출수,0) AS 불출수
            ,COALESCE(RESULT_MIDDLE.사용수,0) AS 사용수
            ,COALESCE(RESULT_MIDDLE.재공수,0) AS 재공수
          FROM
          (
            SELECT
              불출.작업지시공정NO AS 작업지시공정NO
              ,불출.품목NO AS 품목NO
              ,불출.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 불출
            LEFT JOIN
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(varchar, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용 ON 사용.작업지시공정NO = 불출.작업지시공정NO AND 사용.품목NO = 불출.품목NO AND 사용.LOT코드 = 불출.LOT코드

            UNION

            SELECT
              사용.작업지시공정NO AS 작업지시공정NO
              ,사용.품목NO AS 품목NO
              ,사용.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(varchar, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용
            LEFT JOIN
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
			      ) AS 불출 ON 불출.작업지시공정NO = 사용.작업지시공정NO AND 불출.품목NO = 사용.품목NO AND 불출.LOT코드 = 사용.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPC_PK] AS NO
              ,(SELECT [WKIS_CODE] FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = [ISPC_WORK_INSTRUCT_PK]) AS 작업코드
              ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = RESULT_MIDDLE.작업지시공정NO
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [ITEM_CLIENT_PK]) AS 거래처명
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_CAR] AS 차종
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
              ,[ITEM_SAFE] AS 안전재고
              ,[ITEM_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = RESULT_MIDDLE.품목NO
          WHERE ITEM.품목구분 = '반제품'
        ) AS RESULT
        WHERE (1=1)
        AND 재공수 != 0
        AND ` +
        req.body.searchKey +
        ` like concat('%',@input,'%')
        ORDER BY ` +
        (req.body.sortKey == "NO" ? "작업코드" : req.body.sortKey) +
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

// 등록
router.post("/insert", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("작업지시공정NO", req.body.data.작업지시공정NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("LOT코드", req.body.data.LOT코드 ?? "")
      .input("수량", req.body.data.수량 ?? "")
      .input(
        "일시",
        moment(req.body.data.일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
          ([ISPCI_DIV]
          ,[ISPCI_INSTRUCT_PROCESS_PK]
          ,[ISPCI_ITEM_PK]
          ,[ISPCI_LOTCODE]
          ,[ISPCI_AMOUNT]
          ,[ISPCI_DT]
          ,[ISPCI_NOTE]
          ,[ISPCI_REGIST_NM]
          ,[ISPCI_REGIST_DT])
        VALUES
          ('재공자재반납',@작업지시공정NO,@품목NO,@LOT코드,@수량,@일시,@비고,@등록자,@등록일시)
      `);

    // 로그기록 저장
    await logSend(
      (type = "등록"),
      (ct = JSON.stringify(req.body.data) + " 을 등록."),
      (amount = 1),
      (user = req.body.user ?? "")
    );

    res.send("등록완료");
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
