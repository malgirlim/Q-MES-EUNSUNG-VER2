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
    .input("menu", "재고관리_설비부품 LOT별 재고현황") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        NO AS 설비부품NO
        ,LOT코드 AS LOT코드
        ,품번 AS 품번
        ,설비명 AS 설비명
        ,부품구분 AS 부품구분
        ,품명 AS 품명
        ,규격 AS 규격
        ,단위 AS 단위
        ,기초재고 AS 기초재고
        ,입고 AS 입고
        ,출고 AS 출고
        ,기말재고 AS 기말재고
      FROM
      (
        SELECT
          RESULT_MIDDLE.설비부품NO AS NO
          ,RESULT_MIDDLE.LOT코드 AS LOT코드
          ,FACILITY_PART.품번 AS 품번
          ,FACILITY_PART.설비명 AS 설비명
          ,FACILITY_PART.부품구분 AS 부품구분
          ,FACILITY_PART.품명 AS 품명
          ,FACILITY_PART.규격 AS 규격
          ,FACILITY_PART.단위 AS 단위
          ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
          ,SUM(RESULT_MIDDLE.입고수량) AS 입고
          ,SUM(RESULT_MIDDLE.출고수량) AS 출고
          ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
        FROM
        (
          SELECT
            입고_MIDDLE.설비부품NO AS 설비부품NO
            ,입고_MIDDLE.LOT코드 AS LOT코드
            ,0 AS 기초재고
            ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
            ,COALESCE(출고_MIDDLE.출고수량,0) AS 출고수량
            ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출고_MIDDLE.출고수량,0) AS 기말재고
          FROM
          (
            SELECT
              [FPRC_FACILITY_PART_PK] AS 설비부품NO
              ,[FPRC_CODE] AS LOT코드
              ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
            FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) >= '000101'
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) <= '990101'
            GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
          ) AS 입고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [FPRL_FACILITY_PART_PK] AS 설비부품NO
              ,[FPRL_CODE] AS LOT코드
              ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
            FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) >= '000101'
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) <= '990101'
            GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
          ) AS 출고_MIDDLE ON 출고_MIDDLE.설비부품NO = 입고_MIDDLE.설비부품NO AND 출고_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

          UNION

          SELECT
            입고_기초재고_MIDDLE.설비부품NO AS 설비부품NO
            ,입고_기초재고_MIDDLE.LOT코드 AS LOT코드
            ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기초재고
            ,0 AS 입고수량
            ,0 AS 출고수량
            ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기말재고
          FROM
          (
            SELECT
              [FPRC_FACILITY_PART_PK] AS 설비부품NO
              ,[FPRC_CODE] AS LOT코드
              ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
            FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) < '000101'
            GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
          ) AS 입고_기초재고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [FPRL_FACILITY_PART_PK] AS 설비부품NO
              ,[FPRL_CODE] AS LOT코드
              ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
            FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) < '000101'
            GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
          ) AS 출고_기초재고_MIDDLE ON 출고_기초재고_MIDDLE.설비부품NO = 입고_기초재고_MIDDLE.설비부품NO AND 출고_기초재고_MIDDLE.LOT코드 = 입고_기초재고_MIDDLE.LOT코드
        ) AS RESULT_MIDDLE
        LEFT JOIN
        (
          SELECT
            [FCPT_PK] AS NO
            ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
            ,[FCPT_DIV] AS 부품구분
            ,[FCPT_PRODUCT_NUM] AS 품번
            ,[FCPT_NAME] AS 품명
            ,[FCPT_CAR] AS 차종
            ,[FCPT_SIZE] AS 규격
            ,[FCPT_UNIT] AS 단위
            ,[FCPT_SAFE] AS 안전재고
            ,[FCPT_COST] AS 단가
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
        ) AS FACILITY_PART ON FACILITY_PART.NO = RESULT_MIDDLE.설비부품NO
        GROUP BY RESULT_MIDDLE.설비부품NO,RESULT_MIDDLE.LOT코드,FACILITY_PART.품번,FACILITY_PART.설비명,FACILITY_PART.부품구분,FACILITY_PART.품명,FACILITY_PART.규격,FACILITY_PART.단위
      ) AS RESULT
      ORDER BY LOT코드 DESC
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
          NO AS 설비부품NO
          ,LOT코드 AS LOT코드
          ,품번 AS 품번
          ,설비명 AS 설비명
          ,부품구분 AS 부품구분
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,출고 AS 출고
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            RESULT_MIDDLE.설비부품NO AS NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,FACILITY_PART.품번 AS 품번
            ,FACILITY_PART.설비명 AS 설비명
            ,FACILITY_PART.부품구분 AS 부품구분
            ,FACILITY_PART.품명 AS 품명
            ,FACILITY_PART.규격 AS 규격
            ,FACILITY_PART.단위 AS 단위
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고수량) AS 입고
            ,SUM(RESULT_MIDDLE.출고수량) AS 출고
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
          FROM
          (
            SELECT
              입고_MIDDLE.설비부품NO AS 설비부품NO
              ,입고_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
              ,COALESCE(출고_MIDDLE.출고수량,0) AS 출고수량
              ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출고_MIDDLE.출고수량,0) AS 기말재고
            FROM
            (
              SELECT
                [FPRC_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRC_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [FPRL_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRL_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
            ) AS 출고_MIDDLE ON 출고_MIDDLE.설비부품NO = 입고_MIDDLE.설비부품NO AND 출고_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

            UNION

            SELECT
              입고_기초재고_MIDDLE.설비부품NO AS 설비부품NO
              ,입고_기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기초재고
              ,0 AS 입고수량
              ,0 AS 출고수량
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기말재고
            FROM
            (
              SELECT
                [FPRC_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRC_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
            ) AS 입고_기초재고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [FPRL_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRL_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
            ) AS 출고_기초재고_MIDDLE ON 출고_기초재고_MIDDLE.설비부품NO = 입고_기초재고_MIDDLE.설비부품NO AND 출고_기초재고_MIDDLE.LOT코드 = 입고_기초재고_MIDDLE.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [FCPT_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
              ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
              ,[FCPT_DIV] AS 부품구분
              ,[FCPT_PRODUCT_NUM] AS 품번
              ,[FCPT_NAME] AS 품명
              ,[FCPT_CAR] AS 차종
              ,[FCPT_SIZE] AS 규격
              ,[FCPT_UNIT] AS 단위
              ,[FCPT_SAFE] AS 안전재고
              ,[FCPT_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          ) AS FACILITY_PART ON FACILITY_PART.NO = RESULT_MIDDLE.설비부품NO
          GROUP BY RESULT_MIDDLE.설비부품NO,RESULT_MIDDLE.LOT코드,FACILITY_PART.품번,FACILITY_PART.설비명,FACILITY_PART.부품구분,FACILITY_PART.품명,FACILITY_PART.규격,FACILITY_PART.단위
        ) AS RESULT
        WHERE (1=1)
        AND ( LOT코드 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 설비명 like concat('%',@input,'%')
        OR 부품구분 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 기초재고 like concat('%',@input,'%')
        OR 입고 like concat('%',@input,'%')
        OR 출고 like concat('%',@input,'%')
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
          NO AS 설비부품NO
          ,LOT코드 AS LOT코드
          ,품번 AS 품번
          ,설비명 AS 설비명
          ,부품구분 AS 부품구분
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,출고 AS 출고
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            RESULT_MIDDLE.설비부품NO AS NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,FACILITY_PART.품번 AS 품번
            ,FACILITY_PART.설비명 AS 설비명
            ,FACILITY_PART.부품구분 AS 부품구분
            ,FACILITY_PART.품명 AS 품명
            ,FACILITY_PART.규격 AS 규격
            ,FACILITY_PART.단위 AS 단위
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고수량) AS 입고
            ,SUM(RESULT_MIDDLE.출고수량) AS 출고
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
          FROM
          (
            SELECT
              입고_MIDDLE.설비부품NO AS 설비부품NO
              ,입고_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
              ,COALESCE(출고_MIDDLE.출고수량,0) AS 출고수량
              ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출고_MIDDLE.출고수량,0) AS 기말재고
            FROM
            (
              SELECT
                [FPRC_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRC_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [FPRL_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRL_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
            ) AS 출고_MIDDLE ON 출고_MIDDLE.설비부품NO = 입고_MIDDLE.설비부품NO AND 출고_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

            UNION

            SELECT
              입고_기초재고_MIDDLE.설비부품NO AS 설비부품NO
              ,입고_기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기초재고
              ,0 AS 입고수량
              ,0 AS 출고수량
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기말재고
            FROM
            (
              SELECT
                [FPRC_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRC_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
            ) AS 입고_기초재고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [FPRL_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRL_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
            ) AS 출고_기초재고_MIDDLE ON 출고_기초재고_MIDDLE.설비부품NO = 입고_기초재고_MIDDLE.설비부품NO AND 출고_기초재고_MIDDLE.LOT코드 = 입고_기초재고_MIDDLE.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [FCPT_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
              ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
              ,[FCPT_DIV] AS 부품구분
              ,[FCPT_PRODUCT_NUM] AS 품번
              ,[FCPT_NAME] AS 품명
              ,[FCPT_CAR] AS 차종
              ,[FCPT_SIZE] AS 규격
              ,[FCPT_UNIT] AS 단위
              ,[FCPT_SAFE] AS 안전재고
              ,[FCPT_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          ) AS FACILITY_PART ON FACILITY_PART.NO = RESULT_MIDDLE.설비부품NO
          GROUP BY RESULT_MIDDLE.설비부품NO,RESULT_MIDDLE.LOT코드,FACILITY_PART.품번,FACILITY_PART.설비명,FACILITY_PART.부품구분,FACILITY_PART.품명,FACILITY_PART.규격,FACILITY_PART.단위
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
