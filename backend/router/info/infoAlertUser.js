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
    .input("menu", "관리자메뉴_알림대상설정") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [ALUS_PK] AS NO
        ,[ALUS_ALST_PK] AS 알림설정NO
        ,[ALUS_USER_ID] AS 사용자ID
        ,MASTER_USER.이름 AS 이름
        ,MASTER_USER.연락처 AS 연락처
        ,MASTER_USER.부서명 AS 부서명
        ,MASTER_USER.직책 AS 직책
        ,MASTER_USER.직급 AS 직급
        ,[ALUS_NOTE] AS 비고
        ,[ALUS_REGIST_NM] AS 등록자
        ,[ALUS_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_ALERT_USER_TB]
      LEFT JOIN
      (
        SELECT
          [USER_ID] AS 아이디,
          [USER_NAME] AS 이름,
          [USER_PHONE] AS 연락처,
          [USER_EMAIL] AS 이메일,
          [USER_DEPART] AS 부서명,
          [USER_POSITION] AS 직책,
          [USER_RANK] AS 직급
        FROM [QMES2022].[dbo].[MASTER_USER_TB]
      ) AS MASTER_USER ON MASTER_USER.아이디 = [ALUS_USER_ID]
      ORDER BY [ALUS_PK] DESC
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
          NO AS NO, 알림설정NO AS 알림설정NO, 사용자ID AS 사용자ID, 이름 AS 이름, 연락처 AS 연락처, 부서명 AS 부서명,
          직책 AS 직책, 직급 AS 직급, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ALUS_PK] AS NO
            ,[ALUS_ALST_PK] AS 알림설정NO
            ,[ALUS_USER_ID] AS 사용자ID
            ,MASTER_USER.이름 AS 이름
            ,MASTER_USER.연락처 AS 연락처
            ,MASTER_USER.부서명 AS 부서명
            ,MASTER_USER.직책 AS 직책
            ,MASTER_USER.직급 AS 직급
            ,[ALUS_NOTE] AS 비고
            ,[ALUS_REGIST_NM] AS 등록자
            ,[ALUS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ALERT_USER_TB]
          LEFT JOIN
          (
            SELECT
              [USER_ID] AS 아이디,
              [USER_NAME] AS 이름,
              [USER_PHONE] AS 연락처,
              [USER_EMAIL] AS 이메일,
              [USER_DEPART] AS 부서명,
              [USER_POSITION] AS 직책,
              [USER_RANK] AS 직급
            FROM [QMES2022].[dbo].[MASTER_USER_TB]
          ) AS MASTER_USER ON MASTER_USER.아이디 = [ALUS_USER_ID]
        ) AS RESULT
        WHERE (1=1)
        AND ( 이름 like concat('%',@input,'%')
        OR 연락처 like concat('%',@input,'%')
        OR 부서명 like concat('%',@input,'%')
        OR 직책 like concat('%',@input,'%')
        OR 직급 like concat('%',@input,'%')
        OR 비고 like concat('%',@input,'%'))
        ORDER BY ` +
        req.body.sortKey +
        ` ` +
        req.body.sortOrder +
        `
      `;
    } else if (req.body.searchKey == "알림설정NO") {
      sql =
        `
        SELECT
          NO AS NO, 알림설정NO AS 알림설정NO, 사용자ID AS 사용자ID, 이름 AS 이름, 연락처 AS 연락처, 부서명 AS 부서명,
          직책 AS 직책, 직급 AS 직급, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ALUS_PK] AS NO
            ,[ALUS_ALST_PK] AS 알림설정NO
            ,[ALUS_USER_ID] AS 사용자ID
            ,MASTER_USER.이름 AS 이름
            ,MASTER_USER.연락처 AS 연락처
            ,MASTER_USER.부서명 AS 부서명
            ,MASTER_USER.직책 AS 직책
            ,MASTER_USER.직급 AS 직급
            ,[ALUS_NOTE] AS 비고
            ,[ALUS_REGIST_NM] AS 등록자
            ,[ALUS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ALERT_USER_TB]
          LEFT JOIN
          (
            SELECT
              [USER_ID] AS 아이디,
              [USER_NAME] AS 이름,
              [USER_PHONE] AS 연락처,
              [USER_EMAIL] AS 이메일,
              [USER_DEPART] AS 부서명,
              [USER_POSITION] AS 직책,
              [USER_RANK] AS 직급
            FROM [QMES2022].[dbo].[MASTER_USER_TB]
          ) AS MASTER_USER ON MASTER_USER.아이디 = [ALUS_USER_ID]
        ) AS RESULT
        WHERE (1=1)
        AND 알림설정NO = @input
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
          NO AS NO, 알림설정NO AS 알림설정NO, 사용자ID AS 사용자ID, 이름 AS 이름, 연락처 AS 연락처, 부서명 AS 부서명,
          직책 AS 직책, 직급 AS 직급, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ALUS_PK] AS NO
            ,[ALUS_ALST_PK] AS 알림설정NO
            ,[ALUS_USER_ID] AS 사용자ID
            ,MASTER_USER.이름 AS 이름
            ,MASTER_USER.연락처 AS 연락처
            ,MASTER_USER.부서명 AS 부서명
            ,MASTER_USER.직책 AS 직책
            ,MASTER_USER.직급 AS 직급
            ,[ALUS_NOTE] AS 비고
            ,[ALUS_REGIST_NM] AS 등록자
            ,[ALUS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ALERT_USER_TB]
          LEFT JOIN
          (
            SELECT
              [USER_ID] AS 아이디,
              [USER_NAME] AS 이름,
              [USER_PHONE] AS 연락처,
              [USER_EMAIL] AS 이메일,
              [USER_DEPART] AS 부서명,
              [USER_POSITION] AS 직책,
              [USER_RANK] AS 직급
            FROM [QMES2022].[dbo].[MASTER_USER_TB]
          ) AS MASTER_USER ON MASTER_USER.아이디 = [ALUS_USER_ID]
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
      .input("알림설정NO", req.body.data.알림설정NO ?? null)
      .input("사용자ID", req.body.data.사용자ID ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_ALERT_USER_TB]
          ([ALUS_ALST_PK]
          ,[ALUS_USER_ID]
          ,[ALUS_NOTE]
          ,[ALUS_REGIST_NM]
          ,[ALUS_REGIST_DT])
        VALUES
          (@알림설정NO,@사용자ID,@비고,@등록자,@등록일시)
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
        .input("알림설정NO", req.body.data[i].알림설정NO ?? null)
        .input("사용자ID", req.body.data[i].사용자ID ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_ALERT_USER_TB]
          ([ALUS_ALST_PK]
          ,[ALUS_USER_ID]
          ,[ALUS_NOTE]
          ,[ALUS_REGIST_NM]
          ,[ALUS_REGIST_DT])
        VALUES
          (@알림설정NO,@사용자ID,@비고,@등록자,@등록일시)
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
      .input("NO", req.body.data.아이디 ?? 0)
      .input("알림설정NO", req.body.data.알림설정NO ?? null)
      .input("사용자ID", req.body.data.사용자ID ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_ALERT_USER_TB]
          SET 
            [ALUS_ALST_PK] = @알림설정NO
            ,[ALUS_USER_ID] = @사용자ID
            ,[ALUS_NOTE] = @비고
            ,[ALUS_REGIST_NM] = @등록자
            ,[ALUS_REGIST_DT] = @등록일시
          WHERE [ALUS_PK] = @NO
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
          [ALUS_PK] AS NO
          ,[ALUS_ALST_PK] AS 알림설정NO
          ,[ALUS_USER_ID] AS 사용자ID
          ,MASTER_USER.이름 AS 이름
          ,MASTER_USER.연락처 AS 연락처
          ,MASTER_USER.부서명 AS 부서명
          ,MASTER_USER.직책 AS 직책
          ,MASTER_USER.직급 AS 직급
          ,[ALUS_NOTE] AS 비고
          ,[ALUS_REGIST_NM] AS 등록자
          ,[ALUS_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_ALERT_USER_TB]
        LEFT JOIN
        (
          SELECT
            [USER_ID] AS 아이디,
            [USER_NAME] AS 이름,
            [USER_PHONE] AS 연락처,
            [USER_EMAIL] AS 이메일,
            [USER_DEPART] AS 부서명,
            [USER_POSITION] AS 직책,
            [USER_RANK] AS 직급
          FROM [QMES2022].[dbo].[MASTER_USER_TB]
        ) AS MASTER_USER ON MASTER_USER.아이디 = [ALUS_USER_ID]
        WHERE [ALUS_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_ALERT_USER_TB] WHERE [ALUS_PK] = @key`
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
