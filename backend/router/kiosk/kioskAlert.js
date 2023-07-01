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
    .input("menu", "키오스크_고장발생") // ############ *중요* 이거 메뉴 이름 바꿔야함 !! #########
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

// 키오스크 고장발생 등록
router.post("/insert", async (req, res) => {
  try {
    const Pool = await pool;

    // 고장결과내역 등록
    await Pool.request()
      .input("설비NO", req.body.data.설비NO ?? null)
      .input("비가동NO", req.body.data.비가동NO ?? null)
      .input("구분", req.body.data.구분 ?? "")
      .input(
        "시작일시",
        moment(req.body.data.시작일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input(
        "종료일시",
        moment(req.body.data.종료일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("조치내용", req.body.data.조치내용 ?? "")
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[MANAGE_FACILITY_ERROR_TB]
          ([FCER_FACILITY_PK]
          ,[FCER_NONWORK_PK]
          ,[FCER_DIV]
          ,[FCER_START_DT]
          ,[FCER_END_DT]
          ,[FCER_CONTENT]
          ,[FCER_NOTE]
          ,[FCER_REGIST_NM]
          ,[FCER_REGIST_DT])
        VALUES
          (@설비NO,@비가동NO,@구분,@시작일시,@종료일시,@조치내용,@비고,@등록자,@등록일시)
      `);

    // 키오스크 비가동내역 등록
    await Pool.request()
      .input("작업NO", req.body.data.작업NO ?? null)
      .input("비가동NO", req.body.data.비가동NO ?? null)
      .input(
        "시작일시",
        moment(req.body.data.시작일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input(
        "종료일시",
        moment(req.body.data.종료일시).format("YYYY-MM-DD HH:mm:ss") ??
          moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      )
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        INSERT INTO [QMES2022].[dbo].[KIOSK_NONWORK_TB]
          ([KSKNW_WORK_PK]
          ,[KSKNW_NONWORK_PK]
          ,[KSKNW_START_DT]
          ,[KSKNW_END_DT]
          ,[KSKNW_NOTE]
          ,[KSKNW_REGIST_NM]
          ,[KSKNW_REGIST_DT])
        VALUES
          (@작업NO,@비가동NO,@시작일시,@종료일시,@비고,@등록자,@등록일시)
      `);

    // 작업현황을 원래대로 돌려놓기
    await Pool.request()
      .input("작업NO", req.body.data.작업NO ?? null)
      .input("비고", req.body.data.비고 ?? "")
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`
        -- 만약 키오스크 작업현황에 작업지시공정이 있다면
        IF NULL != (SELECT [KSKWK_INST_PROCESS_PK] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @작업NO)
        BEGIN
          -- 만약 작업지시공정의 진행상황이 작업중이었다면
          IF (SELECT [ISPC_CONDITION] FROM [QMES2022].[dbo].[MANAGE_INSTRUCT_PROCESS_TB]
              WHERE [ISPC_PK] = (SELECT [KSKWK_INST_PROCESS_PK] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @작업NO)) = '작업중'
          BEGIN
            -- 현황을 변경
            UPDATE [QMES2022].[dbo].[KIOSK_WORK_TB]
            SET
              [KSKWK_STATUS] = '가동중'
              ,[KSKWK_REGIST_DT] = @등록일시
            WHERE [KSKWK_PK] = @작업NO;
          END
          ELSE
          BEGIN
            -- 현황을 변경
            UPDATE [QMES2022].[dbo].[KIOSK_WORK_TB]
            SET
              [KSKWK_STATUS] = '미가동'
              ,[KSKWK_REGIST_DT] = @등록일시
            WHERE [KSKWK_PK] = @작업NO;
          END
        END
        ELSE
        BEGIN
          -- 현황을 변경
          UPDATE [QMES2022].[dbo].[KIOSK_WORK_TB]
          SET
            [KSKWK_STATUS] = '미가동'
            ,[KSKWK_REGIST_DT] = @등록일시
          WHERE [KSKWK_PK] = @작업NO;
        END
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

// 키오스크 고장발생 수정
router.post("/edit", async (req, res) => {
  try {
    const Pool = await pool;
    await Pool.request()
      .input("NO", req.body.data.NO ?? null)
      .input("등록자", req.body.user ?? "")
      .input(
        "등록일시",
        moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
      ).query(`

      -- 만약 키오스크 작업현황이 있다면
      IF 0 < (SELECT COUNT(*) FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO)
      BEGIN
        -- 만약 고장중이 아니라면
        IF (SELECT [KSKWK_STATUS] FROM [QMES2022].[dbo].[KIOSK_WORK_TB] WHERE [KSKWK_PK] = @NO) != '고장중'
        BEGIN
          -- 현황을 변경
          UPDATE [QMES2022].[dbo].[KIOSK_WORK_TB]
          SET
            [KSKWK_STATUS] = '고장중'
            ,[KSKWK_REGIST_DT] = @등록일시
          WHERE [KSKWK_PK] = @NO
        END
      END
      ELSE
      BEGIN
        -- 키오스크 작업현황 등록
        INSERT INTO [QMES2022].[dbo].[KIOSK_WORK_TB]
        ([KSKWK_PK]
        ,[KSKWK_STATUS]
        ,[KSKWK_REGIST_NM]
        ,[KSKWK_REGIST_DT])
        VALUES
        (@NO,'고장중',@등록자,@등록일시)
      END;
    `);

    // 로그기록 저장
    await logSend(
      (type = "고장"),
      (ct = JSON.stringify(req.body.data) + " 고장발생."),
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

// ########################################   나머지 기능   #############################################################

module.exports = router;
