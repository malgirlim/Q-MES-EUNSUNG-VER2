<script setup lang="ts">
import _, { isArguments } from "lodash";
import { ref, Ref, getCurrentInstance } from "vue";
import Button from "../../base-components/Button";
import { FormInput, FormSelect, FormCheck } from "../../base-components/Form";
import Lucide from "../../base-components/Lucide";
import { Dialog, Menu } from "../../base-components/Headless";
import Table from "../../base-components/Table";
import dayjs from "dayjs";
import Litepicker from "../../base-components/Litepicker";
import TomSelect from "tom-select";
import * as XLSX from "xlsx";
import { read, utils, writeFileXLSX } from "xlsx";
import printJS from "print-js";
import KPI_OEE_Chart_bar_line from "../../components/Common/Monitoring/KPI_OEE_Chart_bar_line.vue";

// API 보내는 함수 및 인터페이스 불러오기
import { useSendApi } from "../../composables/useSendApi";

// 페이징기능
import { onMounted, watch } from "vue";
import PaginationComponent from "../../components/Pagination/PaginationComponent.vue"; // 페이징설정

const { proxy }: any = getCurrentInstance();
const user_level = proxy.gstate.level.MonitoringKPIOEE; //권한레벨

const currentPage = ref(1); // 현재페이지
const rowsPerPage = ref(10); // 한 페이지에 보여질 데이터 갯수

const pageChange = () => {
  // 한 페이지에 보여질 데이터 갯수 변경 시 1페이지로 이동
  currentPage.value = 1;
};

// api 보내기
const url = "";
const {
  datas,
  dataAll,
  dataCount,
  datasAreLoading,
  loadDatas,
  searchDatas,
  insertData,
  editData,
  deleteData,
  insertAllData,
  numberOfPages,
} = useSendApi<StockUse>(url, currentPage, rowsPerPage);

const searchKey = ref("전체");
const searchInput = ref("");
onMounted(async () => {
  loadDatas();
  product.loadDatas();
}); // 페이지 로딩 시 데이터 불러오기

// 조회
const search = () => {
  // console.log(searchKey.value, searchInput.value);
  searchDatas(now2.value, searchKey.value, searchInput.value);
};

// print.js 프린트 기능

const printPage = (data: any) => {
  printJS({
    printable: data,
    properties: [
      "출고일시",
      "품목코드",
      "거래처명",
      "품명",
      "규격",
      "단위",
      "출고수",
      "비고",
    ],
    type: "json",
    documentTitle: "재고 관리 > 원자재 사용 등록",
    repeatTableHeader: true,
    style: "*{font-size:12px;}",
  });
};

// Print.js  Modal
const printModal = ref(false);
const setPrintModal = (value: boolean) => {
  printModal.value = value;
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
    "재고관리_원자재사용등록" + dayjs().format("YYMMDD_HHmmss") + "_export.xlsx"
  );
}

// 날짜 구하기
const now = dayjs().format("YYYY-MM-DD");
const nowPlus = dayjs().add(7, "days").format("YYYY-MM-DD");
const now_year = dayjs().format("YYYY");
const ago_1year = dayjs().add(-1, "years").format("YYYY");
const ago_2year = dayjs().add(-2, "years").format("YYYY");
const ago_3year = dayjs().add(-3, "years").format("YYYY");
const ago_4year = dayjs().add(-4, "years").format("YYYY");
const ago_5year = dayjs().add(-5, "years").format("YYYY");
const now2 = ref("전체기간");
// now2가 변경되면 실행
watch([now2], (newValue, oldValue) => {
  search();
  pageChange();
});

// 날짜 리셋
const reset_date = () => {
  now2.value = "전체기간";
  const litepicker_init = document.querySelector("#litepicker") as any;
  litepicker_init.value = "전체기간";
};

// 테이블 열 크기 조정
const table_width = [
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
  "width: 50px",
];
</script>

