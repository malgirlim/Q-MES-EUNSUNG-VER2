<script setup lang="ts">
import { ref, Ref, onMounted, watch, getCurrentInstance } from "vue";
import router from "../../router";
import Button from "../../base-components/Button";
import {
  FormInput,
  FormSelect,
  FormCheck,
  FormTextarea,
} from "../../base-components/Form";
import Lucide from "../../base-components/Lucide";
import { Dialog, Menu } from "../../base-components/Headless";
import Table from "../../base-components/Table";
import dayjs from "dayjs";
import Litepicker from "../../base-components/Litepicker";
import TomSelect from "tom-select";
import { Tab } from "../../base-components/Headless";
import * as XLSX from "xlsx";
import { read, utils, writeFileXLSX } from "xlsx";
import printJS from "print-js";
import PaginationComponent from "../../components/Pagination/PaginationComponent.vue"; // 페이징설정
import { toast } from "vue3-toastify";
import KPI_OEE_Chart_bar_line from "../../components/Common/Monitoring/KPI_OEE_Chart_bar_line.vue";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../composables/useSendApi";
import { MonitorKPIOEE } from "../../interfaces/menu/monitorInterface";

// 컴포넌트 로드
import MasterDetail from "../../components/Common/Detail/MasterClientDetail.vue";

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.MonitoringKPIOEE; //권한레벨

// 페이지 로딩 시 시작
onMounted(async () => {
  await dataManager.loadDatas(); // 메인으로 쓸 데이터 불러오기
  await searchChartData(); // 그래프 데이터 불러오기
});

// 페이징기능
const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수
const pageChangeFirst = () => {
  currentPage.value = 1; // 데이터 갯수 변경 시 1페이지로 이동
};

// dataManager 만들기
const url = "/api/monitor/kpi/oee";
const dataManager = useSendApi<MonitorKPIOEE>(url, currentPage, rowsPerPage);

// 테이블항목 설정 및 가로크기 조정
const table_setting = {
  체크박스: { name: "체크박스", style: "width: 5px" },
  순번: { name: "순번", style: "width: 5px; text-align: center;" },
  항목1: { name: "설비명", style: "width: 50px; text-align: center;" },
  항목2: { name: "년월", style: "width: 50px; text-align: center;" },
  항목3: { name: "가동효율", style: "width: 50px; text-align: center;" },
  항목4: { name: "품질효율", style: "width: 50px; text-align: center;" },
  항목5: { name: "성능효율", style: "width: 50px; text-align: center;" },
  항목6: { name: "OEE", style: "width: 50px; text-align: center;" },
  항목7: { name: "목표", style: "width: 50px; text-align: center;" },
  상세보기: { name: "정보", style: "width: 50px; text-align: center;" },
  편집: { name: "편집", style: "width: 50px; text-align: center;" },
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

// ########################## 연도에 따른 조회 및 그래프 데이터 설정 ##########################
// 연도 구하기
const selectYear = ref("2023");
// selectYear가  변경되면 실행
watch([selectYear], async (newValue, oldValue) => {
  await searchChartData();
  pageChangeFirst();
});

// 그래프 데이터
const 월별_OEE = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const 월별_목표 = ref([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
async function searchChartData() {
  await dataManager.searchDatas(
    searchDate.value,
    searchKey.value,
    selectYear.value,
    sortKey.value,
    sortOrder.value
  );

  const data = dataManager.dataSearchAll.value;
  월별_OEE.value = [
    Number(data.filter((c) => c.년월 == selectYear.value + "-01")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-02")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-03")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-04")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-05")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-06")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-07")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-08")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-09")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-10")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-11")[0]?.OEE ?? 0),
    Number(data.filter((c) => c.년월 == selectYear.value + "-12")[0]?.OEE ?? 0),
  ];

  월별_목표.value = [
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
    Number(data[0]?.목표 ?? 0),
  ];
}

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
const searchKey = ref("설비별");
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

// ########################## Print 다운로드 ##########################
// Print.js  Modal
const printModal = ref(false);
const setPrintModal = (value: boolean) => {
  printModal.value = value;
};
// print.js 프린트 기능
const printPage = (data: any) => {
  printJS({
    printable: data,
    properties: [
      "사업자번호",
      "거래처명",
      "담당자",
      "전화번호",
      "휴대폰번호",
      "팩스",
      "이메일",
    ],
    type: "json",
    documentTitle: "기준정보 > 거래처 관리",
    repeatTableHeader: true,
    style: "*{font-size:12px;}",
  });
};

