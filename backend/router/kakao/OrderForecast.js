const dayjs = require("dayjs");
const express = require("express");
const request = require("request");
const { sql, pool } = require("../../mssql");
const router = express.Router();

let kakaoSendData = {
  수신번호: "010-3258-2466",
  납기잔여일: "3",
  수주코드: "RES111003323",
  거래처명: "TEST거래처",
  품명: "TEST품명",
  수량: "100",
  납기일: "2023-06-15",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/orderforecast/send",
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
        // 발송시점의 기준을 판단
        if (data.납기잔여일 == judge.발송시점) {
          kakaoSendData.납기잔여일 = data.납기잔여일 ?? "";
          kakaoSendData.수주코드 = data.수주코드 ?? "";
          kakaoSendData.거래처명 = data.거래처명 ?? "";
          kakaoSendData.품명 = data.품명 ?? "";
          kakaoSendData.수량 = data.수량 ?? "";
          kakaoSendData.납기일 = data.납기일 ?? "";

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
      WHERE [ALST_DIV] = 'OrderForecast'
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
        수주NO AS 수주NO
        ,CAST(납기잔여일 AS VARCHAR) AS 납기잔여일
        ,CAST(수주코드 AS VARCHAR) AS 수주코드
        ,CAST(거래처명 AS VARCHAR) AS 거래처명
        ,CAST(품명 AS VARCHAR) AS 품명
        ,CAST(수량 AS VARCHAR) AS 수량
        ,CAST(납기일 AS VARCHAR) AS 납기일
        ,수량 - 납품수 AS 남은수량
      FROM
      (
        SELECT
          [ACPT_PK] AS 수주NO
          ,DATEDIFF(dd,CONVERT(varchar, GETDATE(), 23),CONVERT(varchar, [ACPT_DELIVERY_DATE], 23)) AS 납기잔여일
          ,[ACPT_CODE] AS 수주코드
          ,(SELECT [CLNT_NAME] FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = [ACPT_CLIENT_PK]) AS 거래처명
          ,[ACPT_ITEM_PK] AS 품목NO
          ,ITEM.품목구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,COALESCE(CONVERT(numeric,COALESCE([ACPT_AMOUNT],0)),0) AS 수량
          ,CONVERT(varchar, [ACPT_DELIVERY_DATE], 23) AS 납기일
          ,(SELECT COALESCE(SUM(CONVERT(numeric,[DLVR_AMOUNT])),0) FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB] WHERE [DLVR_ACCEPT_PK] = [ACPT_PK]) AS 납품수
        FROM [QMES2022].[dbo].[MANAGE_ACCEPT_TB]
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = [ACPT_ITEM_PK]
      ) AS RESULT
      WHERE (수량 - 납품수) > 0
      ORDER BY 납기일 ASC
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
      .input("구분", "수주대비납품예보" ?? "")
      .input(
        "제목",
        dayjs().format("YYYY-MM-DD HH:mm:ss") + " : " + res.body.result
      )
      .input(
        "내용",
        "납기잔여일:" +
          (data.납기잔여일 ?? "") +
          ", 수주코드:" +
          (data.수주코드 ?? "") +
          ", 거래처명:" +
          (data.거래처명 ?? "") +
          ", 품명:" +
          (data.품명 ?? "") +
          ", 수량:" +
          (data.수량 ?? "") +
          ", 납기일:" +
          (data.납기일 ?? "")
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
      .input("참조NO", data.수주NO ?? null)
      .input("구분", "수주대비납품예보")
      .input(
        "내용",
        "납기잔여일:" +
          (data.납기잔여일 ?? "") +
          ", 수주코드:" +
          (data.수주코드 ?? "") +
          ", 거래처명:" +
          (data.거래처명 ?? "") +
          ", 품명:" +
          (data.품명 ?? "") +
          ", 수량:" +
          (data.수량 ?? "") +
          ", 납기일:" +
          (data.납기일 ?? "")
      )
      .input("비고", "" ?? "")
      .input("등록자", "시스템" ?? "")
      .input("등록일시", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .query(`INSERT INTO [QMES2022].[dbo].[MANAGE_WARNING_DELIVERY_TB]
                ([WNDL_ACCEPT_PK]
                ,[WNDL_DIV]
                ,[WNDL_CONTENT]
                ,[WNDL_NOTE]
                ,[WNDL_REGIST_NM]
                ,[WNDL_REGIST_DT])
              VALUES
                (@참조NO,@구분,@내용,@비고,@등록자,@등록일시)
      `);
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = router;