<template>
  <div v-if="user_level >= 2">
    <!-- style="height: calc(100vh - 250px)" : 브라우저 화면 창크기에 맞게 변경됨 : 100vh - 브라우저 창 크기 -->
    <!-- BEGIN : 상단 그래프 -->
    <div class="grid grid-cols-4 gap-5 mt-5 mb-5 intro-y" style="height: 330px">
      <div class="col-span-1 p-5 bg-white rounded rounded-md">
        <div class="text-center font-bold text-xl">
          <div class="text-center">
            <div class="mt-1">
              <div class="px-3">
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
                  <div class="text-2xl">54%</div>
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
                          icon="LineChart"
                        />
                      </div>
                      <div>평균효율</div>
                    </div>
                  </div>
                </div>
                <div
                  class="mx-1 p-2 w-full h-12 text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                >
                  <div class="text-2xl">54%</div>
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
                      <div>목표대비달성률</div>
                    </div>
                  </div>
                </div>
                <div
                  class="mx-1 p-2 w-full h-12 text-2xl border-l-2 border-r-2 border-b-2 border-success rounded-b-md bg-green-200"
                >
                  <div class="text-2xl">54%</div>
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
        <div class="hidden mx-auto md:block text-slate-500"></div>
        <div class="">
          <a href="" class="flex items-center ml-auto text-primary">
            <Lucide icon="RefreshCcw" class="w-4 h-4 mr-2" /> 새로고침
          </a>
        </div>

        <div class="ml-5">
          <FormSelect
            :modelValue="now_year + '년'"
            class="w-30 mt-3 !box sm:mt-0"
          >
            <option>{{ now_year }}년</option>
            <option>{{ ago_1year }}년</option>
            <option>{{ ago_2year }}년</option>
            <option>{{ ago_3year }}년</option>
            <option>{{ ago_4year }}년</option>
            <option>{{ ago_5year }}년</option>
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
          <span class="mr-3">[ {{ dataCount }}개 데이터 조회됨 ] </span>
          <span class="mr-5"
            >[ {{ currentPage }} / {{ numberOfPages }} 페이지 ]</span
          >
          <!-- END: Pagination-->
        </div>
      </div>
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
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  :style="table_width[1]"
                >
                  순번
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  :style="table_width[2]"
                >
                  항목1
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  :style="table_width[3]"
                >
                  항목2
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  :style="table_width[4]"
                >
                  항목3
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  :style="table_width[5]"
                >
                  항목4
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  :style="table_width[6]"
                >
                  항목5
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  :style="table_width[7]"
                >
                  항목6
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  :style="table_width[8]"
                >
                  항목7
                </Table.Th>
                <Table.Th
                  class="text-center border-b-0 whitespace-nowrap"
                  :style="table_width[9]"
                >
                  항목8
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody style="position: relative; z-index: 1">
              <Table.Tr
                v-for="(todo, index) in datas"
                :key="todo.NO"
                class="intro-x"
              >
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md w-5 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_width[1]"
                >
                  <div>{{ index + 1 + (currentPage - 1) * rowsPerPage }}</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_width[2]"
                >
                  <div>예시데이터1</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_width[3]"
                >
                  <div>예시데이터2</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_width[4]"
                >
                  <div>예시데이터3</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md w-50 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_width[5]"
                >
                  <div>예시데이터4</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md w-5 bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_width[6]"
                >
                  <div>예시데이터5</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_width[7]"
                >
                  <div>예시데이터6</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_width[8]"
                >
                  <div>예시데이터7</div>
                </Table.Td>
                <Table.Td
                  class="first:rounded-l-md last:rounded-r-md w-10 text-center bg-white border-b-0 dark:bg-darkmode-600 shadow-[20px_3px_20px_#0000000b]"
                  :style="table_width[9]"
                >
                  <div>예시데이터8</div>
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
          <div class="text-center mt-20" v-if="dataCount == 0">
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
              exportFile(datas);
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
              exportFile(dataAll);
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
              printPage(datas);
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
              printPage(dataAll);
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
