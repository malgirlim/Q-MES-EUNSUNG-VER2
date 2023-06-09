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
    .input("menu", "예방보전_일상점검계획") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [DISPP_PK] AS NO
        ,[DISPP_FACILITY_PK] AS 설비NO
        ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [DISPP_FACILITY_PK]) AS 설비명
        ,[DISPP_DIV] AS 구분
        ,[DISPP_CONTENT] AS 내용
        ,[DISPP_HOW] AS 검사방법
        ,[DISPP_STAND] AS 기준
        ,[DISPP_UNIT] AS 단위
        ,[DISPP_MIN] AS 최소
        ,[DISPP_MAX] AS 최대
        ,[DISPP_USER_ID] AS 담당자ID
        ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [DISPP_USER_ID]) AS 담당자
        ,[DISPP_NOTE] AS 비고
        ,[DISPP_REGIST_NM] AS 등록자
        ,[DISPP_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB]
      ORDER BY [DISPP_PK] DESC
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
          NO AS NO, 설비NO AS 설비NO, 설비명 AS 설비명, 구분 AS 구분, 내용 AS 내용, 검사방법 AS 검사방법, 기준 AS 기준, 단위 AS 단위,
          최소 AS 최소, 최대 AS 최대, 담당자ID AS 담당자ID, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [DISPP_PK] AS NO
            ,[DISPP_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [DISPP_FACILITY_PK]) AS 설비명
            ,[DISPP_DIV] AS 구분
            ,[DISPP_CONTENT] AS 내용
            ,[DISPP_HOW] AS 검사방법
            ,[DISPP_STAND] AS 기준
            ,[DISPP_UNIT] AS 단위
            ,[DISPP_MIN] AS 최소
            ,[DISPP_MAX] AS 최대
            ,[DISPP_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [DISPP_USER_ID]) AS 담당자
            ,[DISPP_NOTE] AS 비고
            ,[DISPP_REGIST_NM] AS 등록자
            ,[DISPP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 설비명 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
        OR 검사방법 like concat('%',@input,'%')
        OR 기준 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 최소 like concat('%',@input,'%')
        OR 최대 like concat('%',@input,'%')
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
          NO AS NO, 설비NO AS 설비NO, 설비명 AS 설비명, 구분 AS 구분, 내용 AS 내용, 검사방법 AS 검사방법, 기준 AS 기준, 단위 AS 단위,
          최소 AS 최소, 최대 AS 최대, 담당자ID AS 담당자ID, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [DISPP_PK] AS NO
            ,[DISPP_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [DISPP_FACILITY_PK]) AS 설비명
            ,[DISPP_DIV] AS 구분
            ,[DISPP_CONTENT] AS 내용
            ,[DISPP_HOW] AS 검사방법
            ,[DISPP_STAND] AS 기준
            ,[DISPP_UNIT] AS 단위
            ,[DISPP_MIN] AS 최소
            ,[DISPP_MAX] AS 최대
            ,[DISPP_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [DISPP_USER_ID]) AS 담당자
            ,[DISPP_NOTE] AS 비고
            ,[DISPP_REGIST_NM] AS 등록자
            ,[DISPP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB]
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
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("내용", req.body.data.내용 ?? "")
      .input("검사방법", req.body.data.검사방법 ?? "")
      .input("기준", req.body.data.기준 ?? "")
      .input("단위", req.body.data.단위 ?? "")
      .input("최소", req.body.data.최소 ?? "")
      .input("최대", req.body.data.최대 ?? "")
      .input("담당자ID", req.body.data.담당자ID ?? null)
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB]
          ([DISPP_FACILITY_PK]
          ,[DISPP_DIV]
          ,[DISPP_CONTENT]
          ,[DISPP_HOW]
          ,[DISPP_STAND]
          ,[DISPP_UNIT]
          ,[DISPP_MIN]
          ,[DISPP_MAX]
          ,[DISPP_USER_ID]
          ,[DISPP_NOTE]
          ,[DISPP_REGIST_NM]
          ,[DISPP_REGIST_DT])
        VALUES
          (@설비NO,@구분,@내용,@검사방법,@기준,@단위,@최소,@최대,@담당자ID,@비고,@등록자,@등록일시)
      `);

    // 일상점검 계획등록하면 바로 사용할 수 있게 등록 해야함
    await Pool.request()
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_TB]
          ([DISPT_DAILY_INSPECT_PLAN_PK]
          ,[DISPT_CONTENT]
          ,[DISPT_RESULT]
          ,[DISPT_NOTE]
          ,[DISPT_REGIST_NM]
          ,[DISPT_REGIST_DT])
        VALUES
          ((SELECT MAX([DISPP_PK]) FROM [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB]),'','미점검','',@등록자,@등록일시)
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
        .input("검사방법", req.body.data[i].검사방법 ?? "")
        .input("기준", req.body.data[i].기준 ?? "")
        .input("단위", req.body.data[i].단위 ?? "")
        .input("최소", req.body.data[i].최소 ?? "")
        .input("최대", req.body.data[i].최대 ?? "")
        .input("담당자ID", req.body.data[i].담당자ID ?? null)
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB]
          ([DISPP_FACILITY_PK]
          ,[DISPP_DIV]
          ,[DISPP_CONTENT]
          ,[DISPP_HOW]
          ,[DISPP_STAND]
          ,[DISPP_UNIT]
          ,[DISPP_MIN]
          ,[DISPP_MAX]
          ,[DISPP_USER_ID]
          ,[DISPP_NOTE]
          ,[DISPP_REGIST_NM]
          ,[DISPP_REGIST_DT])
        VALUES
          (@설비NO,@구분,@내용,@검사방법,@기준,@단위,@최소,@최대,@담당자ID,@비고,@등록자,@등록일시)
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
      .input("검사방법", req.body.data.검사방법 ?? "")
      .input("기준", req.body.data.기준 ?? "")
      .input("단위", req.body.data.단위 ?? "")
      .input("최소", req.body.data.최소 ?? "")
      .input("최대", req.body.data.최대 ?? "")
      .input("담당자ID", req.body.data.담당자ID ?? null)
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB]
          SET 
            [DISPP_FACILITY_PK] = @설비NO
            ,[DISPP_DIV] = @구분
            ,[DISPP_CONTENT] = @내용
            ,[DISPP_HOW] = @검사방법
            ,[DISPP_STAND] = @기준
            ,[DISPP_UNIT] = @단위
            ,[DISPP_MIN] = @최소
            ,[DISPP_MAX] = @최대
            ,[DISPP_USER_ID] = @담당자ID
            ,[DISPP_NOTE] = @비고
            ,[DISPP_REGIST_NM] = @등록자
            ,[DISPP_REGIST_DT] = @등록일시
          WHERE [DISPP_PK] = @NO
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
          [DISPP_PK] AS NO
          ,[DISPP_FACILITY_PK] AS 설비NO
          ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [DISPP_FACILITY_PK]) AS 설비명
          ,[DISPP_DIV] AS 구분
          ,[DISPP_CONTENT] AS 내용
          ,[DISPP_HOW] AS 검사방법
          ,[DISPP_STAND] AS 기준
          ,[DISPP_UNIT] AS 단위
          ,[DISPP_MIN] AS 최소
          ,[DISPP_MAX] AS 최대
          ,[DISPP_USER_ID] AS 담당자ID
          ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [DISPP_USER_ID]) AS 담당자
          ,[DISPP_NOTE] AS 비고
          ,[DISPP_REGIST_NM] AS 등록자
          ,[DISPP_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB]
        WHERE [DISPP_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB] WHERE [DISPP_PK] = @key`
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
