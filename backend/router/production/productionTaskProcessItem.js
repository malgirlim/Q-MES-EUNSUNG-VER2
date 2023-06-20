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
    .input("menu", "생산관리_작업지시공정자재") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [ISPCI_PK] AS NO
        ,[ISPCI_DIV] AS 구분
        ,[ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
        ,[ISPCI_ITEM_PK] AS 품목NO
        ,[ISPCI_LOTCODE] AS LOT코드
        ,ITEM.구분 AS 품목구분
        ,ITEM.품번 AS 품번
        ,ITEM.품명 AS 품명
        ,ITEM.규격 AS 규격
        ,ITEM.단위 AS 단위
        ,[ISPCI_AMOUNT] AS 수량
        ,CONVERT(varchar, [ISPCI_DT], 20) AS 일시
        ,[ISPCI_NOTE] AS 비고
        ,[ISPCI_REGIST_NM] AS 등록자
        ,[ISPCI_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
      LEFT JOIN
      (
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
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        LEFT JOIN
        (
          SELECT
            [CLNT_PK] AS NO
            ,[CLNT_NAME] AS 거래처명
          FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
        ) AS CLIENT ON CLIENT.NO = [ITEM_CLIENT_PK]
      ) AS ITEM ON ITEM.NO = [ISPCI_ITEM_PK]
      ORDER BY [ISPCI_PK] DESC
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
          NO AS NO, 구분 AS 구분, 작업지시공정NO AS 작업지시공정NO, 품목NO AS 품목NO, LOT코드 AS LOT코드,
          품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 수량 AS 수량, 일시 AS 일시,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ISPCI_PK] AS NO
            ,[ISPCI_DIV] AS 구분
            ,[ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
            ,[ISPCI_ITEM_PK] AS 품목NO
            ,[ISPCI_LOTCODE] AS LOT코드
            ,ITEM.구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,[ISPCI_AMOUNT] AS 수량
            ,CONVERT(varchar, [ISPCI_DT], 20) AS 일시
            ,[ISPCI_NOTE] AS 비고
            ,[ISPCI_REGIST_NM] AS 등록자
            ,[ISPCI_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
          LEFT JOIN
          (
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
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
            LEFT JOIN
            (
              SELECT
                [CLNT_PK] AS NO
                ,[CLNT_NAME] AS 거래처명
              FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
            ) AS CLIENT ON CLIENT.NO = [ITEM_CLIENT_PK]
          ) AS ITEM ON ITEM.NO = [ISPCI_ITEM_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 구분 like concat('%',@input,'%')
        OR LOT코드 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 수량 like concat('%',@input,'%')
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
          NO AS NO, 구분 AS 구분, 작업지시공정NO AS 작업지시공정NO, 품목NO AS 품목NO, LOT코드 AS LOT코드,
          품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 수량 AS 수량, 일시 AS 일시,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [ISPCI_PK] AS NO
            ,[ISPCI_DIV] AS 구분
            ,[ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
            ,[ISPCI_ITEM_PK] AS 품목NO
            ,[ISPCI_LOTCODE] AS LOT코드
            ,ITEM.구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,[ISPCI_AMOUNT] AS 수량
            ,CONVERT(varchar, [ISPCI_DT], 20) AS 일시
            ,[ISPCI_NOTE] AS 비고
            ,[ISPCI_REGIST_NM] AS 등록자
            ,[ISPCI_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
          LEFT JOIN
          (
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
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
            LEFT JOIN
            (
              SELECT
                [CLNT_PK] AS NO
                ,[CLNT_NAME] AS 거래처명
              FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
            ) AS CLIENT ON CLIENT.NO = [ITEM_CLIENT_PK]
          ) AS ITEM ON ITEM.NO = [ISPCI_ITEM_PK]
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
      .input("작업지시공정NO", req.body.data.작업지시공정NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("LOT코드", req.body.data.LOT코드 ?? "")
      .input("수량", req.body.data.수량 ?? "")
      .input(
        "일시",
        moment(req.body.data.일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
          ([ISPCI_DIV]
          ,[ISPCI_INSTRUCT_PROCESS_PK]
          ,[ISPCI_ITEM_PK]
          ,[ISPCI_LOTCODE]
          ,[ISPCI_AMOUNT]
          ,[ISPCI_DT]
          ,[ISPCI_NOTE]
          ,[ISPCI_REGIST_NM]
          ,[ISPCI_REGIST_DT])
        VALUES
          ('작업지시자재불출',@작업지시공정NO,@품목NO,@LOT코드,@수량,@일시,@비고,@등록자,@등록일시)
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
        .input("작업지시공정NO", req.body.data[i].작업지시공정NO ?? null)
        .input("품목NO", req.body.data[i].품목NO ?? null)
        .input("LOT코드", req.body.data[i].LOT코드 ?? "")
        .input("수량", req.body.data[i].수량 ?? "")
        .input(
          "일시",
          moment(req.body.data[i].일시).format("YYYY-MM-DD HH:mm:ss") ??
            moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        )
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
          ([ISPCI_DIV]
          ,[ISPCI_INSTRUCT_PROCESS_PK]
          ,[ISPCI_ITEM_PK]
          ,[ISPCI_LOTCODE]
          ,[ISPCI_AMOUNT]
          ,[ISPCI_DT]
          ,[ISPCI_NOTE]
          ,[ISPCI_REGIST_NM]
          ,[ISPCI_REGIST_DT])
        VALUES
          ('작업지시자재불출',@작업지시공정NO,@품목NO,@LOT코드,@수량,@일시,@비고,@등록자,@등록일시)
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
      .input("작업지시공정NO", req.body.data.작업지시공정NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("LOT코드", req.body.data.LOT코드 ?? "")
      .input("수량", req.body.data.수량 ?? "")
      .input(
        "일시",
        moment(req.body.data.일시).format("YYYY-MM-DD HH:mm:ss") ?? ""
      )
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
          SET
          [ISPCI_DIV] = @구분
          ,[ISPCI_INSTRUCT_PROCESS_PK] = @작업지시공정NO
          ,[ISPCI_ITEM_PK] = @품목NO
          ,[ISPCI_LOTCODE] = @LOT코드
          ,[ISPCI_AMOUNT] = @수량
          ,[ISPCI_DT] = @일시
          ,[ISPCI_NOTE] = @비고
          ,[ISPCI_REGIST_NM] = @등록자
          ,[ISPCI_REGIST_DT] = @등록일시
        WHERE [ISPCI_PK] = @NO
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
          [ISPCI_PK] AS NO
          ,[ISPCI_DIV] AS 구분
          ,[ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
          ,[ISPCI_ITEM_PK] AS 품목NO
          ,[ISPCI_LOTCODE] AS LOT코드
          ,ITEM.구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,ITEM.규격 AS 규격
          ,ITEM.단위 AS 단위
          ,[ISPCI_AMOUNT] AS 수량
          ,[ISPCI_DT] AS 일시
          ,[ISPCI_NOTE] AS 비고
          ,[ISPCI_REGIST_NM] AS 등록자
          ,[ISPCI_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
        LEFT JOIN
        (
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
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [ITEM_CLIENT_PK]
        ) AS ITEM ON ITEM.NO = [ISPCI_ITEM_PK]
        WHERE [ISPCI_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB] WHERE [ISPCI_PK] = @key`
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
