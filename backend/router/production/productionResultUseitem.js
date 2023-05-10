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
    .input("menu", "생산관리_생산실적집계_투입자재") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [PDUI_PK] AS NO
        ,[PDUI_PRODUCE_RESULT_PK] AS 생산실적NO
        ,[PDUI_ITEM_PROCESS_PK] AS 품목재공NO
        ,ITEM_PROCESS.입고코드 AS 코드
        ,ITEM_PROCESS.품목구분 AS 구분
        ,ITEM_PROCESS.품명 AS 품명
        ,ITEM_PROCESS.규격 AS 규격
        ,ITEM_PROCESS.단위 AS 단위
        ,[PDUI_AMOUNT] AS 수량
        ,[PDUI_DT] AS 사용일시
        ,[PDUI_NOTE] AS 비고
        ,[PDUI_REGIST_NM] AS 등록자
        ,[PDUI_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
      LEFT JOIN
      (
        SELECT
          [ITPC_PK] AS NO
          ,[ITPC_DIV] AS 구분
          ,[ITPC_INST_PRCS_ITEM_PK] AS 지시공정자재NO
          ,[ITPC_ITEM_RECEIVE_PK] AS 품목입고NO
          ,ITEM_RECEIVE.입고코드 AS 입고코드
          ,ITEM_RECEIVE.품목구분 AS 품목구분
          ,ITEM_RECEIVE.품번 AS 품번
          ,ITEM_RECEIVE.품명 AS 품명
          ,ITEM_RECEIVE.규격 AS 규격
          ,ITEM_RECEIVE.단위 AS 단위
          ,[ITPC_AMOUNT] AS 수량
          ,[ITPC_DT] AS 불출일시
        FROM [QMES2022].[dbo].[MANAGE_ITEM_PROCESS_TB]
        LEFT JOIN
        (
          SELECT
            [ITRC_PK] AS NO
            ,[ITRC_PRODUCE_RESULT_PK] AS 생산실적NO
            ,[ITRC_DEFECT_REWORK_PK] AS 불량재작업NO
            ,[ITRC_IMPORT_INSPECT_PK] AS 수입검사NO
            ,[ITRC_DIV] AS 구분
            ,CONVERT(VARCHAR, [ITRC_DT], 20) AS 입고일시
            ,[ITRC_CODE] AS 입고코드
            ,IMPORT_INSPECT.발주품목구분 AS 품목구분
            ,IMPORT_INSPECT.발주품번 AS 품번
            ,IMPORT_INSPECT.발주품명 AS 품명
            ,IMPORT_INSPECT.발주규격 AS 규격
            ,IMPORT_INSPECT.발주단위 AS 단위
            ,[ITRC_AMOUNT] AS 입고수
            ,CONVERT(VARCHAR,[ITRC_EXPIRE_DATE], 23) AS 유효일자
          FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
          LEFT JOIN
          (
            SELECT
              [IPISP_PK] AS NO
              ,[IPISP_ORDER_PK] AS 발주NO
              ,ORDERORDER.발주코드 AS 발주코드
              ,ORDERORDER.품목구분 AS 발주품목구분
              ,ORDERORDER.품번 AS 발주품번
              ,ORDERORDER.품명 AS 발주품명
              ,ORDERORDER.규격 AS 발주규격
              ,ORDERORDER.단위 AS 발주단위
              ,[IPISP_DIV] AS 구분
              ,[IPISP_SAMPLE_AMT] AS 샘플수량
              ,[IPISP_RECEIVE_AMT] AS 입고수량
              ,[IPISP_RESULT] AS 결과
              ,[IPISP_INFO] AS 전달사항
            FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
            LEFT JOIN
            (
              SELECT
                [ORDR_PK] AS NO
                ,[ORDR_ACCEPT_PK] AS 수주NO
                ,[ORDR_CODE] AS 발주코드
                ,[ORDR_DIV] AS 발주구분
                ,CONVERT(varchar, [ORDR_DATE], 23) AS 발주일자
                ,[ORDR_CLIENT_PK] AS 거래처NO
                ,CLIENT.거래처명 AS 거래처명
                ,[ORDR_ITEM_PK] AS 품목NO
                ,ITEM.품목구분 AS 품목구분
                ,ITEM.품번 AS 품번
                ,ITEM.품명 AS 품명
                ,ITEM.규격 AS 규격
                ,ITEM.단위 AS 단위
                ,[ORDR_AMOUNT] AS 수량
              FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
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
                  ,[ITEM_SIZE] AS 규격
                  ,[ITEM_UNIT] AS 단위
                FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
              ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
            ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
          ) AS IMPORT_INSPECT ON IMPORT_INSPECT.NO = [ITRC_IMPORT_INSPECT_PK]
        ) AS ITEM_RECEIVE ON ITEM_RECEIVE.NO = [ITPC_ITEM_RECEIVE_PK]
      ) AS ITEM_PROCESS ON ITEM_PROCESS.NO = [PDUI_ITEM_PROCESS_PK]
      ORDER BY [PDUI_PK] DESC
    `);

    // // 로그기록 저장
    // await logSend(
    //   (type = "메뉴열람"),
    //   (ct = "메뉴를 열람함."),
    //   (amount = result.recordset.length ?? 0),
    //   (user = req.query.user ?? "")
    // );

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
          NO AS NO, 생산실적NO AS 생산실적NO, 품목재공NO AS 품목재공NO, 코드 AS 코드, 구분 AS 구분, 품명 AS 품명,
          규격 AS 규격, 단위 AS 단위, 수량 AS 수량, 사용일시 AS 사용일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDUI_PK] AS NO
            ,[PDUI_PRODUCE_RESULT_PK] AS 생산실적NO
            ,[PDUI_ITEM_PROCESS_PK] AS 품목재공NO
            ,ITEM_PROCESS.입고코드 AS 코드
            ,ITEM_PROCESS.품목구분 AS 구분
            ,ITEM_PROCESS.품명 AS 품명
            ,ITEM_PROCESS.규격 AS 규격
            ,ITEM_PROCESS.단위 AS 단위
            ,[PDUI_AMOUNT] AS 수량
            ,[PDUI_DT] AS 사용일시
            ,[PDUI_NOTE] AS 비고
            ,[PDUI_REGIST_NM] AS 등록자
            ,[PDUI_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
          LEFT JOIN
          (
            SELECT
              [ITPC_PK] AS NO
              ,[ITPC_DIV] AS 구분
              ,[ITPC_INST_PRCS_ITEM_PK] AS 지시공정자재NO
              ,[ITPC_ITEM_RECEIVE_PK] AS 품목입고NO
              ,ITEM_RECEIVE.입고코드 AS 입고코드
              ,ITEM_RECEIVE.품목구분 AS 품목구분
              ,ITEM_RECEIVE.품번 AS 품번
              ,ITEM_RECEIVE.품명 AS 품명
              ,ITEM_RECEIVE.규격 AS 규격
              ,ITEM_RECEIVE.단위 AS 단위
              ,[ITPC_AMOUNT] AS 수량
              ,[ITPC_DT] AS 불출일시
            FROM [QMES2022].[dbo].[MANAGE_ITEM_PROCESS_TB]
            LEFT JOIN
            (
              SELECT
                [ITRC_PK] AS NO
                ,[ITRC_PRODUCE_RESULT_PK] AS 생산실적NO
                ,[ITRC_DEFECT_REWORK_PK] AS 불량재작업NO
                ,[ITRC_IMPORT_INSPECT_PK] AS 수입검사NO
                ,[ITRC_DIV] AS 구분
                ,CONVERT(VARCHAR, [ITRC_DT], 20) AS 입고일시
                ,[ITRC_CODE] AS 입고코드
                ,IMPORT_INSPECT.발주품목구분 AS 품목구분
                ,IMPORT_INSPECT.발주품번 AS 품번
                ,IMPORT_INSPECT.발주품명 AS 품명
                ,IMPORT_INSPECT.발주규격 AS 규격
                ,IMPORT_INSPECT.발주단위 AS 단위
                ,[ITRC_AMOUNT] AS 입고수
                ,CONVERT(VARCHAR,[ITRC_EXPIRE_DATE], 23) AS 유효일자
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              LEFT JOIN
              (
                SELECT
                  [IPISP_PK] AS NO
                  ,[IPISP_ORDER_PK] AS 발주NO
                  ,ORDERORDER.발주코드 AS 발주코드
                  ,ORDERORDER.품목구분 AS 발주품목구분
                  ,ORDERORDER.품번 AS 발주품번
                  ,ORDERORDER.품명 AS 발주품명
                  ,ORDERORDER.규격 AS 발주규격
                  ,ORDERORDER.단위 AS 발주단위
                  ,[IPISP_DIV] AS 구분
                  ,[IPISP_SAMPLE_AMT] AS 샘플수량
                  ,[IPISP_RECEIVE_AMT] AS 입고수량
                  ,[IPISP_RESULT] AS 결과
                  ,[IPISP_INFO] AS 전달사항
                FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
                LEFT JOIN
                (
                  SELECT
                    [ORDR_PK] AS NO
                    ,[ORDR_ACCEPT_PK] AS 수주NO
                    ,[ORDR_CODE] AS 발주코드
                    ,[ORDR_DIV] AS 발주구분
                    ,CONVERT(varchar, [ORDR_DATE], 23) AS 발주일자
                    ,[ORDR_CLIENT_PK] AS 거래처NO
                    ,CLIENT.거래처명 AS 거래처명
                    ,[ORDR_ITEM_PK] AS 품목NO
                    ,ITEM.품목구분 AS 품목구분
                    ,ITEM.품번 AS 품번
                    ,ITEM.품명 AS 품명
                    ,ITEM.규격 AS 규격
                    ,ITEM.단위 AS 단위
                    ,[ORDR_AMOUNT] AS 수량
                  FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
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
                      ,[ITEM_SIZE] AS 규격
                      ,[ITEM_UNIT] AS 단위
                    FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
                  ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
                ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
              ) AS IMPORT_INSPECT ON IMPORT_INSPECT.NO = [ITRC_IMPORT_INSPECT_PK]
            ) AS ITEM_RECEIVE ON ITEM_RECEIVE.NO = [ITPC_ITEM_RECEIVE_PK]
          ) AS ITEM_PROCESS ON ITEM_PROCESS.NO = [PDUI_ITEM_PROCESS_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 코드 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
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
    } else if (req.body.searchKey == "생산실적NO") {
      sql =
        `
        SELECT
          NO AS NO, 생산실적NO AS 생산실적NO, 품목재공NO AS 품목재공NO, 코드 AS 코드, 구분 AS 구분, 품명 AS 품명,
          규격 AS 규격, 단위 AS 단위, 수량 AS 수량, 사용일시 AS 사용일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDUI_PK] AS NO
            ,[PDUI_PRODUCE_RESULT_PK] AS 생산실적NO
            ,[PDUI_ITEM_PROCESS_PK] AS 품목재공NO
            ,ITEM_PROCESS.입고코드 AS 코드
            ,ITEM_PROCESS.품목구분 AS 구분
            ,ITEM_PROCESS.품명 AS 품명
            ,ITEM_PROCESS.규격 AS 규격
            ,ITEM_PROCESS.단위 AS 단위
            ,[PDUI_AMOUNT] AS 수량
            ,[PDUI_DT] AS 사용일시
            ,[PDUI_NOTE] AS 비고
            ,[PDUI_REGIST_NM] AS 등록자
            ,[PDUI_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
          LEFT JOIN
          (
            SELECT
              [ITPC_PK] AS NO
              ,[ITPC_DIV] AS 구분
              ,[ITPC_INST_PRCS_ITEM_PK] AS 지시공정자재NO
              ,[ITPC_ITEM_RECEIVE_PK] AS 품목입고NO
              ,ITEM_RECEIVE.입고코드 AS 입고코드
              ,ITEM_RECEIVE.품목구분 AS 품목구분
              ,ITEM_RECEIVE.품번 AS 품번
              ,ITEM_RECEIVE.품명 AS 품명
              ,ITEM_RECEIVE.규격 AS 규격
              ,ITEM_RECEIVE.단위 AS 단위
              ,[ITPC_AMOUNT] AS 수량
              ,[ITPC_DT] AS 불출일시
            FROM [QMES2022].[dbo].[MANAGE_ITEM_PROCESS_TB]
            LEFT JOIN
            (
              SELECT
                [ITRC_PK] AS NO
                ,[ITRC_PRODUCE_RESULT_PK] AS 생산실적NO
                ,[ITRC_DEFECT_REWORK_PK] AS 불량재작업NO
                ,[ITRC_IMPORT_INSPECT_PK] AS 수입검사NO
                ,[ITRC_DIV] AS 구분
                ,CONVERT(VARCHAR, [ITRC_DT], 20) AS 입고일시
                ,[ITRC_CODE] AS 입고코드
                ,IMPORT_INSPECT.발주품목구분 AS 품목구분
                ,IMPORT_INSPECT.발주품번 AS 품번
                ,IMPORT_INSPECT.발주품명 AS 품명
                ,IMPORT_INSPECT.발주규격 AS 규격
                ,IMPORT_INSPECT.발주단위 AS 단위
                ,[ITRC_AMOUNT] AS 입고수
                ,CONVERT(VARCHAR,[ITRC_EXPIRE_DATE], 23) AS 유효일자
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              LEFT JOIN
              (
                SELECT
                  [IPISP_PK] AS NO
                  ,[IPISP_ORDER_PK] AS 발주NO
                  ,ORDERORDER.발주코드 AS 발주코드
                  ,ORDERORDER.품목구분 AS 발주품목구분
                  ,ORDERORDER.품번 AS 발주품번
                  ,ORDERORDER.품명 AS 발주품명
                  ,ORDERORDER.규격 AS 발주규격
                  ,ORDERORDER.단위 AS 발주단위
                  ,[IPISP_DIV] AS 구분
                  ,[IPISP_SAMPLE_AMT] AS 샘플수량
                  ,[IPISP_RECEIVE_AMT] AS 입고수량
                  ,[IPISP_RESULT] AS 결과
                  ,[IPISP_INFO] AS 전달사항
                FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
                LEFT JOIN
                (
                  SELECT
                    [ORDR_PK] AS NO
                    ,[ORDR_ACCEPT_PK] AS 수주NO
                    ,[ORDR_CODE] AS 발주코드
                    ,[ORDR_DIV] AS 발주구분
                    ,CONVERT(varchar, [ORDR_DATE], 23) AS 발주일자
                    ,[ORDR_CLIENT_PK] AS 거래처NO
                    ,CLIENT.거래처명 AS 거래처명
                    ,[ORDR_ITEM_PK] AS 품목NO
                    ,ITEM.품목구분 AS 품목구분
                    ,ITEM.품번 AS 품번
                    ,ITEM.품명 AS 품명
                    ,ITEM.규격 AS 규격
                    ,ITEM.단위 AS 단위
                    ,[ORDR_AMOUNT] AS 수량
                  FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
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
                      ,[ITEM_SIZE] AS 규격
                      ,[ITEM_UNIT] AS 단위
                    FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
                  ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
                ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
              ) AS IMPORT_INSPECT ON IMPORT_INSPECT.NO = [ITRC_IMPORT_INSPECT_PK]
            ) AS ITEM_RECEIVE ON ITEM_RECEIVE.NO = [ITPC_ITEM_RECEIVE_PK]
          ) AS ITEM_PROCESS ON ITEM_PROCESS.NO = [PDUI_ITEM_PROCESS_PK]
        ) AS RESULT
        WHERE (1=1)
        AND 생산실적NO = @input
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
          NO AS NO, 생산실적NO AS 생산실적NO, 품목재공NO AS 품목재공NO, 코드 AS 코드, 구분 AS 구분, 품명 AS 품명,
          규격 AS 규격, 단위 AS 단위, 수량 AS 수량, 사용일시 AS 사용일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDUI_PK] AS NO
            ,[PDUI_PRODUCE_RESULT_PK] AS 생산실적NO
            ,[PDUI_ITEM_PROCESS_PK] AS 품목재공NO
            ,ITEM_PROCESS.입고코드 AS 코드
            ,ITEM_PROCESS.품목구분 AS 구분
            ,ITEM_PROCESS.품명 AS 품명
            ,ITEM_PROCESS.규격 AS 규격
            ,ITEM_PROCESS.단위 AS 단위
            ,[PDUI_AMOUNT] AS 수량
            ,[PDUI_DT] AS 사용일시
            ,[PDUI_NOTE] AS 비고
            ,[PDUI_REGIST_NM] AS 등록자
            ,[PDUI_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
          LEFT JOIN
          (
            SELECT
              [ITPC_PK] AS NO
              ,[ITPC_DIV] AS 구분
              ,[ITPC_INST_PRCS_ITEM_PK] AS 지시공정자재NO
              ,[ITPC_ITEM_RECEIVE_PK] AS 품목입고NO
              ,ITEM_RECEIVE.입고코드 AS 입고코드
              ,ITEM_RECEIVE.품목구분 AS 품목구분
              ,ITEM_RECEIVE.품번 AS 품번
              ,ITEM_RECEIVE.품명 AS 품명
              ,ITEM_RECEIVE.규격 AS 규격
              ,ITEM_RECEIVE.단위 AS 단위
              ,[ITPC_AMOUNT] AS 수량
              ,[ITPC_DT] AS 불출일시
            FROM [QMES2022].[dbo].[MANAGE_ITEM_PROCESS_TB]
            LEFT JOIN
            (
              SELECT
                [ITRC_PK] AS NO
                ,[ITRC_PRODUCE_RESULT_PK] AS 생산실적NO
                ,[ITRC_DEFECT_REWORK_PK] AS 불량재작업NO
                ,[ITRC_IMPORT_INSPECT_PK] AS 수입검사NO
                ,[ITRC_DIV] AS 구분
                ,CONVERT(VARCHAR, [ITRC_DT], 20) AS 입고일시
                ,[ITRC_CODE] AS 입고코드
                ,IMPORT_INSPECT.발주품목구분 AS 품목구분
                ,IMPORT_INSPECT.발주품번 AS 품번
                ,IMPORT_INSPECT.발주품명 AS 품명
                ,IMPORT_INSPECT.발주규격 AS 규격
                ,IMPORT_INSPECT.발주단위 AS 단위
                ,[ITRC_AMOUNT] AS 입고수
                ,CONVERT(VARCHAR,[ITRC_EXPIRE_DATE], 23) AS 유효일자
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              LEFT JOIN
              (
                SELECT
                  [IPISP_PK] AS NO
                  ,[IPISP_ORDER_PK] AS 발주NO
                  ,ORDERORDER.발주코드 AS 발주코드
                  ,ORDERORDER.품목구분 AS 발주품목구분
                  ,ORDERORDER.품번 AS 발주품번
                  ,ORDERORDER.품명 AS 발주품명
                  ,ORDERORDER.규격 AS 발주규격
                  ,ORDERORDER.단위 AS 발주단위
                  ,[IPISP_DIV] AS 구분
                  ,[IPISP_SAMPLE_AMT] AS 샘플수량
                  ,[IPISP_RECEIVE_AMT] AS 입고수량
                  ,[IPISP_RESULT] AS 결과
                  ,[IPISP_INFO] AS 전달사항
                FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
                LEFT JOIN
                (
                  SELECT
                    [ORDR_PK] AS NO
                    ,[ORDR_ACCEPT_PK] AS 수주NO
                    ,[ORDR_CODE] AS 발주코드
                    ,[ORDR_DIV] AS 발주구분
                    ,CONVERT(varchar, [ORDR_DATE], 23) AS 발주일자
                    ,[ORDR_CLIENT_PK] AS 거래처NO
                    ,CLIENT.거래처명 AS 거래처명
                    ,[ORDR_ITEM_PK] AS 품목NO
                    ,ITEM.품목구분 AS 품목구분
                    ,ITEM.품번 AS 품번
                    ,ITEM.품명 AS 품명
                    ,ITEM.규격 AS 규격
                    ,ITEM.단위 AS 단위
                    ,[ORDR_AMOUNT] AS 수량
                  FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
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
                      ,[ITEM_SIZE] AS 규격
                      ,[ITEM_UNIT] AS 단위
                    FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
                  ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
                ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
              ) AS IMPORT_INSPECT ON IMPORT_INSPECT.NO = [ITRC_IMPORT_INSPECT_PK]
            ) AS ITEM_RECEIVE ON ITEM_RECEIVE.NO = [ITPC_ITEM_RECEIVE_PK]
          ) AS ITEM_PROCESS ON ITEM_PROCESS.NO = [PDUI_ITEM_PROCESS_PK]
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
      .input("생산실적NO", req.body.data.생산실적NO ?? null)
      .input("품목재공NO", req.body.data.품목재공NO ?? null)
      .input("수량", req.body.data.수량 ?? "")
      .input(
        "사용일시",
        req.body.data.사용일시 ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
          ([PDUI_PRODUCE_RESULT_PK]
          ,[PDUI_ITEM_PROCESS_PK]
          ,[PDUI_AMOUNT]
          ,[PDUI_DT]
          ,[PDUI_NOTE]
          ,[PDUI_REGIST_NM]
          ,[PDUI_REGIST_DT])
        VALUES
          (@생산실적NO,@품목재공NO,@수량,@사용일시,@비고,@등록자,@등록일시)
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
        .input("생산실적NO", req.body.data[i].생산실적NO ?? null)
        .input("품목재공NO", req.body.data[i].품목재공NO ?? null)
        .input("수량", req.body.data[i].수량 ?? "")
        .input(
          "시용일시",
          req.body.data[i].시용일시 ??
            moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        )
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
          ([PDUI_PRODUCE_RESULT_PK]
          ,[PDUI_ITEM_PROCESS_PK]
          ,[PDUI_AMOUNT]
          ,[PDUI_DT]
          ,[PDUI_NOTE]
          ,[PDUI_REGIST_NM]
          ,[PDUI_REGIST_DT])
        VALUES
          (@생산실적NO,@품목재공NO,@수량,@시용일시,@비고,@등록자,@등록일시)
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
      .input("생산실적NO", req.body.data.생산실적NO ?? null)
      .input("품목재공NO", req.body.data.품목재공NO ?? null)
      .input("수량", req.body.data.수량 ?? "")
      .input(
        "사용일시",
        req.body.data.사용일시 ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
          SET 
          [PDUI_PRODUCE_RESULT_PK] = @생산실적NO
          ,[PDUI_ITEM_PROCESS_PK] = @품목재공NO
          ,[PDUI_AMOUNT] = @수량
          ,[PDUI_DT] = @사용일시
          ,[PDUI_NOTE] = @비고
          ,[PDUI_REGIST_NM] = @등록자
          ,[PDUI_REGIST_DT] = @등록일시
        WHERE [PDUI_PK] = @NO
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
          [PDUI_PK] AS NO
          ,[PDUI_PRODUCE_RESULT_PK] AS 생산실적NO
          ,[PDUI_ITEM_PROCESS_PK] AS 품목재공NO
          ,ITEM_PROCESS.입고코드 AS 코드
          ,ITEM_PROCESS.품목구분 AS 구분
          ,ITEM_PROCESS.품명 AS 품명
          ,ITEM_PROCESS.규격 AS 규격
          ,ITEM_PROCESS.단위 AS 단위
          ,[PDUI_AMOUNT] AS 수량
          ,[PDUI_DT] AS 사용일시
          ,[PDUI_NOTE] AS 비고
          ,[PDUI_REGIST_NM] AS 등록자
          ,[PDUI_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
        LEFT JOIN
        (
          SELECT
            [ITPC_PK] AS NO
            ,[ITPC_DIV] AS 구분
            ,[ITPC_INST_PRCS_ITEM_PK] AS 지시공정자재NO
            ,[ITPC_ITEM_RECEIVE_PK] AS 품목입고NO
            ,ITEM_RECEIVE.입고코드 AS 입고코드
            ,ITEM_RECEIVE.품목구분 AS 품목구분
            ,ITEM_RECEIVE.품번 AS 품번
            ,ITEM_RECEIVE.품명 AS 품명
            ,ITEM_RECEIVE.규격 AS 규격
            ,ITEM_RECEIVE.단위 AS 단위
            ,[ITPC_AMOUNT] AS 수량
            ,[ITPC_DT] AS 불출일시
          FROM [QMES2022].[dbo].[MANAGE_ITEM_PROCESS_TB]
          LEFT JOIN
          (
            SELECT
              [ITRC_PK] AS NO
              ,[ITRC_PRODUCE_RESULT_PK] AS 생산실적NO
              ,[ITRC_DEFECT_REWORK_PK] AS 불량재작업NO
              ,[ITRC_IMPORT_INSPECT_PK] AS 수입검사NO
              ,[ITRC_DIV] AS 구분
              ,CONVERT(VARCHAR, [ITRC_DT], 20) AS 입고일시
              ,[ITRC_CODE] AS 입고코드
              ,IMPORT_INSPECT.발주품목구분 AS 품목구분
              ,IMPORT_INSPECT.발주품번 AS 품번
              ,IMPORT_INSPECT.발주품명 AS 품명
              ,IMPORT_INSPECT.발주규격 AS 규격
              ,IMPORT_INSPECT.발주단위 AS 단위
              ,[ITRC_AMOUNT] AS 입고수
              ,CONVERT(VARCHAR,[ITRC_EXPIRE_DATE], 23) AS 유효일자
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            LEFT JOIN
            (
              SELECT
                [IPISP_PK] AS NO
                ,[IPISP_ORDER_PK] AS 발주NO
                ,ORDERORDER.발주코드 AS 발주코드
                ,ORDERORDER.품목구분 AS 발주품목구분
                ,ORDERORDER.품번 AS 발주품번
                ,ORDERORDER.품명 AS 발주품명
                ,ORDERORDER.규격 AS 발주규격
                ,ORDERORDER.단위 AS 발주단위
                ,[IPISP_DIV] AS 구분
                ,[IPISP_SAMPLE_AMT] AS 샘플수량
                ,[IPISP_RECEIVE_AMT] AS 입고수량
                ,[IPISP_RESULT] AS 결과
                ,[IPISP_INFO] AS 전달사항
              FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
              LEFT JOIN
              (
                SELECT
                  [ORDR_PK] AS NO
                  ,[ORDR_ACCEPT_PK] AS 수주NO
                  ,[ORDR_CODE] AS 발주코드
                  ,[ORDR_DIV] AS 발주구분
                  ,CONVERT(varchar, [ORDR_DATE], 23) AS 발주일자
                  ,[ORDR_CLIENT_PK] AS 거래처NO
                  ,CLIENT.거래처명 AS 거래처명
                  ,[ORDR_ITEM_PK] AS 품목NO
                  ,ITEM.품목구분 AS 품목구분
                  ,ITEM.품번 AS 품번
                  ,ITEM.품명 AS 품명
                  ,ITEM.규격 AS 규격
                  ,ITEM.단위 AS 단위
                  ,[ORDR_AMOUNT] AS 수량
                FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
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
                    ,[ITEM_SIZE] AS 규격
                    ,[ITEM_UNIT] AS 단위
                  FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
                ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
              ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
            ) AS IMPORT_INSPECT ON IMPORT_INSPECT.NO = [ITRC_IMPORT_INSPECT_PK]
          ) AS ITEM_RECEIVE ON ITEM_RECEIVE.NO = [ITPC_ITEM_RECEIVE_PK]
        ) AS ITEM_PROCESS ON ITEM_PROCESS.NO = [PDUI_ITEM_PROCESS_PK]
        WHERE [PDUI_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB] WHERE [PDUI_PK] = @key`
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
