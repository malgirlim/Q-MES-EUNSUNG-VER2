import { defineStore } from "pinia";
import { Icon } from "../base-components/Lucide/Lucide.vue";

export interface Menu {
  icon: Icon;
  title: string;
  pageName?: string;
  subMenu?: Menu[];
  ignore?: boolean;
}

export interface TopMenuState {
  menu: Array<Menu>;
}

export const useTopMenuStore = defineStore("topMenu", {
  state: (): TopMenuState => ({
    menu: [
      {
        icon: "LayoutDashboard",
        pageName: "top-menu-main",
        title: "메인",
      },
      {
        icon: "Folders",
        pageName: "",
        title: "공유정보",
        subMenu: [
          {
            icon: "FileText",
            pageName: "top-menu-share-notice",
            title: "공지사항",
          },
        ],
      },
      {
        icon: "Folders",
        pageName: "",
        title: "기준정보",
        subMenu: [
          {
            icon: "FileText",
            pageName: "top-menu-master-user",
            title: "사용자 관리",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-client",
            title: "거래처 관리",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-product",
            title: "품목 관리",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-bom",
            title: "BOM 관리",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-facility",
            title: "설비 관리",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-process",
            title: "공정 관리",
          },
          {
            // 협성, 협성테크 전용메뉴
            icon: "FileText",
            pageName: "top-menu-master-mold",
            title: "금형 관리",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-code-bad",
            title: "불량코드 관리",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-code-nonop",
            title: "비가동코드 관리",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-facility-parts",
            title: "설비부품 관리",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-quality-std",
            title: "품질기준정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-facility-std",
            title: "설비기준정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-stock-std",
            title: "재고기준정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-master-recipe",
            title: "레시피관리",
          },
        ],
      },
      {
        icon: "Folders",
        pageName: "",
        title: "주문관리",
        subMenu: [
          {
            icon: "FileText",
            pageName: "top-menu-order-add",
            title: "수주등록",
          },
          {
            icon: "FileText",
            pageName: "top-menu-order-current",
            title: "수주현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-order-forecast",
            title: "수주대비납품 예보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-order-notify",
            title: "수주대비납품 통보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-order-delivery",
            title: "납품",
          },
          {
            icon: "FileText",
            pageName: "top-menu-order-order",
            title: "발주등록",
          },
          {
            icon: "FileText",
            pageName: "top-menu-order-order-current",
            title: "발주현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-order-facility-parts",
            title: "설비부품발주등록",
          },
          {
            icon: "FileText",
            pageName: "top-menu-order-facility-parts-current",
            title: "설비부품발주현황",
          },
        ],
      },
      {
        icon: "Folders",
        pageName: "",
        title: "생산관리",
        subMenu: [
          {
            icon: "FileText",
            pageName: "top-menu-production-plan-add",
            title: "생산계획",
          },
          {
            icon: "FileText",
            pageName: "top-menu-production-task-add",
            title: "작업지시",
          },
          {
            icon: "FileText",
            pageName: "top-menu-production-task-current",
            title: "작업현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-production-task-report",
            title: "생산실적집계",
          },
          {
            icon: "FileText",
            pageName: "top-menu-production-bad-rework",
            title: "불량재작업",
          },
        ],
      },
      {
        icon: "Folders",
        pageName: "",
        title: "공정관리",
        subMenu: [
          {
            icon: "FileText",
            pageName: "top-menu-process-lot",
            title: "LOT출력(바코드)",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-lot-track",
            title: "LOT추적",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-checker",
            title: "검사기 설비상태정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-plate",
            title: "제판기 설비상태정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-printer1",
            title: "인쇄기1 설비상태정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-printer2",
            title: "인쇄기2 설비상태정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-printer3",
            title: "인쇄기3 설비상태정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-printer4",
            title: "인쇄기4 설비상태정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-printer5",
            title: "인쇄기5 설비상태정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-printer6",
            title: "인쇄기6 설비상태정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-printer7",
            title: "인쇄기7 설비상태정보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-process-printer8",
            title: "인쇄기8 설비상태정보",
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
            pageName: "top-menu-stock-receive-raw",
            title: "원부자재 입고",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-wip-raw",
            title: "원부자재 불출",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-wip-monitor-raw",
            title: "원부자재 재공현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-use-raw",
            title: "원부자재 사용",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-monitor-raw",
            title: "원부자재 재고현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-receive-half",
            title: "반제품 입고",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-wip-half",
            title: "반제품 불출",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-wip-monitor-half",
            title: "반제품 재공현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-use-half",
            title: "반제품 사용",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-monitor-half",
            title: "반제품 재고현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-receive-finish",
            title: "완제품 입고",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-monitor-finish",
            title: "완제품 재고현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-receive-parts",
            title: "설비부품 입고등록",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-use-parts",
            title: "설비부품 출고등록",
          },
          {
            icon: "FileText",
            pageName: "top-menu-stock-monitor-parts",
            title: "설비부품 재고현황",
          },
        ],
      },
      {
        icon: "Folders",
        pageName: "",
        title: "품질관리",
        subMenu: [
          {
            icon: "FileText",
            pageName: "top-menu-quality-standard",
            title: "품질기준서",
          },
          {
            icon: "FileText",
            pageName: "top-menu-quality-report",
            title: "검사성적서",
          },
          {
            icon: "FileText",
            pageName: "top-menu-quality-incoming",
            title: "수입검사",
          },
          {
            icon: "FileText",
            pageName: "top-menu-quality-process",
            title: "공정검사",
          },
          {
            icon: "FileText",
            pageName: "top-menu-quality-shipment",
            title: "출하검사",
          },
          // {
          //   icon: "FileText",
          //   pageName: "top-menu-quality-inadequate",
          //   title: "부적합 관리",
          // },
        ],
      },
      {
        // 협성, 협성테크 전용 메뉴
        icon: "Folders",
        pageName: "",
        title: "금형관리",
        subMenu: [
          {
            icon: "FileText",
            pageName: "top-menu-mold-use",
            title: "금형사용",
          },
          {
            icon: "FileText",
            pageName: "top-menu-mold-repair",
            title: "금형수선",
          },
          {
            icon: "FileText",
            pageName: "top-menu-mold-check",
            title: "금형점검",
          },
        ],
      },
      {
        icon: "Folders",
        pageName: "",
        title: "모니터링",
        subMenu: [
          {
            icon: "FileText",
            pageName: "top-menu-monitoring-kpi1",
            title: "설비 가동률 현황(KPI)",
          },
          {
            icon: "FileText",
            pageName: "top-menu-monitoring-kpi2",
            title: "재고비용 현황(KPI)",
          },
          {
            icon: "FileText",
            pageName: "top-menu-monitoring-daily",
            title: "설비 일상점검 현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-monitoring-prevent",
            title: "설비 예방보전 현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-monitoring-mtbf",
            title: "MTBF 현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-monitoring-mttr",
            title: "MTTR 현황",
          },
          {
            icon: "FileText",
            pageName: "top-menu-monitoring-oee",
            title: "OEE현황",
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
            pageName: "top-menu-prevent-plan",
            title: "예방보전계획",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-daily-plan",
            title: "일상점검계획",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-repair-plan",
            title: "설비수리계획",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-life-plan",
            title: "설비부품수명계획",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-forecast",
            title: "예방보전 예보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-notice",
            title: "예방보전 통보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-error-notify",
            title: "설비고장발생 통보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-daily-notify",
            title: "일상점검 확인통보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-repair-forecast",
            title: "설비수리 예보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-repair-notify",
            title: "설비수리 통보",
          },
          {
            icon: "FileText",
            pageName: "top-menu-prevent-change-notify",
            title: "설비부품 교체시기 통보",
          },
        ],
      },
    ],
  }),
});
