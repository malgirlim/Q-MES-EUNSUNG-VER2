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
    .input("menu", "주문관리_납품") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [DLVR_PK] AS NO
        ,[DLVR_DIV] AS 구분
        ,[DLVR_ACCEPT_PK] AS 수주NO
        ,[DLVR_ITEM_PK] AS 품목NO
        ,ITEM.품목구분 AS 품목구분
        ,ITEM.품번 AS 품번
        ,ITEM.품명 AS 품명
        ,ITEM.규격 AS 규격
        ,ITEM.단위 AS 단위
        ,[DLVR_LOTCODE] AS LOT코드
        ,[DLVR_AMOUNT] AS 수량
        ,[DLVR_DT] AS 일시
        ,[DLVR_RESULT] AS 검사결과
        ,[DLVR_NOTE] AS 비고
        ,[DLVR_REGIST_NM] AS 등록자
        ,[DLVR_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
      LEFT JOIN
      (
        SELECT
          [ITEM_PK] AS NO
          ,[ITEM_DIV] AS 품목구분
          ,[ITEM_PRODUCT_NUM] AS 품번
          ,[ITEM_NAME] AS 품명
          ,[ITEM_SIZE] AS 규격
          ,[ITEM_UNIT] AS 단위
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
      ) AS ITEM ON ITEM.NO = [DLVR_ITEM_PK]
      ORDER BY [DLVR_PK] DESC
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
          NO AS NO, 구분 AS 구분, 수주NO AS 수주NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명,
          규격 AS 규격, 단위 AS 단위, LOT코드 AS LOT코드, 수량 AS 수량, 일시 AS 일시, 검사결과 AS 검사결과,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [DLVR_PK] AS NO
            ,[DLVR_DIV] AS 구분
            ,[DLVR_ACCEPT_PK] AS 수주NO
            ,[DLVR_ITEM_PK] AS 품목NO
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,[DLVR_LOTCODE] AS LOT코드
            ,[DLVR_AMOUNT] AS 수량
            ,[DLVR_DT] AS 일시
            ,[DLVR_RESULT] AS 검사결과
            ,[DLVR_NOTE] AS 비고
            ,[DLVR_REGIST_NM] AS 등록자
            ,[DLVR_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = [DLVR_ITEM_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 구분 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR LOT코드 like concat('%',@input,'%')
        OR 수량 like concat('%',@input,'%')
        OR 일시 like concat('%',@input,'%')
        OR 검사결과 like concat('%',@input,'%')
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
          NO AS NO, 구분 AS 구분, 수주NO AS 수주NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명,
          규격 AS 규격, 단위 AS 단위, LOT코드 AS LOT코드, 수량 AS 수량, 일시 AS 일시, 검사결과 AS 검사결과,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [DLVR_PK] AS NO
            ,[DLVR_DIV] AS 구분
            ,[DLVR_ACCEPT_PK] AS 수주NO
            ,[DLVR_ITEM_PK] AS 품목NO
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,[DLVR_LOTCODE] AS LOT코드
            ,[DLVR_AMOUNT] AS 수량
            ,[DLVR_DT] AS 일시
            ,[DLVR_RESULT] AS 검사결과
            ,[DLVR_NOTE] AS 비고
            ,[DLVR_REGIST_NM] AS 등록자
            ,[DLVR_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = [DLVR_ITEM_PK]
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
      .input("구분", req.body.data.구분 ?? "")
      .input("수주NO", req.body.data.수주NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("LOT코드", req.body.data.LOT코드 ?? "")
      .input("수량", req.body.data.수량 ?? "")
      .input(
        "일시",
        moment(req.body.data.일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("검사결과", req.body.data.검사결과 ?? "미검사")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
          ([DLVR_DIV]
          ,[DLVR_ACCEPT_PK]
          ,[DLVR_ITEM_PK]
          ,[DLVR_LOTCODE]
          ,[DLVR_AMOUNT]
          ,[DLVR_DT]
          ,[DLVR_RESULT]
          ,[DLVR_NOTE]
          ,[DLVR_REGIST_NM]
          ,[DLVR_REGIST_DT])
            VALUES
          (@구분,@수주NO,@품목NO,@LOT코드,@수량,@일시,@검사결과,@비고,@등록자,@등록일시)
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
        .input("수주NO", req.body.data[i].수주NO ?? null)
        .input("품목NO", req.body.data[i].품목NO ?? null)
        .input("LOT코드", req.body.data[i].LOT코드 ?? "")
        .input("수량", req.body.data[i].수량 ?? "")
        .input(
          "일시",
          moment(req.body.data[i].일시).format("YYYY-MM-DD HH:mm:ss") ??
            moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        )
        .input("검사결과", req.body.data[i].검사결과 ?? "미검사")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
          ([DLVR_DIV]
          ,[DLVR_ACCEPT_PK]
          ,[DLVR_ITEM_PK]
          ,[DLVR_LOTCODE]
          ,[DLVR_AMOUNT]
          ,[DLVR_DT]
          ,[DLVR_RESULT]
          ,[DLVR_NOTE]
          ,[DLVR_REGIST_NM]
          ,[DLVR_REGIST_DT])
            VALUES
          (@구분,@수주NO,@품목NO,@LOT코드,@수량,@일시,@검사결과,@비고,@등록자,@등록일시)
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
      .input("구분", req.body.data.구분 ?? "")
      .input("수주NO", req.body.data.수주NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("LOT코드", req.body.data.LOT코드 ?? "")
      .input("수량", req.body.data.수량 ?? "")
      .input(
        "일시",
        moment(req.body.data.일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("검사결과", req.body.data.검사결과 ?? "미검사")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
          SET 
            [DLVR_DIV] = @구분
            ,[DLVR_ACCEPT_PK] = @수주NO
            ,[DLVR_ITEM_PK] = @품목NO
            ,[DLVR_LOTCODE] = @LOT코드
            ,[DLVR_AMOUNT] = @수량
            ,[DLVR_DT] = @일시
            ,[DLVR_RESULT] = @검사결과
            ,[DLVR_NOTE] = @비고
            ,[DLVR_REGIST_NM] = @등록자
            ,[DLVR_REGIST_DT] = @등록일시
          WHERE [DLVR_PK] = @NO
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
          [DLVR_PK] AS NO
          ,[DLVR_DIV] AS 구분
          ,[DLVR_ACCEPT_PK] AS 수주NO
          ,[DLVR_ITEM_PK] AS 품목NO
          ,ITEM.품목구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,ITEM.규격 AS 규격
          ,ITEM.단위 AS 단위
          ,[DLVR_LOTCODE] AS LOT코드
          ,[DLVR_AMOUNT] AS 수량
          ,[DLVR_DT] AS 일시
          ,[DLVR_RESULT] AS 검사결과
          ,[DLVR_NOTE] AS 비고
          ,[DLVR_REGIST_NM] AS 등록자
          ,[DLVR_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = [DLVR_ITEM_PK]
        WHERE [DLVR_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB] WHERE [DLVR_PK] = @key`
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
        ,LEFT([ACPT_DATE],10) AS 수주일
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
        ,LEFT([ACPT_PAY_DATE],10) AS 결제예정일
        ,LEFT([ACPT_DELIVERY_DATE],10) AS 납기일
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
            ,LEFT([ACPT_DATE],10) AS 수주일
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
            ,LEFT([ACPT_PAY_DATE],10) AS 결제예정일
            ,LEFT([ACPT_DELIVERY_DATE],10) AS 납기일
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
            ,LEFT([ACPT_DATE],10) AS 수주일
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
            ,LEFT([ACPT_PAY_DATE],10) AS 결제예정일
            ,LEFT([ACPT_DELIVERY_DATE],10) AS 납기일
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

// 완제품 재고 현황 데이터
router.get("/finstock", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        NO AS 품목NO
        ,LOT코드 AS LOT코드
        ,품목구분 AS 품목구분
        ,품번 AS 품번
        ,품명 AS 품명
        ,규격 AS 규격
        ,단위 AS 단위
        ,기초재고 AS 기초재고
        ,입고 AS 입고
        ,출하 AS 출하
        ,기말재고 AS 기말재고
      FROM
      (
        SELECT
          MAX(RESULT_MIDDLE.품목NO) AS NO
          ,MAX(RESULT_MIDDLE.LOT코드) AS LOT코드
          ,MAX(ITEM.품목구분) AS 품목구분
          ,MAX(ITEM.품번) AS 품번
          ,MAX(ITEM.품명) AS 품명
          ,MAX(ITEM.규격) AS 규격
          ,MAX(ITEM.단위) AS 단위
          ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
          ,SUM(RESULT_MIDDLE.입고수량) AS 입고
          ,SUM(RESULT_MIDDLE.출하수량) AS 출하
          ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
        FROM
        (
          SELECT
            입고_MIDDLE.품목NO AS 품목NO
            ,입고_MIDDLE.LOT코드 AS LOT코드
            ,0 AS 기초재고
            ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
            ,COALESCE(출하_MIDDLE.출하수량,0) AS 출하수량
            ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출하_MIDDLE.출하수량,0) AS 기말재고
          FROM
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,[ITRC_CODE] AS LOT코드
              ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) >= '000101'
            AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) <= '990101'
            GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
          ) AS 입고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [DLVR_ITEM_PK] AS 품목NO
              ,[DLVR_LOTCODE] AS LOT코드
              ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
            FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) >= '000101'
            AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) <= '990101'
            AND [DLVR_RESULT] = '합격'
            GROUP BY [DLVR_ITEM_PK], [DLVR_LOTCODE]
          ) AS 출하_MIDDLE ON 출하_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 출하_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

          UNION

          SELECT
            입고_기초재고_MIDDLE.품목NO AS 품목NO
            ,입고_기초재고_MIDDLE.LOT코드 AS LOT코드
            ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기초재고
            ,0 AS 입고수량
            ,0 AS 출하수량
            ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기말재고
          FROM
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,[ITRC_CODE] AS LOT코드
              ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) < '000101'
            GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
          ) AS 입고_기초재고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [DLVR_ITEM_PK] AS 품목NO
              ,[DLVR_LOTCODE] AS LOT코드
              ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
            FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) < '000101'
            AND [DLVR_RESULT] = '합격'
            GROUP BY [DLVR_ITEM_PK], [DLVR_LOTCODE]
          ) AS 출하_기초재고_MIDDLE ON 출하_기초재고_MIDDLE.품목NO = 입고_기초재고_MIDDLE.품목NO AND 출하_기초재고_MIDDLE.LOT코드 = 입고_기초재고_MIDDLE.LOT코드
        ) AS RESULT_MIDDLE
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = RESULT_MIDDLE.품목NO
        WHERE ITEM.품목구분 = '완제품'
      ) AS RESULT
      ORDER BY LOT코드 DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/finstock", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS 품목NO
          ,LOT코드 AS LOT코드
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,출하 AS 출하
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            MAX(RESULT_MIDDLE.품목NO) AS NO
            ,MAX(RESULT_MIDDLE.LOT코드) AS LOT코드
            ,MAX(ITEM.품목구분) AS 품목구분
            ,MAX(ITEM.품번) AS 품번
            ,MAX(ITEM.품명) AS 품명
            ,MAX(ITEM.규격) AS 규격
            ,MAX(ITEM.단위) AS 단위
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고수량) AS 입고
            ,SUM(RESULT_MIDDLE.출하수량) AS 출하
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
          FROM
          (
            SELECT
              입고_MIDDLE.품목NO AS 품목NO
              ,입고_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
              ,COALESCE(출하_MIDDLE.출하수량,0) AS 출하수량
              ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출하_MIDDLE.출하수량,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [DLVR_ITEM_PK] AS 품목NO
                ,[DLVR_LOTCODE] AS LOT코드
                ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
              FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) <= ` +
        req.body.endDate +
        `
              AND [DLVR_RESULT] = '합격'
              GROUP BY [DLVR_ITEM_PK], [DLVR_LOTCODE]
            ) AS 출하_MIDDLE ON 출하_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 출하_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

            UNION

            SELECT
              입고_기초재고_MIDDLE.품목NO AS 품목NO
              ,입고_기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기초재고
              ,0 AS 입고수량
              ,0 AS 출하수량
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_기초재고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [DLVR_ITEM_PK] AS 품목NO
                ,[DLVR_LOTCODE] AS LOT코드
                ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
              FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) < ` +
        req.body.startDate +
        `
              AND [DLVR_RESULT] = '합격'
              GROUP BY [DLVR_ITEM_PK], [DLVR_LOTCODE]
            ) AS 출하_기초재고_MIDDLE ON 출하_기초재고_MIDDLE.품목NO = 입고_기초재고_MIDDLE.품목NO AND 출하_기초재고_MIDDLE.LOT코드 = 입고_기초재고_MIDDLE.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = RESULT_MIDDLE.품목NO
          WHERE ITEM.품목구분 = '완제품'
        ) AS RESULT
        WHERE (1=1)
        AND ( LOT코드 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 기초재고 like concat('%',@input,'%')
        OR 입고 like concat('%',@input,'%')
        OR 출하 like concat('%',@input,'%')
        OR 기말재고 like concat('%',@input,'%'))
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
          NO AS 품목NO
          ,LOT코드 AS LOT코드
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,출하 AS 출하
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            MAX(RESULT_MIDDLE.품목NO) AS NO
            ,MAX(RESULT_MIDDLE.LOT코드) AS LOT코드
            ,MAX(ITEM.품목구분) AS 품목구분
            ,MAX(ITEM.품번) AS 품번
            ,MAX(ITEM.품명) AS 품명
            ,MAX(ITEM.규격) AS 규격
            ,MAX(ITEM.단위) AS 단위
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고수량) AS 입고
            ,SUM(RESULT_MIDDLE.출하수량) AS 출하
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
          FROM
          (
            SELECT
              입고_MIDDLE.품목NO AS 품목NO
              ,입고_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
              ,COALESCE(출하_MIDDLE.출하수량,0) AS 출하수량
              ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출하_MIDDLE.출하수량,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [DLVR_ITEM_PK] AS 품목NO
                ,[DLVR_LOTCODE] AS LOT코드
                ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
              FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) <= ` +
        req.body.endDate +
        `
              AND [DLVR_RESULT] = '합격'
              GROUP BY [DLVR_ITEM_PK], [DLVR_LOTCODE]
            ) AS 출하_MIDDLE ON 출하_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 출하_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

            UNION

            SELECT
              입고_기초재고_MIDDLE.품목NO AS 품목NO
              ,입고_기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기초재고
              ,0 AS 입고수량
              ,0 AS 출하수량
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출하_기초재고_MIDDLE.출하수량,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(COALESCE([ITRC_AMOUNT],0)) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [ITRC_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_기초재고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [DLVR_ITEM_PK] AS 품목NO
                ,[DLVR_LOTCODE] AS LOT코드
                ,SUM(COALESCE([DLVR_AMOUNT],0)) AS 출하수량
              FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) < ` +
        req.body.startDate +
        `
              AND [DLVR_RESULT] = '합격'
              GROUP BY [DLVR_ITEM_PK], [DLVR_LOTCODE]
            ) AS 출하_기초재고_MIDDLE ON 출하_기초재고_MIDDLE.품목NO = 입고_기초재고_MIDDLE.품목NO AND 출하_기초재고_MIDDLE.LOT코드 = 입고_기초재고_MIDDLE.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = RESULT_MIDDLE.품목NO
          WHERE ITEM.품목구분 = '완제품'
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

module.exports = router;