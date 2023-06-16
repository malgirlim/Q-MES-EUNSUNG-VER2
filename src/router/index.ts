import { createRouter, createWebHistory } from "vue-router";

import SideMenu from "../layouts/SideMenu/SideMenu.vue";
import SimpleMenu from "../layouts/SimpleMenu/SimpleMenu.vue";
import axios from "axios";

/* 공통 */
import TopMenu from "../layouts/TopMenu/TopMenu.vue";
import MobileSideMenu from "../layouts/MobileSideMenu/SideMenu.vue";
import Login from "../pages/Login.vue";
import Main from "../pages/Main.vue";

/* 키오스크 */
import LoginKiosk from "../pages/LoginKiosk.vue";
import FacilitySelect from "../pages/kiosk/FacilitySelect.vue";
import KioskFacility1 from "../pages/kiosk/Facility1.vue";
import KioskFacility2 from "../pages/kiosk/Facility2.vue";
import KioskFacility3 from "../pages/kiosk/Facility3.vue";
import KioskFacility4 from "../pages/kiosk/Facility4.vue";
import KioskFacility5 from "../pages/kiosk/Facility5.vue";
import KioskFacility6 from "../pages/kiosk/Facility6.vue";
import KioskFacility7 from "../pages/kiosk/Facility7.vue";
import KioskFacility8 from "../pages/kiosk/Facility8.vue";
import KioskFacility9 from "../pages/kiosk/Facility9.vue";
import KioskFacility10 from "../pages/kiosk/Facility10.vue";

/* 공유정보 */
import ShareNotice from "../pages/share/ShareNotice.vue";

/* 기준정보 */
import MasterUser from "../pages/master/MasterUser.vue";
import MasterClient from "../pages/master/MasterClient.vue";
import MasterProduct from "../pages/master/MasterProduct.vue";
import MasterBOM from "../pages/master/MasterBOM.vue";
import MasterFacility from "../pages/master/MasterFacility.vue";
import MasterProcess from "../pages/master/MasterProcess.vue";
import MasterMold from "../pages/master/MasterMold.vue";
import MasterCodeBad from "../pages/master/MasterCodeBad.vue";
import MasterCodeNonOP from "../pages/master/MasterCodeNonOP.vue";
import MasterFacilityParts from "../pages/master/MasterFacilityParts.vue";
import MasterQualityStd from "../pages/master/MasterQualityStd.vue";
import MasterFacilityStd from "../pages/master/MasterFacilityStd.vue";
import MasterStockStd from "../pages/master/MasterStockStd.vue";
import MasterRecipe from "../pages/master/MasterRecipe.vue";

/* 주문관리 */
import OrderAdd from "../pages/order/OrderAdd.vue";
import OrderCurrent from "../pages/order/OrderCurrent.vue";
import OrderForecast from "../pages/order/OrderForecast.vue";
import OrderNotify from "../pages/order/OrderNotify.vue";
import OrderDelivery from "../pages/order/OrderDelivery.vue";
import OrderOrder from "../pages/order/OrderOrder.vue";
import OrderOrderCurrent from "../pages/order/OrderOrderCurrent.vue";
import OrderFacilityParts from "../pages/order/OrderFacilityParts.vue";
import OrderFacilityPartsCurrent from "../pages/order/OrderFacilityPartsCurrent.vue";

/* 생산관리 */
import ProductionPlanAdd from "../pages/production/ProductionPlanAdd.vue";
import ProductionTaskAdd from "../pages/production/ProductionTaskAdd.vue";
import ProductionTaskAddInsert from "../pages/production/ProductionTaskAddInsert.vue";
import ProductionTaskCurrent from "../pages/production/ProductionTaskCurrent.vue";
import ProductionTaskReport from "../pages/production/ProductionTaskReport.vue";
import ProductionBadRework from "../pages/production/ProductionBadRework.vue";

/* 공정관리 */
import ProcessLOT from "../pages/process/ProcessLOT.vue";
import ProcessLOTTrack from "../pages/process/ProcessLOTTrack.vue";
import ProcessChecker from "../pages/process/ProcessChecker.vue";
import ProcessPlate from "../pages/process/ProcessPlate.vue";
import ProcessPrinter1 from "../pages/process/ProcessPrinter1.vue";
import ProcessPrinter2 from "../pages/process/ProcessPrinter2.vue";
import ProcessPrinter3 from "../pages/process/ProcessPrinter3.vue";
import ProcessPrinter4 from "../pages/process/ProcessPrinter4.vue";
import ProcessPrinter5 from "../pages/process/ProcessPrinter5.vue";
import ProcessPrinter6 from "../pages/process/ProcessPrinter6.vue";
import ProcessPrinter7 from "../pages/process/ProcessPrinter7.vue";
import ProcessPrinter8 from "../pages/process/ProcessPrinter8.vue";

