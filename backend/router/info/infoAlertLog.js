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
    .input("menu", "관리자메뉴_알림기록") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [ALLG_PK] AS NO
        ,[ALLG_USER_ID] AS 발송대상ID
        ,[ALLG_DIV] AS 구분
        ,[ALLG_TITLE] AS 제목
        ,[ALLG_CONTENT] AS 내용
        ,[ALLG_CHECK] AS 확인
        ,[ALLG_REGIST_NM] AS 등록자
        ,[ALLG_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_ALERT_LOG_TB]
      ORDER BY [ALLG_PK] DESC
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
          NO AS NO, 발송대상ID AS 발송대상ID, 구분 AS 구분, 제목 AS 제목, 내용 AS 내용, 확인 AS 확인,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ALLG_PK] AS NO
            ,[ALLG_USER_ID] AS 발송대상ID
            ,[ALLG_DIV] AS 구분
            ,[ALLG_TITLE] AS 제목
            ,[ALLG_CONTENT] AS 내용
            ,[ALLG_CHECK] AS 확인
            ,[ALLG_REGIST_NM] AS 등록자
            ,[ALLG_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ALERT_LOG_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 발송대상ID like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 제목 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
        OR 확인 like concat('%',@input,'%')
        OR 등록자 like concat('%',@input,'%')
        OR 등록일시 like concat('%',@input,'%'))
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
          NO AS NO, 발송대상ID AS 발송대상ID, 구분 AS 구분, 제목 AS 제목, 내용 AS 내용, 확인 AS 확인,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ALLG_PK] AS NO
            ,[ALLG_USER_ID] AS 발송대상ID
            ,[ALLG_DIV] AS 구분
            ,[ALLG_TITLE] AS 제목
            ,[ALLG_CONTENT] AS 내용
            ,[ALLG_CHECK] AS 확인
            ,[ALLG_REGIST_NM] AS 등록자
            ,[ALLG_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ALERT_LOG_TB]
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
      .input("발송대상ID", req.body.data.발송대상ID ?? "")
      .input("구분", req.body.data.구분 ?? "")
      .input("제목", req.body.data.제목 ?? "")
      .input("내용", req.body.data.내용 ?? "")
      .input("확인", req.body.data.확인 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_ALERT_LOG_TB]
          ([ALLG_USER_ID]
          ,[ALLG_DIV]
          ,[ALLG_TITLE]
          ,[ALLG_CONTENT]
          ,[ALLG_CHECK]
          ,[ALLG_REGIST_NM]
          ,[ALLG_REGIST_DT])
        VALUES
          (@발송대상ID,@구분,@제목,@내용,@확인,@등록자,@등록일시)
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
        .input("발송대상ID", req.body.data[i].발송대상ID ?? "")
        .input("구분", req.body.data[i].구분 ?? "")
        .input("제목", req.body.data[i].제목 ?? "")
        .input("내용", req.body.data[i].내용 ?? "")
        .input("확인", req.body.data[i].확인 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_ALERT_LOG_TB]
          ([ALLG_USER_ID]
          ,[ALLG_DIV]
          ,[ALLG_TITLE]
          ,[ALLG_CONTENT]
          ,[ALLG_CHECK]
          ,[ALLG_REGIST_NM]
          ,[ALLG_REGIST_DT])
        VALUES
          (@발송대상ID,@구분,@제목,@내용,@확인,@등록자,@등록일시)
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
      .input("발송대상ID", req.body.data.발송대상ID ?? "")
      .input("구분", req.body.data.구분 ?? "")
      .input("제목", req.body.data.제목 ?? "")
      .input("내용", req.body.data.내용 ?? "")
      .input("확인", req.body.data.확인 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_ALERT_LOG_TB]
          SET 
            [ALLG_USER_ID] = @발송대상ID
            ,[ALLG_DIV] = @구분
            ,[ALLG_TITLE] = @제목
            ,[ALLG_CONTENT] = @내용
            ,[ALLG_CHECK] = @확인
            ,[ALLG_REGIST_NM] = @등록자
            ,[ALLG_REGIST_DT] = @등록일시
          WHERE [ALLG_PK] = @NO
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
          [ALLG_PK] AS NO
          ,[ALLG_USER_ID] AS 발송대상ID
          ,[ALLG_DIV] AS 구분
          ,[ALLG_TITLE] AS 제목
          ,[ALLG_CONTENT] AS 내용
          ,[ALLG_CHECK] AS 확인
          ,[ALLG_REGIST_NM] AS 등록자
          ,[ALLG_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_ALERT_LOG_TB]
        WHERE [ALLG_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_ALERT_LOG_TB] WHERE [ALLG_PK] = @key`
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
