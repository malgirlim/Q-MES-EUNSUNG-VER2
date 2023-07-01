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
    .input("menu", "키오스크_작업현황") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        ,[KSKWK_REGIST_DT] AS 등록일시
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
            ,[KSKWK_REGIST_DT] AS 등록일시
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

// #####################  생산수 수정  #####################
router.post("/edit", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("NO", req.body.data.NO ?? 0)
      .input("생산수", req.body.data.생산수 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          SET 
          [KSKWK_PRODUCE_AMT] = @생산수
          ,[KSKWK_REGIST_NM] = @등록자
          ,[KSKWK_REGIST_DT] = @등록일시
        WHERE [KSKWK_PK] = @NO
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

// ########################################   나머지 기능   #############################################################

module.exports = router;
