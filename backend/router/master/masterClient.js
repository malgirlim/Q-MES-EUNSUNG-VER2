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
    .input("menu", "기준정보_거래처관리") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 거래처명 AS 거래처명, 사업자번호 AS 사업자번호,
          주소 AS 주소, 전화번호 AS 전화번호, 휴대폰번호 AS 휴대폰번호, 팩스 AS 팩스,
          이메일 AS 이메일, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
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
        ) AS RESULT
        WHERE (1=1)
        AND ( 코드 like concat('%',@input,'%')
        OR 구분 like concat('%',@input,'%')
        OR 거래처명 like concat('%',@input,'%')
        OR 사업자번호 like concat('%',@input,'%')
        OR 주소 like concat('%',@input,'%')
        OR 전화번호 like concat('%',@input,'%')
        OR 휴대폰번호 like concat('%',@input,'%')
        OR 팩스 like concat('%',@input,'%')
        OR 이메일 like concat('%',@input,'%')
        OR 담당자 like concat('%',@input,'%')
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
          NO AS NO, 코드 AS 코드, 구분 AS 구분, 거래처명 AS 거래처명, 사업자번호 AS 사업자번호,
          주소 AS 주소, 전화번호 AS 전화번호, 휴대폰번호 AS 휴대폰번호, 팩스 AS 팩스,
          이메일 AS 이메일, 담당자 AS 담당자, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
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
      .input("코드", req.body.data.코드 ?? "")
      .input("구분", req.body.data.구분 ?? "")
      .input("거래처명", req.body.data.거래처명 ?? "")
      .input("사업자번호", businessFormat(req.body.data.사업자번호) ?? "")
      .input("주소", req.body.data.주소 ?? "")
      .input("전화번호", telFormat(req.body.data.전화번호) ?? "")
      .input("휴대폰번호", telFormat(req.body.data.휴대폰번호) ?? "")
      .input("팩스", telFormat(req.body.data.팩스) ?? "")
      .input("이메일", req.body.data.이메일 ?? "")
      .input("담당자", req.body.data.담당자 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ([CLNT_CODE]
          ,[CLNT_DIV]
          ,[CLNT_NAME]
          ,[CLNT_BUSINESS_NO]
          ,[CLNT_ADDRESS]
          ,[CLNT_TEL]
          ,[CLNT_PHONE]
          ,[CLNT_FAX]
          ,[CLNT_EMAIL]
          ,[CLNT_AGENT]
          ,[CLNT_NOTE]
          ,[CLNT_REGIST_NM]
          ,[CLNT_REGIST_DT])
        VALUES
          (@코드,@구분,@거래처명,@사업자번호,@주소,@전화번호,@휴대폰번호,@팩스,@이메일,@담당자,@비고,@등록자,@등록일시)
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
        .input("코드", req.body.data[i].코드 ?? "")
        .input("구분", req.body.data[i].구분 ?? "")
        .input("거래처명", req.body.data[i].거래처명 ?? "")
        .input("사업자번호", businessFormat(req.body.data[i].사업자번호) ?? "")
        .input("주소", req.body.data[i].주소 ?? "")
        .input("전화번호", telFormat(req.body.data[i].전화번호) ?? "")
        .input("휴대폰번호", telFormat(req.body.data[i].휴대폰번호) ?? "")
        .input("팩스", telFormat(req.body.data[i].팩스) ?? "")
        .input("이메일", req.body.data[i].이메일 ?? "")
        .input("담당자", req.body.data[i].담당자 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
        INSERT INTO [QMES2022].[dbo].[MASTER_CLIENT_TB]
          ([CLNT_CODE]
          ,[CLNT_DIV]
          ,[CLNT_NAME]
          ,[CLNT_BUSINESS_NO]
          ,[CLNT_ADDRESS]
          ,[CLNT_TEL]
          ,[CLNT_PHONE]
          ,[CLNT_FAX]
          ,[CLNT_EMAIL]
          ,[CLNT_AGENT]
          ,[CLNT_NOTE]
          ,[CLNT_REGIST_NM]
          ,[CLNT_REGIST_DT])
        VALUES
          (@코드,@구분,@거래처명,@사업자번호,@주소,@전화번호,@휴대폰번호,@팩스,@이메일,@담당자,@비고,@등록자,@등록일시)
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
      .input("코드", req.body.data.코드 ?? "")
      .input("구분", req.body.data.구분 ?? "")
      .input("거래처명", req.body.data.거래처명 ?? "")
      .input("사업자번호", businessFormat(req.body.data.사업자번호) ?? "")
      .input("주소", req.body.data.주소 ?? "")
      .input("전화번호", telFormat(req.body.data.전화번호) ?? "")
      .input("휴대폰번호", telFormat(req.body.data.휴대폰번호) ?? "")
      .input("팩스", telFormat(req.body.data.팩스) ?? "")
      .input("이메일", req.body.data.이메일 ?? "")
      .input("담당자", req.body.data.담당자 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MASTER_CLIENT_TB]
          SET 
          [CLNT_CODE] = @코드
          ,[CLNT_DIV] = @구분
          ,[CLNT_NAME] = @거래처명
          ,[CLNT_BUSINESS_NO] = @사업자번호
          ,[CLNT_ADDRESS] = @주소
          ,[CLNT_TEL] = @전화번호
          ,[CLNT_PHONE] = @휴대폰번호
          ,[CLNT_FAX] = @팩스
          ,[CLNT_EMAIL] = @이메일
          ,[CLNT_AGENT] = @담당자
          ,[CLNT_NOTE] = @비고
          ,[CLNT_REGIST_NM] = @등록자
          ,[CLNT_REGIST_DT] = @등록일시
        WHERE [CLNT_PK] = @NO
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
        WHERE [CLNT_PK] = @key
      `);

      await Pool.request()
        .input("key", req.body.data[i])
        .query(
          `DELETE FROM [QMES2022].[dbo].[MASTER_CLIENT_TB] WHERE [CLNT_PK] = @key`
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

// 전화번호 형식 맞춰주는 함수
const telFormat = (input) => {
  const cleanInput = input?.replaceAll(/[^0-9]/g, "");
  let result = "";
  const length = cleanInput?.length;
  if (length === 8) {
    result = cleanInput?.replace(/(\d{4})(\d{4})/, "$1-$2");
  } else if (cleanInput?.startsWith("02") && (length === 9 || length === 10)) {
    result = cleanInput?.replace(/(\d{2})(\d{3,4})(\d{4})/, "$1-$2-$3");
  } else if (
    !cleanInput?.startsWith("02") &&
    (length === 10 || length === 11)
  ) {
    result = cleanInput?.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3");
  } else {
    result = cleanInput;
  }
  return result;
};

// 사업자번호 형식 맞춰주는 함수
const businessFormat = (input) => {
  const cleanInput = input?.replaceAll(/[^0-9]/g, "");
  let result = "";
  const length = cleanInput?.length;
  if (length === 10) {
    result = cleanInput?.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
  } else if (length === 13) {
    result = cleanInput?.replace(/(\d{6})(\d{7})/, "$1-$2");
  } else {
    result = cleanInput;
  }
  return result;
};

module.exports = router;
