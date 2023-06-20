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
    .input("menu", "품질관리_공정검사") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [PCISP_PK] AS NO
        ,[PCISP_PRODUCE_RESULT_PK] AS 생산실적NO
        ,PRODUCE_RESULT.작업코드 AS 작업코드
        ,PRODUCE_RESULT.공정 AS 공정
        ,PRODUCE_RESULT.품목NO AS 품목NO
        ,PRODUCE_RESULT.품목구분 AS 품목구분
        ,PRODUCE_RESULT.품번 AS 품번
        ,PRODUCE_RESULT.품명 AS 품명
        ,PRODUCE_RESULT.규격 AS 규격
        ,PRODUCE_RESULT.단위 AS 단위
        ,PRODUCE_RESULT.특이사항 AS 특이사항
        ,[PCISP_DIV] AS 구분
        ,[PCISP_SAMPLE_AMT] AS 샘플수량
        ,[PCISP_RECEIVE_AMT] AS 입고수량
        ,[PCISP_RESULT] AS 결과
        ,[PCISP_CONTENT1] AS 내용1
        ,[PCISP_CONTENT2] AS 내용2
        ,[PCISP_CONTENT3] AS 내용3
        ,[PCISP_CONTENT4] AS 내용4
        ,[PCISP_CONTENT5] AS 내용5
        ,[PCISP_CONTENT6] AS 내용6
        ,[PCISP_CONTENT7] AS 내용7
        ,[PCISP_CONTENT8] AS 내용8
        ,[PCISP_CONTENT9] AS 내용9
        ,[PCISP_CONTENT10] AS 내용10
        ,CONVERT(varchar,[PCISP_REQUEST_DT],20) AS 요청일시
        ,[PCISP_NOTE] AS 비고
        ,[PCISP_REGIST_NM] AS 등록자
        ,[PCISP_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_PROCESS_INSPECT_TB]
      LEFT JOIN
      (
        SELECT
          [PDRS_PK] AS NO
          ,[PDRS_INST_PROCESS_PK] AS 지시공정NO
          ,INSTRUCT_PROCESS.작업코드 AS 작업코드
          ,INSTRUCT_PROCESS.품목NO AS 품목NO
          ,INSTRUCT_PROCESS.품목구분 AS 품목구분
          ,INSTRUCT_PROCESS.품번 AS 품번
          ,INSTRUCT_PROCESS.품명 AS 품명
          ,INSTRUCT_PROCESS.규격 AS 규격
          ,INSTRUCT_PROCESS.단위 AS 단위
          ,INSTRUCT_PROCESS.지시수량 AS 지시수량
          ,INSTRUCT_PROCESS.공정명 AS 공정
          ,INSTRUCT_PROCESS.시작일 AS 시작일
          ,[PDRS_USER_ID] AS 작업자ID
          ,RESULT_USER.이름 AS 작업자
          ,[PDRS_FACILITY_PK] AS 설비NO
          ,RESULT_FACILITY.설비명 AS 설비명
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
            ,WORK_INSTRUCT.코드 AS 작업코드
            ,[ISPC_ITEM_PK] AS 품목NO
            ,ITEM.구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,[ISPC_AMOUNT] AS 지시수량
            ,WORK_INSTRUCT.시작일 AS 시작일
            ,[ISPC_PROCESS_PK] AS 공정NO
            ,PROCESS.공정명 AS 공정명
            ,[ISPC_FACILITY_PK] AS 설비NO
            ,FACILITY.설비명 AS 설비명
            ,[ISPC_USER_ID] AS 작업자ID
            ,USERS.이름 AS 작업자
            ,[ISPC_CONDITION] AS 진행상황
          FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          LEFT JOIN
          (
            SELECT
              [WKIS_PK] AS NO
              ,[WKIS_CODE] AS 코드
              ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
              ,[WKIS_ITEM_PK] AS 품목NO
              ,[WKIS_AMOUNT] AS 수량
              ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
            FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
          ) AS WORK_INSTRUCT ON WORK_INSTRUCT.NO = [ISPC_WORK_INSTRUCT_PK]
          LEFT JOIN
          (
            SELECT
              [PRCS_PK] AS NO
              ,[PRCS_CODE] AS 코드
              ,[PRCS_DIV] AS 구분
              ,[PRCS_NAME] AS 공정명
              ,[PRCS_CONTENT] AS 내용
              ,[PRCS_FACILITY] AS 설비
            FROM [QMES2022].[dbo].[MASTER_PROCESS_TB]
          ) AS PROCESS ON PROCESS.NO = [ISPC_PROCESS_PK]
          LEFT JOIN
          (
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
            FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
            LEFT JOIN
            (
              SELECT
                [CLNT_PK] AS NO
                ,[CLNT_NAME] AS 거래처명
              FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
            ) AS CLIENT ON CLIENT.NO = [FCLT_CLIENT_PK]
          ) AS FACILITY ON FACILITY.NO = [ISPC_FACILITY_PK]
          LEFT JOIN
          (
            SELECT
              [USER_ID] AS 아이디,
              [USER_NAME] AS 이름,
              [USER_PHONE] AS 연락처,
              [USER_EMAIL] AS 이메일,
              [USER_DEPART] AS 부서명,
              [USER_POSITION] AS 직책,
              [USER_RANK] AS 직급
            FROM [QMES2022].[dbo].[MASTER_USER_TB]
          ) AS USERS ON USERS.아이디 = [ISPC_USER_ID]
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
        LEFT JOIN
        (
          SELECT
            [FCLT_PK] AS NO
            ,[FCLT_NAME] AS 설비명
            ,[FCLT_LINE] AS 라인
            ,[FCLT_SIZE] AS 규격
          FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
        ) AS RESULT_FACILITY ON RESULT_FACILITY.NO = [PDRS_FACILITY_PK]
        LEFT JOIN
        (
          SELECT
            [USER_ID] AS 아이디,
            [USER_NAME] AS 이름,
            [USER_PHONE] AS 연락처,
            [USER_EMAIL] AS 이메일,
            [USER_DEPART] AS 부서명,
            [USER_POSITION] AS 직책,
            [USER_RANK] AS 직급
          FROM [QMES2022].[dbo].[MASTER_USER_TB]
        WHERE [USER_ID] != 'admin'
        AND [USER_ID] != 'kiosk'
        ) AS RESULT_USER ON RESULT_USER.아이디 = [PDRS_USER_ID]
      ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PCISP_PRODUCE_RESULT_PK]
      ORDER BY [PCISP_PK] DESC
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
          NO AS NO, 생산실적NO AS 생산실적NO, 작업코드 AS 작업코드, 공정 AS 공정, 품목NO AS 품목NO,  품목구분 AS 품목구분,
          품번 AS 품번, 품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 특이사항 AS 특이사항, 구분 AS 구분, 샘플수량 AS 샘플수량,
          입고수량 AS 입고수량, 결과 AS 결과, 내용1 AS 내용1, 내용2 AS 내용2, 내용3 AS 내용3, 내용4 AS 내용4,
          내용5 AS 내용5, 내용6 AS 내용6, 내용7 AS 내용7, 내용8 AS 내용8, 내용9 AS 내용9, 내용10 AS 내용10,
          요청일시 AS 요청일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PCISP_PK] AS NO
            ,[PCISP_PRODUCE_RESULT_PK] AS 생산실적NO
            ,PRODUCE_RESULT.작업코드 AS 작업코드
            ,PRODUCE_RESULT.공정 AS 공정
            ,PRODUCE_RESULT.품목NO AS 품목NO
            ,PRODUCE_RESULT.품목구분 AS 품목구분
            ,PRODUCE_RESULT.품번 AS 품번
            ,PRODUCE_RESULT.품명 AS 품명
            ,PRODUCE_RESULT.규격 AS 규격
            ,PRODUCE_RESULT.단위 AS 단위
            ,PRODUCE_RESULT.특이사항 AS 특이사항
            ,[PCISP_DIV] AS 구분
            ,[PCISP_SAMPLE_AMT] AS 샘플수량
            ,[PCISP_RECEIVE_AMT] AS 입고수량
            ,[PCISP_RESULT] AS 결과
            ,[PCISP_CONTENT1] AS 내용1
            ,[PCISP_CONTENT2] AS 내용2
            ,[PCISP_CONTENT3] AS 내용3
            ,[PCISP_CONTENT4] AS 내용4
            ,[PCISP_CONTENT5] AS 내용5
            ,[PCISP_CONTENT6] AS 내용6
            ,[PCISP_CONTENT7] AS 내용7
            ,[PCISP_CONTENT8] AS 내용8
            ,[PCISP_CONTENT9] AS 내용9
            ,[PCISP_CONTENT10] AS 내용10
            ,CONVERT(varchar,[PCISP_REQUEST_DT],20) AS 요청일시
            ,[PCISP_NOTE] AS 비고
            ,[PCISP_REGIST_NM] AS 등록자
            ,[PCISP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PROCESS_INSPECT_TB]
          LEFT JOIN
          (
            SELECT
              [PDRS_PK] AS NO
              ,[PDRS_INST_PROCESS_PK] AS 지시공정NO
              ,INSTRUCT_PROCESS.작업코드 AS 작업코드
              ,INSTRUCT_PROCESS.품목NO AS 품목NO
              ,INSTRUCT_PROCESS.품목구분 AS 품목구분
              ,INSTRUCT_PROCESS.품번 AS 품번
              ,INSTRUCT_PROCESS.품명 AS 품명
              ,INSTRUCT_PROCESS.규격 AS 규격
              ,INSTRUCT_PROCESS.단위 AS 단위
              ,INSTRUCT_PROCESS.지시수량 AS 지시수량
              ,INSTRUCT_PROCESS.공정명 AS 공정
              ,INSTRUCT_PROCESS.시작일 AS 시작일
              ,[PDRS_USER_ID] AS 작업자ID
              ,RESULT_USER.이름 AS 작업자
              ,[PDRS_FACILITY_PK] AS 설비NO
              ,RESULT_FACILITY.설비명 AS 설비명
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
                ,WORK_INSTRUCT.코드 AS 작업코드
                ,[ISPC_ITEM_PK] AS 품목NO
                ,ITEM.구분 AS 품목구분
                ,ITEM.품번 AS 품번
                ,ITEM.품명 AS 품명
                ,ITEM.규격 AS 규격
                ,ITEM.단위 AS 단위
                ,[ISPC_AMOUNT] AS 지시수량
                ,WORK_INSTRUCT.시작일 AS 시작일
                ,[ISPC_PROCESS_PK] AS 공정NO
                ,PROCESS.공정명 AS 공정명
                ,[ISPC_FACILITY_PK] AS 설비NO
                ,FACILITY.설비명 AS 설비명
                ,[ISPC_USER_ID] AS 작업자ID
                ,USERS.이름 AS 작업자
                ,[ISPC_CONDITION] AS 진행상황
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
              LEFT JOIN
              (
                SELECT
                  [WKIS_PK] AS NO
                  ,[WKIS_CODE] AS 코드
                  ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
                  ,[WKIS_ITEM_PK] AS 품목NO
                  ,[WKIS_AMOUNT] AS 수량
                  ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
                FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
              ) AS WORK_INSTRUCT ON WORK_INSTRUCT.NO = [ISPC_WORK_INSTRUCT_PK]
              LEFT JOIN
              (
                SELECT
                  [PRCS_PK] AS NO
                  ,[PRCS_CODE] AS 코드
                  ,[PRCS_DIV] AS 구분
                  ,[PRCS_NAME] AS 공정명
                  ,[PRCS_CONTENT] AS 내용
                  ,[PRCS_FACILITY] AS 설비
                FROM [QMES2022].[dbo].[MASTER_PROCESS_TB]
              ) AS PROCESS ON PROCESS.NO = [ISPC_PROCESS_PK]
              LEFT JOIN
              (
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
                FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
                LEFT JOIN
                (
                  SELECT
                    [CLNT_PK] AS NO
                    ,[CLNT_NAME] AS 거래처명
                  FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
                ) AS CLIENT ON CLIENT.NO = [FCLT_CLIENT_PK]
              ) AS FACILITY ON FACILITY.NO = [ISPC_FACILITY_PK]
              LEFT JOIN
              (
                SELECT
                  [USER_ID] AS 아이디,
                  [USER_NAME] AS 이름,
                  [USER_PHONE] AS 연락처,
                  [USER_EMAIL] AS 이메일,
                  [USER_DEPART] AS 부서명,
                  [USER_POSITION] AS 직책,
                  [USER_RANK] AS 직급
                FROM [QMES2022].[dbo].[MASTER_USER_TB]
              ) AS USERS ON USERS.아이디 = [ISPC_USER_ID]
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
            LEFT JOIN
            (
              SELECT
                [FCLT_PK] AS NO
                ,[FCLT_NAME] AS 설비명
                ,[FCLT_LINE] AS 라인
                ,[FCLT_SIZE] AS 규격
              FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
            ) AS RESULT_FACILITY ON RESULT_FACILITY.NO = [PDRS_FACILITY_PK]
            LEFT JOIN
            (
              SELECT
                [USER_ID] AS 아이디,
                [USER_NAME] AS 이름,
                [USER_PHONE] AS 연락처,
                [USER_EMAIL] AS 이메일,
                [USER_DEPART] AS 부서명,
                [USER_POSITION] AS 직책,
                [USER_RANK] AS 직급
              FROM [QMES2022].[dbo].[MASTER_USER_TB]
            ) AS RESULT_USER ON RESULT_USER.아이디 = [PDRS_USER_ID]
          ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PCISP_PRODUCE_RESULT_PK]
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 요청일시), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 요청일시), 12) <= ` +
        req.body.endDate +
        `
        AND ( 작업코드 like concat('%',@input,'%')
        OR 공정 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 특이사항 like concat('%',@input,'%')
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
          NO AS NO, 생산실적NO AS 생산실적NO, 작업코드 AS 작업코드, 공정 AS 공정, 품목NO AS 품목NO,  품목구분 AS 품목구분,
          품번 AS 품번, 품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 특이사항 AS 특이사항, 구분 AS 구분, 샘플수량 AS 샘플수량,
          입고수량 AS 입고수량, 결과 AS 결과, 내용1 AS 내용1, 내용2 AS 내용2, 내용3 AS 내용3, 내용4 AS 내용4,
          내용5 AS 내용5, 내용6 AS 내용6, 내용7 AS 내용7, 내용8 AS 내용8, 내용9 AS 내용9, 내용10 AS 내용10,
          요청일시 AS 요청일시, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [PCISP_PK] AS NO
            ,[PCISP_PRODUCE_RESULT_PK] AS 생산실적NO
            ,PRODUCE_RESULT.작업코드 AS 작업코드
            ,PRODUCE_RESULT.공정 AS 공정
            ,PRODUCE_RESULT.품목NO AS 품목NO
            ,PRODUCE_RESULT.품목구분 AS 품목구분
            ,PRODUCE_RESULT.품번 AS 품번
            ,PRODUCE_RESULT.품명 AS 품명
            ,PRODUCE_RESULT.규격 AS 규격
            ,PRODUCE_RESULT.단위 AS 단위
            ,PRODUCE_RESULT.특이사항 AS 특이사항
            ,[PCISP_DIV] AS 구분
            ,[PCISP_SAMPLE_AMT] AS 샘플수량
            ,[PCISP_RECEIVE_AMT] AS 입고수량
            ,[PCISP_RESULT] AS 결과
            ,[PCISP_CONTENT1] AS 내용1
            ,[PCISP_CONTENT2] AS 내용2
            ,[PCISP_CONTENT3] AS 내용3
            ,[PCISP_CONTENT4] AS 내용4
            ,[PCISP_CONTENT5] AS 내용5
            ,[PCISP_CONTENT6] AS 내용6
            ,[PCISP_CONTENT7] AS 내용7
            ,[PCISP_CONTENT8] AS 내용8
            ,[PCISP_CONTENT9] AS 내용9
            ,[PCISP_CONTENT10] AS 내용10
            ,CONVERT(varchar,[PCISP_REQUEST_DT],20) AS 요청일시
            ,[PCISP_NOTE] AS 비고
            ,[PCISP_REGIST_NM] AS 등록자
            ,[PCISP_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MANAGE_PROCESS_INSPECT_TB]
          LEFT JOIN
          (
            SELECT
              [PDRS_PK] AS NO
              ,[PDRS_INST_PROCESS_PK] AS 지시공정NO
              ,INSTRUCT_PROCESS.작업코드 AS 작업코드
              ,INSTRUCT_PROCESS.품목NO AS 품목NO
              ,INSTRUCT_PROCESS.품목구분 AS 품목구분
              ,INSTRUCT_PROCESS.품번 AS 품번
              ,INSTRUCT_PROCESS.품명 AS 품명
              ,INSTRUCT_PROCESS.규격 AS 규격
              ,INSTRUCT_PROCESS.단위 AS 단위
              ,INSTRUCT_PROCESS.지시수량 AS 지시수량
              ,INSTRUCT_PROCESS.공정명 AS 공정
              ,INSTRUCT_PROCESS.시작일 AS 시작일
              ,[PDRS_USER_ID] AS 작업자ID
              ,RESULT_USER.이름 AS 작업자
              ,[PDRS_FACILITY_PK] AS 설비NO
              ,RESULT_FACILITY.설비명 AS 설비명
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
                ,WORK_INSTRUCT.코드 AS 작업코드
                ,[ISPC_ITEM_PK] AS 품목NO
                ,ITEM.구분 AS 품목구분
                ,ITEM.품번 AS 품번
                ,ITEM.품명 AS 품명
                ,ITEM.규격 AS 규격
                ,ITEM.단위 AS 단위
                ,[ISPC_AMOUNT] AS 지시수량
                ,WORK_INSTRUCT.시작일 AS 시작일
                ,[ISPC_PROCESS_PK] AS 공정NO
                ,PROCESS.공정명 AS 공정명
                ,[ISPC_FACILITY_PK] AS 설비NO
                ,FACILITY.설비명 AS 설비명
                ,[ISPC_USER_ID] AS 작업자ID
                ,USERS.이름 AS 작업자
                ,[ISPC_CONDITION] AS 진행상황
              FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
              LEFT JOIN
              (
                SELECT
                  [WKIS_PK] AS NO
                  ,[WKIS_CODE] AS 코드
                  ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
                  ,[WKIS_ITEM_PK] AS 품목NO
                  ,[WKIS_AMOUNT] AS 수량
                  ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
                FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
              ) AS WORK_INSTRUCT ON WORK_INSTRUCT.NO = [ISPC_WORK_INSTRUCT_PK]
              LEFT JOIN
              (
                SELECT
                  [PRCS_PK] AS NO
                  ,[PRCS_CODE] AS 코드
                  ,[PRCS_DIV] AS 구분
                  ,[PRCS_NAME] AS 공정명
                  ,[PRCS_CONTENT] AS 내용
                  ,[PRCS_FACILITY] AS 설비
                FROM [QMES2022].[dbo].[MASTER_PROCESS_TB]
              ) AS PROCESS ON PROCESS.NO = [ISPC_PROCESS_PK]
              LEFT JOIN
              (
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
                FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
                LEFT JOIN
                (
                  SELECT
                    [CLNT_PK] AS NO
                    ,[CLNT_NAME] AS 거래처명
                  FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
                ) AS CLIENT ON CLIENT.NO = [FCLT_CLIENT_PK]
              ) AS FACILITY ON FACILITY.NO = [ISPC_FACILITY_PK]
              LEFT JOIN
              (
                SELECT
                  [USER_ID] AS 아이디,
                  [USER_NAME] AS 이름,
                  [USER_PHONE] AS 연락처,
                  [USER_EMAIL] AS 이메일,
                  [USER_DEPART] AS 부서명,
                  [USER_POSITION] AS 직책,
                  [USER_RANK] AS 직급
                FROM [QMES2022].[dbo].[MASTER_USER_TB]
              ) AS USERS ON USERS.아이디 = [ISPC_USER_ID]
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
            LEFT JOIN
            (
              SELECT
                [FCLT_PK] AS NO
                ,[FCLT_NAME] AS 설비명
                ,[FCLT_LINE] AS 라인
                ,[FCLT_SIZE] AS 규격
              FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
            ) AS RESULT_FACILITY ON RESULT_FACILITY.NO = [PDRS_FACILITY_PK]
            LEFT JOIN
            (
              SELECT
                [USER_ID] AS 아이디,
                [USER_NAME] AS 이름,
                [USER_PHONE] AS 연락처,
                [USER_EMAIL] AS 이메일,
                [USER_DEPART] AS 부서명,
                [USER_POSITION] AS 직책,
                [USER_RANK] AS 직급
              FROM [QMES2022].[dbo].[MASTER_USER_TB]
            ) AS RESULT_USER ON RESULT_USER.아이디 = [PDRS_USER_ID]
          ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PCISP_PRODUCE_RESULT_PK]
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
      .input("생산실적NO", req.body.data.생산실적NO ?? null)
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
      .input("비고", req.body.data.비고 ?? "")
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
          (@생산실적NO,@구분,@샘플수량,@입고수량,@결과,@내용1,@내용2,@내용3,@내용4,@내용5,
            @내용6,@내용7,@내용8,@내용9,@내용10,@요청일시,@비고,@등록자,@등록일시)
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
        .input("비고", req.body.data[i].비고 ?? "")
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
          (@생산실적NO,@구분,@샘플수량,@입고수량,@결과,@내용1,@내용2,@내용3,@내용4,@내용5,
            @내용6,@내용7,@내용8,@내용9,@내용10,@요청일시,@비고,@등록자,@등록일시)
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
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_PROCESS_INSPECT_TB]
        SET 
          [PCISP_PRODUCE_RESULT_PK] = @생산실적NO
          ,[PCISP_DIV] = @구분
          ,[PCISP_SAMPLE_AMT] = @샘플수량
          ,[PCISP_RECEIVE_AMT] = @입고수량
          ,[PCISP_RESULT] = @결과
          ,[PCISP_CONTENT1] = @내용1
          ,[PCISP_CONTENT2] = @내용2
          ,[PCISP_CONTENT3] = @내용3
          ,[PCISP_CONTENT4] = @내용4
          ,[PCISP_CONTENT5] = @내용5
          ,[PCISP_CONTENT6] = @내용6
          ,[PCISP_CONTENT7] = @내용7
          ,[PCISP_CONTENT8] = @내용8
          ,[PCISP_CONTENT9] = @내용9
          ,[PCISP_CONTENT10] = @내용10
          ,[PCISP_NOTE] = @비고
          ,[PCISP_REGIST_NM] = @등록자
          ,[PCISP_REGIST_DT] = @등록일시
        WHERE [PCISP_PK] = @NO
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
          [PCISP_PK] AS NO
          ,[PCISP_PRODUCE_RESULT_PK] AS 생산실적NO
          ,PRODUCE_RESULT.작업코드 AS 작업코드
          ,PRODUCE_RESULT.공정 AS 공정
          ,PRODUCE_RESULT.품목NO AS 품목NO
          ,PRODUCE_RESULT.품목구분 AS 품목구분
          ,PRODUCE_RESULT.품번 AS 품번
          ,PRODUCE_RESULT.품명 AS 품명
          ,PRODUCE_RESULT.규격 AS 규격
          ,PRODUCE_RESULT.단위 AS 단위
          ,PRODUCE_RESULT.특이사항 AS 특이사항
          ,[PCISP_DIV] AS 구분
          ,[PCISP_SAMPLE_AMT] AS 샘플수량
          ,[PCISP_RECEIVE_AMT] AS 입고수량
          ,[PCISP_RESULT] AS 결과
          ,[PCISP_CONTENT1] AS 내용1
          ,[PCISP_CONTENT2] AS 내용2
          ,[PCISP_CONTENT3] AS 내용3
          ,[PCISP_CONTENT4] AS 내용4
          ,[PCISP_CONTENT5] AS 내용5
          ,[PCISP_CONTENT6] AS 내용6
          ,[PCISP_CONTENT7] AS 내용7
          ,[PCISP_CONTENT8] AS 내용8
          ,[PCISP_CONTENT9] AS 내용9
          ,[PCISP_CONTENT10] AS 내용10
          ,CONVERT(varchar,[PCISP_REQUEST_DT],20) AS 요청일시
          ,[PCISP_NOTE] AS 비고
          ,[PCISP_REGIST_NM] AS 등록자
          ,[PCISP_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_PROCESS_INSPECT_TB]
        LEFT JOIN
        (
          SELECT
            [PDRS_PK] AS NO
            ,[PDRS_INST_PROCESS_PK] AS 지시공정NO
            ,INSTRUCT_PROCESS.작업코드 AS 작업코드
            ,INSTRUCT_PROCESS.품목NO AS 품목NO
            ,INSTRUCT_PROCESS.품목구분 AS 품목구분
            ,INSTRUCT_PROCESS.품번 AS 품번
            ,INSTRUCT_PROCESS.품명 AS 품명
            ,INSTRUCT_PROCESS.규격 AS 규격
            ,INSTRUCT_PROCESS.단위 AS 단위
            ,INSTRUCT_PROCESS.지시수량 AS 지시수량
            ,INSTRUCT_PROCESS.공정명 AS 공정
            ,INSTRUCT_PROCESS.시작일 AS 시작일
            ,[PDRS_USER_ID] AS 작업자ID
            ,RESULT_USER.이름 AS 작업자
            ,[PDRS_FACILITY_PK] AS 설비NO
            ,RESULT_FACILITY.설비명 AS 설비명
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
              ,WORK_INSTRUCT.코드 AS 작업코드
              ,[ISPC_ITEM_PK] AS 품목NO
              ,ITEM.구분 AS 품목구분
              ,ITEM.품번 AS 품번
              ,ITEM.품명 AS 품명
              ,ITEM.규격 AS 규격
              ,ITEM.단위 AS 단위
              ,[ISPC_AMOUNT] AS 지시수량
              ,WORK_INSTRUCT.시작일 AS 시작일
              ,[ISPC_PROCESS_PK] AS 공정NO
              ,PROCESS.공정명 AS 공정명
              ,[ISPC_FACILITY_PK] AS 설비NO
              ,FACILITY.설비명 AS 설비명
              ,[ISPC_USER_ID] AS 작업자ID
              ,USERS.이름 AS 작업자
              ,[ISPC_CONDITION] AS 진행상황
            FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
            LEFT JOIN
            (
              SELECT
                [WKIS_PK] AS NO
                ,[WKIS_CODE] AS 코드
                ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
                ,[WKIS_ITEM_PK] AS 품목NO
                ,[WKIS_AMOUNT] AS 수량
                ,CONVERT(varchar, [WKIS_START_DATE], 23) AS 시작일
              FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
            ) AS WORK_INSTRUCT ON WORK_INSTRUCT.NO = [ISPC_WORK_INSTRUCT_PK]
            LEFT JOIN
            (
              SELECT
                [PRCS_PK] AS NO
                ,[PRCS_CODE] AS 코드
                ,[PRCS_DIV] AS 구분
                ,[PRCS_NAME] AS 공정명
                ,[PRCS_CONTENT] AS 내용
                ,[PRCS_FACILITY] AS 설비
              FROM [QMES2022].[dbo].[MASTER_PROCESS_TB]
            ) AS PROCESS ON PROCESS.NO = [ISPC_PROCESS_PK]
            LEFT JOIN
            (
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
              FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
              LEFT JOIN
              (
                SELECT
                  [CLNT_PK] AS NO
                  ,[CLNT_NAME] AS 거래처명
                FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
              ) AS CLIENT ON CLIENT.NO = [FCLT_CLIENT_PK]
            ) AS FACILITY ON FACILITY.NO = [ISPC_FACILITY_PK]
            LEFT JOIN
            (
              SELECT
                [USER_ID] AS 아이디,
                [USER_NAME] AS 이름,
                [USER_PHONE] AS 연락처,
                [USER_EMAIL] AS 이메일,
                [USER_DEPART] AS 부서명,
                [USER_POSITION] AS 직책,
                [USER_RANK] AS 직급
              FROM [QMES2022].[dbo].[MASTER_USER_TB]
            ) AS USERS ON USERS.아이디 = [ISPC_USER_ID]
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
          LEFT JOIN
          (
            SELECT
              [FCLT_PK] AS NO
              ,[FCLT_NAME] AS 설비명
              ,[FCLT_LINE] AS 라인
              ,[FCLT_SIZE] AS 규격
            FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
          ) AS RESULT_FACILITY ON RESULT_FACILITY.NO = [PDRS_FACILITY_PK]
          LEFT JOIN
          (
            SELECT
              [USER_ID] AS 아이디,
              [USER_NAME] AS 이름,
              [USER_PHONE] AS 연락처,
              [USER_EMAIL] AS 이메일,
              [USER_DEPART] AS 부서명,
              [USER_POSITION] AS 직책,
              [USER_RANK] AS 직급
            FROM [QMES2022].[dbo].[MASTER_USER_TB]
          ) AS RESULT_USER ON RESULT_USER.아이디 = [PDRS_USER_ID]
        ) AS PRODUCE_RESULT ON PRODUCE_RESULT.NO = [PCISP_PRODUCE_RESULT_PK]
        WHERE [PCISP_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_PROCESS_INSPECT_TB] WHERE [PCISP_PK] = @key`
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
            (SELECT [ISPC_ITEM_PK] FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_PK] =
              (SELECT [PDRS_INST_PROCESS_PK] FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB] WHERE [PDRS_PK] =
                (SELECT [PCISP_PRODUCE_RESULT_PK] FROM [QMES2022].[dbo].[MANAGE_PROCESS_INSPECT_TB] WHERE [PCISP_PK] = @공정검사NO))),
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
