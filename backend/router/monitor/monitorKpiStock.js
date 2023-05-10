const express = require("express");
const bodyParser = require("body-parser");
// const database = require("./database");
const { sql, pool } = require("../../mssql");

const router = express.Router();
router.use(bodyParser.json());

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 조회
router.get("/", async (req, res) => {
  try {
    const Pool = await pool;
    // select
    const result = await Pool.request().query(
      "exec [QMES].[dbo].[MANAGE_KPI_STOCK_READ_SP]"
    );
    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const Pool = await pool;
    // select
    const result = await Pool.request().query(
      "exec [QMES].[dbo].[MANAGE_KPI_STOCK_READ_SP]"
    );
    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// 등록
router.post("/insert", async (req, res) => {
  try {
    const Pool = await pool;
    // select
    const result = await Pool.request()
      .input(
        "연월",
        sql.NVarChar,
        !req.body.data.연월 ? "" : req.body.data.연월
      )
      .input(
        "목표치",
        sql.NVarChar,
        !req.body.data.목표치 ? "" : req.body.data.목표치
      )
      .input(
        "측정치",
        sql.NVarChar,
        !req.body.data.측정치 ? "" : req.body.data.측정치
      )
      .query(
        "exec [QMES].[dbo].[MANAGE_KPI_STOCK_INS_SP] @연월,@목표치,@측정치"
      );
    res.send("등록완료");
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// 한번에 등록
router.post("/insertAll", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      // select
      Pool.request()
        .input(
          "연월",
          sql.NVarChar,
          !req.body.data[i].연월 ? "" : req.body.data[i].연월
        )
        .input(
          "목표치",
          sql.NVarChar,
          !req.body.data[i].목표치 ? "" : req.body.data[i].목표치
        )
        .input(
          "측정치",
          sql.NVarChar,
          !req.body.data[i].측정치 ? "" : req.body.data[i].측정치
        )
        .query(
          "exec [QMES].[dbo].[MANAGE_KPI_STOCK_INS_SP] @연월,@목표치,@측정치"
        );
    }
    res.send("등록완료");
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// 수정
router.post("/edit", async (req, res) => {
  try {
    const Pool = await pool;
    // select
    const result = await Pool.request()
      .input("기본키", sql.Int, req.body.data.NO)
      .input("연월", sql.NVarChar, req.body.data.연월)
      .input("목표치", sql.NVarChar, req.body.data.목표치)
      .input("측정치", sql.NVarChar, req.body.data.측정치)
      .query(
        "exec [QMES].[dbo].[MANAGE_KPI_STOCK_UDT_SP] @기본키,@연월,@목표치,@측정치"
      );
    res.send("수정완료");
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
  // res.send("GET 전송완료");
});

// 삭제
router.post("/delete", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      // insert
      await Pool.request()
        .input("key", sql.Int, req.body.data[i])
        .query(`exec [QMES].[dbo].[MANAGE_KPI_STOCK_DEL_SP] @key`);
    }
    res.send("삭제완료");
  } catch (err) {
    // console.log(err);
    res.status(500);
    res.send(err.message);
  }
});

module.exports = router;
