<script setup lang="ts">
import { ref, Ref, onMounted, watch, getCurrentInstance } from "vue";
import router from "../../../router";
import Button from "../../../base-components/Button";
import {
  FormInput,
  FormSelect,
  FormCheck,
} from "../../../base-components/Form";
import Lucide from "../../../base-components/Lucide";
import { Dialog, Menu } from "../../../base-components/Headless";
import Table from "../../../base-components/Table";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import Litepicker from "../../../base-components/Litepicker";
import TomSelect from "tom-select";
import PaginationComponent from "../../../components/Pagination/PaginationComponent.vue"; // 페이징설정
import { toast } from "vue3-toastify";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import { OrderAccept } from "../../../interfaces/menu/orderInterface";
import { MasterClient } from "../../../interfaces/menu/MasterInterface";

// 컴포넌트 로드
const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.OrderCurrent; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  dataManager.loadDatas(); // 거래처 데이터 불러오기
  setTimeout(() => {
    menu_fix.value = ".";
  }, 500);
});

// 오늘날짜
dayjs.locale("ko");
const now = dayjs().locale("ko").format("YYYY-MM-DD dddd");

// 메뉴재정렬 (메뉴 레이아웃 밀리는 문제 해결 코드)
const menu_fix = ref();

// 페이징기능
const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst = () => {
  currentPage.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// dataManager 만들기
const url = "/api/order/accept";
const dataManager = useSendApi<OrderAccept>(url, currentPage, rowsPerPage);

// 테이블항목 설정 및 가로크기 조정
const table_setting = {
  순번: { name: "순번", style: "text-align: center;" },
  항목1: { name: "수주일", style: "text-align: center;" },
  항목2: { name: "코드", style: "" },
};

// v-tom (모달 실시간 데이터 변동) 에 필요한 함수
const vTom = {
  mounted(el: any, binding: any, vnode: any) {
    const options = binding.value || {};
    const defaultOptions = {
      onInitialize: function () {
        // the onInitialize callback is invoked once the control is completely initialized.
        // console.log("onInitialize", this);
      },
    };
    new TomSelect(el, { ...defaultOptions, ...options });
  },
  unmounted(el: any) {
    const tomSelect = el.tomselect;
    if (tomSelect) {
      tomSelect.destroy();
      delete el.tomselect;
    }
  },
};

// ########################## 알림 기능 ##########################
const noti = (data: string) => {
  Notification.requestPermission();
  new Notification("설비 알림", {
    body: data,
    image: "../assets/image/logo.png",
  });
};
</script>

##############################################################################################################

<template>
  <div v-if="user_level >= 2">
    <div class="px-3 pt-3">{{ now }}</div>

    <!-- BEGIN: Data List -->
    <div class="intro-y">
      <div class="px-3">
        <Table class="border-spacing-y-[8px] border-separate -mt-2">
          <Table.Thead
            class="bg-slate-100"
            style="position: sticky; top: 0px; z-index: 2"
          >
            <Table.Tr>
              <Table.Th
                class="px-2 text-center w-1/12 border-b-0 whitespace-nowrap font-bold"
                :style="table_setting.순번.style"
              >
                {{ table_setting.순번.name }}
              </Table.Th>
              <Table.Th
                class="px-2 text-center w-4/12 border-b-0 whitespace-nowrap font-bold"
                :style="table_setting.항목1.style"
              >
                {{ table_setting.항목1.name }}
              </Table.Th>
              <Table.Th
                class="px-2 text-center w-7/12 border-b-0 whitespace-nowrap font-bold"
                :style="table_setting.항목2.style"
              >
                {{ table_setting.항목2.name }}
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody style="position: relative; z-index: 1">
            <Table.Tr
              v-for="(todo, index) in dataManager.datas.value"
              :key="todo.NO"
              class="intro-x"
            >
              <Table.Td
                class="px-2 first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_setting.순번.style"
              >
                <div>{{ index + 1 + (currentPage - 1) * rowsPerPage }}</div>
              </Table.Td>
              <Table.Td
                class="px-2 first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_setting.항목1.style"
              >
                <div>
                  {{ todo[table_setting.항목1.name] }}
                </div>
              </Table.Td>
              <Table.Td
                class="px-2 first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                :style="table_setting.항목2.style"
              >
                <div>
                  <label>{{ todo[table_setting.항목2.name] }} </label>
                </div>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        <div class="text-center mt-20" v-if="dataManager.dataCount.value == 0">
          저장된 데이터가 없습니다.
        </div>
      </div>
    </div>
    <!-- END: Data List -->
  </div>

  <!-- BEGIN : 권한 경고 -->
  <div class="intro-y" v-if="user_level < 2">
    <div class="mt-20 items-center text-center">
      <div>
        <Lucide icon="AlertTriangle" class="w-20 h-20 mx-auto text-warning" />
      </div>
      <div class="mt-3 text-2xl">ACCESS DENIED</div>
    </div>
    <div class="mt-5 text-center">액세스 권한이 없습니다.</div>
    <div class="mt-2 text-center">
      IT 관리자에게 연락하여 액세스 권한을 요청하세요.
    </div>
  </div>
  <!-- END : 권한 없을 때 -->
  <!-- BEGIN: FOOTER(COPYRIGHT) -->
  <div class="intro-y mt-5 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved{{ menu_fix }}</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->
</template>