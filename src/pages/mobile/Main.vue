<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import _ from "lodash";
import { FormLabel } from "../../base-components/Form";

import Lucide from "../../base-components/Lucide";
import Button from "../../base-components/Button";
import PieChart from "../../components/PieChart";
import VerticalBarChart from "../../components/VerticalBarChart";
import LineChart from "../../components/LineChart";
import LoadingIcon from "../../base-components/LoadingIcon";

import KPIChart_line from "../../components/Common/Main/KPIChart_line.vue";
import KPIChart_bar_line from "../../components/Common/Main/KPIChart_bar_line.vue";
import KPIChart_line_filled from "../../components/Common/Main/KPIChart_line_filled.vue";
import KPIChart_bar_bar from "../../components/Common/Main/KPIChart_bar_bar.vue";

import KPI_BadRate_Chart_bar_line from "../../components/Common/Mobile/Main/KPI_BadRate_Chart_bar_line.vue";
import KPI_FacilityRate_Chart_bar_line from "../../components/Common/Mobile/Main/KPI_FacilityRate_Chart_bar_line.vue";
import KPI_ManHour_Chart_bar_line from "../../components/Common/Monitoring/KPI_ManHour_Chart_bar_line.vue";
import KPI_OEE_Chart_bar_line from "../../components/Common/Monitoring/KPI_OEE_Chart_bar_line.vue";
import KPI_ProductHour_Chart_bar_line from "../../components/Common/Monitoring/KPI_ProductHour_Chart_bar_line.vue";
import KPI_ReturnCost_Chart_bar_line from "../../components/Common/Monitoring/KPI_ReturnCost_Chart_bar_line.vue";
import KPI_StockCost_Chart_bar_line from "../../components/Common/Monitoring/KPI_StockCost_Chart_bar_line.vue";
import {
  MonitorKPIBadRate,
  MonitorKPIFacilityRate,
  MonitorKPIManHour,
  MonitorKPIOEE,
  MonitorKPIProductHour,
  MonitorKPIReturnCost,
  MonitorKPIStockCost,
} from "../../interfaces/menu/monitorInterface";

import dayjs from "dayjs";

import RunningCard from "../../components/Common/Mobile/Main/RunningCard.vue";
import DisabledRunningCard from "../../components/Common/Mobile/Main/DisabledRunningCard.vue";
import KPICard from "../../components/Common/Main/KPICard.vue";
import DisabledKPICard from "../../components/Common/Main/DisabledKPICard.vue";
import NoticeCard2 from "../../components/Common/Main/NoticeCard2.vue";

import { Chart } from "chart.js";
import router from "../../router";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../composables/useSendApi";
import { MainFacilityStatus } from "../../interfaces/mainInterface";

