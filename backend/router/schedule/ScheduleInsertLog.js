const dayjs = require("dayjs");
const express = require("express");
const { sql, pool } = require("../../mssql");
const router = express.Router();

runSchedule(); //최초 즉시 실행

setInterval(() => runSchedule(), 3600000); // 이후 60분(3600초)마다 실행

async function runSchedule() {
  // 작업실행
  runTask();
}

// 작업 실행 함수
async function runTask() {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      INSERT INTO [QMES2022].[dbo].[MANAGE_LOG_TB]
        ([LOG_TYPE]
        ,[LOG_MENU]
        ,[LOG_CONTENT]
        ,[LOG_DATA_AMT]
        ,[LOG_REGIST_NM]
        ,[LOG_REGIST_DT])
      VALUES
        ('등록'
        ,'설비상태정보'
        ,'설비데이터등록'
        ,'60'
        ,'설비1'
        ,GETDATE())
    `);

    return result.recordset;
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = router;
