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
    .input("menu", "기준정보_품질기준정보") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [QAST_PK] AS NO
        ,[QAST_ITEM_PK] AS 품목NO
        ,ITEM.품목구분 AS 품목구분
        ,ITEM.품번 AS 품번
        ,ITEM.품명 AS 품명
        ,[QAST_IMAGE] AS 이미지
        ,[QAST_DIV] AS 구분
        ,[QAST_STAND1] AS 기준1
        ,[QAST_STAND2] AS 기준2
        ,[QAST_STAND3] AS 기준3
        ,[QAST_STAND4] AS 기준4
        ,[QAST_STAND5] AS 기준5
        ,[QAST_STAND6] AS 기준6
        ,[QAST_STAND7] AS 기준7
        ,[QAST_STAND8] AS 기준8
        ,[QAST_STAND9] AS 기준9
        ,[QAST_STAND10] AS 기준10
        ,[QAST_NOTE] AS 비고
        ,[QAST_REGIST_NM] AS 등록자
        ,[QAST_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
      LEFT JOIN
      (
        SELECT
          [ITEM_PK] AS NO
          ,[ITEM_DIV] AS 품목구분
          ,[ITEM_PRODUCT_NUM] AS 품번
          ,[ITEM_NAME] AS 품명
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
      ) AS ITEM ON ITEM.NO = [QAST_ITEM_PK]
      ORDER BY [QAST_PK] DESC
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
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 이미지 AS 이미지, 구분 AS 구분,
          기준1 AS 기준1, 기준2 AS 기준2, 기준3 AS 기준3, 기준4 AS 기준4, 기준5 AS 기준5, 기준6 AS 기준6, 기준7 AS 기준7,
          기준8 AS 기준8, 기준9 AS 기준9, 기준10 AS 기준10, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [QAST_PK] AS NO
            ,[QAST_ITEM_PK] AS 품목NO
            ,ITEM.구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,[QAST_IMAGE] AS 이미지
            ,[QAST_DIV] AS 구분
            ,[QAST_STAND1] AS 기준1
            ,[QAST_STAND2] AS 기준2
            ,[QAST_STAND3] AS 기준3
            ,[QAST_STAND4] AS 기준4
            ,[QAST_STAND5] AS 기준5
            ,[QAST_STAND6] AS 기준6
            ,[QAST_STAND7] AS 기준7
            ,[QAST_STAND8] AS 기준8
            ,[QAST_STAND9] AS 기준9
            ,[QAST_STAND10] AS 기준10
            ,[QAST_NOTE] AS 비고
            ,[QAST_REGIST_NM] AS 등록자
            ,[QAST_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = [QAST_ITEM_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 기준1 like concat('%',@input,'%')
        OR 기준2 like concat('%',@input,'%')
        OR 기준3 like concat('%',@input,'%')
        OR 기준4 like concat('%',@input,'%')
        OR 기준5 like concat('%',@input,'%')
        OR 기준6 like concat('%',@input,'%')
        OR 기준7 like concat('%',@input,'%')
        OR 기준8 like concat('%',@input,'%')
        OR 기준9 like concat('%',@input,'%')
        OR 기준10 like concat('%',@input,'%')
        OR 비고 like concat('%',@input,'%'))
        ORDER BY ` +
        req.body.sortKey +
        ` ` +
        req.body.sortOrder +
        `
      `;
    } else {
      sql =
        `
        SELECT
          NO AS NO, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번, 품명 AS 품명, 이미지 AS 이미지, 구분 AS 구분,
          기준1 AS 기준1, 기준2 AS 기준2, 기준3 AS 기준3, 기준4 AS 기준4, 기준5 AS 기준5, 기준6 AS 기준6, 기준7 AS 기준7,
          기준8 AS 기준8, 기준9 AS 기준9, 기준10 AS 기준10, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [QAST_PK] AS NO
            ,[QAST_ITEM_PK] AS 품목NO
            ,ITEM.구분 AS 품목구분
            ,ITEM.품번 AS 품번
            ,ITEM.품명 AS 품명
            ,[QAST_IMAGE] AS 이미지
            ,[QAST_DIV] AS 구분
            ,[QAST_STAND1] AS 기준1
            ,[QAST_STAND2] AS 기준2
            ,[QAST_STAND3] AS 기준3
            ,[QAST_STAND4] AS 기준4
            ,[QAST_STAND5] AS 기준5
            ,[QAST_STAND6] AS 기준6
            ,[QAST_STAND7] AS 기준7
            ,[QAST_STAND8] AS 기준8
            ,[QAST_STAND9] AS 기준9
            ,[QAST_STAND10] AS 기준10
            ,[QAST_NOTE] AS 비고
            ,[QAST_REGIST_NM] AS 등록자
            ,[QAST_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
          LEFT JOIN
          (
            SELECT
              [ITEM_PK] AS NO
              ,[ITEM_DIV] AS 구분
              ,[ITEM_PRODUCT_NUM] AS 품번
              ,[ITEM_NAME] AS 품명
            FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
          ) AS ITEM ON ITEM.NO = [QAST_ITEM_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ` +
        req.body.searchKey +
        ` like concat('%',@input,'%')
        ORDER BY ` +
        req.body.sortKey +
        ` ` +
        req.body.sortOrder +
        `
      `;
    }

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
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("이미지", req.body.data.이미지 ?? "")
      .input("구분", req.body.data.구분 ?? "")
      .input("기준1", req.body.data.기준1 ?? "")
      .input("기준2", req.body.data.기준2 ?? "")
      .input("기준3", req.body.data.기준3 ?? "")
      .input("기준4", req.body.data.기준4 ?? "")
      .input("기준5", req.body.data.기준5 ?? "")
      .input("기준6", req.body.data.기준6 ?? "")
      .input("기준7", req.body.data.기준7 ?? "")
      .input("기준8", req.body.data.기준8 ?? "")
      .input("기준9", req.body.data.기준9 ?? "")
      .input("기준10", req.body.data.기준10 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
          ([QAST_ITEM_PK]
          ,[QAST_IMAGE]
          ,[QAST_DIV]
          ,[QAST_STAND1]
          ,[QAST_STAND2]
          ,[QAST_STAND3]
          ,[QAST_STAND4]
          ,[QAST_STAND5]
          ,[QAST_STAND6]
          ,[QAST_STAND7]
          ,[QAST_STAND8]
          ,[QAST_STAND9]
          ,[QAST_STAND10]
          ,[QAST_NOTE]
          ,[QAST_REGIST_NM]
          ,[QAST_REGIST_DT])
        VALUES
          (@품목NO,@이미지,@구분,@기준1,@기준2,@기준3,@기준4,@기준5,@기준6,@기준7,@기준8,@기준9,@기준10,@비고,@등록자,@등록일시)
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
        .input("품목NO", req.body.data[i].품목NO ?? null)
        .input("이미지", req.body.data[i].이미지 ?? "")
        .input("구분", req.body.data[i].구분 ?? "")
        .input("기준1", req.body.data[i].기준1 ?? "")
        .input("기준2", req.body.data[i].기준2 ?? "")
        .input("기준3", req.body.data[i].기준3 ?? "")
        .input("기준4", req.body.data[i].기준4 ?? "")
        .input("기준5", req.body.data[i].기준5 ?? "")
        .input("기준6", req.body.data[i].기준6 ?? "")
        .input("기준7", req.body.data[i].기준7 ?? "")
        .input("기준8", req.body.data[i].기준8 ?? "")
        .input("기준9", req.body.data[i].기준9 ?? "")
        .input("기준10", req.body.data[i].기준10 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
          ([QAST_ITEM_PK]
          ,[QAST_IMAGE]
          ,[QAST_DIV]
          ,[QAST_STAND1]
          ,[QAST_STAND2]
          ,[QAST_STAND3]
          ,[QAST_STAND4]
          ,[QAST_STAND5]
          ,[QAST_STAND6]
          ,[QAST_STAND7]
          ,[QAST_STAND8]
          ,[QAST_STAND9]
          ,[QAST_STAND10]
          ,[QAST_NOTE]
          ,[QAST_REGIST_NM]
          ,[QAST_REGIST_DT])
        VALUES
          (@품목NO,@이미지,@구분,@기준1,@기준2,@기준3,@기준4,@기준5,@기준6,@기준7,@기준8,@기준9,@기준10,@비고,@등록자,@등록일시)
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
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("이미지", req.body.data.이미지 ?? "")
      .input("구분", req.body.data.구분 ?? "")
      .input("기준1", req.body.data.기준1 ?? "")
      .input("기준2", req.body.data.기준2 ?? "")
      .input("기준3", req.body.data.기준3 ?? "")
      .input("기준4", req.body.data.기준4 ?? "")
      .input("기준5", req.body.data.기준5 ?? "")
      .input("기준6", req.body.data.기준6 ?? "")
      .input("기준7", req.body.data.기준7 ?? "")
      .input("기준8", req.body.data.기준8 ?? "")
      .input("기준9", req.body.data.기준9 ?? "")
      .input("기준10", req.body.data.기준10 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
          SET 
            [QAST_ITEM_PK] = @품목NO
            ,[QAST_IMAGE] = @이미지
            ,[QAST_DIV] = @구분
            ,[QAST_STAND1] = @기준1
            ,[QAST_STAND2] = @기준2
            ,[QAST_STAND3] = @기준3
            ,[QAST_STAND4] = @기준4
            ,[QAST_STAND5] = @기준5
            ,[QAST_STAND6] = @기준6
            ,[QAST_STAND7] = @기준7
            ,[QAST_STAND8] = @기준8
            ,[QAST_STAND9] = @기준9
            ,[QAST_STAND10] = @기준10
            ,[QAST_NOTE] = @비고
            ,[QAST_REGIST_NM] = @등록자
            ,[QAST_REGIST_DT] = @등록일시
          WHERE [QAST_PK] = @NO
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
          [QAST_PK] AS NO
          ,[QAST_ITEM_PK] AS 품목NO
          ,ITEM.구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,[QAST_IMAGE] AS 이미지
          ,[QAST_DIV] AS 구분
          ,[QAST_STAND1] AS 기준1
          ,[QAST_STAND2] AS 기준2
          ,[QAST_STAND3] AS 기준3
          ,[QAST_STAND4] AS 기준4
          ,[QAST_STAND5] AS 기준5
          ,[QAST_STAND6] AS 기준6
          ,[QAST_STAND7] AS 기준7
          ,[QAST_STAND8] AS 기준8
          ,[QAST_STAND9] AS 기준9
          ,[QAST_STAND10] AS 기준10
          ,[QAST_NOTE] AS 비고
          ,[QAST_REGIST_NM] AS 등록자
          ,[QAST_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB]
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = [QAST_ITEM_PK]
        WHERE [QAST_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MASTER_QUALITY_STAND_TB] WHERE [QAST_PK] = @key`
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

// 파일 업로드
let fileUploadName = "";
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, done) => {
      done(null, "uploads/master/qualitystand");
    },
    filename: (req, file, done) => {
      file.originalname = Buffer.from(file.originalname, "latin1").toString(
        "utf8"
      );
      fileUploadName = "";
      const ext = path.extname(file.originalname);
      fileUploadName =
        path.basename(file.originalname, ext) + "_" + Date.now() + ext;
      done(null, fileUploadName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post("/upload", upload.single("file"), (req, res) => {
  res.send(fileUploadName);
});

// ########################################   나머지 기능   #############################################################

// 품목 조회
router.get("/product", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [ITEM_PK] AS NO
        ,[ITEM_CLIENT_PK] AS 거래처NO
        ,[ITEM_DIV] AS 구분
        ,[ITEM_PRODUCT_NUM] AS 품번
        ,[ITEM_NAME] AS 품명
        ,[ITEM_CAR] AS 차종
        ,[ITEM_SIZE] AS 규격
        ,[ITEM_UNIT] AS 단위
        ,[ITEM_SAFE] AS 안전재고
        ,[ITEM_COST] AS 단가
        ,[ITEM_NOTE] AS 비고
        ,[ITEM_REGIST_NM] AS 등록자
        ,[ITEM_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_ITEM_TB] 
      ORDER BY [ITEM_PK] DESC
    `);
    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

module.exports = router;