var mobilecheck = function () {
  var check = false;
  (function (a, b) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};
if (mobilecheck()) {
} else location.href = "/"; //PC로 접속시 이동 경로

onMounted(async () => {
  setInterval(() => {
    now.value = dayjs().format("YYYY-MM-DD(dd) HH:mm:ss");
  }, 1000);
  // setInterval(() => {
  //   switch_page_func();
  // }, 5000);

  // 60초마다 데이터 불러오기
  await getMainData(); // 첫 실행
  setInterval(() => {
    getMainData();
  }, 60000);
});

// 날짜 구하기
dayjs.locale("ko");
const now = ref(dayjs().format("YYYY-MM-DD(dd) HH:mm:ss"));
const currentYear = ref(dayjs().format("YYYY"));

// 페이지 전환
const switch_page = ref("first");
const switch_page_func = () => {
  if (switch_page.value == "second") {
    switch_page.value = "first";
  } else {
    switch_page.value = "second";
  }
};

// ################################################### 데이터 가져오기 ###################################################
// 설비상태현황 가져오기
const url_main_facilitystatus = "/api/main/facilitystatus";
const facilitystatus = useSendApi<MainFacilityStatus>(
  url_main_facilitystatus,
  ref(1),
  ref(1)
);
// KPI 공정불량률 가져오기
const 공정불량률_실적 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const 공정불량률_목표 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const url_main_kpi_badrate = "/api/main/kpi/badrate";
const kpi_badrate = useSendApi<MonitorKPIBadRate>(
  url_main_kpi_badrate,
  ref(1),
  ref(1)
);
// KPI 설비가동률 가져오기
const 설비가동률_실적 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const 설비가동률_목표 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const url_main_kpi_facilityrate = "/api/main/kpi/facilityrate";
const kpi_facilityrate = useSendApi<MonitorKPIFacilityRate>(
  url_main_kpi_facilityrate,
  ref(1),
  ref(1)
);
// KPI 작업공수 가져오기
const 작업공수_실적 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const 작업공수_목표 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const url_main_kpi_manhour = "/api/main/kpi/manhour";
const kpi_manhour = useSendApi<MonitorKPIManHour>(
  url_main_kpi_manhour,
  ref(1),
  ref(1)
);
// KPI OEE 가져오기
const OEE_실적 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const OEE_목표 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const url_main_kpi_oee = "/api/main/kpi/oee";
const kpi_oee = useSendApi<MonitorKPIOEE>(url_main_kpi_oee, ref(1), ref(1));
// KPI 시간당 생산량 가져오기
const 시간당생산량_실적 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const 시간당생산량_목표 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const url_main_kpi_producthour = "/api/main/kpi/producthour";
const kpi_producthour = useSendApi<MonitorKPIProductHour>(
  url_main_kpi_producthour,
  ref(1),
  ref(1)
);
// KPI 반품비용 가져오기
const 반품비용_실적 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const 반품비용_목표 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const url_main_kpi_returncost = "/api/main/kpi/returncost";
const kpi_returncost = useSendApi<MonitorKPIReturnCost>(
  url_main_kpi_returncost,
  ref(1),
  ref(1)
);
// KPI 재고비용 가져오기
const 재고비용_실적 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const 재고비용_목표 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]); // 그래프 데이터
const url_main_kpi_stockcost = "/api/main/kpi/stockcost";
const kpi_stockcost = useSendApi<MonitorKPIStockCost>(
  url_main_kpi_stockcost,
  ref(1),
  ref(1)
);
// 데이터 불러오기 및 가공
const getMainData = async () => {
  await facilitystatus.loadDatas();
  await kpi_badrate.loadDatas();
  await kpi_facilityrate.loadDatas();
  await kpi_manhour.loadDatas();
  await kpi_oee.loadDatas();
  await kpi_producthour.loadDatas();
  await kpi_returncost.loadDatas();
  await kpi_stockcost.loadDatas();

  const badrate_data = kpi_badrate.dataSearchAll.value;
  const facilityrate_data = kpi_facilityrate.dataSearchAll.value;
  const manhour_data = kpi_manhour.dataSearchAll.value;
  const oee_data = kpi_oee.dataSearchAll.value;
  const producthour_data = kpi_producthour.dataSearchAll.value;
  const returncost_data = kpi_returncost.dataSearchAll.value;
  const stockcost_data = kpi_stockcost.dataSearchAll.value;

  currentYear.value = dayjs().format("YYYY");
  const months = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );

  공정불량률_실적.value = months.map((month) => {
    return Number(
      badrate_data.filter((c) => c.년월 == `${currentYear.value}-${month}`)[0]
        ?.불량률 ?? 0
    );
  });
  공정불량률_목표.value = months.map((month) => {
    return Number(
      badrate_data.filter((c) => c.년월 == `${currentYear.value}-${month}`)[0]
        ?.목표 ?? 0
    );
  });
  설비가동률_실적.value = months.map((month) => {
    return Number(
      facilityrate_data.filter(
        (c) => c.년월 == `${currentYear.value}-${month}`
      )[0]?.가동률 ?? 0
    );
  });
  설비가동률_목표.value = months.map((month) => {
    return Number(
      facilityrate_data.filter(
        (c) => c.년월 == `${currentYear.value}-${month}`
      )[0]?.목표 ?? 0
    );
  });
  작업공수_실적.value = months.map((month) => {
    return Number(
      manhour_data.filter((c) => c.년월 == `${currentYear.value}-${month}`)[0]
        ?.작업공수 ?? 0
    );
  });
  작업공수_목표.value = months.map((month) => {
    return Number(
      manhour_data.filter((c) => c.년월 == `${currentYear.value}-${month}`)[0]
        ?.목표 ?? 0
    );
  });
  OEE_실적.value = months.map((month) => {
    return Number(
      oee_data.filter((c) => c.년월 == `${currentYear.value}-${month}`)[0]
        ?.OEE ?? 0
    );
  });
  OEE_목표.value = months.map((month) => {
    return Number(
      oee_data.filter((c) => c.년월 == `${currentYear.value}-${month}`)[0]
        ?.목표 ?? 0
    );
  });
  시간당생산량_실적.value = months.map((month) => {
    return Number(
      producthour_data.filter(
        (c) => c.년월 == `${currentYear.value}-${month}`
      )[0]?.시간당생산수 ?? 0
    );
  });
  시간당생산량_목표.value = months.map((month) => {
    return Number(
      producthour_data.filter(
        (c) => c.년월 == `${currentYear.value}-${month}`
      )[0]?.목표 ?? 0
    );
  });
  반품비용_실적.value = months.map((month) => {
    return Number(
      returncost_data.filter(
        (c) => c.년월 == `${currentYear.value}-${month}`
      )[0]?.반품금액 ?? 0
    );
  });
  반품비용_목표.value = months.map((month) => {
    return Number(
      returncost_data.filter(
        (c) => c.년월 == `${currentYear.value}-${month}`
      )[0]?.목표 ?? 0
    );
  });
  재고비용_실적.value = months.map((month) => {
    return Number(
      stockcost_data.filter((c) => c.년월 == `${currentYear.value}-${month}`)[0]
        ?.누적재고비용 ?? 0
    );
  });
  재고비용_목표.value = months.map((month) => {
    return Number(
      stockcost_data.filter((c) => c.년월 == `${currentYear.value}-${month}`)[0]
        ?.목표 ?? 0
    );
  });
};
</script>

