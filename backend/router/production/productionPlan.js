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
    .input("menu", "생산관리_생산계획") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [PDPL_PK] AS NO
        ,[PDPL_ACCEPT_PK] AS 수주NO
        ,ACCEPT.수주코드 AS 수주코드
        ,ACCEPT.수주코드순번 AS 수주코드순번
        ,ACCEPT.품목구분 AS 품목구분
        ,ACCEPT.품번 AS 품번
        ,ACCEPT.품명 AS 품명
        ,ACCEPT.수량 AS 수주수량
        ,[PDPL_AMOUNT] AS 계획수량
        ,CONVERT(varchar, [PDPL_START_DATE], 23) AS 계획시작일
        ,CONVERT(varchar, [PDPL_END_DATE], 23) AS 계획종료일
        ,[PDPL_NOTE] AS 비고
        ,[PDPL_REGIST_NM] AS 등록자
        ,[PDPL_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_PRODUCE_PLAN_TB]
      LEFT JOIN
      (
        SELECT
          [ACPT_PK] AS NO
          ,CONVERT(varchar, [ACPT_DATE], 23) AS 수주일
          ,[ACPT_CODE] AS 수주코드
          ,[ACPT_CODE_NUM] AS 수주코드순번
          ,[ACPT_DIV] AS 구분
          ,[ACPT_CLIENT_PK] AS 거래처NO
          ,CLIENT.거래처명 AS 거래처명
          ,[ACPT_TEL] AS 연락처
          ,[ACPT_ITEM_PK] AS 품목NO
          ,ITEM.품목구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,[ACPT_AMOUNT] AS 수량
          ,[ACPT_UNIT_COST] AS 단가
          ,[ACPT_SUPPLY_COST] AS 공급가액
          ,[ACPT_TAX_COST] AS 세액
          ,[ACPT_PAY_CONDITION] AS 결제조건
          ,CONVERT(varchar, [ACPT_PAY_DATE], 23) AS 결제예정일
          ,CONVERT(varchar, [ACPT_DELIVERY_DATE], 23) AS 납기일
          ,[ACPT_DELIVERY_ADDRESS] AS 도착지주소
          ,[ACPT_ETC] AS 기타
          ,[ACPT_NOTE] AS 비고
          ,[ACPT_REGIST_NM] AS 등록자
          ,[ACPT_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_ACCEPT_TB]
        LEFT JOIN
        (
          SELECT
            [CLNT_PK] AS NO
            ,[CLNT_NAME] AS 거래처명
          FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
        ) AS CLIENT ON CLIENT.NO = [ACPT_CLIENT_PK]
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = [ACPT_ITEM_PK]
      ) AS ACCEPT ON ACCEPT.NO = [PDPL_ACCEPT_PK]
      ORDER BY [PDPL_PK] DESC
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
          NO AS NO, 수주NO AS 수주NO, 수주코드 AS 수주코드, 수주코드순번 AS 수주코드순번, 품목구분 AS 품목구분, 품번 AS 품번,
          품명 AS 품명, 수주수량 AS 수주수량, 계획수량 AS 계획수량, 계획시작일 AS 계획시작일, 계획종료일 AS 계획종료일,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDPL_PK] AS NO
            ,[PDPL_ACCEPT_PK] AS 수주NO
            ,ACCEPT.수주코드 AS 수주코드
            ,ACCEPT.수주코드순번 AS 수주코드순번
            ,ACCEPT.품목구분 AS 품목구분
            ,ACCEPT.품번 AS 품번
            ,ACCEPT.품명 AS 품명
            ,ACCEPT.수량 AS 수주수량
            ,[PDPL_AMOUNT] AS 계획수량
            ,CONVERT(varchar, [PDPL_START_DATE], 23) AS 계획시작일
            ,CONVERT(varchar, [PDPL_END_DATE], 23) AS 계획종료일
            ,[PDPL_NOTE] AS 비고
            ,[PDPL_REGIST_NM] AS 등록자
            ,[PDPL_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_PLAN_TB]
          LEFT JOIN
          (
            SELECT
              [ACPT_PK] AS NO
              ,CONVERT(varchar, [ACPT_DATE], 23) AS 수주일
              ,[ACPT_CODE] AS 수주코드
              ,[ACPT_CODE_NUM] AS 수주코드순번
              ,[ACPT_DIV] AS 구분
              ,[ACPT_CLIENT_PK] AS 거래처NO
              ,CLIENT.거래처명 AS 거래처명
              ,[ACPT_TEL] AS 연락처
              ,[ACPT_ITEM_PK] AS 품목NO
              ,ITEM.품목구분 AS 품목구분
              ,ITEM.품번 AS 품번
              ,ITEM.품명 AS 품명
              ,[ACPT_AMOUNT] AS 수량
              ,[ACPT_UNIT_COST] AS 단가
              ,[ACPT_SUPPLY_COST] AS 공급가액
              ,[ACPT_TAX_COST] AS 세액
              ,[ACPT_PAY_CONDITION] AS 결제조건
              ,CONVERT(varchar, [ACPT_PAY_DATE], 23) AS 결제예정일
              ,CONVERT(varchar, [ACPT_DELIVERY_DATE], 23) AS 납기일
              ,[ACPT_DELIVERY_ADDRESS] AS 도착지주소
              ,[ACPT_ETC] AS 기타
              ,[ACPT_NOTE] AS 비고
              ,[ACPT_REGIST_NM] AS 등록자
              ,[ACPT_REGIST_DT] AS 등록일시
            FROM [QMES2022].[dbo].[MANAGE_ACCEPT_TB]
            LEFT JOIN
            (
              SELECT
                [CLNT_PK] AS NO
                ,[CLNT_NAME] AS 거래처명
              FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
            ) AS CLIENT ON CLIENT.NO = [ACPT_CLIENT_PK]
            LEFT JOIN
            (
              SELECT
                [ITEM_PK] AS NO
                ,[ITEM_DIV] AS 품목구분
                ,[ITEM_PRODUCT_NUM] AS 품번
                ,[ITEM_NAME] AS 품명
              FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
            ) AS ITEM ON ITEM.NO = [ACPT_ITEM_PK]
          ) AS ACCEPT ON ACCEPT.NO = [PDPL_ACCEPT_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 수주코드 like concat('%',@input,'%')
        OR 수주코드순번 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 수주수량 like concat('%',@input,'%')
        OR 계획수량 like concat('%',@input,'%')
        OR 계획시작일 like concat('%',@input,'%')
        OR 계획종료일 like concat('%',@input,'%')
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
          NO AS NO, 수주NO AS 수주NO, 수주코드 AS 수주코드, 수주코드순번 AS 수주코드순번, 품목구분 AS 품목구분, 품번 AS 품번,
          품명 AS 품명, 수주수량 AS 수주수량, 계획수량 AS 계획수량, 계획시작일 AS 계획시작일, 계획종료일 AS 계획종료일,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDPL_PK] AS NO
            ,[PDPL_ACCEPT_PK] AS 수주NO
            ,ACCEPT.수주코드 AS 수주코드
            ,ACCEPT.수주코드순번 AS 수주코드순번
            ,ACCEPT.품목구분 AS 품목구분
            ,ACCEPT.품번 AS 품번
            ,ACCEPT.품명 AS 품명
            ,ACCEPT.수량 AS 수주수량
            ,[PDPL_AMOUNT] AS 계획수량
            ,CONVERT(varchar, [PDPL_START_DATE], 23) AS 계획시작일
            ,CONVERT(varchar, [PDPL_END_DATE], 23) AS 계획종료일
            ,[PDPL_NOTE] AS 비고
            ,[PDPL_REGIST_NM] AS 등록자
            ,[PDPL_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_PLAN_TB]
          LEFT JOIN
          (
            SELECT
              [ACPT_PK] AS NO
              ,CONVERT(varchar, [ACPT_DATE], 23) AS 수주일
              ,[ACPT_CODE] AS 수주코드
              ,[ACPT_CODE_NUM] AS 수주코드순번
              ,[ACPT_DIV] AS 구분
              ,[ACPT_CLIENT_PK] AS 거래처NO
              ,CLIENT.거래처명 AS 거래처명
              ,[ACPT_TEL] AS 연락처
              ,[ACPT_ITEM_PK] AS 품목NO
              ,ITEM.품목구분 AS 품목구분
              ,ITEM.품번 AS 품번
              ,ITEM.품명 AS 품명
              ,[ACPT_AMOUNT] AS 수량
              ,[ACPT_UNIT_COST] AS 단가
              ,[ACPT_SUPPLY_COST] AS 공급가액
              ,[ACPT_TAX_COST] AS 세액
              ,[ACPT_PAY_CONDITION] AS 결제조건
              ,CONVERT(varchar, [ACPT_PAY_DATE], 23) AS 결제예정일
              ,CONVERT(varchar, [ACPT_DELIVERY_DATE], 23) AS 납기일
              ,[ACPT_DELIVERY_ADDRESS] AS 도착지주소
              ,[ACPT_ETC] AS 기타
              ,[ACPT_NOTE] AS 비고
              ,[ACPT_REGIST_NM] AS 등록자
              ,[ACPT_REGIST_DT] AS 등록일시
            FROM [QMES2022].[dbo].[MANAGE_ACCEPT_TB]
            LEFT JOIN
            (
              SELECT
                [CLNT_PK] AS NO
                ,[CLNT_NAME] AS 거래처명
              FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
            ) AS CLIENT ON CLIENT.NO = [ACPT_CLIENT_PK]
            LEFT JOIN
            (
              SELECT
                [ITEM_PK] AS NO
                ,[ITEM_DIV] AS 품목구분
                ,[ITEM_PRODUCT_NUM] AS 품번
                ,[ITEM_NAME] AS 품명
              FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
            ) AS ITEM ON ITEM.NO = [ACPT_ITEM_PK]
          ) AS ACCEPT ON ACCEPT.NO = [PDPL_ACCEPT_PK]
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
      .input("수주NO", req.body.data.수주NO ?? null)
      .input("계획수량", req.body.data.계획수량 ?? "")
      .input("계획시작일", req.body.data.계획시작일 ?? "")
      .input("계획종료일", req.body.data.계획종료일 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_PLAN_TB]
          ([PDPL_ACCEPT_PK]
          ,[PDPL_AMOUNT]
          ,[PDPL_START_DATE]
          ,[PDPL_END_DATE]
          ,[PDPL_NOTE]
          ,[PDPL_REGIST_NM]
          ,[PDPL_REGIST_DT])
        VALUES
          (@수주NO,@계획수량,@계획시작일,@계획종료일,@비고,@등록자,@등록일시)
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
        .input("수주NO", req.body.data[i].수주NO ?? null)
        .input("계획수량", req.body.data[i].계획수량 ?? "")
        .input("계획시작일", req.body.data[i].계획시작일 ?? "")
        .input("계획종료일", req.body.data[i].계획종료일 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_PLAN_TB]
          ([PDPL_ACCEPT_PK]
          ,[PDPL_AMOUNT]
          ,[PDPL_START_DATE]
          ,[PDPL_END_DATE]
          ,[PDPL_NOTE]
          ,[PDPL_REGIST_NM]
          ,[PDPL_REGIST_DT])
        VALUES
          (@수주NO,@계획수량,@계획시작일,@계획종료일,@비고,@등록자,@등록일시)
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
      .input("수주NO", req.body.data.수주NO ?? null)
      .input("계획수량", req.body.data.계획수량 ?? "")
      .input("계획시작일", req.body.data.계획시작일 ?? "")
      .input("계획종료일", req.body.data.계획종료일 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_PRODUCE_PLAN_TB]
          SET 
          [PDPL_ACCEPT_PK] = @수주NO
          ,[PDPL_AMOUNT] = @계획수량
          ,[PDPL_START_DATE] = @계획시작일
          ,[PDPL_END_DATE] = @계획종료일
          ,[PDPL_NOTE] = @비고
          ,[PDPL_REGIST_NM] = @등록자
          ,[PDPL_REGIST_DT] = @등록일시
        WHERE [PDPL_PK] = @NO
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
          [PDPL_PK] AS NO
          ,[PDPL_ACCEPT_PK] AS 수주NO
          ,ACCEPT.수주코드 AS 수주코드
          ,ACCEPT.수주코드순번 AS 수주코드순번
          ,ACCEPT.품목구분 AS 품목구분
          ,ACCEPT.품번 AS 품번
          ,ACCEPT.품명 AS 품명
          ,ACCEPT.수량 AS 수주수량
          ,[PDPL_AMOUNT] AS 계획수량
          ,CONVERT(varchar, [PDPL_START_DATE], 23) AS 계획시작일
          ,CONVERT(varchar, [PDPL_END_DATE], 23) AS 계획종료일
          ,[PDPL_NOTE] AS 비고
          ,[PDPL_REGIST_NM] AS 등록자
          ,[PDPL_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_PLAN_TB]
        LEFT JOIN
        (
          SELECT
            [ACPT_PK] AS NO
            ,CONVERT(varchar, [ACPT_DATE], 23) AS 수주일
            ,[ACPT_CODE] AS 수주코드
            ,[ACPT_CODE_NUM] AS 수주코드순번
            ,[ACPT_DIV] AS 구분
            ,[ACPT_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[ACPT_TEL] AS 연락처
            ,[ACPT_ITEM_PK] AS 품목NO
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,[ACPT_AMOUNT] AS 수량
            ,[ACPT_UNIT_COST] AS 단가
            ,[ACPT_SUPPLY_COST] AS 공급가액
            ,[ACPT_TAX_COST] AS 세액
            ,[ACPT_PAY_CONDITION] AS 결제조건
            ,CONVERT(varchar, [ACPT_PAY_DATE], 23) AS 결제예정일
            ,CONVERT(varchar, [ACPT_DELIVERY_DATE], 23) AS 납기일
            ,[ACPT_DELIVERY_ADDRESS] AS 도착지주소
            ,[ACPT_ETC] AS 기타
            ,[ACPT_NOTE] AS 비고
            ,[ACPT_REGIST_NM] AS 등록자
            ,[ACPT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ACCEPT_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [ACPT_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = [ACPT_ITEM_PK]
        ) AS ACCEPT ON ACCEPT.NO = [PDPL_ACCEPT_PK]
        WHERE [PDPL_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_PRODUCE_PLAN_TB] WHERE [PDPL_PK] = @key`
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

// 수주 데이터
router.get("/accept", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [ACPT_PK] AS NO
        ,CONVERT(varchar, [ACPT_DATE], 23) AS 수주일
        ,[ACPT_CODE] AS 코드
        ,[ACPT_CODE_NUM] AS 코드순번
        ,[ACPT_DIV] AS 구분
        ,[ACPT_CLIENT_PK] AS 거래처NO
        ,CLIENT.거래처명 AS 거래처명
        ,[ACPT_TEL] AS 연락처
        ,[ACPT_ITEM_PK] AS 품목NO
        ,ITEM.품목구분 AS 품목구분
        ,ITEM.품번 AS 품번
        ,ITEM.품명 AS 품명
        ,[ACPT_AMOUNT] AS 수량
        ,[ACPT_UNIT_COST] AS 단가
        ,[ACPT_SUPPLY_COST] AS 공급가액
        ,[ACPT_TAX_COST] AS 세액
        ,[ACPT_PAY_CONDITION] AS 결제조건
        ,CONVERT(varchar, [ACPT_PAY_DATE], 23) AS 결제예정일
        ,CONVERT(varchar, [ACPT_DELIVERY_DATE], 23) AS 납기일
        ,[ACPT_DELIVERY_ADDRESS] AS 도착지주소
        ,[ACPT_ETC] AS 기타
        ,[ACPT_NOTE] AS 비고
        ,[ACPT_REGIST_NM] AS 등록자
        ,[ACPT_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_ACCEPT_TB]
      LEFT JOIN
      (
        SELECT
          [CLNT_PK] AS NO
          ,[CLNT_NAME] AS 거래처명
        FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
      ) AS CLIENT ON CLIENT.NO = [ACPT_CLIENT_PK]
      LEFT JOIN
      (
        SELECT
          [ITEM_PK] AS NO
          ,[ITEM_DIV] AS 품목구분
          ,[ITEM_PRODUCT_NUM] AS 품번
          ,[ITEM_NAME] AS 품명
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
      ) AS ITEM ON ITEM.NO = [ACPT_ITEM_PK]
      ORDER BY [ACPT_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

module.exports = router;
