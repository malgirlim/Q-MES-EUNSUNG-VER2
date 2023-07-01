const dayjs = require("dayjs");
const express = require("express");
const { sql, pool } = require("../../mssql");
const router = express.Router();

const axios = require("axios");

var http = require("http");

const APISendData = {
  crtfcKey: "로그API인증키",
  logDt: "로그일시",
  useSe: "접속구분",
  sysUser: "사용자",
  conectIp: "IP정보",
  dataUsgqty: "데이터사용량(숫자)",
};

runSchedule(); //최초 즉시 실행

setInterval(() => runSchedule(), 600000); // 이후 10분(600초)마다 실행

async function runSchedule() {
  const refer_data = await getReferData();

  // 보낼 데이터가 여러개인 경우가 있으므로 for문 실행
  for (let data of refer_data) {
    let ipData = await httpGet("http://api64.ipify.org");

    if (data.타입 == "로그인") APISendData.useSe = "접속";
    else if (data.타입 == "로그아웃 ") APISendData.useSe = "종료";
    else APISendData.useSe = data.타입;

    APISendData.logDt = data.등록일시;
    APISendData.sysUser = data.등록자;
    APISendData.conectIp = ipData;
    APISendData.dataUsgqty = data.데이터사용량;

    // console.log(encodeURIComponent(JSON.stringify(APISendData)));

    // 작업실행
    runTask();
    // }
  }
}

// 작업 실행 함수
async function runTask() {
  try {
    await axios
      .get(
        "https://log.smart-factory.kr/apisvc/sendLogDataJSON.do?logData=" +
          encodeURIComponent(JSON.stringify(APISendData))
      )
      .then((res) => {
        // console.log(res.data.result);
      });
  } catch (err) {
    console.log(err);
  }
}

// 참고할 데이터 가져오는 함수
async function getReferData() {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT TOP(1)
        [LOG_PK] AS NO
        ,[LOG_TYPE] AS 타입
        ,[LOG_MENU] AS 메뉴
        ,[LOG_CONTENT] AS 내용
        ,[LOG_DATA_AMT] AS 데이터사용량
        ,[LOG_REGIST_NM] AS 등록자
        ,CONVERT(varchar, [LOG_REGIST_DT], 21) AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_LOG_TB]
      ORDER BY [LOG_REGIST_DT] DESC
    `);

    return result.recordset;
  } catch (err) {
    console.log(err.message);
  }
}

// ip 가져오는 함수
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (resp) => {
        let data = "";
        resp.on("data", (chunk) => {
          data += chunk;
        });

        resp.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

module.exports = router;
