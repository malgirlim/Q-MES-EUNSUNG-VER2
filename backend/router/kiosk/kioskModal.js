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
// ###################################################   담당자   ###################################################
// ###################################################################################################################

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
        [USER_AUTH] AS 권한,
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
          부서명 AS 부서명, 직책 AS 직책, 직급 AS 직급, 권한 AS 권한, 등록자 AS 등록자, 등록일시 AS 등록일시
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
          [USER_AUTH] AS 권한,
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
        OR 직급 like concat('%',@input,'%')
        OR 권한 like concat('%',@input,'%'))
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
          부서명 AS 부서명, 직책 AS 직책, 직급 AS 직급, 권한 AS 권한, 등록자 AS 등록자, 등록일시 AS 등록일시
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
          [USER_AUTH] AS 권한,
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
// ###################################################   불량   ###################################################
// ###################################################################################################################

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

// ###################################################################################################################
// ###################################################   비가동   ###################################################
// ###################################################################################################################

// 비가동
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

// ###################################################################################################################
// ###################################################   키오스크 작업현황   ###################################################
// ###################################################################################################################
// 조회
router.get("/kioskwork", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [KSKWK_PK] AS NO
        ,[KSKWK_USER_ID] AS 작업자ID
        ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [KSKWK_USER_ID]) AS 작업자
        ,[KSKWK_INST_PROCESS_PK] AS 지시공정NO
        ,INST_PROCESS.작업코드 AS 작업코드
        ,INST_PROCESS.품목구분 AS 품목구분
        ,INST_PROCESS.품번 AS 품번
        ,INST_PROCESS.품명 AS 품명
        ,INST_PROCESS.규격 AS 규격
        ,INST_PROCESS.단위 AS 단위
        ,INST_PROCESS.지시수량 AS 지시수량
        ,INST_PROCESS.생산양품수량 AS 완료수량
        ,INST_PROCESS.시작일 AS 시작일
        ,INST_PROCESS.공정명 AS 공정명
        ,INST_PROCESS.설비NO AS 설비NO
        ,INST_PROCESS.설비명 AS 설비명
        ,INST_PROCESS.진행상황 AS 진행상황
        ,CONVERT(VARCHAR, [KSKWK_START_DT], 20) AS 시작일시
        ,[KSKWK_PRODUCE_AMT] AS 생산수
        ,(SELECT COALESCE(SUM([KSKDF_AMOUNT]*1),0) FROM [QMES2022].[dbo].[KIOSK_DEFECT_TB] WHERE [KSKDF_WORK_PK] = [KSKWK_PK]) AS 불량수
        ,(SELECT COALESCE(SUM(DATEDIFF(second,CONVERT(VARCHAR, [KSKNW_START_DT], 20),CONVERT(VARCHAR, [KSKNW_END_DT], 20))),0)
          FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB] WHERE [KSKNW_WORK_PK] = [KSKWK_PK]) AS 비가동시간
        ,[KSKWK_REPORT] AS 특이사항
        ,[KSKWK_STATUS] AS 설비현황
        ,[KSKWK_NOTE] AS 비고
        ,[KSKWK_REGIST_NM] AS 등록자
        ,CONVERT(VARCHAR, [KSKWK_REGIST_DT], 20) AS 등록일시
      FROM [QMES2022].[dbo].[KIOSK_WORK_TB]
      LEFT JOIN
      (
        SELECT
          [ISPC_PK] AS NO
          ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
          ,WORK_INSTRUCT.코드 AS 작업코드
          ,[ISPC_ITEM_PK] AS 품목NO
          ,ITEM.구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,ITEM.규격 AS 규격
          ,ITEM.단위 AS 단위
          ,[ISPC_AMOUNT] AS 지시수량
          ,COALESCE((SELECT SUM(CONVERT(numeric,COALESCE([PDRS_PRODUCE_AMT],0))) - COALESCE(SUM(PDDF.불량수),0)
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
            LEFT JOIN
            (SELECT [PDDF_PRODUCE_RESULT_PK], SUM(CONVERT(numeric,COALESCE([PDDF_AMOUNT],0))) AS 불량수
            FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
            GROUP BY [PDDF_PRODUCE_RESULT_PK]
            ) AS PDDF ON PDDF.[PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]
            WHERE [PDRS_INST_PROCESS_PK] = [ISPC_PK]),0) AS 생산양품수량
          ,WORK_INSTRUCT.시작일 AS 시작일
          ,[ISPC_PROCESS_PK] AS 공정NO
          ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
          ,[ISPC_FACILITY_PK] AS 설비NO
          ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [ISPC_FACILITY_PK]) AS 설비명
          ,[ISPC_CONDITION] AS 진행상황
        FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
        LEFT JOIN
        (
          SELECT
            [WKIS_PK] AS NO
            ,[WKIS_CODE] AS 코드
            ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
          FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
        ) AS WORK_INSTRUCT ON WORK_INSTRUCT.NO = [ISPC_WORK_INSTRUCT_PK]
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
      ) AS INST_PROCESS ON INST_PROCESS.NO = [KSKWK_INST_PROCESS_PK]
      ORDER BY [KSKWK_PK] DESC
    `);

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

router.post("/kioskwork", async (req, res) => {
  try {
    var sql = "";
    sql = `
        SELECT
          NO AS NO, 작업자ID AS 작업자ID, 작업자 AS 작업자, 지시공정NO AS 지시공정NO, 작업코드 AS 작업코드, 품목구분 AS 품목구분,
          품번 AS 품번, 품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 지시수량 AS 지시수량, 완료수량 AS 완료수량, 시작일 AS 시작일,
          공정명 AS 공정명, 설비NO AS 설비NO, 설비명 AS 설비명, 작업자ID AS 작업자ID, 작업자 AS 작업자, 진행상황 AS 진행상황, 시작일시 AS 시작일시,
          생산수 AS 생산수, 불량수 AS 불량수, 비가동시간 AS 비가동시간, 특이사항 AS 특이사항, 설비현황 AS 설비현황, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [KSKWK_PK] AS NO
            ,[KSKWK_USER_ID] AS 작업자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [KSKWK_USER_ID]) AS 작업자
            ,[KSKWK_INST_PROCESS_PK] AS 지시공정NO
            ,INST_PROCESS.작업코드 AS 작업코드
            ,INST_PROCESS.품목구분 AS 품목구분
            ,INST_PROCESS.품번 AS 품번
            ,INST_PROCESS.품명 AS 품명
            ,INST_PROCESS.규격 AS 규격
            ,INST_PROCESS.단위 AS 단위
            ,INST_PROCESS.지시수량 AS 지시수량
            ,INST_PROCESS.생산양품수량 AS 완료수량
            ,INST_PROCESS.시작일 AS 시작일
            ,INST_PROCESS.공정명 AS 공정명
            ,INST_PROCESS.설비NO AS 설비NO
            ,INST_PROCESS.설비명 AS 설비명
            ,INST_PROCESS.진행상황 AS 진행상황
            ,CONVERT(VARCHAR, [KSKWK_START_DT], 20) AS 시작일시
            ,[KSKWK_PRODUCE_AMT] AS 생산수
            ,(SELECT COALESCE(SUM([KSKDF_AMOUNT]*1),0) FROM [QMES2022].[dbo].[KIOSK_DEFECT_TB] WHERE [KSKDF_WORK_PK] = [KSKWK_PK]) AS 불량수
            ,(SELECT COALESCE(SUM(DATEDIFF(second,CONVERT(VARCHAR, [KSKNW_START_DT], 20),CONVERT(VARCHAR, [KSKNW_END_DT], 20))),0)
              FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB] WHERE [KSKNW_WORK_PK] = [KSKWK_PK]) AS 비가동시간
            ,[KSKWK_REPORT] AS 특이사항
            ,[KSKWK_STATUS] AS 설비현황
            ,[KSKWK_NOTE] AS 비고
            ,[KSKWK_REGIST_NM] AS 등록자
            ,CONVERT(VARCHAR, [KSKWK_REGIST_DT], 20) AS 등록일시
          FROM [QMES2022].[dbo].[KIOSK_WORK_TB]
          LEFT JOIN
          (
            SELECT
              [ISPC_PK] AS NO
              ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
              ,WORK_INSTRUCT.코드 AS 작업코드
              ,[ISPC_ITEM_PK] AS 품목NO
              ,ITEM.구분 AS 품목구분
              ,ITEM.품번 AS 품번
              ,ITEM.품명 AS 품명
              ,ITEM.규격 AS 규격
              ,ITEM.단위 AS 단위
              ,[ISPC_AMOUNT] AS 지시수량
              ,COALESCE((SELECT SUM(CONVERT(numeric,COALESCE([PDRS_PRODUCE_AMT],0))) - COALESCE(SUM(PDDF.불량수),0)
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
                LEFT JOIN
                (SELECT [PDDF_PRODUCE_RESULT_PK], SUM(CONVERT(numeric,COALESCE([PDDF_AMOUNT],0))) AS 불량수
                FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
                GROUP BY [PDDF_PRODUCE_RESULT_PK]
                ) AS PDDF ON PDDF.[PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]
                WHERE [PDRS_INST_PROCESS_PK] = [ISPC_PK]),0) AS 생산양품수량
              ,WORK_INSTRUCT.시작일 AS 시작일
              ,[ISPC_PROCESS_PK] AS 공정NO
              ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [ISPC_PROCESS_PK]) AS 공정명
              ,[ISPC_FACILITY_PK] AS 설비NO
              ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [ISPC_FACILITY_PK]) AS 설비명
              ,[ISPC_CONDITION] AS 진행상황
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
            LEFT JOIN
            (
              SELECT
                [WKIS_PK] AS NO
                ,[WKIS_CODE] AS 코드
                ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
              FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
            ) AS WORK_INSTRUCT ON WORK_INSTRUCT.NO = [ISPC_WORK_INSTRUCT_PK]
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
          ) AS INST_PROCESS ON INST_PROCESS.NO = [KSKWK_INST_PROCESS_PK]
        ) AS RESULT
        WHERE (1=1)
        AND NO = @input
      `;

    const Pool = await pool;
    const result = await Pool.request()
      .input("input", req.body.searchInput)
      .query(sql);

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

// ###################################################################################################################
// ###################################################   키오스크 불량   ###################################################
// ###################################################################################################################

// 조회
router.get("/kioskdefect", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [KSKDF_PK] AS NO
        ,[KSKDF_WORK_PK] AS 작업NO
        ,[KSKDF_DEFECT_PK] AS 불량NO
        ,DEFECT.코드 AS 불량코드
        ,DEFECT.구분 AS 구분
        ,DEFECT.불량명 AS 불량명
        ,DEFECT.내용 AS 내용
        ,[KSKDF_AMOUNT] AS 수량
        ,[KSKDF_NOTE] AS 비고
        ,[KSKDF_REGIST_NM] AS 등록자
        ,[KSKDF_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[KIOSK_DEFECT_TB]
      LEFT JOIN
      (
        SELECT
          [DEFT_PK] AS NO
          ,[DEFT_CODE] AS 코드
          ,[DEFT_DIV] AS 구분
          ,[DEFT_NAME] AS 불량명
          ,[DEFT_CONTENT] AS 내용
        FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
      ) AS DEFECT ON DEFECT.NO = [KSKDF_DEFECT_PK]
      ORDER BY [KSKDF_PK] DESC
    `);

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

