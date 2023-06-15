const dayjs = require("dayjs");
const express = require("express");
const request = require("request");
const { sql, pool } = require("../../mssql");
const router = express.Router();

const kakaoSendData = {
  수신번호: "010-3258-2466",
  미달건수: "5",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/stocksafenotify/send",
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
      // for (let data of send_data) {
      // 설비NO과 발송시점의 기준을 판단
      // if (data.설비NO == judge.설비NO) {
      kakaoSendData.미달건수 = send_data.length ?? 0;

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
          insertAlertLog(user, kakaoSendData, res);
        });
      }

      // 수주대비납품 예보에 등록하기
      insertForecastNotify(kakaoSendData);
      // }
      // }
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
      WHERE [ALST_DIV] = 'StockSafeNotify'
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
    const result = await Pool.request().query(
      `
      SELECT
        품목NO AS 품목NO
        ,품목구분 AS 품목구분
        ,품번 AS 품번
        ,품명 AS 품명
        ,규격 AS 규격
        ,단위 AS 단위
        ,입고 AS 입고
        ,사용 AS 사용
        ,출하 AS 출하
        ,재고 AS 재고
        ,안전재고 AS 안전재고
      FROM
      (
        SELECT
          MASTER_ITEM.[ITEM_PK] AS 품목NO
          ,MASTER_ITEM.[ITEM_DIV] AS 품목구분
          ,MASTER_ITEM.[ITEM_PRODUCT_NUM] AS 품번
          ,MASTER_ITEM.[ITEM_NAME] AS 품명
          ,MASTER_ITEM.[ITEM_SIZE] AS 규격
          ,MASTER_ITEM.[ITEM_UNIT] AS 단위
          ,COALESCE(입고_MIDDLE.입고수,0) AS 입고
          ,COALESCE(사용_MIDDLE.사용수,0) AS 사용
          ,COALESCE(출하_MIDDLE.출하수,0) AS 출하
          ,COALESCE(입고_MIDDLE.입고수,0) - COALESCE(사용_MIDDLE.사용수,0) - COALESCE(출하_MIDDLE.출하수,0) AS 재고
          ,COALESCE(MASTER_ITEM.[ITEM_SAFE],0) AS 안전재고
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB] AS MASTER_ITEM
        LEFT JOIN
        (
          SELECT
            [ITRC_ITEM_PK] AS 품목NO
            ,SUM(CONVERT(numeric, COALESCE([ITRC_AMOUNT],0))) AS 입고수
          FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
          WHERE (1=1)
          AND CONVERT(VARCHAR, [ITRC_DT], 12) >= '000101'
          AND CONVERT(VARCHAR, [ITRC_DT], 12) <= '990101'
          GROUP BY [ITRC_ITEM_PK]
        ) AS 입고_MIDDLE ON 입고_MIDDLE.품목NO = MASTER_ITEM.ITEM_PK
        LEFT JOIN
        (
          SELECT
            [PDUI_ITEM_PK] AS 품목NO
            ,SUM(CONVERT(numeric, COALESCE([PDUI_AMOUNT],0))) AS 사용수
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
          WHERE (1=1)
          AND CONVERT(VARCHAR, [PDUI_DT], 12) >= '000101'
          AND CONVERT(VARCHAR, [PDUI_DT], 12) <= '990101'
          GROUP BY [PDUI_ITEM_PK]
        ) AS 사용_MIDDLE ON 사용_MIDDLE.품목NO = MASTER_ITEM.ITEM_PK
        LEFT JOIN
        (
                SELECT
            [DLVR_ITEM_PK] AS 품목NO
            ,COALESCE(SUM(CONVERT(numeric, [DLVR_AMOUNT])),0) AS 출하수
                FROM [QMES2022].[dbo].[MANAGE_DELIVERY_TB]
                WHERE (1 = 1)
                AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) >= '000101'
                AND CONVERT(VARCHAR, CONVERT(datetime, [DLVR_DT]), 12) <= '990101'
                AND [DLVR_RESULT] = '합격'
                GROUP BY [DLVR_ITEM_PK]
        ) AS 출하_MIDDLE ON 출하_MIDDLE.품목NO = MASTER_ITEM.ITEM_PK
      ) AS RESULT
      WHERE RESULT.안전재고 >= RESULT.재고
      ORDER BY RESULT.품번 DESC
    `
    );

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
      .input("구분", "안전재고미달통보" ?? "")
      .input(
        "제목",
        dayjs().format("YYYY-MM-DD HH:mm:ss") + " : " + res.body.result
      )
      .input("내용", "미달건수:" + (data.미달건수 ?? ""))
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
      .input("구분", "안전재고미달통보")
      .input("내용", "미달건수:" + (data.미달건수 ?? ""))
      .input("비고", "" ?? "")
      .input("등록자", "시스템" ?? "")
      .input("등록일시", dayjs().format("YYYY-MM-DD HH:mm:ss"))
      .query(`INSERT INTO [QMES2022].[dbo].[MANAGE_NOTICE_SAFESTOCK_TB]
          ([NTSFST_DIV]
          ,[NTSFST_CONTENT]
          ,[NTSFST_NOTE]
          ,[NTSFST_REGIST_NM]
          ,[NTSFST_REGIST_DT])
        VALUES
          (@구분,@내용,@비고,@등록자,@등록일시)
      `);
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = router;
