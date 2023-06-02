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
    .input("menu", "예방보전_설비수리계획") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [FCFPL_PK] AS NO
        ,[FCFPL_FACILITY_PK] AS 설비NO
        ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCFPL_FACILITY_PK]) AS 설비명
        ,[FCFPL_DIV] AS 구분
        ,[FCFPL_CONTENT] AS 내용
        ,[FCFPL_HOW] AS 수리방법
        ,[FCFPL_STAND] AS 기준
        ,CONVERT(varchar, [FCFPL_DATE], 23) AS 계획일
        ,CONVERT(varchar, [FCFPL_WARN_DATE], 23) AS 예보일
        ,[FCFPL_USER_ID] AS 담당자ID
        ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FCFPL_USER_ID]) AS 담당자
        ,[FCFPL_NOTE] AS 비고
        ,[FCFPL_REGIST_NM] AS 등록자
        ,[FCFPL_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB]
      ORDER BY [FCFPL_PK] DESC
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
          NO AS NO, 설비NO AS 설비NO, 설비명 AS 설비명, 구분 AS 구분, 내용 AS 내용, 수리방법 AS 수리방법, 기준 AS 기준,
          계획일 AS 계획일, 예보일 AS 예보일, 담당자ID AS 담당자ID, 담당자 AS 담당자,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FCFPL_PK] AS NO
            ,[FCFPL_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCFPL_FACILITY_PK]) AS 설비명
            ,[FCFPL_DIV] AS 구분
            ,[FCFPL_CONTENT] AS 내용
            ,[FCFPL_HOW] AS 수리방법
            ,[FCFPL_STAND] AS 기준
            ,CONVERT(varchar, [FCFPL_DATE], 23) AS 계획일
            ,CONVERT(varchar, [FCFPL_WARN_DATE], 23) AS 예보일
            ,[FCFPL_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FCFPL_USER_ID]) AS 담당자
            ,[FCFPL_NOTE] AS 비고
            ,[FCFPL_REGIST_NM] AS 등록자
            ,[FCFPL_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 설비명 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
        OR 수리방법 like concat('%',@input,'%')
        OR 기준 like concat('%',@input,'%')
        OR 계획일 like concat('%',@input,'%')
        OR 예보일 like concat('%',@input,'%')
        OR 담당자 like concat('%',@input,'%')
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
          NO AS NO, 설비NO AS 설비NO, 설비명 AS 설비명, 구분 AS 구분, 내용 AS 내용, 수리방법 AS 수리방법, 기준 AS 기준,
          계획일 AS 계획일, 예보일 AS 예보일, 담당자ID AS 담당자ID, 담당자 AS 담당자,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FCFPL_PK] AS NO
            ,[FCFPL_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCFPL_FACILITY_PK]) AS 설비명
            ,[FCFPL_DIV] AS 구분
            ,[FCFPL_CONTENT] AS 내용
            ,[FCFPL_HOW] AS 수리방법
            ,[FCFPL_STAND] AS 기준
            ,CONVERT(varchar, [FCFPL_DATE], 23) AS 계획일
            ,CONVERT(varchar, [FCFPL_WARN_DATE], 23) AS 예보일
            ,[FCFPL_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FCFPL_USER_ID]) AS 담당자
            ,[FCFPL_NOTE] AS 비고
            ,[FCFPL_REGIST_NM] AS 등록자
            ,[FCFPL_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB]
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
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("내용", req.body.data.내용 ?? "")
      .input("수리방법", req.body.data.수리방법 ?? "")
      .input("기준", req.body.data.기준 ?? "")
      .input("계획일", req.body.data.계획일 ?? "")
      .input("예보일", req.body.data.예보일 ?? "")
      .input("담당자ID", req.body.data.담당자ID ?? null)
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB]
          ([FCFPL_FACILITY_PK]
          ,[FCFPL_DIV]
          ,[FCFPL_CONTENT]
          ,[FCFPL_HOW]
          ,[FCFPL_STAND]
          ,[FCFPL_DATE]
          ,[FCFPL_WARN_DATE]
          ,[FCFPL_USER_ID]
          ,[FCFPL_NOTE]
          ,[FCFPL_REGIST_NM]
          ,[FCFPL_REGIST_DT])
        VALUES
          (@설비NO,@구분,@내용,@수리방법,@기준,@계획일,@예보일,@담당자ID,@비고,@등록자,@등록일시)
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
        .input("설비NO", req.body.data[i].설비NO ?? null)
        .input("구분", req.body.data[i].구분 ?? "")
        .input("내용", req.body.data[i].내용 ?? "")
        .input("수리방법", req.body.data[i].수리방법 ?? "")
        .input("기준", req.body.data[i].기준 ?? "")
        .input("계획일", req.body.data[i].계획일 ?? "")
        .input("예보일", req.body.data[i].예보일 ?? "")
        .input("담당자ID", req.body.data[i].담당자ID ?? null)
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB]
          ([FCFPL_FACILITY_PK]
          ,[FCFPL_DIV]
          ,[FCFPL_CONTENT]
          ,[FCFPL_HOW]
          ,[FCFPL_STAND]
          ,[FCFPL_DATE]
          ,[FCFPL_WARN_DATE]
          ,[FCFPL_USER_ID]
          ,[FCFPL_NOTE]
          ,[FCFPL_REGIST_NM]
          ,[FCFPL_REGIST_DT])
        VALUES
          (@설비NO,@구분,@내용,@수리방법,@기준,@계획일,@예보일,@담당자ID,@비고,@등록자,@등록일시)
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
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("내용", req.body.data.내용 ?? "")
      .input("수리방법", req.body.data.수리방법 ?? "")
      .input("기준", req.body.data.기준 ?? "")
      .input("계획일", req.body.data.계획일 ?? "")
      .input("예보일", req.body.data.예보일 ?? "")
      .input("담당자ID", req.body.data.담당자ID ?? null)
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB]
          SET 
            [FCFPL_FACILITY_PK] = @설비NO
            ,[FCFPL_DIV] = @구분
            ,[FCFPL_CONTENT] = @내용
            ,[FCFPL_HOW] = @수리방법
            ,[FCFPL_STAND] = @기준
            ,[FCFPL_DATE] = @계획일
            ,[FCFPL_WARN_DATE] = @예보일
            ,[FCFPL_USER_ID] = @담당자ID
            ,[FCFPL_NOTE] = @비고
            ,[FCFPL_REGIST_NM] = @등록자
            ,[FCFPL_REGIST_DT] = @등록일시
          WHERE [FCFPL_PK] = @NO
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
          [FCFPL_PK] AS NO
          ,[FCFPL_FACILITY_PK] AS 설비NO
          ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCFPL_FACILITY_PK]) AS 설비명
          ,[FCFPL_DIV] AS 구분
          ,[FCFPL_CONTENT] AS 내용
          ,[FCFPL_HOW] AS 수리방법
          ,[FCFPL_STAND] AS 기준
          ,CONVERT(varchar, [FCFPL_DATE], 23) AS 계획일
          ,CONVERT(varchar, [FCFPL_WARN_DATE], 23) AS 예보일
          ,[FCFPL_USER_ID] AS 담당자ID
          ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FCFPL_USER_ID]) AS 담당자
          ,[FCFPL_NOTE] AS 비고
          ,[FCFPL_REGIST_NM] AS 등록자
          ,[FCFPL_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB]
        WHERE [FCFPL_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_FACILITY_FIX_PLAN_TB] WHERE [FCFPL_PK] = @key`
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
