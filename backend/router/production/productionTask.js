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
    .input("menu", "생산관리_작업지시") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [WKIS_PK] AS NO
        ,[WKIS_CODE] AS 코드
        ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
        ,[WKIS_ITEM_PK] AS 품목NO
        ,ITEM.품목구분 AS 품목구분
        ,ITEM.품번 AS 품번
        ,ITEM.품명 AS 품명
        ,ITEM.규격 AS 규격
        ,ITEM.단위 AS 단위
        ,[WKIS_AMOUNT] AS 수량
        ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
        ,COALESCE((((SELECT COUNT(*)*2.0 FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_WORK_INSTRUCT_PK] = [WKIS_PK] AND [ISPC_CONDITION] = '작업완료')
          +(SELECT COUNT(*)*1.0 FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_WORK_INSTRUCT_PK] = [WKIS_PK] AND [ISPC_CONDITION] = '작업중'))
          / NULLIF((SELECT COUNT(*)*2.0 FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_WORK_INSTRUCT_PK] = [WKIS_PK]),0))*100, 0) AS 진행률
        ,[WKIS_NOTE] AS 비고
        ,[WKIS_REGIST_NM] AS 등록자
        ,[WKIS_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
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
      ) AS ITEM ON ITEM.NO = [WKIS_ITEM_PK]
      ORDER BY [WKIS_PK] DESC
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
          NO AS NO, 코드 AS 코드, 생산계획NO AS 생산계획NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 
          규격 AS 규격, 단위 AS 단위, 수량 AS 수량, 시작일 AS 시작일, 진행률 AS 진행률,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [WKIS_PK] AS NO
            ,[WKIS_CODE] AS 코드
            ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
            ,[WKIS_ITEM_PK] AS 품목NO
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,[WKIS_AMOUNT] AS 수량
            ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
            ,COALESCE((((SELECT COUNT(*)*2.0 FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_WORK_INSTRUCT_PK] = [WKIS_PK] AND [ISPC_CONDITION] = '작업완료')
              +(SELECT COUNT(*)*1.0 FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_WORK_INSTRUCT_PK] = [WKIS_PK] AND [ISPC_CONDITION] = '작업중'))
              / NULLIF((SELECT COUNT(*)*2.0 FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_WORK_INSTRUCT_PK] = [WKIS_PK]),0))*100, 0) AS 진행률
            ,[WKIS_NOTE] AS 비고
            ,[WKIS_REGIST_NM] AS 등록자
            ,[WKIS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
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
          ) AS ITEM ON ITEM.NO = [WKIS_ITEM_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 시작일), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 시작일), 12) <= ` +
        req.body.endDate +
        `
        AND ( 코드 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 수량 like concat('%',@input,'%')
        OR 시작일 like concat('%',@input,'%')
        OR 비고 like concat('%',@input,'%'))
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
          NO AS NO, 코드 AS 코드, 생산계획NO AS 생산계획NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 
          규격 AS 규격, 단위 AS 단위, 수량 AS 수량, 시작일 AS 시작일, 진행률 AS 진행률,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [WKIS_PK] AS NO
            ,[WKIS_CODE] AS 코드
            ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
            ,[WKIS_ITEM_PK] AS 품목NO
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,[WKIS_AMOUNT] AS 수량
            ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
            ,COALESCE((((SELECT COUNT(*)*2.0 FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_WORK_INSTRUCT_PK] = [WKIS_PK] AND [ISPC_CONDITION] = '작업완료')
              +(SELECT COUNT(*)*1.0 FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_WORK_INSTRUCT_PK] = [WKIS_PK] AND [ISPC_CONDITION] = '작업중'))
              / NULLIF((SELECT COUNT(*)*2.0 FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_WORK_INSTRUCT_PK] = [WKIS_PK]),0))*100, 0) AS 진행률
            ,[WKIS_NOTE] AS 비고
            ,[WKIS_REGIST_NM] AS 등록자
            ,[WKIS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
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
          ) AS ITEM ON ITEM.NO = [WKIS_ITEM_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 시작일), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 시작일), 12) <= ` +
        req.body.endDate +
        `
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

