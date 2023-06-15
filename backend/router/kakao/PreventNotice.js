const dayjs = require("dayjs");
const express = require("express");
const request = require("request");
const { sql, pool } = require("../../mssql");
const router = express.Router();

const kakaoSendData = {
  수신번호: "010-3258-2466",
  계획일: "2023-06-10",
  설비명: "인쇄1호기",
  구분: "테스트 구분",
  내용: "테스트 내용",
  담당자: "고범석",
  직급: "주임",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/preventnotice/send",
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
    // 판단조건이 참이면 실행
    if (judge.기능사용 == "ON" && judge.발송시간 == dayjs().format("HH:mm")) {
      // 보낼 데이터 가져오기
      const send_data = await getSendData();

      // 보낼 데이터가 여러개인 경우가 있으므로 for문 실행
      for (let data of send_data) {
        // 설비NO과 발송시점의 기준을 판단
        if (data.설비NO == judge.설비NO && data.잔여일 == 0) {
          kakaoSendData.계획일 = data.계획일 ?? "";
          kakaoSendData.설비명 = data.설비명 ?? "";
          kakaoSendData.구분 = data.구분 ?? "";
          kakaoSendData.내용 = data.내용 ?? "";
          kakaoSendData.담당자 = data.담당자 ?? "";
          kakaoSendData.직급 = data.직급 ?? "";

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
      WHERE [ALST_DIV] = 'PreventNotice'
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
        NO AS 예방보전계획NO
        ,설비NO AS 설비NO
        ,잔여일 AS 잔여일
        ,예보잔여일 AS 예보잔여일
        ,계획일 AS 계획일
        ,설비명 AS 설비명
        ,구분 AS 구분
        ,내용 AS 내용
        ,담당자 AS 담당자
        ,직급 AS 직급
        ,계획완료수 AS 계획완료수
      FROM
      (
        SELECT
          [PVPL_PK] AS NO
          ,[PVPL_FACILITY_PK] AS 설비NO
          ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [PVPL_FACILITY_PK]) AS 설비명
          ,[PVPL_DIV] AS 구분
          ,[PVPL_CONTENT] AS 내용
          ,[PVPL_HOW] AS 검사방법
          ,[PVPL_STAND] AS 기준
          ,[PVPL_UNIT] AS 단위
          ,[PVPL_MIN] AS 최소
          ,[PVPL_MAX] AS 최대
          ,CONVERT(varchar, [PVPL_DATE], 23) AS 계획일
          ,CONVERT(varchar, [PVPL_WARN_DATE], 23) AS 예보일
          ,DATEDIFF(dd,CONVERT(varchar, GETDATE(), 23),CONVERT(varchar, [PVPL_DATE], 23)) AS 잔여일
          ,DATEDIFF(dd,CONVERT(varchar, GETDATE(), 23),CONVERT(varchar, [PVPL_WARN_DATE], 23)) AS 예보잔여일
          ,[PVPL_USER_ID] AS 담당자ID
          ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [PVPL_USER_ID]) AS 담당자
          ,(SELECT [USER_RANK] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [PVPL_USER_ID]) AS 직급
          ,(SELECT COUNT(*) FROM [QMES2022].[dbo].[MANAGE_PREVENT_TB] WHERE [PRVNT_PREVENT_PLAN_PK] = [PVPL_PK]) AS 계획완료수
          ,[PVPL_NOTE] AS 비고
          ,[PVPL_REGIST_NM] AS 등록자
          ,[PVPL_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_PREVENT_PLAN_TB]
      ) AS RESULT
      WHERE 계획완료수 < 1
      ORDER BY 계획일 ASC
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
      .input("구분", "예방보전통보" ?? "")
      .input(
        "제목",
        dayjs().format("YYYY-MM-DD HH:mm:ss") + " : " + res.body.result
      )
      .input(
        "내용",
        "계획일:" +
          (data.계획일 ?? "") +
          ", 설비명:" +
          (data.설비명 ?? "") +
          ", 구분:" +
          (data.구분 ?? "") +
          ", 내용:" +
          (data.내용 ?? "") +
          ", 담당자:" +
          (data.담당자 ?? "") +
          ", 직급:" +
          (data.직급 ?? "")
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
      .input("참조NO", data.예방보전계획NO ?? null)
      .input("구분", "예방보전통보")
      .input(
        "내용",
        "계획일:" +
          (data.계획일 ?? "") +
          ", 설비명:" +
          (data.설비명 ?? "") +
          ", 구분:" +
          (data.구분 ?? "") +
          ", 내용:" +
          (data.내용 ?? "") +
          ", 담당자:" +
          (data.담당자 ?? "") +
          ", 직급:" +
          (data.직급 ?? "")
      )
      .input("비고", "" ?? "")
      .input("등록자", "시스템" ?? "")
      .input("등록일시", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .query(`INSERT INTO [QMES2022].[dbo].[MANAGE_NOTICE_PREVENT_TB]
          ([NTPV_PREVENT_PLAN_PK]
          ,[NTPV_DIV]
          ,[NTPV_CONTENT]
          ,[NTPV_NOTE]
          ,[NTPV_REGIST_NM]
          ,[NTPV_REGIST_DT])
        VALUES
          (@참조NO,@구분,@내용,@비고,@등록자,@등록일시)
      `);
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = router;
