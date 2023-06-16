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

// ###################################################################################################################
// ###################################################   설비   ###################################################
// ###################################################################################################################

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
// ###################################################   설비부품   ###################################################
// ###################################################################################################################

router.get("/facilitypart", async (req, res) => {
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

router.post("/facilitypart", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 거래처NO AS 거래처NO, 설비NO AS 설비NO, 설비명 AS 설비명, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명,
          차종 AS 차종, 규격 AS 규격, 단위 AS 단위, 안전재고 AS 안전재고, 단가 AS 단가, 비고 AS 비고,
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
          NO AS NO, 거래처NO AS 거래처NO, 설비NO AS 설비NO, 설비명 AS 설비명, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명,
          차종 AS 차종, 규격 AS 규격, 단위 AS 단위, 안전재고 AS 안전재고, 단가 AS 단가, 비고 AS 비고,
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
// ###################################################   비가동   ###################################################
// ###################################################################################################################

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