<template>
  <div class="pl-3 pr-3 pt-2 pb-0">
    <div class="flex items-center h-10 mt-3 intro-y">
      <LoadingIcon icon="circles" class="w-4 h-4 mr-2" />
      <div>
        <h2 class="mr-1 text-lg font-medium truncate" :key="now">
          {{ now }}
        </h2>
      </div>
      <div class="ml-auto">
        <!-- <a href="" class="flex items-center text-primary">
          <Lucide icon="RefreshCcw" class="w-4 h-4 mr-1" /> 새로고침
        </a> -->
      </div>
    </div>
    <div class="text-center"></div>
    <!--BEGIN : 첫번째 표시-->
    <div class="grid grid-cols-2 gap-4 mt-3">
      <RunningCard
        name="검사기"
        :run="facilitystatus.dataSearchAll.value[0]?.설비1 == '가동'"
      />
      <RunningCard
        name="제판기"
        :run="facilitystatus.dataSearchAll.value[0]?.설비2 == '가동'"
      />
      <RunningCard
        name="인쇄기1"
        :run="facilitystatus.dataSearchAll.value[0]?.설비3 == '가동'"
      />
      <RunningCard
        name="인쇄기2"
        :run="facilitystatus.dataSearchAll.value[0]?.설비4 == '가동'"
      />
      <RunningCard
        name="인쇄기3"
        :run="facilitystatus.dataSearchAll.value[0]?.설비5 == '가동'"
      />
      <RunningCard
        name="인쇄기4"
        :run="facilitystatus.dataSearchAll.value[0]?.설비6 == '가동'"
      />
      <RunningCard
        name="인쇄기5"
        :run="facilitystatus.dataSearchAll.value[0]?.설비7 == '가동'"
      />
      <RunningCard
        name="인쇄기6"
        :run="facilitystatus.dataSearchAll.value[0]?.설비8 == '가동'"
      />
      <RunningCard
        name="인쇄기7"
        :run="facilitystatus.dataSearchAll.value[0]?.설비9 == '가동'"
      />
      <DisabledRunningCard />
    </div>
    <!--END : 첫번째 표시-->
    <!--BEGIN : 공지사항 표시-->
    <!-- <div class="mt-7 grid grid-cols-2 gap-4 mt-5">
      <NoticeCard2 type="all" />
      <NoticeCard2 type="part" />
    </div> -->
    <!--END : 공지사항 표시-->
    <!--BEGIN : Chart 표시-->
    <div
      class="mt-7 grid grid-cols-1 sm:grid-cols-6 xl:grid-cols-12 gap-6 mt-5"
    >
      <div class="col-span-1 sm:col-span-3 xl:col-span-4 intro-y bg-white">
        <div class="text-center mt-3">
          <FormLabel class="text-lg font-bold">KPI 설비가동률</FormLabel>
        </div>
        <div class="p-2">
          <KPI_FacilityRate_Chart_bar_line
            :height="265"
            :x_label="[
              '1월',
              '2월',
              '3월',
              '4월',
              '5월',
              '6월',
              '7월',
              '8월',
              '9월',
              '10월',
              '11월',
              '12월',
            ]"
            :dataset1_label="'가동률'"
            :dataset1_data="설비가동률_실적"
            :dataset1_type="'line'"
            :dataset2_label="'목표'"
            :dataset2_data="설비가동률_목표"
            :dataset2_type="'line'"
            :title_text="currentYear + '년'"
          />
        </div>
      </div>
      <div class="col-span-1 sm:col-span-3 xl:col-span-4 intro-y bg-white">
        <div class="text-center mt-3">
          <FormLabel class="text-lg font-bold">KPI 재고비용</FormLabel>
        </div>

        <div class="p-2"><KPIChart_line :height="265" /></div>
      </div>
    </div>
    <!--END : Chart 표시-->
    <!-- BEGIN: FOOTER(COPYRIGHT) -->
    <div class="intro-y mt-5" style="text-align: right">
      <footer>&copy;2023 QInnotek. All rights reserved.</footer>
    </div>
    <!-- END: FOOTER(COPYRIGHT) -->
  </div>
</template>
