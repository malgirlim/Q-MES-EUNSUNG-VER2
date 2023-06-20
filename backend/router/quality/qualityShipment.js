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
    .input("menu", "품질관리_출하검사") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [DLISP_PK] AS NO
        ,[DLISP_DELIVERY_PK] AS 납품NO
        ,DELIVERY.LOT코드 AS LOT코드
        ,DELIVERY.품목NO AS 품목NO
        ,DELIVERY.품목구분 AS 품목구분
        ,DELIVERY.품명 AS 품명
        ,DELIVERY.규격 AS 규격
        ,DELIVERY.단위 AS 단위
        ,[DLISP_DIV] AS 구분
        ,CONVERT(VARCHAR, [DLISP_REQUEST_DT], 20) AS 요청일시
        ,[DLISP_SAMPLE_AMT] AS 샘플수량
        ,[DLISP_AMOUNT] AS 요청수량
        ,[DLISP_RESULT] AS 결과
        ,[DLISP_CONTENT1] AS 내용1
        ,[DLISP_CONTENT2] AS 내용2
        ,[DLISP_CONTENT3] AS 내용3
        ,[DLISP_CONTENT4] AS 내용4
        ,[DLISP_CONTENT5] AS 내용5
        ,[DLISP_CONTENT6] AS 내용6
        ,[DLISP_CONTENT7] AS 내용7
        ,[DLISP_CONTENT8] AS 내용8
        ,[DLISP_CONTENT9] AS 내용9
        ,[DLISP_CONTENT10] AS 내용10
        ,[DLISP_NOTE] AS 비고
        ,[DLISP_REGIST_NM] AS 등록자
        ,[DLISP_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_DELIVERY_INSPECT_TB]
      LEFT JOIN
      (
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
          ,CONVERT(VARCHAR, [DLVR_DT], 20) AS 일시
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
      ) AS DELIVERY ON DELIVERY.NO = [DLISP_DELIVERY_PK]
      ORDER BY [DLISP_PK] DESC
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
          NO AS NO, 납품NO AS 납품NO, LOT코드 AS LOT코드, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품명 AS 품명, 규격 AS 규격,
          단위 AS 단위, 구분 AS 구분, 요청일시 AS 요청일시, 샘플수량 AS 샘플수량, 요청수량 AS 요청수량, 결과 AS 결과,
          내용1 AS 내용1, 내용2 AS 내용2, 내용3 AS 내용3, 내용4 AS 내용4, 내용5 AS 내용5, 내용6 AS 내용6, 내용7 AS 내용7,
          내용8 AS 내용8, 내용9 AS 내용9, 내용10 AS 내용10, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [DLISP_PK] AS NO
            ,[DLISP_DELIVERY_PK] AS 납품NO
            ,DELIVERY.LOT코드 AS LOT코드
            ,DELIVERY.품목NO AS 품목NO
            ,DELIVERY.품목구분 AS 품목구분
            ,DELIVERY.품명 AS 품명
            ,DELIVERY.규격 AS 규격
            ,DELIVERY.단위 AS 단위
            ,[DLISP_DIV] AS 구분
            ,CONVERT(VARCHAR, [DLISP_REQUEST_DT], 20) AS 요청일시
            ,[DLISP_SAMPLE_AMT] AS 샘플수량
            ,[DLISP_AMOUNT] AS 요청수량
            ,[DLISP_RESULT] AS 결과
            ,[DLISP_CONTENT1] AS 내용1
            ,[DLISP_CONTENT2] AS 내용2
            ,[DLISP_CONTENT3] AS 내용3
            ,[DLISP_CONTENT4] AS 내용4
            ,[DLISP_CONTENT5] AS 내용5
            ,[DLISP_CONTENT6] AS 내용6
            ,[DLISP_CONTENT7] AS 내용7
            ,[DLISP_CONTENT8] AS 내용8
            ,[DLISP_CONTENT9] AS 내용9
            ,[DLISP_CONTENT10] AS 내용10
            ,[DLISP_NOTE] AS 비고
            ,[DLISP_REGIST_NM] AS 등록자
            ,[DLISP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_DELIVERY_INSPECT_TB]
          LEFT JOIN
          (
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
              ,CONVERT(VARCHAR, [DLVR_DT], 20) AS 일시
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
          ) AS DELIVERY ON DELIVERY.NO = [DLISP_DELIVERY_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 요청일시), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 요청일시), 12) <= ` +
        req.body.endDate +
        `
        AND ( LOT코드 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 요청일시 like concat('%',@input,'%')
        OR 요청수량 like concat('%',@input,'%')
        OR 샘플수량 like concat('%',@input,'%')
        OR 결과 like concat('%',@input,'%')
        OR 내용1 like concat('%',@input,'%')
        OR 내용2 like concat('%',@input,'%')
        OR 내용3 like concat('%',@input,'%')
        OR 내용4 like concat('%',@input,'%')
        OR 내용5 like concat('%',@input,'%')
        OR 내용6 like concat('%',@input,'%')
        OR 내용7 like concat('%',@input,'%')
        OR 내용8 like concat('%',@input,'%')
        OR 내용9 like concat('%',@input,'%')
        OR 내용10 like concat('%',@input,'%')
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
          NO AS NO, 납품NO AS 납품NO, LOT코드 AS LOT코드, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품명 AS 품명, 규격 AS 규격,
          단위 AS 단위, 구분 AS 구분, 요청일시 AS 요청일시, 샘플수량 AS 샘플수량, 요청수량 AS 요청수량, 결과 AS 결과,
          내용1 AS 내용1, 내용2 AS 내용2, 내용3 AS 내용3, 내용4 AS 내용4, 내용5 AS 내용5, 내용6 AS 내용6, 내용7 AS 내용7,
          내용8 AS 내용8, 내용9 AS 내용9, 내용10 AS 내용10, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [DLISP_PK] AS NO
            ,[DLISP_DELIVERY_PK] AS 납품NO
            ,DELIVERY.LOT코드 AS LOT코드
            ,DELIVERY.품목NO AS 품목NO
            ,DELIVERY.품목구분 AS 품목구분
            ,DELIVERY.품명 AS 품명
            ,DELIVERY.규격 AS 규격
            ,DELIVERY.단위 AS 단위
            ,[DLISP_DIV] AS 구분
            ,CONVERT(VARCHAR, [DLISP_REQUEST_DT], 20) AS 요청일시
            ,[DLISP_SAMPLE_AMT] AS 샘플수량
            ,[DLISP_AMOUNT] AS 요청수량
            ,[DLISP_RESULT] AS 결과
            ,[DLISP_CONTENT1] AS 내용1
            ,[DLISP_CONTENT2] AS 내용2
            ,[DLISP_CONTENT3] AS 내용3
            ,[DLISP_CONTENT4] AS 내용4
            ,[DLISP_CONTENT5] AS 내용5
            ,[DLISP_CONTENT6] AS 내용6
            ,[DLISP_CONTENT7] AS 내용7
            ,[DLISP_CONTENT8] AS 내용8
            ,[DLISP_CONTENT9] AS 내용9
            ,[DLISP_CONTENT10] AS 내용10
            ,[DLISP_NOTE] AS 비고
            ,[DLISP_REGIST_NM] AS 등록자
            ,[DLISP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_DELIVERY_INSPECT_TB]
          LEFT JOIN
          (
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
              ,CONVERT(VARCHAR, [DLVR_DT], 20) AS 일시
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
          ) AS DELIVERY ON DELIVERY.NO = [DLISP_DELIVERY_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 요청일시), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 요청일시), 12) <= ` +
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
      .input("납품NO", req.body.data.납품NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input(
        "요청일시",
        moment(req.body.data.요청일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("요청수량", req.body.data.요청수량 ?? "")
      .input("샘플수량", req.body.data.샘플수량 ?? "")
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
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_DELIVERY_INSPECT_TB]
          ([DLISP_DELIVERY_PK]
          ,[DLISP_DIV]
          ,[DLISP_REQUEST_DT]
          ,[DLISP_SAMPLE_AMT]
          ,[DLISP_AMOUNT]
          ,[DLISP_RESULT]
          ,[DLISP_CONTENT1]
          ,[DLISP_CONTENT2]
          ,[DLISP_CONTENT3]
          ,[DLISP_CONTENT4]
          ,[DLISP_CONTENT5]
          ,[DLISP_CONTENT6]
          ,[DLISP_CONTENT7]
          ,[DLISP_CONTENT8]
          ,[DLISP_CONTENT9]
          ,[DLISP_CONTENT10]
          ,[DLISP_NOTE]
          ,[DLISP_REGIST_NM]
          ,[DLISP_REGIST_DT])
        VALUES
          (@납품NO,@구분,@요청일시,@샘플수량,@요청수량,@결과,@내용1,@내용2,@내용3,@내용4,@내용5,
            @내용6,@내용7,@내용8,@내용9,@내용10,@비고,@등록자,@등록일시)
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
        .input("납품NO", req.body.data[i].납품NO ?? null)
        .input("구분", req.body.data[i].구분 ?? "")
        .input(
          "요청일시",
          moment(req.body.data[i].요청일시).format("YYYY-MM-DD HH:mm:ss") ??
            moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        )
        .input("요청수량", req.body.data[i].요청수량 ?? "")
        .input("샘플수량", req.body.data[i].샘플수량 ?? "")
        .input("결과", req.body.data[i].결과 ?? "")
        .input("내용1", req.body.data[i].내용1 ?? "")
        .input("내용2", req.body.data[i].내용2 ?? "")
        .input("내용3", req.body.data[i].내용3 ?? "")
        .input("내용4", req.body.data[i].내용4 ?? "")
        .input("내용5", req.body.data[i].내용5 ?? "")
        .input("내용6", req.body.data[i].내용6 ?? "")
        .input("내용7", req.body.data[i].내용7 ?? "")
        .input("내용8", req.body.data[i].내용8 ?? "")
        .input("내용9", req.body.data[i].내용9 ?? "")
        .input("내용10", req.body.data[i].내용10 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_DELIVERY_INSPECT_TB]
          ([DLISP_DELIVERY_PK]
          ,[DLISP_DIV]
          ,[DLISP_REQUEST_DT]
          ,[DLISP_SAMPLE_AMT]
          ,[DLISP_AMOUNT]
          ,[DLISP_RESULT]
          ,[DLISP_CONTENT1]
          ,[DLISP_CONTENT2]
          ,[DLISP_CONTENT3]
          ,[DLISP_CONTENT4]
          ,[DLISP_CONTENT5]
          ,[DLISP_CONTENT6]
          ,[DLISP_CONTENT7]
          ,[DLISP_CONTENT8]
          ,[DLISP_CONTENT9]
          ,[DLISP_CONTENT10]
          ,[DLISP_NOTE]
          ,[DLISP_REGIST_NM]
          ,[DLISP_REGIST_DT])
        VALUES
          (@납품NO,@구분,@요청일시,@샘플수량,@요청수량,@결과,@내용1,@내용2,@내용3,@내용4,@내용5,
            @내용6,@내용7,@내용8,@내용9,@내용10,@비고,@등록자,@등록일시)
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
      .input("납품NO", req.body.data.납품NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input(
        "요청일시",
        moment(req.body.data.요청일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("요청수량", req.body.data.요청수량 ?? "")
      .input("샘플수량", req.body.data.샘플수량 ?? "")
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
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_DELIVERY_INSPECT_TB]
        SET 
          [DLISP_DELIVERY_PK] = @납품NO
          ,[DLISP_DIV] = @구분
          ,[DLISP_REQUEST_DT] = @요청일시
          ,[DLISP_SAMPLE_AMT] = @샘플수량
          ,[DLISP_AMOUNT] = @요청수량
          ,[DLISP_RESULT] = @결과
          ,[DLISP_CONTENT1] = @내용1
          ,[DLISP_CONTENT2] = @내용2
          ,[DLISP_CONTENT3] = @내용3
          ,[DLISP_CONTENT4] = @내용4
          ,[DLISP_CONTENT5] = @내용5
          ,[DLISP_CONTENT6] = @내용6
          ,[DLISP_CONTENT7] = @내용7
          ,[DLISP_CONTENT8] = @내용8
          ,[DLISP_CONTENT9] = @내용9
          ,[DLISP_CONTENT10] = @내용10
          ,[DLISP_NOTE] = @비고
          ,[DLISP_REGIST_NM] = @등록자
          ,[DLISP_REGIST_DT] = @등록일시
        WHERE [DLISP_PK] = @NO
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
          [DLISP_PK] AS NO
          ,[DLISP_DELIVERY_PK] AS 납품NO
          ,DELIVERY.LOT코드 AS LOT코드
          ,DELIVERY.품목NO AS 품목NO
          ,DELIVERY.품목구분 AS 품목구분
          ,DELIVERY.품명 AS 품명
          ,DELIVERY.규격 AS 규격
          ,DELIVERY.단위 AS 단위
          ,[DLISP_DIV] AS 구분
          ,CONVERT(VARCHAR, [DLISP_REQUEST_DT], 20) AS 요청일시
          ,[DLISP_SAMPLE_AMT] AS 샘플수량
          ,[DLISP_AMOUNT] AS 요청수량
          ,[DLISP_RESULT] AS 결과
          ,[DLISP_CONTENT1] AS 내용1
          ,[DLISP_CONTENT2] AS 내용2
          ,[DLISP_CONTENT3] AS 내용3
          ,[DLISP_CONTENT4] AS 내용4
          ,[DLISP_CONTENT5] AS 내용5
          ,[DLISP_CONTENT6] AS 내용6
          ,[DLISP_CONTENT7] AS 내용7
          ,[DLISP_CONTENT8] AS 내용8
          ,[DLISP_CONTENT9] AS 내용9
          ,[DLISP_CONTENT10] AS 내용10
          ,[DLISP_NOTE] AS 비고
          ,[DLISP_REGIST_NM] AS 등록자
          ,[DLISP_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_DELIVERY_INSPECT_TB]
        LEFT JOIN
        (
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
            ,CONVERT(VARCHAR, [DLVR_DT], 20) AS 일시
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
        ) AS DELIVERY ON DELIVERY.NO = [DLISP_DELIVERY_PK]
        WHERE [DLISP_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_DELIVERY_INSPECT_TB] WHERE [DLISP_PK] = @key`
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

