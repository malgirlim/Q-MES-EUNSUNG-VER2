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
    .input("menu", "금형관리_금형점검내역관리") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [MDIL_PK] AS NO
        ,[MDIL_MOLD_INSPECT_PK] AS 금형점검NO
        ,MOLD_INSPECT.금형코드 AS 금형코드
        ,MOLD_INSPECT.금형명 AS 금형명
        ,MOLD_INSPECT.구분 AS 점검구분
        ,MOLD_INSPECT.내용 AS 점검내용
        ,MOLD_INSPECT.검사방법 AS 검사방법
        ,MOLD_INSPECT.기준 AS 검사기준
        ,MOLD_INSPECT.단위 AS 검사단위
        ,MOLD_INSPECT.최소 AS 기준최소
        ,MOLD_INSPECT.최대 AS 기준최대
        ,MOLD_INSPECT.담당자 AS 담당자
        ,[MDIL_DIV] AS 구분
        ,[MDIL_CONTENT] AS 내용
        ,[MDIL_RESULT] AS 결과
        ,CONVERT(VARCHAR, [MDIL_DATE], 23) AS 일자
        ,[MDIL_NOTE] AS 비고
        ,[MDIL_REGIST_NM] AS 등록자
        ,[MDIL_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_MOLD_INSPECT_LOG_TB]
      LEFT JOIN
      (
        SELECT
          [MDIP_PK] AS NO
          ,[MDIP_MOLD_PK] AS 금형NO
          ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형코드
          ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형명
          ,[MDIP_DIV] AS 구분
          ,[MDIP_CONTENT] AS 내용
          ,[MDIP_HOW] AS 검사방법
          ,[MDIP_STAND] AS 기준
          ,[MDIP_UNIT] AS 단위
          ,[MDIP_MIN] AS 최소
          ,[MDIP_MAX] AS 최대
          ,[MDIP_USER_ID] AS 담당자ID
          ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
        FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
      ) AS MOLD_INSPECT ON MOLD_INSPECT.NO = [MDIL_MOLD_INSPECT_PK]
      ORDER BY [MDIL_PK] DESC
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
          NO AS NO, 금형점검NO AS 금형점검NO, 금형코드 AS 금형코드, 금형명 AS 금형명, 점검구분 AS 점검구분, 점검내용 AS 점검내용,
          검사방법 AS 검사방법, 검사기준 AS 검사기준, 검사단위 AS 검사단위, 기준최소 AS 기준최소, 기준최대 AS 기준최대, 담당자 AS 담당자,
          구분 AS 구분, 내용 AS 내용, 결과 AS 결과, 일자 AS 일자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDIL_PK] AS NO
            ,[MDIL_MOLD_INSPECT_PK] AS 금형점검NO
            ,MOLD_INSPECT.금형코드 AS 금형코드
            ,MOLD_INSPECT.금형명 AS 금형명
            ,MOLD_INSPECT.구분 AS 점검구분
            ,MOLD_INSPECT.내용 AS 점검내용
            ,MOLD_INSPECT.검사방법 AS 검사방법
            ,MOLD_INSPECT.기준 AS 검사기준
            ,MOLD_INSPECT.단위 AS 검사단위
            ,MOLD_INSPECT.최소 AS 기준최소
            ,MOLD_INSPECT.최대 AS 기준최대
            ,MOLD_INSPECT.담당자 AS 담당자
            ,[MDIL_DIV] AS 구분
            ,[MDIL_CONTENT] AS 내용
            ,[MDIL_RESULT] AS 결과
            ,CONVERT(VARCHAR, [MDIL_DATE], 23) AS 일자
            ,[MDIL_NOTE] AS 비고
            ,[MDIL_REGIST_NM] AS 등록자
            ,[MDIL_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_MOLD_INSPECT_LOG_TB]
          LEFT JOIN
          (
            SELECT
              [MDIP_PK] AS NO
              ,[MDIP_MOLD_PK] AS 금형NO
              ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형코드
              ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형명
              ,[MDIP_DIV] AS 구분
              ,[MDIP_CONTENT] AS 내용
              ,[MDIP_HOW] AS 검사방법
              ,[MDIP_STAND] AS 기준
              ,[MDIP_UNIT] AS 단위
              ,[MDIP_MIN] AS 최소
              ,[MDIP_MAX] AS 최대
              ,[MDIP_USER_ID] AS 담당자ID
              ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
            FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
          ) AS MOLD_INSPECT ON MOLD_INSPECT.NO = [MDIL_MOLD_INSPECT_PK]
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
        OR 점검구분 like concat('%',@input,'%')
        OR 점검내용 like concat('%',@input,'%')
        OR 검사방법 like concat('%',@input,'%')
        OR 검사기준 like concat('%',@input,'%')
        OR 검사단위 like concat('%',@input,'%')
        OR 기준최소 like concat('%',@input,'%')
        OR 기준최대 like concat('%',@input,'%')
        OR 담당자 like concat('%',@input,'%')
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
          NO AS NO, 금형점검NO AS 금형점검NO, 금형코드 AS 금형코드, 금형명 AS 금형명, 점검구분 AS 점검구분, 점검내용 AS 점검내용,
          검사방법 AS 검사방법, 검사기준 AS 검사기준, 검사단위 AS 검사단위, 기준최소 AS 기준최소, 기준최대 AS 기준최대, 담당자 AS 담당자,
          구분 AS 구분, 내용 AS 내용, 결과 AS 결과, 일자 AS 일자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDIL_PK] AS NO
            ,[MDIL_MOLD_INSPECT_PK] AS 금형점검NO
            ,MOLD_INSPECT.금형코드 AS 금형코드
            ,MOLD_INSPECT.금형명 AS 금형명
            ,MOLD_INSPECT.구분 AS 점검구분
            ,MOLD_INSPECT.내용 AS 점검내용
            ,MOLD_INSPECT.검사방법 AS 검사방법
            ,MOLD_INSPECT.기준 AS 검사기준
            ,MOLD_INSPECT.단위 AS 검사단위
            ,MOLD_INSPECT.최소 AS 기준최소
            ,MOLD_INSPECT.최대 AS 기준최대
            ,MOLD_INSPECT.담당자 AS 담당자
            ,[MDIL_DIV] AS 구분
            ,[MDIL_CONTENT] AS 내용
            ,[MDIL_RESULT] AS 결과
            ,CONVERT(VARCHAR, [MDIL_DATE], 23) AS 일자
            ,[MDIL_NOTE] AS 비고
            ,[MDIL_REGIST_NM] AS 등록자
            ,[MDIL_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_MOLD_INSPECT_LOG_TB]
          LEFT JOIN
          (
            SELECT
              [MDIP_PK] AS NO
              ,[MDIP_MOLD_PK] AS 금형NO
              ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형코드
              ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDUS_MMDIP_MOLD_PKOLD_PK]) AS 금형명
              ,[MDIP_DIV] AS 구분
              ,[MDIP_CONTENT] AS 내용
              ,[MDIP_HOW] AS 검사방법
              ,[MDIP_STAND] AS 기준
              ,[MDIP_UNIT] AS 단위
              ,[MDIP_MIN] AS 최소
              ,[MDIP_MAX] AS 최대
              ,[MDIP_USER_ID] AS 담당자ID
              ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
            FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
          ) AS MOLD_INSPECT ON MOLD_INSPECT.NO = [MDIL_MOLD_INSPECT_PK]
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
      .input("금형점검NO", req.body.data.금형점검NO ?? null)
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
        INSERT INTO [QMES2022].[dbo].[MANAGE_MOLD_INSPECT_LOG_TB]
          ([MDIL_MOLD_INSPECT_PK]
          ,[MDIL_DIV]
          ,[MDIL_CONTENT]
          ,[MDIL_RESULT]
          ,[MDIL_DATE]
          ,[MDIL_NOTE]
          ,[MDIL_REGIST_NM]
          ,[MDIL_REGIST_DT])
        VALUES
          (@금형점검NO,@구분,@내용,@결과,@일자,@비고,@등록자,@등록일시)
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
        .input("금형점검NO", req.body.data[i].금형점검NO ?? null)
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
        INSERT INTO [QMES2022].[dbo].[MANAGE_MOLD_INSPECT_LOG_TB]
          ([MDIL_MOLD_INSPECT_PK]
          ,[MDIL_DIV]
          ,[MDIL_CONTENT]
          ,[MDIL_RESULT]
          ,[MDIL_DATE]
          ,[MDIL_NOTE]
          ,[MDIL_REGIST_NM]
          ,[MDIL_REGIST_DT])
        VALUES
          (@금형점검NO,@구분,@내용,@결과,@일자,@비고,@등록자,@등록일시)
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
      .input("금형점검NO", req.body.data.금형점검NO ?? null)
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
        UPDATE [QMES2022].[dbo].[MANAGE_MOLD_INSPECT_LOG_TB]
          SET 
            [MDIL_MOLD_INSPECT_PK] = @금형점검NO
            ,[MDIL_DIV] = @구분
            ,[MDIL_CONTENT] = @내용
            ,[MDIL_RESULT] = @결과
            ,[MDIL_DATE] = @일자
            ,[MDIL_NOTE] = @비고
            ,[MDIL_REGIST_NM] = @등록자
            ,[MDIL_REGIST_DT] = @등록일시
          WHERE [MDIL_PK] = @NO
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
          [MDIL_PK] AS NO
          ,[MDIL_MOLD_INSPECT_PK] AS 금형점검NO
          ,MOLD_INSPECT.금형코드 AS 금형코드
          ,MOLD_INSPECT.금형명 AS 금형명
          ,MOLD_INSPECT.구분 AS 점검구분
          ,MOLD_INSPECT.내용 AS 점검내용
          ,MOLD_INSPECT.검사방법 AS 검사방법
          ,MOLD_INSPECT.기준 AS 검사기준
          ,MOLD_INSPECT.단위 AS 검사단위
          ,MOLD_INSPECT.최소 AS 기준최소
          ,MOLD_INSPECT.최대 AS 기준최대
          ,MOLD_INSPECT.담당자 AS 담당자
          ,[MDIL_DIV] AS 구분
          ,[MDIL_CONTENT] AS 내용
          ,[MDIL_RESULT] AS 결과
          ,CONVERT(VARCHAR, [MDIL_DATE], 23) AS 일자
          ,[MDIL_NOTE] AS 비고
          ,[MDIL_REGIST_NM] AS 등록자
          ,[MDIL_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_MOLD_INSPECT_LOG_TB]
        LEFT JOIN
        (
          SELECT
            [MDIP_PK] AS NO
            ,[MDIP_MOLD_PK] AS 금형NO
            ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형코드
            ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형명
            ,[MDIP_DIV] AS 구분
            ,[MDIP_CONTENT] AS 내용
            ,[MDIP_HOW] AS 검사방법
            ,[MDIP_STAND] AS 기준
            ,[MDIP_UNIT] AS 단위
            ,[MDIP_MIN] AS 최소
            ,[MDIP_MAX] AS 최대
            ,[MDIP_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
          FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
        ) AS MOLD_INSPECT ON MOLD_INSPECT.NO = [MDIL_MOLD_INSPECT_PK]
        WHERE [MDIL_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_MOLD_INSPECT_LOG_TB] WHERE [MDIL_PK] = @key`
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
