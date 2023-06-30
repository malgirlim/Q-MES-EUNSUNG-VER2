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
    .input("menu", "키오스크_비가동") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [KSKNW_PK] AS NO
        ,[KSKNW_WORK_PK] AS 작업NO
        ,[KSKNW_NONWORK_PK] AS 비가동NO
        ,NONWORK.코드 AS 비가동코드
        ,NONWORK.구분 AS 구분
        ,NONWORK.비가동명 AS 비가동명
        ,NONWORK.내용 AS 내용
        ,CONVERT(VARCHAR, [KSKNW_START_DT], 20) AS 시작일시
        ,CONVERT(VARCHAR, [KSKNW_END_DT], 20) AS 종료일시
        ,[KSKNW_NOTE] AS 비고
        ,[KSKNW_REGIST_NM] AS 등록자
        ,[KSKNW_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB]
      LEFT JOIN
      (
        SELECT
          [NOWK_PK] AS NO
          ,[NOWK_CODE] AS 코드
          ,[NOWK_DIV] AS 구분
          ,[NOWK_NAME] AS 비가동명
          ,[NOWK_CONTENT] AS 내용
        FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
      ) AS NONWORK ON NONWORK.NO = [KSKNW_NONWORK_PK]
      ORDER BY [KSKNW_PK] DESC
    `);

    // 로그기록 저장
    await logSend(
      (type = "조회"),
      (ct = "키오스크 비가동 데이터를 열람함."),
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
          NO AS NO, 작업NO AS 작업NO, 비가동NO AS 비가동NO, 비가동코드 AS 비가동코드, 구분 AS 구분, 비가동명 AS 비가동명,
          내용 AS 내용, 시작일시 AS 시작일시, 종료일시 AS 종료일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [KSKNW_PK] AS NO
            ,[KSKNW_WORK_PK] AS 작업NO
            ,[KSKNW_NONWORK_PK] AS 비가동NO
            ,NONWORK.코드 AS 비가동코드
            ,NONWORK.구분 AS 구분
            ,NONWORK.비가동명 AS 비가동명
            ,NONWORK.내용 AS 내용
            ,CONVERT(VARCHAR, [KSKNW_START_DT], 20) AS 시작일시
            ,CONVERT(VARCHAR, [KSKNW_END_DT], 20) AS 종료일시
            ,[KSKNW_NOTE] AS 비고
            ,[KSKNW_REGIST_NM] AS 등록자
            ,[KSKNW_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB]
          LEFT JOIN
          (
            SELECT
              [NOWK_PK] AS NO
              ,[NOWK_CODE] AS 코드
              ,[NOWK_DIV] AS 구분
              ,[NOWK_NAME] AS 비가동명
              ,[NOWK_CONTENT] AS 내용
            FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
          ) AS NONWORK ON NONWORK.NO = [KSKNW_NONWORK_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 비가동코드 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 비가동명 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
        OR 시작일시 like concat('%',@input,'%')
        OR 종료일시 like concat('%',@input,'%')
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
          NO AS NO, 작업NO AS 작업NO, 비가동NO AS 비가동NO, 비가동코드 AS 비가동코드, 구분 AS 구분, 비가동명 AS 비가동명,
          내용 AS 내용, 시작일시 AS 시작일시, 종료일시 AS 종료일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [KSKNW_PK] AS NO
            ,[KSKNW_WORK_PK] AS 작업NO
            ,[KSKNW_NONWORK_PK] AS 비가동NO
            ,NONWORK.코드 AS 비가동코드
            ,NONWORK.구분 AS 구분
            ,NONWORK.비가동명 AS 비가동명
            ,NONWORK.내용 AS 내용
            ,CONVERT(VARCHAR, [KSKNW_START_DT], 20) AS 시작일시
            ,CONVERT(VARCHAR, [KSKNW_END_DT], 20) AS 종료일시
            ,[KSKNW_NOTE] AS 비고
            ,[KSKNW_REGIST_NM] AS 등록자
            ,[KSKNW_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB]
          LEFT JOIN
          (
            SELECT
              [NOWK_PK] AS NO
              ,[NOWK_CODE] AS 코드
              ,[NOWK_DIV] AS 구분
              ,[NOWK_NAME] AS 비가동명
              ,[NOWK_CONTENT] AS 내용
            FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
          ) AS NONWORK ON NONWORK.NO = [KSKNW_NONWORK_PK]
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
      .input("작업NO", req.body.data.작업NO ?? null)
      .input("비가동NO", req.body.data.비가동NO ?? null)
      .input(
        "시작일시",
        moment(req.body.data.시작일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input(
        "종료일시",
        moment(req.body.data.종료일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[KIOSK_NONWORK_TB]
          ([KSKNW_WORK_PK]
          ,[KSKNW_NONWORK_PK]
          ,[KSKNW_START_DT]
          ,[KSKNW_END_DT]
          ,[KSKNW_NOTE]
          ,[KSKNW_REGIST_NM]
          ,[KSKNW_REGIST_DT])
        VALUES
          (@작업NO,@비가동NO,@시작일시,@종료일시,@비고,@등록자,@등록일시)
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

// 수정
router.post("/edit", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("NO", req.body.data.NO ?? 0)
      .input("작업NO", req.body.data.작업NO ?? null)
      .input("비가동NO", req.body.data.비가동NO ?? null)
      .input(
        "시작일시",
        moment(req.body.data.시작일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input(
        "종료일시",
        moment(req.body.data.종료일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[KIOSK_NONWORK_TB]
          SET 
            [KSKNW_WORK_PK] = @작업NO
            ,[KSKNW_NONWORK_PK] = @비가동NO
            ,[KSKNW_START_DT] = @시작일시
            ,[KSKNW_END_DT] = @종료일시
            ,[KSKNW_NOTE] = @비고
            ,[KSKNW_REGIST_NM] = @등록자
            ,[KSKNW_REGIST_DT] = @등록일시
          WHERE [KSKNW_PK] = @NO
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
          [KSKNW_PK] AS NO
          ,[KSKNW_WORK_PK] AS 작업NO
          ,[KSKNW_NONWORK_PK] AS 비가동NO
          ,NONWORK.코드 AS 비가동코드
          ,NONWORK.구분 AS 구분
          ,NONWORK.비가동명 AS 비가동명
          ,NONWORK.내용 AS 내용
          ,CONVERT(VARCHAR, [KSKNW_START_DT], 20) AS 시작일시
          ,CONVERT(VARCHAR, [KSKNW_END_DT], 20) AS 종료일시
          ,[KSKNW_NOTE] AS 비고
          ,[KSKNW_REGIST_NM] AS 등록자
          ,[KSKNW_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB]
        LEFT JOIN
        (
          SELECT
            [NOWK_PK] AS NO
            ,[NOWK_CODE] AS 코드
            ,[NOWK_DIV] AS 구분
            ,[NOWK_NAME] AS 비가동명
            ,[NOWK_CONTENT] AS 내용
          FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
        ) AS NONWORK ON NONWORK.NO = [KSKNW_NONWORK_PK]
        WHERE [KSKNW_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB] WHERE [KSKNW_PK] = @key`
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
