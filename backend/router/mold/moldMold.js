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
    .input("menu", "기준정보_금형관리") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [MOLD_PK] AS NO
        ,[MOLD_CODE] AS 코드
        ,[MOLD_GETDIV] AS 취득구분
        ,[MOLD_PROCESSDIV] AS 공정구분
        ,[MOLD_NAME] AS 금형명
        ,[MOLD_CLASS] AS 등급
        ,[MOLD_SIZE] AS 규격
        ,[MOLD_PROCESS_PK] AS 공정NO
        ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [MOLD_PROCESS_PK]) AS 공정명
        ,[MOLD_MAKER] AS 제작사
        ,[MOLD_COST] AS 가격
        ,CONVERT(varchar, [MOLD_GETDATE], 23) AS 취득일자
        ,CONVERT(varchar, [MOLD_LIFE], 23) AS 교체수명일
        ,[MOLD_PLACE] AS 보관장소
        ,[MOLD_IMAGE] AS 사진
        ,[MOLD_USE] AS 사용여부
        ,[MOLD_NOTE] AS 비고
        ,[MOLD_REGIST_NM] AS 등록자
        ,[MOLD_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_MOLD_TB]
      ORDER BY [MOLD_PK] DESC
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
          NO AS NO, 코드 AS 코드, 취득구분 AS 취득구분, 공정구분 AS 공정구분, 금형명 AS 금형명, 등급 AS 등급, 규격 AS 규격,
          공정NO AS 공정NO, 공정명 AS 공정명, 제작사 AS 제작사, 가격 AS 가격, 취득일자 AS 취득일자, 교체수명일 AS 교체수명일,
          보관장소 AS 보관장소, 사진 AS 사진, 사용여부 AS 사용여부, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MOLD_PK] AS NO
            ,[MOLD_CODE] AS 코드
            ,[MOLD_GETDIV] AS 취득구분
            ,[MOLD_PROCESSDIV] AS 공정구분
            ,[MOLD_NAME] AS 금형명
            ,[MOLD_CLASS] AS 등급
            ,[MOLD_SIZE] AS 규격
            ,[MOLD_PROCESS_PK] AS 공정NO
            ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [MOLD_PROCESS_PK]) AS 공정명
            ,[MOLD_MAKER] AS 제작사
            ,[MOLD_COST] AS 가격
            ,CONVERT(varchar, [MOLD_GETDATE], 23) AS 취득일자
            ,CONVERT(varchar, [MOLD_LIFE], 23) AS 교체수명일
            ,[MOLD_PLACE] AS 보관장소
            ,[MOLD_IMAGE] AS 사진
            ,[MOLD_USE] AS 사용여부
            ,[MOLD_NOTE] AS 비고
            ,[MOLD_REGIST_NM] AS 등록자
            ,[MOLD_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_MOLD_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 코드 like concat('%',@input,'%')
        OR 취득구분 like concat('%',@input,'%')
        OR 공정구분 like concat('%',@input,'%')
        OR 금형명 like concat('%',@input,'%')
        OR 등급 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 공정명 like concat('%',@input,'%')
        OR 제작사 like concat('%',@input,'%')
        OR 가격 like concat('%',@input,'%')
        OR 취득일자 like concat('%',@input,'%')
        OR 교체수명일 like concat('%',@input,'%')
        OR 보관장소 like concat('%',@input,'%')
        OR 사용여부 like concat('%',@input,'%')
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
          NO AS NO, 코드 AS 코드, 취득구분 AS 취득구분, 공정구분 AS 공정구분, 금형명 AS 금형명, 등급 AS 등급, 규격 AS 규격,
          공정NO AS 공정NO, 공정명 AS 공정명, 제작사 AS 제작사, 가격 AS 가격, 취득일자 AS 취득일자, 교체수명일 AS 교체수명일,
          보관장소 AS 보관장소, 사진 AS 사진, 사용여부 AS 사용여부, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MOLD_PK] AS NO
            ,[MOLD_CODE] AS 코드
            ,[MOLD_GETDIV] AS 취득구분
            ,[MOLD_PROCESSDIV] AS 공정구분
            ,[MOLD_NAME] AS 금형명
            ,[MOLD_CLASS] AS 등급
            ,[MOLD_SIZE] AS 규격
            ,[MOLD_PROCESS_PK] AS 공정NO
            ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [MOLD_PROCESS_PK]) AS 공정명
            ,[MOLD_MAKER] AS 제작사
            ,[MOLD_COST] AS 가격
            ,CONVERT(varchar, [MOLD_GETDATE], 23) AS 취득일자
            ,CONVERT(varchar, [MOLD_LIFE], 23) AS 교체수명일
            ,[MOLD_PLACE] AS 보관장소
            ,[MOLD_IMAGE] AS 사진
            ,[MOLD_USE] AS 사용여부
            ,[MOLD_NOTE] AS 비고
            ,[MOLD_REGIST_NM] AS 등록자
            ,[MOLD_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_MOLD_TB]
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
      .input("코드", req.body.data.코드 ?? "")
      .input("취득구분", req.body.data.취득구분 ?? "")
      .input("공정구분", req.body.data.공정구분 ?? "")
      .input("금형명", req.body.data.금형명 ?? "")
      .input("등급", req.body.data.등급 ?? "")
      .input("규격", req.body.data.규격 ?? "")
      .input("공정NO", req.body.data.공정NO ?? null)
      .input("제작사", req.body.data.제작사 ?? "")
      .input("가격", req.body.data.가격 ?? "")
      .input("취득일자", req.body.data.취득일자 ?? "")
      .input("교체수명일", req.body.data.교체수명일 ?? "")
      .input("보관장소", req.body.data.보관장소 ?? "")
      .input("사진", req.body.data.사진 ?? "")
      .input("사용여부", req.body.data.사용여부 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_MOLD_TB]
          ([MOLD_CODE]
          ,[MOLD_GETDIV]
          ,[MOLD_PROCESSDIV]
          ,[MOLD_NAME]
          ,[MOLD_CLASS]
          ,[MOLD_SIZE]
          ,[MOLD_PROCESS_PK]
          ,[MOLD_MAKER]
          ,[MOLD_COST]
          ,[MOLD_GETDATE]
          ,[MOLD_LIFE]
          ,[MOLD_PLACE]
          ,[MOLD_IMAGE]
          ,[MOLD_USE]
          ,[MOLD_NOTE]
          ,[MOLD_REGIST_NM]
          ,[MOLD_REGIST_DT])
        VALUES
          (@코드,@취득구분,@공정구분,@금형명,@등급,@규격,@공정NO,@제작사,@가격,@취득일자,@교체수명일,@보관장소,@사진,@사용여부,@비고,@등록자,@등록일시)
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
        .input("코드", req.body.data[i].코드 ?? "")
        .input("취득구분", req.body.data[i].취득구분 ?? "")
        .input("공정구분", req.body.data[i].공정구분 ?? "")
        .input("금형명", req.body.data[i].금형명 ?? "")
        .input("등급", req.body.data[i].등급 ?? "")
        .input("규격", req.body.data[i].규격 ?? "")
        .input("공정NO", req.body.data[i].공정NO ?? null)
        .input("제작사", req.body.data[i].제작사 ?? "")
        .input("가격", req.body.data[i].가격 ?? "")
        .input("취득일자", req.body.data[i].취득일자 ?? "")
        .input("교체수명일", req.body.data[i].교체수명일 ?? "")
        .input("보관장소", req.body.data[i].보관장소 ?? "")
        .input("사진", req.body.data[i].사진 ?? "")
        .input("사용여부", req.body.data[i].사용여부 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_MOLD_TB]
          ([MOLD_CODE]
          ,[MOLD_GETDIV]
          ,[MOLD_PROCESSDIV]
          ,[MOLD_NAME]
          ,[MOLD_CLASS]
          ,[MOLD_SIZE]
          ,[MOLD_PROCESS_PK]
          ,[MOLD_MAKER]
          ,[MOLD_COST]
          ,[MOLD_GETDATE]
          ,[MOLD_LIFE]
          ,[MOLD_PLACE]
          ,[MOLD_IMAGE]
          ,[MOLD_USE]
          ,[MOLD_NOTE]
          ,[MOLD_REGIST_NM]
          ,[MOLD_REGIST_DT])
        VALUES
          (@코드,@취득구분,@공정구분,@금형명,@등급,@규격,@공정NO,@제작사,@가격,@취득일자,@교체수명일,@보관장소,@사진,@사용여부,@비고,@등록자,@등록일시)
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
      .input("코드", req.body.data.코드 ?? "")
      .input("취득구분", req.body.data.취득구분 ?? "")
      .input("공정구분", req.body.data.공정구분 ?? "")
      .input("금형명", req.body.data.금형명 ?? "")
      .input("등급", req.body.data.등급 ?? "")
      .input("규격", req.body.data.규격 ?? "")
      .input("공정NO", req.body.data.공정NO ?? null)
      .input("제작사", req.body.data.제작사 ?? "")
      .input("가격", req.body.data.가격 ?? "")
      .input("취득일자", req.body.data.취득일자 ?? "")
      .input("교체수명일", req.body.data.교체수명일 ?? "")
      .input("보관장소", req.body.data.보관장소 ?? "")
      .input("사진", req.body.data.사진 ?? "")
      .input("사용여부", req.body.data.사용여부 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MASTER_MOLD_TB]
          SET 
            [MOLD_CODE] = @코드
            ,[MOLD_GETDIV] = @취득구분
            ,[MOLD_PROCESSDIV] = @공정구분
            ,[MOLD_NAME] = @금형명
            ,[MOLD_CLASS] = @등급
            ,[MOLD_SIZE] = @규격
            ,[MOLD_PROCESS_PK] = @공정NO
            ,[MOLD_MAKER] = @제작사
            ,[MOLD_COST] = @가격
            ,[MOLD_GETDATE] = @취득일자
            ,[MOLD_LIFE] = @교체수명일
            ,[MOLD_PLACE] = @보관장소
            ,[MOLD_IMAGE] = @사진
            ,[MOLD_USE] = @사용여부
            ,[MOLD_NOTE] = @비고
            ,[MOLD_REGIST_NM] = @등록자
            ,[MOLD_REGIST_DT] = @등록일시
          WHERE [MOLD_PK] = @NO
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
          [MOLD_PK] AS NO
          ,[MOLD_CODE] AS 코드
          ,[MOLD_GETDIV] AS 취득구분
          ,[MOLD_PROCESSDIV] AS 공정구분
          ,[MOLD_NAME] AS 금형명
          ,[MOLD_CLASS] AS 등급
          ,[MOLD_SIZE] AS 규격
          ,[MOLD_PROCESS_PK] AS 공정NO
          ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [MOLD_PROCESS_PK]) AS 공정명
          ,[MOLD_MAKER] AS 제작사
          ,[MOLD_COST] AS 가격
          ,CONVERT(varchar, [MOLD_GETDATE], 23) AS 취득일자
          ,CONVERT(varchar, [MOLD_LIFE], 23) AS 교체수명일
          ,[MOLD_PLACE] AS 보관장소
          ,[MOLD_IMAGE] AS 사진
          ,[MOLD_USE] AS 사용여부
          ,[MOLD_NOTE] AS 비고
          ,[MOLD_REGIST_NM] AS 등록자
          ,[MOLD_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MASTER_MOLD_TB]
        WHERE [MOLD_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = @key`
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