// 등록
router.post("/insert", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("코드", req.body.data.코드 ?? "")
      .input("생산계획NO", req.body.data.생산계획NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("수량", req.body.data.수량 ?? "")
      .input("시작일", req.body.data.시작일 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
          ([WKIS_CODE]
          ,[WKIS_PRODUCE_PLAN_PK]
          ,[WKIS_ITEM_PK]
          ,[WKIS_AMOUNT]
          ,[WKIS_START_DATE]
          ,[WKIS_NOTE]
          ,[WKIS_REGIST_NM]
          ,[WKIS_REGIST_DT])
        VALUES
          (@코드,@생산계획NO,@품목NO,@수량,@시작일,@비고,@등록자,@등록일시)
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

// 한번에 등록
router.post("/insertAll", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      await Pool.request()
        .input("코드", req.body.data[i].코드 ?? "")
        .input("생산계획NO", req.body.data[i].생산계획NO ?? null)
        .input("품목NO", req.body.data[i].품목NO ?? null)
        .input("수량", req.body.data[i].수량 ?? "")
        .input("시작일", req.body.data[i].시작일 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
          INSERT INTO [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
            ([WKIS_CODE]
            ,[WKIS_PRODUCE_PLAN_PK]
            ,[WKIS_ITEM_PK]
            ,[WKIS_AMOUNT]
            ,[WKIS_START_DATE]
            ,[WKIS_NOTE]
            ,[WKIS_REGIST_NM]
            ,[WKIS_REGIST_DT])
          VALUES
            (@코드,@생산계획NO,@품목NO,@수량,@시작일,@비고,@등록자,@등록일시)
        `);

      // 로그기록 저장
      await logSend(
        (type = "등록"),
        (ct = JSON.stringify(req.body.data[i]) + " 을 등록."),
        (amount = 1),
        (user = req.body.user ?? "")
      );
    }
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

// 수정
router.post("/edit", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("NO", req.body.data.NO ?? 0)
      .input("코드", req.body.data.코드 ?? "")
      .input("생산계획NO", req.body.data.생산계획NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("수량", req.body.data.수량 ?? "")
      .input("시작일", req.body.data.시작일 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
          SET 
          [WKIS_CODE] = @코드
          ,[WKIS_PRODUCE_PLAN_PK] = @생산계획NO
          ,[WKIS_ITEM_PK] = @품목NO
          ,[WKIS_AMOUNT] = @수량
          ,[WKIS_START_DATE] = @시작일
          ,[WKIS_NOTE] = @비고
          ,[WKIS_REGIST_NM] = @등록자
          ,[WKIS_REGIST_DT] = @등록일시
        WHERE [WKIS_PK] = @NO
    `);

    // 로그기록 저장
    await logSend(
      (type = "수정"),
      (ct = JSON.stringify(req.body.data) + " 으로 수정."),
      (amount = 1),
      (user = req.body.user ?? "")
    );

    res.send("수정완료");
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

// 삭제
router.post("/delete", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      const result = await Pool.request().input("key", req.body.data[i]).query(`
        SELECT
          [WKIS_PK] AS NO
          ,[WKIS_CODE] AS 코드
          ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
          ,[WKIS_ITEM_PK] AS 품목NO
          ,ITEM.품목구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,ITEM.규격 AS 규격
          ,ITEM.단위 AS 단위
          ,[WKIS_AMOUNT] AS 수량
          ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
          ,[WKIS_NOTE] AS 비고
          ,[WKIS_REGIST_NM] AS 등록자
          ,[WKIS_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
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
        ) AS ITEM ON ITEM.NO = [WKIS_ITEM_PK]
        WHERE [WKIS_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = @key`
        );

      // 로그기록 저장
      await logSend(
        (type = "삭제"),
        (ct = JSON.stringify(result.recordset) + " 을 삭제."),
        (amount = 1),
        (user = req.body.user ?? "")
      );
    }
    res.send("삭제완료");
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
