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
    .input("menu", "품질관리_수입검사") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [IPISP_PK] AS NO
        ,[IPISP_ORDER_PK] AS 발주NO
        ,ORDERORDER.발주코드 AS 발주코드
        ,ORDERORDER.품번 AS 발주품번
        ,ORDERORDER.품명 AS 발주품명
        ,ORDERORDER.수량 AS 발주수량
        ,ORDERORDER.품질기준이미지 AS 품질기준이미지
        ,ORDERORDER.품질기준1 AS 품질기준1
        ,ORDERORDER.품질기준2 AS 품질기준2
        ,ORDERORDER.품질기준3 AS 품질기준3
        ,ORDERORDER.품질기준4 AS 품질기준4
        ,ORDERORDER.품질기준5 AS 품질기준5
        ,ORDERORDER.품질기준6 AS 품질기준6
        ,ORDERORDER.품질기준7 AS 품질기준7
        ,ORDERORDER.품질기준8 AS 품질기준8
        ,ORDERORDER.품질기준9 AS 품질기준9
        ,ORDERORDER.품질기준10 AS 품질기준10
        ,[IPISP_DIV] AS 구분
        ,[IPISP_SAMPLE_AMT] AS 샘플수량
        ,[IPISP_RECEIVE_AMT] AS 입고수량
        ,[IPISP_RESULT] AS 결과
        ,[IPISP_CONTENT1] AS 내용1
        ,[IPISP_CONTENT2] AS 내용2
        ,[IPISP_CONTENT3] AS 내용3
        ,[IPISP_CONTENT4] AS 내용4
        ,[IPISP_CONTENT5] AS 내용5
        ,[IPISP_CONTENT6] AS 내용6
        ,[IPISP_CONTENT7] AS 내용7
        ,[IPISP_CONTENT8] AS 내용8
        ,[IPISP_CONTENT9] AS 내용9
        ,[IPISP_CONTENT10] AS 내용10
        ,CONVERT(varchar, [IPISP_REQUEST_DT], 20) AS 요청일시
        ,[IPISP_INFO] AS 전달사항
        ,[IPISP_NOTE] AS 비고
        ,[IPISP_REGIST_NM] AS 등록자
        ,[IPISP_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
      LEFT JOIN
      (
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
          ,QUALITY_STAND.이미지 AS 품질기준이미지
          ,QUALITY_STAND.구분 AS 품질기준구분
          ,QUALITY_STAND.기준1 AS 품질기준1
          ,QUALITY_STAND.기준2 AS 품질기준2
          ,QUALITY_STAND.기준3 AS 품질기준3
          ,QUALITY_STAND.기준4 AS 품질기준4
          ,QUALITY_STAND.기준5 AS 품질기준5
          ,QUALITY_STAND.기준6 AS 품질기준6
          ,QUALITY_STAND.기준7 AS 품질기준7
          ,QUALITY_STAND.기준8 AS 품질기준8
          ,QUALITY_STAND.기준9 AS 품질기준9
          ,QUALITY_STAND.기준10 AS 품질기준10
          ,[ORDR_AMOUNT] AS 수량
        FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
        LEFT JOIN
        (
          SELECT
            [ACPT_PK] AS NO
            ,LEFT([ACPT_DATE],10) AS 수주일
            ,[ACPT_CODE] AS 코드
            ,[ACPT_CODE_NUM] AS 코드순번
            ,[ACPT_DIV] AS 구분
            ,[ACPT_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[ACPT_ITEM_PK] AS 품목NO
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,[ACPT_AMOUNT] AS 수량
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
        LEFT JOIN
        (
          SELECT
            [QAST_PK] AS NO
            ,[QAST_ITEM_PK] AS 품목NO
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
          FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
          WHERE [QAST_DIV] = '수입'
        ) AS QUALITY_STAND ON QUALITY_STAND.품목NO = [ORDR_ITEM_PK]
      ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
      ORDER BY [IPISP_PK] DESC
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
          NO AS NO, 발주NO AS 발주NO, 발주코드 AS 발주코드, 발주품번 AS 발주품번, 발주품명 AS 발주품명, 발주수량 AS 발주수량,
          품질기준이미지 AS 품질기준이미지, 품질기준1 AS 품질기준1, 품질기준2 AS 품질기준2,
          품질기준3 AS 품질기준3, 품질기준4 AS 품질기준4, 품질기준5 AS 품질기준5, 품질기준6 AS 품질기준6,
          품질기준7 AS 품질기준7, 품질기준8 AS 품질기준8, 품질기준9 AS 품질기준9, 품질기준10 AS 품질기준10,
          구분 AS 구분, 샘플수량 AS 샘플수량, 입고수량 AS 입고수량, 결과 AS 결과, 내용1 AS 내용1, 내용2 AS 내용2,
          내용3 AS 내용3, 내용4 AS 내용4, 내용5 AS 내용5, 내용6 AS 내용6, 내용7 AS 내용7, 내용8 AS 내용8, 내용9 AS 내용9,
          내용10 AS 내용10, 요청일시 AS 요청일시, 전달사항 AS 전달사항, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [IPISP_PK] AS NO
            ,[IPISP_ORDER_PK] AS 발주NO
            ,ORDERORDER.발주코드 AS 발주코드
            ,ORDERORDER.품번 AS 발주품번
            ,ORDERORDER.품명 AS 발주품명
            ,ORDERORDER.수량 AS 발주수량
            ,ORDERORDER.품질기준이미지 AS 품질기준이미지
            ,ORDERORDER.품질기준1 AS 품질기준1
            ,ORDERORDER.품질기준2 AS 품질기준2
            ,ORDERORDER.품질기준3 AS 품질기준3
            ,ORDERORDER.품질기준4 AS 품질기준4
            ,ORDERORDER.품질기준5 AS 품질기준5
            ,ORDERORDER.품질기준6 AS 품질기준6
            ,ORDERORDER.품질기준7 AS 품질기준7
            ,ORDERORDER.품질기준8 AS 품질기준8
            ,ORDERORDER.품질기준9 AS 품질기준9
            ,ORDERORDER.품질기준10 AS 품질기준10
            ,[IPISP_DIV] AS 구분
            ,[IPISP_SAMPLE_AMT] AS 샘플수량
            ,[IPISP_RECEIVE_AMT] AS 입고수량
            ,[IPISP_RESULT] AS 결과
            ,[IPISP_CONTENT1] AS 내용1
            ,[IPISP_CONTENT2] AS 내용2
            ,[IPISP_CONTENT3] AS 내용3
            ,[IPISP_CONTENT4] AS 내용4
            ,[IPISP_CONTENT5] AS 내용5
            ,[IPISP_CONTENT6] AS 내용6
            ,[IPISP_CONTENT7] AS 내용7
            ,[IPISP_CONTENT8] AS 내용8
            ,[IPISP_CONTENT9] AS 내용9
            ,[IPISP_CONTENT10] AS 내용10
            ,CONVERT(varchar, [IPISP_REQUEST_DT], 20) AS 요청일시
            ,[IPISP_INFO] AS 전달사항
            ,[IPISP_NOTE] AS 비고
            ,[IPISP_REGIST_NM] AS 등록자
            ,[IPISP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
          LEFT JOIN
          (
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
              ,QUALITY_STAND.이미지 AS 품질기준이미지
              ,QUALITY_STAND.구분 AS 품질기준구분
              ,QUALITY_STAND.기준1 AS 품질기준1
              ,QUALITY_STAND.기준2 AS 품질기준2
              ,QUALITY_STAND.기준3 AS 품질기준3
              ,QUALITY_STAND.기준4 AS 품질기준4
              ,QUALITY_STAND.기준5 AS 품질기준5
              ,QUALITY_STAND.기준6 AS 품질기준6
              ,QUALITY_STAND.기준7 AS 품질기준7
              ,QUALITY_STAND.기준8 AS 품질기준8
              ,QUALITY_STAND.기준9 AS 품질기준9
              ,QUALITY_STAND.기준10 AS 품질기준10
              ,[ORDR_AMOUNT] AS 수량
            FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
            LEFT JOIN
            (
              SELECT
                [ACPT_PK] AS NO
                ,LEFT([ACPT_DATE],10) AS 수주일
                ,[ACPT_CODE] AS 코드
                ,[ACPT_CODE_NUM] AS 코드순번
                ,[ACPT_DIV] AS 구분
                ,[ACPT_CLIENT_PK] AS 거래처NO
                ,CLIENT.거래처명 AS 거래처명
                ,[ACPT_ITEM_PK] AS 품목NO
                ,ITEM.품목구분 AS 품목구분
                ,ITEM.품번 AS 품번
                ,ITEM.품명 AS 품명
                ,[ACPT_AMOUNT] AS 수량
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
            LEFT JOIN
            (
              SELECT
                [QAST_PK] AS NO
                ,[QAST_ITEM_PK] AS 품목NO
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
              FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
              WHERE [QAST_DIV] = '수입'
            ) AS QUALITY_STAND ON QUALITY_STAND.품목NO = [ORDR_ITEM_PK]
          ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 요청일시), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 요청일시), 12) <= ` +
        req.body.endDate +
        `
        AND ( 발주코드 like concat('%',@input,'%')
        OR 발주품번 like concat('%',@input,'%')
        OR 발주품명 like concat('%',@input,'%')
        OR 품질기준1 like concat('%',@input,'%')
        OR 품질기준2 like concat('%',@input,'%')
        OR 품질기준3 like concat('%',@input,'%')
        OR 품질기준4 like concat('%',@input,'%')
        OR 품질기준5 like concat('%',@input,'%')
        OR 품질기준6 like concat('%',@input,'%')
        OR 품질기준7 like concat('%',@input,'%')
        OR 품질기준8 like concat('%',@input,'%')
        OR 품질기준9 like concat('%',@input,'%')
        OR 품질기준10 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 샘플수량 like concat('%',@input,'%')
        OR 입고수량 like concat('%',@input,'%')
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
          NO AS NO, 발주NO AS 발주NO, 발주코드 AS 발주코드, 발주품번 AS 발주품번, 발주품명 AS 발주품명, 발주수량 AS 발주수량,
          품질기준이미지 AS 품질기준이미지, 품질기준1 AS 품질기준1, 품질기준2 AS 품질기준2,
          품질기준3 AS 품질기준3, 품질기준4 AS 품질기준4, 품질기준5 AS 품질기준5, 품질기준6 AS 품질기준6,
          품질기준7 AS 품질기준7, 품질기준8 AS 품질기준8, 품질기준9 AS 품질기준9, 품질기준10 AS 품질기준10,
          구분 AS 구분, 샘플수량 AS 샘플수량, 입고수량 AS 입고수량, 결과 AS 결과, 내용1 AS 내용1, 내용2 AS 내용2,
          내용3 AS 내용3, 내용4 AS 내용4, 내용5 AS 내용5, 내용6 AS 내용6, 내용7 AS 내용7, 내용8 AS 내용8, 내용9 AS 내용9,
          내용10 AS 내용10, 전달사항 AS 전달사항, 요청일시 AS 요청일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [IPISP_PK] AS NO
            ,[IPISP_ORDER_PK] AS 발주NO
            ,ORDERORDER.발주코드 AS 발주코드
            ,ORDERORDER.품번 AS 발주품번
            ,ORDERORDER.품명 AS 발주품명
            ,ORDERORDER.수량 AS 발주수량
            ,ORDERORDER.품질기준이미지 AS 품질기준이미지
            ,ORDERORDER.품질기준1 AS 품질기준1
            ,ORDERORDER.품질기준2 AS 품질기준2
            ,ORDERORDER.품질기준3 AS 품질기준3
            ,ORDERORDER.품질기준4 AS 품질기준4
            ,ORDERORDER.품질기준5 AS 품질기준5
            ,ORDERORDER.품질기준6 AS 품질기준6
            ,ORDERORDER.품질기준7 AS 품질기준7
            ,ORDERORDER.품질기준8 AS 품질기준8
            ,ORDERORDER.품질기준9 AS 품질기준9
            ,ORDERORDER.품질기준10 AS 품질기준10
            ,[IPISP_DIV] AS 구분
            ,[IPISP_SAMPLE_AMT] AS 샘플수량
            ,[IPISP_RECEIVE_AMT] AS 입고수량
            ,[IPISP_RESULT] AS 결과
            ,[IPISP_CONTENT1] AS 내용1
            ,[IPISP_CONTENT2] AS 내용2
            ,[IPISP_CONTENT3] AS 내용3
            ,[IPISP_CONTENT4] AS 내용4
            ,[IPISP_CONTENT5] AS 내용5
            ,[IPISP_CONTENT6] AS 내용6
            ,[IPISP_CONTENT7] AS 내용7
            ,[IPISP_CONTENT8] AS 내용8
            ,[IPISP_CONTENT9] AS 내용9
            ,[IPISP_CONTENT10] AS 내용10
            ,CONVERT(varchar, [IPISP_REQUEST_DT], 20) AS 요청일시
            ,[IPISP_INFO] AS 전달사항
            ,[IPISP_NOTE] AS 비고
            ,[IPISP_REGIST_NM] AS 등록자
            ,[IPISP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
          LEFT JOIN
          (
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
              ,QUALITY_STAND.이미지 AS 품질기준이미지
              ,QUALITY_STAND.구분 AS 품질기준구분
              ,QUALITY_STAND.기준1 AS 품질기준1
              ,QUALITY_STAND.기준2 AS 품질기준2
              ,QUALITY_STAND.기준3 AS 품질기준3
              ,QUALITY_STAND.기준4 AS 품질기준4
              ,QUALITY_STAND.기준5 AS 품질기준5
              ,QUALITY_STAND.기준6 AS 품질기준6
              ,QUALITY_STAND.기준7 AS 품질기준7
              ,QUALITY_STAND.기준8 AS 품질기준8
              ,QUALITY_STAND.기준9 AS 품질기준9
              ,QUALITY_STAND.기준10 AS 품질기준10
              ,[ORDR_AMOUNT] AS 수량
            FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
            LEFT JOIN
            (
              SELECT
                [ACPT_PK] AS NO
                ,LEFT([ACPT_DATE],10) AS 수주일
                ,[ACPT_CODE] AS 코드
                ,[ACPT_CODE_NUM] AS 코드순번
                ,[ACPT_DIV] AS 구분
                ,[ACPT_CLIENT_PK] AS 거래처NO
                ,CLIENT.거래처명 AS 거래처명
                ,[ACPT_ITEM_PK] AS 품목NO
                ,ITEM.품목구분 AS 품목구분
                ,ITEM.품번 AS 품번
                ,ITEM.품명 AS 품명
                ,[ACPT_AMOUNT] AS 수량
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
            LEFT JOIN
            (
              SELECT
                [QAST_PK] AS NO
                ,[QAST_ITEM_PK] AS 품목NO
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
              FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
              WHERE [QAST_DIV] = '수입'
            ) AS QUALITY_STAND ON QUALITY_STAND.품목NO = [ORDR_ITEM_PK]
          ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
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
      .input(
        "요청일시",
        moment(req.body.data.요청일시).format("YYYY-MM-DD HH:mm:ss") ?? ""
      )
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
            @내용6,@내용7,@내용8,@내용9,@내용10,@요청일시,@전달사항,@비고,@등록자,@등록일시)
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
        .input("발주NO", req.body.data[i].발주NO ?? null)
        .input("구분", req.body.data[i].구분 ?? "")
        .input("샘플수량", req.body.data[i].샘플수량 ?? "")
        .input("입고수량", req.body.data[i].입고수량 ?? "")
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
        .input(
          "요청일시",
          moment(req.body.data[i].요청일시).format("YYYY-MM-DD HH:mm:ss") ?? ""
        )
        .input("전달사항", req.body.data[i].전달사항 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
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
            @내용6,@내용7,@내용8,@내용9,@내용10,@요청일시,@전달사항,@비고,@등록자,@등록일시)
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
        UPDATE [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
        SET 
          [IPISP_ORDER_PK] = @발주NO
          ,[IPISP_DIV] = @구분
          ,[IPISP_SAMPLE_AMT] = @샘플수량
          ,[IPISP_RECEIVE_AMT] = @입고수량
          ,[IPISP_RESULT] = @결과
          ,[IPISP_CONTENT1] = @내용1
          ,[IPISP_CONTENT2] = @내용2
          ,[IPISP_CONTENT3] = @내용3
          ,[IPISP_CONTENT4] = @내용4
          ,[IPISP_CONTENT5] = @내용5
          ,[IPISP_CONTENT6] = @내용6
          ,[IPISP_CONTENT7] = @내용7
          ,[IPISP_CONTENT8] = @내용8
          ,[IPISP_CONTENT9] = @내용9
          ,[IPISP_CONTENT10] = @내용10
          ,[IPISP_INFO] = @전달사항
          ,[IPISP_NOTE] = @비고
          ,[IPISP_REGIST_NM] = @등록자
          ,[IPISP_REGIST_DT] = @등록일시
        WHERE [IPISP_PK] = @NO
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
          [IPISP_PK] AS NO
          ,[IPISP_ORDER_PK] AS 발주NO
          ,ORDERORDER.발주코드 AS 발주코드
          ,ORDERORDER.품번 AS 발주품번
          ,ORDERORDER.품명 AS 발주품명
          ,ORDERORDER.수량 AS 발주수량
          ,ORDERORDER.품질기준이미지 AS 품질기준이미지
          ,ORDERORDER.품질기준1 AS 품질기준1
          ,ORDERORDER.품질기준2 AS 품질기준2
          ,ORDERORDER.품질기준3 AS 품질기준3
          ,ORDERORDER.품질기준4 AS 품질기준4
          ,ORDERORDER.품질기준5 AS 품질기준5
          ,ORDERORDER.품질기준6 AS 품질기준6
          ,ORDERORDER.품질기준7 AS 품질기준7
          ,ORDERORDER.품질기준8 AS 품질기준8
          ,ORDERORDER.품질기준9 AS 품질기준9
          ,ORDERORDER.품질기준10 AS 품질기준10
          ,[IPISP_DIV] AS 구분
          ,[IPISP_SAMPLE_AMT] AS 샘플수량
          ,[IPISP_RECEIVE_AMT] AS 입고수량
          ,[IPISP_RESULT] AS 결과
          ,[IPISP_CONTENT1] AS 내용1
          ,[IPISP_CONTENT2] AS 내용2
          ,[IPISP_CONTENT3] AS 내용3
          ,[IPISP_CONTENT4] AS 내용4
          ,[IPISP_CONTENT5] AS 내용5
          ,[IPISP_CONTENT6] AS 내용6
          ,[IPISP_CONTENT7] AS 내용7
          ,[IPISP_CONTENT8] AS 내용8
          ,[IPISP_CONTENT9] AS 내용9
          ,[IPISP_CONTENT10] AS 내용10
          ,CONVERT(varchar,[IPISP_REQUEST_DT],20) AS 요청일시
          ,[IPISP_INFO] AS 전달사항
          ,[IPISP_NOTE] AS 비고
          ,[IPISP_REGIST_NM] AS 등록자
          ,[IPISP_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
        LEFT JOIN
        (
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
            ,QUALITY_STAND.이미지 AS 품질기준이미지
            ,QUALITY_STAND.구분 AS 품질기준구분
            ,QUALITY_STAND.기준1 AS 품질기준1
            ,QUALITY_STAND.기준2 AS 품질기준2
            ,QUALITY_STAND.기준3 AS 품질기준3
            ,QUALITY_STAND.기준4 AS 품질기준4
            ,QUALITY_STAND.기준5 AS 품질기준5
            ,QUALITY_STAND.기준6 AS 품질기준6
            ,QUALITY_STAND.기준7 AS 품질기준7
            ,QUALITY_STAND.기준8 AS 품질기준8
            ,QUALITY_STAND.기준9 AS 품질기준9
            ,QUALITY_STAND.기준10 AS 품질기준10
            ,[ORDR_AMOUNT] AS 수량
          FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
          LEFT JOIN
          (
            SELECT
              [ACPT_PK] AS NO
              ,LEFT([ACPT_DATE],10) AS 수주일
              ,[ACPT_CODE] AS 코드
              ,[ACPT_CODE_NUM] AS 코드순번
              ,[ACPT_DIV] AS 구분
              ,[ACPT_CLIENT_PK] AS 거래처NO
              ,CLIENT.거래처명 AS 거래처명
              ,[ACPT_ITEM_PK] AS 품목NO
              ,ITEM.품목구분 AS 품목구분
              ,ITEM.품번 AS 품번
              ,ITEM.품명 AS 품명
              ,[ACPT_AMOUNT] AS 수량
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
          LEFT JOIN
          (
            SELECT
              [QAST_PK] AS NO
              ,[QAST_ITEM_PK] AS 품목NO
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
            FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
            WHERE [QAST_DIV] = '수입'
          ) AS QUALITY_STAND ON QUALITY_STAND.품목NO = [ORDR_ITEM_PK]
        ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
        WHERE [IPISP_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB] WHERE [IPISP_PK] = @key`
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

// 등록
router.post("/itemreceive/insert", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("생산실적NO", req.body.data.생산실적NO ?? null)
      .input("공정검사NO", req.body.data.공정검사NO ?? null)
      .input("불량재작업NO", req.body.data.불량재작업NO ?? null)
      .input("수입검사NO", req.body.data.수입검사NO ?? null)
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input(
        "입고일시",
        moment(req.body.data.입고일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("입고코드", req.body.data.입고코드 ?? "")
      .input("입고수", req.body.data.입고수 ?? "")
      .input("유효일자", req.body.data.유효일자 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
          ([ITRC_PRODUCE_RESULT_PK]
          ,[ITRC_PROCESS_INSPECT_PK]
          ,[ITRC_DEFECT_REWORK_PK]
          ,[ITRC_IMPORT_INSPECT_PK]
          ,[ITRC_ITEM_PK]
          ,[ITRC_DIV]
          ,[ITRC_CODE]
          ,[ITRC_AMOUNT]
          ,[ITRC_DT]
          ,[ITRC_EXPIRE_DATE]
          ,[ITRC_NOTE]
          ,[ITRC_REGIST_NM]
          ,[ITRC_REGIST_DT])
            VALUES
          (@생산실적NO,@공정검사NO,@불량재작업NO,@수입검사NO,
            (SELECT [ORDR_ITEM_PK] FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
              WHERE [ORDR_PK] = (SELECT [IPISP_ORDER_PK] FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
                                  WHERE [IPISP_PK] = @수입검사NO)),
            @구분,@입고코드,@입고수,@입고일시,@유효일자,@비고,@등록자,@등록일시)
    `);

    // 로그기록 저장
    await logSend(
      (type = "입고등록"),
      (ct = JSON.stringify(req.body.data) + " 을 입고등록."),
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
