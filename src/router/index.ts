import { createRouter, createWebHistory } from "vue-router";

import SideMenu from "../layouts/SideMenu/SideMenu.vue";
import SimpleMenu from "../layouts/SimpleMenu/SimpleMenu.vue";
import TopMenu from "../layouts/TopMenu/TopMenu.vue";
import Main from "../pages/Main.vue";
import Login from "../pages/Login.vue";

import LoginKiosk from "../pages/LoginKiosk.vue";
import FacilitySelect from "../pages/kiosk/FacilitySelect.vue";
import KioskFacility1 from "../pages/kiosk/Facility1.vue";

import ShareNotice from "../pages/share/ShareNotice.vue";

import MasterUser from "../pages/master/MasterUser.vue";
import MasterClient from "../pages/master/MasterClient.vue";
import MasterProduct from "../pages/master/MasterProduct.vue";
import MasterBOM from "../pages/master/MasterBOM.vue";
import MasterFacility from "../pages/master/MasterFacility.vue";
import MasterProcess from "../pages/master/MasterProcess.vue";
import MasterCodeBad from "../pages/master/MasterCodeBad.vue";
import MasterCodeNonOP from "../pages/master/MasterCodeNonOP.vue";
import MasterFacilityParts from "../pages/master/MasterFacilityParts.vue";
import MasterQualityStd from "../pages/master/MasterQualityStd.vue";
import MasterFacilityStd from "../pages/master/MasterFacilityStd.vue";
import MasterStockStd from "../pages/master/MasterStockStd.vue";
import MasterRecipe from "../pages/master/MasterRecipe.vue";

import OrderAdd from "../pages/order/OrderAdd.vue";
import OrderCurrent from "../pages/order/OrderCurrent.vue";
import OrderForecast from "../pages/order/OrderForecast.vue";
import OrderNotify from "../pages/order/OrderNotify.vue";
import OrderDelivery from "../pages/order/OrderDelivery.vue";
import OrderOrder from "../pages/order/OrderOrder.vue";
import OrderOrderCurrent from "../pages/order/OrderOrderCurrent.vue";
import OrderFacilityParts from "../pages/order/OrderFacilityParts.vue";
import OrderFacilityPartsCurrent from "../pages/order/OrderFacilityPartsCurrent.vue";

import ProductionPlanAdd from "../pages/production/ProductionPlanAdd.vue";
import ProductionTaskAdd from "../pages/production/ProductionTaskAdd.vue";
import ProductionTaskAddInsert from "../pages/production/ProductionTaskAddInsert.vue";
import ProductionTaskCurrent from "../pages/production/ProductionTaskCurrent.vue";
import ProductionTaskReport from "../pages/production/ProductionTaskReport.vue";
import ProductionBadRework from "../pages/production/ProductionBadRework.vue";

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

import QualityStandard from "../pages/quality/QualityStandard.vue";
import QualityReport from "../pages/quality/QualityReport.vue";
import QualityIncoming from "../pages/quality/QualityIncoming.vue";
import QualityProcess from "../pages/quality/QualityProcess.vue";
import QualityShipment from "../pages/quality/QualityShipment.vue";
import QualityInadequate from "../pages/quality/QualityInadequate.vue";

import MonitoringKPI from "../pages/monitoring/MonitoringKPI.vue";
import MonitoringOverall from "../pages/monitoring/MonitoringOverall.vue";
import MonitoringProduction from "../pages/monitoring/MonitoringProduction.vue";
import MonitoringProcess from "../pages/monitoring/MonitoringProcess.vue";
import MonitoringStock from "../pages/monitoring/MonitoringStock.vue";
import MonitoringDaily from "../pages/monitoring/MonitoringDaily.vue";
import MonitoringPrevent from "../pages/monitoring/MonitoringPrevent.vue";
import MonitoringMTBF from "../pages/monitoring/MonitoringMTBF.vue";
import MonitoringMTTR from "../pages/monitoring/MonitoringMTTR.vue";
import MonitoringOEE from "../pages/monitoring/MonitoringOEE.vue";

