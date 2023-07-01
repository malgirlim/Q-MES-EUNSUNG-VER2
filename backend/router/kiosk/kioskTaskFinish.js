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
    .input("menu", "키오스크_작업종료") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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

// 키오스크 작업종료 - 생산실적 등록
router.post("/insert", async (req, res) => {
  try {
    const Pool = await pool;

    // ##############################  생산실적 등록  ##############################
    await Pool.request().input("NO", req.body.data.NO ?? null).query(`
      -- 생산실적 등록
      INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
        ([PDRS_INST_PROCESS_PK]
        ,[PDRS_USER_ID]
        ,[PDRS_FACILITY_PK]
        ,[PDRS_START_DT]
        ,[PDRS_END_DT]
        ,[PDRS_PRODUCE_AMT]
        ,[PDRS_REPORT]
        ,[PDRS_NOTE]
        ,[PDRS_REGIST_NM]
        ,[PDRS_REGIST_DT])
      SELECT
        [KSKWK_INST_PROCESS_PK] AS 지시공정NO
        ,[KSKWK_USER_ID] AS 작업자ID
        ,(SELECT [ISPC_FACILITY_PK] FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_PK] = [KSKWK_INST_PROCESS_PK]) AS 설비NO
        ,CONVERT(VARCHAR, [KSKWK_START_DT], 20) AS 시작일시
        ,GETDATE() AS 종료일시
        ,[KSKWK_PRODUCE_AMT] AS 생산수
        ,[KSKWK_REPORT] AS 특이사항
        ,[KSKWK_NOTE] AS 비고
        ,[KSKWK_USER_ID] AS 등록자
        ,GETDATE() AS 등록일시
      FROM [QMES2022].[dbo].[KIOSK_WORK_TB]
      WHERE [KSKWK_PK] = @NO
    `);

    // ##############################  생산실적 투입자재 등록  ##############################
    await Pool.request().input("NO", req.body.data.NO ?? null).query(`
      -- 생산실적 투입자재 등록
      INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
        ([PDUI_DIV]
        ,[PDUI_PRODUCE_RESULT_PK]
        ,[PDUI_ITEM_PK]
        ,[PDUI_LOTCODE]
        ,[PDUI_AMOUNT]
        ,[PDUI_DT]
        ,[PDUI_NOTE]
        ,[PDUI_REGIST_NM]
        ,[PDUI_REGIST_DT])
      SELECT
        '생산실적투입자재' AS 구분
        ,(SELECT MAX([PDRS_PK]) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]) AS 생산실적NO
        ,[KSKIT_ITEM_PK] AS 품목NO
        ,[KSKIT_LOTCODE] AS LOT코드
        ,[KSKIT_AMOUNT] AS 수량
        ,GETDATE() AS 투입일시
        ,[KSKIT_NOTE] AS 비고
        ,(SELECT [KSKWK_USER_ID] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO) AS 등록자
        ,GETDATE() AS 등록일시
      FROM [QMES2022].[dbo].[KIOSK_ITEM_TB]
      WHERE [KSKIT_WORK_PK] = @NO
    `);

    // ##############################  생산실적 불량 등록  ##############################
    await Pool.request().input("NO", req.body.data.NO ?? null).query(`
      -- 생산실적 불량 등록
      INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
        ([PDDF_PRODUCE_RESULT_PK]
        ,[PDDF_DEFECT_PK]
        ,[PDDF_AMOUNT]
        ,[PDDF_NOTE]
        ,[PDDF_REGIST_NM]
        ,[PDDF_REGIST_DT])
      SELECT
        (SELECT MAX([PDRS_PK]) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]) AS 생산실적NO
        ,[KSKDF_DEFECT_PK] AS 불량NO
        ,[KSKDF_AMOUNT] AS 수량
        ,[KSKDF_NOTE] AS 비고
        ,(SELECT [KSKWK_USER_ID] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO) AS 등록자
        ,GETDATE() AS 등록일시
      FROM [QMES2022].[dbo].[KIOSK_DEFECT_TB]
      WHERE [KSKDF_WORK_PK] = @NO
    `);

    // ##############################  생산실적 비가동 등록  ##############################
    await Pool.request().input("NO", req.body.data.NO ?? null).query(`
      -- 생산실적 비가동 등록
      INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_NONWORK_TB]
        ([PDNW_PRODUCE_RESULT_PK]
        ,[PDNW_NONWORK_PK]
        ,[PDNW_START_DT]
        ,[PDNW_END_DT]
        ,[PDNW_NOTE]
        ,[PDNW_REGIST_NM]
        ,[PDNW_REGIST_DT])
      SELECT
        (SELECT MAX([PDRS_PK]) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]) AS 생산실적NO
        ,[KSKNW_NONWORK_PK] AS 비가동NO
        ,[KSKNW_START_DT] AS 시작일시
        ,[KSKNW_END_DT] AS 종료일시
        ,[KSKNW_NOTE] AS 비고
        ,(SELECT [KSKWK_USER_ID] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO) AS 등록자
        ,GETDATE() AS 등록일시
      FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB]
      WHERE [KSKNW_WORK_PK] = @NO
    `);

    // ##############################  품질검사_공정검사에 넘기기  ##############################
    await Pool.request()
      .input("NO", req.body.data.NO ?? null)
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PROCESS_INSPECT_TB]
          ([PCISP_PRODUCE_RESULT_PK]
          ,[PCISP_DIV]
          ,[PCISP_SAMPLE_AMT]
          ,[PCISP_RECEIVE_AMT]
          ,[PCISP_RESULT]
          ,[PCISP_CONTENT1]
          ,[PCISP_CONTENT2]
          ,[PCISP_CONTENT3]
          ,[PCISP_CONTENT4]
          ,[PCISP_CONTENT5]
          ,[PCISP_CONTENT6]
          ,[PCISP_CONTENT7]
          ,[PCISP_CONTENT8]
          ,[PCISP_CONTENT9]
          ,[PCISP_CONTENT10]
          ,[PCISP_REQUEST_DT]
          ,[PCISP_NOTE]
          ,[PCISP_REGIST_NM]
          ,[PCISP_REGIST_DT])
        VALUES
          ((SELECT MAX([PDRS_PK]) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]) ,'' ,''
          ,(SELECT [KSKWK_PRODUCE_AMT] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO)
          ,'미검사' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'',GETDATE(),'',@등록자,@등록일시)
    `);

    // ##############################  작업지시 상태 변환  ##############################
    if (req.body.data.비고 == "작업중단") {
      await Pool.request()
        .input("NO", req.body.data.NO ?? null)
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        -- 작업지시를 작업대기로 수정
        UPDATE [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          SET
          [ISPC_CONDITION] = '작업대기'
        WHERE [ISPC_PK] = (SELECT [KSKWK_INST_PROCESS_PK] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO)
      `);
    } else if (req.body.data.비고 == "작업완료") {
      await Pool.request()
        .input("NO", req.body.data.NO ?? null)
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        -- 작업지시를 작업완료로 수정
        UPDATE [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          SET
          [ISPC_CONDITION] = '작업완료'
        WHERE [ISPC_PK] = (SELECT [KSKWK_INST_PROCESS_PK] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO)
      `);
    } else {
      await Pool.request()
        .input("NO", req.body.data.NO ?? null)
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        -- 작업지시를 작업미확인으로 수정
        UPDATE [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          SET
          [ISPC_CONDITION] = '작업미확인'
        WHERE [ISPC_PK] = (SELECT [KSKWK_INST_PROCESS_PK] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO)
      `);
    }

    // ##############################  키오스크 데이터 삭제  ##############################
    await Pool.request()
      .input("NO", req.body.data.NO ?? null)
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        -- 키오스크에 등록되어진 데이터 지우기
        DELETE FROM [QMES2022].[dbo].[KIOSK_ITEM_TB] WHERE [KSKIT_WORK_PK] = @NO;
        DELETE FROM [QMES2022].[dbo].[KIOSK_DEFECT_TB] WHERE [KSKDF_WORK_PK] = @NO;
        DELETE FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB] WHERE [KSKNW_WORK_PK] = @NO;
        DELETE FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO;
      `);

    // 로그기록 저장
    await logSend(
      (type = "등록"),
      (ct = JSON.stringify(req.body.data) + " 을 작업종료."),
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

// ########################################   나머지 기능   #############################################################

module.exports = router;
