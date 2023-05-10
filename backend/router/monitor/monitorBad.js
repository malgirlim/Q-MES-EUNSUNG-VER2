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
      "exec [QMES].[dbo].[STATUS_BAD_READ_SP] '전체','','010101','990101'"
    );
    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

router.post("/", async (req, res) => {
  try {
    let stardDate = "010101";
    let endDate = "990101";
    if (req.body.date != "전체기간") {
      stardDate = req.body.date.replace(/\//g, "").slice(0, 6);
      endDate = req.body.date.replace(/\//g, "").slice(-6);
    }

    const Pool = await pool;
    // select
    const result = await Pool.request()
      .input("key", sql.NVarChar, req.body.key)
      .input("input", sql.NVarChar, req.body.input)
      .input("startDate", sql.NVarChar, stardDate)
      .input("endDate", sql.NVarChar, endDate)
      .query(
        "exec [QMES].[dbo].[STATUS_BAD_READ_SP] @key,@input,@startDate,@endDate"
      );
    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

module.exports = router;
