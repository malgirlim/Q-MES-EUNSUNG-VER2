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
        pageName: "side-menu-mobile-main",
        title: "메인",
      },
      {
        icon: "Folders",
        pageName: "",
        title: "주문/생산관리",
        subMenu: [
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "작업일보 작성",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-order-current-forecast",
            title: "수주현황 예보",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "수주현황 통보",
          },
        ],
      },
      {
        icon: "Folders",
        pageName: "",
        title: "재고관리",
        subMenu: [
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "입출고",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "재고등록",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "LOT출력",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "LOT추적",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "안전재고 미달통보",
          },
        ],
      },
      {
        icon: "Folders",
        pageName: "",
        title: "예방보전",
        subMenu: [
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "일상점검",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "일상점검 통보",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "예방보전 예보",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "예방보전 통보",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "설비수리 예보",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "설비수리 통보",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "설비부품 교체시기 통보",
          },
          {
            icon: "FileText",
            pageName: "side-menu-mobile-",
            title: "설비고장발생 통보",
          },
        ],
      },
    ],
  }),
});
