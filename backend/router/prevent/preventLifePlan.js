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
    .input("menu", "예방보전_설비부품수명계획") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [FPLPL_PK] AS NO
        ,[FPLPL_FACILITY_PK] AS 설비NO
        ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FPLPL_FACILITY_PK]) AS 설비명
        ,[FPLPL_FACILITY_PART_PK] AS 설비부품NO
        ,FACILITY_PART.품번 AS 품번
        ,FACILITY_PART.구분 AS 품목구분
        ,FACILITY_PART.품명 AS 품명
        ,FACILITY_PART.규격 AS 규격
        ,FACILITY_PART.단위 AS 단위
        ,[FPLPL_COUNT] AS 계획사용횟수
        ,CONVERT(VARCHAR, [FPLPL_DATE], 23) AS 계획교체일
        ,[FPLPL_CHECK] AS 교체확인
        ,[FPLPL_USER_ID] AS 담당자ID
        ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FPLPL_USER_ID]) AS 담당자
        ,[FPLPL_NOTE] AS 비고
        ,[FPLPL_REGIST_NM] AS 등록자
        ,[FPLPL_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_LIFE_PLAN_TB]
      LEFT JOIN
      (
        SELECT
          [FCPT_PK] AS NO
          ,[FCPT_CLIENT_PK] AS 거래처NO
          ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
          ,[FCPT_FACILITY_PK] AS 설비NO
          ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
          ,[FCPT_DIV] AS 구분
          ,[FCPT_PRODUCT_NUM] AS 품번
          ,[FCPT_NAME] AS 품명
          ,[FCPT_CAR] AS 차종
          ,[FCPT_SIZE] AS 규격
          ,[FCPT_UNIT] AS 단위
          ,[FCPT_SAFE] AS 안전재고
          ,[FCPT_COST] AS 단가
        FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
      ) AS FACILITY_PART ON FACILITY_PART.NO = [FPLPL_FACILITY_PART_PK]
      ORDER BY [FPLPL_PK] DESC
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
          NO AS NO, 설비NO AS 설비NO, 설비명 AS 설비명, 설비부품NO AS 설비부품NO, 품번 AS 품번, 품목구분 AS 품목구분, 품명 AS 품명,
          규격 AS 규격, 단위 AS 단위, 계획사용횟수 AS 계획사용횟수, 계획교체일 AS 계획교체일, 교체확인 AS 교체확인,
          담당자ID AS 담당자ID, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FPLPL_PK] AS NO
            ,[FPLPL_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FPLPL_FACILITY_PK]) AS 설비명
            ,[FPLPL_FACILITY_PART_PK] AS 설비부품NO
            ,FACILITY_PART.품번 AS 품번
            ,FACILITY_PART.구분 AS 품목구분
            ,FACILITY_PART.품명 AS 품명
            ,FACILITY_PART.규격 AS 규격
            ,FACILITY_PART.단위 AS 단위
            ,[FPLPL_COUNT] AS 계획사용횟수
            ,CONVERT(VARCHAR, [FPLPL_DATE], 23) AS 계획교체일
            ,[FPLPL_CHECK] AS 교체확인
            ,[FPLPL_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FPLPL_USER_ID]) AS 담당자
            ,[FPLPL_NOTE] AS 비고
            ,[FPLPL_REGIST_NM] AS 등록자
            ,[FPLPL_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_LIFE_PLAN_TB]
          LEFT JOIN
          (
            SELECT
              [FCPT_PK] AS NO
              ,[FCPT_CLIENT_PK] AS 거래처NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
              ,[FCPT_FACILITY_PK] AS 설비NO
              ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
              ,[FCPT_DIV] AS 구분
              ,[FCPT_PRODUCT_NUM] AS 품번
              ,[FCPT_NAME] AS 품명
              ,[FCPT_CAR] AS 차종
              ,[FCPT_SIZE] AS 규격
              ,[FCPT_UNIT] AS 단위
              ,[FCPT_SAFE] AS 안전재고
              ,[FCPT_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          ) AS FACILITY_PART ON FACILITY_PART.NO = [FPLPL_FACILITY_PART_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 설비명 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 계획사용횟수 like concat('%',@input,'%')
        OR 계획교체일 like concat('%',@input,'%')
        OR 교체확인 like concat('%',@input,'%')
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
          NO AS NO, 설비NO AS 설비NO, 설비명 AS 설비명, 설비부품NO AS 설비부품NO, 품번 AS 품번, 품목구분 AS 품목구분, 품명 AS 품명,
          규격 AS 규격, 단위 AS 단위, 계획사용횟수 AS 계획사용횟수, 계획교체일 AS 계획교체일, 교체확인 AS 교체확인,
          담당자ID AS 담당자ID, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FPLPL_PK] AS NO
            ,[FPLPL_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FPLPL_FACILITY_PK]) AS 설비명
            ,[FPLPL_FACILITY_PART_PK] AS 설비부품NO
            ,FACILITY_PART.품번 AS 품번
            ,FACILITY_PART.구분 AS 품목구분
            ,FACILITY_PART.품명 AS 품명
            ,FACILITY_PART.규격 AS 규격
            ,FACILITY_PART.단위 AS 단위
            ,[FPLPL_COUNT] AS 계획사용횟수
            ,CONVERT(VARCHAR, [FPLPL_DATE], 23) AS 계획교체일
            ,[FPLPL_CHECK] AS 교체확인
            ,[FPLPL_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FPLPL_USER_ID]) AS 담당자
            ,[FPLPL_NOTE] AS 비고
            ,[FPLPL_REGIST_NM] AS 등록자
            ,[FPLPL_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_LIFE_PLAN_TB]
          LEFT JOIN
          (
            SELECT
              [FCPT_PK] AS NO
              ,[FCPT_CLIENT_PK] AS 거래처NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
              ,[FCPT_FACILITY_PK] AS 설비NO
              ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
              ,[FCPT_DIV] AS 구분
              ,[FCPT_PRODUCT_NUM] AS 품번
              ,[FCPT_NAME] AS 품명
              ,[FCPT_CAR] AS 차종
              ,[FCPT_SIZE] AS 규격
              ,[FCPT_UNIT] AS 단위
              ,[FCPT_SAFE] AS 안전재고
              ,[FCPT_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          ) AS FACILITY_PART ON FACILITY_PART.NO = [FPLPL_FACILITY_PART_PK]
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
      .input("설비부품NO", req.body.data.설비부품NO ?? null)
      .input("계획사용횟수", req.body.data.계획사용횟수 ?? "")
      .input("계획교체일", req.body.data.계획교체일 ?? "")
      .input("교체확인", req.body.data.교체확인 ?? "")
      .input("담당자ID", req.body.data.담당자ID ?? null)
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_FACILITY_PART_LIFE_PLAN_TB]
          ([FPLPL_FACILITY_PK]
          ,[FPLPL_FACILITY_PART_PK]
          ,[FPLPL_COUNT]
          ,[FPLPL_DATE]
          ,[FPLPL_CHECK]
          ,[FPLPL_USER_ID]
          ,[FPLPL_NOTE]
          ,[FPLPL_REGIST_NM]
          ,[FPLPL_REGIST_DT])
        VALUES
          (@설비NO,@설비부품NO,@계획사용횟수,@계획교체일,'N',@담당자ID,@비고,@등록자,@등록일시)
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
        .input("설비부품NO", req.body.data[i].설비부품NO ?? null)
        .input("계획사용횟수", req.body.data[i].계획사용횟수 ?? "")
        .input("계획교체일", req.body.data[i].계획교체일 ?? "")
        .input("교체확인", req.body.data[i].교체확인 ?? "")
        .input("담당자ID", req.body.data[i].담당자ID ?? null)
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_FACILITY_PART_LIFE_PLAN_TB]
          ([FPLPL_FACILITY_PK]
          ,[FPLPL_FACILITY_PART_PK]
          ,[FPLPL_COUNT]
          ,[FPLPL_DATE]
          ,[FPLPL_CHECK]
          ,[FPLPL_USER_ID]
          ,[FPLPL_NOTE]
          ,[FPLPL_REGIST_NM]
          ,[FPLPL_REGIST_DT])
        VALUES
          (@설비NO,@설비부품NO,@계획사용횟수,@계획교체일,'N',@담당자ID,@비고,@등록자,@등록일시)
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
      .input("설비부품NO", req.body.data.설비부품NO ?? null)
      .input("계획사용횟수", req.body.data.계획사용횟수 ?? "")
      .input("계획교체일", req.body.data.계획교체일 ?? "")
      .input("교체확인", req.body.data.교체확인 ?? "")
      .input("담당자ID", req.body.data.담당자ID ?? null)
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_FACILITY_PART_LIFE_PLAN_TB]
          SET 
            [FPLPL_FACILITY_PK] = @설비NO
            ,[FPLPL_FACILITY_PART_PK] = @설비부품NO
            ,[FPLPL_COUNT] = @계획사용횟수
            ,[FPLPL_DATE] = @계획교체일
            ,[FPLPL_CHECK] = @교체확인
            ,[FPLPL_USER_ID] = @담당자ID
            ,[FPLPL_NOTE] = @비고
            ,[FPLPL_REGIST_NM] = @등록자
            ,[FPLPL_REGIST_DT] = @등록일시
          WHERE [FPLPL_PK] = @NO
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
          [FPLPL_PK] AS NO
          ,[FPLPL_FACILITY_PK] AS 설비NO
          ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FPLPL_FACILITY_PK]) AS 설비명
          ,[FPLPL_FACILITY_PART_PK] AS 설비부품NO
          ,FACILITY_PART.품번 AS 품번
          ,FACILITY_PART.구분 AS 품목구분
          ,FACILITY_PART.품명 AS 품명
          ,FACILITY_PART.규격 AS 규격
          ,FACILITY_PART.단위 AS 단위
          ,[FPLPL_COUNT] AS 계획사용횟수
          ,[FPLPL_DATE] AS 계획교체일
          ,[FPLPL_CHECK] AS 교체확인
          ,[FPLPL_USER_ID] AS 담당자ID
          ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FPLPL_USER_ID]) AS 담당자
          ,[FPLPL_NOTE] AS 비고
          ,[FPLPL_REGIST_NM] AS 등록자
          ,[FPLPL_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_LIFE_PLAN_TB]
        LEFT JOIN
        (
          SELECT
            [FCPT_PK] AS NO
            ,[FCPT_CLIENT_PK] AS 거래처NO
            ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
            ,[FCPT_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
            ,[FCPT_DIV] AS 구분
            ,[FCPT_PRODUCT_NUM] AS 품번
            ,[FCPT_NAME] AS 품명
            ,[FCPT_CAR] AS 차종
            ,[FCPT_SIZE] AS 규격
            ,[FCPT_UNIT] AS 단위
            ,[FCPT_SAFE] AS 안전재고
            ,[FCPT_COST] AS 단가
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
        ) AS FACILITY_PART ON FACILITY_PART.NO = [FPLPL_FACILITY_PART_PK]
        WHERE [FPLPL_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_LIFE_PLAN_TB] WHERE [FPLPL_PK] = @key`
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
