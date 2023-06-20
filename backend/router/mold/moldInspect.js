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
    .input("menu", "기준정보_금형 점검관리") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [MDIP_PK] AS NO
        ,[MDIP_MOLD_PK] AS 금형NO
        ,[MDIP_DIV] AS 구분
        ,[MDIP_CONTENT] AS 내용
        ,[MDIP_HOW] AS 검사방법
        ,[MDIP_STAND] AS 기준
        ,[MDIP_UNIT] AS 단위
        ,[MDIP_MIN] AS 최소
        ,[MDIP_MAX] AS 최대
        ,[MDIP_USER_ID] AS 담당자ID
        ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
        ,[MDIP_NOTE] AS 비고
        ,[MDIP_REGIST_NM] AS 등록자
        ,[MDIP_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
      ORDER BY [MDIP_PK] DESC
    `);

    // 로그기록 저장
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
          NO AS NO, 금형NO AS 금형NO, 구분 AS 구분, 내용 AS 내용, 검사방법 AS 검사방법, 기준 AS 기준, 단위 AS 단위,
          최소 AS 최소, 최대 AS 최대, 담당자ID AS 담당자ID, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDIP_PK] AS NO
            ,[MDIP_MOLD_PK] AS 금형NO
            ,[MDIP_DIV] AS 구분
            ,[MDIP_CONTENT] AS 내용
            ,[MDIP_HOW] AS 검사방법
            ,[MDIP_STAND] AS 기준
            ,[MDIP_UNIT] AS 단위
            ,[MDIP_MIN] AS 최소
            ,[MDIP_MAX] AS 최대
            ,[MDIP_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
            ,[MDIP_NOTE] AS 비고
            ,[MDIP_REGIST_NM] AS 등록자
            ,[MDIP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 구분 like concat('%',@input,'%')
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
    } else if (req.body.searchKey == "금형NO") {
      sql =
        `
        SELECT
          NO AS NO, 금형NO AS 금형NO, 구분 AS 구분, 내용 AS 내용, 검사방법 AS 검사방법, 기준 AS 기준, 단위 AS 단위,
          최소 AS 최소, 최대 AS 최대, 담당자ID AS 담당자ID, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDIP_PK] AS NO
            ,[MDIP_MOLD_PK] AS 금형NO
            ,[MDIP_DIV] AS 구분
            ,[MDIP_CONTENT] AS 내용
            ,[MDIP_HOW] AS 검사방법
            ,[MDIP_STAND] AS 기준
            ,[MDIP_UNIT] AS 단위
            ,[MDIP_MIN] AS 최소
            ,[MDIP_MAX] AS 최대
            ,[MDIP_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
            ,[MDIP_NOTE] AS 비고
            ,[MDIP_REGIST_NM] AS 등록자
            ,[MDIP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
        ) AS RESULT
        WHERE (1=1)
        AND 금형NO = @input
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
          NO AS NO, 금형NO AS 금형NO, 구분 AS 구분, 내용 AS 내용, 검사방법 AS 검사방법, 기준 AS 기준, 단위 AS 단위,
          최소 AS 최소, 최대 AS 최대, 담당자ID AS 담당자ID, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDIP_PK] AS NO
            ,[MDIP_MOLD_PK] AS 금형NO
            ,[MDIP_DIV] AS 구분
            ,[MDIP_CONTENT] AS 내용
            ,[MDIP_HOW] AS 검사방법
            ,[MDIP_STAND] AS 기준
            ,[MDIP_UNIT] AS 단위
            ,[MDIP_MIN] AS 최소
            ,[MDIP_MAX] AS 최대
            ,[MDIP_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
            ,[MDIP_NOTE] AS 비고
            ,[MDIP_REGIST_NM] AS 등록자
            ,[MDIP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
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
      .input("금형NO", req.body.data.금형NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("내용", req.body.data.내용 ?? "")
      .input("검사방법", req.body.data.검사방법 ?? "")
      .input("기준", req.body.data.기준 ?? "")
      .input("단위", req.body.data.단위 ?? "")
      .input("최소", req.body.data.최소 ?? "")
      .input("최대", req.body.data.최대 ?? "")
      .input("담당자ID", req.body.data.담당자ID ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
          ([MDIP_MOLD_PK]
          ,[MDIP_DIV]
          ,[MDIP_CONTENT]
          ,[MDIP_HOW]
          ,[MDIP_STAND]
          ,[MDIP_UNIT]
          ,[MDIP_MIN]
          ,[MDIP_MAX]
          ,[MDIP_USER_ID]
          ,[MDIP_NOTE]
          ,[MDIP_REGIST_NM]
          ,[MDIP_REGIST_DT])
        VALUES
          (@금형NO,@구분,@내용,@검사방법,@기준,@단위,@최소,@최대,@담당자ID,@비고,@등록자,@등록일시)
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
        .input("검사방법", req.body.data[i].검사방법 ?? "")
        .input("기준", req.body.data[i].기준 ?? "")
        .input("단위", req.body.data[i].단위 ?? "")
        .input("최소", req.body.data[i].최소 ?? "")
        .input("최대", req.body.data[i].최대 ?? "")
        .input("담당자ID", req.body.data[i].담당자ID ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
          ([MDIP_MOLD_PK]
          ,[MDIP_DIV]
          ,[MDIP_CONTENT]
          ,[MDIP_HOW]
          ,[MDIP_STAND]
          ,[MDIP_UNIT]
          ,[MDIP_MIN]
          ,[MDIP_MAX]
          ,[MDIP_USER_ID]
          ,[MDIP_NOTE]
          ,[MDIP_REGIST_NM]
          ,[MDIP_REGIST_DT])
        VALUES
          (@금형NO,@구분,@내용,@검사방법,@기준,@단위,@최소,@최대,@담당자ID,@비고,@등록자,@등록일시)
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
      .input("검사방법", req.body.data.검사방법 ?? "")
      .input("기준", req.body.data.기준 ?? "")
      .input("단위", req.body.data.단위 ?? "")
      .input("최소", req.body.data.최소 ?? "")
      .input("최대", req.body.data.최대 ?? "")
      .input("담당자ID", req.body.data.담당자ID ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
          SET 
            [MDIP_MOLD_PK] = @금형NO
            ,[MDIP_DIV] = @구분
            ,[MDIP_CONTENT] = @내용
            ,[MDIP_HOW] = @검사방법
            ,[MDIP_STAND] = @기준
            ,[MDIP_UNIT] = @단위
            ,[MDIP_MIN] = @최소
            ,[MDIP_MAX] = @최대
            ,[MDIP_USER_ID] = @담당자ID
            ,[MDIP_NOTE] = @비고
            ,[MDIP_REGIST_NM] = @등록자
            ,[MDIP_REGIST_DT] = @등록일시
          WHERE [MDIP_PK] = @NO
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
          [MDIP_PK] AS NO
          ,[MDIP_MOLD_PK] AS 금형NO
          ,[MDIP_DIV] AS 구분
          ,[MDIP_CONTENT] AS 내용
          ,[MDIP_HOW] AS 검사방법
          ,[MDIP_STAND] AS 기준
          ,[MDIP_UNIT] AS 단위
          ,[MDIP_MIN] AS 최소
          ,[MDIP_MAX] AS 최대
          ,[MDIP_USER_ID] AS 담당자ID
          ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
          ,[MDIP_NOTE] AS 비고
          ,[MDIP_REGIST_NM] AS 등록자
          ,[MDIP_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
        WHERE [MDIP_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB] WHERE [MDIP_PK] = @key`
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