// ########################## 엑셀 다운로드 및 업로드 ##########################
// 엑셀 다운로드 Modal
const excelExportModal = ref(false);
const setExcelExportModal = (value: boolean) => {
  excelExportModal.value = value;
};
// SheetJS(엑셀출력) 용
function exportFile(data: any) {
  console.log(data);
  const ws = utils.json_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Data");
  writeFileXLSX(
    wb,
    "기준정보_거래처관리_" + dayjs().format("YYMMDD_HHmmss") + "_export.xlsx"
  );
}
</script>

##########################################################################################################################
##########################################################################################################################
##########################################################################################################################

<template>
  <div v-if="user_level >= 2">
    <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
    <!-- BEGIN : 상단 그래프 -->
    <div class="grid grid-cols-4 gap-5 mt-5 mb-5 intro-y" style="height: 330px">
      <div class="col-span-1 p-5 bg-white rounded rounded-md">
        <div class="text-center font-bold text-xl">
          <div class="text-center">
            <div class="mt-1">
              <div class="grid grid-cols-3">
                <div class="px-3 col-span-1">
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
                        <div>평균가동</div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="mx-1 p-2 w-full h-12 text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                  >
                    <div class="text-2xl">
                      {{
                        Number(
                          dataManager.dataSearchAll.value.reduce(
                            (sum, data) => Number(sum) + Number(data.가동효율),
                            0
                          ) / dataManager.dataSearchAll.value.length
                        ).toLocaleString()
                      }}%
                    </div>
                  </div>
                </div>
                <div class="px-3 col-span-1">
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
                        <div>평균품질</div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="mx-1 p-2 w-full h-12 text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                  >
                    <div class="text-2xl">
                      {{
                        Number(
                          dataManager.dataSearchAll.value.reduce(
                            (sum, data) => Number(sum) + Number(data.품질효율),
                            0
                          ) / dataManager.dataSearchAll.value.length
                        ).toLocaleString()
                      }}%
                    </div>
                  </div>
                </div>
                <div class="px-3 col-span-1">
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
                        <div>평균성능</div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="mx-1 p-2 w-full h-12 text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                  >
                    <div class="text-2xl">
                      {{
                        Number(
                          dataManager.dataSearchAll.value.reduce(
                            (sum, data) => Number(sum) + Number(data.성능효율),
                            0
                          ) / dataManager.dataSearchAll.value.length
                        ).toLocaleString()
                      }}%
                    </div>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2">
                <div class="px-3 mt-5 col-span-1">
                  <div
                    class="text-lg mx-1 py-0.5 w-full border-l-2 border-r-2 border-t-2 border-success bg-success text-white rounded-t-md"
                  >
                    <div class="flex">
                      <div class="flex m-auto items-center">
                        <div>
                          <Lucide class="w-5 h-5 text-white mr-1" icon="Flag" />
                        </div>
                        <div>목표</div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="mx-1 p-2 w-full h-12 text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                  >
                    <div class="text-2xl">
                      {{
                        Number(
                          dataManager.dataSearchAll.value.reduce(
                            (sum, data) => Number(sum) + Number(data.목표),
                            0
                          ) / dataManager.dataSearchAll.value.length
                        ).toLocaleString()
                      }}%
                    </div>
                  </div>
                </div>
                <div class="px-3 mt-5 col-span-1">
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
                        <div>평균OEE</div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="mx-1 p-2 w-full h-12 text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                  >
                    <div class="text-2xl">
                      {{
                        Number(
                          dataManager.dataSearchAll.value.reduce(
                            (sum, data) => Number(sum) + Number(data.OEE),
                            0
                          ) / dataManager.dataSearchAll.value.length
                        ).toLocaleString()
                      }}%
                    </div>
                  </div>
                </div>
              </div>
              <div class="px-3 mt-5">
                <div
                  class="text-lg mx-1 py-0.5 w-full border-l-2 border-r-2 border-t-2 border-success bg-success text-white rounded-t-md"
                >
                  <div class="flex">
                    <div class="flex m-auto items-center">
                      <div>
                        <Lucide
                          class="w-5 h-5 text-white mr-1"
                          icon="TrendingUp"
                        />
                      </div>
                      <div>평균목표대비달성률</div>
                    </div>
                  </div>
                </div>
                <div
                  class="mx-1 p-2 w-full h-12 text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                >
                  <div class="text-2xl">
                    {{
                      Number(
                        (dataManager.dataSearchAll.value.reduce(
                          (sum, data) =>
                            Number(sum) + Number(data.OEE) / Number(data.목표),
                          0
                        ) /
                          dataManager.dataSearchAll.value.length) *
                          100
                      ).toLocaleString()
                    }}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-span-3 p-5 bg-white rounded rounded-md">
        <div class="text-center font-bold text-xl">KPI 설비종합효율</div>
        <div style="height: 270px">
          <KPI_OEE_Chart_bar_line
            v-if="searchKey == '설비별'"
            :x_label="
              dataManager.dataSearchAll.value.map((data) => data.설비명)
            "
            :dataset1_label="'OEE'"
            :dataset1_data="
              dataManager.dataSearchAll.value.map((data) => data.OEE)
            "
            :dataset1_type="'bar'"
            :dataset2_label="'목표'"
            :dataset2_data="
              dataManager.dataSearchAll.value.map((data) => data.목표)
            "
            :dataset2_type="'bar'"
            :title_text="searchDate"
          />
          <KPI_OEE_Chart_bar_line
            v-if="searchKey == '월별'"
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
            :dataset1_label="'OEE'"
            :dataset1_data="월별_OEE"
            :dataset1_type="'line'"
            :dataset2_label="'목표'"
            :dataset2_data="월별_목표"
            :dataset2_type="'line'"
            :title_text="selectYear + '년'"
          />
        </div>
      </div>
    </div>
    <!-- END : 상단 그래프 -->

    <!-- BEGIN : 하단 리스트 -->
    <!-- <hr class="text-slate-200 intro-y mt-2 mb-1" style="border: solid 1px" /> -->
    <!-- END : 하단 리스트 -->
    <div class="grid grid-cols-12 gap-1 mt-1">
      <div
        class="flex flex-wrap items-center col-span-12 mt-2 mb-2 intro-y sm:flex-nowrap"
      >
        <div v-if="searchKey == '설비별'">
          <Button
            class="w-20 mr-3"
            variant="primary"
            @click="
              () => {
                searchKey = '설비별';
                search();
              }
            "
            >설비별</Button
          >
          <Button
            class="w-20"
            variant="outline-primary"
            @click="
              () => {
                searchKey = '월별';
                searchChartData();
              }
            "
            >월별</Button
          >
        </div>
        <div v-if="searchKey == '월별'">
          <Button
            class="w-20 mr-3"
            variant="outline-primary"
            @click="
              () => {
                searchKey = '설비별';
                search();
              }
            "
            >설비별</Button
          >
          <Button
            class="w-20"
            variant="primary"
            @click="
              () => {
                searchKey = '월별';
                searchChartData();
              }
            "
            >월별</Button
          >
        </div>
        <div class="hidden mx-auto md:block text-slate-500"></div>
        <div class="">
          <a href="" class="flex items-center ml-auto text-primary">
            <Lucide icon="RefreshCcw" class="w-4 h-4 mr-2" /> 새로고침
          </a>
        </div>
        <div class="ml-5" v-if="searchKey == '설비별'">
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
        <div class="text-center" v-if="searchKey == '설비별'">
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
        <div class="ml-5" v-if="searchKey == '월별'">
          <FormSelect
            v-model="selectYear"
            :value="selectYear + '년'"
            class="w-30 mt-3 !box sm:mt-0"
          >
            <option :value="dayjs().format('YYYY')">
              {{ dayjs().format("YYYY") }}년
            </option>
            <option :value="dayjs().add(-1, 'years').format('YYYY')">
              {{ dayjs().add(-1, "years").format("YYYY") }}년
            </option>
            <option :value="dayjs().add(-2, 'years').format('YYYY')">
              {{ dayjs().add(-2, "years").format("YYYY") }}년
            </option>
            <option :value="dayjs().add(-3, 'years').format('YYYY')">
              {{ dayjs().add(-3, "years").format("YYYY") }}년
            </option>
            <option :value="dayjs().add(-4, 'years').format('YYYY')">
              {{ dayjs().add(-4, "years").format("YYYY") }}년
            </option>
            <option :value="dayjs().add(-5, 'years').format('YYYY')">
              {{ dayjs().add(-5, "years").format("YYYY") }}년
            </option>
          </FormSelect>
        </div>

        <div class="ml-3">
          <Menu>
            <Menu.Button :as="Button" class="px-2 !box">
              <span class="flex items-center justify-center w-5 h-5">
                <Lucide icon="MoreVertical" class="w-4 h-4" />
              </span>
            </Menu.Button>
            <Menu.Items style="width: 170px">
              <Menu.Item @click="setPrintModal(true)">
                <Lucide icon="Printer" class="w-4 h-4 mr-2" />
                Print (PDF출력)
              </Menu.Item>
              <Menu.Item @click="setExcelExportModal(true)">
                <Lucide icon="FileDown" class="w-4 h-4 mr-2" />
                Excel 다운로드
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>

      <!-- BEGIN: Pagination-->
      <div
        class="flex flex-wrap items-center col-span-12 mt-0 intro-y sm:flex-nowrap"
      >
        <div class="hidden mx-auto md:block text-slate-500"></div>
        <div>
          <span class="mr-3">
            [ {{ dataManager.dataCount }}개 데이터 조회됨 ]
          </span>
          <span class="mr-4">
            [ {{ currentPage }} / {{ dataManager.numberOfPages }} 페이지 ]
          </span>
        </div>
      </div>
      <!-- END: Pagination-->

      <!-- BEGIN: Data List -->
      <!-- style="height: calc(100vh - 350px)" : 브라우저 화면 창크기에 맞게 변경됨 -->
      <div class="col-span-12 overflow-auto intro-y lg:overflow-visible">
        <div
          class="mr-3"
          style="overflow-y: scroll; overflow-x: hidden; height: 280px"
        >
          <Table class="border-spacing-y-[8px] border-separate -mt-2">
            <Table.Thead
              class="bg-slate-100"
              style="position: sticky; top: 0px; z-index: 2"
            >
              <Table.Tr>
                <!-- <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  id="checkbox"
                  :style="table_setting.체크박스.style"
                >
                  <Input
                    class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed"
                    id="checkbox_all"
                    type="checkbox"
                    :value="mainCheckBox"
                    @click="
                      () => {
                        checkAll(mainCheckBox);
                        mainCheckBox = !mainCheckBox;
                      }
                    "
                  />
                </Table.Th> -->
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.순번.style"
                >
                  {{ table_setting.순번.name }}
                </Table.Th>
                <Table.Th
                  v-if="searchKey == '설비별'"
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목1.style"
                >
                  {{ table_setting.항목1.name }}
                </Table.Th>
                <Table.Th
                  v-if="searchKey == '월별'"
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목2.style"
                >
                  {{ table_setting.항목2.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목3.style"
                >
                  {{ table_setting.항목3.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목4.style"
                >
                  {{ table_setting.항목4.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목5.style"
                >
                  {{ table_setting.항목5.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목6.style"
                >
                  {{ table_setting.항목6.name }}
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.항목7.style"
                >
                  {{ table_setting.항목7.name }}
                </Table.Th>
                <!-- <Table.Th
                  class="text-center border-b-0 whitespace-nowrap font-bold"
                  :style="table_setting.상세보기.style"
                >
                  {{ table_setting.상세보기.name }}
                </Table.Th> -->
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody style="position: relative; z-index: 1">
              <Table.Tr
                v-for="(todo, index) in dataManager.dataSearchAll.value"
                :key="todo.설비NO"
                class="intro-x"
              >
                <!-- <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  id="checkbox"
                  :style="table_setting.체크박스.style"
                >
                  <input
                    class="transition-all duration-100 ease-in-out shadow-sm border-slate-200 cursor-pointer rounded focus:ring-4 focus:ring-offset-0 focus:ring-primary focus:ring-opacity-20 [&[type='checkbox']]:checked:bg-primary [&[type='checkbox']]:checked:border-primary [&[type='checkbox']]:checked:border-opacity-10 [&:disabled:not(:checked)]:bg-slate-100 [&:disabled:not(:checked)]:cursor-not-allowed [&:disabled:checked]:opacity-70 [&:disabled:checked]:cursor-not-allowed"
                    id="checkbox"
                    type="checkbox"
                    :value="todo.NO"
                    v-model="checkDebug"
                  />
                </Table.Td> -->
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.순번.style"
                >
                  <div>{{ index + 1 + (currentPage - 1) * rowsPerPage }}</div>
                </Table.Td>
                <Table.Td
                  v-if="searchKey == '설비별'"
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목1.style"
                >
                  <div>{{ todo[table_setting.항목1.name] }}</div>
                </Table.Td>
                <Table.Td
                  v-if="searchKey == '월별'"
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목2.style"
                >
                  <div>{{ todo[table_setting.항목2.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목3.style"
                >
                  <div>{{ todo[table_setting.항목3.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목4.style"
                >
                  <div>{{ todo[table_setting.항목4.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목5.style"
                >
                  <div>{{ todo[table_setting.항목5.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목6.style"
                >
                  <div>{{ todo[table_setting.항목6.name] }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_setting.항목7.style"
                >
                  <div>{{ todo[table_setting.항목7.name] }}</div>
                </Table.Td>
                <!-- <Table.Td
                  class="first:rounded-l-md last:rounded-r-md text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b] py-0 relative before:block before:w-px before:h-8 before:bg-slate-200 before:absolute before:left-0 before:inset-y-0 before:my-auto before:dark:bg-darkmode-400"
                  :style="table_setting.상세보기.style"
                >
                  <div class="flex items-center justify-center text-cyan-700">
                    <a
                      class="flex items-center mr-3"
                      href="#"
                      @click="
                        () => {
                          editModalData = todo;
                          setDetailModal(true);
                        }
                      "
                    >
                      <Lucide icon="ListPlus" class="w-5 h-5 mr-1" />
                      상세
                    </a>
                  </div>
                </Table.Td> -->
              </Table.Tr>
            </Table.Tbody>
          </Table>
          <div
            class="text-center mt-20"
            v-if="dataManager.dataCount.value == 0"
          >
            저장된 데이터가 없습니다.
          </div>
        </div>
      </div>

      <!-- END: Data List -->
    </div>
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
  <!-- BEGIN: Insert Modal Content -->
  <div class="intro-y mt-5 mr-5" style="text-align: right">
    <footer>&copy;2023 QInnotek. All rights reserved.</footer>
  </div>
  <!-- END: FOOTER(COPYRIGHT) -->

  <!-- ############################################################################################################################
############################################################################################################################
############################################################################################################################ -->

  <!-- BEGIN: 엑셀 다운로드 Modal -->
  <Dialog :open="excelExportModal" @close="setExcelExportModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="FileDown" class="w-16 h-16 mx-auto mt-3 text-primary" />
        <div class="mt-5 text-3xl">Excel 다운로드</div>
      </div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-38 mr-3"
          @click="
            () => {
              exportFile(dataManager.datas.value);
              setExcelExportModal(false);
            }
          "
        >
          다운로드(현재 페이지)
        </Button>
        <Button
          variant="primary"
          type="button"
          class="w-38 mr-3"
          @click="
            () => {
              exportFile(dataManager.dataSearchAll.value);
              setExcelExportModal(false);
            }
          "
        >
          다운로드(전체)
        </Button>
        <Button
          variant="outline-secondary"
          type="button"
          @click="setExcelExportModal(false)"
          class="w-24 mr-1"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 엑셀 다운로드 Modal -->

  <!-- BEGIN: 프린트 출력 Modal -->
  <Dialog :open="printModal" @close="setPrintModal(false)">
    <Dialog.Panel>
      <div class="p-5 text-center">
        <Lucide icon="Printer" class="w-16 h-16 mx-auto mt-3 text-primary" />
        <div class="mt-5 text-3xl">Print (PDF출력)</div>
        <div class="mt-5">
          PDF출력은 인쇄 대상을 <strong>PDF 저장</strong>으로 지정하세요.
        </div>
      </div>

      <div class="px-5 pb-8 text-center">
        <Button
          variant="primary"
          type="button"
          class="w-38 mr-3"
          @click="
            () => {
              printPage(dataManager.datas.value);
              setPrintModal(false);
            }
          "
        >
          출력(현재 페이지)
        </Button>
        <Button
          variant="primary"
          type="button"
          class="w-38 mr-3"
          @click="
            () => {
              printPage(dataManager.dataSearchAll.value);
              setPrintModal(false);
            }
          "
        >
          출력(전체)
        </Button>
        <Button
          variant="outline-secondary"
          type="button"
          @click="setPrintModal(false)"
          class="w-24 mr-1"
        >
          취소
        </Button>
      </div>
    </Dialog.Panel>
  </Dialog>
  <!-- END: 프린트 출력 Modal -->
</template>
