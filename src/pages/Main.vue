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

import moment from "moment";

import RunningCard from "../components/Common/Main/RunningCard.vue";
import DisabledRunningCard from "../components/Common/Main/DisabledRunningCard.vue";
import KPICard from "../components/Common/Main/KPICard.vue";
import DisabledKPICard from "../components/Common/Main/DisabledKPICard.vue";
import NoticeCard from "../components/Common/Main/NoticeCard.vue";

import { Chart } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import router from "../router";
Chart.register(ChartDataLabels);

onMounted(async () => {
  setInterval(() => {
    now.value = moment().format("YYYY-MM-DD HH:mm:ss");
  }, 1000);
  setInterval(() => {
    switch_page_func();
  }, 5000);
});

// 날짜 구하기
const now = ref(moment().format("YYYY-MM-DD HH:mm:ss"));

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
      <Button
        class="flex items-center ml-5"
        as="a"
        variant="primary"
        @click="switch_page_func()"
        ><Lucide icon="ArrowLeftRight" class="w-4 h-4 mr-2" />표시전환
      </Button>
    </div>
    <!--BEGIN : 첫번째 표시-->
    <div
      v-if="switch_page == 'first'"
      class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-6 mt-3"
    >
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
      <RunningCard
        @click="$router.push('process/printer4')"
        name="인쇄기4"
        :run="false"
      />
    </div>
    <!--END : 첫번째 표시-->
    <!--BEGIN : 두번째 표시-->
    <div
      v-if="switch_page == 'second'"
      class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-6 mt-3"
    >
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
      <DisabledRunningCard />
      <DisabledRunningCard />
    </div>
    <!--END : 두번째 표시-->
    <!--BEGIN : KPI 표시-->
    <div class="mt-7 grid grid-cols-6 sm:grid-cols-6 xl:grid-cols-6 gap-6 mt-5">
      <KPICard
        @click="$router.push('monitoring/kpi')"
        data="2%"
        name="설비가동률"
        name2="향상률"
      />
      <KPICard
        @click="$router.push('monitoring/kpi')"
        data="5%"
        name="재고비용"
        name2="절감률"
      />
      <DisabledKPICard />
      <DisabledKPICard />
      <NoticeCard />
    </div>
    <!--END : KPI 표시-->
    <!--BEGIN : Chart 표시-->
    <div
      class="mt-7 grid grid-cols-1 sm:grid-cols-6 xl:grid-cols-12 gap-6 mt-5"
    >
      <div class="col-span-1 sm:col-span-3 xl:col-span-4 intro-y bg-white">
        <div class="text-center mt-3 mb-3">
          <FormLabel class="text-lg font-bold">목표대비 생산수</FormLabel>
        </div>
        <div class="p-2"><VerticalBarChart :height="265" /></div>
      </div>
      <div class="col-span-1 sm:col-span-3 xl:col-span-4 intro-y bg-white">
        <div class="text-center mt-3 mb-3">
          <FormLabel class="text-lg font-bold">불량발생빈도</FormLabel>
        </div>

        <div class="p-2"><PieChart :height="265" /></div>
      </div>
      <div class="col-span-1 sm:col-span-3 xl:col-span-4 intro-y bg-white">
        <div class="text-center mt-3 mb-3">
          <FormLabel class="text-lg font-bold">설비가동률</FormLabel>
        </div>

        <div class="p-2"><LineChart :height="265" /></div>
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