import PreventPlan from "../pages/prevent/PreventPlan.vue";
import PreventDailyPlan from "../pages/prevent/PreventDailyPlan.vue";
import PreventRepairPlan from "../pages/prevent/PreventRepairPlan.vue";
import PreventLifePlan from "../pages/prevent/PreventLifePlan.vue";
import PreventForecast from "../pages/prevent/PreventForecast.vue";
import PreventNotice from "../pages/prevent/PreventNotice.vue";
import PreventErrorNotify from "../pages/prevent/PreventErrorNotify.vue";
import PreventDailyNotify from "../pages/prevent/PreventDailyNotify.vue";
import PreventRepairForecast from "../pages/prevent/PreventRepairForecast.vue";
import PreventRepairNotify from "../pages/prevent/PreventRepairNotify.vue";
import PreventChangeNotify from "../pages/prevent/PreventChangeNotify.vue";

import AdminLog from "../pages/admin/AdminLog.vue";

import axios from "axios";

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
    path: "/",
    component: TopMenu,

    children: [
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
        },
        component: StockReceiveRaw,
      },
      {
        path: "stock/wip-raw",
        name: "top-menu-stock-wip-raw",
        meta: {
          pagename: "원부자재 불출",
          category: "재고관리",
        },
        component: StockWIPRaw,
      },
      {
        path: "stock/wip-monitor-raw",
        name: "top-menu-stock-wip-monitor-raw",
        meta: {
          pagename: "원부자재 재공현황",
          category: "재고관리",
        },
        component: StockWIPMonitorRaw,
      },
      {
        path: "stock/use-raw",
        name: "top-menu-stock-use-raw",
        meta: {
          pagename: "원부자재 사용",
          category: "재고관리",
        },
        component: StockUseRaw,
      },
      {
        path: "stock/monitor-raw",
        name: "top-menu-stock-monitor-raw",
        meta: {
          pagename: "원부자재 재고현황",
          category: "재고관리",
        },
        component: StockMonitorRaw,
      },
      {
        path: "stock/receive-half",
        name: "top-menu-stock-receive-half",
        meta: {
          pagename: "반제품 입고",
          category: "재고관리",
        },
        component: StockReceiveHalf,
      },
      {
        path: "stock/wip-half",
        name: "top-menu-stock-wip-half",
        meta: {
          pagename: "반제품 불출",
          category: "재고관리",
        },
        component: StockWIPHalf,
      },
      {
        path: "stock/wip-monitor-half",
        name: "top-menu-stock-wip-monitor-half",
        meta: {
          pagename: "반제품 재공현황",
          category: "재고관리",
        },
        component: StockWIPMonitorHalf,
      },
      {
        path: "stock/use-half",
        name: "top-menu-stock-use-half",
        meta: {
          pagename: "반제품 사용",
          category: "재고관리",
        },
        component: StockUseHalf,
      },
      {
        path: "stock/monitor-half",
        name: "top-menu-stock-monitor-half",
        meta: {
          pagename: "반제품 재고현황",
          category: "재고관리",
        },
        component: StockMonitorHalf,
      },
      {
        path: "stock/receive-finish",
        name: "top-menu-stock-receive-finish",
        meta: {
          pagename: "완제품 입고",
          category: "재고관리",
        },
        component: StockReceiveFinish,
      },
      {
        path: "stock/monitor-finish",
        name: "top-menu-stock-monitor-finish",
        meta: {
          pagename: "완제품 재고현황",
          category: "재고관리",
        },
        component: StockMonitorFinish,
      },
      {
        path: "stock/receive-parts",
        name: "top-menu-stock-receive-parts",
        meta: {
          pagename: "설비부품 입고등록",
          category: "재고관리",
        },
        component: StockReceiveParts,
      },
      {
        path: "stock/use-parts",
        name: "top-menu-stock-use-parts",
        meta: {
          pagename: "설비부품 출고등록",
          category: "재고관리",
        },
        component: StockUseParts,
      },
      {
        path: "stock/monitor-parts",
        name: "top-menu-stock-monitor-parts",
        meta: {
          pagename: "설비부품 재고현황",
          category: "재고관리",
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
      {
        path: "quality/inadequate",
        name: "top-menu-quality-inadequate",
        meta: {
          pagename: "부적합 관리",
          category: "품질관리",
        },
        component: QualityInadequate,
      },
      {
        path: "monitoring/kpi",
        name: "top-menu-monitoring-kpi",
        meta: {
          pagename: "KPI지수 현황",
          category: "모니터링",
        },
        component: MonitoringKPI,
      },
      {
        path: "monitoring/overall",
        name: "top-menu-monitoring-overall",
        meta: {
          pagename: "종합 현황",
          category: "모니터링",
        },
        component: MonitoringOverall,
      },
      {
        path: "monitoring/production",
        name: "top-menu-monitoring-production",
        meta: {
          pagename: "생산 현황",
          category: "모니터링",
        },
        component: MonitoringProduction,
      },
      {
        path: "monitoring/process",
        name: "top-menu-monitoring-process",
        meta: {
          pagename: "공정 현황",
          category: "모니터링",
        },
        component: MonitoringProcess,
      },
      {
        path: "monitoring/stock",
        name: "top-menu-monitoring-stock",
        meta: {
          pagename: "재고 현황",
          category: "모니터링",
        },
        component: MonitoringStock,
      },
      {
        path: "monitoring/daily",
        name: "top-menu-monitoring-daily",
        meta: {
          pagename: "설비 일상점검 현황",
          category: "모니터링",
        },
        component: MonitoringDaily,
      },
      {
        path: "monitoring/prevent",
        name: "top-menu-monitoring-prevent",
        meta: {
          pagename: "설비 예방보전 현황",
          category: "모니터링",
        },
        component: MonitoringPrevent,
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
          pagename: "예방보전계획",
          category: "예방보전",
        },
        component: PreventPlan,
      },
      {
        path: "prevent/daily-plan",
        name: "top-menu-prevent-daily-plan",
        meta: {
          pagename: "일상점검계획",
          category: "예방보전",
        },
        component: PreventDailyPlan,
      },
      {
        path: "prevent/repair-plan",
        name: "top-menu-prevent-repair-plan",
        meta: {
          pagename: "설비수리계획",
          category: "예방보전",
        },
        component: PreventRepairPlan,
      },
      {
        path: "prevent/life-plan",
        name: "top-menu-prevent-life-plan",
        meta: {
          pagename: "설비부품수명계획",
          category: "예방보전",
        },
        component: PreventLifePlan,
      },
      {
        path: "prevent/forecast",
        name: "top-menu-prevent-forecast",
        meta: {
          pagename: "예방보전 예보",
          category: "예방보전",
        },
        component: PreventForecast,
      },
      {
        path: "prevent/notice",
        name: "top-menu-prevent-notice",
        meta: {
          pagename: "예방보전 통보",
          category: "예방보전",
        },
        component: PreventNotice,
      },
      {
        path: "prevent/error-notify",
        name: "top-menu-prevent-error-notify",
        meta: {
          pagename: "설비고장발생 통보",
          category: "예방보전",
        },
        component: PreventErrorNotify,
      },
      {
        path: "prevent/daily-notify",
        name: "top-menu-prevent-daily-notify",
        meta: {
          pagename: "일상점검 확인통보",
          category: "예방보전",
        },
        component: PreventDailyNotify,
      },
      {
        path: "prevent/repair-forecast",
        name: "top-menu-prevent-repair-forecast",
        meta: {
          pagename: "설비수리 예보",
          category: "예방보전",
        },
        component: PreventRepairForecast,
      },
      {
        path: "prevent/repair-notify",
        name: "top-menu-prevent-repair-notify",
        meta: {
          pagename: "설비수리 통보",
          category: "예방보전",
        },
        component: PreventRepairNotify,
      },
      {
        path: "prevent/change-notify",
        name: "top-menu-prevent-change-notify",
        meta: {
          pagename: "설비부품 교체시기 통보",
          category: "예방보전",
        },
        component: PreventChangeNotify,
      },
      {
        path: "admin/log",
        name: "top-menu-admin-log",
        meta: {
          pagename: "Log 조회",
          category: "관리자메뉴",
        },
        component: AdminLog,
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