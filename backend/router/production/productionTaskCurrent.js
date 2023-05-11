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
    .input("menu", "생산관리_작업현황") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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
		    ,(SELECT COALESCE(SUM(CONVERT(numeric,[PDRS_PRODUCE_AMT])),0) - SUM(PDDF.불량수)
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          LEFT JOIN
          (SELECT [PDDF_PRODUCE_RESULT_PK], COALESCE(SUM(CONVERT(numeric,[PDDF_AMOUNT])),0) AS 불량수
          FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
		      GROUP BY [PDDF_PRODUCE_RESULT_PK]
          ) AS PDDF ON PDDF.[PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]
          WHERE [PDRS_INST_PROCESS_PK] = [ISPC_PK]) AS 생산양품수량
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

router.post("/", async (req, res) => {
  try {
    var sql = "";
    if (req.body.searchKey == "전체") {
      sql =
        `
        SELECT
          NO AS NO, 작업지시NO AS 작업지시NO, 작업코드 AS 작업코드, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번,
          품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 지시수량 AS 지시수량, 생산양품수량 AS 생산양품수량, 시작일 AS 시작일,
          공정NO AS 공정NO, 공정명 AS 공정명, 설비NO AS 설비NO, 설비명 AS 설비명, 작업자ID AS 작업자ID, 작업자 AS 작업자,
          진행상황 AS 진행상황, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
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
            ,(SELECT COALESCE(SUM(CONVERT(numeric,[PDRS_PRODUCE_AMT])),0) - SUM(PDDF.불량수)
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              LEFT JOIN
              (SELECT [PDDF_PRODUCE_RESULT_PK], COALESCE(SUM(CONVERT(numeric,[PDDF_AMOUNT])),0) AS 불량수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
              GROUP BY [PDDF_PRODUCE_RESULT_PK]
              ) AS PDDF ON PDDF.[PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]
              WHERE [PDRS_INST_PROCESS_PK] = [ISPC_PK]) AS 생산양품수량
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
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 시작일), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 시작일), 12) <= ` +
        req.body.endDate +
        `
        AND ( 작업코드 like concat('%',@input,'%')
        OR 품목구분 like concat('%',@input,'%')
        OR 품번 like concat('%',@input,'%')
        OR 품명 like concat('%',@input,'%')
        OR 규격 like concat('%',@input,'%')
        OR 단위 like concat('%',@input,'%')
        OR 지시수량 like concat('%',@input,'%')
        OR 생산양품수량 like concat('%',@input,'%')
        OR 시작일 like concat('%',@input,'%')
        OR 공정명 like concat('%',@input,'%')
        OR 설비명 like concat('%',@input,'%')
        OR 작업자 like concat('%',@input,'%')
        OR 진행상황 like concat('%',@input,'%')
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
          NO AS NO, 작업지시NO AS 작업지시NO, 작업코드 AS 작업코드, 품목NO AS 품목NO, 품목구분 AS 품목구분, 품번 AS 품번,
          품명 AS 품명, 규격 AS 규격, 단위 AS 단위, 지시수량 AS 지시수량, 생산양품수량 AS 생산양품수량, 시작일 AS 시작일,
          공정NO AS 공정NO, 공정명 AS 공정명, 설비NO AS 설비NO, 설비명 AS 설비명, 작업자ID AS 작업자ID, 작업자 AS 작업자,
          진행상황 AS 진행상황, 비고 AS 비고, 등록자 AS 등록자, 등록일시 AS 등록일시
        FROM(
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
            ,(SELECT COALESCE(SUM(CONVERT(numeric,[PDRS_PRODUCE_AMT])),0) - SUM(PDDF.불량수)
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
              LEFT JOIN
              (SELECT [PDDF_PRODUCE_RESULT_PK], COALESCE(SUM(CONVERT(numeric,[PDDF_AMOUNT])),0) AS 불량수
              FROM [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
              GROUP BY [PDDF_PRODUCE_RESULT_PK]
              ) AS PDDF ON PDDF.[PDDF_PRODUCE_RESULT_PK] = [PDRS_PK]
              WHERE [PDRS_INST_PROCESS_PK] = [ISPC_PK]) AS 생산양품수량
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
        ) AS RESULT
        WHERE (1=1)
        AND CONVERT(varchar, CONVERT(datetime, 시작일), 12) >= ` +
        req.body.startDate +
        `
        AND CONVERT(varchar, CONVERT(datetime, 시작일), 12) <= ` +
        req.body.endDate +
        `
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
      .input("진행상황", req.body.data.진행상황 ?? "생산대기")
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

// 조회
router.get("/processitem", async (req, res) => {
  try {
    const Pool = await pool;
    const result = await Pool.request().query(`
      SELECT
        [ISPCI_PK] AS NO
        ,[ISPCI_INSTRUCT_PROCESS_PK] AS 작업지시공정NO
        ,[ISPCI_ITEM_RECEIVE_PK] AS 품목입고NO
        ,ITEM_RECEIVE.입고코드 AS 입고코드
        ,ITEM_RECEIVE.품목구분 AS 품목구분
        ,ITEM_RECEIVE.품번 AS 품번
        ,ITEM_RECEIVE.품명 AS 품명
        ,ITEM_RECEIVE.규격 AS 규격
        ,ITEM_RECEIVE.단위 AS 단위
        ,[ISPCI_AMOUNT] AS 수량
        ,[ISPCI_NOTE] AS 비고
        ,[ISPCI_REGIST_NM] AS 등록자
        ,[ISPCI_REGIST_DT] AS 등록일시
      FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_ITEM_TB]
      LEFT JOIN
      (
        SELECT
          [ITRC_PK] AS NO
          ,[ITRC_PRODUCE_RESULT_PK] AS 생산실적NO
          ,[ITRC_DEFECT_REWORK_PK] AS 불량재작업NO
          ,[ITRC_IMPORT_INSPECT_PK] AS 수입검사NO
          ,[ITRC_DIV] AS 구분
          ,CONVERT(VARCHAR, [ITRC_DT], 20) AS 입고일시
          ,[ITRC_CODE] AS 입고코드
          ,IMPORT_INSPECT.발주품목구분 AS 품목구분
          ,IMPORT_INSPECT.발주품번 AS 품번
          ,IMPORT_INSPECT.발주품명 AS 품명
          ,IMPORT_INSPECT.발주규격 AS 규격
          ,IMPORT_INSPECT.발주단위 AS 단위
          ,[ITRC_AMOUNT] AS 입고수
          ,CONVERT(VARCHAR,[ITRC_EXPIRE_DATE], 23) AS 유효일자
        FROM [QMES2022].[dbo].[MANAGE_ITEM_RECEIVE_TB]
        LEFT JOIN
        (
          SELECT
            [IPISP_PK] AS NO
            ,[IPISP_ORDER_PK] AS 발주NO
            ,ORDERORDER.발주코드 AS 발주코드
            ,ORDERORDER.품목구분 AS 발주품목구분
            ,ORDERORDER.품번 AS 발주품번
            ,ORDERORDER.품명 AS 발주품명
            ,ORDERORDER.규격 AS 발주규격
            ,ORDERORDER.단위 AS 발주단위
            ,[IPISP_DIV] AS 구분
            ,[IPISP_SAMPLE_AMT] AS 샘플수량
            ,[IPISP_RECEIVE_AMT] AS 입고수량
            ,[IPISP_RESULT] AS 결과
            ,[IPISP_INFO] AS 전달사항
          FROM [QMES2022].[dbo].[MANAGE_IMPORT_INSPECT_TB]
          LEFT JOIN
          (
            SELECT
              [ORDR_PK] AS NO
              ,[ORDR_ACCEPT_PK] AS 수주NO
              ,[ORDR_CODE] AS 발주코드
              ,[ORDR_DIV] AS 발주구분
              ,CONVERT(varchar, [ORDR_DATE], 23) AS 발주일자
              ,[ORDR_CLIENT_PK] AS 거래처NO
              ,CLIENT.거래처명 AS 거래처명
              ,[ORDR_ITEM_PK] AS 품목NO
              ,ITEM.품목구분 AS 품목구분
              ,ITEM.품번 AS 품번
              ,ITEM.품명 AS 품명
              ,ITEM.규격 AS 규격
              ,ITEM.단위 AS 단위
              ,[ORDR_AMOUNT] AS 수량
            FROM [QMES2022].[dbo].[MANAGE_ORDER_TB]
            LEFT JOIN
            (
              SELECT
                [CLNT_PK] AS NO
                ,[CLNT_NAME] AS 거래처명
              FROM [QMES2022].[dbo].[MASTER_CLIENT_TB]
            ) AS CLIENT ON CLIENT.NO = [ORDR_CLIENT_PK]
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
            ) AS ITEM ON ITEM.NO = [ORDR_ITEM_PK]
          ) AS ORDERORDER ON ORDERORDER.NO = [IPISP_ORDER_PK]
        ) AS IMPORT_INSPECT ON IMPORT_INSPECT.NO = [ITRC_IMPORT_INSPECT_PK]
      ) AS ITEM_RECEIVE ON ITEM_RECEIVE.NO = [ISPCI_ITEM_RECEIVE_PK]
      ORDER BY [ISPCI_PK] DESC
    `);

    res.send(JSON.stringify(result.recordset));
  } catch (err) {
    res.status(500);
    res.send(err.message);
  }
});

// 실적등록
router.post("/result/insert", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("지시공정NO", req.body.data.지시공정NO ?? null)
      .input("작업자ID", req.body.data.작업자ID ?? "")
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("시작일시", req.body.data.시작일시 ?? "")
      .input("종료일시", req.body.data.종료일시 ?? "")
      .input("생산수", req.body.data.생산수 ?? "")
      .input("특이사항", req.body.data.특이사항 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]
          ([PDRS_INST_PROCESS_PK]
          ,[PDRS_USER_ID]
          ,[PDRS_FACILITY_PK]
          ,[PDRS_START_DT]
          ,[PDRS_END_DT]
          ,[PDRS_PRODUCE_AMT]
          ,[PDRS_REPORT]
          ,[PDRS_NOTE]
          ,[PDRS_REGIST_NM]
          ,[PDRS_REGIST_DT])
        VALUES
          (@지시공정NO,@작업자ID,@설비NO,@시작일시,@종료일시,@생산수,@특이사항,@비고,@등록자,@등록일시)
    `);

    // 품질검사_공정검사에 넘기기
    await Pool.request()
      .input(
        "입고수",
        String(Number(req.body.data.생산수) - Number(req.body.data.불량수)) ??
          ""
      )
      .input("비고", req.body.data.특이사항 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_PROCESS_INSPECT_TB]
          ([PCISP_PRODUCE_RESULT_PK]
          ,[PCISP_DIV]
          ,[PCISP_SAMPLE_AMT]
          ,[PCISP_RECEIVE_AMT]
          ,[PCISP_RESULT]
          ,[PCISP_CONTENT1]
          ,[PCISP_CONTENT2]
          ,[PCISP_CONTENT3]
          ,[PCISP_CONTENT4]
          ,[PCISP_CONTENT5]
          ,[PCISP_CONTENT6]
          ,[PCISP_CONTENT7]
          ,[PCISP_CONTENT8]
          ,[PCISP_CONTENT9]
          ,[PCISP_CONTENT10]
          ,[PCISP_NOTE]
          ,[PCISP_REGIST_NM]
          ,[PCISP_REGIST_DT])
        VALUES
          ((SELECT MAX([PDRS_PK]) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB])
            ,'' ,'' ,@입고수 ,'미검사' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,'' ,''
            ,@비고 ,@등록자 ,@등록일시)
    `);

    // 로그기록 저장
    await logSend(
      (type = "등록"),
      (ct = "실적등록 : " + JSON.stringify(req.body.data) + " 을 등록."),
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

// 실적 소요자재 등록
router.post("/resultuseitem/insertAll", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      await Pool.request()
        .input("품목재공NO", req.body.data[i].품목재공NO ?? null)
        .input("수량", req.body.data[i].수량 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
          INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_USE_ITEM_TB]
            ([PDUI_PRODUCE_RESULT_PK]
            ,[PDUI_ITEM_PROCESS_PK]
            ,[PDUI_AMOUNT]
            ,[PDUI_DT]
            ,[PDUI_NOTE]
            ,[PDUI_REGIST_NM]
            ,[PDUI_REGIST_DT])
          VALUES
            ((SELECT MAX([PDRS_PK]) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]),@품목재공NO,@수량,GETDATE(),@비고,@등록자,@등록일시)
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

// 실적 불량 등록
router.post("/resultdefect/insertAll", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      await Pool.request()
        .input("불량NO", req.body.data[i].불량NO ?? null)
        .input("수량", req.body.data[i].수량 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
          INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_DEFECT_TB]
            ([PDDF_PRODUCE_RESULT_PK]
            ,[PDDF_DEFECT_PK]
            ,[PDDF_AMOUNT]
            ,[PDDF_NOTE]
            ,[PDDF_REGIST_NM]
            ,[PDDF_REGIST_DT])
          VALUES
            ((SELECT MAX([PDRS_PK]) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]),@불량NO,@수량,@비고,@등록자,@등록일시)
        `);

      // 로그기록 저장
      await logSend(
        (type = "등록"),
        (ct =
          "실적불량등록 : " + JSON.stringify(req.body.data[i]) + " 을 등록."),
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

// 실적 비가동 등록
router.post("/resultnonwork/insertAll", async (req, res) => {
  try {
    const Pool = await pool;
    for (var i = 0; i < req.body.data.length; i++) {
      await Pool.request()
        .input("비가동NO", req.body.data[i].비가동NO ?? null)
        .input("시작일시", req.body.data[i].시작일시 ?? "")
        .input("종료일시", req.body.data[i].종료일시 ?? "")
        .input("비고", req.body.data[i].비고 ?? "")
        .input("등록자", req.body.user ?? "")
        .input(
          "등록일시",
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
        ).query(`
          INSERT INTO [QMES2022].[dbo].[MANAGE_PRODUCE_NONWORK_TB]
            ([PDNW_PRODUCE_RESULT_PK]
            ,[PDNW_NONWORK_PK]
            ,[PDNW_START_DT]
            ,[PDNW_END_DT]
            ,[PDNW_NOTE]
            ,[PDNW_REGIST_NM]
            ,[PDNW_REGIST_DT])
          VALUES
            ((SELECT MAX([PDRS_PK]) FROM [QMES2022].[dbo].[MANAGE_PRODUCE_RESULT_TB]),@비가동NO,@시작일시,@종료일시,@비고,@등록자,@등록일시)
        `);

      // 로그기록 저장
      await logSend(
        (type = "등록"),
        (ct =
          "실적비가동등록 : " + JSON.stringify(req.body.data[i]) + " 을 등록."),
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
