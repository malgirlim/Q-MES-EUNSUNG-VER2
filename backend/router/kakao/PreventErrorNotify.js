const dayjs = require("dayjs");
const express = require("express");
const request = require("request");
const { sql, pool } = require("../../mssql");
const router = express.Router();

const kakaoSendData = {
  수신번호: "010-3258-2466",
  설비명: "인쇄1호기",
  발생일시: "2023-06-11 14:56:20",
  부서: "스마트사업부",
  담당자: "고범석",
  직급: "주임",
  연락처: "010-1234-5678",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/preventerrornotify/send",
  method: "POST",
  body: kakaoSendData,
  json: true,
};

request_post(); //최초 즉시 실행

setInterval(() => request_post(), 60000); // 이후 60초마다 실행

async function request_post() {
  // 판단 조건 가져오기
  const judge_stand = await getJudgeStand();

  // 판단조건이 설비에 따라서 여러개인 경우가 있으므로 for문 실행
  for (let judge of judge_stand) {
    // 판단조건이 참이면 실행 && judge.발송시간 == dayjs().format("HH:mm")
    if (judge.기능사용 == "ON") {
      // 보낼 데이터 가져오기
      const send_data = await getSendData();

      // 보낼 데이터가 여러개인 경우가 있으므로 for문 실행
      for (let data of send_data) {
        // 설비NO과 발송시점의 기준을 판단
        if (data.설비명 == judge.설비명) {
          kakaoSendData.설비명 = data.설비명 ?? "";
          kakaoSendData.발생일시 = data.발생일시 ?? "";
          kakaoSendData.부서 = data.부서 ?? "";
          kakaoSendData.담당자 = data.담당자 ?? "";
          kakaoSendData.직급 = data.직급 ?? "";
          kakaoSendData.연락처 = data.연락처 ?? "";

          // 보낼 대상 가져오기
          const send_user = await getSendUser(judge.NO);

          // 보낼 대상이 여러명인 경우가 있으므로 for문 실행
          for (let user of send_user) {
            kakaoSendData.수신번호 = user.연락처;

            // 카카오톡에 보내기
            request.post(options, function (err, res, body) {
              // console.log(
              //   dayjs().format("YYYY-MM-DD HH:mm:ss") + " : " + res.body.result
              // );

              // 알림로그에 등록하기
              insertAlertLog(user, data, res);
            });
          }

          // 수주대비납품 예보에 등록하기
          insertForecastNotify(data);
        }
      }
    }
  }
}

// 판단기준 가져오는 함수
async function getJudgeStand() {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [ALST_PK] AS NO
        ,[ALST_DIV] AS 구분
        ,[ALST_FACILITY_PK] AS 설비NO
        ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [ALST_FACILITY_PK]) AS 설비명
        ,[ALST_USE] AS 기능사용
        ,LEFT(CONVERT(VARCHAR, [ALST_TIME], 8),5) AS 발송시간
        ,[ALST_POINT] AS 발송시점
        ,[ALST_NOTE] AS 비고
        ,[ALST_REGIST_NM] AS 등록자
        ,[ALST_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_ALERT_SETTING_TB]
      WHERE [ALST_DIV] = 'PreventErrorNotify'
    `);

    return result.recordset;
  } catch (err) {
    console.log(err.message);
  }
}

// 보낼대상 전화번호 가져오는 함수
async function getSendUser(알림설정NO) {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(
      `
      SELECT
        [ALUS_PK] AS NO
        ,[ALUS_ALST_PK] AS 알림설정NO
        ,[ALUS_USER_ID] AS 사용자ID
        ,MASTER_USER.이름 AS 이름
        ,MASTER_USER.연락처 AS 연락처
        ,MASTER_USER.부서명 AS 부서명
        ,MASTER_USER.직책 AS 직책
        ,MASTER_USER.직급 AS 직급
      FROM [QMES2022].[dbo].[MANAGE_ALERT_USER_TB]
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
      ) AS MASTER_USER ON MASTER_USER.아이디 = [ALUS_USER_ID]
      WHERE [ALUS_ALST_PK] = ` +
        알림설정NO +
        `
    `
    );

    return result.recordset;
  } catch (err) {
    console.log(err.message);
  }
}

// 보낼데이터 가져오는 함수
async function getSendData() {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        설비NO AS 설비NO
        ,설비명 AS 설비명
        ,CONVERT(VARCHAR, GETDATE(), 20) AS 발생일시
        ,부서 AS 부서
        ,작업자 AS 담당자
        ,직급 AS 직급
        ,연락처 AS 연락처
        ,현황 AS 현황
      FROM
      (
        SELECT
          [KSKWK_PK] AS NO
          ,[KSKWK_USER_ID] AS 작업자ID
          ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [KSKWK_USER_ID]) AS 작업자
          ,(SELECT [USER_DEPART] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [KSKWK_USER_ID]) AS 부서
          ,(SELECT [USER_RANK] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [KSKWK_USER_ID]) AS 직급
          ,(SELECT [USER_PHONE] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [KSKWK_USER_ID]) AS 연락처
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
          ,[KSKWK_START_DT] AS 시작일시
          ,[KSKWK_PRODUCE_AMT] AS 생산수
          ,[KSKWK_REPORT] AS 특이사항
          ,[KSKWK_STATUS] AS 현황
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
      WHERE 현황 = '고장중'
    `);

    return result.recordset;
  } catch (err) {
    console.log(err.message);
  }
}