/* 재고관리 */
import StockReceiveRaw from "../pages/stock/StockReceiveRaw.vue";
import StockWIPRaw from "../pages/stock/StockWIPRaw.vue";
import StockWIPMonitorRaw from "../pages/stock/StockWIPMonitorRaw.vue";
import StockUseRaw from "../pages/stock/StockUseRaw.vue";
import StockMonitorRaw from "../pages/stock/StockMonitorRaw.vue";
import StockReceiveHalf from "../pages/stock/StockReceiveHalf.vue";
import StockWIPHalf from "../pages/stock/StockWIPHalf.vue";
import StockWIPMonitorHalf from "../pages/stock/StockWIPMonitorHalf.vue";
import StockUseHalf from "../pages/stock/StockUseHalf.vue";
import StockMonitorHalf from "../pages/stock/StockMonitorHalf.vue";
import StockReceiveFinish from "../pages/stock/StockReceiveFinish.vue";
import StockMonitorFinish from "../pages/stock/StockMonitorFinish.vue";
import StockReceiveParts from "../pages/stock/StockReceiveParts.vue";
import StockUseParts from "../pages/stock/StockUseParts.vue";
import StockMonitorParts from "../pages/stock/StockMonitorParts.vue";

/* 품질관리 */
import QualityStandard from "../pages/quality/QualityStandard.vue";
import QualityReport from "../pages/quality/QualityReport.vue";
import QualityIncoming from "../pages/quality/QualityIncoming.vue";
import QualityProcess from "../pages/quality/QualityProcess.vue";
import QualityShipment from "../pages/quality/QualityShipment.vue";

/* 금형관리 */
import MoldUse from "../pages/mold/MoldUse.vue";
import MoldRepair from "../pages/mold/MoldRepair.vue";
import MoldCheck from "../pages/mold/MoldCheck.vue";

/* 모니터링 */
import MonitoringKPIStockCost from "../pages/monitoring/MonitoringKPIStockCost.vue";
import MonitoringKPIReturnCost from "../pages/monitoring/MonitoringKPIReturnCost.vue";
import MonitoringKPIOEE from "../pages/monitoring/MonitoringKPIOEE.vue";
import MonitoringKPIFacilityRate from "../pages/monitoring/MonitoringKPIFacilityRate.vue";
import MonitoringKPIBadRate from "../pages/monitoring/MonitoringKPIBadRate.vue";
import MonitoringKPIManHour from "../pages/monitoring/MonitoringKPIManHour.vue";
import MonitoringMTBF from "../pages/monitoring/MonitoringMTBF.vue";
import MonitoringMTTR from "../pages/monitoring/MonitoringMTTR.vue";
import MonitoringOEE from "../pages/monitoring/MonitoringOEE.vue";

/* 예방보전 */
/* - 예방보전 */
import PreventPlan from "../pages/prevent/PreventPlan.vue";
import PreventResult from "../pages/prevent/PreventResult.vue";
import PreventForecast from "../pages/prevent/PreventForecast.vue";
import PreventNotice from "../pages/prevent/PreventNotice.vue";
/* - 일상점검 */
import PreventDailyPlan from "../pages/prevent/PreventDailyPlan.vue";
import PreventDailyResult from "../pages/prevent/PreventDailyResult.vue";
import PreventDailyNotify from "../pages/prevent/PreventDailyNotify.vue";
/* - 설비수리 */
import PreventRepairPlan from "../pages/prevent/PreventRepairPlan.vue";
import PreventRepairResult from "../pages/prevent/PreventRepairResult.vue";
import PreventRepairForecast from "../pages/prevent/PreventRepairForecast.vue";
import PreventRepairNotify from "../pages/prevent/PreventRepairNotify.vue";
/* - 설비부품 */
import PreventLifePlan from "../pages/prevent/PreventLifePlan.vue";
import PreventChangeNotify from "../pages/prevent/PreventChangeNotify.vue";
/* - 설비고장 */
import PreventErrorNotify from "../pages/prevent/PreventErrorNotify.vue";
import PreventErrorList from "../pages/prevent/PreventErrorList.vue";

/* 관리자메뉴 */
import AdminLog from "../pages/admin/AdminLog.vue";

/* 설정메뉴 */
import SettingAlertOrderForecast from "../pages/setting/alert/OrderForecast.vue";
import SettingAlertOrderNotify from "../pages/setting/alert/OrderNotify.vue";
import SettingAlertPreventForecast from "../pages/setting/alert/PreventForecast.vue";
import SettingAlertPreventNotice from "../pages/setting/alert/PreventNotice.vue";
import SettingAlertPreventErrorNotify from "../pages/setting/alert/PreventErrorNotify.vue";
import SettingAlertPreventDailyNotify from "../pages/setting/alert/PreventDailyNotify.vue";
import SettingAlertPreventRepairForecast from "../pages/setting/alert/PreventRepairForecast.vue";
import SettingAlertPreventRepairNotify from "../pages/setting/alert/PreventRepairNotify.vue";
import SettingAlertPreventChangeNotify from "../pages/setting/alert/PreventChangeNotify.vue";
import SettingAlertStockSafeNotify from "../pages/setting/alert/StockSafeNotify.vue";

