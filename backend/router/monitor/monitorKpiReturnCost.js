const express = require("express");
const moment = require("moment-timezone");
const bodyParser = require("body-parser");
// const database = require("./database");
const { sql, pool } = require("../../mssql");

const multer = require("multer"); // 파일 업로드에 필요
const path = require("path"); // 파일 업로드에 필요

const router = express.Router();

router.use(bodyParser.json());

router.use(express.urlencoded({ extended: false })); // 파일 업로드에 필요
router.use(express.json()); // 파일 업로드에 필요
router.use(express.static(`${__dirname}/public`)); // 파일 업로드에 필요

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// #### *** 로그기록 저장함수 *** ####
const logSend = async (type, ct, amount, user) => {
  const Pool = await pool;
  await Pool.request() // 로그기록 저장
    .input("type", type)
    .input("menu", "모니터링_반품금액(KPI)") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
    .input("content", ct.substr(0, 500))
    .input("amount", amount)
    .input("user", user)
    .input("dt", moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss"))
    .query(`
      INSERT INTO [QMES2022].[dbo].[MANAGE_LOG_TB]
      ([LOG_TYPE],[LOG_MENU],[LOG_CONTENT],[LOG_DATA_AMT],[LOG_REGIST_NM],[LOG_REGIST_DT])
      VALUES (@type,@menu,@content,@amount,@user,@dt)
    `);
};

// 조회
router.get("/", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [KRC_PK] AS NO
        ,[KRC_MONTH] AS 년월
        ,[KRC_COST] AS 반품금액
        ,[KRC_TARGET] AS 목표
        ,[KRC_NOTE] AS 비고
        ,[KRC_REGIST_NM] AS 등록자
        ,[KRC_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_KPI_RETURN_COST_TB]
      ORDER BY [KRC_MONTH] ASC
    `);

    // 로그기록 저장
    await logSend(
      (type = "메뉴열람"),
      (ct = "메뉴를 열람함."),
      (amount = result.recordset.length ?? 0),
      (user = req.query.user ?? "")
    );

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    // 로그기록 저장
    await logSend(
      (type = "에러"),
      (ct = err.message ?? ""),
      (amount = 0),
      (user = req.query.user ?? "")
    );
    res.status(500);
    res.send(err.message);
  }
});

router.post("/", async (req, res) => {
  try {
    var sql = "";
    sql =
      `
        SELECT
          [KRC_PK] AS NO
          ,[KRC_MONTH] AS 년월
          ,[KRC_COST] AS 반품금액
          ,[KRC_TARGET] AS 목표
          ,[KRC_NOTE] AS 비고
          ,[KRC_REGIST_NM] AS 등록자
          ,[KRC_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_KPI_RETURN_COST_TB]
        WHERE (1=1)
        AND LEFT([KRC_MONTH],4) = ` +
      req.body.searchInput +
      `
        ORDER BY [KRC_MONTH] ASC
      `;

    const Pool = await pool;
    const result = await Pool.request()
      .input("input", req.body.searchInput)
      .query(sql);

    // 로그기록 저장
    await logSend(
      (type = "조회"),
      (ct =
        req.body.searchKey +
        " 조건으로 '" +
        req.body.searchInput +
        "' 을 조회. (" +
        req.body.startDate +
        "-" +
        req.body.endDate +
        ")"),
      (amount = result.recordset.length ?? 0),
      (user = req.body.user ?? "")
    );

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    // 로그기록 저장
    await logSend(
      (type = "에러"),
      (ct = err.message ?? ""),
      (amount = 0),
      (user = req.body.user ?? "")
    );
    res.status(500);
    res.send(err.message);
  }
});

// 등록
router.post("/insert", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("년월", req.body.data.년월 ?? "")
      .input("반품금액", req.body.data.반품금액 ?? "")
      .input("목표", req.body.data.목표 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_KPI_RETURN_COST_TB]
          ([KRC_MONTH]
          ,[KRC_COST]
          ,[KRC_TARGET]
          ,[KRC_NOTE]
          ,[KRC_REGIST_NM]
          ,[KRC_REGIST_DT])
        VALUES
          (@년월,@반품금액,@목표,@비고,@등록자,@등록일시)
    `);

    // 로그기록 저장
    await logSend(
      (type = "등록"),
      (ct = JSON.stringify(req.body.data) + " 을 등록."),
      (amount = 1),
      (user = req.body.user ?? "")
    );

    res.send("등록완료");
  } catch (err) {
    // 로그기록 저장
    await logSend(
      (type = "에러"),
      (ct = err.message ?? ""),
      (amount = 0),
      (user = req.body.user ?? "")
    );
    res.status(500);
    res.send(err.message);
  }
});

