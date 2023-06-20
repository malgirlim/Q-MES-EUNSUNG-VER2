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
    .input("menu", "재고관리_설비부품입고") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [FPRC_PK] AS NO
        ,[FPRC_PART_ORDER_PK] AS 설비부품발주NO
        ,[FPRC_DIV] AS 구분
        ,[FPRC_CODE] AS LOT코드
        ,[FPRC_FACILITY_PART_PK] AS 설비부품NO
        ,FACILITY_PART.설비명 AS 설비명
        ,FACILITY_PART.구분 AS 부품구분
        ,FACILITY_PART.품번 AS 품번
        ,FACILITY_PART.품명 AS 품명
        ,FACILITY_PART.규격 AS 규격
        ,FACILITY_PART.단위 AS 단위
        ,[FPRC_AMOUNT] AS 입고수
        ,CONVERT(VARCHAR, [FPRC_DT], 20) AS 입고일시
        ,CONVERT(VARCHAR, [FPRC_EXPIRE_DATE], 23) AS 유효일자
        ,[FPRC_NOTE] AS 비고
        ,[FPRC_REGIST_NM] AS 등록자
        ,[FPRC_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
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
      ) AS FACILITY_PART ON FACILITY_PART.NO = [FPRC_FACILITY_PART_PK]
      ORDER BY [FPRC_PK] DESC
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
          NO AS NO, 설비부품발주NO AS 설비부품발주NO, 구분 AS 구분, LOT코드 AS LOT코드, 설비부품NO AS 설비부품NO,
          설비명 AS 설비명, 부품구분 AS 부품구분, 품번 AS 품번, 품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 입고수 AS 입고수,
          입고일시 AS 입고일시, 유효일자 AS 유효일자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FPRC_PK] AS NO
            ,[FPRC_PART_ORDER_PK] AS 설비부품발주NO
            ,[FPRC_DIV] AS 구분
            ,[FPRC_CODE] AS LOT코드
            ,[FPRC_FACILITY_PART_PK] AS 설비부품NO
            ,FACILITY_PART.설비명 AS 설비명
            ,FACILITY_PART.구분 AS 부품구분
            ,FACILITY_PART.품번 AS 품번
            ,FACILITY_PART.품명 AS 품명
            ,FACILITY_PART.규격 AS 규격
            ,FACILITY_PART.단위 AS 단위
            ,[FPRC_AMOUNT] AS 입고수
            ,CONVERT(VARCHAR, [FPRC_DT], 20) AS 입고일시
            ,CONVERT(VARCHAR, [FPRC_EXPIRE_DATE], 23) AS 유효일자
            ,[FPRC_NOTE] AS 비고
            ,[FPRC_REGIST_NM] AS 등록자
            ,[FPRC_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
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
          ) AS FACILITY_PART ON FACILITY_PART.NO = [FPRC_FACILITY_PART_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 입고일시), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 입고일시), 12) <= ` +
        req.body.endDate +
        `
        AND ( 구분 like concat('%',@input,'%')
        OR LOT코드 like concat('%',@input,'%')
        OR 설비명 like concat('%',@input,'%')
        OR 부품구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 입고수 like concat('%',@input,'%')
        OR 입고일시 like concat('%',@input,'%')
        OR 유효일자 like concat('%',@input,'%')
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
          NO AS NO, 설비부품발주NO AS 설비부품발주NO, 구분 AS 구분, LOT코드 AS LOT코드, 설비부품NO AS 설비부품NO,
          설비명 AS 설비명, 부품구분 AS 부품구분, 품번 AS 품번, 품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 입고수 AS 입고수,
          입고일시 AS 입고일시, 유효일자 AS 유효일자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FPRC_PK] AS NO
            ,[FPRC_PART_ORDER_PK] AS 설비부품발주NO
            ,[FPRC_DIV] AS 구분
            ,[FPRC_CODE] AS LOT코드
            ,[FPRC_FACILITY_PART_PK] AS 설비부품NO
            ,FACILITY_PART.설비명 AS 설비명
            ,FACILITY_PART.구분 AS 부품구분
            ,FACILITY_PART.품번 AS 품번
            ,FACILITY_PART.품명 AS 품명
            ,FACILITY_PART.규격 AS 규격
            ,FACILITY_PART.단위 AS 단위
            ,[FPRC_AMOUNT] AS 입고수
            ,CONVERT(VARCHAR, [FPRC_DT], 20) AS 입고일시
            ,CONVERT(VARCHAR, [FPRC_EXPIRE_DATE], 23) AS 유효일자
            ,[FPRC_NOTE] AS 비고
            ,[FPRC_REGIST_NM] AS 등록자
            ,[FPRC_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
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
          ) AS FACILITY_PART ON FACILITY_PART.NO = [FPRC_FACILITY_PART_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 입고일시), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 입고일시), 12) <= ` +
        req.body.endDate +
        `
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
      .input("설비부품발주NO", req.body.data.설비부품발주NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("LOT코드", req.body.data.LOT코드 ?? "")
      .input("설비부품NO", req.body.data.설비부품NO ?? null)
      .input("입고수", req.body.data.입고수 ?? "")
      .input(
        "입고일시",
        moment(req.body.data.입고일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("유효일자", req.body.data.유효일자 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
          ([FPRC_PART_ORDER_PK]
          ,[FPRC_DIV]
          ,[FPRC_CODE]
          ,[FPRC_FACILITY_PART_PK]
          ,[FPRC_AMOUNT]
          ,[FPRC_DT]
          ,[FPRC_EXPIRE_DATE]
          ,[FPRC_NOTE]
          ,[FPRC_REGIST_NM]
          ,[FPRC_REGIST_DT])
            VALUES
          (@설비부품발주NO,'직접 입고',@LOT코드,@설비부품NO,@입고수,@입고일시,@유효일자,@비고,@등록자,@등록일시)
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
        .input("설비부품발주NO", req.body.data[i].설비부품발주NO ?? null)
        .input("구분", req.body.data[i].구분 ?? "")
        .input("LOT코드", req.body.data[i].LOT코드 ?? "")
        .input("설비부품NO", req.body.data[i].설비부품NO ?? null)
        .input("입고수", req.body.data[i].입고수 ?? "")
        .input(
          "입고일시",
          moment(req.body.data[i].입고일시).format("YYYY-MM-DD HH:mm:ss") ??
            moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        )
        .input("유효일자", req.body.data[i].유효일자 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
          ([FPRC_PART_ORDER_PK]
          ,[FPRC_DIV]
          ,[FPRC_CODE]
          ,[FPRC_FACILITY_PART_PK]
          ,[FPRC_AMOUNT]
          ,[FPRC_DT]
          ,[FPRC_EXPIRE_DATE]
          ,[FPRC_NOTE]
          ,[FPRC_REGIST_NM]
          ,[FPRC_REGIST_DT])
            VALUES
          (@설비부품발주NO,'직접 입고',@LOT코드,@설비부품NO,@입고수,@입고일시,@유효일자,@비고,@등록자,@등록일시)
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
      .input("설비부품발주NO", req.body.data.설비부품발주NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("LOT코드", req.body.data.LOT코드 ?? "")
      .input("설비부품NO", req.body.data.설비부품NO ?? null)
      .input("입고수", req.body.data.입고수 ?? "")
      .input(
        "입고일시",
        moment(req.body.data.입고일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("유효일자", req.body.data.유효일자 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
          SET
            [FPRC_PART_ORDER_PK] = @설비부품발주NO
            ,[FPRC_DIV] = @구분
            ,[FPRC_CODE] = @LOT코드
            ,[FPRC_FACILITY_PART_PK] = @설비부품NO
            ,[FPRC_AMOUNT] = @입고수
            ,[FPRC_DT] = @입고일시
            ,[FPRC_EXPIRE_DATE] = @유효일자
            ,[FPRC_NOTE] = @비고
            ,[FPRC_REGIST_NM] = @등록자
            ,[FPRC_REGIST_DT] = @등록일시
        WHERE [FPRC_PK] = @NO
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
          [FPRC_PK] AS NO
          ,[FPRC_PART_ORDER_PK] AS 설비부품발주NO
          ,[FPRC_DIV] AS 구분
          ,[FPRC_CODE] AS LOT코드
          ,[FPRC_FACILITY_PART_PK] AS 설비부품NO
          ,FACILITY_PART.설비명 AS 설비명
          ,FACILITY_PART.구분 AS 부품구분
          ,FACILITY_PART.품번 AS 품번
          ,FACILITY_PART.품명 AS 품명
          ,FACILITY_PART.규격 AS 규격
          ,FACILITY_PART.단위 AS 단위
          ,[FPRC_AMOUNT] AS 입고수
          ,CONVERT(VARCHAR, [FPRC_DT], 20) AS 입고일시
          ,CONVERT(VARCHAR, [FPRC_EXPIRE_DATE], 23) AS 유효일자
          ,[FPRC_NOTE] AS 비고
          ,[FPRC_REGIST_NM] AS 등록자
          ,[FPRC_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
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
        ) AS FACILITY_PART ON FACILITY_PART.NO = [FPRC_FACILITY_PART_PK]
        WHERE [FPRC_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB] WHERE [FPRC_PK] = @key`
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
