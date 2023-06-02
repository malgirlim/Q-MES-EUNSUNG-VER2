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
    .input("menu", "주문관리_발주") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [ORDR_PK] AS NO
        ,[ORDR_ACCEPT_PK] AS 수주NO
        ,ACCEPT.코드 AS 수주코드
        ,[ORDR_CODE] AS 발주코드
        ,[ORDR_DIV] AS 발주구분
        ,CONVERT(varchar, [ORDR_DATE], 23) AS 발주일자
        ,[ORDR_CLIENT_PK] AS 거래처NO
        ,CLIENT.거래처명 AS 거래처명
        ,[ORDR_ITEM_PK] AS 품목NO
        ,ITEM.품목구분 AS 품목구분
        ,ITEM.품번 AS 품번
        ,ITEM.품명 AS 품명
        ,[ORDR_AMOUNT] AS 발주수량
        ,(SELECT COALESCE(SUM(CONVERT(numeric,ITRC_AMOUNT)),0) FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB] WHERE [ITRC_IMPORT_INSPECT_PK] IN (SELECT IPISP_PK FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB] WHERE [IPISP_ORDER_PK] = ORDR_PK)) AS 입고수량
        ,[ORDR_UNIT_COST] AS 단가
        ,[ORDR_SUPPLY_COST] AS 공급가액
        ,[ORDR_TAX_COST] AS 세액
        ,CONVERT(varchar, [ORDR_ALLIVE_DATE], 23) AS 납기일
        ,[ORDR_ALLIVE_ADDRESS] AS 도착지주소
        ,[ORDR_ETC] AS 기타
        ,[ORDR_NOTE] AS 비고
        ,[ORDR_REGIST_NM] AS 등록자
        ,[ORDR_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
      LEFT JOIN
      (
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
      ) AS ACCEPT ON ACCEPT.NO = [ORDR_ACCEPT_PK]
      LEFT JOIN
      (
        SELECT
          [CLNT_PK] AS NO
          ,[CLNT_NAME] AS 거래처명
        FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
      ) AS CLIENT ON CLIENT.NO = [ORDR_CLIENT_PK]
      LEFT JOIN
      (
        SELECT
          [ITEM_PK] AS NO
          ,[ITEM_DIV] AS 품목구분
          ,[ITEM_PRODUCT_NUM] AS 품번
          ,[ITEM_NAME] AS 품명
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
      ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
      ORDER BY [ORDR_PK] DESC
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
          NO AS NO, 수주NO AS 수주NO, 수주코드 AS 수주코드, 발주코드 AS 발주코드, 발주구분 AS 발주구분, 발주일자 AS 발주일자,
          거래처NO AS 거래처NO, 거래처명 AS 거래처명, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명,
          발주수량 AS 발주수량, 입고수량 AS 입고수량, 단가 AS 단가, 공급가액 AS 공급가액, 세액 AS 세액, 납기일 AS 납기일,
          도착지주소 AS 도착지주소, 기타 AS 기타, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ORDR_PK] AS NO
            ,[ORDR_ACCEPT_PK] AS 수주NO
            ,ACCEPT.코드 AS 수주코드
            ,[ORDR_CODE] AS 발주코드
            ,[ORDR_DIV] AS 발주구분
            ,CONVERT(varchar, [ORDR_DATE], 23) AS 발주일자
            ,[ORDR_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[ORDR_ITEM_PK] AS 품목NO
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,[ORDR_AMOUNT] AS 발주수량
            ,(SELECT COALESCE(SUM(CONVERT(numeric,ITRC_AMOUNT)),0) FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB] WHERE [ITRC_IMPORT_INSPECT_PK] IN (SELECT IPISP_PK FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB] WHERE [IPISP_ORDER_PK] = ORDR_PK)) AS 입고수량
            ,[ORDR_UNIT_COST] AS 단가
            ,[ORDR_SUPPLY_COST] AS 공급가액
            ,[ORDR_TAX_COST] AS 세액
            ,CONVERT(varchar, [ORDR_ALLIVE_DATE], 23) AS 납기일
            ,[ORDR_ALLIVE_ADDRESS] AS 도착지주소
            ,[ORDR_ETC] AS 기타
            ,[ORDR_NOTE] AS 비고
            ,[ORDR_REGIST_NM] AS 등록자
            ,[ORDR_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
          LEFT JOIN
          (
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
          ) AS ACCEPT ON ACCEPT.NO = [ORDR_ACCEPT_PK]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [ORDR_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 발주코드 like concat('%',@input,'%')
        OR 발주구분 like concat('%',@input,'%')
        OR 발주일자 like concat('%',@input,'%')
        OR 거래처명 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 발주수량 like concat('%',@input,'%')
        OR 단가 like concat('%',@input,'%')
        OR 공급가액 like concat('%',@input,'%')
        OR 세액 like concat('%',@input,'%')
        OR 납기일 like concat('%',@input,'%')
        OR 도착지주소 like concat('%',@input,'%')
        OR 기타 like concat('%',@input,'%')
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
          NO AS NO, 수주NO AS 수주NO, 수주코드 AS 수주코드, 발주코드 AS 발주코드, 발주구분 AS 발주구분, 발주일자 AS 발주일자,
          거래처NO AS 거래처NO, 거래처명 AS 거래처명, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명,
          발주수량 AS 발주수량, 입고수량 AS 입고수량, 단가 AS 단가, 공급가액 AS 공급가액, 세액 AS 세액, 납기일 AS 납기일,
          도착지주소 AS 도착지주소, 기타 AS 기타, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ORDR_PK] AS NO
            ,[ORDR_ACCEPT_PK] AS 수주NO
            ,ACCEPT.코드 AS 수주코드
            ,[ORDR_CODE] AS 발주코드
            ,[ORDR_DIV] AS 발주구분
            ,CONVERT(varchar, [ORDR_DATE], 23) AS 발주일자
            ,[ORDR_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[ORDR_ITEM_PK] AS 품목NO
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,[ORDR_AMOUNT] AS 발주수량
            ,(SELECT COALESCE(SUM(CONVERT(numeric,ITRC_AMOUNT)),0) FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB] WHERE [ITRC_IMPORT_INSPECT_PK] IN (SELECT IPISP_PK FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB] WHERE [IPISP_ORDER_PK] = ORDR_PK)) AS 입고수량
            ,[ORDR_UNIT_COST] AS 단가
            ,[ORDR_SUPPLY_COST] AS 공급가액
            ,[ORDR_TAX_COST] AS 세액
            ,CONVERT(varchar, [ORDR_ALLIVE_DATE], 23) AS 납기일
            ,[ORDR_ALLIVE_ADDRESS] AS 도착지주소
            ,[ORDR_ETC] AS 기타
            ,[ORDR_NOTE] AS 비고
            ,[ORDR_REGIST_NM] AS 등록자
            ,[ORDR_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
          LEFT JOIN
          (
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
          ) AS ACCEPT ON ACCEPT.NO = [ORDR_ACCEPT_PK]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [ORDR_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
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
      .input("발주코드", req.body.data.발주코드 ?? "")
      .input("발주구분", req.body.data.발주구분 ?? "")
      .input("발주일자", req.body.data.발주일자 ?? "")
      .input("거래처NO", req.body.data.거래처NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("발주수량", req.body.data.발주수량 ?? "")
      .input("단가", req.body.data.단가 ?? "")
      .input("공급가액", req.body.data.공급가액 ?? "")
      .input("세액", req.body.data.세액 ?? "")
      .input("납기일", req.body.data.납기일 ?? "")
      .input("도착지주소", req.body.data.도착지주소 ?? "")
      .input("기타", req.body.data.기타 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_ORDER_TB]
          ([ORDR_ACCEPT_PK]
          ,[ORDR_CODE]
          ,[ORDR_DIV]
          ,[ORDR_DATE]
          ,[ORDR_CLIENT_PK]
          ,[ORDR_ITEM_PK]
          ,[ORDR_AMOUNT]
          ,[ORDR_UNIT_COST]
          ,[ORDR_SUPPLY_COST]
          ,[ORDR_TAX_COST]
          ,[ORDR_ALLIVE_DATE]
          ,[ORDR_ALLIVE_ADDRESS]
          ,[ORDR_ETC]
          ,[ORDR_NOTE]
          ,[ORDR_REGIST_NM]
          ,[ORDR_REGIST_DT])
            VALUES
          (@수주NO,@발주코드,@발주구분,@발주일자,@거래처NO,@품목NO,@발주수량,@단가,@공급가액,@세액,@납기일,@도착지주소,
            @기타,@비고,@등록자,@등록일시)
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
        .input("발주코드", req.body.data[i].발주코드 ?? "")
        .input("발주구분", req.body.data[i].발주구분 ?? "")
        .input("발주일자", req.body.data[i].발주일자 ?? "")
        .input("거래처NO", req.body.data[i].거래처NO ?? null)
        .input("품목NO", req.body.data[i].품목NO ?? null)
        .input("발주수량", req.body.data[i].발주수량 ?? "")
        .input("단가", req.body.data[i].단가 ?? "")
        .input("공급가액", req.body.data[i].공급가액 ?? "")
        .input("세액", req.body.data[i].세액 ?? "")
        .input("납기일", req.body.data[i].납기일 ?? "")
        .input("도착지주소", req.body.data[i].도착지주소 ?? "")
        .input("기타", req.body.data[i].기타 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_ORDER_TB]
          ([ORDR_ACCEPT_PK]
          ,[ORDR_CODE]
          ,[ORDR_DIV]
          ,[ORDR_DATE]
          ,[ORDR_CLIENT_PK]
          ,[ORDR_ITEM_PK]
          ,[ORDR_AMOUNT]
          ,[ORDR_UNIT_COST]
          ,[ORDR_SUPPLY_COST]
          ,[ORDR_TAX_COST]
          ,[ORDR_ALLIVE_DATE]
          ,[ORDR_ALLIVE_ADDRESS]
          ,[ORDR_ETC]
          ,[ORDR_NOTE]
          ,[ORDR_REGIST_NM]
          ,[ORDR_REGIST_DT])
            VALUES
          (@수주NO,@발주코드,@발주구분,@발주일자,@거래처NO,@품목NO,@발주수량,@단가,@공급가액,@세액,@납기일,@도착지주소,
            @기타,@비고,@등록자,@등록일시)
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
      .input("발주코드", req.body.data.발주코드 ?? "")
      .input("발주구분", req.body.data.발주구분 ?? "")
      .input("발주일자", req.body.data.발주일자 ?? "")
      .input("거래처NO", req.body.data.거래처NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("발주수량", req.body.data.발주수량 ?? "")
      .input("단가", req.body.data.단가 ?? "")
      .input("공급가액", req.body.data.공급가액 ?? "")
      .input("세액", req.body.data.세액 ?? "")
      .input("납기일", req.body.data.납기일 ?? "")
      .input("도착지주소", req.body.data.도착지주소 ?? "")
      .input("기타", req.body.data.기타 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_ORDER_TB]
          SET 
          [ORDR_ACCEPT_PK] = @수주NO
          ,[ORDR_CODE] = @발주코드
          ,[ORDR_DIV] = @발주구분
          ,[ORDR_DATE] = @발주일자
          ,[ORDR_CLIENT_PK] = @거래처NO
          ,[ORDR_ITEM_PK] = @품목NO
          ,[ORDR_AMOUNT] = @발주수량
          ,[ORDR_UNIT_COST] = @단가
          ,[ORDR_SUPPLY_COST] = @공급가액
          ,[ORDR_TAX_COST] = @세액
          ,[ORDR_ALLIVE_DATE] = @납기일
          ,[ORDR_ALLIVE_ADDRESS] = @도착지주소
          ,[ORDR_ETC] = @기타
          ,[ORDR_NOTE] = @비고
          ,[ORDR_REGIST_NM] = @등록자
          ,[ORDR_REGIST_DT] = @등록일시
        WHERE [ORDR_PK] = @NO
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
          [ORDR_PK] AS NO
          ,[ORDR_ACCEPT_PK] AS 수주NO
          ,ACCEPT.코드 AS 수주코드
          ,[ORDR_CODE] AS 발주코드
          ,[ORDR_DIV] AS 발주구분
          ,[ORDR_DATE] AS 발주일자
          ,[ORDR_CLIENT_PK] AS 거래처NO
          ,CLIENT.거래처명 AS 거래처명
          ,[ORDR_ITEM_PK] AS 품목NO
          ,ITEM.품목구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,[ORDR_AMOUNT] AS 발주수량
          ,(SELECT COALESCE(SUM(CONVERT(numeric,ITRC_AMOUNT)),0) FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB] WHERE [ITRC_IMPORT_INSPECT_PK] IN (SELECT IPISP_PK FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB] WHERE [IPISP_ORDER_PK] = ORDR_PK)) AS 입고수량
          ,[ORDR_UNIT_COST] AS 단가
          ,[ORDR_SUPPLY_COST] AS 공급가액
          ,[ORDR_TAX_COST] AS 세액
          ,[ORDR_ALLIVE_DATE] AS 납기일
          ,[ORDR_ALLIVE_ADDRESS] AS 도착지주소
          ,[ORDR_ETC] AS 기타
          ,[ORDR_NOTE] AS 비고
          ,[ORDR_REGIST_NM] AS 등록자
          ,[ORDR_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
        LEFT JOIN
        (
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
        ) AS ACCEPT ON ACCEPT.NO = [ORDR_ACCEPT_PK]
        LEFT JOIN
        (
          SELECT
            [CLNT_PK] AS NO
            ,[CLNT_NAME] AS 거래처명
          FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
        ) AS CLIENT ON CLIENT.NO = [ORDR_CLIENT_PK]
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
        WHERE [ORDR_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_ORDER_TB] WHERE [ORDR_PK] = @key`
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

router.post("/accept", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 수주일 AS 수주일, 코드 AS 코드, 코드순번 AS 코드순번, 구분 AS 구분, 거래처NO AS 거래처NO,
          거래처명 AS 거래처명, 연락처 AS 연락처, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명,
          수량 AS 수량, 단가 AS 단가, 공급가액 AS 공급가액, 세액 AS 세액, 결제조건 AS 결제조건, 결제예정일 AS 결제예정일,
          납기일 AS 납기일, 도착지주소 AS 도착지주소, 기타 AS 기타, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
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
        ) AS RESULT
        WHERE (1=1)
        AND ( 수주일 like concat('%',@input,'%')
        OR 코드 like concat('%',@input,'%')
        OR 코드순번 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 거래처명 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 수량 like concat('%',@input,'%')
        OR 단가 like concat('%',@input,'%')
        OR 공급가액 like concat('%',@input,'%')
        OR 세액 like concat('%',@input,'%')
        OR 납기일 like concat('%',@input,'%')
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
          NO AS NO, 수주일 AS 수주일, 코드 AS 코드, 코드순번 AS 코드순번, 구분 AS 구분, 거래처NO AS 거래처NO,
          거래처명 AS 거래처명, 연락처 AS 연락처, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명,
          수량 AS 수량, 단가 AS 단가, 공급가액 AS 공급가액, 세액 AS 세액, 결제조건 AS 결제조건, 결제예정일 AS 결제예정일,
          납기일 AS 납기일, 도착지주소 AS 도착지주소, 기타 AS 기타, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
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

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// 거래처 데이터
router.get("/client", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
      [CLNT_PK] AS NO
      ,[CLNT_CODE] AS 코드
      ,[CLNT_DIV] AS 구분
      ,[CLNT_NAME] AS 거래처명
      ,[CLNT_BUSINESS_NO] AS 사업자번호
      ,[CLNT_ADDRESS] AS 주소
      ,[CLNT_TEL] AS 전화번호
      ,[CLNT_PHONE] AS 휴대폰번호
      ,[CLNT_FAX] AS 팩스
      ,[CLNT_EMAIL] AS 이메일
      ,[CLNT_AGENT] AS 담당자
      ,[CLNT_NOTE] AS 비고
      ,[CLNT_REGIST_NM] AS 등록자
      ,[CLNT_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
      ORDER BY [CLNT_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});
router.post("/client", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 거래처명 AS 거래처명, 사업자번호 AS 사업자번호,
          주소 AS 주소, 전화번호 AS 전화번호, 휴대폰번호 AS 휴대폰번호, 팩스 AS 팩스,
          이메일 AS 이메일, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
        SELECT
          [CLNT_PK] AS NO
          ,[CLNT_CODE] AS 코드
          ,[CLNT_DIV] AS 구분
          ,[CLNT_NAME] AS 거래처명
          ,[CLNT_BUSINESS_NO] AS 사업자번호
          ,[CLNT_ADDRESS] AS 주소
          ,[CLNT_TEL] AS 전화번호
          ,[CLNT_PHONE] AS 휴대폰번호
          ,[CLNT_FAX] AS 팩스
          ,[CLNT_EMAIL] AS 이메일
          ,[CLNT_AGENT] AS 담당자
          ,[CLNT_NOTE] AS 비고
          ,[CLNT_REGIST_NM] AS 등록자
          ,[CLNT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 코드 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 거래처명 like concat('%',@input,'%')
        OR 사업자번호 like concat('%',@input,'%')
        OR 주소 like concat('%',@input,'%')
        OR 전화번호 like concat('%',@input,'%')
        OR 휴대폰번호 like concat('%',@input,'%')
        OR 팩스 like concat('%',@input,'%')
        OR 이메일 like concat('%',@input,'%')
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
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 거래처명 AS 거래처명, 사업자번호 AS 사업자번호,
          주소 AS 주소, 전화번호 AS 전화번호, 휴대폰번호 AS 휴대폰번호, 팩스 AS 팩스,
          이메일 AS 이메일, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
        SELECT
          [CLNT_PK] AS NO
          ,[CLNT_CODE] AS 코드
          ,[CLNT_DIV] AS 구분
          ,[CLNT_NAME] AS 거래처명
          ,[CLNT_BUSINESS_NO] AS 사업자번호
          ,[CLNT_ADDRESS] AS 주소
          ,[CLNT_TEL] AS 전화번호
          ,[CLNT_PHONE] AS 휴대폰번호
          ,[CLNT_FAX] AS 팩스
          ,[CLNT_EMAIL] AS 이메일
          ,[CLNT_AGENT] AS 담당자
          ,[CLNT_NOTE] AS 비고
          ,[CLNT_REGIST_NM] AS 등록자
          ,[CLNT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
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

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// 품목 조회
router.get("/product", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [ITEM_PK] AS NO
        ,[ITEM_CLIENT_PK] AS 거래처NO
        ,[ITEM_DIV] AS 구분
        ,[ITEM_PRODUCT_NUM] AS 품번
        ,[ITEM_NAME] AS 품명
        ,[ITEM_CAR] AS 차종
        ,[ITEM_SIZE] AS 규격
        ,[ITEM_UNIT] AS 단위
        ,[ITEM_SAFE] AS 안전재고
        ,[ITEM_COST] AS 단가
        ,[ITEM_NOTE] AS 비고
        ,[ITEM_REGIST_NM] AS 등록자
        ,[ITEM_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_ITEM_TB] 
      ORDER BY [ITEM_PK] DESC
    `);
    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/product", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 거래처NO AS 거래처NO, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명, 차종 AS 차종,
          규격 AS 규격, 단위 AS 단위, 안전재고 AS 안전재고, 단가 AS 단가, 비고 AS 비고,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[ITEM_DIV] AS 구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_CAR] AS 차종
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
            ,[ITEM_SAFE] AS 안전재고
            ,[ITEM_COST] AS 단가
            ,[ITEM_NOTE] AS 비고
            ,[ITEM_REGIST_NM] AS 등록자
            ,[ITEM_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [ITEM_CLIENT_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 차종 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 안전재고 like concat('%',@input,'%')
        OR 단가 like concat('%',@input,'%')
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
          NO AS NO, 거래처NO AS 거래처NO, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명, 차종 AS 차종,
          규격 AS 규격, 단위 AS 단위, 안전재고 AS 안전재고, 단가 AS 단가, 비고 AS 비고,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[ITEM_DIV] AS 구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_CAR] AS 차종
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
            ,[ITEM_SAFE] AS 안전재고
            ,[ITEM_COST] AS 단가
            ,[ITEM_NOTE] AS 비고
            ,[ITEM_REGIST_NM] AS 등록자
            ,[ITEM_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB] 
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [ITEM_CLIENT_PK]
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

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// 품질관리 수입검사에 검사요청
router.post("/incoming_request/insert", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("발주NO", req.body.data.발주NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("샘플수량", req.body.data.샘플수량 ?? "")
      .input("입고수량", req.body.data.입고수량 ?? "")
      .input("결과", req.body.data.결과 ?? "")
      .input("내용1", req.body.data.내용1 ?? "")
      .input("내용2", req.body.data.내용2 ?? "")
      .input("내용3", req.body.data.내용3 ?? "")
      .input("내용4", req.body.data.내용4 ?? "")
      .input("내용5", req.body.data.내용5 ?? "")
      .input("내용6", req.body.data.내용6 ?? "")
      .input("내용7", req.body.data.내용7 ?? "")
      .input("내용8", req.body.data.내용8 ?? "")
      .input("내용9", req.body.data.내용9 ?? "")
      .input("내용10", req.body.data.내용10 ?? "")
      .input("전달사항", req.body.data.전달사항 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
          ([IPISP_ORDER_PK]
          ,[IPISP_DIV]
          ,[IPISP_SAMPLE_AMT]
          ,[IPISP_RECEIVE_AMT]
          ,[IPISP_RESULT]
          ,[IPISP_CONTENT1]
          ,[IPISP_CONTENT2]
          ,[IPISP_CONTENT3]
          ,[IPISP_CONTENT4]
          ,[IPISP_CONTENT5]
          ,[IPISP_CONTENT6]
          ,[IPISP_CONTENT7]
          ,[IPISP_CONTENT8]
          ,[IPISP_CONTENT9]
          ,[IPISP_CONTENT10]
          ,[IPISP_REQUEST_DT]
          ,[IPISP_INFO]
          ,[IPISP_NOTE]
          ,[IPISP_REGIST_NM]
          ,[IPISP_REGIST_DT])
        VALUES
          (@발주NO,@구분,@샘플수량,@입고수량,@결과,@내용1,@내용2,@내용3,@내용4,@내용5,
            @내용6,@내용7,@내용8,@내용9,@내용10,GETDATE(),@전달사항,@비고,@등록자,@등록일시)
    `);

    // 로그기록 저장
    await logSend(
      (type = "수입검사요청"),
      (ct = JSON.stringify(req.body.data) + " 을 수입검사요청."),
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

module.exports = router;