// 품질기준 데이터
router.get("/qualitystand", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [QAST_PK] AS NO
        ,[QAST_ITEM_PK] AS 품목NO
        ,ITEM.품목구분 AS 품목구분
        ,ITEM.품번 AS 품번
        ,ITEM.품명 AS 품명
        ,[QAST_IMAGE] AS 이미지
        ,[QAST_DIV] AS 구분
        ,[QAST_STAND1] AS 기준1
        ,[QAST_STAND2] AS 기준2
        ,[QAST_STAND3] AS 기준3
        ,[QAST_STAND4] AS 기준4
        ,[QAST_STAND5] AS 기준5
        ,[QAST_STAND6] AS 기준6
        ,[QAST_STAND7] AS 기준7
        ,[QAST_STAND8] AS 기준8
        ,[QAST_STAND9] AS 기준9
        ,[QAST_STAND10] AS 기준10
        ,[QAST_NOTE] AS 비고
        ,[QAST_REGIST_NM] AS 등록자
        ,[QAST_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
      LEFT JOIN
      (
        SELECT
          [ITEM_PK] AS NO
          ,[ITEM_DIV] AS 품목구분
          ,[ITEM_PRODUCT_NUM] AS 품번
          ,[ITEM_NAME] AS 품명
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
      ) AS ITEM ON ITEM.NO = [QAST_ITEM_PK]
      ORDER BY [QAST_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/qualitystand", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 이미지 AS 이미지, 구분 AS 구분,
          기준1 AS 기준1, 기준2 AS 기준2, 기준3 AS 기준3, 기준4 AS 기준4, 기준5 AS 기준5, 기준6 AS 기준6, 기준7 AS 기준7,
          기준8 AS 기준8, 기준9 AS 기준9, 기준10 AS 기준10, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [QAST_PK] AS NO
            ,[QAST_ITEM_PK] AS 품목NO
            ,ITEM.구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,[QAST_IMAGE] AS 이미지
            ,[QAST_DIV] AS 구분
            ,[QAST_STAND1] AS 기준1
            ,[QAST_STAND2] AS 기준2
            ,[QAST_STAND3] AS 기준3
            ,[QAST_STAND4] AS 기준4
            ,[QAST_STAND5] AS 기준5
            ,[QAST_STAND6] AS 기준6
            ,[QAST_STAND7] AS 기준7
            ,[QAST_STAND8] AS 기준8
            ,[QAST_STAND9] AS 기준9
            ,[QAST_STAND10] AS 기준10
            ,[QAST_NOTE] AS 비고
            ,[QAST_REGIST_NM] AS 등록자
            ,[QAST_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = [QAST_ITEM_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 기준1 like concat('%',@input,'%')
        OR 기준2 like concat('%',@input,'%')
        OR 기준3 like concat('%',@input,'%')
        OR 기준4 like concat('%',@input,'%')
        OR 기준5 like concat('%',@input,'%')
        OR 기준6 like concat('%',@input,'%')
        OR 기준7 like concat('%',@input,'%')
        OR 기준8 like concat('%',@input,'%')
        OR 기준9 like concat('%',@input,'%')
        OR 기준10 like concat('%',@input,'%')
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
          NO AS NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 이미지 AS 이미지, 구분 AS 구분,
          기준1 AS 기준1, 기준2 AS 기준2, 기준3 AS 기준3, 기준4 AS 기준4, 기준5 AS 기준5, 기준6 AS 기준6, 기준7 AS 기준7,
          기준8 AS 기준8, 기준9 AS 기준9, 기준10 AS 기준10, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [QAST_PK] AS NO
            ,[QAST_ITEM_PK] AS 품목NO
            ,ITEM.구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,[QAST_IMAGE] AS 이미지
            ,[QAST_DIV] AS 구분
            ,[QAST_STAND1] AS 기준1
            ,[QAST_STAND2] AS 기준2
            ,[QAST_STAND3] AS 기준3
            ,[QAST_STAND4] AS 기준4
            ,[QAST_STAND5] AS 기준5
            ,[QAST_STAND6] AS 기준6
            ,[QAST_STAND7] AS 기준7
            ,[QAST_STAND8] AS 기준8
            ,[QAST_STAND9] AS 기준9
            ,[QAST_STAND10] AS 기준10
            ,[QAST_NOTE] AS 비고
            ,[QAST_REGIST_NM] AS 등록자
            ,[QAST_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = [QAST_ITEM_PK]
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

// 납품 검사결과 수정
router.post("/delivery/edit", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("NO", req.body.data.NO ?? 0)
      .input("검사결과", req.body.data.검사결과 ?? "미검사")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
          SET 
            [DLVR_RESULT] = @검사결과
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

module.exports = router;
