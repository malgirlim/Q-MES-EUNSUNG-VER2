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
// ###################################################   품목(원부자재)   ###################################################
// ###################################################################################################################

router.get("/itemraw", async (req, res) => {
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
      WHERE [ITEM_DIV] = '원부자재'
      ORDER BY [ITEM_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/itemraw", async (req, res) => {
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
          WHERE [ITEM_DIV] = '원부자재'
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
          WHERE [ITEM_DIV] = '원부자재'
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
        ,[FCPT_NOTE] AS 비고
        ,[FCPT_REGIST_NM] AS 등록자
        ,[FCPT_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
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
            ,[FCPT_NOTE] AS 비고
            ,[FCPT_REGIST_NM] AS 등록자
            ,[FCPT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
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
            ,[FCPT_NOTE] AS 비고
            ,[FCPT_REGIST_NM] AS 등록자
            ,[FCPT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
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
// ###################################################   설비부품재고   ###################################################
// ###################################################################################################################

router.get("/fcltpart/stock/lot", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        NO AS 설비부품NO
        ,LOT코드 AS LOT코드
        ,품번 AS 품번
        ,설비명 AS 설비명
        ,부품구분 AS 부품구분
        ,품명 AS 품명
        ,규격 AS 규격
        ,단위 AS 단위
        ,기초재고 AS 기초재고
        ,입고 AS 입고
        ,출고 AS 출고
        ,기말재고 AS 기말재고
      FROM
      (
        SELECT
          RESULT_MIDDLE.설비부품NO AS NO
          ,RESULT_MIDDLE.LOT코드 AS LOT코드
          ,FACILITY_PART.품번 AS 품번
          ,FACILITY_PART.설비명 AS 설비명
          ,FACILITY_PART.부품구분 AS 부품구분
          ,FACILITY_PART.품명 AS 품명
          ,FACILITY_PART.규격 AS 규격
          ,FACILITY_PART.단위 AS 단위
          ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
          ,SUM(RESULT_MIDDLE.입고수량) AS 입고
          ,SUM(RESULT_MIDDLE.출고수량) AS 출고
          ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
        FROM
        (
          SELECT
            입고_MIDDLE.설비부품NO AS 설비부품NO
            ,입고_MIDDLE.LOT코드 AS LOT코드
            ,0 AS 기초재고
            ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
            ,COALESCE(출고_MIDDLE.출고수량,0) AS 출고수량
            ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출고_MIDDLE.출고수량,0) AS 기말재고
          FROM
          (
            SELECT
              [FPRC_FACILITY_PART_PK] AS 설비부품NO
              ,[FPRC_CODE] AS LOT코드
              ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
            FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) >= '000101'
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) <= '990101'
            GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
          ) AS 입고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [FPRL_FACILITY_PART_PK] AS 설비부품NO
              ,[FPRL_CODE] AS LOT코드
              ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
            FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) >= '000101'
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) <= '990101'
            GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
          ) AS 출고_MIDDLE ON 출고_MIDDLE.설비부품NO = 입고_MIDDLE.설비부품NO AND 출고_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

          UNION

          SELECT
            입고_기초재고_MIDDLE.설비부품NO AS 설비부품NO
            ,입고_기초재고_MIDDLE.LOT코드 AS LOT코드
            ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기초재고
            ,0 AS 입고수량
            ,0 AS 출고수량
            ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기말재고
          FROM
          (
            SELECT
              [FPRC_FACILITY_PART_PK] AS 설비부품NO
              ,[FPRC_CODE] AS LOT코드
              ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
            FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) < '000101'
            GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
          ) AS 입고_기초재고_MIDDLE
          LEFT JOIN
          (
            SELECT
              [FPRL_FACILITY_PART_PK] AS 설비부품NO
              ,[FPRL_CODE] AS LOT코드
              ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
            FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
            WHERE (1 = 1)
            AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) < '000101'
            GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
          ) AS 출고_기초재고_MIDDLE ON 출고_기초재고_MIDDLE.설비부품NO = 입고_기초재고_MIDDLE.설비부품NO AND 출고_기초재고_MIDDLE.LOT코드 = 입고_기초재고_MIDDLE.LOT코드
        ) AS RESULT_MIDDLE
        LEFT JOIN
        (
          SELECT
            [FCPT_PK] AS NO
            ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
            ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
            ,[FCPT_DIV] AS 부품구분
            ,[FCPT_PRODUCT_NUM] AS 품번
            ,[FCPT_NAME] AS 품명
            ,[FCPT_CAR] AS 차종
            ,[FCPT_SIZE] AS 규격
            ,[FCPT_UNIT] AS 단위
            ,[FCPT_SAFE] AS 안전재고
            ,[FCPT_COST] AS 단가
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
        ) AS FACILITY_PART ON FACILITY_PART.NO = RESULT_MIDDLE.설비부품NO
        GROUP BY RESULT_MIDDLE.설비부품NO,RESULT_MIDDLE.LOT코드,FACILITY_PART.품번,FACILITY_PART.설비명,FACILITY_PART.부품구분,FACILITY_PART.품명,FACILITY_PART.규격,FACILITY_PART.단위
      ) AS RESULT
      ORDER BY LOT코드 DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/fcltpart/stock/lot", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS 설비부품NO
          ,LOT코드 AS LOT코드
          ,품번 AS 품번
          ,설비명 AS 설비명
          ,부품구분 AS 부품구분
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,출고 AS 출고
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            RESULT_MIDDLE.설비부품NO AS NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,FACILITY_PART.품번 AS 품번
            ,FACILITY_PART.설비명 AS 설비명
            ,FACILITY_PART.부품구분 AS 부품구분
            ,FACILITY_PART.품명 AS 품명
            ,FACILITY_PART.규격 AS 규격
            ,FACILITY_PART.단위 AS 단위
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고수량) AS 입고
            ,SUM(RESULT_MIDDLE.출고수량) AS 출고
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
          FROM
          (
            SELECT
              입고_MIDDLE.설비부품NO AS 설비부품NO
              ,입고_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
              ,COALESCE(출고_MIDDLE.출고수량,0) AS 출고수량
              ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출고_MIDDLE.출고수량,0) AS 기말재고
            FROM
            (
              SELECT
                [FPRC_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRC_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [FPRL_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRL_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
            ) AS 출고_MIDDLE ON 출고_MIDDLE.설비부품NO = 입고_MIDDLE.설비부품NO AND 출고_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

            UNION

            SELECT
              입고_기초재고_MIDDLE.설비부품NO AS 설비부품NO
              ,입고_기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기초재고
              ,0 AS 입고수량
              ,0 AS 출고수량
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기말재고
            FROM
            (
              SELECT
                [FPRC_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRC_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
            ) AS 입고_기초재고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [FPRL_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRL_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
            ) AS 출고_기초재고_MIDDLE ON 출고_기초재고_MIDDLE.설비부품NO = 입고_기초재고_MIDDLE.설비부품NO AND 출고_기초재고_MIDDLE.LOT코드 = 입고_기초재고_MIDDLE.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [FCPT_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
              ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
              ,[FCPT_DIV] AS 부품구분
              ,[FCPT_PRODUCT_NUM] AS 품번
              ,[FCPT_NAME] AS 품명
              ,[FCPT_CAR] AS 차종
              ,[FCPT_SIZE] AS 규격
              ,[FCPT_UNIT] AS 단위
              ,[FCPT_SAFE] AS 안전재고
              ,[FCPT_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          ) AS FACILITY_PART ON FACILITY_PART.NO = RESULT_MIDDLE.설비부품NO
          GROUP BY RESULT_MIDDLE.설비부품NO,RESULT_MIDDLE.LOT코드,FACILITY_PART.품번,FACILITY_PART.설비명,FACILITY_PART.부품구분,FACILITY_PART.품명,FACILITY_PART.규격,FACILITY_PART.단위
        ) AS RESULT
        WHERE (1=1)
        AND ( LOT코드 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 설비명 like concat('%',@input,'%')
        OR 부품구분 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 기초재고 like concat('%',@input,'%')
        OR 입고 like concat('%',@input,'%')
        OR 출고 like concat('%',@input,'%')
        OR 기말재고 like concat('%',@input,'%'))
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
          NO AS 설비부품NO
          ,LOT코드 AS LOT코드
          ,품번 AS 품번
          ,설비명 AS 설비명
          ,부품구분 AS 부품구분
          ,품명 AS 품명
          ,규격 AS 규격
          ,단위 AS 단위
          ,기초재고 AS 기초재고
          ,입고 AS 입고
          ,출고 AS 출고
          ,기말재고 AS 기말재고
        FROM
        (
          SELECT
            RESULT_MIDDLE.설비부품NO AS NO
            ,RESULT_MIDDLE.LOT코드 AS LOT코드
            ,FACILITY_PART.품번 AS 품번
            ,FACILITY_PART.설비명 AS 설비명
            ,FACILITY_PART.부품구분 AS 부품구분
            ,FACILITY_PART.품명 AS 품명
            ,FACILITY_PART.규격 AS 규격
            ,FACILITY_PART.단위 AS 단위
            ,SUM(RESULT_MIDDLE.기초재고) AS 기초재고
            ,SUM(RESULT_MIDDLE.입고수량) AS 입고
            ,SUM(RESULT_MIDDLE.출고수량) AS 출고
            ,SUM(RESULT_MIDDLE.기말재고) AS 기말재고
          FROM
          (
            SELECT
              입고_MIDDLE.설비부품NO AS 설비부품NO
              ,입고_MIDDLE.LOT코드 AS LOT코드
              ,0 AS 기초재고
              ,COALESCE(입고_MIDDLE.입고수량,0) AS 입고수량
              ,COALESCE(출고_MIDDLE.출고수량,0) AS 출고수량
              ,COALESCE(입고_MIDDLE.입고수량,0) - COALESCE(출고_MIDDLE.출고수량,0) AS 기말재고
            FROM
            (
              SELECT
                [FPRC_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRC_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
            ) AS 입고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [FPRL_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRL_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) >= ` +
        req.body.startDate +
        `
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) <= ` +
        req.body.endDate +
        `
              GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
            ) AS 출고_MIDDLE ON 출고_MIDDLE.설비부품NO = 입고_MIDDLE.설비부품NO AND 출고_MIDDLE.LOT코드 = 입고_MIDDLE.LOT코드

            UNION

            SELECT
              입고_기초재고_MIDDLE.설비부품NO AS 설비부품NO
              ,입고_기초재고_MIDDLE.LOT코드 AS LOT코드
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기초재고
              ,0 AS 입고수량
              ,0 AS 출고수량
              ,COALESCE(입고_기초재고_MIDDLE.입고수량,0) - COALESCE(출고_기초재고_MIDDLE.출고수량,0) AS 기말재고
            FROM
            (
              SELECT
                [FPRC_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRC_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRC_AMOUNT])),0) AS 입고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RECEIVE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRC_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [FPRC_FACILITY_PART_PK], [FPRC_CODE]
            ) AS 입고_기초재고_MIDDLE
            LEFT JOIN
            (
              SELECT
                [FPRL_FACILITY_PART_PK] AS 설비부품NO
                ,[FPRL_CODE] AS LOT코드
                ,COALESCE(SUM(CONVERT(numeric, [FPRL_AMOUNT])),0) AS 출고수량
              FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_RELEASE_TB]
              WHERE (1 = 1)
              AND CONVERT(VARCHAR, CONVERT(datetime, [FPRL_DT]), 12) < ` +
        req.body.startDate +
        `
              GROUP BY [FPRL_FACILITY_PART_PK], [FPRL_CODE]
            ) AS 출고_기초재고_MIDDLE ON 출고_기초재고_MIDDLE.설비부품NO = 입고_기초재고_MIDDLE.설비부품NO AND 출고_기초재고_MIDDLE.LOT코드 = 입고_기초재고_MIDDLE.LOT코드
          ) AS RESULT_MIDDLE
          LEFT JOIN
          (
            SELECT
              [FCPT_PK] AS NO
              ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [FCPT_CLIENT_PK]) AS 거래처명
              ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FCPT_FACILITY_PK]) AS 설비명
              ,[FCPT_DIV] AS 부품구분
              ,[FCPT_PRODUCT_NUM] AS 품번
              ,[FCPT_NAME] AS 품명
              ,[FCPT_CAR] AS 차종
              ,[FCPT_SIZE] AS 규격
              ,[FCPT_UNIT] AS 단위
              ,[FCPT_SAFE] AS 안전재고
              ,[FCPT_COST] AS 단가
            FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          ) AS FACILITY_PART ON FACILITY_PART.NO = RESULT_MIDDLE.설비부품NO
          GROUP BY RESULT_MIDDLE.설비부품NO,RESULT_MIDDLE.LOT코드,FACILITY_PART.품번,FACILITY_PART.설비명,FACILITY_PART.부품구분,FACILITY_PART.품명,FACILITY_PART.규격,FACILITY_PART.단위
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
