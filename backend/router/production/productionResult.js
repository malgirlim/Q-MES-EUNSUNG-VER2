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
    .input("menu", "생산관리_생산실적집계") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        ,[PDRS_NOTE] AS 비고
        ,[PDRS_REGIST_NM] AS 등록자
        ,[PDRS_REGIST_DT] AS 등록일시
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
            ,ITEM.품목구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,ITEM.규격 AS 규격
            ,ITEM.단위 AS 단위
            ,[WKIS_AMOUNT] AS 수량
            ,LEFT([WKIS_START_DATE],10) AS 시작일
          FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
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
          ) AS ITEM ON ITEM.NO = [WKIS_ITEM_PK]
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
      ORDER BY [PDRS_PK] DESC
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
          NO AS NO, 지시공정NO AS 지시공정NO, 작업코드 AS 작업코드, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 규격 AS 규격,
          단위 AS 단위, 지시수량 AS 지시수량, 공정 AS 공정, 시작일 AS 시작일, 설비NO AS 설비NO, 설비명 AS 설비명, 작업자ID AS 작업자ID,
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
            ,[PDRS_NOTE] AS 비고
            ,[PDRS_REGIST_NM] AS 등록자
            ,[PDRS_REGIST_DT] AS 등록일시
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
                ,ITEM.품목구분 AS 품목구분
                ,ITEM.품번 AS 품번
                ,ITEM.품명 AS 품명
                ,ITEM.규격 AS 규격
                ,ITEM.단위 AS 단위
                ,[WKIS_AMOUNT] AS 수량
                ,LEFT([WKIS_START_DATE],10) AS 시작일
              FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
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
              ) AS ITEM ON ITEM.NO = [WKIS_ITEM_PK]
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
          단위 AS 단위, 지시수량 AS 지시수량, 공정 AS 공정, 시작일 AS 시작일, 설비NO AS 설비NO, 설비명 AS 설비명, 작업자ID AS 작업자ID,
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
            ,[PDRS_NOTE] AS 비고
            ,[PDRS_REGIST_NM] AS 등록자
            ,[PDRS_REGIST_DT] AS 등록일시
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
                ,ITEM.품목구분 AS 품목구분
                ,ITEM.품번 AS 품번
                ,ITEM.품명 AS 품명
                ,ITEM.규격 AS 규격
                ,ITEM.단위 AS 단위
                ,[WKIS_AMOUNT] AS 수량
                ,LEFT([WKIS_START_DATE],10) AS 시작일
              FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
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
              ) AS ITEM ON ITEM.NO = [WKIS_ITEM_PK]
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
      .input("지시공정NO", req.body.data.지시공정NO ?? null)
      .input("작업자ID", req.body.data.작업자ID ?? "")
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("시작일시", req.body.data.시작일시 ?? "")
      .input("종료일시", req.body.data.종료일시 ?? "")
      .input("생산수", req.body.data.생산수 ?? "")
      .input("특이사항", req.body.data.특이사항 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
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
        VALUES
          (@지시공정NO,@작업자ID,@설비NO,@시작일시,@종료일시,@생산수,@특이사항,@비고,@등록자,@등록일시)
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
        .input("지시공정NO", req.body.data[i].지시공정NO ?? null)
        .input("작업자ID", req.body.data[i].작업자ID ?? "")
        .input("설비NO", req.body.data[i].설비NO ?? null)
        .input("시작일시", req.body.data[i].시작일시 ?? "")
        .input("종료일시", req.body.data[i].종료일시 ?? "")
        .input("생산수", req.body.data[i].생산수 ?? "")
        .input("특이사항", req.body.data[i].특이사항 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          ([PDRS_INST_PROCESS_PK]
          ,[PDRS_USER_ID]
          ,[PDRS_FACILITY_PK]
          ,[PDRS_START_DT]
          ,[PDRS_END_DT]
          ,[PDRS_PRODUCE_AMT]
          ,[PDRS_DEFECT_AMT]
          ,[PDRS_REPORT]
          ,[PDRS_NOTE]
          ,[PDRS_REGIST_NM]
          ,[PDRS_REGIST_DT])
        VALUES
          (@지시공정NO,@작업자ID,@설비NO,@시작일시,@종료일시,@생산수,@특이사항,@비고,@등록자,@등록일시)
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
      .input("지시공정NO", req.body.data.지시공정NO ?? null)
      .input("작업자ID", req.body.data.작업자ID ?? "")
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("시작일시", req.body.data.시작일시 ?? "")
      .input("종료일시", req.body.data.종료일시 ?? "")
      .input("생산수", req.body.data.생산수 ?? "")
      .input("특이사항", req.body.data.특이사항 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          SET 
          [PDRS_INST_PROCESS_PK] = @지시공정NO
          ,[PDRS_USER_ID] = @작업자ID
          ,[PDRS_FACILITY_PK] = @설비NO
          ,[PDRS_START_DT] = @시작일시
          ,[PDRS_END_DT] = @종료일시
          ,[PDRS_PRODUCE_AMT] = @생산수
          ,[PDRS_REPORT] = @특이사항
          ,[PDRS_NOTE] = @비고
          ,[PDRS_REGIST_NM] = @등록자
          ,[PDRS_REGIST_DT] = @등록일시
        WHERE [PDRS_PK] = @NO
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
          [PDRS_PK] AS NO
          ,[PDRS_INST_PROCESS_PK] AS 지시공정NO
          ,INSTRUCT_PROCESS.작업코드 AS 작업코드
          ,INSTRUCT_PROCESS.구분 AS 구분
          ,INSTRUCT_PROCESS.품번 AS 품번
          ,INSTRUCT_PROCESS.품명 AS 품명
          ,INSTRUCT_PROCESS.규격 AS 규격
          ,INSTRUCT_PROCESS.단위 AS 단위
          ,INSTRUCT_PROCESS.수량 AS 수량
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
          ,[PDRS_NOTE] AS 비고
          ,[PDRS_REGIST_NM] AS 등록자
          ,[PDRS_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
        LEFT JOIN
        (
          SELECT
            [ISPC_PK] AS NO
            ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
            ,WORK_INSTRUCT.코드 AS 작업코드
            ,WORK_INSTRUCT.품목구분 AS 구분
            ,WORK_INSTRUCT.품번 AS 품번
            ,WORK_INSTRUCT.품명 AS 품명
            ,WORK_INSTRUCT.규격 AS 규격
            ,WORK_INSTRUCT.단위 AS 단위
            ,WORK_INSTRUCT.수량 AS 수량
            ,WORK_INSTRUCT.시작일 AS 시작일
            ,[ISPC_PROCESS_PK] AS 공정NO
            ,PROCESS.공정명 AS 공정명
            ,[ISPC_FACILITY_PK] AS 설비NO
            ,FACILITY.설비명 AS 설비명
            ,[ISPC_USER_ID] AS 작업자ID
            ,USERS.이름 AS 작업자
          FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          LEFT JOIN
          (
            SELECT
              [WKIS_PK] AS NO
              ,[WKIS_CODE] AS 코드
              ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
              ,[WKIS_ITEM_PK] AS 품목NO
              ,ITEM.품목구분 AS 품목구분
              ,ITEM.품번 AS 품번
              ,ITEM.품명 AS 품명
              ,ITEM.규격 AS 규격
              ,ITEM.단위 AS 단위
              ,[WKIS_AMOUNT] AS 수량
              ,LEFT([WKIS_START_DATE],10) AS 시작일
            FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
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
            ) AS ITEM ON ITEM.NO = [WKIS_ITEM_PK]
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
            FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
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
        WHERE [PDRS_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB] WHERE [PDRS_PK] = @key`
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
