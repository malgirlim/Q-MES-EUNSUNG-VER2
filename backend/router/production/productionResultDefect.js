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
    .input("menu", "생산관리_생산실적집계_불량사유") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [PDDF_PK] AS NO
        ,[PDDF_PRODUCE_RESULT_PK] AS 생산실적NO
        ,[PDDF_DEFECT_PK] AS 불량NO
        ,DEFECT.코드 AS 불량코드
        ,DEFECT.구분 AS 구분
        ,DEFECT.불량명 AS 불량명
        ,[PDDF_AMOUNT] AS 수량
        ,[PDDF_NOTE] AS 비고
        ,[PDDF_REGIST_NM] AS 등록자
        ,[PDDF_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
      LEFT JOIN
      (
        SELECT
          [DEFT_PK] AS NO
          ,[DEFT_CODE] AS 코드
          ,[DEFT_DIV] AS 구분
          ,[DEFT_NAME] AS 불량명
          ,[DEFT_CONTENT] AS 내용
        FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
      ) AS DEFECT ON DEFECT.NO = [PDDF_DEFECT_PK]
      ORDER BY [PDDF_PK] DESC
    `);

    // // 로그기록 저장
    // await logSend(
    //   (type = "메뉴열람"),
    //   (ct = "메뉴를 열람함."),
    //   (amount = result.recordset.length ?? 0),
    //   (user = req.query.user ?? "")
    // );

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
          NO AS NO, 생산실적NO AS 생산실적NO, 불량NO AS 불량NO, 불량코드 AS 불량코드, 구분 AS 구분, 불량명 AS 불량명,
          수량 AS 수량, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDDF_PK] AS NO
            ,[PDDF_PRODUCE_RESULT_PK] AS 생산실적NO
            ,[PDDF_DEFECT_PK] AS 불량NO
            ,DEFECT.코드 AS 불량코드
            ,DEFECT.구분 AS 구분
            ,DEFECT.불량명 AS 불량명
            ,[PDDF_AMOUNT] AS 수량
            ,[PDDF_NOTE] AS 비고
            ,[PDDF_REGIST_NM] AS 등록자
            ,[PDDF_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
          LEFT JOIN
          (
            SELECT
              [DEFT_PK] AS NO
              ,[DEFT_CODE] AS 코드
              ,[DEFT_DIV] AS 구분
              ,[DEFT_NAME] AS 불량명
              ,[DEFT_CONTENT] AS 내용
            FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
          ) AS DEFECT ON DEFECT.NO = [PDDF_DEFECT_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 불량코드 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 불량명 like concat('%',@input,'%')
        OR 수량 like concat('%',@input,'%')
        OR 비고 like concat('%',@input,'%'))
        ORDER BY ` +
        req.body.sortKey +
        ` ` +
        req.body.sortOrder +
        `
      `;
    } else if (req.body.searchKey == "생산실적NO") {
      sql =
        `
        SELECT
          NO AS NO, 생산실적NO AS 생산실적NO, 불량NO AS 불량NO, 불량코드 AS 불량코드, 구분 AS 구분, 불량명 AS 불량명,
          수량 AS 수량, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDDF_PK] AS NO
            ,[PDDF_PRODUCE_RESULT_PK] AS 생산실적NO
            ,[PDDF_DEFECT_PK] AS 불량NO
            ,DEFECT.코드 AS 불량코드
            ,DEFECT.구분 AS 구분
            ,DEFECT.불량명 AS 불량명
            ,[PDDF_AMOUNT] AS 수량
            ,[PDDF_NOTE] AS 비고
            ,[PDDF_REGIST_NM] AS 등록자
            ,[PDDF_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
          LEFT JOIN
          (
            SELECT
              [DEFT_PK] AS NO
              ,[DEFT_CODE] AS 코드
              ,[DEFT_DIV] AS 구분
              ,[DEFT_NAME] AS 불량명
              ,[DEFT_CONTENT] AS 내용
            FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
          ) AS DEFECT ON DEFECT.NO = [PDDF_DEFECT_PK]
        ) AS RESULT
        WHERE (1=1)
        AND 생산실적NO = @input
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
          NO AS NO, 생산실적NO AS 생산실적NO, 불량NO AS 불량NO, 불량코드 AS 불량코드, 구분 AS 구분, 불량명 AS 불량명,
          수량 AS 수량, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDDF_PK] AS NO
            ,[PDDF_PRODUCE_RESULT_PK] AS 생산실적NO
            ,[PDDF_DEFECT_PK] AS 불량NO
            ,DEFECT.코드 AS 불량코드
            ,DEFECT.구분 AS 구분
            ,DEFECT.불량명 AS 불량명
            ,[PDDF_AMOUNT] AS 수량
            ,[PDDF_NOTE] AS 비고
            ,[PDDF_REGIST_NM] AS 등록자
            ,[PDDF_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
          LEFT JOIN
          (
            SELECT
              [DEFT_PK] AS NO
              ,[DEFT_CODE] AS 코드
              ,[DEFT_DIV] AS 구분
              ,[DEFT_NAME] AS 불량명
              ,[DEFT_CONTENT] AS 내용
            FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
          ) AS DEFECT ON DEFECT.NO = [PDDF_DEFECT_PK]
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

// 등록
router.post("/insert", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("생산실적NO", req.body.data.생산실적NO ?? null)
      .input("불량NO", req.body.data.불량NO ?? null)
      .input("수량", req.body.data.수량 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
          ([PDDF_PRODUCE_RESULT_PK]
          ,[PDDF_DEFECT_PK]
          ,[PDDF_AMOUNT]
          ,[PDDF_NOTE]
          ,[PDDF_REGIST_NM]
          ,[PDDF_REGIST_DT])
        VALUES
          (@생산실적NO,@불량NO,@수량,@비고,@등록자,@등록일시)
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
        .input("생산실적NO", req.body.data[i].생산실적NO ?? null)
        .input("불량NO", req.body.data[i].불량NO ?? null)
        .input("수량", req.body.data[i].수량 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
          ([PDDF_PRODUCE_RESULT_PK]
          ,[PDDF_DEFECT_PK]
          ,[PDDF_AMOUNT]
          ,[PDDF_NOTE]
          ,[PDDF_REGIST_NM]
          ,[PDDF_REGIST_DT])
        VALUES
          (@생산실적NO,@불량NO,@수량,@비고,@등록자,@등록일시)
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
      .input("생산실적NO", req.body.data.생산실적NO ?? null)
      .input("불량NO", req.body.data.불량NO ?? null)
      .input("수량", req.body.data.수량 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
          SET 
          [PDDF_PRODUCE_RESULT_PK] = @생산실적NO
          ,[PDDF_DEFECT_PK] = @불량NO
          ,[PDDF_AMOUNT] = @수량
          ,[PDDF_NOTE] = @비고
          ,[PDDF_REGIST_NM] = @등록자
          ,[PDDF_REGIST_DT] = @등록일시
        WHERE [PDDF_PK] = @NO
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
          [PDDF_PK] AS NO
          ,[PDDF_PRODUCE_RESULT_PK] AS 생산실적NO
          ,[PDDF_DEFECT_PK] AS 불량NO
          ,DEFECT.코드 AS 불량코드
          ,DEFECT.구분 AS 구분
          ,DEFECT.불량명 AS 불량명
          ,[PDDF_AMOUNT] AS 수량
          ,[PDDF_NOTE] AS 비고
          ,[PDDF_REGIST_NM] AS 등록자
          ,[PDDF_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
        LEFT JOIN
        (
          SELECT
            [DEFT_PK] AS NO
            ,[DEFT_CODE] AS 코드
            ,[DEFT_DIV] AS 구분
            ,[DEFT_NAME] AS 불량명
            ,[DEFT_CONTENT] AS 내용
          FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
        ) AS DEFECT ON DEFECT.NO = [PDDF_DEFECT_PK]
        WHERE [PDDF_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PK] = @key`
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