router.post("/kioskdefect", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 작업NO AS 작업NO, 불량NO AS 불량NO, 불량코드 AS 불량코드, 구분 AS 구분, 불량명 AS 불량명, 내용 AS 내용,
          수량 AS 수량, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [KSKDF_PK] AS NO
            ,[KSKDF_WORK_PK] AS 작업NO
            ,[KSKDF_DEFECT_PK] AS 불량NO
            ,DEFECT.코드 AS 불량코드
            ,DEFECT.구분 AS 구분
            ,DEFECT.불량명 AS 불량명
            ,DEFECT.내용 AS 내용
            ,[KSKDF_AMOUNT] AS 수량
            ,[KSKDF_NOTE] AS 비고
            ,[KSKDF_REGIST_NM] AS 등록자
            ,[KSKDF_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[KIOSK_DEFECT_TB]
          LEFT JOIN
          (
            SELECT
              [DEFT_PK] AS NO
              ,[DEFT_CODE] AS 코드
              ,[DEFT_DIV] AS 구분
              ,[DEFT_NAME] AS 불량명
              ,[DEFT_CONTENT] AS 내용
            FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
          ) AS DEFECT ON DEFECT.NO = [KSKDF_DEFECT_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 불량코드 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 불량명 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
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
          NO AS NO, 작업NO AS 작업NO, 불량NO AS 불량NO, 불량코드 AS 불량코드, 구분 AS 구분, 불량명 AS 불량명, 내용 AS 내용,
          수량 AS 수량, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [KSKDF_PK] AS NO
            ,[KSKDF_WORK_PK] AS 작업NO
            ,[KSKDF_DEFECT_PK] AS 불량NO
            ,DEFECT.코드 AS 불량코드
            ,DEFECT.구분 AS 구분
            ,DEFECT.불량명 AS 불량명
            ,DEFECT.내용 AS 내용
            ,[KSKDF_AMOUNT] AS 수량
            ,[KSKDF_NOTE] AS 비고
            ,[KSKDF_REGIST_NM] AS 등록자
            ,[KSKDF_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[KIOSK_DEFECT_TB]
          LEFT JOIN
          (
            SELECT
              [DEFT_PK] AS NO
              ,[DEFT_CODE] AS 코드
              ,[DEFT_DIV] AS 구분
              ,[DEFT_NAME] AS 불량명
              ,[DEFT_CONTENT] AS 내용
            FROM [QMES2022].[dbo].[MASTER_DEFECT_TB]
          ) AS DEFECT ON DEFECT.NO = [KSKDF_DEFECT_PK]
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

// ###################################################################################################################
// ###################################################   키오스크 비가동   ############################################
// ###################################################################################################################

// 조회
router.get("/kiosknonwork", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [KSKNW_PK] AS NO
        ,[KSKNW_WORK_PK] AS 작업NO
        ,[KSKNW_NONWORK_PK] AS 비가동NO
        ,NONWORK.코드 AS 비가동코드
        ,NONWORK.구분 AS 구분
        ,NONWORK.비가동명 AS 비가동명
        ,NONWORK.내용 AS 내용
        ,CONVERT(VARCHAR, [KSKNW_START_DT], 20) AS 시작일시
        ,CONVERT(VARCHAR, [KSKNW_END_DT], 20) AS 종료일시
        ,[KSKNW_NOTE] AS 비고
        ,[KSKNW_REGIST_NM] AS 등록자
        ,[KSKNW_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB]
      LEFT JOIN
      (
        SELECT
          [NOWK_PK] AS NO
          ,[NOWK_CODE] AS 코드
          ,[NOWK_DIV] AS 구분
          ,[NOWK_NAME] AS 비가동명
          ,[NOWK_CONTENT] AS 내용
        FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
      ) AS NONWORK ON NONWORK.NO = [KSKNW_NONWORK_PK]
      ORDER BY [KSKNW_PK] DESC
    `);

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

router.post("/kiosknonwork", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 작업NO AS 작업NO, 비가동NO AS 비가동NO, 비가동코드 AS 비가동코드, 구분 AS 구분, 비가동명 AS 비가동명,
          내용 AS 내용, 시작일시 AS 시작일시, 종료일시 AS 종료일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [KSKNW_PK] AS NO
            ,[KSKNW_WORK_PK] AS 작업NO
            ,[KSKNW_NONWORK_PK] AS 비가동NO
            ,NONWORK.코드 AS 비가동코드
            ,NONWORK.구분 AS 구분
            ,NONWORK.비가동명 AS 비가동명
            ,NONWORK.내용 AS 내용
            ,CONVERT(VARCHAR, [KSKNW_START_DT], 20) AS 시작일시
            ,CONVERT(VARCHAR, [KSKNW_END_DT], 20) AS 종료일시
            ,[KSKNW_NOTE] AS 비고
            ,[KSKNW_REGIST_NM] AS 등록자
            ,[KSKNW_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB]
          LEFT JOIN
          (
            SELECT
              [NOWK_PK] AS NO
              ,[NOWK_CODE] AS 코드
              ,[NOWK_DIV] AS 구분
              ,[NOWK_NAME] AS 비가동명
              ,[NOWK_CONTENT] AS 내용
            FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
          ) AS NONWORK ON NONWORK.NO = [KSKNW_NONWORK_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 비가동코드 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 비가동명 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
        OR 시작일시 like concat('%',@input,'%')
        OR 종료일시 like concat('%',@input,'%')
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
          NO AS NO, 작업NO AS 작업NO, 비가동NO AS 비가동NO, 비가동코드 AS 비가동코드, 구분 AS 구분, 비가동명 AS 비가동명,
          내용 AS 내용, 시작일시 AS 시작일시, 종료일시 AS 종료일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [KSKNW_PK] AS NO
            ,[KSKNW_WORK_PK] AS 작업NO
            ,[KSKNW_NONWORK_PK] AS 비가동NO
            ,NONWORK.코드 AS 비가동코드
            ,NONWORK.구분 AS 구분
            ,NONWORK.비가동명 AS 비가동명
            ,NONWORK.내용 AS 내용
            ,CONVERT(VARCHAR, [KSKNW_START_DT], 20) AS 시작일시
            ,CONVERT(VARCHAR, [KSKNW_END_DT], 20) AS 종료일시
            ,[KSKNW_NOTE] AS 비고
            ,[KSKNW_REGIST_NM] AS 등록자
            ,[KSKNW_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB]
          LEFT JOIN
          (
            SELECT
              [NOWK_PK] AS NO
              ,[NOWK_CODE] AS 코드
              ,[NOWK_DIV] AS 구분
              ,[NOWK_NAME] AS 비가동명
              ,[NOWK_CONTENT] AS 내용
            FROM [QMES2022].[dbo].[MASTER_NONWORK_TB]
          ) AS NONWORK ON NONWORK.NO = [KSKNW_NONWORK_PK]
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

module.exports = router;
