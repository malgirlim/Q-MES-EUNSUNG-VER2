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
    .input("menu", "키오스크_작업지시목록") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
        [ISPC_PK] AS NO
        ,[ISPC_WORK_INSTRUCT_PK] AS 작업지시NO
        ,WORK_INSTRUCT.코드 AS 작업코드
        ,[ISPC_ITEM_PK] AS 품목NO
        ,ITEM.구분 AS 품목구분
        ,ITEM.품번 AS 품번
        ,ITEM.품명 AS 품명
        ,ITEM.규격 AS 규격
        ,ITEM.단위 AS 단위
        ,[ISPC_AMOUNT] AS 지시수량
		    ,COALESCE((SELECT SUM(CONVERT(numeric,COALESCE([PDRS_PRODUCE_AMT],0))) - COALESCE(SUM(PDDF.불량수),0)
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          LEFT JOIN
          (SELECT [PDDF_PRODUCE_RESULT_PK], SUM(CONVERT(numeric,COALESCE([PDDF_AMOUNT],0))) AS 불량수
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
		      GROUP BY [PDDF_PRODUCE_RESULT_PK]
          ) AS PDDF ON PDDF.[PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]
          WHERE [PDRS_INST_PROCESS_PK] = [ISPC_PK]),0) AS 생산양품수량
        ,WORK_INSTRUCT.시작일 AS 시작일
        ,[ISPC_PROCESS_PK] AS 공정NO
        ,PROCESS.공정명 AS 공정명
        ,[ISPC_FACILITY_PK] AS 설비NO
        ,FACILITY.설비명 AS 설비명
        ,[ISPC_USER_ID] AS 작업자ID
        ,USERS.이름 AS 작업자
        ,[ISPC_CONDITION] AS 진행상황
        ,[ISPC_NOTE] AS 비고
        ,[ISPC_REGIST_NM] AS 등록자
        ,[ISPC_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
      LEFT JOIN
      (
        SELECT
          [WKIS_PK] AS NO
          ,[WKIS_CODE] AS 코드
          ,[WKIS_PRODUCE_PLAN_PK] AS 생산계획NO
          ,[WKIS_ITEM_PK] AS 품목NO
          ,ITEM.품목구분 AS 품목구분
          ,ITEM.품번 AS 품번
          ,ITEM.품명 AS 품명
          ,ITEM.규격 AS 규격
          ,ITEM.단위 AS 단위
          ,[WKIS_AMOUNT] AS 수량
          ,LEFT([WKIS_START_DATE],10) AS 시작일
          ,[WKIS_NOTE] AS 비고
          ,[WKIS_REGIST_NM] AS 등록자
          ,[WKIS_REGIST_DT] AS 등록일시
        FROM [QMES2022].[dbo].[MANAGE_WORK_INSTRUCT_TB]
        LEFT JOIN
        (
          SELECT
            [ITEM_PK] AS NO
            ,[ITEM_DIV] AS 품목구분
            ,[ITEM_PRODUCT_NUM] AS 품번
            ,[ITEM_NAME] AS 품명
            ,[ITEM_SIZE] AS 규격
            ,[ITEM_UNIT] AS 단위
          FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
        ) AS ITEM ON ITEM.NO = [WKIS_ITEM_PK]
      ) AS WORK_INSTRUCT ON WORK_INSTRUCT.NO = [ISPC_WORK_INSTRUCT_PK]
      LEFT JOIN
      (
        SELECT
          [PRCS_PK] AS NO
          ,[PRCS_CODE] AS 코드
          ,[PRCS_DIV] AS 구분
          ,[PRCS_NAME] AS 공정명
          ,[PRCS_CONTENT] AS 내용
          ,[PRCS_FACILITY] AS 설비
        FROM [QMES2022].[dbo].[MASTER_PROCESS_TB]
      ) AS PROCESS ON PROCESS.NO = [ISPC_PROCESS_PK]
      LEFT JOIN
      (
        SELECT
          [FCLT_PK] AS NO
          ,[FCLT_NAME] AS 설비명
          ,[FCLT_LINE] AS 라인
          ,[FCLT_SIZE] AS 규격
          ,[FCLT_CLIENT_PK] AS 거래처NO
          ,CLIENT.거래처명 AS 거래처명
          ,[FCLT_BUY_DATE] AS 구입일
          ,[FCLT_COST] AS 금액
          ,[FCLT_PLACE] AS 장소
          ,[FCLT_IMAGE] AS 사진
        FROM [QMES2022].[dbo].[MASTER_FACILITY_TB]
        LEFT JOIN
        (
          SELECT
            [CLNT_PK] AS NO
            ,[CLNT_NAME] AS 거래처명
          FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
        ) AS CLIENT ON CLIENT.NO = [FCLT_CLIENT_PK]
      ) AS FACILITY ON FACILITY.NO = [ISPC_FACILITY_PK]
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
      ) AS USERS ON USERS.아이디 = [ISPC_USER_ID]
      LEFT JOIN
      (
        SELECT
          [ITEM_PK] AS NO
          ,[ITEM_DIV] AS 구분
          ,[ITEM_PRODUCT_NUM] AS 품번
          ,[ITEM_NAME] AS 품명
          ,[ITEM_SIZE] AS 규격
          ,[ITEM_UNIT] AS 단위
        FROM [QMES2022].[dbo].[MASTER_ITEM_TB]
      ) AS ITEM ON ITEM.NO = [ISPC_ITEM_PK]
      WHERE [ISPC_DIV] != '외주'
      ORDER BY [ISPC_PK] DESC
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

