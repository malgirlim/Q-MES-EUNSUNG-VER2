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

// ###################################################################################################################
// ###################################################   생산계획   ###################################################
// ###################################################################################################################
// 조회
router.get("/plan", async (req, res) => {
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

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/plan", async (req, res) => {
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

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// ###################################################################################################################
// ###################################################   생산실적   ###################################################
// ###################################################################################################################

router.get("/produceresult", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [PDRS_PK] AS NO
        ,[PDRS_INST_PROCESS_PK] AS 지시공정NO
        ,INSTRUCT_PROCESS.작업코드 AS 작업코드
        ,INSTRUCT_PROCESS.품목구분 AS 품목구분
        ,INSTRUCT_PROCESS.품번 AS 품번
        ,INSTRUCT_PROCESS.품명 AS 품명
        ,INSTRUCT_PROCESS.규격 AS 규격
        ,INSTRUCT_PROCESS.단위 AS 단위
        ,INSTRUCT_PROCESS.지시수량 AS 지시수량
        ,INSTRUCT_PROCESS.공정명 AS 공정
        ,[PDRS_USER_ID] AS 작업자ID
        ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [PDRS_USER_ID]) AS 작업자
        ,[PDRS_FACILITY_PK] AS 설비NO
        ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [PDRS_FACILITY_PK]) AS 설비명
        ,CONVERT(VARCHAR, [PDRS_START_DT], 20) AS 시작일시
        ,CONVERT(VARCHAR, [PDRS_END_DT], 20) AS 종료일시
        ,[PDRS_PRODUCE_AMT] AS 생산수
        ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
        ,[PDRS_REPORT] AS 특이사항
        ,[PDRS_NOTE] AS 비고
        ,[PDRS_REGIST_NM] AS 등록자
        ,[PDRS_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
      LEFT JOIN
      (
        SELECT
          [ISPC_PK] AS NO
          ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
          ,(SELECT [WKIS_CODE] FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = [ISPC_WORK_INSTRUCT_PK]) AS 작업코드
          ,[ISPC_ITEM_PK] AS 품목NO
          ,ITEM.구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,ITEM.규격 AS 규격
          ,ITEM.단위 AS 단위
          ,[ISPC_AMOUNT] AS 지시수량
          ,[ISPC_PROCESS_PK] AS 공정NO
          ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
        FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
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
        ) AS ITEM ON ITEM.NO = [ISPC_ITEM_PK]
      ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = [PDRS_INST_PROCESS_PK]
      ORDER BY [PDRS_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/produceresult", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 지시공정NO AS 지시공정NO, 작업코드 AS 작업코드, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 규격 AS 규격,
          단위 AS 단위, 지시수량 AS 지시수량, 공정 AS 공정, 설비NO AS 설비NO, 설비명 AS 설비명, 작업자ID AS 작업자ID,
          작업자 AS 작업자, 시작일시 AS 시작일시, 종료일시 AS 종료일시, 생산수 AS 생산수, 불량수 AS 불량수,
          특이사항 AS 특이사항, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDRS_PK] AS NO
            ,[PDRS_INST_PROCESS_PK] AS 지시공정NO
            ,INSTRUCT_PROCESS.작업코드 AS 작업코드
            ,INSTRUCT_PROCESS.품목구분 AS 품목구분
            ,INSTRUCT_PROCESS.품번 AS 품번
            ,INSTRUCT_PROCESS.품명 AS 품명
            ,INSTRUCT_PROCESS.규격 AS 규격
            ,INSTRUCT_PROCESS.단위 AS 단위
            ,INSTRUCT_PROCESS.지시수량 AS 지시수량
            ,INSTRUCT_PROCESS.공정명 AS 공정
            ,[PDRS_USER_ID] AS 작업자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [PDRS_USER_ID]) AS 작업자
            ,[PDRS_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [PDRS_FACILITY_PK]) AS 설비명
            ,CONVERT(VARCHAR, [PDRS_START_DT], 20) AS 시작일시
            ,CONVERT(VARCHAR, [PDRS_END_DT], 20) AS 종료일시
            ,[PDRS_PRODUCE_AMT] AS 생산수
            ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
            ,[PDRS_REPORT] AS 특이사항
            ,[PDRS_NOTE] AS 비고
            ,[PDRS_REGIST_NM] AS 등록자
            ,[PDRS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          LEFT JOIN
          (
            SELECT
              [ISPC_PK] AS NO
              ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
              ,(SELECT [WKIS_CODE] FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = [ISPC_WORK_INSTRUCT_PK]) AS 작업코드
              ,[ISPC_ITEM_PK] AS 품목NO
              ,ITEM.구분 AS 품목구분
              ,ITEM.품번 AS 품번
              ,ITEM.품명 AS 품명
              ,ITEM.규격 AS 규격
              ,ITEM.단위 AS 단위
              ,[ISPC_AMOUNT] AS 지시수량
              ,[ISPC_PROCESS_PK] AS 공정NO
              ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
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
            ) AS ITEM ON ITEM.NO = [ISPC_ITEM_PK]
          ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = [PDRS_INST_PROCESS_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 시작일시), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 시작일시), 12) <= ` +
        req.body.endDate +
        `
        AND ( 작업코드 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 지시수량 like concat('%',@input,'%')
        OR 시작일 like concat('%',@input,'%')
        OR 공정 like concat('%',@input,'%')
        OR 설비명 like concat('%',@input,'%')
        OR 작업자 like concat('%',@input,'%')
        OR 시작일시 like concat('%',@input,'%')
        OR 종료일시 like concat('%',@input,'%')
        OR 생산수 like concat('%',@input,'%')
        OR 불량수 like concat('%',@input,'%')
        OR 특이사항 like concat('%',@input,'%')
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
          NO AS NO, 지시공정NO AS 지시공정NO, 작업코드 AS 작업코드, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 규격 AS 규격,
          단위 AS 단위, 지시수량 AS 지시수량, 공정 AS 공정, 설비NO AS 설비NO, 설비명 AS 설비명, 작업자ID AS 작업자ID,
          작업자 AS 작업자, 시작일시 AS 시작일시, 종료일시 AS 종료일시, 생산수 AS 생산수, 불량수 AS 불량수,
          특이사항 AS 특이사항, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PDRS_PK] AS NO
            ,[PDRS_INST_PROCESS_PK] AS 지시공정NO
            ,INSTRUCT_PROCESS.작업코드 AS 작업코드
            ,INSTRUCT_PROCESS.품목구분 AS 품목구분
            ,INSTRUCT_PROCESS.품번 AS 품번
            ,INSTRUCT_PROCESS.품명 AS 품명
            ,INSTRUCT_PROCESS.규격 AS 규격
            ,INSTRUCT_PROCESS.단위 AS 단위
            ,INSTRUCT_PROCESS.지시수량 AS 지시수량
            ,INSTRUCT_PROCESS.공정명 AS 공정
            ,[PDRS_USER_ID] AS 작업자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [PDRS_USER_ID]) AS 작업자
            ,[PDRS_FACILITY_PK] AS 설비NO
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [PDRS_FACILITY_PK]) AS 설비명
            ,CONVERT(VARCHAR, [PDRS_START_DT], 20) AS 시작일시
            ,CONVERT(VARCHAR, [PDRS_END_DT], 20) AS 종료일시
            ,[PDRS_PRODUCE_AMT] AS 생산수
            ,(SELECT COALESCE(SUM(CONVERT(numeric, [PDDF_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB] WHERE [PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]) AS 불량수
            ,[PDRS_REPORT] AS 특이사항
            ,[PDRS_NOTE] AS 비고
            ,[PDRS_REGIST_NM] AS 등록자
            ,[PDRS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          LEFT JOIN
          (
            SELECT
              [ISPC_PK] AS NO
              ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
              ,(SELECT [WKIS_CODE] FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = [ISPC_WORK_INSTRUCT_PK]) AS 작업코드
              ,[ISPC_ITEM_PK] AS 품목NO
              ,ITEM.구분 AS 품목구분
              ,ITEM.품번 AS 품번
              ,ITEM.품명 AS 품명
              ,ITEM.규격 AS 규격
              ,ITEM.단위 AS 단위
              ,[ISPC_AMOUNT] AS 지시수량
              ,[ISPC_PROCESS_PK] AS 공정NO
              ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
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
            ) AS ITEM ON ITEM.NO = [ISPC_ITEM_PK]
          ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = [PDRS_INST_PROCESS_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 시작일시), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 시작일시), 12) <= ` +
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

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// ###################################################################################################################
// ###################################################   품목   ###################################################
// ###################################################################################################################
// 조회
router.get("/product", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
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
      WHERE [ITEM_DIV] = '반제품' OR [ITEM_DIV] = '완제품'
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
          WHERE ([ITEM_DIV] = '반제품' OR [ITEM_DIV] = '완제품')
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
          WHERE ([ITEM_DIV] = '반제품' OR [ITEM_DIV] = '완제품')
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

// ###################################################################################################################
// ###################################################   공정   ###################################################
// ###################################################################################################################
// 조회
router.get("/process", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [PRCS_PK] AS NO
        ,[PRCS_CODE] AS 코드
        ,[PRCS_DIV] AS 구분
        ,[PRCS_NAME] AS 공정명
        ,[PRCS_CONTENT] AS 내용
        ,[PRCS_FACILITY] AS 설비
        ,[PRCS_NOTE] AS 비고
        ,[PRCS_REGIST_NM] AS 등록자
        ,[PRCS_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_PROCESS_TB]
      ORDER BY [PRCS_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/process", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 공정명 AS 공정명, 내용 AS 내용, 설비 AS 설비,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PRCS_PK] AS NO
            ,[PRCS_CODE] AS 코드
            ,[PRCS_DIV] AS 구분
            ,[PRCS_NAME] AS 공정명
            ,[PRCS_CONTENT] AS 내용
            ,[PRCS_FACILITY] AS 설비
            ,[PRCS_NOTE] AS 비고
            ,[PRCS_REGIST_NM] AS 등록자
            ,[PRCS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_PROCESS_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 코드 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 공정명 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
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
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 공정명 AS 공정명, 내용 AS 내용, 설비 AS 설비,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PRCS_PK] AS NO
            ,[PRCS_CODE] AS 코드
            ,[PRCS_DIV] AS 구분
            ,[PRCS_NAME] AS 공정명
            ,[PRCS_CONTENT] AS 내용
            ,[PRCS_FACILITY] AS 설비
            ,[PRCS_NOTE] AS 비고
            ,[PRCS_REGIST_NM] AS 등록자
            ,[PRCS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_PROCESS_TB]
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

// ###################################################################################################################
// ###################################################   설비   ###################################################
// ###################################################################################################################
// 조회
router.get("/facility", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [FCLT_PK] AS NO
        ,[FCLT_NAME] AS 설비명
        ,[FCLT_LINE] AS 라인
        ,[FCLT_SIZE] AS 규격
        ,[FCLT_CLIENT_PK] AS 거래처NO
        ,CLIENT.거래처명 AS 거래처명
        ,[FCLT_BUY_DATE] AS 구입일
        ,[FCLT_COST] AS 금액
        ,[FCLT_PLACE] AS 장소
        ,[FCLT_IMAGE] AS 사진
        ,[FCLT_NOTE] AS 비고
        ,[FCLT_REGIST_NM] AS 등록자
        ,[FCLT_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
      LEFT JOIN
      (
        SELECT
          [CLNT_PK] AS NO
          ,[CLNT_NAME] AS 거래처명
        FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
      ) AS CLIENT ON CLIENT.NO = [FCLT_CLIENT_PK]
      ORDER BY [FCLT_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/facility", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 설비명 AS 설비명, 라인 AS 라인, 규격 AS 규격, 거래처NO AS 거래처NO, 구입일 AS 구입일,
          금액 AS 금액, 장소 AS 장소, 사진 AS 사진, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FCLT_PK] AS NO
            ,[FCLT_NAME] AS 설비명
            ,[FCLT_LINE] AS 라인
            ,[FCLT_SIZE] AS 규격
            ,[FCLT_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[FCLT_BUY_DATE] AS 구입일
            ,[FCLT_COST] AS 금액
            ,[FCLT_PLACE] AS 장소
            ,[FCLT_IMAGE] AS 사진
            ,[FCLT_NOTE] AS 비고
            ,[FCLT_REGIST_NM] AS 등록자
            ,[FCLT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] 
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [FCLT_CLIENT_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 설비명 like concat('%',@input,'%')
        OR 라인 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 구입일 like concat('%',@input,'%')
        OR 금액 like concat('%',@input,'%')
        OR 장소 like concat('%',@input,'%')
        OR 사진 like concat('%',@input,'%')
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
          NO AS NO, 설비명 AS 설비명, 라인 AS 라인, 규격 AS 규격, 거래처NO AS 거래처NO, 구입일 AS 구입일,
          금액 AS 금액, 장소 AS 장소, 사진 AS 사진, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FCLT_PK] AS NO
            ,[FCLT_NAME] AS 설비명
            ,[FCLT_LINE] AS 라인
            ,[FCLT_SIZE] AS 규격
            ,[FCLT_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[FCLT_BUY_DATE] AS 구입일
            ,[FCLT_COST] AS 금액
            ,[FCLT_PLACE] AS 장소
            ,[FCLT_IMAGE] AS 사진
            ,[FCLT_NOTE] AS 비고
            ,[FCLT_REGIST_NM] AS 등록자
            ,[FCLT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] 
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [FCLT_CLIENT_PK]
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

// ###################################################################################################################
// ###################################################   작업자   ###################################################
// ###################################################################################################################
// 조회
router.get("/user", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [USER_ID] AS 아이디,
        [USER_PW] AS 비밀번호,
        [USER_NAME] AS 이름,
        [USER_PHONE] AS 연락처,
        [USER_EMAIL] AS 이메일,
        [USER_DEPART] AS 부서명,
        [USER_POSITION] AS 직책,
        [USER_RANK] AS 직급,
        [USER_REGIST_NM] AS 등록자,
        [USER_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_USER_TB]
      WHERE [USER_ID] != 'admin'
      AND [USER_ID] != 'kiosk'
      ORDER BY [USER_RANK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/user", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          아이디 AS 아이디, 비밀번호 AS 비밀번호, 이름 AS 이름, 연락처 AS 연락처, 이메일 AS 이메일,
          부서명 AS 부서명, 직책 AS 직책, 직급 AS 직급, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
        SELECT
          [USER_ID] AS 아이디,
          [USER_PW] AS 비밀번호,
          [USER_NAME] AS 이름,
          [USER_PHONE] AS 연락처,
          [USER_EMAIL] AS 이메일,
          [USER_DEPART] AS 부서명,
          [USER_POSITION] AS 직책,
          [USER_RANK] AS 직급,
          [USER_REGIST_NM] AS 등록자,
          [USER_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MASTER_USER_TB]
        WHERE [USER_ID] != 'admin'
        AND [USER_ID] != 'kiosk'
        ) AS RESULT
        WHERE (1=1)
        AND ( 아이디 like concat('%',@input,'%')
        OR 비밀번호 like concat('%',@input,'%')
        OR 이름 like concat('%',@input,'%')
        OR 연락처 like concat('%',@input,'%')
        OR 이메일 like concat('%',@input,'%')
        OR 부서명 like concat('%',@input,'%')
        OR 직책 like concat('%',@input,'%')
        OR 직급 like concat('%',@input,'%'))
        ORDER BY ` +
        (req.body.sortKey == "NO" ? "등록일시" : req.body.sortKey) +
        ` ` +
        req.body.sortOrder +
        `
      `;
    } else {
      sql =
        `
        SELECT
          아이디 AS 아이디, 비밀번호 AS 비밀번호, 이름 AS 이름, 연락처 AS 연락처, 이메일 AS 이메일,
          부서명 AS 부서명, 직책 AS 직책, 직급 AS 직급, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
        SELECT
          [USER_ID] AS 아이디,
          [USER_PW] AS 비밀번호,
          [USER_NAME] AS 이름,
          [USER_PHONE] AS 연락처,
          [USER_EMAIL] AS 이메일,
          [USER_DEPART] AS 부서명,
          [USER_POSITION] AS 직책,
          [USER_RANK] AS 직급,
          [USER_REGIST_NM] AS 등록자,
          [USER_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MASTER_USER_TB]
        WHERE [USER_ID] != 'admin'
        AND [USER_ID] != 'kiosk'
        ) AS RESULT
        WHERE (1=1)
        AND ` +
        req.body.searchKey +
        ` like concat('%',@input,'%')
        ORDER BY ` +
        (req.body.sortKey == "NO" ? "등록일시" : req.body.sortKey) +
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

// ###################################################################################################################
// ###################################################   품목입고   ###################################################
// ###################################################################################################################
// 조회
router.get("/itemreceive", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
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
        ,[ITRC_NOTE] AS 비고
        ,[ITRC_REGIST_NM] AS 등록자
        ,[ITRC_REGIST_DT] AS 등록일시
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
          ,[IPISP_NOTE] AS 비고
          ,[IPISP_REGIST_NM] AS 등록자
          ,[IPISP_REGIST_DT] AS 등록일시
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
      WHERE IMPORT_INSPECT.발주품목구분 IN ('원부자재','반제품')
      ORDER BY [ITRC_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// ###################################################################################################################
// ###################################################   품목재공   ###################################################
// ###################################################################################################################
// 조회
router.get("/itemprocess", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
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
        ,[ITPC_NOTE] AS 비고
        ,[ITPC_REGIST_NM] AS 등록자
        ,[ITPC_REGIST_DT] AS 등록일시
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
      ORDER BY [ITPC_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// ###################################################################################################################
// ###################################################   품목재공현황   ###################################################
// ###################################################################################################################
// 조회
router.get("/itemprocessstock", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
        SELECT
          작업지시공정NO AS 작업지시공정NO
          ,작업코드 AS 작업코드
          ,공정 AS 공정
          ,LOT코드 AS LOT코드
          ,품목NO AS 품목NO
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,불출수 AS 불출수
          ,사용수 AS 사용수
          ,재공수 AS 재공수
        FROM
        (
          SELECT
            RESULT_MIDDLE.작업지시공정NO AS 작업지시공정NO
            ,INSTRUCT_PROCESS.작업코드 AS 작업코드
            ,INSTRUCT_PROCESS.공정명 AS 공정
            ,RESULT_MIDDLE.품목NO AS 품목NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,COALESCE(RESULT_MIDDLE.불출수,0) AS 불출수
            ,COALESCE(RESULT_MIDDLE.사용수,0) AS 사용수
            ,COALESCE(RESULT_MIDDLE.재공수,0) AS 재공수
          FROM
          (
            SELECT
              불출.작업지시공정NO AS 작업지시공정NO
              ,불출.품목NO AS 품목NO
              ,불출.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= '000101'
            AND CONVERT(varchar, [ISPCI_DT], 12) <= '990101'
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 불출
            LEFT JOIN
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= '000101'
              AND CONVERT(varchar, [PDUI_DT], 12) <= '990101'
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용 ON 사용.작업지시공정NO = 불출.작업지시공정NO AND 사용.품목NO = 불출.품목NO AND 사용.LOT코드 = 불출.LOT코드

            UNION

            SELECT
              사용.작업지시공정NO AS 작업지시공정NO
              ,사용.품목NO AS 품목NO
              ,사용.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= '000101'
              AND CONVERT(varchar, [PDUI_DT], 12) <= '990101'
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용
            LEFT JOIN
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= '000101'
            AND CONVERT(varchar, [ISPCI_DT], 12) <= '990101'
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
			      ) AS 불출 ON 불출.작업지시공정NO = 사용.작업지시공정NO AND 불출.품목NO = 사용.품목NO AND 불출.LOT코드 = 사용.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPC_PK] AS NO
              ,(SELECT [WKIS_CODE] FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = [ISPC_WORK_INSTRUCT_PK]) AS 작업코드
              ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = RESULT_MIDDLE.작업지시공정NO
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [ITEM_CLIENT_PK]) AS 거래처명
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_CAR] AS 차종
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
              ,[ITEM_SAFE] AS 안전재고
              ,[ITEM_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = RESULT_MIDDLE.품목NO
        ) AS RESULT
        WHERE 재공수 != 0
        ORDER BY 작업코드 ASC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/itemprocessstock", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          작업지시공정NO AS 작업지시공정NO
          ,작업코드 AS 작업코드
          ,공정 AS 공정
          ,LOT코드 AS LOT코드
          ,품목NO AS 품목NO
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,불출수 AS 불출수
          ,사용수 AS 사용수
          ,재공수 AS 재공수
        FROM
        (
          SELECT
            RESULT_MIDDLE.작업지시공정NO AS 작업지시공정NO
            ,INSTRUCT_PROCESS.작업코드 AS 작업코드
            ,INSTRUCT_PROCESS.공정명 AS 공정
            ,RESULT_MIDDLE.품목NO AS 품목NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,COALESCE(RESULT_MIDDLE.불출수,0) AS 불출수
            ,COALESCE(RESULT_MIDDLE.사용수,0) AS 사용수
            ,COALESCE(RESULT_MIDDLE.재공수,0) AS 재공수
          FROM
          (
            SELECT
              불출.작업지시공정NO AS 작업지시공정NO
              ,불출.품목NO AS 품목NO
              ,불출.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 불출
            LEFT JOIN
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(varchar, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용 ON 사용.작업지시공정NO = 불출.작업지시공정NO AND 사용.품목NO = 불출.품목NO AND 사용.LOT코드 = 불출.LOT코드

            UNION

            SELECT
              사용.작업지시공정NO AS 작업지시공정NO
              ,사용.품목NO AS 품목NO
              ,사용.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(varchar, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용
            LEFT JOIN
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
			      ) AS 불출 ON 불출.작업지시공정NO = 사용.작업지시공정NO AND 불출.품목NO = 사용.품목NO AND 불출.LOT코드 = 사용.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPC_PK] AS NO
              ,(SELECT [WKIS_CODE] FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = [ISPC_WORK_INSTRUCT_PK]) AS 작업코드
              ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = RESULT_MIDDLE.작업지시공정NO
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [ITEM_CLIENT_PK]) AS 거래처명
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_CAR] AS 차종
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
              ,[ITEM_SAFE] AS 안전재고
              ,[ITEM_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = RESULT_MIDDLE.품목NO
        ) AS RESULT
        WHERE (1=1)
        AND 재공수량 != 0
        AND ( 작업코드 like concat('%',@input,'%')
        OR 공정 like concat('%',@input,'%')
        OR LOT코드 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%'))
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
          작업지시공정NO AS 작업지시공정NO
          ,작업코드 AS 작업코드
          ,공정 AS 공정
          ,LOT코드 AS LOT코드
          ,품목NO AS 품목NO
          ,품목구분 AS 품목구분
          ,품번 AS 품번
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,불출수 AS 불출수
          ,사용수 AS 사용수
          ,재공수 AS 재공수
        FROM
        (
          SELECT
            RESULT_MIDDLE.작업지시공정NO AS 작업지시공정NO
            ,INSTRUCT_PROCESS.작업코드 AS 작업코드
            ,INSTRUCT_PROCESS.공정명 AS 공정
            ,RESULT_MIDDLE.품목NO AS 품목NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,COALESCE(RESULT_MIDDLE.불출수,0) AS 불출수
            ,COALESCE(RESULT_MIDDLE.사용수,0) AS 사용수
            ,COALESCE(RESULT_MIDDLE.재공수,0) AS 재공수
          FROM
          (
            SELECT
              불출.작업지시공정NO AS 작업지시공정NO
              ,불출.품목NO AS 품목NO
              ,불출.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 불출
            LEFT JOIN
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(varchar, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용 ON 사용.작업지시공정NO = 불출.작업지시공정NO AND 사용.품목NO = 불출.품목NO AND 사용.LOT코드 = 불출.LOT코드

            UNION

            SELECT
              사용.작업지시공정NO AS 작업지시공정NO
              ,사용.품목NO AS 품목NO
              ,사용.LOT코드 AS LOT코드
              ,COALESCE(불출.수량,0) AS 불출수
              ,COALESCE(사용.수량,0) AS 사용수
              ,COALESCE(불출.수량,0) - COALESCE(사용.수량,0) AS 재공수
            FROM
            (
              SELECT
                PRODUCE_RESULT.작업지시공정NO AS 작업지시공정NO
                ,[PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 수량
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              LEFT JOIN
              (
                SELECT
                [PDRS_PK] AS NO
                ,[PDRS_INST_PROCESS_PK] AS 작업지시공정NO
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PDUI_PRODUCE_RESULT_PK]
              WHERE (1 = 1)
              AND CONVERT(varchar, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(varchar, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY PRODUCE_RESULT.작업지시공정NO, [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용
            LEFT JOIN
            (
            SELECT
              [ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
              ,[ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 수량
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1 = 1)
            AND CONVERT(varchar, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
            AND CONVERT(varchar, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
            GROUP BY [ISPCI_INSTRUCT_PROCESS_PK], [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
			      ) AS 불출 ON 불출.작업지시공정NO = 사용.작업지시공정NO AND 불출.품목NO = 사용.품목NO AND 불출.LOT코드 = 사용.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPC_PK] AS NO
              ,(SELECT [WKIS_CODE] FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB] WHERE [WKIS_PK] = [ISPC_WORK_INSTRUCT_PK]) AS 작업코드
              ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          ) AS INSTRUCT_PROCESS ON INSTRUCT_PROCESS.NO = RESULT_MIDDLE.작업지시공정NO
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [ITEM_CLIENT_PK]) AS 거래처명
              ,[ITEM_DIV] AS 품목구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
              ,[ITEM_CAR] AS 차종
              ,[ITEM_SIZE] AS 규격
              ,[ITEM_UNIT] AS 단위
              ,[ITEM_SAFE] AS 안전재고
              ,[ITEM_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = RESULT_MIDDLE.품목NO
        ) AS RESULT
        WHERE (1=1)
        AND 재공수량 != 0
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

// ###################################################################################################################
// ###################################################   LOT별 재고현황   ###################################################
// ###################################################################################################################

// 조회
router.get("/stocklot", async (req, res) => {
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
        ,기초재공재고 AS 기초재공재고
        ,기초재고 AS 기초재고
        ,입고 AS 입고
        ,재공 AS 재공
        ,사용 AS 사용
        ,기말재공재고 AS 기말재공재고
        ,기말재고 AS 기말재고
      FROM
      (
        SELECT
          RESULT_MIDDLE.품목NO AS NO
          ,RESULT_MIDDLE.LOT코드 AS LOT코드
          ,MASTER_ITEM.품목구분 AS 품목구분
          ,MASTER_ITEM.품번 AS 품번
          ,MASTER_ITEM.품명 AS 품명
          ,MASTER_ITEM.규격 AS 규격
          ,MASTER_ITEM.단위 AS 단위
          ,SUM(RESULT_MIDDLE.기초재공재고) AS 기초재공재고
          ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
          ,SUM(RESULT_MIDDLE.입고) AS 입고
          ,SUM(RESULT_MIDDLE.재공) AS 재공
          ,SUM(RESULT_MIDDLE.사용) AS 사용
          ,SUM(RESULT_MIDDLE.기말재공재고) AS 기말재공재고
          ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
        FROM
        (
          SELECT
            입고_MIDDLE.품목NO AS 품목NO
            ,입고_MIDDLE.LOT코드 AS LOT코드
            ,0 AS 기초재공재고
            ,0 AS 기초재고
            ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
            ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
            ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
            ,0 + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
            ,0 + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
          FROM
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,[ITRC_CODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ITRC_DT], 12) >= '000101'
            AND CONVERT(VARCHAR, [ITRC_DT], 12) <= '990101'
            GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
          ) AS 입고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= '000101'
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= '990101'
            GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 재공_MIDDLE ON 재공_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              [PDUI_ITEM_PK] AS 품목NO
              ,[PDUI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [PDUI_DT], 12) >= '000101'
            AND CONVERT(VARCHAR, [PDUI_DT], 12) <= '990101'
            GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
          ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

          UNION

          SELECT
            기초재고_MIDDLE.품목NO AS 품목NO
            ,기초재고_MIDDLE.LOT코드 AS LOT코드
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
            ,0 AS 입고
            ,0 AS 재공
            ,0 AS 사용
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + 0 - 0 AS 기말재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) + 0 - 0 AS 기말재고
          FROM
          (
            SELECT
              기초재고_입고_MIDDLE.품목NO AS 품목NO
              ,기초재고_입고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
              ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) < '000101'
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 기초재고_입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) < '000101'
              GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
            ) AS 기초재고_재공_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) < '000101'
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 기초재고_사용_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
          ) AS 기초재고_MIDDLE
          
          UNION
          
          SELECT
            재공_MIDDLE.품목NO AS 품목NO
            ,재공_MIDDLE.LOT코드 AS LOT코드
            ,0 AS 기초재공재고
            ,0 AS 기초재고
            ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
            ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
            ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
            ,0 + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
            ,0 + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
          FROM
          (
            SELECT
              [ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= '000101'
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= '990101'
            GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
          ) AS 재공_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,[ITRC_CODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ITRC_DT], 12) >= '000101'
            AND CONVERT(VARCHAR, [ITRC_DT], 12) <= '990101'
            GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
          ) AS 입고_MIDDLE ON 재공_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              [PDUI_ITEM_PK] AS 품목NO
              ,[PDUI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [PDUI_DT], 12) >= '000101'
            AND CONVERT(VARCHAR, [PDUI_DT], 12) <= '990101'
            GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
          ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = 재공_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 재공_MIDDLE.LOT코드

          UNION

          SELECT
            기초재고_MIDDLE.품목NO AS 품목NO
            ,기초재고_MIDDLE.LOT코드 AS LOT코드
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
            ,0 AS 입고
            ,0 AS 재공
            ,0 AS 사용
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + 0 - 0 AS 기말재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) + 0 - 0 AS 기말재고
          FROM
          (
            SELECT
              기초재고_재공_MIDDLE.품목NO AS 품목NO
              ,기초재고_재공_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
              ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
            FROM
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) < '000101'
              GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
            ) AS 기초재고_재공_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) < '000101'
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 기초재고_입고_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) < '000101'
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 기초재고_사용_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_재공_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_재공_MIDDLE.LOT코드
          ) AS 기초재고_MIDDLE
          
          UNION
          
          SELECT
            사용_MIDDLE.품목NO AS 품목NO
            ,사용_MIDDLE.LOT코드 AS LOT코드
            ,0 AS 기초재공재고
            ,0 AS 기초재고
            ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
            ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
            ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
            ,0 + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
            ,0 + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
          FROM
          (
            SELECT
              [PDUI_ITEM_PK] AS 품목NO
              ,[PDUI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [PDUI_DT], 12) >= '000101'
            AND CONVERT(VARCHAR, [PDUI_DT], 12) <= '990101'
            GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
          ) AS 사용_MIDDLE
          LEFT JOIN
          (
            SELECT
              [ITRC_ITEM_PK] AS 품목NO
              ,[ITRC_CODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
            FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ITRC_DT], 12) >= '000101'
            AND CONVERT(VARCHAR, [ITRC_DT], 12) <= '990101'
            GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
          ) AS 입고_MIDDLE ON 사용_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
          LEFT JOIN
          (
            SELECT
              [ISPCI_ITEM_PK] AS 품목NO
              ,[ISPCI_LOTCODE] AS LOT코드
              ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
            WHERE (1=1)
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= '000101'
            AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= '990101'
            GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
          ) AS 재공_MIDDLE ON 재공_MIDDLE.품목NO = 사용_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 사용_MIDDLE.LOT코드

          UNION

          SELECT
            기초재고_MIDDLE.품목NO AS 품목NO
            ,기초재고_MIDDLE.LOT코드 AS LOT코드
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
            ,0 AS 입고
            ,0 AS 재공
            ,0 AS 사용
            ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + 0 - 0 AS 기말재공재고
            ,COALESCE(기초재고_MIDDLE.기초재고수,0) + 0 - 0 AS 기말재고
          FROM
          (
            SELECT
              기초재고_사용_MIDDLE.품목NO AS 품목NO
              ,기초재고_사용_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
              ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
            FROM
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) < '000101'
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 기초재고_사용_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) < '000101'
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 기초재고_입고_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) < '000101'
              GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
            ) AS 기초재고_재공_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_사용_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_사용_MIDDLE.LOT코드
          ) AS 기초재고_MIDDLE
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
        ) AS MASTER_ITEM ON MASTER_ITEM.NO = RESULT_MIDDLE.품목NO
        GROUP BY RESULT_MIDDLE.품목NO,RESULT_MIDDLE.LOT코드,MASTER_ITEM.품목구분,MASTER_ITEM.품번,MASTER_ITEM.품명,MASTER_ITEM.규격,MASTER_ITEM.단위
      ) AS RESULT
      WHERE RESULT.품목구분 = '원부자재' OR RESULT.품목구분 = '반제품'
      ORDER BY RESULT.LOT코드 DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/stocklot", async (req, res) => {
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
          ,기초재공재고 AS 기초재공재고
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,재공 AS 재공
          ,사용 AS 사용
          ,기말재공재고 AS 기말재공재고
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            RESULT_MIDDLE.품목NO AS NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,MASTER_ITEM.품목구분 AS 품목구분
            ,MASTER_ITEM.품번 AS 품번
            ,MASTER_ITEM.품명 AS 품명
            ,MASTER_ITEM.규격 AS 규격
            ,MASTER_ITEM.단위 AS 단위
            ,SUM(RESULT_MIDDLE.기초재공재고) AS 기초재공재고
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고) AS 입고
            ,SUM(RESULT_MIDDLE.재공) AS 재공
            ,SUM(RESULT_MIDDLE.사용) AS 사용
            ,SUM(RESULT_MIDDLE.기말재공재고) AS 기말재공재고
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
          FROM
          (
            SELECT
              입고_MIDDLE.품목NO AS 품목NO
              ,입고_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재공재고
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
              ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
              ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
              ,0 + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
              ,0 + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ITRC_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
              ) AS 재공_MIDDLE ON 재공_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

            UNION

            SELECT
              기초재고_MIDDLE.품목NO AS 품목NO
              ,기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
              ,0 AS 입고
              ,0 AS 재공
              ,0 AS 사용
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + 0 - 0 AS 기말재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) + 0 - 0 AS 기말재고
            FROM
            (
              SELECT
                기초재고_입고_MIDDLE.품목NO AS 품목NO
                ,기초재고_입고_MIDDLE.LOT코드 AS LOT코드
                ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
                ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
              FROM
              (
                SELECT
                  [ITRC_ITEM_PK] AS 품목NO
                  ,[ITRC_CODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
                FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ITRC_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
              ) AS 기초재고_입고_MIDDLE
              LEFT JOIN
              (
                SELECT
                  [ISPCI_ITEM_PK] AS 품목NO
                  ,[ISPCI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
                FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ISPCI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
              ) AS 기초재고_재공_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
              LEFT JOIN
              (
                SELECT
                  [PDUI_ITEM_PK] AS 품목NO
                  ,[PDUI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [PDUI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
              ) AS 기초재고_사용_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
            ) AS 기초재고_MIDDLE
            
            UNION
            
            SELECT
              재공_MIDDLE.품목NO AS 품목NO
              ,재공_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재공재고
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
              ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
              ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
              ,0 + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
              ,0 + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
            FROM
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 재공_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
                FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ITRC_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_MIDDLE ON 재공_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = 재공_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 재공_MIDDLE.LOT코드

            UNION

            SELECT
              기초재고_MIDDLE.품목NO AS 품목NO
              ,기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
              ,0 AS 입고
              ,0 AS 재공
              ,0 AS 사용
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + 0 - 0 AS 기말재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) + 0 - 0 AS 기말재고
            FROM
            (
              SELECT
                기초재고_재공_MIDDLE.품목NO AS 품목NO
                ,기초재고_재공_MIDDLE.LOT코드 AS LOT코드
                ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
                ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
              FROM
              (
                SELECT
                  [ISPCI_ITEM_PK] AS 품목NO
                  ,[ISPCI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
                FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ISPCI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
              ) AS 기초재고_재공_MIDDLE
              LEFT JOIN
              (
                SELECT
                  [ITRC_ITEM_PK] AS 품목NO
                  ,[ITRC_CODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
                FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ITRC_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
              ) AS 기초재고_입고_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
              LEFT JOIN
              (
                SELECT
                  [PDUI_ITEM_PK] AS 품목NO
                  ,[PDUI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [PDUI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
              ) AS 기초재고_사용_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_재공_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_재공_MIDDLE.LOT코드
            ) AS 기초재고_MIDDLE
            
            UNION
            
            SELECT
              사용_MIDDLE.품목NO AS 품목NO
              ,사용_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재공재고
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
              ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
              ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
              ,0 + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
              ,0 + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
            FROM
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ITRC_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_MIDDLE ON 사용_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 재공_MIDDLE ON 재공_MIDDLE.품목NO = 사용_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 사용_MIDDLE.LOT코드

            UNION

            SELECT
              기초재고_MIDDLE.품목NO AS 품목NO
              ,기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
              ,0 AS 입고
              ,0 AS 재공
              ,0 AS 사용
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + 0 - 0 AS 기말재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) + 0 - 0 AS 기말재고
            FROM
            (
              SELECT
                기초재고_사용_MIDDLE.품목NO AS 품목NO
                ,기초재고_사용_MIDDLE.LOT코드 AS LOT코드
                ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
                ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
              FROM
              (
                SELECT
                  [PDUI_ITEM_PK] AS 품목NO
                  ,[PDUI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [PDUI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
              ) AS 기초재고_사용_MIDDLE
              LEFT JOIN
              (
                SELECT
                  [ITRC_ITEM_PK] AS 품목NO
                  ,[ITRC_CODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
                FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ITRC_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
              ) AS 기초재고_입고_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
              LEFT JOIN
              (
                SELECT
                  [ISPCI_ITEM_PK] AS 품목NO
                  ,[ISPCI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
                FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ISPCI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
              ) AS 기초재고_재공_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_사용_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_사용_MIDDLE.LOT코드
            ) AS 기초재고_MIDDLE
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
          ) AS MASTER_ITEM ON MASTER_ITEM.NO = RESULT_MIDDLE.품목NO
          GROUP BY RESULT_MIDDLE.품목NO,RESULT_MIDDLE.LOT코드,MASTER_ITEM.품목구분,MASTER_ITEM.품번,MASTER_ITEM.품명,MASTER_ITEM.규격,MASTER_ITEM.단위
        ) AS RESULT
        WHERE (1=1)
        AND RESULT.품목구분 = '원부자재' OR RESULT.품목구분 = '반제품'
        AND ( 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%'))
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
          ,기초재공재고 AS 기초재공재고
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,재공 AS 재공
          ,사용 AS 사용
          ,기말재공재고 AS 기말재공재고
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            RESULT_MIDDLE.품목NO AS NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,MASTER_ITEM.품목구분 AS 품목구분
            ,MASTER_ITEM.품번 AS 품번
            ,MASTER_ITEM.품명 AS 품명
            ,MASTER_ITEM.규격 AS 규격
            ,MASTER_ITEM.단위 AS 단위
            ,SUM(RESULT_MIDDLE.기초재공재고) AS 기초재공재고
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고) AS 입고
            ,SUM(RESULT_MIDDLE.재공) AS 재공
            ,SUM(RESULT_MIDDLE.사용) AS 사용
            ,SUM(RESULT_MIDDLE.기말재공재고) AS 기말재공재고
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
          FROM
          (
            SELECT
              입고_MIDDLE.품목NO AS 품목NO
              ,입고_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재공재고
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
              ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
              ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
              ,0 + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
              ,0 + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
            FROM
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ITRC_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
              ) AS 재공_MIDDLE ON 재공_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

            UNION

            SELECT
              기초재고_MIDDLE.품목NO AS 품목NO
              ,기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
              ,0 AS 입고
              ,0 AS 재공
              ,0 AS 사용
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + 0 - 0 AS 기말재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) + 0 - 0 AS 기말재고
            FROM
            (
              SELECT
                기초재고_입고_MIDDLE.품목NO AS 품목NO
                ,기초재고_입고_MIDDLE.LOT코드 AS LOT코드
                ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
                ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
              FROM
              (
                SELECT
                  [ITRC_ITEM_PK] AS 품목NO
                  ,[ITRC_CODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
                FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ITRC_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
              ) AS 기초재고_입고_MIDDLE
              LEFT JOIN
              (
                SELECT
                  [ISPCI_ITEM_PK] AS 품목NO
                  ,[ISPCI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
                FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ISPCI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
              ) AS 기초재고_재공_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
              LEFT JOIN
              (
                SELECT
                  [PDUI_ITEM_PK] AS 품목NO
                  ,[PDUI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [PDUI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
              ) AS 기초재고_사용_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
            ) AS 기초재고_MIDDLE
            
            UNION
            
            SELECT
              재공_MIDDLE.품목NO AS 품목NO
              ,재공_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재공재고
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
              ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
              ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
              ,0 + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
              ,0 + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
            FROM
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 재공_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
                FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ITRC_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_MIDDLE ON 재공_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = 재공_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 재공_MIDDLE.LOT코드

            UNION

            SELECT
              기초재고_MIDDLE.품목NO AS 품목NO
              ,기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
              ,0 AS 입고
              ,0 AS 재공
              ,0 AS 사용
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + 0 - 0 AS 기말재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) + 0 - 0 AS 기말재고
            FROM
            (
              SELECT
                기초재고_재공_MIDDLE.품목NO AS 품목NO
                ,기초재고_재공_MIDDLE.LOT코드 AS LOT코드
                ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
                ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
              FROM
              (
                SELECT
                  [ISPCI_ITEM_PK] AS 품목NO
                  ,[ISPCI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
                FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ISPCI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
              ) AS 기초재고_재공_MIDDLE
              LEFT JOIN
              (
                SELECT
                  [ITRC_ITEM_PK] AS 품목NO
                  ,[ITRC_CODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
                FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ITRC_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
              ) AS 기초재고_입고_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
              LEFT JOIN
              (
                SELECT
                  [PDUI_ITEM_PK] AS 품목NO
                  ,[PDUI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [PDUI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
              ) AS 기초재고_사용_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_재공_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_재공_MIDDLE.LOT코드
            ) AS 기초재고_MIDDLE
            
            UNION
            
            SELECT
              사용_MIDDLE.품목NO AS 품목NO
              ,사용_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재공재고
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
              ,COALESCE(재공_MIDDLE.재공수,0) AS 재공
              ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
              ,0 + COALESCE(재공_MIDDLE.재공수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재공재고
              ,0 + COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) AS 기말재고
            FROM
            (
              SELECT
                [PDUI_ITEM_PK] AS 품목NO
                ,[PDUI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [PDUI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [PDUI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
            ) AS 사용_MIDDLE
            LEFT JOIN
            (
              SELECT
                [ITRC_ITEM_PK] AS 품목NO
                ,[ITRC_CODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
              FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ITRC_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ITRC_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
            ) AS 입고_MIDDLE ON 사용_MIDDLE.품목NO = 입고_MIDDLE.품목NO AND 사용_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드
            LEFT JOIN
            (
              SELECT
                [ISPCI_ITEM_PK] AS 품목NO
                ,[ISPCI_LOTCODE] AS LOT코드
                ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
              WHERE (1=1)
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, [ISPCI_DT], 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [ISPCI_ITEM_PK], [ISPCI_LOTCODE]
            ) AS 재공_MIDDLE ON 재공_MIDDLE.품목NO = 사용_MIDDLE.품목NO AND 재공_MIDDLE.LOT코드 = 사용_MIDDLE.LOT코드

            UNION

            SELECT
              기초재고_MIDDLE.품목NO AS 품목NO
              ,기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) AS 기초재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) AS 기초재고
              ,0 AS 입고
              ,0 AS 재공
              ,0 AS 사용
              ,COALESCE(기초재고_MIDDLE.기초재공재고수,0) + 0 - 0 AS 기말재공재고
              ,COALESCE(기초재고_MIDDLE.기초재고수,0) + 0 - 0 AS 기말재고
            FROM
            (
              SELECT
                기초재고_사용_MIDDLE.품목NO AS 품목NO
                ,기초재고_사용_MIDDLE.LOT코드 AS LOT코드
                ,COALESCE(기초재고_재공_MIDDLE.재공수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재공재고수
                ,COALESCE(기초재고_입고_MIDDLE.입고수,0) - COALESCE(기초재고_사용_MIDDLE.사용수,0) AS 기초재고수
              FROM
              (
                SELECT
                  [PDUI_ITEM_PK] AS 품목NO
                  ,[PDUI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [PDUI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [PDUI_ITEM_PK], [PDUI_LOTCODE]
              ) AS 기초재고_사용_MIDDLE
              LEFT JOIN
              (
                SELECT
                  [ITRC_ITEM_PK] AS 품목NO
                  ,[ITRC_CODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
                FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ITRC_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ITRC_ITEM_PK], [ITRC_CODE]
              ) AS 기초재고_입고_MIDDLE ON 기초재고_사용_MIDDLE.품목NO = 기초재고_입고_MIDDLE.품목NO AND 기초재고_사용_MIDDLE.LOT코드 = 기초재고_입고_MIDDLE.LOT코드
              LEFT JOIN
              (
                SELECT
                  [ISPCI_ITEM_PK] AS 품목NO
                  ,[ISPCI_LOTCODE] AS LOT코드
                  ,SUM(CONVERT(numeric, COALESCE([ISPCI_AMOUNT],0))) AS 재공수
                FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
                WHERE (1=1)
                AND CONVERT(VARCHAR, [ISPCI_DT], 12) < ` +
        req.body.startDate +
        `
                GROUP BY [ISPCI_ITEM_PK],[ISPCI_LOTCODE]
              ) AS 기초재고_재공_MIDDLE ON 기초재고_재공_MIDDLE.품목NO = 기초재고_사용_MIDDLE.품목NO AND 기초재고_재공_MIDDLE.LOT코드 = 기초재고_사용_MIDDLE.LOT코드
            ) AS 기초재고_MIDDLE
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
          ) AS MASTER_ITEM ON MASTER_ITEM.NO = RESULT_MIDDLE.품목NO
          GROUP BY RESULT_MIDDLE.품목NO,RESULT_MIDDLE.LOT코드,MASTER_ITEM.품목구분,MASTER_ITEM.품번,MASTER_ITEM.품명,MASTER_ITEM.규격,MASTER_ITEM.단위
        ) AS RESULT
        WHERE (1=1)
        AND RESULT.품목구분 = '원부자재' OR RESULT.품목구분 = '반제품'
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

// ###################################################################################################################
// ###################################################   불량   ###################################################
// ###################################################################################################################
// 조회
// 조회
router.get("/defect", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [DEFT_PK] AS NO
        ,[DEFT_CODE] AS 코드
        ,[DEFT_DIV] AS 구분
        ,[DEFT_NAME] AS 불량명
        ,[DEFT_CONTENT] AS 내용
        ,[DEFT_NOTE] AS 비고
        ,[DEFT_REGIST_NM] AS 등록자
        ,[DEFT_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
      ORDER BY [DEFT_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/defect", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 불량명 AS 불량명, 내용 AS 내용,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [DEFT_PK] AS NO
            ,[DEFT_CODE] AS 코드
            ,[DEFT_DIV] AS 구분
            ,[DEFT_NAME] AS 불량명
            ,[DEFT_CONTENT] AS 내용
            ,[DEFT_NOTE] AS 비고
            ,[DEFT_REGIST_NM] AS 등록자
            ,[DEFT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 코드 like concat('%',@input,'%')
        OR 불량명 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
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
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 불량명 AS 불량명, 내용 AS 내용,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [DEFT_PK] AS NO
            ,[DEFT_CODE] AS 코드
            ,[DEFT_DIV] AS 구분
            ,[DEFT_NAME] AS 불량명
            ,[DEFT_CONTENT] AS 내용
            ,[DEFT_NOTE] AS 비고
            ,[DEFT_REGIST_NM] AS 등록자
            ,[DEFT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
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

// ###################################################################################################################
// ###################################################   비가동   ###################################################
// ###################################################################################################################
// 조회
// 조회
router.get("/nonwork", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [NOWK_PK] AS NO
        ,[NOWK_CODE] AS 코드
        ,[NOWK_DIV] AS 구분
        ,[NOWK_NAME] AS 비가동명
        ,[NOWK_CONTENT] AS 내용
        ,[NOWK_NOTE] AS 비고
        ,[NOWK_REGIST_NM] AS 등록자
        ,[NOWK_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
      ORDER BY [NOWK_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/nonwork", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 비가동명 AS 비가동명, 내용 AS 내용,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [NOWK_PK] AS NO
            ,[NOWK_CODE] AS 코드
            ,[NOWK_DIV] AS 구분
            ,[NOWK_NAME] AS 비가동명
            ,[NOWK_CONTENT] AS 내용
            ,[NOWK_NOTE] AS 비고
            ,[NOWK_REGIST_NM] AS 등록자
            ,[NOWK_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 코드 like concat('%',@input,'%')
        OR 비가동명 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
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
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 비가동명 AS 비가동명, 내용 AS 내용,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [NOWK_PK] AS NO
            ,[NOWK_CODE] AS 코드
            ,[NOWK_DIV] AS 구분
            ,[NOWK_NAME] AS 비가동명
            ,[NOWK_CONTENT] AS 내용
            ,[NOWK_NOTE] AS 비고
            ,[NOWK_REGIST_NM] AS 등록자
            ,[NOWK_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
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
