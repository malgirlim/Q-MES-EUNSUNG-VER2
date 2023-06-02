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
    .input("menu", "주문관리_설비부품발주") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [FPOD_PK] AS NO
        ,[FPOD_FACILITY_PART_PK] AS 품목NO
        ,FCPART.품목구분 AS 품목구분
        ,FCPART.품번 AS 품번
        ,FCPART.품명 AS 품명
        ,[FPOD_CLIENT_PK] AS 거래처NO
        ,CLIENT.거래처명 AS 거래처명
        ,[FPOD_CODE] AS 발주코드
        ,[FPOD_DIV] AS 발주구분
        ,CONVERT(varchar, [FPOD_DATE], 23) AS 발주일자
        ,[FPOD_AMOUNT] AS 발주수량
        ,[FPOD_UNIT_COST] AS 단가
        ,[FPOD_SUPPLY_COST] AS 공급가액
        ,[FPOD_TAX_COST] AS 세액
        ,CONVERT(varchar, [FPOD_ALLIVE_DATE], 23) AS 납기일
        ,[FPOD_ALLIVE_ADDRESS] AS 도착지주소
        ,[FPOD_ETC] AS 기타
        ,[FPOD_NOTE] AS 비고
        ,[FPOD_REGIST_NM] AS 등록자
        ,[FPOD_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_ORDER_TB]
      LEFT JOIN
      (
        SELECT
          [CLNT_PK] AS NO
          ,[CLNT_NAME] AS 거래처명
        FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
      ) AS CLIENT ON CLIENT.NO = [FPOD_CLIENT_PK]
      LEFT JOIN
      (
        SELECT
          [FCPT_PK] AS NO
          ,[FCPT_CLIENT_PK] AS 거래처NO
          ,CLIENT.거래처명 AS 거래처명
          ,[FCPT_FACILITY_PK] AS 설비NO
          ,FACILITY.설비명 AS 설비명
          ,[FCPT_DIV] AS 품목구분
          ,[FCPT_PRODUCT_NUM] AS 품번
          ,[FCPT_NAME] AS 품명
          ,[FCPT_CAR] AS 차종
          ,[FCPT_SIZE] AS 규격
          ,[FCPT_UNIT] AS 단위
          ,[FCPT_SAFE] AS 안전재고
          ,[FCPT_COST] AS 단가
          ,[FCPT_NOTE] AS 비고
          ,[FCPT_REGIST_NM] AS 등록자
          ,[FCPT_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
        LEFT JOIN
        (
          SELECT
            [CLNT_PK] AS NO
            ,[CLNT_NAME] AS 거래처명
          FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
        ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
        LEFT JOIN
        (
          SELECT
            [FCLT_PK] AS NO
            ,[FCLT_NAME] AS 설비명
          FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
        ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
      ) AS FCPART ON FCPART.NO = [FPOD_FACILITY_PART_PK]
      ORDER BY [FPOD_PK] DESC
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
          NO AS NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 거래처NO AS 거래처NO,
          거래처명 AS 거래처명, 발주코드 AS 발주코드, 발주구분 AS 발주구분, 발주일자 AS 발주일자,
          발주수량 AS 발주수량, 단가 AS 단가, 공급가액 AS 공급가액, 세액 AS 세액, 납기일 AS 납기일, 도착지주소 AS 도착지주소,
          기타 AS 기타, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FPOD_PK] AS NO
            ,[FPOD_FACILITY_PART_PK] AS 품목NO
            ,FCPART.품목구분 AS 품목구분
            ,FCPART.품번 AS 품번
            ,FCPART.품명 AS 품명
            ,[FPOD_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[FPOD_CODE] AS 발주코드
            ,[FPOD_DIV] AS 발주구분
            ,CONVERT(varchar, [FPOD_DATE], 23) AS 발주일자
            ,[FPOD_AMOUNT] AS 발주수량
            ,[FPOD_UNIT_COST] AS 단가
            ,[FPOD_SUPPLY_COST] AS 공급가액
            ,[FPOD_TAX_COST] AS 세액
            ,CONVERT(varchar, [FPOD_ALLIVE_DATE], 23) AS 납기일
            ,[FPOD_ALLIVE_ADDRESS] AS 도착지주소
            ,[FPOD_ETC] AS 기타
            ,[FPOD_NOTE] AS 비고
            ,[FPOD_REGIST_NM] AS 등록자
            ,[FPOD_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_ORDER_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [FPOD_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [FCPT_PK] AS NO
              ,[FCPT_CLIENT_PK] AS 거래처NO
              ,CLIENT.거래처명 AS 거래처명
              ,[FCPT_FACILITY_PK] AS 설비NO
              ,FACILITY.설비명 AS 설비명
              ,[FCPT_DIV] AS 품목구분
              ,[FCPT_PRODUCT_NUM] AS 품번
              ,[FCPT_NAME] AS 품명
              ,[FCPT_CAR] AS 차종
              ,[FCPT_SIZE] AS 규격
              ,[FCPT_UNIT] AS 단위
              ,[FCPT_SAFE] AS 안전재고
              ,[FCPT_COST] AS 단가
              ,[FCPT_NOTE] AS 비고
              ,[FCPT_REGIST_NM] AS 등록자
              ,[FCPT_REGIST_DT] AS 등록일시
            FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
            LEFT JOIN
            (
              SELECT
                [CLNT_PK] AS NO
                ,[CLNT_NAME] AS 거래처명
              FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
            ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
            LEFT JOIN
            (
              SELECT
                [FCLT_PK] AS NO
                ,[FCLT_NAME] AS 설비명
              FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
            ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
          ) AS FCPART ON FCPART.NO = [FPOD_FACILITY_PART_PK]
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
          NO AS NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 거래처NO AS 거래처NO,
          거래처명 AS 거래처명, 발주코드 AS 발주코드, 발주구분 AS 발주구분, 발주일자 AS 발주일자,
          발주수량 AS 발주수량, 단가 AS 단가, 공급가액 AS 공급가액, 세액 AS 세액, 납기일 AS 납기일, 도착지주소 AS 도착지주소,
          기타 AS 기타, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FPOD_PK] AS NO
            ,[FPOD_FACILITY_PART_PK] AS 품목NO
            ,FCPART.품목구분 AS 품목구분
            ,FCPART.품번 AS 품번
            ,FCPART.품명 AS 품명
            ,[FPOD_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[FPOD_CODE] AS 발주코드
            ,[FPOD_DIV] AS 발주구분
            ,CONVERT(varchar, [FPOD_DATE], 23) AS 발주일자
            ,[FPOD_AMOUNT] AS 발주수량
            ,[FPOD_UNIT_COST] AS 단가
            ,[FPOD_SUPPLY_COST] AS 공급가액
            ,[FPOD_TAX_COST] AS 세액
            ,CONVERT(varchar, [FPOD_ALLIVE_DATE], 23) AS 납기일
            ,[FPOD_ALLIVE_ADDRESS] AS 도착지주소
            ,[FPOD_ETC] AS 기타
            ,[FPOD_NOTE] AS 비고
            ,[FPOD_REGIST_NM] AS 등록자
            ,[FPOD_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_ORDER_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [FPOD_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [FCPT_PK] AS NO
              ,[FCPT_CLIENT_PK] AS 거래처NO
              ,CLIENT.거래처명 AS 거래처명
              ,[FCPT_FACILITY_PK] AS 설비NO
              ,FACILITY.설비명 AS 설비명
              ,[FCPT_DIV] AS 품목구분
              ,[FCPT_PRODUCT_NUM] AS 품번
              ,[FCPT_NAME] AS 품명
              ,[FCPT_CAR] AS 차종
              ,[FCPT_SIZE] AS 규격
              ,[FCPT_UNIT] AS 단위
              ,[FCPT_SAFE] AS 안전재고
              ,[FCPT_COST] AS 단가
              ,[FCPT_NOTE] AS 비고
              ,[FCPT_REGIST_NM] AS 등록자
              ,[FCPT_REGIST_DT] AS 등록일시
            FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
            LEFT JOIN
            (
              SELECT
                [CLNT_PK] AS NO
                ,[CLNT_NAME] AS 거래처명
              FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
            ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
            LEFT JOIN
            (
              SELECT
                [FCLT_PK] AS NO
                ,[FCLT_NAME] AS 설비명
              FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
            ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
          ) AS FCPART ON FCPART.NO = [FPOD_FACILITY_PART_PK]
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
        INSERT INTO [QMES2022].[dbo].[MANAGE_FACILITY_PART_ORDER_TB]
          ([FPOD_FACILITY_PART_PK]
          ,[FPOD_CLIENT_PK]
          ,[FPOD_CODE]
          ,[FPOD_DIV]
          ,[FPOD_DATE]
          ,[FPOD_AMOUNT]
          ,[FPOD_UNIT_COST]
          ,[FPOD_SUPPLY_COST]
          ,[FPOD_TAX_COST]
          ,[FPOD_ALLIVE_DATE]
          ,[FPOD_ALLIVE_ADDRESS]
          ,[FPOD_ETC]
          ,[FPOD_NOTE]
          ,[FPOD_REGIST_NM]
          ,[FPOD_REGIST_DT])
            VALUES
          (@품목NO,@거래처NO,@발주코드,@발주구분,@발주일자,@발주수량,@단가,@공급가액,@세액,@납기일,@도착지주소,
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
        INSERT INTO [QMES2022].[dbo].[MANAGE_FACILITY_PART_ORDER_TB]
          ([FPOD_FACILITY_PART_PK]
          ,[FPOD_CLIENT_PK]
          ,[FPOD_CODE]
          ,[FPOD_DIV]
          ,[FPOD_DATE]
          ,[FPOD_AMOUNT]
          ,[FPOD_UNIT_COST]
          ,[FPOD_SUPPLY_COST]
          ,[FPOD_TAX_COST]
          ,[FPOD_ALLIVE_DATE]
          ,[FPOD_ALLIVE_ADDRESS]
          ,[FPOD_ETC]
          ,[FPOD_NOTE]
          ,[FPOD_REGIST_NM]
          ,[FPOD_REGIST_DT])
            VALUES
          (@품목NO,@거래처NO,@발주코드,@발주구분,@발주일자,@발주수량,@단가,@공급가액,@세액,@납기일,@도착지주소,
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
        UPDATE [QMES2022].[dbo].[MANAGE_FACILITY_PART_ORDER_TB]
          SET 
          [FPOD_FACILITY_PART_PK] = @품목NO
          ,[FPOD_CLIENT_PK] = @거래처NO
          ,[FPOD_CODE] = @발주코드
          ,[FPOD_DIV] = @발주구분
          ,[FPOD_DATE] = @발주일자
          ,[FPOD_AMOUNT] = @발주수량
          ,[FPOD_UNIT_COST] = @단가
          ,[FPOD_SUPPLY_COST] = @공급가액
          ,[FPOD_TAX_COST] = @세액
          ,[FPOD_ALLIVE_DATE] = @납기일
          ,[FPOD_ALLIVE_ADDRESS] = @도착지주소
          ,[FPOD_ETC] = @기타
          ,[FPOD_NOTE] = @비고
          ,[FPOD_REGIST_NM] = @등록자
          ,[FPOD_REGIST_DT] = @등록일시
        WHERE [FPOD_PK] = @NO
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
          [FPOD_PK] AS NO
          ,[FPOD_FACILITY_PART_PK] AS 품목NO
          ,FCPART.품목구분 AS 품목구분
          ,FCPART.품번 AS 품번
          ,FCPART.품명 AS 품명
          ,[FPOD_CLIENT_PK] AS 거래처NO
          ,CLIENT.거래처명 AS 거래처명
          ,[FPOD_CODE] AS 발주코드
          ,[FPOD_DIV] AS 발주구분
          ,CONVERT(varchar, [FPOD_DATE], 23) AS 발주일자
          ,[FPOD_AMOUNT] AS 발주수량
          ,[FPOD_UNIT_COST] AS 단가
          ,[FPOD_SUPPLY_COST] AS 공급가액
          ,[FPOD_TAX_COST] AS 세액
          ,CONVERT(varchar, [FPOD_ALLIVE_DATE], 23) AS 납기일
          ,[FPOD_ALLIVE_ADDRESS] AS 도착지주소
          ,[FPOD_ETC] AS 기타
          ,[FPOD_NOTE] AS 비고
          ,[FPOD_REGIST_NM] AS 등록자
          ,[FPOD_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_ORDER_TB]
        LEFT JOIN
        (
          SELECT
            [CLNT_PK] AS NO
            ,[CLNT_NAME] AS 거래처명
          FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
        ) AS CLIENT ON CLIENT.NO = [FPOD_CLIENT_PK]
        LEFT JOIN
        (
          SELECT
            [FCPT_PK] AS NO
            ,[FCPT_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[FCPT_FACILITY_PK] AS 설비NO
            ,FACILITY.설비명 AS 설비명
            ,[FCPT_DIV] AS 품목구분
            ,[FCPT_PRODUCT_NUM] AS 품번
            ,[FCPT_NAME] AS 품명
            ,[FCPT_CAR] AS 차종
            ,[FCPT_SIZE] AS 규격
            ,[FCPT_UNIT] AS 단위
            ,[FCPT_SAFE] AS 안전재고
            ,[FCPT_COST] AS 단가
            ,[FCPT_NOTE] AS 비고
            ,[FCPT_REGIST_NM] AS 등록자
            ,[FCPT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [FCLT_PK] AS NO
              ,[FCLT_NAME] AS 설비명
            FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
          ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
        ) AS FCPART ON FCPART.NO = [FPOD_FACILITY_PART_PK]
        WHERE [FPOD_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_ORDER_TB] WHERE [FPOD_PK] = @key`
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

// 설비부품 데이터
router.get("/part", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [FCPT_PK] AS NO
        ,[FCPT_CLIENT_PK] AS 거래처NO
        ,CLIENT.거래처명 AS 거래처명
        ,[FCPT_FACILITY_PK] AS 설비NO
        ,FACILITY.설비명 AS 설비명
        ,[FCPT_DIV] AS 구분
        ,[FCPT_PRODUCT_NUM] AS 품번
        ,[FCPT_NAME] AS 품명
        ,[FCPT_CAR] AS 차종
        ,[FCPT_SIZE] AS 규격
        ,[FCPT_UNIT] AS 단위
        ,[FCPT_SAFE] AS 안전재고
        ,[FCPT_COST] AS 단가
        ,[FCPT_NOTE] AS 비고
        ,[FCPT_REGIST_NM] AS 등록자
        ,[FCPT_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
      LEFT JOIN
      (
        SELECT
          [CLNT_PK] AS NO
          ,[CLNT_NAME] AS 거래처명
        FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
      ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
      LEFT JOIN
      (
        SELECT
          [FCLT_PK] AS NO
          ,[FCLT_NAME] AS 설비명
        FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
      ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
      ORDER BY [FCPT_PK] DESC
    `);
    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/part", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 거래처NO AS 거래처NO, 설비NO AS 설비NO, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명, 차종 AS 차종,
          규격 AS 규격, 단위 AS 단위, 안전재고 AS 안전재고, 단가 AS 단가, 비고 AS 비고,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FCPT_PK] AS NO
            ,[FCPT_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[FCPT_FACILITY_PK] AS 설비NO
            ,FACILITY.설비명 AS 설비명
            ,[FCPT_DIV] AS 구분
            ,[FCPT_PRODUCT_NUM] AS 품번
            ,[FCPT_NAME] AS 품명
            ,[FCPT_CAR] AS 차종
            ,[FCPT_SIZE] AS 규격
            ,[FCPT_UNIT] AS 단위
            ,[FCPT_SAFE] AS 안전재고
            ,[FCPT_COST] AS 단가
            ,[FCPT_NOTE] AS 비고
            ,[FCPT_REGIST_NM] AS 등록자
            ,[FCPT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [FCLT_PK] AS NO
              ,[FCLT_NAME] AS 설비명
            FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
          ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
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
          NO AS NO, 거래처NO AS 거래처NO, 설비NO AS 설비NO, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명, 차종 AS 차종,
          규격 AS 규격, 단위 AS 단위, 안전재고 AS 안전재고, 단가 AS 단가, 비고 AS 비고,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FCPT_PK] AS NO
            ,[FCPT_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[FCPT_FACILITY_PK] AS 설비NO
            ,FACILITY.설비명 AS 설비명
            ,[FCPT_DIV] AS 구분
            ,[FCPT_PRODUCT_NUM] AS 품번
            ,[FCPT_NAME] AS 품명
            ,[FCPT_CAR] AS 차종
            ,[FCPT_SIZE] AS 규격
            ,[FCPT_UNIT] AS 단위
            ,[FCPT_SAFE] AS 안전재고
            ,[FCPT_COST] AS 단가
            ,[FCPT_NOTE] AS 비고
            ,[FCPT_REGIST_NM] AS 등록자
            ,[FCPT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [FCLT_PK] AS NO
              ,[FCLT_NAME] AS 설비명
            FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
          ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
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
