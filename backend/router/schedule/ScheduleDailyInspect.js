const dayjs = require("dayjs");
const express = require("express");
const { sql, pool } = require("../../mssql");
const router = express.Router();

runSchedule(); //최초 즉시 실행

setInterval(() => runSchedule(), 60000); // 이후 60초마다 실행

async function runSchedule() {
  // 판단 조건 가져오기
  // const judge_stand = await getJudgeStand();

  // 판단조건이 여러개인 경우가 있으므로 for문 실행
  // for (let judge of judge_stand) {

  // 판단조건이 참이면 실행
  if ("00:00" == dayjs().format("HH:mm")) {
    // 참고할 데이터 가져오기
    // const refer_data = await getReferData();

    // 참고할 데이터가 여러개인 경우가 있으므로 for문 실행
    // for (let data of refer_data) {

    // 참고데이터의 기준을 판단 // 예 : data.필수점검 == "Y"
    // if (true) {

    // 작업실행
    runTask();

    // }
    // }
  }
  // }
}

// 판단기준 가져오는 함수
async function getJudgeStand() {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT 0 AS NO
    `);

    return result.recordset;
  } catch (err) {
    console.log(err.message);
  }
}

// 작업 실행 함수
async function runTask() {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      INSERT INTO [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_TB]
        ([DISPT_DAILY_INSPECT_PLAN_PK]
        ,[DISPT_CONTENT]
        ,[DISPT_RESULT]
        ,[DISPT_NOTE]
        ,[DISPT_REGIST_NM]
        ,[DISPT_REGIST_DT])
      SELECT
        [DISPP_PK]
        ,''
        ,'미점검'
        ,''
        ,'시스템'
        ,GETDATE()
      FROM [QMES2022].[dbo].[MANAGE_DAILY_INSPECT_PLAN_TB]
    `);

    return result.recordset;
  } catch (err) {
    console.log(err.message);
  }
}

// 참고할 데이터 가져오는 함수
async function getReferData() {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT 0 AS NO
    `);

    return result.recordset;
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = router;
