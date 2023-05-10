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
    .input("menu", "기준정보_BOM관리") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [BOM_PK] AS NO
        ,[BOM_ITEM_PK] AS 품목NO
        ,[BOM_METERIAL_PK] AS 투입자재NO
        ,METERIAL.구분 AS 투입자재구분
        ,METERIAL.품번 AS 투입자재품번
        ,METERIAL.품명 AS 투입자재품명
        ,METERIAL.규격 AS 투입자재규격
        ,METERIAL.단위 AS 투입자재단위
        ,[BOM_METERIAL_AMT] AS 투입량
        ,[BOM_NOTE] AS 비고
        ,[BOM_REGIST_NM] AS 등록자
        ,[BOM_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_BOM_TB]
      LEFT JOIN
      (
        SELECT
          [ITEM_PK] AS NO
          ,[ITEM_DIV] AS 구분
          ,[ITEM_PRODUCT_NUM] AS 품번
          ,[ITEM_NAME] AS 품명
          ,[ITEM_SIZE] AS 규격
          ,[ITEM_UNIT] AS 단위
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
      ) AS METERIAL ON METERIAL.NO = [BOM_METERIAL_PK]
      ORDER BY [BOM_PK] DESC
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
    sql =
      `
        SELECT
          NO AS NO, 품목NO AS 품목NO, 투입자재NO AS 투입자재NO, 투입자재구분 AS 투입자재구분, 투입자재품번 AS 투입자재품번,
          투입자재품명 AS 투입자재품명, 투입자재규격 AS 투입자재규격, 투입자재단위 AS 투입자재단위, 투입량 AS 투입량,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [BOM_PK] AS NO
            ,[BOM_ITEM_PK] AS 품목NO
            ,[BOM_METERIAL_PK] AS 투입자재NO
            ,METERIAL.구분 AS 투입자재구분
            ,METERIAL.품번 AS 투입자재품번
            ,METERIAL.품명 AS 투입자재품명
            ,METERIAL.규격 AS 투입자재규격
            ,METERIAL.단위 AS 투입자재단위
            ,[BOM_METERIAL_AMT] AS 투입량
            ,[BOM_NOTE] AS 비고
            ,[BOM_REGIST_NM] AS 등록자
            ,[BOM_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_BOM_TB]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS METERIAL ON METERIAL.NO = [BOM_METERIAL_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ` +
      req.body.searchKey +
      ` like concat('%',@input,'%')
        ORDER BY NO DESC
      `;

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
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("투입자재NO", req.body.data.투입자재NO ?? null)
      .input("투입량", req.body.data.투입량 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_BOM_TB]
          ([BOM_ITEM_PK]
          ,[BOM_METERIAL_PK]
          ,[BOM_METERIAL_AMT]
          ,[BOM_NOTE]
          ,[BOM_REGIST_NM]
          ,[BOM_REGIST_DT])
        VALUES
          (@품목NO,@투입자재NO,@투입량,@비고,@등록자,@등록일시)
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
        .input("품목NO", req.body.data[i].품목NO ?? null)
        .input("투입자재NO", req.body.data[i].투입자재NO ?? null)
        .input("투입량", req.body.data[i].투입량 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body[i].user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_BOM_TB]
          ([BOM_ITEM_PK]
          ,[BOM_METERIAL_PK]
          ,[BOM_METERIAL_AMT]
          ,[BOM_NOTE]
          ,[BOM_REGIST_NM]
          ,[BOM_REGIST_DT])
        VALUES
          (@품목NO,@투입자재NO,@투입량,@비고,@등록자,@등록일시)
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
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("투입자재NO", req.body.data.투입자재NO ?? null)
      .input("투입량", req.body.data.투입량 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MASTER_BOM_TB]
          SET 
            [BOM_ITEM_PK] = @품목NO
            ,[BOM_METERIAL_PK] = @투입자재NO
            ,[BOM_METERIAL_AMT] = @투입량
            ,[BOM_NOTE] = @비고
            ,[BOM_REGIST_NM] = @등록자
            ,[BOM_REGIST_DT] = @등록일시
          WHERE [BOM_PK] = @NO
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
          [BOM_PK] AS NO
          ,[BOM_ITEM_PK] AS 품목NO
          ,ITEM.구분 AS 품목구분
          ,ITEM.품번 AS 품목품번
          ,ITEM.품명 AS 품목품명
          ,[BOM_METERIAL_PK] AS 투입자재NO
          ,METERIAL.구분 AS 투입자재구분
          ,METERIAL.품번 AS 투입자재품번
          ,METERIAL.품명 AS 투입자재품명
          ,[BOM_METERIAL_AMT] AS 투입량
          ,[BOM_NOTE] AS 비고
          ,[BOM_REGIST_NM] AS 등록자
          ,[BOM_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MASTER_BOM_TB]
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = [BOM_ITEM_PK]
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS METERIAL ON METERIAL.NO = [BOM_METERIAL_PK]
        WHERE [BOM_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MASTER_BOM_TB] WHERE [BOM_PK] = @key`
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