/* 모바일 */
import MobileMain from "../pages/mobile/Main.vue";

import MobileOrderCurrentForecast from "../pages/mobile/order/OrderCurrentForecast.vue";
import MobileOrderCurrentNotify from "../pages/mobile/order/OrderCurrentNotify.vue";
import MobileOrderTaskReport from "../pages/mobile/order/OrderTaskReport.vue";

import MobileStockReceive from "../pages/mobile/stock/StockReceive.vue";
import MobileStockDelivery from "../pages/mobile/stock/StockDelivery.vue";
import MobileStockLOTPrint from "../pages/mobile/stock/StockLOTPrint.vue";
import MobileStockLOTTrack from "../pages/mobile/stock/StockLOTTrack.vue";
import MobileStockSafeNotify from "../pages/mobile/stock/StockSafeNotify.vue";

import MobilePreventDailyCheck from "../pages/mobile/prevent/PreventDailyCheck.vue";
import MobilePreventDailyCheckNotify from "../pages/mobile/prevent/PreventDailyCheckNotify.vue";
import MobilePreventForecast from "../pages/mobile/prevent/PreventForecast.vue";
import MobilePreventNotify from "../pages/mobile/prevent/PreventNotify.vue";
import MobilePreventRepairFocecast from "../pages/mobile/prevent/PreventRepairForecast.vue";
import MobilePreventRepairNotify from "../pages/mobile/prevent/PreventRepairNotify.vue";
import MobilePreventChangeNotify from "../pages/mobile/prevent/PreventChangeNotify.vue";
import MobilePreventErrorNotify from "../pages/mobile/prevent/PreventErrorNotify.vue";

import testpage from "../test/Main.vue";

