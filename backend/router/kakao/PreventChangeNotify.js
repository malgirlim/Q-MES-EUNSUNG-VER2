const dayjs = require("dayjs");
const express = require("express");
const request = require("request");
const { sql, pool } = require("../../mssql");
const router = express.Router();

const kakaoSendData = {
  수신번호: "010-3258-2466",
  설비명: "인쇄1호기",
  부품명: "TEST부품",
  구분: "테스트구분",
  내용: "테스트내용",
  담당자: "고범석",
  직급: "주임",
};

const options = {
  uri: "http://aligo.qmes.co.kr/q-api/kakao/preventchangenotify/send",
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
        if (data.설비NO == judge.설비NO && 0 == data.잔여일) {
          kakaoSendData.설비명 = data.설비명 ?? "";
          kakaoSendData.부품명 = data.부품명 ?? "";
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
      WHERE [ALST_DIV] = 'PreventChangeNotify'
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
        NO AS 설비부품교체NO
        ,설비NO AS 설비NO
        ,계획교체일 AS 계획일
        ,잔여일 AS 잔여일
        ,설비명 AS 설비명
        ,품명 AS 부품명
        ,CONCAT('계획사용횟수 :',계획사용횟수) AS 구분
        ,'계획교체예정일입니다.' AS 내용
        ,담당자 AS 담당자
        ,직급 AS 직급
      FROM
      (

        SELECT
          [FPLPL_PK] AS NO
          ,[FPLPL_FACILITY_PK] AS 설비NO
          ,(SELECT [FCLT_NAME] FROM [QMES2022].[dbo].[MASTER_FACILITY_TB] WHERE [FCLT_PK] = [FPLPL_FACILITY_PK]) AS 설비명
          ,[FPLPL_FACILITY_PART_PK] AS 설비부품NO
          ,FACILITY_PART.품번 AS 품번
          ,FACILITY_PART.구분 AS 품목구분
          ,FACILITY_PART.품명 AS 품명
          ,FACILITY_PART.규격 AS 규격
          ,FACILITY_PART.단위 AS 단위
          ,[FPLPL_COUNT] AS 계획사용횟수
          ,CONVERT(VARCHAR, [FPLPL_DATE], 23) AS 계획교체일
          ,DATEDIFF(dd,CONVERT(varchar, GETDATE(), 23),CONVERT(varchar, [FPLPL_DATE], 23)) AS 잔여일
          ,[FPLPL_CHECK] AS 교체확인
          ,[FPLPL_USER_ID] AS 담당자ID
          ,(SELECT [USER_NAME] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FPLPL_USER_ID]) AS 담당자
          ,(SELECT [USER_RANK] FROM [QMES2022].[dbo].[MASTER_USER_TB] WHERE [USER_ID] = [FPLPL_USER_ID]) AS 직급
          ,[FPLPL_NOTE] AS 비고
          ,[FPLPL_REGIST_NM] AS 등록자
          ,[FPLPL_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_FACILITY_PART_LIFE_PLAN_TB]
        LEFT JOIN
        (
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
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
        ) AS FACILITY_PART ON FACILITY_PART.NO = [FPLPL_FACILITY_PART_PK]
        WHERE [FPLPL_CHECK] = 'N'
      ) AS RESULT
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
      .input("구분", "설비부품교체통보" ?? "")
      .input(
        "제목",
        dayjs().format("YYYY-MM-DD HH:mm:ss") + " : " + res.body.result
      )
      .input(
        "내용",
        "계획일:" +
          (data.계획일 ?? "") +
          ", 설비명:" +
          (data.부품명 ?? "") +
          ", 부품명:" +
          (data.부품명 ?? "") +
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
      .input("참조NO", data.설비부품교체NO ?? null)
      .input("구분", "설비부품교체통보")
      .input(
        "내용",
        "계획일:" +
          (data.계획일 ?? "") +
          ", 설비명:" +
          (data.부품명 ?? "") +
          ", 부품명:" +
          (data.부품명 ?? "") +
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
      .query(`INSERT INTO [QMES2022].[dbo].[MANAGE_NOTICE_FACILITY_PART_TB]
          ([NTFCP_FC_PART_LIFE_PLAN_PK]
          ,[NTFCP_DIV]
          ,[NTFCP_CONTENT]
          ,[NTFCP_NOTE]
          ,[NTFCP_REGIST_NM]
          ,[NTFCP_REGIST_DT])
        VALUES
          (@참조NO,@구분,@내용,@비고,@등록자,@등록일시)
      `);
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = router;