// 알림 기록 등록 함수
async function insertAlertLog(user, data, res) {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("발송대상ID", user.사용자ID ?? "")
      .input("구분", "설비고장발생통보" ?? "")
      .input(
        "제목",
        dayjs().format("YYYY-MM-DD HH:mm:ss") + " : " + res.body.result
      )
      .input(
        "내용",
        "발생일시:" +
          (data.발생일시 ?? "") +
          ", 설비명:" +
          (data.설비명 ?? "") +
          ", 부서:" +
          (data.부서 ?? "") +
          ", 담당자:" +
          (data.담당자 ?? "") +
          ", 직급:" +
          (data.직급 ?? "") +
          ", 연락처:" +
          (data.연락처 ?? "")
      )
      .input("확인", "NO" ?? "")
      .input("등록자", "시스템" ?? "")
      .input("등록일시", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .query(`INSERT INTO [QMES2022].[dbo].[MANAGE_ALERT_LOG_TB]
                ([ALLG_USER_ID]
                ,[ALLG_DIV]
                ,[ALLG_TITLE]
                ,[ALLG_CONTENT]
                ,[ALLG_CHECK]
                ,[ALLG_REGIST_NM]
                ,[ALLG_REGIST_DT])
              VALUES
                (@발송대상ID,@구분,@제목,@내용,@확인,@등록자,@등록일시)
      `);
  } catch (err) {
    console.log(err.message);
  }
}

// 예보 통보 등록 함수
async function insertForecastNotify(data) {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("참조NO", data.설비NO ?? null)
      .input("구분", "설비고장발생통보")
      .input(
        "내용",
        "발생일시:" +
          (data.발생일시 ?? "") +
          ", 설비명:" +
          (data.설비명 ?? "") +
          ", 부서:" +
          (data.부서 ?? "") +
          ", 담당자:" +
          (data.담당자 ?? "") +
          ", 직급:" +
          (data.직급 ?? "") +
          ", 연락처:" +
          (data.연락처 ?? "")
      )
      .input("비고", "" ?? "")
      .input("등록자", "시스템" ?? "")
      .input("등록일시", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .query(`INSERT INTO [QMES2022].[dbo].[MANAGE_NOTICE_ERROR_TB]
          ([NTERR_FACILITY_PK]
          ,[NTERR_DIV]
          ,[NTERR_CONTENT]
          ,[NTERR_NOTE]
          ,[NTERR_REGIST_NM]
          ,[NTERR_REGIST_DT])
        VALUES
          (@참조NO,@구분,@내용,@비고,@등록자,@등록일시)
      `);
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = router;
