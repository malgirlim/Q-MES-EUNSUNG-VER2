import { defineStore } from "pinia";
import { Icon } from "../base-components/Lucide/Lucide.vue";

export interface Menu {
  icon: Icon;
  title: string;
  pageName?: string;
  subMenu?: Menu[];
  ignore?: boolean;
}

export interface SideMenuState {
  menu: Array<Menu | "devider">;
}

export const useSideMenuStore = defineStore("sideMenu", {
  state: (): SideMenuState => ({
    menu: [
      {
        icon: "LayoutDashboard",
        pageName: "side-menu-main",
        title: "메인",
      },
      {
        icon: "FileSpreadsheet",
        pageName: "",
        title: "기준 정보",
        subMenu: [
          {
            icon: "FileText",
            pageName: "side-menu-master-raw",
            title: "원자재 마스터",
          },
        ],
      },
      {
        icon: "Sheet",
        pageName: "",
        title: "영업 관리",
        subMenu: [
          {
            icon: "FileText",
            pageName: "side-menu-sales-accept",
            title: "수주 접수",
          },
          {
            icon: "Truck",
            pageName: "side-menu-client-shipment",
            title: "고객사 출하",
          },
        ],
      },
      {
        icon: "DollarSign",
        pageName: "",
        title: "구매 관리",
        subMenu: [
          {
            icon: "Boxes",
            pageName: "side-menu-raw-order",
            title: "원자재 발주",
          },
          {
            icon: "PackagePlus",
            pageName: "side-menu-raw-receive",
            title: "원자재 입고",
          },
          {
            icon: "PackageMinus",
            pageName: "side-menu-raw-issue",
            title: "원자재 불출",
          },
        ],
      },
      {
        icon: "Factory",
        pageName: "",
        title: "생산 관리",
        subMenu: [
          {
            icon: "PackagePlus",
            pageName: "side-menu-raw-take",
            title: "자재 인수",
          },
          {
            icon: "FileText",
            pageName: "side-menu-work-order",
            title: "작업 지시",
          },
          {
            icon: "ShoppingCart",
            pageName: "side-menu-warehouse-release",
            title: "완제품 창고 출고",
          },
        ],
      },
      {
        icon: "Monitor",
        pageName: "",
        title: "모니터링",
        subMenu: [
          {
            icon: "PackageSearch",
            pageName: "side-menu-monitor-stock",
            title: "원자재 재고 조회",
          },
        ],
      },
    ],
  }),
});
