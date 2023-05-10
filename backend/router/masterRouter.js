const express = require("express");
const router = express.Router();

const masterUserRouter = require("./master/masterUser");
const masterClientRouter = require("./master/masterClient");
const masterProductRouter = require("./master/masterProduct");
const masterBomRouter = require("./master/masterBom");
const masterFacilityRouter = require("./master/masterFacility");
const masterProcessRouter = require("./master/masterProcess");
const masterDefectRouter = require("./master/masterDefect");
const masterNonWorkRouter = require("./master/masterNonWork");
const masterFacilityPartRouter = require("./master/masterFacilityPart");
const masterQualityStandRouter = require("./master/masterQualityStand");
const masterFacilityStandRouter = require("./master/masterFacilityStand");
const masterStockStandRouter = require("./master/masterStockStand");
const masterRecipeRouter = require("./master/masterRecipe");

router.use((req, res, next) => {
  // console.log("middleware for test!");
  next();
});

// 기준정보 / 사용자 관리 - router/master/masterUser.js
router.use("/user", masterUserRouter);
// 기준정보 / 거래처 관리 - router/master/masterClient.js
router.use("/client", masterClientRouter);
// 기준정보 / 품목 관리 - router/master/masterProduct.js
router.use("/product", masterProductRouter);
// 기준정보 / BOM 관리 - router/master/masterBom.js
router.use("/bom", masterBomRouter);
// 기준정보 / 설비 관리 - router/master/masterFacility.js
router.use("/facility", masterFacilityRouter);
// 기준정보 / 공정 관리 - router/master/masterProcess.js
router.use("/process", masterProcessRouter);
// 기준정보 / 불량내용코드 관리 - router/master/masterDefect.js
router.use("/defect", masterDefectRouter);
// 기준정보 / 비가동내용코드 관리 - router/master/masterNonWork.js
router.use("/nonwork", masterNonWorkRouter);
// 기준정보 / 설비부품 관리 - router/master/masterFacilityPart.js
router.use("/facilitypart", masterFacilityPartRouter);
// 기준정보 / 품질기준정보 관리 - router/master/masterQualityStand.js
router.use("/qualitystand", masterQualityStandRouter);
// 기준정보 / 설비기준정보 관리 - router/master/masterFacilityStand.js
router.use("/facilitystand", masterFacilityStandRouter);
// 기준정보 / 재고기준정보 관리 - router/master/masterStockStand.js
router.use("/stockstand", masterStockStandRouter);
// 기준정보 / 레시피 관리 - router/master/masterRecipe.js
router.use("/recipe", masterRecipeRouter);

module.exports = router;
