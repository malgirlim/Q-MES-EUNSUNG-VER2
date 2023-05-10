const express = require("express");
const moment = require("moment-timezone");
const bodyParser = require("body-parser");
// const database = require("./database");
const { sql, pool } = require("../../mssql");

const router = express.Router();
router.use(bodyParser.json());

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// #### *** 로그기록 저장함수 *** ####
const logSend = async (type, ct, amount, user) => {
  const Pool = await pool;
  await Pool.request() // 로그기록 저장
    .input("type", type)
    .input("menu", "기준정보_설비부품관리") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [FCPT_PK] AS NO
        ,[FCPT_CLIENT_PK] AS 거래처NO
        ,CLIENT.거래처명 AS 거래처명
        ,[FCPT_FACILITY_PK] AS 설비NO
        ,FACILITY.설비명 AS 설비명
        ,[FCPT_DIV] AS 구분
        ,[FCPT_PRODUCT_NUM] AS 품번
        ,[FCPT_NAME] AS 품명
        ,[FCPT_CAR] AS 차종
        ,[FCPT_SIZE] AS 규격
        ,[FCPT_UNIT] AS 단위
        ,[FCPT_SAFE] AS 안전재고
        ,[FCPT_COST] AS 단가
        ,[FCPT_NOTE] AS 비고
        ,[FCPT_REGIST_NM] AS 등록자
        ,[FCPT_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
      LEFT JOIN
      (
        SELECT
          [CLNT_PK] AS NO
          ,[CLNT_NAME] AS 거래처명
        FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
      ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
      LEFT JOIN
      (
        SELECT
          [FCLT_PK] AS NO
          ,[FCLT_NAME] AS 설비명
        FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
      ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
      ORDER BY [FCPT_PK] DESC
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
          NO AS NO, 거래처NO AS 거래처NO, 설비NO AS 설비NO, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명, 차종 AS 차종,
          규격 AS 규격, 단위 AS 단위, 안전재고 AS 안전재고, 단가 AS 단가, 비고 AS 비고,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FCPT_PK] AS NO
            ,[FCPT_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[FCPT_FACILITY_PK] AS 설비NO
            ,FACILITY.설비명 AS 설비명
            ,[FCPT_DIV] AS 구분
            ,[FCPT_PRODUCT_NUM] AS 품번
            ,[FCPT_NAME] AS 품명
            ,[FCPT_CAR] AS 차종
            ,[FCPT_SIZE] AS 규격
            ,[FCPT_UNIT] AS 단위
            ,[FCPT_SAFE] AS 안전재고
            ,[FCPT_COST] AS 단가
            ,[FCPT_NOTE] AS 비고
            ,[FCPT_REGIST_NM] AS 등록자
            ,[FCPT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [FCLT_PK] AS NO
              ,[FCLT_NAME] AS 설비명
            FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
          ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
        ) AS RESULT
        WHERE (1=1)
        AND ( 구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 차종 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 안전재고 like concat('%',@input,'%')
        OR 단가 like concat('%',@input,'%')
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
          NO AS NO, 거래처NO AS 거래처NO, 설비NO AS 설비NO, 구분 AS 구분, 품번 AS 품번, 품명 AS 품명, 차종 AS 차종,
          규격 AS 규격, 단위 AS 단위, 안전재고 AS 안전재고, 단가 AS 단가, 비고 AS 비고,
          등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
          SELECT
            [FCPT_PK] AS NO
            ,[FCPT_CLIENT_PK] AS 거래처NO
            ,CLIENT.거래처명 AS 거래처명
            ,[FCPT_FACILITY_PK] AS 설비NO
            ,FACILITY.설비명 AS 설비명
            ,[FCPT_DIV] AS 구분
            ,[FCPT_PRODUCT_NUM] AS 품번
            ,[FCPT_NAME] AS 품명
            ,[FCPT_CAR] AS 차종
            ,[FCPT_SIZE] AS 규격
            ,[FCPT_UNIT] AS 단위
            ,[FCPT_SAFE] AS 안전재고
            ,[FCPT_COST] AS 단가
            ,[FCPT_NOTE] AS 비고
            ,[FCPT_REGIST_NM] AS 등록자
            ,[FCPT_REGIST_DT] AS 등록일시
          FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          LEFT JOIN
          (
            SELECT
              [CLNT_PK] AS NO
              ,[CLNT_NAME] AS 거래처명
            FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ) AS CLIENT ON CLIENT.NO = [FCPT_CLIENT_PK]
          LEFT JOIN
          (
            SELECT
              [FCLT_PK] AS NO
              ,[FCLT_NAME] AS 설비명
            FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
          ) AS FACILITY ON FACILITY.NO = [FCPT_FACILITY_PK]
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
        "' 을 조회."),
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
      .input("거래처NO", req.body.data.거래처NO ?? null)
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("품번", req.body.data.품번 ?? "")
      .input("품명", req.body.data.품명 ?? "")
      .input("차종", req.body.data.차종 ?? "")
      .input("규격", req.body.data.규격 ?? "")
      .input("단위", req.body.data.단위 ?? "")
      .input("안전재고", req.body.data.안전재고 ?? "")
      .input("단가", req.body.data.단가 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          ([FCPT_CLIENT_PK]
          ,[FCPT_FACILITY_PK]
          ,[FCPT_DIV]
          ,[FCPT_PRODUCT_NUM]
          ,[FCPT_NAME]
          ,[FCPT_CAR]
          ,[FCPT_SIZE]
          ,[FCPT_UNIT]
          ,[FCPT_SAFE]
          ,[FCPT_COST]
          ,[FCPT_NOTE]
          ,[FCPT_REGIST_NM]
          ,[FCPT_REGIST_DT])
        VALUES
          (@거래처NO,@설비NO,@구분,@품번,@품명,@차종,@규격,@단위,@안전재고,@단가,@비고,@등록자,@등록일시)
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
        .input("거래처NO", req.body.data[i].거래처NO ?? null)
        .input("설비NO", req.body.data[i].설비NO ?? null)
        .input("구분", req.body.data[i].구분 ?? "")
        .input("품번", req.body.data[i].품번 ?? "")
        .input("품명", req.body.data[i].품명 ?? "")
        .input("차종", req.body.data[i].차종 ?? "")
        .input("규격", req.body.data[i].규격 ?? "")
        .input("단위", req.body.data[i].단위 ?? "")
        .input("안전재고", req.body.data[i].안전재고 ?? "")
        .input("단가", req.body.data[i].단가 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          ([FCPT_CLIENT_PK]
          ,[FCPT_FACILITY_PK]
          ,[FCPT_DIV]
          ,[FCPT_PRODUCT_NUM]
          ,[FCPT_NAME]
          ,[FCPT_CAR]
          ,[FCPT_SIZE]
          ,[FCPT_UNIT]
          ,[FCPT_SAFE]
          ,[FCPT_COST]
          ,[FCPT_NOTE]
          ,[FCPT_REGIST_NM]
          ,[FCPT_REGIST_DT])
        VALUES
          (@거래처NO,@설비NO,@구분,@품번,@품명,@차종,@규격,@단위,@안전재고,@단가,@비고,@등록자,@등록일시)
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
      .input("거래처NO", req.body.data.거래처NO ?? null)
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input("품번", req.body.data.품번 ?? "")
      .input("품명", req.body.data.품명 ?? "")
      .input("차종", req.body.data.차종 ?? "")
      .input("규격", req.body.data.규격 ?? "")
      .input("단위", req.body.data.단위 ?? "")
      .input("안전재고", req.body.data.안전재고 ?? "")
      .input("단가", req.body.data.단가 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
          SET 
            [FCPT_CLIENT_PK] = @거래처NO
            ,[FCPT_FACILITY_PK] = @설비NO
            ,[FCPT_DIV] = @구분
            ,[FCPT_PRODUCT_NUM] = @품번
            ,[FCPT_NAME] = @품명
            ,[FCPT_CAR] = @차종
            ,[FCPT_SIZE] = @규격
            ,[FCPT_UNIT] = @단위
            ,[FCPT_SAFE] = @안전재고
            ,[FCPT_COST] = @단가
            ,[FCPT_NOTE] = @비고
            ,[FCPT_REGIST_NM] = @등록자
            ,[FCPT_REGIST_DT] = @등록일시
          WHERE [FCPT_PK] = @NO
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
          [FCPT_PK] AS NO
          ,[FCPT_CLIENT_PK] AS 거래처NO
          ,[FCPT_FACILITY_PK] AS 설비NO
          ,[FCPT_DIV] AS 구분
          ,[FCPT_PRODUCT_NUM] AS 품번
          ,[FCPT_NAME] AS 품명
          ,[FCPT_CAR] AS 차종
          ,[FCPT_SIZE] AS 규격
          ,[FCPT_UNIT] AS 단위
          ,[FCPT_SAFE] AS 안전재고
          ,[FCPT_COST] AS 단가
          ,[FCPT_NOTE] AS 비고
          ,[FCPT_REGIST_NM] AS 등록자
          ,[FCPT_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB]
        WHERE [FCPT_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MASTER_FACILITY_PART_TB] WHERE [FCPT_PK] = @key`
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

// 거래처 데이터
router.get("/client", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [CLNT_PK] AS NO
        ,[CLNT_CODE] AS 코드
        ,[CLNT_DIV] AS 구분
        ,[CLNT_NAME] AS 거래처명
        ,[CLNT_BUSINESS_NO] AS 사업자번호
        ,[CLNT_ADDRESS] AS 주소
        ,[CLNT_TEL] AS 전화번호
        ,[CLNT_PHONE] AS 휴대폰번호
        ,[CLNT_FAX] AS 팩스
        ,[CLNT_EMAIL] AS 이메일
        ,[CLNT_AGENT] AS 담당자
        ,[CLNT_NOTE] AS 비고
        ,[CLNT_REGIST_NM] AS 등록자
        ,[CLNT_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
      ORDER BY [CLNT_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// 설비 데이터
router.get("/facility", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [FCLT_PK] AS NO
        ,[FCLT_NAME] AS 설비명
        ,[FCLT_LINE] AS 라인
        ,[FCLT_SIZE] AS 규격
        ,[FCLT_CLIENT_PK] AS 거래처NO
        ,[FCLT_BUY_DATE] AS 구입일
        ,[FCLT_COST] AS 금액
        ,[FCLT_PLACE] AS 장소
        ,[FCLT_IMAGE] AS 사진
        ,[FCLT_NOTE] AS 비고
        ,[FCLT_REGIST_NM] AS 등록자
        ,[FCLT_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
      ORDER BY [FCLT_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

module.exports = router;