const routes = [
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/kiosk/login",
    component: LoginKiosk,
  },
  {
    path: "/kiosk",
    component: FacilitySelect,
  },
  {
    path: "/kiosk/facility1",
    component: KioskFacility1,
  },
  {
    path: "/kiosk/facility2",
    component: KioskFacility2,
  },
  {
    path: "/kiosk/facility3",
    component: KioskFacility3,
  },
  {
    path: "/kiosk/facility4",
    component: KioskFacility4,
  },
  {
    path: "/kiosk/facility5",
    component: KioskFacility5,
  },
  {
    path: "/kiosk/facility6",
    component: KioskFacility6,
  },
  {
    path: "/kiosk/facility7",
    component: KioskFacility7,
  },
  {
    path: "/kiosk/facility8",
    component: KioskFacility8,
  },
  {
    path: "/kiosk/facility9",
    component: KioskFacility9,
  },
  {
    path: "/kiosk/facility10",
    component: KioskFacility10,
  },
  {
    path: "/",
    component: TopMenu,

    children: [
      { path: "/test", component: testpage },
      {
        path: "/",
        name: "top-menu-main",
        component: Main,
      },
      {
        path: "share/notice",
        name: "top-menu-share-notice",
        meta: {
          pagename: "공지사항",
          category: "공유정보",
        },
        component: ShareNotice,
      },
      {
        path: "master/user",
        name: "top-menu-master-user",
        meta: {
          pagename: "사용자 관리",
          category: "기준정보",
        },
        component: MasterUser,
      },
      {
        path: "master/client",
        name: "top-menu-master-client",
        meta: {
          pagename: "거래처 관리",
          category: "기준정보",
        },
        component: MasterClient,
      },
      {
        path: "master/product",
        name: "top-menu-master-product",
        meta: {
          pagename: "품목 관리",
          category: "기준정보",
        },
        component: MasterProduct,
      },
      {
        path: "master/bom",
        name: "top-menu-master-bom",
        meta: {
          pagename: "BOM 관리",
          category: "기준정보",
        },
        component: MasterBOM,
      },
      {
        path: "master/facility",
        name: "top-menu-master-facility",
        meta: {
          pagename: "설비 관리",
          category: "기준정보",
        },
        component: MasterFacility,
      },

      {
        path: "master/process",
        name: "top-menu-master-process",
        meta: {
          pagename: "공정 관리",
          category: "기준정보",
        },
        component: MasterProcess,
      },
      {
        path: "master/mold",
        name: "top-menu-master-mold",
        meta: {
          pagename: "금형 관리",
          category: "기준정보",
        },
        component: MasterMold,
      },
      {
        path: "master/code-bad",
        name: "top-menu-master-code-bad",
        meta: {
          pagename: "불량코드 관리",
          category: "기준정보",
        },
        component: MasterCodeBad,
      },
      {
        path: "master/code-nonop",
        name: "top-menu-master-code-nonop",
        meta: {
          pagename: "비가동코드 관리",
          category: "기준정보",
        },
        component: MasterCodeNonOP,
      },

      {
        path: "master/facility-parts",
        name: "top-menu-master-facility-parts",
        meta: {
          pagename: "설비부품 관리",
          category: "기준정보",
        },
        component: MasterFacilityParts,
      },
      {
        path: "master/quality-std",
        name: "top-menu-master-quality-std",
        meta: {
          pagename: "품질기준정보",
          category: "기준정보",
        },
        component: MasterQualityStd,
      },
      {
        path: "master/facility-std",
        name: "top-menu-master-facility-std",
        meta: {
          pagename: "설비기준정보",
          category: "기준정보",
        },
        component: MasterFacilityStd,
      },
      {
        path: "master/stock-std",
        name: "top-menu-master-stock-std",
        meta: {
          pagename: "재고기준정보",
          category: "기준정보",
        },
        component: MasterStockStd,
      },
      {
        path: "master/recipe",
        name: "top-menu-master-recipe",
        meta: {
          pagename: "레시피 관리",
          category: "기준정보",
        },
        component: MasterRecipe,
      },
      {
        path: "order/add",
        name: "top-menu-order-add",
        meta: {
          pagename: "수주등록",
          category: "주문관리",
        },
        component: OrderAdd,
      },
      {
        path: "order/current",
        name: "top-menu-order-current",
        meta: {
          pagename: "수주현황",
          category: "주문관리",
        },
        component: OrderCurrent,
      },
      {
        path: "order/forecast",
        name: "top-menu-order-forecast",
        meta: {
          pagename: "수주대비납품 예보",
          category: "주문관리",
        },
        component: OrderForecast,
      },
      {
        path: "order/notify",
        name: "top-menu-order-notify",
        meta: {
          pagename: "수주대비납품 통보",
          category: "주문관리",
        },
        component: OrderNotify,
      },
      {
        path: "order/delivery",
        name: "top-menu-order-delivery",
        meta: {
          pagename: "납품",
          category: "주문관리",
        },
        component: OrderDelivery,
      },
      {
        path: "order/order",
        name: "top-menu-order-order",
        meta: {
          pagename: "발주등록",
          category: "주문관리",
        },
        component: OrderOrder,
      },
      {
        path: "order/order-current",
        name: "top-menu-order-order-current",
        meta: {
          pagename: "발주현황",
          category: "주문관리",
        },
        component: OrderOrderCurrent,
      },
      {
        path: "order/facility-parts",
        name: "top-menu-order-facility-parts",
        meta: {
          pagename: "설비부품발주등록",
          category: "주문관리",
        },
        component: OrderFacilityParts,
      },
      {
        path: "order/facility-parts-current",
        name: "top-menu-order-facility-parts-current",
        meta: {
          pagename: "설비부품발주현황",
          category: "주문관리",
        },
        component: OrderFacilityPartsCurrent,
      },
      {
        path: "production/plan-add",
        name: "top-menu-production-plan-add",
        meta: {
          pagename: "생산계획",
          category: " 생산관리",
        },
        component: ProductionPlanAdd,
      },
      {
        path: "production/task-add",
        name: "top-menu-production-task-add",
        meta: {
          pagename: "작업지시",
          category: " 생산관리",
        },
        component: ProductionTaskAdd,
      },
      {
        path: "production/task-add-insert",
        name: "top-menu-production-task-add-insert",
        meta: {
          pagename: "작업지시 등록",
          category: " 생산관리",
        },
        component: ProductionTaskAddInsert,
      },
      {
        path: "production/task-current",
        name: "top-menu-production-task-current",
        meta: {
          pagename: "작업현황",
          category: " 생산관리",
        },
        component: ProductionTaskCurrent,
      },
      {
        path: "production/task-report",
        name: "top-menu-production-task-report",
        meta: {
          pagename: "생산실적집계",
          category: " 생산관리",
        },
        component: ProductionTaskReport,
      },

      {
        path: "production/bad-rework",
        name: "top-menu-production-bad-rework",
        meta: {
          pagename: "불량재작업",
          category: " 생산관리",
        },
        component: ProductionBadRework,
      },
      {
        path: "process/lot",
        name: "top-menu-process-lot",
        meta: {
          pagename: "LOT출력(바코드)",
          category: "공정관리",
        },
        component: ProcessLOT,
      },
      {
        path: "process/lot-track",
        name: "top-menu-process-lot-track",
        meta: {
          pagename: "LOT추적",
          category: "공정관리",
        },
        component: ProcessLOTTrack,
      },
      {
        path: "process/checker",
        name: "top-menu-process-checker",
        meta: {
          pagename: "사출기 설비상태정보",
          category: "공정관리",
        },
        component: ProcessChecker,
      },
      {
        path: "process/plate",
        name: "top-menu-process-plate",
        meta: {
          pagename: "제판기 설비상태정보",
          category: "공정관리",
        },
        component: ProcessPlate,
      },
      {
        path: "process/printer1",
        name: "top-menu-process-printer1",
        meta: {
          pagename: "인쇄기1 설비상태정보",
          category: "공정관리",
        },
        component: ProcessPrinter1,
      },
      {
        path: "process/printer2",
        name: "top-menu-process-printer2",
        meta: {
          pagename: "인쇄기2 설비상태정보",
          category: "공정관리",
        },
        component: ProcessPrinter2,
      },
      {
        path: "process/printer3",
        name: "top-menu-process-printer3",
        meta: {
          pagename: "인쇄기3 설비상태정보",
          category: "공정관리",
        },
        component: ProcessPrinter3,
      },
      {
        path: "process/printer4",
        name: "top-menu-process-printer4",
        meta: {
          pagename: "인쇄기4 설비상태정보",
          category: "공정관리",
        },
        component: ProcessPrinter4,
      },
      {
        path: "process/printe5",
        name: "top-menu-process-printer5",
        meta: {
          pagename: "인쇄기5 설비상태정보",
          category: "공정관리",
        },
        component: ProcessPrinter5,
      },
      {
        path: "process/printer6",
        name: "top-menu-process-printer6",
        meta: {
          pagename: "인쇄기6 설비상태정보",
          category: "공정관리",
        },
        component: ProcessPrinter6,
      },
      {
        path: "process/printer7",
        name: "top-menu-process-printer7",
        meta: {
          pagename: "인쇄기7 설비상태정보",
          category: "공정관리",
        },
        component: ProcessPrinter7,
      },
      {
        path: "process/printer8",
        name: "top-menu-process-printer8",
        meta: {
          pagename: "인쇄기8 설비상태정보",
          category: "공정관리",
        },
        component: ProcessPrinter8,
      },
      {
        path: "stock/receive-raw",
        name: "top-menu-stock-receive-raw",
        meta: {
          pagename: "원부자재 입고",
          category: "재고관리",
          category_sub: "원부자재",
        },
        component: StockReceiveRaw,
      },
      {
        path: "stock/wip-raw",
        name: "top-menu-stock-wip-raw",
        meta: {
          pagename: "원부자재 불출",
          category: "재고관리",
          category_sub: "원부자재",
        },
        component: StockWIPRaw,
      },
      {
        path: "stock/wip-monitor-raw",
        name: "top-menu-stock-wip-monitor-raw",
        meta: {
          pagename: "원부자재 재공현황",
          category: "재고관리",
          category_sub: "원부자재",
        },
        component: StockWIPMonitorRaw,
      },
      {
        path: "stock/use-raw",
        name: "top-menu-stock-use-raw",
        meta: {
          pagename: "원부자재 사용",
          category: "재고관리",
          category_sub: "원부자재",
        },
        component: StockUseRaw,
      },
      {
        path: "stock/monitor-raw",
        name: "top-menu-stock-monitor-raw",
        meta: {
          pagename: "원부자재 재고현황",
          category: "재고관리",
          category_sub: "원부자재",
        },
        component: StockMonitorRaw,
      },
      {
        path: "stock/receive-half",
        name: "top-menu-stock-receive-half",
        meta: {
          pagename: "반제품 입고",
          category: "재고관리",
          category_sub: "반제품",
        },
        component: StockReceiveHalf,
      },
      {
        path: "stock/wip-half",
        name: "top-menu-stock-wip-half",
        meta: {
          pagename: "반제품 불출",
          category: "재고관리",
          category_sub: "반제품",
        },
        component: StockWIPHalf,
      },
      {
        path: "stock/wip-monitor-half",
        name: "top-menu-stock-wip-monitor-half",
        meta: {
          pagename: "반제품 재공현황",
          category: "재고관리",
          category_sub: "반제품",
        },
        component: StockWIPMonitorHalf,
      },
      {
        path: "stock/use-half",
        name: "top-menu-stock-use-half",
        meta: {
          pagename: "반제품 사용",
          category: "재고관리",
          category_sub: "반제품",
        },
        component: StockUseHalf,
      },
      {
        path: "stock/monitor-half",
        name: "top-menu-stock-monitor-half",
        meta: {
          pagename: "반제품 재고현황",
          category: "재고관리",
          category_sub: "반제품",
        },
        component: StockMonitorHalf,
      },
      {
        path: "stock/receive-finish",
        name: "top-menu-stock-receive-finish",
        meta: {
          pagename: "완제품 입고",
          category: "재고관리",
          category_sub: "완제품",
        },
        component: StockReceiveFinish,
      },
      {
        path: "stock/monitor-finish",
        name: "top-menu-stock-monitor-finish",
        meta: {
          pagename: "완제품 재고현황",
          category: "재고관리",
          category_sub: "완제품",
        },
        component: StockMonitorFinish,
      },
      {
        path: "stock/receive-parts",
        name: "top-menu-stock-receive-parts",
        meta: {
          pagename: "설비부품 입고등록",
          category: "재고관리",
          category_sub: "설비부품",
        },
        component: StockReceiveParts,
      },
      {
        path: "stock/use-parts",
        name: "top-menu-stock-use-parts",
        meta: {
          pagename: "설비부품 출고등록",
          category: "재고관리",
          category_sub: "설비부품",
        },
        component: StockUseParts,
      },
      {
        path: "stock/monitor-parts",
        name: "top-menu-stock-monitor-parts",
        meta: {
          pagename: "설비부품 재고현황",
          category: "재고관리",
          category_sub: "설비부품",
        },
        component: StockMonitorParts,
      },
      {
        path: "quality/standard",
        name: "top-menu-quality-standard",
        meta: {
          pagename: "품질기준서",
          category: "품질관리",
        },
        component: QualityStandard,
      },
      {
        path: "quality/report",
        name: "top-menu-quality-report",
        meta: {
          pagename: "검사성적서",
          category: "품질관리",
        },
        component: QualityReport,
      },
      {
        path: "quality/incoming",
        name: "top-menu-quality-incoming",
        meta: {
          pagename: "수입검사",
          category: "품질관리",
        },
        component: QualityIncoming,
      },
      {
        path: "quality/process",
        name: "top-menu-quality-process",
        meta: {
          pagename: "공정검사",
          category: "품질관리",
        },
        component: QualityProcess,
      },
      {
        path: "quality/shipment",
        name: "top-menu-quality-shipment",
        meta: {
          pagename: "출하검사",
          category: "품질관리",
        },
        component: QualityShipment,
      },
      // {
      //   path: "quality/inadequate",
      //   name: "top-menu-quality-inadequate",
      //   meta: {
      //     pagename: "부적합 관리",
      //     category: "품질관리",
      //   },
      //   component: QualityInadequate,
      // },
      {
        path: "mold/use",
        name: "top-menu-mold-use",
        meta: {
          pagename: "금형사용",
          category: "금형관리",
        },
        component: MoldUse,
      },
      {
        path: "mold/repair",
        name: "top-menu-mold-repair",
        meta: {
          pagename: "금형수선",
          category: "금형관리",
        },
        component: MoldRepair,
      },
      {
        path: "mold/check",
        name: "top-menu-mold-check",
        meta: {
          pagename: "금형점검",
          category: "금형관리",
        },
        component: MoldCheck,
      },
      {
        path: "monitoring/kpi-stock-cost",
        name: "top-menu-monitoring-kpi-stock-cost",
        meta: {
          pagename: "재고비용 현황(KPI)",
          category: "모니터링",
        },
        component: MonitoringKPIStockCost,
      },
      {
        path: "monitoring/kpi-return-cost",
        name: "top-menu-monitoring-kpi-return-cost",
        meta: {
          pagename: "반품금액 절감 현황(KPI)",
          category: "모니터링",
        },
        component: MonitoringKPIReturnCost,
      },
      {
        path: "monitoring/kpi-oee",
        name: "top-menu-monitoring-kpi-oee",
        meta: {
          pagename: "설비종합효율 현황(KPI)",
          category: "모니터링",
        },
        component: MonitoringKPIOEE,
      },
      {
        path: "monitoring/kpi-facility-rate",
        name: "top-menu-monitoring-kpi-facility-rate",
        meta: {
          pagename: "설비가동률 현황(KPI)",
          category: "모니터링",
        },
        component: MonitoringKPIFacilityRate,
      },
      {
        path: "monitoring/kpi-bad-rate",
        name: "top-menu-monitoring-kpi-bad-rate",
        meta: {
          pagename: "공정불량률 현황(KPI)",
          category: "모니터링",
        },
        component: MonitoringKPIBadRate,
      },
      {
        path: "monitoring/kpi-man-hour",
        name: "top-menu-monitoring-kpi-man-hour",
        meta: {
          pagename: "작업공수 현황(KPI)",
          category: "모니터링",
        },
        component: MonitoringKPIManHour,
      },
      {
        path: "monitoring/mtbf",
        name: "top-menu-monitoring-mtbf",
        meta: {
          pagename: "MTBF 현황",
          category: "모니터링",
        },
        component: MonitoringMTBF,
      },
      {
        path: "monitoring/mttr",
        name: "top-menu-monitoring-mttr",
        meta: {
          pagename: "MTTR 현황",
          category: "모니터링",
        },
        component: MonitoringMTTR,
      },
      {
        path: "monitoring/oee",
        name: "top-menu-monitoring-oee",
        meta: {
          pagename: "OEE현황",
          category: "모니터링",
        },
        component: MonitoringOEE,
      },
      {
        path: "prevent/plan",
        name: "top-menu-prevent-plan",
        meta: {
          pagename: "예방보전 계획",
          category: "예방보전",
          category_sub: "예방보전",
        },
        component: PreventPlan,
      },
      {
        path: "prevent/result",
        name: "top-menu-prevent-result",
        meta: {
          pagename: "예방보전 결과",
          category: "예방보전",
          category_sub: "예방보전",
        },
        component: PreventResult,
      },
      {
        path: "prevent/forecast",
        name: "top-menu-prevent-forecast",
        meta: {
          pagename: "예방보전 예보",
          category: "예방보전",
          category_sub: "예방보전",
        },
        component: PreventForecast,
      },
      {
        path: "prevent/notice",
        name: "top-menu-prevent-notice",
        meta: {
          pagename: "예방보전 통보",
          category: "예방보전",
          category_sub: "예방보전",
        },
        component: PreventNotice,
      },
      {
        path: "prevent/daily-plan",
        name: "top-menu-prevent-daily-plan",
        meta: {
          pagename: "일상점검 계획",
          category: "예방보전",
          category_sub: "일상점검",
        },
        component: PreventDailyPlan,
      },
      {
        path: "prevent/daily-result",
        name: "top-menu-prevent-daily-result",
        meta: {
          pagename: "일상점검 결과",
          category: "예방보전",
          category_sub: "일상점검",
        },
        component: PreventDailyResult,
      },
      {
        path: "prevent/daily-notify",
        name: "top-menu-prevent-daily-notify",
        meta: {
          pagename: "일상점검 확인통보",
          category: "예방보전",
          category_sub: "일상점검",
        },
        component: PreventDailyNotify,
      },
      {
        path: "prevent/repair-plan",
        name: "top-menu-prevent-repair-plan",
        meta: {
          pagename: "설비수리 계획",
          category: "예방보전",
          category_sub: "설비수리",
        },
        component: PreventRepairPlan,
      },
      {
        path: "prevent/repair-result",
        name: "top-menu-prevent-repair-result",
        meta: {
          pagename: "설비수리 결과",
          category: "예방보전",
          category_sub: "설비수리",
        },
        component: PreventRepairResult,
      },
      {
        path: "prevent/repair-forecast",
        name: "top-menu-prevent-repair-forecast",
        meta: {
          pagename: "설비수리 예보",
          category: "예방보전",
          category_sub: "설비수리",
        },
        component: PreventRepairForecast,
      },
      {
        path: "prevent/repair-notify",
        name: "top-menu-prevent-repair-notify",
        meta: {
          pagename: "설비수리 통보",
          category: "예방보전",
          category_sub: "설비수리",
        },
        component: PreventRepairNotify,
      },
      {
        path: "prevent/life-plan",
        name: "top-menu-prevent-life-plan",
        meta: {
          pagename: "설비부품 수명계획",
          category: "예방보전",
          category_sub: "설비부품",
        },
        component: PreventLifePlan,
      },
      {
        path: "prevent/change-notify",
        name: "top-menu-prevent-change-notify",
        meta: {
          pagename: "설비부품 교체시기 통보",
          category: "예방보전",
          category_sub: "설비부품",
        },
        component: PreventChangeNotify,
      },
      {
        path: "prevent/error-list",
        name: "top-menu-prevent-error-list",
        meta: {
          pagename: "설비고장 내역",
          category: "예방보전",
          category_sub: "설비고장",
        },
        component: PreventErrorList,
      },
      {
        path: "prevent/error-notify",
        name: "top-menu-prevent-error-notify",
        meta: {
          pagename: "설비고장발생 통보",
          category: "예방보전",
          category_sub: "설비고장",
        },
        component: PreventErrorNotify,
      },
      {
        path: "admin/log",
        name: "top-menu-admin-log",
        meta: {
          pagename: "Log 조회",
          //category: "관리자메뉴",
        },
        component: AdminLog,
      },
      {
        path: "setting/alert/order-forecast",
        name: "top-menu-aseeing-alert-order-forecast",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertOrderForecast,
      },
      {
        path: "setting/alert/order-notify",
        name: "top-menu-aseeing-alert-order-notify",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertOrderNotify,
      },
      {
        path: "setting/alert/prevent-forecast",
        name: "top-menu-aseeing-alert-prevent-forecast",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertPreventForecast,
      },
      {
        path: "setting/alert/prevent-notice",
        name: "top-menu-aseeing-alert-prevent-notice",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertPreventNotice,
      },
      {
        path: "setting/alert/prevent-error-notify",
        name: "top-menu-aseeing-alert-prevent-error-notify",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertPreventErrorNotify,
      },
      {
        path: "setting/alert/prevent-daily-notify",
        name: "top-menu-aseeing-alert-prevent-daily-notify",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertPreventDailyNotify,
      },
      {
        path: "setting/alert/prevent-repair-forecast",
        name: "top-menu-aseeing-alert-prevent-repair-forecast",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertPreventRepairForecast,
      },
      {
        path: "setting/alert/prevent-repair-notify",
        name: "top-menu-aseeing-alert-prevent-repair-notify",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertPreventRepairNotify,
      },
      {
        path: "setting/alert/prevent-change-notify",
        name: "top-menu-aseeing-alert-prevent-change-notify",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertPreventChangeNotify,
      },
      {
        path: "setting/alert/stock-safe-notify",
        name: "top-menu-aseeing-alert-stock-safe-notify",
        meta: {
          pagename: "알림설정",
          category: "설정",
        },
        component: SettingAlertStockSafeNotify,
      },
    ],
  },
  {
    path: "/mobile",
    component: MobileSideMenu,

    children: [
      {
        path: "",
        name: "side-menu-mobile-main",
        component: MobileMain,
      },
      {
        path: "/mobile/order/current-forecast",
        name: "side-menu-mobile-order-current-forecast",
        meta: {
          pagename: "수주현황 예보",
          category: "주문/생산관리",
        },
        component: MobileOrderCurrentForecast,
      },
      {
        path: "/mobile/order/current-notify",
        name: "side-menu-mobile-order-current-notify",
        meta: {
          pagename: "수주현황 통보",
          category: "주문/생산관리",
        },
        component: MobileOrderCurrentNotify,
      },
      {
        path: "/mobile/order/task-report",
        name: "side-menu-mobile-order-task-report",
        meta: {
          pagename: "생산실적 집계",
          category: "주문/생산관리",
        },
        component: MobileOrderTaskReport,
      },
      {
        path: "/mobile/stock/stock-receive",
        name: "side-menu-mobile-stock-receive",
        meta: {
          pagename: "입고",
          category: "재고관리",
        },
        component: MobileStockReceive,
      },
      {
        path: "/mobile/stock/stock-delivery",
        name: "side-menu-mobile-stock-delivery",
        meta: {
          pagename: "출고(납품)",
          category: "재고관리",
        },
        component: MobileStockDelivery,
      },
      {
        path: "/mobile/stock/lot-print",
        name: "side-menu-mobile-stock-lot-print",
        meta: {
          pagename: "LOT출력",
          category: "재고관리",
        },
        component: MobileStockLOTPrint,
      },
      {
        path: "/mobile/stock/lot-track",
        name: "side-menu-mobile-stock-lot-track",
        meta: {
          pagename: "LOT추적",
          category: "재고관리",
        },
        component: MobileStockLOTTrack,
      },
      {
        path: "/mobile/stock/safe-notify",
        name: "side-menu-mobile-stock-safe-notify",
        meta: {
          pagename: "안전재고 미달통보",
          category: "재고관리",
        },
        component: MobileStockSafeNotify,
      },

      {
        path: "/mobile/prevent/daily-check",
        name: "side-menu-mobile-prevent-daily-check",
        meta: {
          pagename: "일상점검",
          category: "예방보전",
        },
        component: MobilePreventDailyCheck,
      },
      {
        path: "/mobile/prevent/daily-check-notify",
        name: "side-menu-mobile-prevent-daily-check-notify",
        meta: {
          pagename: "일상점검 통보",
          category: "예방보전",
        },
        component: MobilePreventDailyCheckNotify,
      },
      {
        path: "/mobile/prevent/forecast",
        name: "side-menu-mobile-prevent-forecast",
        meta: {
          pagename: "예방보전 예보",
          category: "예방보전",
        },
        component: MobilePreventForecast,
      },
      {
        path: "/mobile/prevent/notify",
        name: "side-menu-mobile-prevent-notify",
        meta: {
          pagename: "예방보전 통보",
          category: "예방보전",
        },
        component: MobilePreventNotify,
      },
      {
        path: "/mobile/prevent/repair-forecast",
        name: "side-menu-mobile-prevent-repair-forecast",
        meta: {
          pagename: "설비수리 예보",
          category: "예방보전",
        },
        component: MobilePreventRepairFocecast,
      },
      {
        path: "/mobile/prevent/repair-notify",
        name: "side-menu-mobile-prevent-repair-notify",
        meta: {
          pagename: "설비수리 통보",
          category: "예방보전",
        },
        component: MobilePreventRepairNotify,
      },
      {
        path: "/mobile/prevent/change-notify",
        name: "side-menu-mobile-prevent-change-notify",
        meta: {
          pagename: "설비부품 교체시기 통보",
          category: "예방보전",
        },
        component: MobilePreventChangeNotify,
      },
      {
        path: "/mobile/prevent/error-notify",
        name: "side-menu-mobile-prevent-error-notify",
        meta: {
          pagename: "설비고장발생 통보",
          category: "예방보전",
        },
        component: MobilePreventErrorNotify,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 };
  },
});

export default router;
