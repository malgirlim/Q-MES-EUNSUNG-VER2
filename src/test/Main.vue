<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import _ from "lodash";
import { FormLabel } from "../base-components/Form";

import Lucide from "../base-components/Lucide";
import Button from "../base-components/Button";
import PieChart from "../components/PieChart";
import VerticalBarChart from "../components/VerticalBarChart";
import LineChart from "../components/LineChart";
import LoadingIcon from "../base-components/LoadingIcon";

import KPIChart_line from "../components/Common/Main/KPIChart_line.vue";
import KPIChart_bar_line from "../components/Common/Main/KPIChart_bar_line.vue";
import KPIChart_line_filled from "../components/Common/Main/KPIChart_line_filled.vue";
import KPIChart_bar_bar from "../components/Common/Main/KPIChart_bar_bar.vue";

import dayjs from "dayjs";

import RunningCard from "../components/Common/Main/RunningCard.vue";
import DisabledRunningCard from "../components/Common/Main/DisabledRunningCard.vue";
import KPICard from "../components/Common/Main/KPICard.vue";
import DisabledKPICard from "../components/Common/Main/DisabledKPICard.vue";
import NoticeCard2 from "../components/Common/Main/NoticeCard2.vue";

import { Chart } from "chart.js";
import router from "../router";

import KPIChart_Test from "../test/components/KPIChart_Test.vue";

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
  location.href = "/mobile";
  //모바일로 접속시 이동 경로
}

onMounted(async () => {
  setInterval(() => {
    now.value = dayjs().format("YYYY-MM-DD(dd) HH:mm:ss");
  }, 1000);
  // setInterval(() => {
  //   switch_page_func();
  // }, 5000);
});

// 날짜 구하기
dayjs.locale("ko");
const now = ref(dayjs().format("YYYY-MM-DD(dd) HH:mm:ss"));

// 페이지 전환
const switch_page = ref("first");

const switch_page_func = () => {
  if (switch_page.value == "second") {
    switch_page.value = "first";
  } else {
    switch_page.value = "second";
  }
};
</script>