// 선택

// 등록
router.post("/insert", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("NO", req.body.data.NO ?? null)
      .input("지시공정NO", req.body.data.지시공정NO ?? null)
      .input("현황", req.body.data.현황 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        -- 키오스크에 등록되어진 데이터 지우기
        DELETE FROM [QMES2022].[dbo].[KIOSK_ITEM_TB] WHERE [KSKIT_WORK_PK] = @NO;
        DELETE FROM [QMES2022].[dbo].[KIOSK_DEFECT_TB] WHERE [KSKDF_WORK_PK] = @NO;
        DELETE FROM [QMES2022].[dbo].[KIOSK_NONWORK_TB] WHERE [KSKNW_WORK_PK] = @NO;
        DELETE FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO;
        
        -- 키오스크 작업 등록
        INSERT INTO [QMES2022].[dbo].[KIOSK_WORK_TB]
          ([KSKWK_PK]
          ,[KSKWK_INST_PROCESS_PK]
          ,[KSKWK_USER_ID]
          ,[KSKWK_START_DT]
          ,[KSKWK_PRODUCE_AMT]
          ,[KSKWK_REPORT]
          ,[KSKWK_STATUS]
          ,[KSKWK_NOTE]
          ,[KSKWK_REGIST_NM]
          ,[KSKWK_REGIST_DT])
        VALUES
          (@NO,@지시공정NO,(SELECT [ISPC_USER_ID] FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB] WHERE [ISPC_PK] = @지시공정NO),
            GETDATE(),'0','',@현황,@비고,@등록자,@등록일시);

        -- 키오스크 투입자재 등록
        INSERT INTO [QMES2022].[dbo].[KIOSK_ITEM_TB]
          ([KSKIT_WORK_PK]
          ,[KSKIT_ITEM_PK]
          ,[KSKIT_LOTCODE]
          ,[KSKIT_AMOUNT]
          ,[KSKIT_DT]
          ,[KSKIT_NOTE]
          ,[KSKIT_REGIST_NM]
          ,[KSKIT_REGIST_DT])
        SELECT
          @NO
          ,[ISPCI_ITEM_PK]
          ,[ISPCI_LOTCODE]
          ,[ISPCI_AMOUNT]
          ,GETDATE()
          ,@비고
          ,@등록자
          ,@등록일시
        FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
        WHERE [ISPCI_INSTRUCT_PROCESS_PK] = @지시공정NO;
    `);

    // 로그기록 저장
    await logSend(
      (type = "선택"),
      (ct = JSON.stringify(req.body.data) + " 을 선택."),
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

// 수정
router.post("/edit", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("NO", req.body.data.NO ?? 0)
      .input("작업지시NO", req.body.data.작업지시NO ?? null)
      .input("공정NO", req.body.data.공정NO ?? null)
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("작업자ID", req.body.data.작업자ID ?? "")
      .input("품목NO", req.body.data.품목NO ?? null)
      .input("지시수량", req.body.data.지시수량 ?? "")
      .input("진행상황", req.body.data.진행상황 ?? "작업대기")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        UPDATE [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
          SET 
          [ISPC_WORK_INSTRUCT_PK] = @작업지시NO
          ,[ISPC_PROCESS_PK] = @공정NO
          ,[ISPC_FACILITY_PK] = @설비NO
          ,[ISPC_USER_ID] = @작업자ID
          ,[ISPC_ITEM_PK] = @품목NO
          ,[ISPC_AMOUNT] = @지시수량
          ,[ISPC_CONDITION] = @진행상황
          ,[ISPC_NOTE] = @비고
          ,[ISPC_REGIST_NM] = @등록자
          ,[ISPC_REGIST_DT] = @등록일시
        WHERE [ISPC_PK] = @NO
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

// 실적 소요자재 등록
router.post("/resultuseitem/insertAll", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      await Pool.request()
        .input("품목NO", req.body.data[i].품목NO ?? null)
        .input("LOT코드", req.body.data[i].LOT코드 ?? "")
        .input("수량", req.body.data[i].수량 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
          INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            ([PDUI_DIV]
            ,[PDUI_PRODUCE_RESULT_PK]
            ,[PDUI_ITEM_PK]
            ,[PDUI_LOTCODE]
            ,[PDUI_AMOUNT]
            ,[PDUI_DT]
            ,[PDUI_NOTE]
            ,[PDUI_REGIST_NM]
            ,[PDUI_REGIST_DT])
          VALUES
            ('생산실적투입자재',(SELECT MAX([PDRS_PK]) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]),@품목NO,@LOT코드,@수량,GETDATE(),@비고,@등록자,@등록일시)
        `);

      // 로그기록 저장
      await logSend(
        (type = "등록"),
        (ct =
          "실적소요자재등록 : " +
          JSON.stringify(req.body.data[i]) +
          " 을 등록."),
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

// ########################################   나머지 기능   #############################################################

module.exports = router;
