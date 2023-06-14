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
import Litepicker from "../../../base-components/Litepicker";
import TomSelect from "tom-select";
import PaginationComponent from "../../../components/Pagination/PaginationComponent.vue"; // 페이징설정
import { toast } from "vue3-toastify";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../../composables/useSendApi";
import { OrderAccept } from "../../../interfaces/menu/orderInterface";
import { MasterClient } from "../../../interfaces/menu/masterInterface";

// 컴포넌트 로드
import BarcodeReader from "../../../components/Common/Mobile/Stock/BarcodeReader.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.OrderCurrent; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  dataManager.loadDatas(); // 거래처 데이터 불러오기
  setTimeout(() => {
    menu_fix.value = ".";
  }, 500);
});

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

// ########################## 조회기간 설정 ##########################
// 날짜 구하기
const searchDate = ref("전체기간");
const max_year = dayjs().format("YYYY");
const min_year = dayjs().add(-3, "years").format("YYYY");
// searchDate가  변경되면 실행
watch([searchDate], (newValue, oldValue) => {
  search();
  pageChangeFirst();
});
// 날짜 리셋
const reset_date = () => {
  searchDate.value = "전체기간";
  const litepicker_init = document.querySelector("#litepicker") as any;
  litepicker_init.value = "전체기간";
};
// Litepicker ButtonText가 오류나서 없애기
const litepikerButtonText: any = {
  reset: "새로고침",
  apply: "적용",
  cancel: "취소",
};

// ########################## 조회  ##########################
const searchKey = ref("전체");
const searchInput = ref("");
const sortKey = ref("등록일");
const sortOrder = ref("내림차순");
const sortOrderToggle = () => {
  sortOrder.value = sortOrder.value == "내림차순" ? "오름차순" : "내림차순";
};
//  정렬기준이 변경되면 실행
watch([sortKey, sortOrder], (newValue, oldValue) => {
  search();
  pageChangeFirst();
});
const search = () => {
  // console.log(searchKey.value, searchInput.value);
  dataManager.searchDatas(
    searchDate.value,
    searchKey.value,
    searchInput.value,
    sortKey.value,
    sortOrder.value
  );
};

// ########################## 알림 기능 ##########################
const noti = (data: string) => {
  Notification.requestPermission();
  new Notification("설비 알림", {
    body: data,
    image: "../assets/image/logo.png",
  });
};

// ##### 바코드리더 Modal #####
const barcodeReaderModal = ref(false);
const setBarcodeReaderModal = (value: boolean) => {
  barcodeReaderModal.value = value;
};
</script>

##############################################################################################################

<template>
  <div v-if="user_level >= 2">
    <div class="p-3">
      <div class="intro-y flex items-center mt-3">
        <div>
          <Button
            class="mr-2 shadow-md"
            as="a"
            size="sm"
            variant="outline-primary"
            @click="reset_date"
            title="기간 초기화"
            ><Lucide icon="CalendarX" class="w-5 h-5"
          /></Button>
        </div>
        <div>
          <div>
            <Litepicker
              v-model="searchDate"
              :options="{
                autoApply: false,
                singleMode: false,
                numberOfColumns: 1,
                numberOfMonths: 1,
                showWeekNumbers: true,
                dropdowns: {
                  minYear: Number(min_year),
                  maxYear: Number(max_year),
                  months: true,
                  years: true,
                },
                lang: 'ko',
                format: 'YY/MM/DD',
                delimiter: ' - ',
                buttonText: litepikerButtonText,
              }"
              class="block w-40 mx-auto !box"
              placeholder="전체기간"
            />
          </div>
        </div>
        <div class="ml-2">
          <div class="items-center text-slate-500">
            <FormInput
              type="text"
              class="w-full !box"
              v-model="searchInput"
              @keyup.enter="
                () => {
                  search();
                  pageChangeFirst();
                }
              "
              placeholder="검색"
            />
            <button
              @click="
                () => {
                  search();
                  pageChangeFirst();
                }
              "
            >
              <Lucide
                icon="Search"
                class="absolute top-2.5 right-2 w-4 h-4 my-auto mr-3"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- BEGIN: Pagination-->
    <div class="flex flex-wrap items-center mt-0 intro-y sm:flex-nowrap">
      <div class="flex mx-auto">
        <PaginationComponent
          class="pagination-component"
          v-model="currentPage"
          :numberOfPages="dataManager.numberOfPages.value"
        />
      </div>
    </div>
    <div class="intro-y flex items-center">
      <div class="">
        <span class="ml-3 mr-3"
          >[ {{ dataManager.dataCount }}개 데이터 조회됨 ]
        </span>
        <span class="mr-4">
          [ {{ currentPage }} / {{ dataManager.numberOfPages }} 페이지 ]</span
        >
      </div>
      <div class="ml-auto"></div>
      <div class="mr-3">
        <FormSelect
          class="w-20 !box"
          v-model="rowsPerPage"
          @change="pageChangeFirst"
        >
          <option>10</option>
          <option>25</option>
          <option>50</option>
          <option>100</option>
          <option :value="dataManager.dataCount.value">전체</option>
        </FormSelect>
      </div>
    </div>

    <!-- END: Pagination-->
    <div>
      <Button @click="setBarcodeReaderModal(true)">바코드리더 테스트</Button>
    </div>
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

  <!-- BEGIN: 바코드리더 Modal -->
  <Dialog
    :open="barcodeReaderModal"
    size="md"
    @close="
      () => {
        setBarcodeReaderModal(false);
      }
    "
  >
    <Dialog.Panel style="top: 25%">
      <div class="p-3">
        <div class="font-bold text-xl text-center pt-4">바코드리더 테스트</div>
        <div><BarcodeReader /></div>
        <div class="px-5 pb-4 pt-5 text-center">
          <Button
            variant="primary"
            type="button"
            class="w-24 mr-5"
            @click="setBarcodeReaderModal(false)"
          >
            확인
          </Button>
          <Button
            variant="outline-primary"
            type="button"
            class="w-24"
            @click="setBarcodeReaderModal(false)"
          >
            취소
          </Button>
        </div>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 바코드리더 Modal -->
</template>