<template>
  <div>
    <div class="flex items-center h-10 mt-3 intro-y">
      <LoadingIcon icon="circles" class="w-5 h-5 mr-2" />
      <div>
        <h2 class="mr-5 text-lg font-medium truncate" :key="now">
          {{ now }} 현재
        </h2>
      </div>

      <a href="" class="flex items-center ml-auto text-primary">
        <Lucide icon="RefreshCcw" class="w-4 h-4 mr-3" /> 새로고침
      </a>
      <!-- <Button
        class="flex items-center ml-5"
        as="a"
        variant="primary"
        @click="switch_page_func()"
        ><Lucide icon="ArrowLeftRight" class="w-4 h-4 mr-2" />표시전환
      </Button> -->
    </div>
    <!--BEGIN : 첫번째 표시-->
    <div class="grid grid-cols-8 gap-6 mt-3">
      <RunningCard
        @click="$router.push('process/checker')"
        name="검사기"
        :run="true"
      />
      <RunningCard
        @click="$router.push('process/plate')"
        name="제판기"
        :run="true"
      />
      <RunningCard
        @click="$router.push('process/printer1')"
        name="인쇄기1"
        :run="true"
      />
      <RunningCard
        @click="$router.push('process/printer2')"
        name="인쇄기2"
        :run="true"
      />
      <RunningCard
        @click="$router.push('process/printer3')"
        name="인쇄기3"
        :run="false"
      />
      <NoticeCard2 type="all" />
    </div>
    <!--END : 첫번째 표시-->
    <!--BEGIN : 두번째 표시-->

    <!--END : 두번째 표시-->
    <!--BEGIN : KPI 표시-->
    <div class="grid grid-cols-8 gap-6 mt-7">
      <RunningCard
        @click="$router.push('process/printer3')"
        name="인쇄기4"
        :run="false"
      />
      <RunningCard
        @click="$router.push('process/printer5')"
        name="인쇄기5"
        :run="false"
      />
      <RunningCard
        @click="$router.push('process/printer6')"
        name="인쇄기6"
        :run="false"
      />
      <RunningCard
        @click="$router.push('process/printer7')"
        name="인쇄기7"
        :run="false"
      />
      <RunningCard
        @click="$router.push('process/printer8')"
        name="인쇄기8"
        :run="false"
      />
      <NoticeCard2 type="part" />
    </div>
    <!--END : KPI 표시-->

    <!--BEGIN : Chart 표시-->
    <div class="mt-7 grid grid-cols-2 gap-6 mt-5">
      <div class="p-3 col-span-1 intro-y bg-white rounded rounded-md">
        <div class="grid grid-cols-4">
          <div class="col-span-1 text-center">
            <div
              class="mt-14 px-3 cursor-pointer"
              @click="$router.push('monitoring/kpi1')"
            >
              <div
                class="text-lg mx-1 py-0.5 w-full border-l-2 border-r-2 border-t-2 border-success bg-success text-white rounded-t-md"
              >
                <div class="flex">
                  <div class="flex m-auto items-center">
                    <div>
                      <Lucide class="w-5 h-5 text-white mr-1" icon="Flag" />
                    </div>
                    <div>KPI</div>
                  </div>
                </div>
              </div>
              <div
                class="mx-1 p-2 w-full text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md"
              >
                <div>설비 가동률</div>
              </div>
            </div>
            <div class="mt-8">
              <div class="px-3">
                <div
                  class="text-lg mx-1 py-0.5 w-full border-l-2 border-r-2 border-t-2 border-success bg-success text-white rounded-t-md"
                >
                  <div class="flex">
                    <div class="flex m-auto items-center">
                      <div>
                        <Lucide
                          class="w-5 h-5 text-white mr-1"
                          icon="LineChart"
                        />
                      </div>
                      <div>평균가동률</div>
                    </div>
                  </div>
                </div>
                <div
                  class="mx-1 p-2 w-full text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                >
                  <div>54%</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-3">
            <div style="height: 310px">
              <KPIChart_Test
                :x_label="[
                  '초기',
                  '흑점.흑줄',
                  '미성형.이물',
                  '탄화.가스',
                  '스크래치.BURR',
                  '기타불량',
                ]"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="p-3 col-span-1 intro-y bg-white rounded rounded-md">
        <div class="grid grid-cols-4">
          <div class="col-span-1 text-center">
            <div
              class="mt-14 px-3 cursor-pointer"
              @click="$router.push('monitoring/kpi2')"
            >
              <div
                class="text-lg mx-1 py-0.5 w-full border-l-2 border-r-2 border-t-2 border-success bg-success text-white rounded-t-md"
              >
                <div class="flex">
                  <div class="flex m-auto items-center">
                    <div>
                      <Lucide class="w-5 h-5 text-white mr-1" icon="Flag" />
                    </div>
                    <div>KPI</div>
                  </div>
                </div>
              </div>
              <div
                class="mx-1 p-2 w-full text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md"
              >
                <div>재고비용</div>
              </div>
            </div>
            <div class="mt-8">
              <div class="px-3">
                <div
                  class="text-lg mx-1 py-0.5 w-full border-l-2 border-r-2 border-t-2 border-success bg-success text-white rounded-t-md"
                >
                  <div class="flex">
                    <div class="flex m-auto items-center">
                      <div>
                        <Lucide
                          class="w-5 h-5 text-white mr-1"
                          icon="LineChart"
                        />
                      </div>
                      <div>평균절감액</div>
                    </div>
                  </div>
                </div>
                <div
                  class="mx-1 p-2 w-full text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                >
                  <div>626만원</div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-3">
            <div style="height: 310px"><KPIChart_line /></div>
          </div>
        </div>
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
