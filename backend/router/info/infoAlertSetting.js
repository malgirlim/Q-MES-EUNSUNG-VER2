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
    .input("menu", "관리자메뉴_알림설정") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [ALST_PK] AS NO
        ,[ALST_DIV] AS 구분
        ,[ALST_FACILITY_PK] AS 설비NO
        ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [ALST_FACILITY_PK]) AS 설비명
        ,[ALST_USE] AS 기능사용
        ,CONVERT(VARCHAR(5),[ALST_TIME],8) AS 발송시간
        ,[ALST_POINT] AS 발송시점
        ,[ALST_NOTE] AS 비고
        ,[ALST_REGIST_NM] AS 등록자
        ,[ALST_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_ALERT_SETTING_TB]
      ORDER BY [ALST_PK] DESC
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
          NO AS NO, 구분 AS 구분, 설비NO AS 설비NO, 설비명 AS 설비명, 기능사용 AS 기능사용, 발송시간 AS 발송시간,
          발송시점 AS 발송시점, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ALST_PK] AS NO
            ,[ALST_DIV] AS 구분
            ,[ALST_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [ALST_FACILITY_PK]) AS 설비명
            ,[ALST_USE] AS 기능사용
            ,CONVERT(VARCHAR(5),[ALST_TIME],8) AS 발송시간
            ,[ALST_POINT] AS 발송시점
            ,[ALST_NOTE] AS 비고
            ,[ALST_REGIST_NM] AS 등록자
            ,[ALST_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ALERT_SETTING_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 구분 like concat('%',@input,'%')
        OR 설비명 like concat('%',@input,'%')
        OR 기능사용 like concat('%',@input,'%')
        OR 발송시간 like concat('%',@input,'%')
        OR 발송시점 like concat('%',@input,'%')
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
          NO AS NO, 구분 AS 구분, 설비NO AS 설비NO, 설비명 AS 설비명, 기능사용 AS 기능사용, 발송시간 AS 발송시간,
          발송시점 AS 발송시점, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ALST_PK] AS NO
            ,[ALST_DIV] AS 구분
            ,[ALST_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [ALST_FACILITY_PK]) AS 설비명
            ,[ALST_USE] AS 기능사용
            ,CONVERT(VARCHAR(5),[ALST_TIME],8) AS 발송시간
            ,[ALST_POINT] AS 발송시점
            ,[ALST_NOTE] AS 비고
            ,[ALST_REGIST_NM] AS 등록자
            ,[ALST_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ALERT_SETTING_TB]
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
      .input("구분", req.body.data.구분 ?? "")
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("기능사용", req.body.data.기능사용 ?? "OFF")
      .input("발송시간", req.body.data.발송시간 ?? "")
      .input("발송시점", req.body.data.발송시점 ?? 0)
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_ALERT_SETTING_TB]
          ([ALST_DIV]
          ,[ALST_FACILITY_PK]
          ,[ALST_USE]
          ,[ALST_TIME]
          ,[ALST_POINT]
          ,[ALST_NOTE]
          ,[ALST_REGIST_NM]
          ,[ALST_REGIST_DT])
        VALUES
          (@구분,@설비NO,@기능사용,@발송시간,@발송시점,@비고,@등록자,@등록일시)
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
        .input("구분", req.body.data[i].구분 ?? "")
        .input("설비NO", req.body.data[i].설비NO ?? null)
        .input("기능사용", req.body.data[i].기능사용 ?? "")
        .input("발송시간", req.body.data[i].발송시간 ?? "")
        .input("발송시점", req.body.data[i].발송시점 ?? 0)
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_ALERT_SETTING_TB]
          ([ALST_DIV]
          ,[ALST_FACILITY_PK]
          ,[ALST_USE]
          ,[ALST_TIME]
          ,[ALST_POINT]
          ,[ALST_NOTE]
          ,[ALST_REGIST_NM]
          ,[ALST_REGIST_DT])
        VALUES
          (@구분,@설비NO,@기능사용,@발송시간,@발송시점,@비고,@등록자,@등록일시)
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
      .input("NO", req.body.data.NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("기능사용", req.body.data.기능사용 ?? "")
      .input("발송시간", req.body.data.발송시간 ?? "")
      .input("발송시점", req.body.data.발송시점 ?? 0)
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_ALERT_SETTING_TB]
          SET 
            [ALST_DIV] = @구분
            ,[ALST_FACILITY_PK] = @설비NO
            ,[ALST_USE] = @기능사용
            ,[ALST_TIME] = @발송시간
            ,[ALST_POINT] = @발송시점
            ,[ALST_NOTE] = @비고
            ,[ALST_REGIST_NM] = @등록자
            ,[ALST_REGIST_DT] = @등록일시
          WHERE [ALST_PK] = @NO
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
          [ALST_PK] AS NO
          ,[ALST_DIV] AS 구분
          ,[ALST_FACILITY_PK] AS 설비NO
          ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [ALST_FACILITY_PK]) AS 설비명
          ,[ALST_USE] AS 기능사용
          ,CONVERT(VARCHAR(5),[ALST_TIME],8) AS 발송시간
          ,[ALST_POINT] AS 발송시점
          ,[ALST_NOTE] AS 비고
          ,[ALST_REGIST_NM] AS 등록자
          ,[ALST_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_ALERT_SETTING_TB]
        WHERE [ALST_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_ALERT_SETTING_TB] WHERE [ALST_PK] = @key`
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
