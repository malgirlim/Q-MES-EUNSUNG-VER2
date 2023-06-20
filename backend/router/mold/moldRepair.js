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
    .input("menu", "금형관리_금형수선관리") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [MDFX_PK] AS NO
        ,[MDFX_MOLD_PK] AS 금형NO
        ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDFX_MOLD_PK]) AS 금형코드
        ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDFX_MOLD_PK]) AS 금형명
        ,[MDFX_DIV] AS 구분
        ,[MDFX_CONTENT] AS 내용
        ,[MDFX_RESULT] AS 결과
        ,CONVERT(VARCHAR, [MDFX_DATE], 23) AS 일자
        ,[MDFX_NOTE] AS 비고
        ,[MDFX_REGIST_NM] AS 등록자
        ,[MDFX_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_MOLD_FIX_TB]
      ORDER BY [MDFX_PK] DESC
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
          NO AS NO, 금형NO AS 금형NO, 금형코드 AS 금형코드, 금형명 AS 금형명, 구분 AS 구분, 내용 AS 내용, 결과 AS 결과,
          일자 AS 일자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDFX_PK] AS NO
            ,[MDFX_MOLD_PK] AS 금형NO
            ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDFX_MOLD_PK]) AS 금형코드
            ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDFX_MOLD_PK]) AS 금형명
            ,[MDFX_DIV] AS 구분
            ,[MDFX_CONTENT] AS 내용
            ,[MDFX_RESULT] AS 결과
            ,CONVERT(VARCHAR, [MDFX_DATE], 23) AS 일자
            ,[MDFX_NOTE] AS 비고
            ,[MDFX_REGIST_NM] AS 등록자
            ,[MDFX_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_MOLD_FIX_TB]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 일자), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 일자), 12) <= ` +
        req.body.endDate +
        `
        AND ( 금형코드 like concat('%',@input,'%')
        OR 금형명 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
        OR 결과 like concat('%',@input,'%')
        OR 일자 like concat('%',@input,'%')
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
          NO AS NO, 금형NO AS 금형NO, 금형코드 AS 금형코드, 금형명 AS 금형명, 구분 AS 구분, 내용 AS 내용, 결과 AS 결과,
          일자 AS 일자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDFX_PK] AS NO
            ,[MDFX_MOLD_PK] AS 금형NO
            ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDFX_MOLD_PK]) AS 금형코드
            ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDFX_MOLD_PK]) AS 금형명
            ,[MDFX_DIV] AS 구분
            ,[MDFX_CONTENT] AS 내용
            ,[MDFX_RESULT] AS 결과
            ,CONVERT(VARCHAR, [MDFX_DATE], 23) AS 일자
            ,[MDFX_NOTE] AS 비고
            ,[MDFX_REGIST_NM] AS 등록자
            ,[MDFX_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_MOLD_FIX_TB]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 일자), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 일자), 12) <= ` +
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
      .input("금형NO", req.body.data.금형NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("내용", req.body.data.내용 ?? "")
      .input("결과", req.body.data.결과 ?? "")
      .input("일자", req.body.data.일자 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_MOLD_FIX_TB]
          ([MDFX_MOLD_PK]
          ,[MDFX_DIV]
          ,[MDFX_CONTENT]
          ,[MDFX_RESULT]
          ,[MDFX_DATE]
          ,[MDFX_NOTE]
          ,[MDFX_REGIST_NM]
          ,[MDFX_REGIST_DT])
        VALUES
          (@금형NO,@구분,@내용,@결과,@일자,@비고,@등록자,@등록일시)
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
        .input("금형NO", req.body.data[i].금형NO ?? null)
        .input("구분", req.body.data[i].구분 ?? "")
        .input("내용", req.body.data[i].내용 ?? "")
        .input("결과", req.body.data[i].결과 ?? "")
        .input("일자", req.body.data[i].일자 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_MOLD_FIX_TB]
          ([MDFX_MOLD_PK]
          ,[MDFX_DIV]
          ,[MDFX_CONTENT]
          ,[MDFX_RESULT]
          ,[MDFX_DATE]
          ,[MDFX_NOTE]
          ,[MDFX_REGIST_NM]
          ,[MDFX_REGIST_DT])
        VALUES
          (@금형NO,@구분,@내용,@결과,@일자,@비고,@등록자,@등록일시)
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
      .input("금형NO", req.body.data.금형NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("내용", req.body.data.내용 ?? "")
      .input("결과", req.body.data.결과 ?? "")
      .input("일자", req.body.data.일자 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_MOLD_FIX_TB]
          SET 
            [MDFX_MOLD_PK] = @금형NO
            ,[MDFX_DIV] = @구분
            ,[MDFX_CONTENT] = @내용
            ,[MDFX_RESULT] = @결과
            ,[MDFX_DATE] = @일자
            ,[MDFX_NOTE] = @비고
            ,[MDFX_REGIST_NM] = @등록자
            ,[MDFX_REGIST_DT] = @등록일시
          WHERE [MDFX_PK] = @NO
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
          [MDFX_PK] AS NO
          ,[MDFX_MOLD_PK] AS 금형NO
          ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDFX_MOLD_PK]) AS 금형코드
          ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDFX_MOLD_PK]) AS 금형명
          ,[MDFX_DIV] AS 구분
          ,[MDFX_CONTENT] AS 내용
          ,[MDFX_RESULT] AS 결과
          ,CONVERT(VARCHAR, [MDFX_DATE], 23) AS 일자
          ,[MDFX_NOTE] AS 비고
          ,[MDFX_REGIST_NM] AS 등록자
          ,[MDFX_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_MOLD_FIX_TB]
        WHERE [MDFX_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_MOLD_FIX_TB] WHERE [MDFX_PK] = @key`
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
