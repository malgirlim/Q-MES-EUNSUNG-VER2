import { createRouter, createWebHistory } from "vue-router";
import SideMenu from "../layouts/SideMenu/SideMenu.vue";
import SimpleMenu from "../layouts/SimpleMenu/SimpleMenu.vue";
import TopMenu from "../layouts/TopMenu/TopMenu.vue";
import Main from "../pages/Main.vue";
import SalesAccept from "../pages/SalesAccept.vue";
import ClientShipment from "../pages/ClientShipment.vue";
import RawOrder from "../pages/RawOrder.vue";
import RawReceive from "../pages/RawReceive.vue";
import RawIssue from "../pages/RawIssue.vue";
import RawTake from "../pages/RawTake.vue";
import WorkOrder from "../pages/WorkOrder.vue";
import WarehouseRelease from "../pages/WarehouseRelease.vue";
import MasterRaw from "../pages/MasterRaw.vue";
import MonitorStock from "../pages/MonitorStock.vue";

const routes = [
  {
    path: "/side-menu",
    component: SideMenu,
    children: [
      {
        path: "/main",
        name: "side-menu-main",
        component: Main,
      },
      {
        path: "master/raw",
        name: "side-menu-master-raw",
        meta: {
          pagename: "원자재 마스터",
          category: "기준 정보",
        },
        component: MasterRaw,
      },
      {
        path: "sales/accept",
        name: "side-menu-sales-accept",
        meta: {
          pagename: "수주 접수",
          category: "영업 관리",
        },
        component: SalesAccept,
      },
      {
        path: "sales/shipment",
        name: "side-menu-client-shipment",
        meta: {
          pagename: "고객사 출하",
          category: "영업 관리",
        },
        component: ClientShipment,
      },
      {
        path: "purchase/order",
        name: "side-menu-raw-order",
        meta: {
          pagename: "원자재 발주",
          category: "구매 관리",
        },
        component: RawOrder,
      },
      {
        path: "purchase/receive",
        name: "side-menu-raw-receive",
        meta: {
          pagename: "원자재 입고",
          category: "구매 관리",
        },
        component: RawReceive,
      },
      {
        path: "purchase/issue",
        name: "side-menu-raw-issue",
        meta: {
          pagename: "원자재 불출",
          category: "구매 관리",
        },
        component: RawIssue,
      },
      {
        path: "product/take",
        name: "side-menu-raw-take",
        meta: {
          pagename: "자재 인수",
          category: "생산 관리",
        },
        component: RawTake,
      },
      {
        path: "product/work",
        name: "side-menu-work-order",
        meta: {
          pagename: "작업 지시",
          category: "생산 관리",
        },
        component: WorkOrder,
      },
      {
        path: "product/warehouse",
        name: "side-menu-warehouse-release",
        meta: {
          pagename: "완제품 창고 출고",
          category: "생산 관리",
        },
        component: WarehouseRelease,
      },
      {
        path: "monitor/stock",
        name: "side-menu-monitor-stock",
        meta: {
          pagename: "원자재 재고 조회",
          category: "모니터링",
        },
        component: MonitorStock,
      },
    ],
  },
  {
    path: "/simple-menu",
    component: SimpleMenu,
    children: [
      {
        path: "/main",
        name: "simple-menu-main",
        component: Main,
      },
      {
        path: "master/raw",
        name: "simple-menu-master-raw",
        meta: {
          pagename: "원자재 마스터",
          category: "기준 정보",
        },
        component: MasterRaw,
      },
      {
        path: "sales/accept",
        name: "simple-menu-sales-accept",
        meta: {
          pagename: "수주 접수",
          category: "영업 관리",
        },
        component: SalesAccept,
      },
      {
        path: "sales/shipment",
        name: "simple-menu-client-shipment",
        meta: {
          pagename: "고객사 출하",
          category: "영업 관리",
        },
        component: ClientShipment,
      },
      {
        path: "purchase/order",
        name: "simple-menu-raw-order",
        meta: {
          pagename: "원자재 발주",
          category: "구매 관리",
        },
        component: RawOrder,
      },
      {
        path: "purchase/receive",
        name: "simple-menu-raw-receive",
        meta: {
          pagename: "원자재 입고",
          category: "구매 관리",
        },
        component: RawReceive,
      },
      {
        path: "purchase/issue",
        name: "simple-menu-raw-issue",
        meta: {
          pagename: "원자재 불출",
          category: "구매 관리",
        },
        component: RawIssue,
      },
      {
        path: "product/take",
        name: "simple-menu-raw-take",
        meta: {
          pagename: "자재 인수",
          category: "생산 관리",
        },
        component: RawTake,
      },
      {
        path: "product/work",
        name: "simple-menu-work-order",
        meta: {
          pagename: "작업 지시",
          category: "생산 관리",
        },
        component: WorkOrder,
      },
      {
        path: "product/warehouse",
        name: "simple-menu-warehouse-release",
        meta: {
          pagename: "완제품 창고 출고",
          category: "생산 관리",
        },
        component: WarehouseRelease,
      },
      {
        path: "monitor/stock",
        name: "simple-menu-monitor-stock",
        meta: {
          pagename: "원자재 재고 조회",
          category: "모니터링",
        },
        component: MonitorStock,
      },
    ],
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
        path: "master/raw",
        name: "top-menu-master-raw",
        meta: {
          pagename: "원자재 마스터",
          category: "기준 정보",
        },
        component: MasterRaw,
      },
      {
        path: "sales/accept",
        name: "top-menu-sales-accept",
        meta: {
          pagename: "수주접수",
          category: "영업 관리",
        },
        component: SalesAccept,
      },
      {
        path: "sales/shipment",
        name: "top-menu-client-shipment",
        meta: {
          pagename: "고객사 출하",
          category: "영업 관리",
        },
        component: ClientShipment,
      },
      {
        path: "purchase/order",
        name: "top-menu-raw-order",
        meta: {
          pagename: "원자재 발주",
          category: "구매 관리",
        },
        component: RawOrder,
      },
      {
        path: "purchase/receive",
        name: "top-menu-raw-receive",
        meta: {
          pagename: "원자재 입고",
          category: "구매 관리",
        },
        component: RawReceive,
      },
      {
        path: "purchase/issue",
        name: "top-menu-raw-issue",
        meta: {
          pagename: "원자재 불출",
          category: "구매 관리",
        },
        component: RawIssue,
      },
      {
        path: "product/take",
        name: "top-menu-raw-take",
        meta: {
          pagename: "자재 인수",
          category: "생산 관리",
        },
        component: RawTake,
      },
      {
        path: "product/work",
        name: "top-menu-work-order",
        meta: {
          pagename: "작업 지시",
          category: "생산 관리",
        },
        component: WorkOrder,
      },
      {
        path: "product/warehouse",
        name: "top-menu-warehouse-release",
        meta: {
          pagename: "완제품 창고 출고",
          category: "생산 관리",
        },
        component: WarehouseRelease,
      },
      {
        path: "monitor/stock",
        name: "top-menu-monitor-stock",
        meta: {
          pagename: "원자재 재고 조회",
          category: "모니터링",
        },
        component: MonitorStock,
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
