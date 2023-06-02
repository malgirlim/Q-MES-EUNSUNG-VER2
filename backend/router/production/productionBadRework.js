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
    .input("menu", "생산관리_불량재작업관리") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [MDUS_PK] AS NO
        ,[MDUS_MOLD_PK] AS 금형NO
        ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDUS_MOLD_PK]) AS 금형코드
        ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDUS_MOLD_PK]) AS 금형명
        ,[MDUS_PRODUCE_RESULT_PK] AS 생산실적NO
        ,PRODUCE_RESULT.작업코드 AS 작업코드
        ,PRODUCE_RESULT.품번 AS 품번
        ,PRODUCE_RESULT.품목구분 AS 품목구분
        ,PRODUCE_RESULT.품명 AS 품명
        ,PRODUCE_RESULT.규격 AS 규격
        ,PRODUCE_RESULT.단위 AS 단위
        ,PRODUCE_RESULT.생산수 AS 생산수
        ,PRODUCE_RESULT.불량수 AS 불량수
        ,[MDUS_COUNT] AS 사용횟수
        ,CONVERT(VARCHAR, [MDUS_DATE], 23) AS 사용일자
        ,[MDUS_NOTE] AS 비고
        ,[MDUS_REGIST_NM] AS 등록자
        ,[MDUS_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_MOLD_USE_TB]
      LEFT JOIN
      (
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
      ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [MDUS_PRODUCE_RESULT_PK]
      ORDER BY [MDUS_PK] DESC
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
          NO AS NO, 금형NO AS 금형NO, 금형코드 AS 금형코드, 금형명 AS 금형명, 생산실적NO AS 생산실적NO, 작업코드 AS 작업코드,
          품번 AS 품번, 품목구분 AS 품목구분, 품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 생산수 AS 생산수, 불량수 AS 불량수,
          사용횟수 AS 사용횟수, 사용일자 AS 사용일자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDUS_PK] AS NO
            ,[MDUS_MOLD_PK] AS 금형NO
            ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDUS_MOLD_PK]) AS 금형코드
            ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDUS_MOLD_PK]) AS 금형명
            ,[MDUS_PRODUCE_RESULT_PK] AS 생산실적NO
            ,PRODUCE_RESULT.작업코드 AS 작업코드
            ,PRODUCE_RESULT.품번 AS 품번
            ,PRODUCE_RESULT.품목구분 AS 품목구분
            ,PRODUCE_RESULT.품명 AS 품명
            ,PRODUCE_RESULT.규격 AS 규격
            ,PRODUCE_RESULT.단위 AS 단위
            ,PRODUCE_RESULT.생산수 AS 생산수
            ,PRODUCE_RESULT.불량수 AS 불량수
            ,[MDUS_COUNT] AS 사용횟수
            ,CONVERT(VARCHAR, [MDUS_DATE], 23) AS 사용일자
            ,[MDUS_NOTE] AS 비고
            ,[MDUS_REGIST_NM] AS 등록자
            ,[MDUS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_MOLD_USE_TB]
          LEFT JOIN
          (
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
          ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [MDUS_PRODUCE_RESULT_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 사용일자), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 사용일자), 12) <= ` +
        req.body.endDate +
        `
        AND ( 금형코드 like concat('%',@input,'%')
        OR 금형명 like concat('%',@input,'%')
        OR 작업코드 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 사용일자 like concat('%',@input,'%')
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
          NO AS NO, 금형NO AS 금형NO, 금형코드 AS 금형코드, 금형명 AS 금형명, 생산실적NO AS 생산실적NO, 작업코드 AS 작업코드,
          품번 AS 품번, 품목구분 AS 품목구분, 품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 생산수 AS 생산수, 불량수 AS 불량수,
          사용횟수 AS 사용횟수, 사용일자 AS 사용일자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [MDUS_PK] AS NO
            ,[MDUS_MOLD_PK] AS 금형NO
            ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDUS_MOLD_PK]) AS 금형코드
            ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDUS_MOLD_PK]) AS 금형명
            ,[MDUS_PRODUCE_RESULT_PK] AS 생산실적NO
            ,PRODUCE_RESULT.작업코드 AS 작업코드
            ,PRODUCE_RESULT.품번 AS 품번
            ,PRODUCE_RESULT.품목구분 AS 품목구분
            ,PRODUCE_RESULT.품명 AS 품명
            ,PRODUCE_RESULT.규격 AS 규격
            ,PRODUCE_RESULT.단위 AS 단위
            ,PRODUCE_RESULT.생산수 AS 생산수
            ,PRODUCE_RESULT.불량수 AS 불량수
            ,[MDUS_COUNT] AS 사용횟수
            ,CONVERT(VARCHAR, [MDUS_DATE], 23) AS 사용일자
            ,[MDUS_NOTE] AS 비고
            ,[MDUS_REGIST_NM] AS 등록자
            ,[MDUS_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_MOLD_USE_TB]
          LEFT JOIN
          (
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
          ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [MDUS_PRODUCE_RESULT_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 사용일자), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 사용일자), 12) <= ` +
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
      .input("금형NO", req.body.data.금형NO ?? null)
      .input("생산실적NO", req.body.data.생산실적NO ?? null)
      .input("사용횟수", req.body.data.사용횟수 ?? "")
      .input("사용일자", req.body.data.사용일자 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_MOLD_USE_TB]
          ([MDUS_MOLD_PK]
          ,[MDUS_PRODUCE_RESULT_PK]
          ,[MDUS_COUNT]
          ,[MDUS_DATE]
          ,[MDUS_NOTE]
          ,[MDUS_REGIST_NM]
          ,[MDUS_REGIST_DT])
        VALUES
          (@금형NO,@생산실적NO,@사용횟수,@사용일자,@비고,@등록자,@등록일시)
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
        .input("금형NO", req.body.data[i].금형NO ?? null)
        .input("생산실적NO", req.body.data[i].생산실적NO ?? null)
        .input("사용횟수", req.body.data[i].사용횟수 ?? "")
        .input("사용일자", req.body.data[i].사용일자 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_MOLD_USE_TB]
          ([MDUS_MOLD_PK]
          ,[MDUS_PRODUCE_RESULT_PK]
          ,[MDUS_COUNT]
          ,[MDUS_DATE]
          ,[MDUS_NOTE]
          ,[MDUS_REGIST_NM]
          ,[MDUS_REGIST_DT])
        VALUES
          (@금형NO,@생산실적NO,@사용횟수,@사용일자,@비고,@등록자,@등록일시)
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
      .input("금형NO", req.body.data.금형NO ?? null)
      .input("생산실적NO", req.body.data.생산실적NO ?? null)
      .input("사용횟수", req.body.data.사용횟수 ?? "")
      .input("사용일자", req.body.data.사용일자 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_MOLD_USE_TB]
          SET 
            [MDUS_MOLD_PK] = @금형NO
            ,[MDUS_PRODUCE_RESULT_PK] = @생산실적NO
            ,[MDUS_COUNT] = @사용횟수
            ,[MDUS_DATE] = @사용일자
            ,[MDUS_NOTE] = @비고
            ,[MDUS_REGIST_NM] = @등록자
            ,[MDUS_REGIST_DT] = @등록일시
          WHERE [MDUS_PK] = @NO
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
          [MDUS_PK] AS NO
          ,[MDUS_MOLD_PK] AS 금형NO
          ,(SELECT [MOLD_CODE] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDUS_MOLD_PK]) AS 금형코드
          ,(SELECT [MOLD_NAME] FROM [QMES2022].[dbo].[MASTER_MOLD_TB] WHERE [MOLD_PK] = [MDUS_MOLD_PK]) AS 금형명
          ,[MDUS_PRODUCE_RESULT_PK] AS 생산실적NO
          ,PRODUCE_RESULT.작업코드 AS 작업코드
          ,PRODUCE_RESULT.품번 AS 품번
          ,PRODUCE_RESULT.품목구분 AS 품목구분
          ,PRODUCE_RESULT.품명 AS 품명
          ,PRODUCE_RESULT.규격 AS 규격
          ,PRODUCE_RESULT.단위 AS 단위
          ,PRODUCE_RESULT.생산수 AS 생산수
          ,PRODUCE_RESULT.불량수 AS 불량수
          ,[MDUS_COUNT] AS 사용횟수
          ,CONVERT(VARCHAR, [MDUS_DATE], 23) AS 사용일자
          ,[MDUS_NOTE] AS 비고
          ,[MDUS_REGIST_NM] AS 등록자
          ,[MDUS_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_MOLD_USE_TB]
        LEFT JOIN
        (
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
        ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [MDUS_PRODUCE_RESULT_PK]
        WHERE [MDUS_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_MOLD_USE_TB] WHERE [MDUS_PK] = @key`
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