// 한번에 등록
router.post("/insertAll", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      await Pool.request()
        .input("년월", req.body.data[i].년월 ?? "")
        .input("반품금액", req.body.data[i].반품금액 ?? "")
        .input("목표", req.body.data[i].목표 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_KPI_RETURN_COST_TB]
          ([KRC_MONTH]
          ,[KRC_COST]
          ,[KRC_TARGET]
          ,[KRC_NOTE]
          ,[KRC_REGIST_NM]
          ,[KRC_REGIST_DT])
        VALUES
          (@년월,@반품금액,@목표,@비고,@등록자,@등록일시)
    `);

      // 로그기록 저장
      await logSend(
        (type = "등록"),
        (ct = JSON.stringify(req.body.data[i]) + " 을 등록."),
        (amount = 1),
        (user = req.body.user ?? "")
      );
    }
    res.send("등록완료");
  } catch (err) {
    // 로그기록 저장
    await logSend(
      (type = "에러"),
      (ct = err.message ?? ""),
      (amount = 0),
      (user = req.body.user ?? "")
    );
    res.status(500);
    res.send(err.message);
  }
});

// 수정
router.post("/edit", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("NO", req.body.data.NO ?? 0)
      .input("년월", req.body.data.년월 ?? "")
      .input("반품금액", req.body.data.반품금액 ?? "")
      .input("목표", req.body.data.목표 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_KPI_RETURN_COST_TB]
          SET 
            [KRC_MONTH] = @년월
            ,[KRC_COST] = @반품금액
            ,[KRC_TARGET] = @목표
            ,[KRC_NOTE] = @비고
            ,[KRC_REGIST_NM] = @등록자
            ,[KRC_REGIST_DT] = @등록일시
          WHERE [KRC_PK] = @NO
    `);

    // 로그기록 저장
    await logSend(
      (type = "수정"),
      (ct = JSON.stringify(req.body.data) + " 으로 수정."),
      (amount = 1),
      (user = req.body.user ?? "")
    );

    res.send("수정완료");
  } catch (err) {
    // 로그기록 저장
    await logSend(
      (type = "에러"),
      (ct = err.message ?? ""),
      (amount = 0),
      (user = req.body.user ?? "")
    );
    res.status(500);
    res.send(err.message);
  }
});

// 삭제
router.post("/delete", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      const result = await Pool.request().input("key", req.body.data[i]).query(`
        SELECT
          [KRC_PK] AS NO
          ,[KRC_MONTH] AS 년월
          ,[KRC_COST] AS 반품금액
          ,[KRC_TARGET] AS 목표
          ,[KRC_NOTE] AS 비고
          ,[KRC_REGIST_NM] AS 등록자
          ,[KRC_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_KPI_RETURN_COST_TB]
        WHERE [KRC_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MANAGE_KPI_RETURN_COST_TB] WHERE [KRC_PK] = @key`
        );

      // 로그기록 저장
      await logSend(
        (type = "삭제"),
        (ct = JSON.stringify(result.recordset) + " 을 삭제."),
        (amount = 1),
        (user = req.body.user ?? "")
      );
    }
    res.send("삭제완료");
  } catch (err) {
    // 로그기록 저장
    await logSend(
      (type = "에러"),
      (ct = err.message ?? ""),
      (amount = 0),
      (user = req.body.user ?? "")
    );
    res.status(500);
    res.send(err.message);
  }
});

// ########################################   나머지 기능   #############################################################

module.exports = router;
