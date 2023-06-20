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
// ###################################################   품목   ###################################################
// ###################################################################################################################

router.get("/item", async (req, res) => {
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
      ORDER BY [ITEM_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/item", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 거래처NO AS 거래처NO, 거래처명 AS 거래처명, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명, 차종 AS 차종,
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
          NO AS NO, 거래처NO AS 거래처NO, 거래처명 AS 거래처명, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명, 차종 AS 차종,
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
// ###################################################   금형   ###################################################
// ###################################################################################################################

router.get("/mold", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [MOLD_PK] AS NO
        ,[MOLD_CODE] AS 코드
        ,[MOLD_GETDIV] AS 취득구분
        ,[MOLD_PROCESSDIV] AS 공정구분
        ,[MOLD_NAME] AS 금형명
        ,[MOLD_CLASS] AS 등급
        ,[MOLD_SIZE] AS 규격
        ,[MOLD_PROCESS_PK] AS 공정NO
        ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [MOLD_PROCESS_PK]) AS 공정명
        ,[MOLD_MAKER] AS 제작사
        ,[MOLD_COST] AS 가격
        ,CONVERT(varchar, [MOLD_GETDATE], 23) AS 취득일자
        ,CONVERT(varchar, [MOLD_LIFE], 23) AS 교체수명일
        ,[MOLD_PLACE] AS 보관장소
        ,[MOLD_IMAGE] AS 사진
        ,[MOLD_USE] AS 사용여부
        ,[MOLD_NOTE] AS 비고
        ,[MOLD_REGIST_NM] AS 등록자
        ,[MOLD_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_MOLD_TB]
      ORDER BY [MOLD_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/mold", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 코드 AS 코드, 취득구분 AS 취득구분, 공정구분 AS 공정구분, 금형명 AS 금형명, 등급 AS 등급, 규격 AS 규격,
          공정NO AS 공정NO, 공정명 AS 공정명, 제작사 AS 제작사, 가격 AS 가격, 취득일자 AS 취득일자, 교체수명일 AS 교체수명일,
          보관장소 AS 보관장소, 사진 AS 사진, 사용여부 AS 사용여부, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MOLD_PK] AS NO
            ,[MOLD_CODE] AS 코드
            ,[MOLD_GETDIV] AS 취득구분
            ,[MOLD_PROCESSDIV] AS 공정구분
            ,[MOLD_NAME] AS 금형명
            ,[MOLD_CLASS] AS 등급
            ,[MOLD_SIZE] AS 규격
            ,[MOLD_PROCESS_PK] AS 공정NO
            ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [MOLD_PROCESS_PK]) AS 공정명
            ,[MOLD_MAKER] AS 제작사
            ,[MOLD_COST] AS 가격
            ,CONVERT(varchar, [MOLD_GETDATE], 23) AS 취득일자
            ,CONVERT(varchar, [MOLD_LIFE], 23) AS 교체수명일
            ,[MOLD_PLACE] AS 보관장소
            ,[MOLD_IMAGE] AS 사진
            ,[MOLD_USE] AS 사용여부
            ,[MOLD_NOTE] AS 비고
            ,[MOLD_REGIST_NM] AS 등록자
            ,[MOLD_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_MOLD_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 코드 like concat('%',@input,'%')
        OR 취득구분 like concat('%',@input,'%')
        OR 공정구분 like concat('%',@input,'%')
        OR 금형명 like concat('%',@input,'%')
        OR 등급 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 공정명 like concat('%',@input,'%')
        OR 제작사 like concat('%',@input,'%')
        OR 가격 like concat('%',@input,'%')
        OR 취득일자 like concat('%',@input,'%')
        OR 교체수명일 like concat('%',@input,'%')
        OR 보관장소 like concat('%',@input,'%')
        OR 사용여부 like concat('%',@input,'%')
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
          NO AS NO, 코드 AS 코드, 취득구분 AS 취득구분, 공정구분 AS 공정구분, 금형명 AS 금형명, 등급 AS 등급, 규격 AS 규격,
          공정NO AS 공정NO, 공정명 AS 공정명, 제작사 AS 제작사, 가격 AS 가격, 취득일자 AS 취득일자, 교체수명일 AS 교체수명일,
          보관장소 AS 보관장소, 사진 AS 사진, 사용여부 AS 사용여부, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MOLD_PK] AS NO
            ,[MOLD_CODE] AS 코드
            ,[MOLD_GETDIV] AS 취득구분
            ,[MOLD_PROCESSDIV] AS 공정구분
            ,[MOLD_NAME] AS 금형명
            ,[MOLD_CLASS] AS 등급
            ,[MOLD_SIZE] AS 규격
            ,[MOLD_PROCESS_PK] AS 공정NO
            ,(SELECT [PRCS_NAME] FROM [QMES2022].[dbo].[MASTER_PROCESS_TB] WHERE [PRCS_PK] = [MOLD_PROCESS_PK]) AS 공정명
            ,[MOLD_MAKER] AS 제작사
            ,[MOLD_COST] AS 가격
            ,CONVERT(varchar, [MOLD_GETDATE], 23) AS 취득일자
            ,CONVERT(varchar, [MOLD_LIFE], 23) AS 교체수명일
            ,[MOLD_PLACE] AS 보관장소
            ,[MOLD_IMAGE] AS 사진
            ,[MOLD_USE] AS 사용여부
            ,[MOLD_NOTE] AS 비고
            ,[MOLD_REGIST_NM] AS 등록자
            ,[MOLD_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_MOLD_TB]
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
// ###################################################   금형점검   ###################################################
// ###################################################################################################################

router.get("/moldinspect", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [MDIP_PK] AS NO
        ,[MDIP_MOLD_PK] AS 금형NO
        ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형코드
        ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형명
        ,[MDIP_DIV] AS 구분
        ,[MDIP_CONTENT] AS 내용
        ,[MDIP_HOW] AS 검사방법
        ,[MDIP_STAND] AS 기준
        ,[MDIP_UNIT] AS 단위
        ,[MDIP_MIN] AS 최소
        ,[MDIP_MAX] AS 최대
        ,[MDIP_USER_ID] AS 담당자ID
        ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
        ,[MDIP_NOTE] AS 비고
        ,[MDIP_REGIST_NM] AS 등록자
        ,[MDIP_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
      ORDER BY [MDIP_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/moldinspect", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 금형NO AS 금형NO, 금형코드 AS 금형코드, 금형명 AS 금형명, 구분 AS 구분, 내용 AS 내용, 검사방법 AS 검사방법,
          기준 AS 기준, 단위 AS 단위, 최소 AS 최소, 최대 AS 최대, 담당자ID AS 담당자ID, 담당자 AS 담당자,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDIP_PK] AS NO
            ,[MDIP_MOLD_PK] AS 금형NO
            ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형코드
            ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형명
            ,[MDIP_DIV] AS 구분
            ,[MDIP_CONTENT] AS 내용
            ,[MDIP_HOW] AS 검사방법
            ,[MDIP_STAND] AS 기준
            ,[MDIP_UNIT] AS 단위
            ,[MDIP_MIN] AS 최소
            ,[MDIP_MAX] AS 최대
            ,[MDIP_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
            ,[MDIP_NOTE] AS 비고
            ,[MDIP_REGIST_NM] AS 등록자
            ,[MDIP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
        ) AS RESULT
        WHERE (1=1)
        AND ( 구분 like concat('%',@input,'%')
        OR 내용 like concat('%',@input,'%')
        OR 검사방법 like concat('%',@input,'%')
        OR 기준 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 최소 like concat('%',@input,'%')
        OR 최대 like concat('%',@input,'%')
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
          NO AS NO, 금형NO AS 금형NO, 금형코드 AS 금형코드, 금형명 AS 금형명, 구분 AS 구분, 내용 AS 내용, 검사방법 AS 검사방법,
          기준 AS 기준, 단위 AS 단위, 최소 AS 최소, 최대 AS 최대, 담당자ID AS 담당자ID, 담당자 AS 담당자,
          비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDIP_PK] AS NO
            ,[MDIP_MOLD_PK] AS 금형NO
            ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형코드
            ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDIP_MOLD_PK]) AS 금형명
            ,[MDIP_DIV] AS 구분
            ,[MDIP_CONTENT] AS 내용
            ,[MDIP_HOW] AS 검사방법
            ,[MDIP_STAND] AS 기준
            ,[MDIP_UNIT] AS 단위
            ,[MDIP_MIN] AS 최소
            ,[MDIP_MAX] AS 최대
            ,[MDIP_USER_ID] AS 담당자ID
            ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [MDIP_USER_ID]) AS 담당자
            ,[MDIP_NOTE] AS 비고
            ,[MDIP_REGIST_NM] AS 등록자
            ,[MDIP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_MOLD_INSPECT_TB]
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

module.exports = router;
